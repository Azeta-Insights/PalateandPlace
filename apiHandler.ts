import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { Request, Response } from 'express';
import { adminAuth, adminDb } from './server/firebaseAdmin';
import {
  getFullPremiumRecipeById,
  getFullPremiumRecipesBatch,
  getAllFullPremiumRecipes
} from './server/premiumCatalog';
import { ALL_STARTER_RECIPES } from './src/data/recipes';

// Primary Curator / Administrator identifier
export const PRIMARY_ADMIN_EMAIL = 'blessing.waydiva@gmail.com';

// Initialize Gemini Client safely using server-side environment variable
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.error('Error initializing Gemini client:', err);
  }
}

// -------------------------------------------------------------
// SERVER-AUTHORITATIVE TYPES & INTERFACES
// -------------------------------------------------------------

export interface ServerEntitlement {
  tier: 'FREE' | 'PREMIUM' | 'TEST_PREMIUM';
  source: 'default' | 'purchase' | 'test' | 'dev' | 'revoked';
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  paymentReference?: string;
}

export interface StoredPaymentRecord {
  userId: string;
  paystackReference: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed';
  createdAt: string;
  verifiedAt: string;
  email?: string;
}

export interface StoredTesterRequest {
  requestId: string;
  userId: string;
  name: string;
  email: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
  reviewedAt?: string;
  reviewedBy?: string;
}

// -------------------------------------------------------------
// 1. AUTHENTICATION & IDENTITY VERIFICATION
// -------------------------------------------------------------

/**
 * Extracts and verifies the Firebase Authentication ID token from Authorization header or body/query.
 * Derives uid, email, and provider strictly from the cryptographically verified token.
 */
export async function verifyUserToken(
  req: Request
): Promise<{ uid: string; email?: string; provider?: string } | null> {
  try {
    const authHeader = (req.headers.authorization || req.headers['x-auth-token']) as string | undefined;
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

    if (!token) return null;

    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded || !decoded.uid) return null;

    return {
      uid: decoded.uid,
      email: decoded.email,
      provider: decoded.firebase?.sign_in_provider
    };
  } catch (err) {
    return null;
  }
}

/**
 * Verifies administrator authority server-side.
 * Never trusts client headers or request body flags.
 */
export async function verifyAdminToken(
  req: Request
): Promise<{ isAdmin: boolean; email?: string; uid?: string }> {
  try {
    const verifiedUser = await verifyUserToken(req);
    if (!verifiedUser) {
      return { isAdmin: false };
    }

    const email = verifiedUser.email?.toLowerCase() || '';
    const isPrimaryAdmin = email === PRIMARY_ADMIN_EMAIL.toLowerCase();

    // Check custom claim admin === true if available
    let hasAdminClaim = false;
    try {
      const userRecord = await adminAuth.getUser(verifiedUser.uid);
      hasAdminClaim = userRecord.customClaims?.admin === true;
    } catch {
      // Ignore lookup error
    }

    if (isPrimaryAdmin || hasAdminClaim) {
      return { isAdmin: true, email: verifiedUser.email, uid: verifiedUser.uid };
    }

    return { isAdmin: false, email: verifiedUser.email, uid: verifiedUser.uid };
  } catch (err) {
    console.warn('Admin token verification error:', err);
    return { isAdmin: false };
  }
}

// -------------------------------------------------------------
// 2. SERVER-AUTHORITATIVE ENTITLEMENTS (PERSISTED IN FIRESTORE)
// -------------------------------------------------------------

export async function getAuthoritativeEntitlement(userId: string): Promise<ServerEntitlement> {
  if (!userId) {
    return { tier: 'FREE', source: 'default' };
  }

  try {
    const docRef = adminDb.collection('entitlements').doc(userId);
    const snap = await docRef.get();

    if (snap.exists) {
      const data = snap.data() as ServerEntitlement;
      return {
        tier: (data.tier?.toUpperCase() as any) || 'FREE',
        source: data.source || 'default',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        approvedAt: data.approvedAt,
        approvedBy: data.approvedBy,
        paymentReference: data.paymentReference
      };
    }
  } catch (err) {
    console.warn('Firestore entitlement lookup error:', err);
  }

  return { tier: 'FREE', source: 'default' };
}

