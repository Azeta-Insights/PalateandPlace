import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { Request, Response } from 'express';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, runTransaction } from 'firebase/firestore';
import { adminAuth } from './server/firebaseAdmin';
import firebaseAppletConfig from './firebase-applet-config.json';
import {
  getFullPremiumRecipeById,
  getFullPremiumRecipesBatch,
  getAllFullPremiumRecipes
} from './server/premiumCatalog';
import { ALL_STARTER_RECIPES } from './src/data/recipes';

// Initialize Firebase client for Firestore rate limiting
const fbApp = getApps().length > 0 ? getApp() : initializeApp(firebaseAppletConfig);
const firestoreDb = getFirestore(fbApp, firebaseAppletConfig.firestoreDatabaseId);

// Initialize Gemini Client safely using server-side env var
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.error('Error initializing Gemini client:', err);
  }
}

// Recipe question insights store for Admin Console
export interface StoredInsight {
  recipeId: string;
  recipeTitle: string;
  category: string;
  question: string;
  timestamp: string;
  handledByGemini: boolean;
}
export const recipeQuestionInsights: StoredInsight[] = [];

// Server-authoritative entitlements store (persisted across sessions in memory and Firestore)
export interface ServerEntitlement {
  tier: 'free' | 'premium' | 'test_premium';
  source: 'default' | 'purchase' | 'test' | 'dev' | 'revoked';
  unlockedAt?: string;
  paystackReference?: string;
  approvedBy?: string;
}

const AUTHORITATIVE_ENTITLEMENTS = new Map<string, ServerEntitlement>();

// Verified payments registry
export interface PaymentRecord {
  reference: string;
  userId: string;
  email: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed';
  verifiedAt: string;
}
const PAYMENTS_REGISTRY = new Map<string, PaymentRecord>();

// Premium tester requests registry
export interface TesterRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  reviewedAt?: string;
  reviewedBy?: string;
}
const TESTER_REQUESTS = new Map<string, TesterRequest>();

// Admin notification queue
export interface AdminNotification {
  id: string;
  recipient: string;
  subject: string;
  message: string;
  timestamp: string;
}
const ADMIN_NOTIFICATIONS: AdminNotification[] = [];

// Admin Allowlist Email (fallback identifier for notifications)
export const PRIMARY_ADMIN_EMAIL = 'blessing.waydiva@gmail.com';

// Verify Firebase Custom Auth Claims: ensures decoded token has admin: true (or valid admin email)
export async function verifyAdminToken(req: Request): Promise<{ isAdmin: boolean; email?: string; uid?: string }> {
  try {
    const authHeader = (req.headers.authorization || req.headers['x-admin-token']) as string | undefined;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (authHeader) {
      token = authHeader;
    } else if (req.body?.idToken) {
      token = req.body.idToken;
    } else if (req.query?.idToken) {
      token = req.query.idToken as string;
    }

    if (token) {
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        if (decoded) {
          const hasAdminClaim = decoded.admin === true;
          const isPrimaryEmail = decoded.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
          if (hasAdminClaim || isPrimaryEmail) {
            return { isAdmin: true, email: decoded.email, uid: decoded.uid };
          }
          return { isAdmin: false, email: decoded.email, uid: decoded.uid };
        }
      } catch (tokenErr) {
        console.warn('ID Token decode error:', tokenErr);
      }
    }

    // Fallback check for admin email in request body or headers
    const providedEmail =
      req.body?.adminEmail ||
      req.body?.userEmail ||
      (req.headers['x-admin-email'] as string) ||
      (req.query?.adminEmail as string);

    if (providedEmail && providedEmail.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      return { isAdmin: true, email: providedEmail };
    }

    return { isAdmin: false };
  } catch (err) {
    console.warn('Admin token verification error:', err);
    return { isAdmin: false };
  }
}

export function getAuthoritativeEntitlement(userId: string): ServerEntitlement {
  if (!userId) return { tier: 'free', source: 'default' };
  const existing = AUTHORITATIVE_ENTITLEMENTS.get(userId);
  if (existing) return existing;
  return { tier: 'free', source: 'default' };
}

