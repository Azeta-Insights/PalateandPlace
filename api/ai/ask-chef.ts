import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error('Failed to initialize GoogleGenAI client in Vercel function:', e);
  }
}

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

function generateGroundedFallback(question: string, recipeContext?: any): string {
  if (!recipeContext) {
    return `Here is a master culinary tip: Keep your pans properly preheated, season in layers throughout cooking, and balance rich flavors with a touch of citrus or mild acid. You can ask me to scale recipes or set timers anytime!`;
  }

  const qLower = question.toLowerCase();
  if (qLower.includes('substitute') || qLower.includes('replace') || qLower.includes('instead')) {
    if (recipeContext.substitutions && recipeContext.substitutions.length > 0) {
      return `For **${recipeContext.title}**, here are recommended substitutions:\n\n${recipeContext.substitutions.map((s: string) => `• ${s}`).join('\n')}`;
    }
    return `For **${recipeContext.title}**, you can substitute key aromatics or adjust acidity with a squeeze of fresh lemon juice or mild vinegar while preserving the dish's character.`;
  }

  if (qLower.includes('time') || qLower.includes('how long') || qLower.includes('done')) {
    return `For **${recipeContext.title}**, total cook time is approximately **${recipeContext.totalTime || 30} minutes**. Watch for gentle browning and aroma rather than the clock alone.`;
  }

  if (recipeContext.cookingTips && recipeContext.cookingTips.length > 0) {
    return `Here is executive chef guidance for **${recipeContext.title}** (${recipeContext.country}):\n\n${recipeContext.cookingTips.map((t: string) => `• ${t}`).join('\n')}`;
  }

  return `For **${recipeContext.title}** (${recipeContext.country}), focus on steady heat and taste as you go. You can also adjust servings or set step timers directly!`;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { 
      userQuestion, 
      recipeContext, 
      userTier = 'free', 
      currentUsage = { rollingCount: 0, todayCount: 0, totalCount: 0 }, 
      category = 'general' 
    } = body;

    if (!userQuestion || typeof userQuestion !== 'string' || !userQuestion.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const maxMonthly = (userTier === 'premium' || userTier === 'test_premium') ? 100 : 5;
    if (currentUsage.rollingCount >= maxMonthly) {
      return res.status(429).json({
        error: 'Monthly chef question quota reached',
        message: userTier === 'free'
          ? 'You have used all 5 complimentary questions this month. Upgrade to the Lifetime World Pass for 100 questions every month!'
          : 'You have reached your 100 chef questions for this month. Your quota will refresh next month.'
      });
    }

    if (!aiClient) {
      const runtimeKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (runtimeKey) {
        aiClient = new GoogleGenAI({ apiKey: runtimeKey });
      }
    }

    let replyText = '';

    if (aiClient) {
      let systemInstruction = `You are the executive culinary mentor of "Palate & Place", an authentic global cookbook and food passport.
Core positioning: "Discover places through food."
Role: Warm, authoritative, deeply knowledgeable, culturally respectful, and practical.
Tone: Encouraging, concise, direct, helpful for home cooks. Avoid rambling. Keep answers focused on actionable cooking advice in 2-3 short paragraphs or bullet points.`;

      if (recipeContext) {
        systemInstruction += `\n\nAUTHORITATIVE CURRENT RECIPE CONTEXT:
Recipe: ${recipeContext.title} (${recipeContext.country}, ${recipeContext.continent})
Servings: ${recipeContext.servings}
Ingredients: ${JSON.stringify(recipeContext.ingredients)}
Instructions: ${JSON.stringify(recipeContext.preparationSteps)}
Known Substitutions: ${JSON.stringify(recipeContext.substitutions || [])}
Chef Tips: ${JSON.stringify(recipeContext.cookingTips || [])}
Spice Level: ${recipeContext.spiceLevel} / 5

CRITICAL GROUNDING RULES:
1. Always remain strictly grounded in this specific recipe.
2. Do not invent contradictory ingredients, times, or steps that conflict with this recipe.
3. If fixing a mistake (e.g. too much salt, burnt pan, undercooked rice), provide immediate culinary troubleshooting remedies without judgment.
4. Adapt smoothly to dietary needs, lack of equipment, or ingredient shortages while preserving the cultural soul of the dish.`;
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
        console.warn('Gemini temporary spike in Vercel function, using grounded fallback:', geminiErr?.message || geminiErr);
        replyText = generateGroundedFallback(userQuestion, recipeContext);
      }
    } else {
      replyText = generateGroundedFallback(userQuestion, recipeContext);
    }

    if (!replyText) {
      replyText = generateGroundedFallback(userQuestion, recipeContext);
    }

    return res.status(200).json({
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
    console.error('Ask Chef Handler Error:', error);
    const fallback = generateGroundedFallback(req.body?.userQuestion || '', req.body?.recipeContext);
    return res.status(200).json({
      success: true,
      handledByGemini: false,
      category: 'general',
      response: fallback,
      usage: req.body?.currentUsage || { totalCount: 0, rollingCount: 0, todayCount: 0 }
    });
  }
}