export async function setAuthoritativeEntitlement(
  userId: string,
  entitlement: Partial<ServerEntitlement>
): Promise<void> {
  if (!userId) return;

  const now = new Date().toISOString();
  const normalizedTier = entitlement.tier?.toUpperCase() || 'FREE';

  try {
    const docRef = adminDb.collection('entitlements').doc(userId);
    await docRef.set(
      {
        ...entitlement,
        tier: normalizedTier,
        updatedAt: now,
        createdAt: entitlement.createdAt || now
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Firestore entitlement persist error:', err);
    throw err;
  }
}

// -------------------------------------------------------------
// 3. PERSISTENT ATOMIC AI QUOTA MANAGEMENT
// -------------------------------------------------------------

export async function checkAndIncrementAiUsage(
  userId: string,
  isPremium: boolean
): Promise<{
  allowed: boolean;
  reason?: string;
  message?: string;
  usage?: { todayCount: number; monthCount: number; remainingMonth: number };
}> {
  const maxMonthly = isPremium ? 100 : 5;
  const maxDaily = isPremium ? 10 : 5;

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // e.g. "2026-09"
  const currentDay = now.toISOString().slice(0, 10);   // e.g. "2026-09-24"
  const safeId = userId || 'anonymous_user';

  const docId = `${safeId}_${currentMonth}`;
  const usageRef = adminDb.collection('aiUsage').doc(docId);

  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(usageRef);
      let todayCount = 0;
      let monthCount = 0;
      let lastDay = currentDay;

      if (snap.exists) {
        const data = snap.data() || {};
        lastDay = data.lastDay || currentDay;
        monthCount = typeof data.monthCount === 'number' ? data.monthCount : 0;
        todayCount = (lastDay === currentDay && typeof data.todayCount === 'number') ? data.todayCount : 0;
      }

      // Check limits
      if (todayCount >= maxDaily) {
        return {
          allowed: false,
          reason: 'daily_limit',
          message: `You've reached today's fair-use limit (${maxDaily} questions). Local cooking intelligence, conversions, timers, and recipe steps remain unlimited.`
        };
      }

      if (monthCount >= maxMonthly) {
        return {
          allowed: false,
          reason: 'monthly_limit',
          message: isPremium
            ? "You've reached this month's AI Chef fair-use allowance (100 responses). Downloaded recipes, local scaling, and kitchen timers remain unlimited."
            : "You've used your 5 free AI Chef trial questions. Unlock the World (₦2,500 once) for 100 monthly responses and the full global recipe collection!"
        };
      }

      const nextToday = todayCount + 1;
      const nextMonth = monthCount + 1;

      tx.set(
        usageRef,
        {
          userId: safeId,
          calendarMonth: currentMonth,
          lastDay: currentDay,
          todayCount: nextToday,
          monthCount: nextMonth,
          lastRequestAt: now.toISOString(),
          updatedAt: now.toISOString()
        },
        { merge: true }
      );

      return {
        allowed: true,
        usage: {
          todayCount: nextToday,
          monthCount: nextMonth,
          remainingMonth: Math.max(0, maxMonthly - nextMonth)
        }
      };
    });

    return result;
  } catch (err) {
    console.error('AI usage transaction error:', err);
    // Allow through if Firestore transaction fails
    return {
      allowed: true,
      usage: { todayCount: 1, monthCount: 1, remainingMonth: maxMonthly - 1 }
    };
  }
}

// -------------------------------------------------------------
// 4. PERSISTENT RECIPE QUESTION INTELLIGENCE
// -------------------------------------------------------------