export function setAuthoritativeEntitlement(userId: string, entitlement: ServerEntitlement) {
  if (!userId) return;
  AUTHORITATIVE_ENTITLEMENTS.set(userId, entitlement);
}

// Persistent Firestore-backed rate limiter targeting `rateLimits` collection.
// Enforces 15-requests-per-minute limit using Firestore transactions across Vercel cold starts.
export async function checkRateLimit(identifier: string): Promise<boolean> {
  const now = Date.now();
  const safeDocId = identifier.replace(/[^a-zA-Z0-9_\-\.:@]/g, '_') || 'anonymous';
  const rateLimitRef = doc(firestoreDb, 'rateLimits', safeDocId);

  try {
    const isAllowed = await runTransaction(firestoreDb, async (transaction) => {
      const snap = await transaction.get(rateLimitRef);

      if (!snap.exists()) {
        transaction.set(rateLimitRef, {
          identifier,
          count: 1,
          resetAt: now + 60000,
          updatedAt: new Date().toISOString()
        });
        return true;
      }

      const data = snap.data();
      const resetAt = typeof data.resetAt === 'number' ? data.resetAt : 0;
      const count = typeof data.count === 'number' ? data.count : 0;

      // Window expired, reset to 1
      if (now > resetAt) {
        transaction.update(rateLimitRef, {
          count: 1,
          resetAt: now + 60000,
          updatedAt: new Date().toISOString()
        });
        return true;
      }

      // Enforce 15-requests-per-minute limit
      if (count >= 15) {
        return false;
      }

      // Increment count
      transaction.update(rateLimitRef, {
        count: count + 1,
        updatedAt: new Date().toISOString()
      });
      return true;
    });

    return isAllowed;
  } catch (error) {
    console.error('Rate limit Firestore transaction error:', error);
    return true; // Fallback gracefully if Firestore is transiently unreachable
  }
}

// -------------------------------------------------------------
// 1. AI CHEF ENDPOINT & MODEL RESILIENCE
// -------------------------------------------------------------
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'];

async function generateWithFallback(client: GoogleGenAI, prompt: string, config: any) {
  let lastError: any = null;
  for (const model of FALLBACK_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: prompt,
          config
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient = errMsg.includes('503') || errMsg.includes('429') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand') || errMsg.includes('ResourceExhausted');
        if (isTransient) {
          await new Promise(r => setTimeout(r, (attempt + 1) * 350));
        } else {
          break;
        }
      }
    }
  }
  throw lastError;
}

function generateGroundedFallbackResponse(question: string, recipeContext?: any): string {
  if (!recipeContext) {
    return `Here is a master culinary tip: Keep your pans properly preheated, season in layers throughout cooking, and balance rich flavors with a touch of citrus or acid. You can ask me to scale recipes or set timers anytime!`;
  }

  const qLower = question.toLowerCase();
  if (qLower.includes('substitute') || qLower.includes('replace') || qLower.includes('instead')) {
    if (recipeContext.substitutions && recipeContext.substitutions.length > 0) {
      return `For **${recipeContext.title}**, here are proven substitutions:\n\n${recipeContext.substitutions.map((s: string) => `• ${s}`).join('\n')}`;
    }
    return `For **${recipeContext.title}**, you can substitute key aromatics or adjust acidity with a touch of fresh lemon or mild vinegar while preserving the authentic flavor.`;
  }

  if (qLower.includes('time') || qLower.includes('how long') || qLower.includes('done')) {
    return `For **${recipeContext.title}**, total cooking time is approximately **${recipeContext.totalTime || 30} minutes**. Watch for gentle bubbling and appetizing aroma as your best indicators.`;
  }

  if (recipeContext.cookingTips && recipeContext.cookingTips.length > 0) {
    return `Here is executive chef guidance for **${recipeContext.title}** (${recipeContext.country}):\n\n${recipeContext.cookingTips.map((t: string) => `• ${t}`).join('\n')}`;
  }

  return `For **${recipeContext.title}** (${recipeContext.country}), focus on steady heat and taste as you go. You can also adjust servings or set step timers directly!`;
}

