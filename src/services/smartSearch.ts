import { Recipe } from '../types/recipe';

export interface SmartSearchResult {
  recipes: Recipe[];
  detectedIntent?: {
    type: 'time' | 'spice' | 'ingredients' | 'cuisine_dish' | 'dietary' | 'general';
    label: string;
    aiPowered?: boolean;
  };
  explanation?: string;
}

// ---------------------------------------------------------------------------
// 1. LOCAL NATURAL-LANGUAGE PARSER & OFFLINE SEARCH
// ---------------------------------------------------------------------------

export function searchRecipesLocally(
  allRecipes: Recipe[],
  query: string,
  options?: {
    isOnline?: boolean;
    downloadedIds?: Set<string>;
    offlineOnly?: boolean;
  }
): SmartSearchResult {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return { recipes: allRecipes };
  }

  // Filter pool if offline-only requested
  let candidatePool = allRecipes;
  if (options?.offlineOnly && options?.downloadedIds) {
    candidatePool = allRecipes.filter(r => r.isStarter || options.downloadedIds!.has(r.recipeId));
  }

  // 1. Check for time intent: e.g. "under 30 minutes", "under 20 mins", "in 15 minutes", "quick"
  const timeMatch = trimmed.match(/(?:under|less than|within|in)\s+(\d+)\s*(?:min|mins|minutes|m)/i) ||
                    trimmed.match(/(\d+)\s*(?:min|mins|minutes)\s*(?:or less|max)/i);
  const isQuickIntent = trimmed.includes('quick') || trimmed.includes('fast') || trimmed.includes('speedy');

  if (timeMatch || isQuickIntent) {
    const maxMinutes = timeMatch ? parseInt(timeMatch[1], 10) : 30;
    const remainingQuery = trimmed
      .replace(/(?:under|less than|within|in)\s+(\d+)\s*(?:min|mins|minutes|m)/gi, '')
      .replace(/(\d+)\s*(?:min|mins|minutes)\s*(?:or less|max)/gi, '')
      .replace(/\b(quick|fast|speedy|recipe|recipes|dish|dishes|something|under|minutes|min)\b/gi, '')
      .trim();

    let matched = candidatePool.filter(r => r.totalTime <= maxMinutes);
    if (remainingQuery.length > 2) {
      matched = filterByTextKeyword(matched, remainingQuery);
    }

    if (matched.length > 0) {
      return {
        recipes: matched,
        detectedIntent: {
          type: 'time',
          label: `Ready in under ${maxMinutes} minutes`
        }
      };
    }
  }

  // 2. Check for spice intent: e.g. "something spicy", "mild food", "extra hot", "spicy dinner"
  if (trimmed.includes('spicy') || trimmed.includes('hot pepper') || trimmed.includes('fiery')) {
    const remainingQuery = trimmed.replace(/\b(i want|give me|something|spicy|hot|fiery|food|dish|recipe|recipes)\b/gi, '').trim();
    let matched = candidatePool.filter(r => r.spiceLevel >= 3 || r.categories.some(t => t.toLowerCase().includes('spic')) || r.searchTags.some(t => t.toLowerCase().includes('spic')));
    if (remainingQuery.length > 2) {
      matched = filterByTextKeyword(matched, remainingQuery);
    }
    if (matched.length > 0) {
      return {
        recipes: matched,
        detectedIntent: {
          type: 'spice',
          label: 'Spicy & bold flavor profile'
        }
      };
    }
  }

  if (trimmed.includes('mild') || trimmed.includes('not spicy') || trimmed.includes('no spice')) {
    const remainingQuery = trimmed.replace(/\b(i want|give me|something|mild|not spicy|no spice|food|dish|recipe|recipes)\b/gi, '').trim();
    let matched = candidatePool.filter(r => r.spiceLevel <= 1);
    if (remainingQuery.length > 2) {
      matched = filterByTextKeyword(matched, remainingQuery);
    }
    if (matched.length > 0) {
      return {
        recipes: matched,
        detectedIntent: {
          type: 'spice',
          label: 'Mild & gentle spice level'
        }
      };
    }
  }

  // 3. Check for multi-ingredient intent: e.g. "I have chicken and rice", "using tomato and garlic", "pasta and beef"
  const ingredientIntentMatch = trimmed.match(/(?:i have|using|with|made with|combine)\s+([a-zA-Z\s,]+)/i);
  if (ingredientIntentMatch || trimmed.includes(' and ')) {
    const ingredientString = ingredientIntentMatch ? ingredientIntentMatch[1] : trimmed;
    const ingredients = ingredientString
      .split(/\band\b|,|\+/)
      .map(s => s.replace(/\b(i have|using|with|made with|combine|dish|recipe|recipes|something)\b/gi, '').trim())
      .filter(s => s.length >= 3);

    if (ingredients.length >= 2) {
      const matched = candidatePool.filter(r => {
        const recipeText = [
          ...r.ingredients.map(i => i.name.toLowerCase()),
          r.title.toLowerCase(),
          r.description.toLowerCase()
        ].join(' ');

        return ingredients.every(ing => recipeText.includes(ing));
      });

      if (matched.length > 0) {
        return {
          recipes: matched,
          detectedIntent: {
            type: 'ingredients',
            label: `Contains ${ingredients.join(' + ')}`
          }
        };
      }
    }
  }

  // 4. Check for Country / Cuisine + Dish Type intent: e.g. "Nigerian soup", "Italian pasta", "Japanese noodles", "Mexican soup", "Thai curry"
  const countryCuisinePatterns = [
    { country: 'Nigeria', keywords: ['nigerian', 'nigeria'] },
    { country: 'Morocco', keywords: ['moroccan', 'morocco'] },
    { country: 'Italy', keywords: ['italian', 'italy'] },
    { country: 'Japan', keywords: ['japanese', 'japan'] },
    { country: 'Mexico', keywords: ['mexican', 'mexico'] },
    { country: 'Thailand', keywords: ['thai', 'thailand'] },
    { country: 'India', keywords: ['indian', 'india'] },
    { country: 'France', keywords: ['french', 'france'] },
    { country: 'Greece', keywords: ['greek', 'greece'] },
    { country: 'Ghana', keywords: ['ghanaian', 'ghana'] },
    { country: 'Vietnam', keywords: ['vietnamese', 'vietnam'] },
    { country: 'Spain', keywords: ['spanish', 'spain'] },
    { country: 'Jamaica', keywords: ['jamaican', 'jamaica'] },
    { country: 'Lebanon', keywords: ['lebanese', 'lebanon'] },
    { country: 'Brazil', keywords: ['brazilian', 'brazil'] },
    { country: 'Ethiopia', keywords: ['ethiopian', 'ethiopia'] }
  ];

  for (const c of countryCuisinePatterns) {
    if (c.keywords.some(k => trimmed.includes(k))) {
      let matched = candidatePool.filter(r => 
        r.country.toLowerCase() === c.country.toLowerCase() ||
        c.keywords.some(k => r.cuisine.toLowerCase().includes(k))
      );

      // Check if there is also a meal/dish type keyword: e.g. soup, stew, rice, pasta, noodles, curry, salad, dessert
      const dishKeywords = ['soup', 'stew', 'rice', 'pasta', 'noodles', 'curry', 'salad', 'dessert', 'bread', 'taco', 'breakfast', 'dinner'];
      const foundDishType = dishKeywords.find(d => trimmed.includes(d));

      if (foundDishType) {
        const dishFiltered = matched.filter(r => 
          r.title.toLowerCase().includes(foundDishType) ||
          r.mealType.toLowerCase().includes(foundDishType) ||
          r.categories.some(t => t.toLowerCase().includes(foundDishType)) ||
          r.description.toLowerCase().includes(foundDishType)
        );
        if (dishFiltered.length > 0) {
          return {
            recipes: dishFiltered,
            detectedIntent: {
              type: 'cuisine_dish',
              label: `${c.country} ${foundDishType.charAt(0).toUpperCase() + foundDishType.slice(1)}`
            }
          };
        }
      }

      if (matched.length > 0) {
        return {
          recipes: matched,
          detectedIntent: {
            type: 'cuisine_dish',
            label: `Authentic ${c.country} Dishes`
          }
        };
      }
    }
  }

  // 5. Standard multi-keyword weighted search
  const ranked = candidatePool
    .map(r => ({ recipe: r, score: calculateRecipeScore(r, trimmed) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.recipe);

  return {
    recipes: ranked,
    detectedIntent: ranked.length > 0 ? { type: 'general', label: `Search results for "${query}"` } : undefined
  };
}

// ---------------------------------------------------------------------------
// 2. HELPER SCORING FUNCTIONS
// ---------------------------------------------------------------------------

function filterByTextKeyword(recipes: Recipe[], keyword: string): Recipe[] {
  const kw = keyword.toLowerCase();
  return recipes.filter(r => {
    return (
      r.title.toLowerCase().includes(kw) ||
      r.country.toLowerCase().includes(kw) ||
      r.continent.toLowerCase().includes(kw) ||
      r.cuisine.toLowerCase().includes(kw) ||
      r.mealType.toLowerCase().includes(kw) ||
      r.categories.some(t => t.toLowerCase().includes(kw)) ||
      r.searchTags.some(t => t.toLowerCase().includes(kw)) ||
      r.ingredients.some(i => i.name.toLowerCase().includes(kw)) ||
      r.dietaryTags.some(d => d.toLowerCase().includes(kw))
    );
  });
}

function calculateRecipeScore(recipe: Recipe, query: string): number {
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter(t => t.length > 1);
  if (tokens.length === 0) return 0;

  let score = 0;
  const titleLower = recipe.title.toLowerCase();
  const countryLower = recipe.country.toLowerCase();
  const continentLower = recipe.continent.toLowerCase();
  const cuisineLower = recipe.cuisine.toLowerCase();
  const mealTypeLower = recipe.mealType.toLowerCase();
  const tagsLower = [...recipe.categories, ...recipe.searchTags].map(t => t.toLowerCase());
  const dietaryLower = recipe.dietaryTags.map(d => d.toLowerCase());
  const ingredientsLower = recipe.ingredients.map(i => i.name.toLowerCase());

  // Exact match bonus
  if (titleLower === q) score += 100;
  if (countryLower === q) score += 80;
  if (cuisineLower === q) score += 70;

  // Title includes entire query
  if (titleLower.includes(q)) score += 50;
  if (countryLower.includes(q)) score += 40;

  // Check individual tokens
  for (const token of tokens) {
    if (titleLower.includes(token)) score += 25;
    if (countryLower.includes(token)) score += 20;
    if (cuisineLower.includes(token)) score += 15;
    if (continentLower.includes(token)) score += 10;
    if (mealTypeLower.includes(token)) score += 15;
    if (tagsLower.some(t => t.includes(token))) score += 12;
    if (dietaryLower.some(d => d.includes(token))) score += 12;
    if (ingredientsLower.some(i => i.includes(token))) score += 15;
    if (recipe.description.toLowerCase().includes(token)) score += 5;
    if (recipe.culturalBackground.toLowerCase().includes(token)) score += 3;
  }

  return score;
}

// ---------------------------------------------------------------------------
// 3. GEMINI ONLINE NATURAL-LANGUAGE INTENT (SERVER FALLBACK)
// ---------------------------------------------------------------------------

export async function searchWithGeminiAI(
  query: string,
  candidateRecipes: Recipe[]
): Promise<SmartSearchResult> {
  try {
    const res = await fetch('/api/chef/smart-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        recipes: candidateRecipes.slice(0, 80).map(r => ({
          recipeId: r.recipeId,
          title: r.title,
          country: r.country,
          cuisine: r.cuisine,
          mealType: r.mealType,
          totalTime: r.totalTime,
          spiceLevel: r.spiceLevel,
          dietaryTags: r.dietaryTags,
          categories: r.categories,
          mainIngredients: r.ingredients.slice(0, 6).map(i => i.name)
        }))
      })
    });

    if (!res.ok) {
      throw new Error(`AI search failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.matchedRecipeIds && Array.isArray(data.matchedRecipeIds) && data.matchedRecipeIds.length > 0) {
      const recipeMap = new Map(candidateRecipes.map(r => [r.recipeId, r]));
      const matched = data.matchedRecipeIds
        .map((id: string) => recipeMap.get(id))
        .filter(Boolean) as Recipe[];

      if (matched.length > 0) {
        return {
          recipes: matched,
          detectedIntent: {
            type: 'general',
            label: data.intentLabel || 'AI Curated Match',
            aiPowered: true
          },
          explanation: data.explanation || `Curated for "${query}"`
        };
      }
    }
  } catch (err) {
    console.warn('Gemini Smart Search fallback to local engine:', err);
  }

  // Graceful fallback to local matching if API is offline/rate-limited
  return searchRecipesLocally(candidateRecipes, query);
}