export async function recordRecipeQuestionInsight(
  recipeId: string,
  recipeTitle: string,
  category: string,
  question: string
) {
  const safeRecipeId = recipeId || 'global';
  const docRef = adminDb.collection('recipeInsights').doc(safeRecipeId);

  try {
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      let totalQuestions = 0;
      let questionCategories: Record<string, number> = {};
      let topQuestions: Array<{ question: string; category: string; timestamp: string }> = [];

      if (snap.exists) {
        const data = snap.data() || {};
        totalQuestions = data.totalQuestions || 0;
        questionCategories = data.questionCategories || {};
        topQuestions = data.topQuestions || [];
      }

      totalQuestions++;
      questionCategories[category] = (questionCategories[category] || 0) + 1;

      // Keep latest 15 distinct questions
      topQuestions.unshift({
        question: question.slice(0, 140),
        category,
        timestamp: new Date().toISOString()
      });
      if (topQuestions.length > 15) {
        topQuestions = topQuestions.slice(0, 15);
      }

      tx.set(
        docRef,
        {
          recipeId: safeRecipeId,
          recipeTitle: recipeTitle || 'Global Dish',
          totalQuestions,
          questionCategories,
          topQuestions,
          lastUpdated: new Date().toISOString()
        },
        { merge: true }
      );
    });
  } catch (err) {
    console.warn('Error recording recipe question insight to Firestore:', err);
  }
}

// -------------------------------------------------------------
// 5. AI CHEF FALLBACKS & MODEL RESILIENCE
// -------------------------------------------------------------

const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];

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
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('429') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('ResourceExhausted');
        if (isTransient) {
          await new Promise((r) => setTimeout(r, (attempt + 1) * 350));
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
    return `Here is master culinary guidance: Preheat cookware properly, season in gradual layers, and balance rich notes with fresh acid or citrus. You can ask me to scale ingredients or start step timers anytime!`;
  }

  const qLower = question.toLowerCase();
  if (qLower.includes('substitute') || qLower.includes('replace') || qLower.includes('instead')) {
    if (recipeContext.substitutions && recipeContext.substitutions.length > 0) {
      return `For **${recipeContext.title}**, here are proven culinary substitutions:\n\n${recipeContext.substitutions.map((s: any) => typeof s === 'string' ? `• ${s}` : `• **${s.ingredient}**: Use ${s.substitute} (${s.ratio || '1:1 ratio'})`).join('\n')}`;
    }
    return `For **${recipeContext.title}**, adjust aromatics or finish with lemon juice or mild vinegar to preserve authenticity.`;
  }

  if (qLower.includes('time') || qLower.includes('how long') || qLower.includes('done')) {
    return `For **${recipeContext.title}**, total cooking time is approximately **${recipeContext.totalTime || 30} minutes**. Watch for fragrant aromas and steady bubbling as your primary indicators.`;
  }

  if (recipeContext.cookingTips && recipeContext.cookingTips.length > 0) {
    return `Chef guidance for **${recipeContext.title}** (${recipeContext.country}):\n\n${recipeContext.cookingTips.map((t: string) => `• ${t}`).join('\n')}`;
  }

  return `For **${recipeContext.title}** (${recipeContext.country}), maintain steady heat and taste as you season. You can scale servings or start step timers directly in the recipe!`;
}

// -------------------------------------------------------------
// 6. ROUTE HANDLERS
// -------------------------------------------------------------