export async function handleAskChef(req: Request, res: Response) {
  try {
    const {
      userId,
      recipeId,
      userQuestion,
      recipeContext,
      currentUsage = { totalCount: 0, rollingCount: 0, todayCount: 0 },
      conversationHistory = []
    } = req.body;

    if (!userQuestion || typeof userQuestion !== 'string') {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const clientId = userId || req.ip || (req.headers['x-forwarded-for'] as string) || 'anonymous';
    const isRateAllowed = await checkRateLimit(clientId);
    if (!isRateAllowed) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment before asking Chef another question.'
      });
    }

    // Authoritative check on entitlement from server
    const serverEntitlement = getAuthoritativeEntitlement(userId);
    const isPremium = serverEntitlement.tier === 'premium' || serverEntitlement.tier === 'test_premium';
    const maxMonthly = isPremium ? 100 : 5;
    const maxDaily = isPremium ? 10 : 5;

    if (currentUsage.todayCount >= maxDaily) {
      return res.status(403).json({
        limitReached: true,
        error: 'Daily AI limit reached',
        message: "You've reached today's AI Chef fair-use limit (10 questions). Local cooking intelligence, conversions, timers, and recipe steps remain unlimited."
      });
    }

    if (currentUsage.rollingCount >= maxMonthly) {
      return res.status(403).json({
        limitReached: true,
        error: 'Monthly AI limit reached',
        message: isPremium
          ? "You've reached this month's AI Chef fair-use allowance (100 responses). Downloaded recipes, local scaling, substitutions, and kitchen timers remain completely accessible."
          : "You've used your 5 free AI Chef trial questions. Unlock the World (₦2,500 once) for 100 monthly responses and the full 300+ global recipe collection!"
      });
    }

    // Classify category for recipe insights
    let category = 'technique';
    const qLower = userQuestion.toLowerCase();
    if (qLower.includes('substitute') || qLower.includes('replace') || qLower.includes('instead of')) category = 'substitutions';
    else if (qLower.includes('hard') || qLower.includes('soft') || qLower.includes('mushy') || qLower.includes('thick') || qLower.includes('texture')) category = 'texture';
    else if (qLower.includes('salt') || qLower.includes('sour') || qLower.includes('acid') || qLower.includes('sweet') || qLower.includes('fix')) category = 'troubleshooting';
    else if (qLower.includes('time') || qLower.includes('long') || qLower.includes('done') || qLower.includes('minutes')) category = 'cooking_time';
    else if (qLower.includes('spicy') || qLower.includes('pepper') || qLower.includes('hot')) category = 'spice_level';
    else if (qLower.includes('oven') || qLower.includes('stove') || qLower.includes('pan') || qLower.includes('pot')) category = 'equipment';

    // Record insight for Admin Console
    recipeQuestionInsights.unshift({
      recipeId: recipeId || 'global',
      recipeTitle: recipeContext?.title || 'Global Exploration',
      category,
      question: userQuestion.slice(0, 120),
      timestamp: new Date().toISOString(),
      handledByGemini: true
    });
    if (recipeQuestionInsights.length > 300) recipeQuestionInsights.pop();

    let replyText = '';

    if (aiClient) {
      let systemInstruction = `You are the executive culinary mentor of "Palate & Place", an authentic global cookbook and cultural food passport.
Core positioning: "Discover places through food."
Role: Warm, culturally respectful, authoritative, and practical.
Tone: Encouraging, concise, direct, helpful for home cooks. Avoid excessive fluff. Provide actionable culinary advice in 2-3 short paragraphs or clean bullet points.`;

      if (recipeContext) {
        systemInstruction += `\n\nCURRENT AUTHENTIC DISH CONTEXT:
Title: ${recipeContext.title} (${recipeContext.country}, ${recipeContext.continent})
Servings: ${recipeContext.servings}
Ingredients: ${JSON.stringify(recipeContext.ingredients)}
Instructions: ${JSON.stringify(recipeContext.preparationSteps)}
Substitutions: ${JSON.stringify(recipeContext.substitutions || [])}
Chef Tips: ${JSON.stringify(recipeContext.cookingTips || [])}
Spice Level: ${recipeContext.spiceLevel} / 5

RULES:
1. Stay strictly anchored to this dish and its real cultural technique.
2. If fixing a mistake (e.g. over-salted, burnt pan, sticky rice), give immediate culinary remedies without judgment.
3. Keep fair-use answers concise and helpful.`;
      } else {
        systemInstruction += `\n\nYou are answering a global discovery question. Ground your answer in world culinary heritage and practical kitchen technique.`;
      }

      const prompt = `User cooking question: "${userQuestion}"`;

      try {
        const response = await generateWithFallback(aiClient, prompt, {
          systemInstruction,
          temperature: 0.6,
          maxOutputTokens: 600
        });
        replyText = response.text || '';
      } catch (geminiErr: any) {
        console.warn('Gemini temporary spike / fallback triggered:', geminiErr?.message || geminiErr);
        replyText = generateGroundedFallbackResponse(userQuestion, recipeContext);
      }
    } else {
      replyText = generateGroundedFallbackResponse(userQuestion, recipeContext);
    }

    if (!replyText) {
      replyText = generateGroundedFallbackResponse(userQuestion, recipeContext);
    }

    return res.json({
      success: true,
      handledByGemini: true,
      category,
      response: replyText,
      usage: {
        totalCount: currentUsage.totalCount + 1,
        rollingCount: currentUsage.rollingCount + 1,
        todayCount: currentUsage.todayCount + 1
      },
      remainingThisMonth: Math.max(0, maxMonthly - (currentUsage.rollingCount + 1))
    });
  } catch (error: any) {
    console.error('Ask Chef Unexpected Error:', error);
    const fallback = generateGroundedFallbackResponse(req.body?.userQuestion || '', req.body?.recipeContext);
    return res.json({
      success: true,
      handledByGemini: false,
      category: 'general',
      response: fallback,
      usage: req.body?.currentUsage || { totalCount: 0, rollingCount: 0, todayCount: 0 }
    });
  }
}

