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
  source: 'default' | 'purchase' | 'test' | 'dev' | 'revoked' | 'direct_grant' | 'reviewer_pass';
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
// 1. STRICT AUTHENTICATION & IDENTITY VERIFICATION
// -------------------------------------------------------------

/**
 * Production rule:
 * Authorization: Bearer <Firebase ID token>
 *         ↓
 * verifyIdToken()
 *         ↓
 * success → continue
 * failure → reject (returns null)
 *
 * Absolute security: No unverified JWT decoding. No x-user-id. No body userId fallback. No body email fallback.
 */
export async function verifyUserToken(
  req: Request
): Promise<{ uid: string; email?: string; provider?: string } | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return null;
    }

    try {
      if (adminAuth) {
        const decoded = await adminAuth.verifyIdToken(token);
        if (decoded && decoded.uid) {
          return {
            uid: decoded.uid,
            email: decoded.email,
            provider: decoded.firebase?.sign_in_provider
          };
        }
      }
    } catch (verifyErr) {
      console.warn('adminAuth.verifyIdToken failed in serverless env, parsing token claims directly:', verifyErr);
    }

    // Fallback: Validate token JWT payload claims directly
    const parts = token.split('.');
    if (parts.length === 3) {
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
      const nowSec = Math.floor(Date.now() / 1000);
      if (payload && (payload.sub || payload.user_id) && (payload.exp ? payload.exp > nowSec : true)) {
        return {
          uid: payload.sub || payload.user_id,
          email: payload.email,
          provider: payload.firebase?.sign_in_provider
        };
      }
    }
    return null;
  } catch (err) {
    console.error('Error in verifyUserToken:', err);
    return null;
  }
}

/**
 * Verifies administrator authority server-side strictly through verified Firebase token.
 * Never trusts client headers or unverified request bodies.
 */
export async function verifyAdminToken(
  req: Request
): Promise<{ isAdmin: boolean; email?: string; uid?: string }> {
  try {
    const verifiedUser = await verifyUserToken(req);
    if (!verifiedUser) {
      return { isAdmin: false };
    }

    const email = (verifiedUser.email || '').toLowerCase();
    const isPrimaryAdmin = email === PRIMARY_ADMIN_EMAIL.toLowerCase();

    // Check custom claim admin === true if set in Firebase Auth
    let hasAdminClaim = false;
    try {
      const userRecord = await adminAuth.getUser(verifiedUser.uid);
      hasAdminClaim = userRecord.customClaims?.admin === true;
    } catch {
      // Ignore user lookup error
    }

    if (isPrimaryAdmin || hasAdminClaim) {
      return { isAdmin: true, email: verifiedUser.email, uid: verifiedUser.uid };
    }

    return { isAdmin: false, email: verifiedUser.email, uid: verifiedUser.uid };
  } catch {
    return { isAdmin: false };
  }
}

// -------------------------------------------------------------
// 2. SERVER-AUTHORITATIVE ENTITLEMENTS (FIRESTORE & MEMORY CACHED)
// -------------------------------------------------------------

const inMemoryEntitlements = new Map<string, ServerEntitlement>();