export async function handleAskChef(req: Request, res: Response) {
  try {
    const { userQuestion, recipeId, recipeContext, conversationHistory = [] } = req.body;

    if (!userQuestion || typeof userQuestion !== 'string') {
      return res.status(400).json({ error: 'Question is required.' });
    }

    // Authenticate user identity from token if provided
    const verifiedUser = await verifyUserToken(req);
    const userId = verifiedUser?.uid || req.body.userId || '';

    // Check server-authoritative entitlement
    const entitlement = await getAuthoritativeEntitlement(userId);
    const isPremium = entitlement.tier === 'PREMIUM' || entitlement.tier === 'TEST_PREMIUM';

    // Atomic quota enforcement in Firestore
    const quotaCheck = await checkAndIncrementAiUsage(userId, isPremium);
    if (!quotaCheck.allowed) {
      return res.status(403).json({
        limitReached: true,
        error: quotaCheck.reason,
        message: quotaCheck.message
      });
    }

    // Categorize culinary question for analytics
    let category = 'technique';
    const qLower = userQuestion.toLowerCase();
    if (qLower.includes('substitute') || qLower.includes('replace') || qLower.includes('instead of')) category = 'substitutions';
    else if (qLower.includes('hard') || qLower.includes('soft') || qLower.includes('mushy') || qLower.includes('texture')) category = 'texture';
    else if (qLower.includes('salt') || qLower.includes('sour') || qLower.includes('acid') || qLower.includes('sweet') || qLower.includes('fix')) category = 'troubleshooting';
    else if (qLower.includes('time') || qLower.includes('long') || qLower.includes('done') || qLower.includes('minutes')) category = 'cooking_time';
    else if (qLower.includes('spicy') || qLower.includes('pepper') || qLower.includes('hot')) category = 'spice_level';
    else if (qLower.includes('oven') || qLower.includes('stove') || qLower.includes('pan') || qLower.includes('pot')) category = 'equipment';

    // Record question intelligence asynchronously
    recordRecipeQuestionInsight(
      recipeId || 'global',
      recipeContext?.title || 'Global Dish',
      category,
      userQuestion
    );

    let replyText = '';

    if (aiClient) {
      let systemInstruction = `You are the executive culinary mentor of "Palate & Place", an authentic global cookbook and food journal.
Core positioning: "Discover places through food."
Role: Warm, culturally respectful, authoritative, and practical.
Tone: Encouraging, direct, and clear. Avoid fluff. Provide complete culinary advice with clean formatting. Ensure all sentences and thoughts are fully completed.`;

      if (recipeContext) {
        systemInstruction += `\n\nAUTHENTIC DISH CONTEXT:
Title: ${recipeContext.title} (${recipeContext.country}, ${recipeContext.continent})
Servings: ${recipeContext.servings}
Ingredients: ${JSON.stringify(recipeContext.ingredients)}
Instructions: ${JSON.stringify(recipeContext.preparationSteps)}
Substitutions: ${JSON.stringify(recipeContext.substitutions || [])}
Chef Tips: ${JSON.stringify(recipeContext.cookingTips || [])}
Spice Level: ${recipeContext.spiceLevel} / 5

RULES:
1. Stay strictly anchored to this dish and authentic culinary technique.
2. If troubleshooting an issue, offer practical home kitchen fixes.
3. Finish your response completely.`;
      }

      const prompt = `Cook's question: "${userQuestion}"`;

      try {
        const response = await generateWithFallback(aiClient, prompt, {
          systemInstruction,
          temperature: 0.6,
          maxOutputTokens: 2500
        });
        replyText = response.text || '';
      } catch (geminiErr: any) {
        console.warn('Gemini fallback triggered:', geminiErr?.message || geminiErr);
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
      usage: quotaCheck.usage
    });
  } catch (error: any) {
    console.error('Ask Chef Unexpected Error:', error);
    const fallback = generateGroundedFallbackResponse(req.body?.userQuestion || '', req.body?.recipeContext);
    return res.json({
      success: true,
      handledByGemini: false,
      category: 'general',
      response: fallback
    });
  }
}

export async function handleSmartSearch(req: Request, res: Response) {
  try {
    const { query, recipes = [] } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    if (!aiClient) {
      return res.status(503).json({ error: 'AI client not initialized' });
    }

    const systemInstruction = `You are the culinary search analyzer for Palate & Place.
Analyze the user's culinary query and match the top recipe IDs from the candidate list.
Respond ONLY with JSON:
{
  "matchedRecipeIds": ["string"],
  "intentLabel": "Short tag (e.g. 'Spicy Comfort Foods')",
  "explanation": "1-sentence summary"
}`;

    const prompt = `Query: "${query}"\nCandidates: ${JSON.stringify(recipes.slice(0, 60))}`;

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
    return res.status(500).json({ error: 'Failed to process search' });
  }
}