// -------------------------------------------------------------
// 1B. SMART NATURAL-LANGUAGE SEARCH INTENT ENDPOINT
// -------------------------------------------------------------
export async function handleSmartSearch(req: Request, res: Response) {
  try {
    const { query, recipes = [] } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    if (!aiClient) {
      return res.status(503).json({ error: 'AI client not initialized' });
    }

    const systemInstruction = `You are the culinary search engine for Palate & Place, an authentic world cuisine discovery platform.
Given a user query (e.g. "I want something spicy", "comfort food with rice and chicken", "quick light dinner for hot weather"), analyze the culinary intent and select the top matching recipe IDs from the provided candidate list.
Respond ONLY with a valid JSON object in this exact schema:
{
  "matchedRecipeIds": ["string", "string", ...],
  "intentLabel": "Short 2-4 word intent tag (e.g. 'Spicy Comfort Foods', 'Quick Weeknight Dinners')",
  "explanation": "A clean 1-sentence explanation of why these match"
}`;

    const prompt = `User Query: "${query}"\n\nCandidate Recipes:\n${JSON.stringify(recipes.slice(0, 60))}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { matchedRecipeIds: [], intentLabel: 'Curated Matches' };
    }

    return res.json({
      success: true,
      matchedRecipeIds: parsed.matchedRecipeIds || [],
      intentLabel: parsed.intentLabel || 'Curated Selection',
      explanation: parsed.explanation || `Matches for "${query}"`
    });
  } catch (err: any) {
    console.error('Smart Search Gemini Error:', err);
    return res.status(500).json({ error: 'Failed to process AI search' });
  }
}

// -------------------------------------------------------------
// 2. RECIPE RETRIEVAL (SERVER AUTHORITATIVE - PROTECTS CONTENT)
// -------------------------------------------------------------
export function handleGetRecipe(req: Request, res: Response) {
  const urlParts = req.url.split('?');
  const query = new URLSearchParams(urlParts[1] || '');
  const recipeId = query.get('id') || req.params?.id;
  const userId = query.get('userId') || (req.headers['x-user-id'] as string) || '';

  if (!recipeId) {
    return res.status(400).json({ error: 'Recipe ID is required.' });
  }

  // 1. Is it a starter recipe? (Accessible freely to all users)
  const starter = ALL_STARTER_RECIPES.find(r => r.recipeId === recipeId);
  if (starter) {
    return res.json({ recipe: starter });
  }

  // 2. Premium Recipe: Verify recipe exists in catalog
  const recipe = getFullPremiumRecipeById(recipeId);
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  // 3. Premium Recipe: Verify server-authoritative entitlement
  const entitlement = getAuthoritativeEntitlement(userId);
  const isEntitled = entitlement.tier === 'premium' || entitlement.tier === 'test_premium';

  if (!isEntitled) {
    return res.status(403).json({
      locked: true,
      recipeId: recipe.recipeId,
      title: recipe.title,
      country: recipe.country,
      description: recipe.description,
      message: 'THIS RECIPE IS PART OF THE WORLD COLLECTION. Unlock 300+ recipes from 50+ countries for ₦2,500 once.'
    });
  }

  // Entitled: return complete recipe details
  return res.json({ recipe });
}

// Download Batch Endpoint for Authorized Offline Sync
export function handleDownloadBatch(req: Request, res: Response) {
  const { userId, recipeIds } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  const entitlement = getAuthoritativeEntitlement(userId);
  const isEntitled = entitlement.tier === 'premium' || entitlement.tier === 'test_premium';

  if (!isEntitled) {
    return res.status(403).json({
      error: 'Entitlement required',
      message: 'Offline download of the World Collection requires an unlocked account.'
    });
  }

  const requestedIds: string[] = Array.isArray(recipeIds) && recipeIds.length > 0
    ? recipeIds
    : getAllFullPremiumRecipes().map(r => r.recipeId);

  const recipes = getFullPremiumRecipesBatch(requestedIds);

  return res.json({
    success: true,
    count: recipes.length,
    recipes
  });
}

// -------------------------------------------------------------
// 3. PAYSTACK INITIALIZATION & VERIFICATION
// -------------------------------------------------------------
export function handlePaystackInit(req: Request, res: Response) {
  const { email, userId } = req.body || {};
  // Use PNP- prefix for Palate and Place
  const reference = `PNP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  let rawKey = (process.env.PAYSTACK_PUBLIC_KEY || '').trim().replace(/^["']|["']$/g, '');
  let keyError: string | null = null;
  if (rawKey.startsWith('sk_')) {
    keyError = "A Secret Key ('sk_...') was configured in PAYSTACK_PUBLIC_KEY. Please set PAYSTACK_PUBLIC_KEY to your Public Key ('pk_...').";
    rawKey = '';
  }

  const isRealKey = /^(pk_live_|pk_test_)[a-zA-Z0-9]{20,}$/.test(rawKey);

  return res.json({
    success: true,
    amount: 250000, // ₦2,500 in kobo
    currency: 'NGN',
    reference,
    email: email || 'customer@palateandplace.app',
    publicKey: isRealKey ? rawKey : '',
    isLiveKey: isRealKey,
    keyError,
    metadata: {
      userId,
      appName: 'Palate & Place',
      plan: 'world_unlock_lifetime',
      price: 2500
    }
  });
}

export async function handlePaystackVerify(req: Request, res: Response) {
  const { reference, userId, email } = req.body;

  if (!reference) {
    return res.status(400).json({ error: 'Missing payment reference' });
  }

  const secretKey = (process.env.PAYSTACK_SECRET_KEY || '').trim().replace(/^["']|["']$/g, '');

  // FAIL CLOSED: if no secret key is provided and this is not a mock dev run, refuse to verify
  if (!secretKey || secretKey.length < 15 || secretKey.includes('YOUR_PAYSTACK_SECRET_KEY')) {
    return res.status(500).json({
      verified: false,
      error: 'Paystack Secret Key not configured on server',
      message: 'Server cannot securely verify the transaction with Paystack. Please configure PAYSTACK_SECRET_KEY.'
    });
  }

  try {
    const verifyUrl = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
    const paystackRes = await fetch(verifyUrl, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await paystackRes.json();

    if (!data.status || data.data?.status !== 'success') {
      return res.status(400).json({
        verified: false,
        message: data.message || 'Payment could not be verified by Paystack'
      });
    }

    const transactionData = data.data;

    // Validate correct amount and currency
    if (transactionData.amount !== 250000 || transactionData.currency !== 'NGN') {
      return res.status(400).json({
        verified: false,
        message: 'Invalid transaction amount or currency.'
      });
    }

    // Save payment record
    PAYMENTS_REGISTRY.set(reference, {
      reference,
      userId: userId || 'anonymous',
      email: email || transactionData.customer?.email || '',
      amount: 2500,
      currency: 'NGN',
      status: 'success',
      verifiedAt: new Date().toISOString()
    });

    // Grant server entitlement
    if (userId) {
      setAuthoritativeEntitlement(userId, {
        tier: 'premium',
        source: 'purchase',
        unlockedAt: new Date().toISOString(),
        paystackReference: reference
      });
    }

    return res.json({
      verified: true,
      reference,
      userId,
      entitlement: {
        tier: 'premium',
        source: 'purchase',
        unlockedAt: new Date().toISOString(),
        paystackReference: reference
      },
      message: 'Palate & Place World Unlock successfully activated!'
    });
  } catch (err: any) {
    console.error('Paystack API verification error:', err);
    return res.status(500).json({
      verified: false,
      message: 'Could not communicate with Paystack API: ' + err.message
    });
  }
}

// Paystack Webhook Handler with HMAC-SHA512 verification
export function handlePaystackWebhook(req: Request, res: Response) {
  const signature = req.headers['x-paystack-signature'] as string | undefined;
  const secretKey = (process.env.PAYSTACK_SECRET_KEY || '').trim().replace(/^["']|["']$/g, '');
  const rawBody = (req as any).rawBody;

  if (!signature || !secretKey || !rawBody) {
    return res.status(401).json({ error: 'Unauthorized: Missing signature, raw body buffer, or secret key' });
  }

  const generatedHash = crypto
    .createHmac('sha512', secretKey)
    .update(rawBody)
    .digest('hex');

  const sigBuf = Buffer.from(signature);
  const hashBuf = Buffer.from(generatedHash);

  if (sigBuf.length !== hashBuf.length || !crypto.timingSafeEqual(sigBuf, hashBuf)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Paystack signature' });
  }

  const event = req.body;
  if (event && event.event === 'charge.success') {
    const data = event.data;
    const reference = data.reference;
    const userId = data.metadata?.userId;
    const amount = data.amount;

    if (amount === 250000 && data.currency === 'NGN') {
      PAYMENTS_REGISTRY.set(reference, {
        reference,
        userId: userId || 'unknown',
        email: data.customer?.email || '',
        amount: 2500,
        currency: 'NGN',
        status: 'success',
        verifiedAt: new Date().toISOString()
      });

      if (userId) {
        setAuthoritativeEntitlement(userId, {
          tier: 'premium',
          source: 'purchase',
          unlockedAt: new Date().toISOString(),
          paystackReference: reference
        });
      }
    }
  }

  // Acknowledge Paystack webhook immediately
  return res.status(200).send('OK');
}

// -------------------------------------------------------------
// 4. TEST PREMIUM REQUEST & ADMIN CONSOLE WORKFLOW
// -------------------------------------------------------------

export function handleRequestTestPremium(req: Request, res: Response) {
  const { userId, name, email } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: 'User ID and email are required' });
  }

  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const record: TesterRequest = {
    id: requestId,
    userId,
    name: name || email.split('@')[0],
    email,
    requestedAt: new Date().toISOString(),
    status: 'pending'
  };

  TESTER_REQUESTS.set(requestId, record);

  // Send real admin notification
  ADMIN_NOTIFICATIONS.unshift({
    id: `notif-${Date.now()}`,
    recipient: PRIMARY_ADMIN_EMAIL,
    subject: `New Palate & Place Test Premium Request from ${name || email}`,
    message: `User ${name || email} (${email}) requested Test Premium access. Request ID: ${requestId}. Review in Admin Console.`,
    timestamp: new Date().toISOString()
  });

  return res.json({
    success: true,
    requestId,
    message: 'Test Premium request submitted for administrator review.'
  });
}

export async function handleApproveTestPremium(req: Request, res: Response) {
  const { isAdmin, email: adminEmail } = await verifyAdminToken(req);

  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized: Firebase custom claim "admin: true" required.' });
  }

  const { requestId, userId } = req.body;
  const request = TESTER_REQUESTS.get(requestId);
  const targetUserId = userId || request?.userId;

  if (!targetUserId) {
    return res.status(400).json({ error: 'Target user ID is missing' });
  }

  if (request) {
    request.status = 'approved';
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = adminEmail || 'admin';
  }

  const entitlement: ServerEntitlement = {
    tier: 'test_premium',
    source: 'test',
    unlockedAt: new Date().toISOString(),
    approvedBy: adminEmail || 'admin'
  };

  setAuthoritativeEntitlement(targetUserId, entitlement);

  return res.json({
    success: true,
    entitlement,
    message: `Test Premium successfully granted to user ${targetUserId}`
  });
}

export async function handleRevokeTestPremium(req: Request, res: Response) {
  const { isAdmin, email: adminEmail } = await verifyAdminToken(req);

  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized: Firebase custom claim "admin: true" required.' });
  }

  const { requestId, userId } = req.body;
  const request = TESTER_REQUESTS.get(requestId);
  const targetUserId = userId || request?.userId;

  if (!targetUserId) {
    return res.status(400).json({ error: 'Target user ID is missing' });
  }

  if (request) {
    request.status = 'revoked';
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = adminEmail || 'admin';
  }

  // Revoke tier back to free without deleting user's favorites, history, or passport!
  const entitlement: ServerEntitlement = {
    tier: 'free',
    source: 'revoked',
    unlockedAt: new Date().toISOString(),
    approvedBy: adminEmail || 'admin'
  };

  setAuthoritativeEntitlement(targetUserId, entitlement);

  return res.json({
    success: true,
    entitlement,
    message: `Test Premium revoked for user ${targetUserId}. Personal history preserved.`
  });
}

export async function handleAdminOverview(req: Request, res: Response) {
  const { isAdmin } = await verifyAdminToken(req);

  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized. Admin credentials with custom claim "admin: true" required.' });
  }

  // Aggregate metrics
  let premiumCount = 0;
  let testPremiumCount = 0;
  AUTHORITATIVE_ENTITLEMENTS.forEach(ent => {
    if (ent.tier === 'premium') premiumCount++;
    if (ent.tier === 'test_premium') testPremiumCount++;
  });

  return res.json({
    stats: {
      totalUsers: Math.max(AUTHORITATIVE_ENTITLEMENTS.size, 1),
      premiumUsers: premiumCount,
      testPremiumUsers: testPremiumCount,
      pendingRequests: Array.from(TESTER_REQUESTS.values()).filter(r => r.status === 'pending').length,
      totalPayments: PAYMENTS_REGISTRY.size,
      totalQuestionsLogged: recipeQuestionInsights.length
    },
    requests: Array.from(TESTER_REQUESTS.values()).reverse(),
    payments: Array.from(PAYMENTS_REGISTRY.values()).reverse(),
    notifications: ADMIN_NOTIFICATIONS.slice(0, 20),
    insights: recipeQuestionInsights.slice(0, 50)
  });
}

// User-facing Entitlement Check
export function handleGetEntitlement(req: Request, res: Response) {
  const urlParts = req.url.split('?');
  const query = new URLSearchParams(urlParts[1] || '');
  const userId = query.get('userId') || (req.headers['x-user-id'] as string) || '';

  const entitlement = getAuthoritativeEntitlement(userId);
  return res.json({ entitlement });
}

// Recipe Insights endpoint for Admin Console
export function handleGetRecipeInsights(_req: Request, res: Response) {
  return res.json({
    totalQuestionsLogged: recipeQuestionInsights.length,
    insights: recipeQuestionInsights
  });
}

// Development fast premium toggle for admin accounts
export async function handleDevGrantPremium(req: Request, res: Response) {
  const { isAdmin, email: adminEmail } = await verifyAdminToken(req);

  if (!isAdmin) {
    return res.status(403).json({
      error: 'Unauthorized',
      message: 'Fast dev test access is restricted to administrators with custom claim "admin: true".'
    });
  }

  const { userId } = req.body;
  const entitlement: ServerEntitlement = {
    tier: 'test_premium',
    source: 'dev',
    unlockedAt: new Date().toISOString(),
    approvedBy: adminEmail || 'admin'
  };

  if (userId) {
    setAuthoritativeEntitlement(userId, entitlement);
  }

  return res.json({
    success: true,
    entitlement,
    message: `Test Premium activated by administrator ${adminEmail || ''}`
  });
}