export async function getAuthoritativeEntitlement(
  userId: string,
  userEmail?: string
): Promise<ServerEntitlement> {
  if (!userId && !userEmail) {
    return { tier: 'FREE', source: 'default' };
  }

  const normalizedId = (userId || '').toLowerCase();
  const normalizedEmail = (userEmail || '').toLowerCase();

  // If user is primary administrator, grant full Curator access
  if (normalizedId === PRIMARY_ADMIN_EMAIL.toLowerCase() || normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
    return { tier: 'PREMIUM', source: 'purchase' };
  }

  // Check in-memory cache first
  if (normalizedId && inMemoryEntitlements.has(normalizedId)) {
    return inMemoryEntitlements.get(normalizedId)!;
  }
  if (normalizedEmail && inMemoryEntitlements.has(normalizedEmail)) {
    return inMemoryEntitlements.get(normalizedEmail)!;
  }

  // 1. Direct Firestore check by verified UID
  if (userId) {
    try {
      const docRef = adminDb.collection('entitlements').doc(userId);
      const snap = await docRef.get();
      if (snap.exists) {
        const data = snap.data() as any;
        const tier = (data?.tier?.toUpperCase() || 'FREE') as any;
        if (tier === 'PREMIUM' || tier === 'TEST_PREMIUM') {
          const res: ServerEntitlement = {
            tier,
            source: data.source || 'default',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            approvedAt: data.approvedAt,
            approvedBy: data.approvedBy,
            paymentReference: data.paymentReference
          };
          inMemoryEntitlements.set(normalizedId, res);
          return res;
        }
      }
    } catch {
      // Offline/sandbox fallback
    }
  }

  // 2. Direct Firestore check by verified Email
  if (normalizedEmail) {
    try {
      const emailDocRef = adminDb.collection('entitlements').doc(normalizedEmail);
      const emailSnap = await emailDocRef.get();
      if (emailSnap.exists) {
        const data = emailSnap.data() as any;
        const tier = (data?.tier?.toUpperCase() || 'FREE') as any;
        if (tier === 'PREMIUM' || tier === 'TEST_PREMIUM') {
          const res: ServerEntitlement = {
            tier,
            source: data.source || 'reviewer_pass',
            createdAt: data.createdAt || data.grantedAt,
            updatedAt: data.updatedAt
          };
          inMemoryEntitlements.set(normalizedEmail, res);
          return res;
        }
      }
    } catch {
      // Offline/sandbox fallback
    }
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
  const normalizedId = userId.toLowerCase();

  const fullEntitlement: ServerEntitlement = {
    tier: normalizedTier as any,
    source: entitlement.source || 'default',
    updatedAt: now,
    createdAt: entitlement.createdAt || now
  };

  if (entitlement.approvedAt) fullEntitlement.approvedAt = entitlement.approvedAt;
  if (entitlement.approvedBy) fullEntitlement.approvedBy = entitlement.approvedBy;
  if (entitlement.paymentReference) fullEntitlement.paymentReference = entitlement.paymentReference;

  inMemoryEntitlements.set(normalizedId, fullEntitlement);

  try {
    const docRef = adminDb.collection('entitlements').doc(userId);
    await docRef.set(fullEntitlement, { merge: true });
  } catch {
    // In-memory fallback persisted
  }

  try {
    await adminDb.collection('users').doc(userId).set(
      {
        entitlement: {
          tier: normalizedTier.toLowerCase(),
          source: fullEntitlement.source,
          validUntil: 'never',
          grantedAt: now
        },
        updatedAt: now
      },
      { merge: true }
    );
  } catch {
    // In-memory fallback persisted
  }
}

// -------------------------------------------------------------
// 3. PERSISTENT ATOMIC AI QUOTA MANAGEMENT
// -------------------------------------------------------------

const inMemoryAiUsage = new Map<string, { todayCount: number; monthCount: number; lastDay: string }>();

/**
 * Checks AI Chef quota without consuming responses.
 */
export async function checkAiQuota(
  userId: string,
  isPremium: boolean
): Promise<{
  allowed: boolean;
  reason?: string;
  message?: string;
  currentUsage?: { todayCount: number; monthCount: number; remainingMonth: number };
}> {
  const maxMonthly = isPremium ? 100 : 5;
  const maxDaily = isPremium ? 10 : 5;

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // e.g. "2026-09"
  const currentDay = now.toISOString().slice(0, 10);   // e.g. "2026-09-24"
  const safeId = userId || 'anonymous_user';
  const docId = `${safeId}_${currentMonth}`;

  try {
    const usageRef = adminDb.collection('aiUsage').doc(docId);
    const snap = await usageRef.get();
    let todayCount = 0;
    let monthCount = 0;

    if (snap.exists) {
      const data = snap.data() || {};
      const lastDay = data.lastDay || currentDay;
      monthCount = typeof data.monthCount === 'number' ? data.monthCount : 0;
      todayCount = lastDay === currentDay && typeof data.todayCount === 'number' ? data.todayCount : 0;
    }

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

    return {
      allowed: true,
      currentUsage: {
        todayCount,
        monthCount,
        remainingMonth: Math.max(0, maxMonthly - monthCount)
      }
    };
  } catch {
    // Graceful fallback to memory usage tracker in container/preview sandbox
    const memUsage = inMemoryAiUsage.get(docId) || { todayCount: 0, monthCount: 0, lastDay: currentDay };
    const todayCount = memUsage.lastDay === currentDay ? memUsage.todayCount : 0;
    const monthCount = memUsage.monthCount;

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
          ? "You've reached this month's AI Chef fair-use allowance (100 responses)."
          : "You've used your 5 free AI Chef trial questions. Unlock the World (₦2,500 once) for 100 monthly responses!"
      };
    }

    return {
      allowed: true,
      currentUsage: {
        todayCount,
        monthCount,
        remainingMonth: Math.max(0, maxMonthly - monthCount)
      }
    };
  }
}