export async function handleGetRecipe(req: Request, res: Response) {
  const urlParts = req.url.split('?');
  const query = new URLSearchParams(urlParts[1] || '');
  const recipeId = query.get('id') || req.params?.id;

  if (!recipeId) {
    return res.status(400).json({ error: 'Recipe ID is required.' });
  }

  // 1. Check starter recipes (freely accessible)
  const starter = ALL_STARTER_RECIPES.find((r) => r.recipeId === recipeId);
  if (starter) {
    return res.json({ recipe: starter });
  }

  // 2. Check full premium recipe catalog
  const recipe = getFullPremiumRecipeById(recipeId);
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  // 3. Authenticate and check server-authoritative entitlement
  const verifiedUser = await verifyUserToken(req);
  const userId = verifiedUser?.uid || query.get('userId') || (req.headers['x-user-id'] as string) || '';

  const entitlement = await getAuthoritativeEntitlement(userId);
  const isEntitled = entitlement.tier === 'PREMIUM' || entitlement.tier === 'TEST_PREMIUM';

  if (!isEntitled) {
    return res.status(403).json({
      locked: true,
      recipeId: recipe.recipeId,
      title: recipe.title,
      country: recipe.country,
      description: recipe.description,
      message: 'Unlock the World (₦2,500 once) for full access to this authentic dish.'
    });
  }

  return res.json({ recipe });
}

export async function handleDownloadBatch(req: Request, res: Response) {
  const verifiedUser = await verifyUserToken(req);
  const userId = verifiedUser?.uid || req.body?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const entitlement = await getAuthoritativeEntitlement(userId);
  const isEntitled = entitlement.tier === 'PREMIUM' || entitlement.tier === 'TEST_PREMIUM';

  if (!isEntitled) {
    return res.status(403).json({
      error: 'Entitlement required',
      message: 'Offline download of the World Collection requires an unlocked account.'
    });
  }

  const requestedIds: string[] =
    Array.isArray(req.body?.recipeIds) && req.body.recipeIds.length > 0
      ? req.body.recipeIds
      : getAllFullPremiumRecipes().map((r) => r.recipeId);

  const recipes = getFullPremiumRecipesBatch(requestedIds);

  return res.json({
    success: true,
    count: recipes.length,
    recipes
  });
}

// -------------------------------------------------------------
// 7. PAYSTACK SECURE PAYMENT FLOW (FAIL CLOSED)
// -------------------------------------------------------------