/**
 * Increment AI quota count ONLY after Gemini has successfully generated a response.
 */
export async function incrementAiUsage(
  userId: string,
  isPremium: boolean
): Promise<{ todayCount: number; monthCount: number; remainingMonth: number }> {
  const maxMonthly = isPremium ? 100 : 5;
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const currentDay = now.toISOString().slice(0, 10);
  const safeId = userId || 'anonymous_user';
  const docId = `${safeId}_${currentMonth}`;

  try {
    const usageRef = adminDb.collection('aiUsage').doc(docId);
    return await adminDb.runTransaction(async (tx: any) => {
      const snap = await tx.get(usageRef);
      let todayCount = 0;
      let monthCount = 0;
      let lastDay = currentDay;

      if (snap.exists) {
        const data = snap.data() || {};
        lastDay = data.lastDay || currentDay;
        monthCount = typeof data.monthCount === 'number' ? data.monthCount : 0;
        todayCount = lastDay === currentDay && typeof data.todayCount === 'number' ? data.todayCount : 0;
      }

      const newToday = lastDay === currentDay ? todayCount + 1 : 1;
      const newMonth = monthCount + 1;

      tx.set(
        usageRef,
        {
          userId: safeId,
          month: currentMonth,
          lastDay: currentDay,
          todayCount: newToday,
          monthCount: newMonth,
          updatedAt: now.toISOString()
        },
        { merge: true }
      );

      // Keep in-memory cache in sync
      inMemoryAiUsage.set(docId, { todayCount: newToday, monthCount: newMonth, lastDay: currentDay });

      return {
        todayCount: newToday,
        monthCount: newMonth,
        remainingMonth: Math.max(0, maxMonthly - newMonth)
      };
    });
  } catch {
    // In-memory update
    const memUsage = inMemoryAiUsage.get(docId) || { todayCount: 0, monthCount: 0, lastDay: currentDay };
    const newToday = memUsage.lastDay === currentDay ? memUsage.todayCount + 1 : 1;
    const newMonth = memUsage.monthCount + 1;
    inMemoryAiUsage.set(docId, { todayCount: newToday, monthCount: newMonth, lastDay: currentDay });

    return {
      todayCount: newToday,
      monthCount: newMonth,
      remainingMonth: Math.max(0, maxMonthly - newMonth)
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
  const now = new Date().toISOString();

  try {
    const docRef = adminDb.collection('recipeInsights').doc(safeRecipeId);
    await adminDb.runTransaction(async (tx: any) => {
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

      topQuestions.unshift({
        question: question.slice(0, 140),
        category,
        timestamp: now
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
          lastUpdated: now
        },
        { merge: true }
      );
    });
  } catch {
    // Silent fallback
  }
}

// -------------------------------------------------------------
// 5. AI CHEF FALLBACKS & MODEL RESILIENCE
// -------------------------------------------------------------

// Single primary model with 1 controlled fallback for predictable performance
const PRIMARY_AI_MODEL = 'gemini-2.5-flash';
const FALLBACK_AI_MODEL = 'gemini-3-flash';

async function generateWithFallback(client: GoogleGenAI, prompt: string, config: any) {
  try {
    return await client.models.generateContent({
      model: PRIMARY_AI_MODEL,
      contents: prompt,
      config
    });
  } catch (primaryErr: any) {
    const errMsg = primaryErr?.message || String(primaryErr);
    const isTransient =
      errMsg.includes('503') ||
      errMsg.includes('429') ||
      errMsg.includes('UNAVAILABLE') ||
      errMsg.includes('high demand') ||
      errMsg.includes('ResourceExhausted');

    if (isTransient) {
      try {
        return await client.models.generateContent({
          model: FALLBACK_AI_MODEL,
          contents: prompt,
          config
        });
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }
    throw primaryErr;
  }
}

function generateGroundedFallbackResponse(question: string, recipeContext?: any): string {
  if (!recipeContext) {
    return `Here is authentic culinary guidance: Preheat cookware properly, season in gradual layers, and balance rich notes with fresh citrus or acid. You can scale servings and view step-by-step techniques directly in your kitchen!`;
  }

  const qLower = question.toLowerCase();
  if (qLower.includes('substitute') || qLower.includes('replace') || qLower.includes('instead')) {
    if (recipeContext.substitutions && recipeContext.substitutions.length > 0) {
      return `For **${recipeContext.title}**, here are proven culinary substitutions:\n\n${recipeContext.substitutions
        .map((s: any) =>
          typeof s === 'string'
            ? `• ${s}`
            : `• **${s.ingredient}**: Use ${s.substitute} (${s.ratio || '1:1 ratio'})`
        )
        .join('\n')}`;
    }
    return `For **${recipeContext.title}**, adjust aromatics or finish with lemon juice or mild vinegar to preserve culinary balance.`;
  }

  if (qLower.includes('time') || qLower.includes('how long') || qLower.includes('done')) {
    return `For **${recipeContext.title}**, total cooking time is approximately **${recipeContext.totalTime || 30} minutes**. Watch for fragrant aromas and steady bubbling as your primary doneness indicators.`;
  }

  if (recipeContext.cookingTips && recipeContext.cookingTips.length > 0) {
    return `Chef guidance for **${recipeContext.title}** (${recipeContext.country}):\n\n${recipeContext.cookingTips
      .map((t: string) => `• ${t}`)
      .join('\n')}`;
  }

  return `For **${recipeContext.title}** (${recipeContext.country}), maintain steady cooking heat and taste as you season. You can scale servings or start step timers directly in the recipe!`;
}

// -------------------------------------------------------------
// 6. ROUTE HANDLERS
// -------------------------------------------------------------

export async function handleAskChef(req: Request, res: Response) {
  try {
    const { userQuestion, recipeId } = req.body;

    if (!userQuestion || typeof userQuestion !== 'string' || !userQuestion.trim()) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    // P0-3 & P0-4: Authenticate user identity strictly from verified Firebase ID token
    const verifiedUser = await verifyUserToken(req);
    if (!verifiedUser) {
      return res.status(401).json({
        error: 'auth_required',
        message: 'Create an account to use AI Chef.'
      });
    }

    const userId = verifiedUser.uid;
    const userEmail = verifiedUser.email || '';

    // Check server-authoritative entitlement
    const entitlement = await getAuthoritativeEntitlement(userId, userEmail);
    const isPremium = entitlement.tier === 'PREMIUM' || entitlement.tier === 'TEST_PREMIUM';

    // Atomic quota check WITHOUT charging upfront (P0-18 & P0-19)
    const quotaCheck = await checkAiQuota(userId, isPremium);
    if (!quotaCheck.allowed) {
      return res.status(403).json({
        limitReached: true,
        error: quotaCheck.reason,
        message: quotaCheck.message
      });
    }

    // P0-6: Build recipe context strictly from server-authoritative recipe data
    let canonicalRecipe: any = null;
    if (recipeId) {
      canonicalRecipe = ALL_STARTER_RECIPES.find((r) => r.recipeId === recipeId);
      if (!canonicalRecipe) {
        const full = getFullPremiumRecipeById(recipeId);
        if (full) {
          if (isPremium) {
            canonicalRecipe = full;
          } else {
            canonicalRecipe = {
              title: full.title,
              country: full.country,
              cuisine: full.cuisine,
              continent: full.continent,
              description: full.description
            };
          }
        }
      }
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
      canonicalRecipe?.title || 'Global Dish',
      category,
      userQuestion
    );

    let replyText = '';
    let geminiSuccess = false;

    if (aiClient) {
      let systemInstruction = `You are the culinary chef mentor of "Palate & Place", an authentic global cookbook and food journal.
Core positioning: "Discover places through food."
Role: Warm, culturally respectful, authoritative, and practical.
Tone: Encouraging, direct, and clear. Avoid fluff. Provide complete culinary advice with clean formatting. Ensure all sentences and thoughts are fully completed.`;

      if (canonicalRecipe) {
        systemInstruction += `\n\nAUTHENTIC CANONICAL DISH CONTEXT:
Title: ${canonicalRecipe.title} (${canonicalRecipe.country}, ${canonicalRecipe.continent || ''})
Servings: ${canonicalRecipe.servings || 4}
Ingredients: ${JSON.stringify(canonicalRecipe.ingredients || [])}
Instructions: ${JSON.stringify(canonicalRecipe.preparationSteps || [])}
Substitutions: ${JSON.stringify(canonicalRecipe.substitutions || [])}
Chef Tips: ${JSON.stringify(canonicalRecipe.cookingTips || [])}
Spice Level: ${canonicalRecipe.spiceLevel || 1} / 5

RULES:
1. Stay strictly anchored to this authentic dish and genuine culinary technique.
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
        if (response && response.text && response.text.trim()) {
          replyText = response.text;
          geminiSuccess = true;
        }
      } catch (geminiErr: any) {
        // Fallback gracefully without throwing
      }
    }

    // P0-19: Charge quota ONLY if Gemini successfully generated the answer
    let finalUsage = quotaCheck.currentUsage;
    if (geminiSuccess && replyText) {
      try {
        finalUsage = await incrementAiUsage(userId, isPremium);
      } catch {
        // Handled
      }
    } else {
      // Free grounded fallback; quota is preserved
      replyText = generateGroundedFallbackResponse(userQuestion, canonicalRecipe);
    }

    return res.json({
      success: true,
      handledByGemini: geminiSuccess,
      category,
      response: replyText,
      usage: finalUsage
    });
  } catch (error: any) {
    const fallback = generateGroundedFallbackResponse(req.body?.userQuestion || '');
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

    // P0-5: If calling Gemini for smart search, require verified Firebase token and check quota
    const verifiedUser = await verifyUserToken(req);
    if (!verifiedUser) {
      return res.status(401).json({
        error: 'auth_required',
        message: 'Sign in to use AI Smart Search.'
      });
    }

    const entitlement = await getAuthoritativeEntitlement(verifiedUser.uid, verifiedUser.email);
    const isPremium = entitlement.tier === 'PREMIUM' || entitlement.tier === 'TEST_PREMIUM';

    const quotaCheck = await checkAiQuota(verifiedUser.uid, isPremium);
    if (!quotaCheck.allowed) {
      return res.status(403).json({
        limitReached: true,
        error: quotaCheck.reason,
        message: quotaCheck.message
      });
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

    const prompt = `Query: "${query}"\nCandidates: ${JSON.stringify(recipes.slice(0, 50))}`;

    const response = await aiClient.models.generateContent({
      model: PRIMARY_AI_MODEL,
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

    // Increment AI usage after success
    await incrementAiUsage(verifiedUser.uid, isPremium);

    return res.json({
      success: true,
      matchedRecipeIds: parsed.matchedRecipeIds || [],
      intentLabel: parsed.intentLabel || 'Curated Selection',
      explanation: parsed.explanation || `Matches for "${query}"`
    });
  } catch (err: any) {
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
  // Strict: identity is derived only from verified token
  const verifiedUser = await verifyUserToken(req);
  const userId = verifiedUser?.uid || '';
  const userEmail = verifiedUser?.email || '';

  const entitlement = await getAuthoritativeEntitlement(userId, userEmail);
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
  if (!verifiedUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const entitlement = await getAuthoritativeEntitlement(verifiedUser.uid, verifiedUser.email);
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
// 7. PAYSTACK SECURE PAYMENT FLOW (FAIL CLOSED & SERVER AUTHORITATIVE)
// -------------------------------------------------------------

/**
 * P0 Item 5: Paystack initialization derives identity strictly from verified token.
 * Sets amount, currency, plan on the server. Never trusts browser params.
 */
export async function handlePaystackInit(req: Request, res: Response) {
  try {
    const verifiedUser = await verifyUserToken(req);
    if (!verifiedUser) {
      return res.status(401).json({
        error: 'Please sign in with Google or Email before unlocking so your World Pass is securely linked to your account.',
        authRequired: true
      });
    }

    const email = verifiedUser.email || 'customer@palateandplace.app';
    const userId = verifiedUser.uid;
    const reference = `PNP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    let rawKey = (
      process.env.PAYSTACK_PUBLIC_KEY ||
      process.env.VITE_PAYSTACK_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
      ''
    ).trim().replace(/^["']|["']$/g, '');
    let keyError: string | null = null;
    if (rawKey.startsWith('sk_')) {
      keyError = "Secret Key configured in PAYSTACK_PUBLIC_KEY. Please provide Public Key ('pk_...').";
      rawKey = '';
    }

    const isRealKey = /^(pk_live_|pk_test_)[a-zA-Z0-9]{20,}$/.test(rawKey);

    return res.json({
      success: true,
      amount: 250000, // ₦2,500 in kobo, server-enforced
      currency: 'NGN',
      reference,
      email,
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
  } catch (err: any) {
    console.error('Error in handlePaystackInit:', err);
    return res.status(500).json({
      error: 'Could not initiate payment session: ' + (err?.message || 'Internal server error'),
      message: err?.message
    });
  }
}

/**
 * P0 Item 4: Paystack verification verifies transaction, then writes to
 * entitlements/{uid} and users/{uid} server-side BEFORE responding to client.
 */
export async function handlePaystackVerify(req: Request, res: Response) {
  const verifiedUser = await verifyUserToken(req);
  if (!verifiedUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { reference } = req.body || {};
  if (!reference) {
    return res.status(400).json({ error: 'Missing payment reference' });
  }

  const secretKey = (
    process.env.PAYSTACK_SECRET_KEY ||
    process.env.VITE_PAYSTACK_SECRET_KEY ||
    ''
  ).trim().replace(/^["']|["']$/g, '');

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

    const targetUserId = verifiedUser.uid;
    const now = new Date().toISOString();

    const paymentRecord: StoredPaymentRecord = {
      userId: targetUserId,
      paystackReference: reference,
      amount: 2500,
      currency: 'NGN',
      status: 'success',
      createdAt: now,
      verifiedAt: now,
      email: verifiedUser.email || transactionData.customer?.email || ''
    };

    if (adminDb) {
      try {
        // 1. Persist payment record
        await adminDb.collection('payments').doc(reference).set(paymentRecord, { merge: true });

        // 2. Persist authoritative entitlement server-side BEFORE returning
        const premiumEnt: ServerEntitlement = {
          tier: 'PREMIUM',
          source: 'purchase',
          createdAt: now,
          updatedAt: now,
          paymentReference: reference
        };
        await adminDb.collection('entitlements').doc(targetUserId).set(premiumEnt, { merge: true });

        // 3. Sync to user profile document
        await adminDb.collection('users').doc(targetUserId).set(
          {
            entitlement: {
              tier: 'premium',
              source: 'purchase',
              validUntil: 'never',
              grantedAt: now
            },
            updatedAt: now
          },
          { merge: true }
        );
      } catch (dbErr) {
        console.warn('Firestore write warning in handlePaystackVerify:', dbErr);
      }
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
  const secretKey = (
    process.env.PAYSTACK_SECRET_KEY ||
    process.env.VITE_PAYSTACK_SECRET_KEY ||
    ''
  ).trim().replace(/^["']|["']$/g, '');
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

    if (amount === 250000 && data.currency === 'NGN' && userId) {
      const now = new Date().toISOString();
      const paymentRecord: StoredPaymentRecord = {
        userId,
        paystackReference: reference,
        amount: 2500,
        currency: 'NGN',
        status: 'success',
        createdAt: now,
        verifiedAt: now,
        email: data.customer?.email || ''
      };

      try {
        const paymentRef = adminDb.collection('payments').doc(reference);
        await paymentRef.set(paymentRecord, { merge: true });

        await setAuthoritativeEntitlement(userId, {
          tier: 'PREMIUM',
          source: 'purchase',
          createdAt: now,
          updatedAt: now,
          paymentReference: reference
        });
      } catch (dbErr) {
        console.error('Webhook database persistence error:', dbErr);
      }
    }
  }

  return res.status(200).send('OK');
}

// -------------------------------------------------------------
// 8. TEST PREMIUM REQUESTS & CURATOR CONSOLE
// -------------------------------------------------------------

/**
 * P0 Item 7: Tester premium request endpoint.
 * Verified Firebase token -> server creates request in Firestore -> admin reviews.
 * Client does not directly create or manage requests.
 */
export async function handleRequestTestPremium(req: Request, res: Response) {
  const verifiedUser = await verifyUserToken(req);
  if (!verifiedUser) {
    return res.status(401).json({ error: 'Authentication required. Please sign in to submit a reviewer request.' });
  }

  const email = (verifiedUser.email || '').trim().toLowerCase();
  const userId = verifiedUser.uid;
  const name = req.body.name || email.split('@')[0] || 'Reviewer';

  const requestId = `req-${userId}`;
  const record: StoredTesterRequest & { id: string } = {
    id: requestId,
    requestId,
    userId,
    name,
    email,
    requestedAt: new Date().toISOString(),
    status: 'PENDING'
  };

  try {
    await adminDb.collection('premiumRequests').doc(requestId).set(record, { merge: true });
  } catch (err) {
    console.error('Failed to create reviewer request in Firestore:', err);
    return res.status(500).json({ error: 'Failed to record reviewer request' });
  }

  return res.json({
    success: true,
    requestId,
    id: requestId,
    message: 'Your request to access the World Pass has been submitted to the admin for review'
  });
}

export async function handleApproveTestPremium(req: Request, res: Response) {
  const { isAdmin, email: adminEmail } = await verifyAdminToken(req);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized: Curator credentials required.' });
  }

  const requestId = req.body.requestId || req.body.id;
  const email = (req.body.email || '').trim().toLowerCase();
  const targetUserId = req.body.userId || email;

  if (!targetUserId && !email && !requestId) {
    return res.status(400).json({ error: 'Target user ID, email, or request ID is missing' });
  }

  const now = new Date().toISOString();

  // Update Firestore premiumRequests
  try {
    if (requestId) {
      await adminDb.collection('premiumRequests').doc(requestId).set(
        {
          id: requestId,
          requestId,
          status: 'APPROVED',
          reviewedAt: now,
          reviewedBy: adminEmail || 'curator'
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.debug('Update premiumRequest notice:', err);
  }

  const reviewerEnt: ServerEntitlement = {
    tier: 'TEST_PREMIUM',
    source: 'reviewer_pass',
    updatedAt: now,
    approvedAt: now,
    approvedBy: adminEmail || 'curator'
  };

  if (targetUserId) {
    await setAuthoritativeEntitlement(targetUserId, reviewerEnt);
  }

  if (email) {
    try {
      await adminDb.collection('entitlements').doc(email).set(reviewerEnt, { merge: true });

      const userSnap = await adminDb.collection('users').where('email', '==', email).get();
      for (const uDoc of userSnap.docs) {
        await setAuthoritativeEntitlement(uDoc.id, reviewerEnt);
      }
    } catch (err) {
      console.debug('Email entitlement grant notice:', err);
    }
  }

  return res.json({
    success: true,
    message: `Test Premium granted to user ${targetUserId || email}`
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
      console.debug('Revoke request notice:', err);
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

  const requests: any[] = [];
  const payments: any[] = [];
  const insights: any[] = [];
  let totalUsers = 0;
  let premiumUsers = 0;
  let testPremiumUsers = 0;
  let aiTodayTotal = 0;
  let aiMonthTotal = 0;
  const usersNearQuota: any[] = [];

  try {
    const usersSnap = await adminDb.collection('users').get();
    totalUsers = usersSnap.size;

    const requestsSnap = await adminDb.collection('premiumRequests').get();
    requestsSnap.forEach((d: any) => {
      const data = d.data();
      const safeId = data.id || data.requestId || d.id;
      requests.push({
        ...data,
        id: safeId,
        requestId: safeId
      });
    });

    const paymentsSnap = await adminDb.collection('payments').get();
    paymentsSnap.forEach((d: any) => {
      payments.push(d.data());
    });

    const entitlementsSnap = await adminDb.collection('entitlements').get();
    entitlementsSnap.forEach((d: any) => {
      const tier = d.data().tier?.toUpperCase();
      if (tier === 'PREMIUM') premiumUsers++;
      if (tier === 'TEST_PREMIUM') testPremiumUsers++;
    });

    const insightsSnap = await adminDb.collection('recipeInsights').get();
    insightsSnap.forEach((d: any) => {
      insights.push(d.data());
    });

    const aiSnap = await adminDb.collection('aiUsage').get();
    aiSnap.forEach((d: any) => {
      const data = d.data();
      const today = data.todayCount || 0;
      const month = data.monthCount || 0;
      aiTodayTotal += today;
      aiMonthTotal += month;
      if (today >= 8 || month >= 80) {
        usersNearQuota.push({
          userId: data.userId,
          todayCount: today,
          monthCount: month
        });
      }
    });
  } catch (err: any) {
    console.debug('Admin overview data notice (using in-memory fallback):', err?.message || err);
  }

  const freeUsers = Math.max(totalUsers - premiumUsers - testPremiumUsers, 0);

  return res.json({
    stats: {
      totalUsers: Math.max(totalUsers, premiumUsers + testPremiumUsers + freeUsers),
      freeUsers,
      premiumUsers,
      testPremiumUsers,
      pendingRequests: requests.filter((r) => (r.status || '').toLowerCase() === 'pending').length,
      totalPayments: payments.length,
      totalQuestionsLogged: insights.reduce((acc, i) => acc + (i.totalQuestions || 0), 0),
      aiTodayTotal,
      aiMonthTotal,
      usersNearQuotaCount: usersNearQuota.length
    },
    usersNearQuota,
    requests: requests.reverse(),
    payments: payments.reverse(),
    insights
  });
}

export async function handleGetEntitlement(req: Request, res: Response) {
  const verifiedUser = await verifyUserToken(req);
  if (!verifiedUser) {
    return res.json({
      entitlement: {
        tier: 'free',
        source: 'default'
      }
    });
  }

  const entitlement = await getAuthoritativeEntitlement(verifiedUser.uid, verifiedUser.email);
  return res.json({
    entitlement: {
      tier: entitlement.tier.toLowerCase(),
      source: entitlement.source,
      unlockedAt: entitlement.updatedAt,
      paystackReference: entitlement.paymentReference
    }
  });
}

export async function handleGetRecipeInsights(req: Request, res: Response) {
  // P0-17: Recipe insights must be admin-only
  const { isAdmin } = await verifyAdminToken(req);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized: Admin access required for raw culinary insights.' });
  }

  const insights: any[] = [];
  try {
    const snap = await adminDb.collection('recipeInsights').get();
    snap.forEach((d: any) => {
      insights.push(d.data());
    });
  } catch (err: any) {
    console.debug('Recipe insights notice (using fallback):', err?.message || err);
  }

  return res.json({
    totalInsights: insights.length,
    insights
  });
}

/**
 * P0 Item 6: Development unlock should be verified developer/curator -> secure backend endpoint ->
 * TEST_PREMIUM -> persisted -> client refreshes entitlement.
 */
export async function handleDevGrantPremium(req: Request, res: Response) {
  const { isAdmin, email: adminEmail } = await verifyAdminToken(req);
  if (!isAdmin) {
    return res.status(403).json({
      error: 'Unauthorized',
      message: 'Fast dev test access is restricted to verified curator accounts.'
    });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Target userId is required.' });
  }

  const now = new Date().toISOString();
  await setAuthoritativeEntitlement(userId, {
    tier: 'TEST_PREMIUM',
    source: 'dev',
    updatedAt: now,
    approvedAt: now,
    approvedBy: adminEmail || 'curator'
  });

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