export function handlePaystackInit(req: Request, res: Response) {
  const { email, userId } = req.body || {};
  const reference = `PNP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  let rawKey = (process.env.PAYSTACK_PUBLIC_KEY || '').trim().replace(/^["']|["']$/g, '');
  let keyError: string | null = null;
  if (rawKey.startsWith('sk_')) {
    keyError = "Secret Key configured in PAYSTACK_PUBLIC_KEY. Please provide Public Key ('pk_...').";
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

  // FAIL CLOSED: if no secret key configured, fail securely
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

    // Validate correct amount (₦2,500 = 250,000 kobo) and currency
    if (transactionData.amount !== 250000 || transactionData.currency !== 'NGN') {
      return res.status(400).json({
        verified: false,
        message: 'Invalid transaction amount or currency.'
      });
    }

    const targetUserId = userId || transactionData.metadata?.userId;
    const now = new Date().toISOString();

    // Idempotent payment persistence in Firestore
    const paymentDocRef = adminDb.collection('payments').doc(reference);
    await paymentDocRef.set(
      {
        userId: targetUserId || 'anonymous',
        paystackReference: reference,
        amount: 2500,
        currency: 'NGN',
        status: 'success',
        createdAt: now,
        verifiedAt: now,
        email: email || transactionData.customer?.email || ''
      },
      { merge: true }
    );

    // Grant server entitlement permanently in Firestore
    if (targetUserId) {
      await setAuthoritativeEntitlement(targetUserId, {
        tier: 'PREMIUM',
        source: 'purchase',
        createdAt: now,
        updatedAt: now,
        paymentReference: reference
      });
    }

    return res.json({
      verified: true,
      reference,
      userId: targetUserId,
      entitlement: {
        tier: 'premium',
        source: 'purchase',
        unlockedAt: now,
        paystackReference: reference
      },
      message: 'Palate & Place World Unlock activated!'
    });
  } catch (err: any) {
    console.error('Paystack verification error:', err);
    return res.status(500).json({
      verified: false,
      message: 'Could not communicate with Paystack API: ' + err.message
    });
  }
}

export async function handlePaystackWebhook(req: Request, res: Response) {
  const signature = req.headers['x-paystack-signature'] as string | undefined;
  const secretKey = (process.env.PAYSTACK_SECRET_KEY || '').trim().replace(/^["']|["']$/g, '');
  const rawBody = (req as any).rawBody;

  if (!signature || !secretKey || !rawBody) {
    return res.status(401).json({ error: 'Unauthorized: Missing signature or payload' });
  }

  const generatedHash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
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
      const now = new Date().toISOString();
      const paymentRef = adminDb.collection('payments').doc(reference);
      await paymentRef.set(
        {
          userId: userId || 'unknown',
          paystackReference: reference,
          amount: 2500,
          currency: 'NGN',
          status: 'success',
          createdAt: now,
          verifiedAt: now,
          email: data.customer?.email || ''
        },
        { merge: true }
      );

      if (userId) {
        await setAuthoritativeEntitlement(userId, {
          tier: 'PREMIUM',
          source: 'purchase',
          createdAt: now,
          updatedAt: now,
          paymentReference: reference
        });
      }
    }
  }

  return res.status(200).send('OK');
}

// -------------------------------------------------------------
// 8. TEST PREMIUM REQUESTS & CURATOR CONSOLE (FIRESTORE PERSISTENT)
// -------------------------------------------------------------

export async function handleRequestTestPremium(req: Request, res: Response) {
  const verifiedUser = await verifyUserToken(req);
  const userId = verifiedUser?.uid || req.body.userId;
  const email = verifiedUser?.email || req.body.email;
  const name = req.body.name || email?.split('@')[0] || 'Reviewer';

  if (!userId || !email) {
    return res.status(400).json({ error: 'Authentication required to submit reviewer request' });
  }

  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const record: StoredTesterRequest = {
    requestId,
    userId,
    name,
    email,
    requestedAt: new Date().toISOString(),
    status: 'PENDING'
  };

  try {
    await adminDb.collection('premiumRequests').doc(requestId).set(record);
    return res.json({
      success: true,
      requestId,
      message: 'Reviewer request logged for curator review.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to record request: ' + err.message });
  }
}

export async function handleApproveTestPremium(req: Request, res: Response) {
  const { isAdmin, email: adminEmail } = await verifyAdminToken(req);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized: Curator credentials required.' });
  }

  const { requestId, userId } = req.body;
  const targetUserId = userId;

  if (!targetUserId) {
    return res.status(400).json({ error: 'Target user ID is missing' });
  }

  const now = new Date().toISOString();

  if (requestId) {
    try {
      await adminDb.collection('premiumRequests').doc(requestId).set(
        {
          status: 'APPROVED',
          reviewedAt: now,
          reviewedBy: adminEmail || 'curator'
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Error updating request status:', err);
    }
  }

  await setAuthoritativeEntitlement(targetUserId, {
    tier: 'TEST_PREMIUM',
    source: 'test',
    updatedAt: now,
    approvedAt: now,
    approvedBy: adminEmail || 'curator'
  });

  return res.json({
    success: true,
    message: `Test Premium granted to user ${targetUserId}`
  });
}

export async function handleRevokeTestPremium(req: Request, res: Response) {
  const { isAdmin, email: adminEmail } = await verifyAdminToken(req);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized: Curator credentials required.' });
  }

  const { requestId, userId } = req.body;
  const targetUserId = userId;

  if (!targetUserId) {
    return res.status(400).json({ error: 'Target user ID is missing' });
  }

  const now = new Date().toISOString();

  if (requestId) {
    try {
      await adminDb.collection('premiumRequests').doc(requestId).set(
        {
          status: 'REVOKED',
          reviewedAt: now,
          reviewedBy: adminEmail || 'curator'
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Error updating request status:', err);
    }
  }

  await setAuthoritativeEntitlement(targetUserId, {
    tier: 'FREE',
    source: 'revoked',
    updatedAt: now,
    approvedBy: adminEmail || 'curator'
  });

  return res.json({
    success: true,
    message: `Test Premium revoked for user ${targetUserId}. Personal history preserved.`
  });
}

export async function handleAdminOverview(req: Request, res: Response) {
  const { isAdmin } = await verifyAdminToken(req);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized: Curator access required.' });
  }

  try {
    const requestsSnap = await adminDb.collection('premiumRequests').get();
    const requests: any[] = [];
    requestsSnap.forEach((d) => requests.push(d.data()));

    const paymentsSnap = await adminDb.collection('payments').get();
    const payments: any[] = [];
    paymentsSnap.forEach((d) => payments.push(d.data()));

    const entitlementsSnap = await adminDb.collection('entitlements').get();
    let premiumUsers = 0;
    let testPremiumUsers = 0;
    entitlementsSnap.forEach((d) => {
      const tier = d.data().tier?.toUpperCase();
      if (tier === 'PREMIUM') premiumUsers++;
      if (tier === 'TEST_PREMIUM') testPremiumUsers++;
    });

    const insightsSnap = await adminDb.collection('recipeInsights').get();
    const insights: any[] = [];
    insightsSnap.forEach((d) => insights.push(d.data()));

    return res.json({
      stats: {
        totalUsers: Math.max(entitlementsSnap.size, 1),
        premiumUsers,
        testPremiumUsers,
        pendingRequests: requests.filter((r) => r.status === 'PENDING' || r.status === 'pending').length,
        totalPayments: payments.length,
        totalQuestionsLogged: insights.reduce((acc, i) => acc + (i.totalQuestions || 0), 0)
      },
      requests: requests.reverse(),
      payments: payments.reverse(),
      insights
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error fetching admin overview: ' + err.message });
  }
}

export async function handleGetEntitlement(req: Request, res: Response) {
  const verifiedUser = await verifyUserToken(req);
  const urlParts = req.url.split('?');
  const query = new URLSearchParams(urlParts[1] || '');
  const userId = verifiedUser?.uid || query.get('userId') || (req.headers['x-user-id'] as string) || '';

  const entitlement = await getAuthoritativeEntitlement(userId);
  return res.json({
    entitlement: {
      tier: entitlement.tier.toLowerCase(),
      source: entitlement.source,
      unlockedAt: entitlement.updatedAt,
      paystackReference: entitlement.paymentReference
    }
  });
}

export async function handleGetRecipeInsights(_req: Request, res: Response) {
  try {
    const snap = await adminDb.collection('recipeInsights').get();
    const insights: any[] = [];
    snap.forEach((d) => insights.push(d.data()));
    return res.json({
      totalInsights: insights.length,
      insights
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error loading insights: ' + err.message });
  }
}

export async function handleDevGrantPremium(req: Request, res: Response) {
  const { isAdmin, email: adminEmail } = await verifyAdminToken(req);
  if (!isAdmin) {
    return res.status(403).json({
      error: 'Unauthorized',
      message: 'Fast dev test access is restricted to verified curator accounts.'
    });
  }

  const { userId } = req.body;
  const now = new Date().toISOString();

  if (userId) {
    await setAuthoritativeEntitlement(userId, {
      tier: 'TEST_PREMIUM',
      source: 'dev',
      updatedAt: now,
      approvedAt: now,
      approvedBy: adminEmail || 'curator'
    });
  }

  return res.json({
    success: true,
    entitlement: {
      tier: 'test_premium',
      source: 'dev',
      unlockedAt: now,
      approvedBy: adminEmail || 'curator'
    },
    message: `Test Premium activated by administrator ${adminEmail || ''}`
  });
}
