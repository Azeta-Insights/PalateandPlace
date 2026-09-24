import { Recipe, CookingRecord, UserPreferences, Continent } from '../types/recipe';
import { ALL_RECIPES } from '../data/recipes';

export interface RecommendationItem {
  recipe: Recipe;
  score: number;
  reason: string;
}

export interface PersonalizationSignals {
  cookingHistory: CookingRecord[];
  favorites: Set<string>;
  downloadedIds: Set<string>;
  viewedIds: string[];
  searchHistory: string[];
  preferences?: UserPreferences;
  passportCountries: Record<string, any>;
}

export class PersonalizationService {
  /**
   * Generates highly tailored, behavior-driven recipe recommendations.
   * Weighs repeated cooks (very strong), single cooks (strong), favorites (strong),
   * ratings (strong), downloads (moderate), searches (moderate), views (moderate),
   * and explicit user preferences.
   */
  static getPersonalizedRecommendations(
    signals: PersonalizationSignals,
    catalog: Recipe[] = ALL_RECIPES,
    limit: number = 8
  ): RecommendationItem[] {
    const {
      cookingHistory = [],
      favorites = new Set(),
      downloadedIds = new Set(),
      viewedIds = [],
      searchHistory = [],
      preferences,
      passportCountries = {}
    } = signals;

    // 1. Build behavioral profile affinity maps
    const cuisineWeights: Record<string, number> = {};
    const countryWeights: Record<string, number> = {};
    const continentWeights: Record<string, number> = {};
    const mealTypeWeights: Record<string, number> = {};
    const ingredientWeights: Record<string, number> = {};
    const categoryWeights: Record<string, number> = {};
    const recipeCookCounts: Record<string, number> = {};
    const recipeCookedMap = new Map<string, CookingRecord[]>();

    // Analyze Cooking History (Strongest behavioral signal)
    const now = Date.now();
    for (const record of cookingHistory) {
      recipeCookCounts[record.recipeId] = (recipeCookCounts[record.recipeId] || 0) + 1;
      const list = recipeCookedMap.get(record.recipeId) || [];
      list.push(record);
      recipeCookedMap.set(record.recipeId, list);

      // Recency multiplier (1.0 to 1.5 for recent cooks within last 14 days)
      const daysAgo = Math.max(0, (now - new Date(record.cookedAt).getTime()) / (1000 * 60 * 60 * 24));
      const recencyBoost = daysAgo < 7 ? 1.5 : daysAgo < 30 ? 1.2 : 1.0;

      // Rating multiplier
      const ratingBoost = record.rating >= 4 ? 1.4 : record.rating === 3 ? 1.0 : 0.7;

      const baseWeight = 6 * recencyBoost * ratingBoost;

      countryWeights[record.country] = (countryWeights[record.country] || 0) + baseWeight;
      continentWeights[record.continent] = (continentWeights[record.continent] || 0) + baseWeight * 0.7;

      // Lookup recipe details to get cuisine, mealType, ingredients, categories
      const r = catalog.find(c => c.recipeId === record.recipeId);
      if (r) {
        cuisineWeights[r.cuisine] = (cuisineWeights[r.cuisine] || 0) + baseWeight;
        mealTypeWeights[r.mealType] = (mealTypeWeights[r.mealType] || 0) + baseWeight * 0.5;

        for (const cat of r.categories || []) {
          categoryWeights[cat.toLowerCase()] = (categoryWeights[cat.toLowerCase()] || 0) + baseWeight * 0.6;
        }

        for (const ing of r.ingredients || []) {
          const ingKey = ing.name.toLowerCase();
          ingredientWeights[ingKey] = (ingredientWeights[ingKey] || 0) + 2;
        }
      }
    }

    // Repeated cook multiplier: Very Strong weight
    for (const [rId, count] of Object.entries(recipeCookCounts)) {
      if (count > 1) {
        const r = catalog.find(c => c.recipeId === rId);
        if (r) {
          cuisineWeights[r.cuisine] = (cuisineWeights[r.cuisine] || 0) + count * 5;
          countryWeights[r.country] = (countryWeights[r.country] || 0) + count * 4;
        }
      }
    }

    // Analyze Favorites (Strong signal: +5 weight)
    for (const favId of favorites) {
      const r = catalog.find(c => c.recipeId === favId);
      if (r) {
        cuisineWeights[r.cuisine] = (cuisineWeights[r.cuisine] || 0) + 5;
        countryWeights[r.country] = (countryWeights[r.country] || 0) + 4;
        continentWeights[r.continent] = (continentWeights[r.continent] || 0) + 3;
        for (const cat of r.categories || []) {
          categoryWeights[cat.toLowerCase()] = (categoryWeights[cat.toLowerCase()] || 0) + 3;
        }
      }
    }

    // Analyze Downloaded Recipes (Moderate signal: +4 weight)
    for (const dlId of downloadedIds) {
      const r = catalog.find(c => c.recipeId === dlId);
      if (r) {
        cuisineWeights[r.cuisine] = (cuisineWeights[r.cuisine] || 0) + 4;
        countryWeights[r.country] = (countryWeights[r.country] || 0) + 3;
      }
    }

    // Analyze Searches (Moderate signal: +3 weight)
    for (const q of searchHistory.slice(-10)) {
      const qClean = q.toLowerCase();
      for (const r of catalog) {
        if (
          r.title.toLowerCase().includes(qClean) ||
          r.country.toLowerCase().includes(qClean) ||
          r.cuisine.toLowerCase().includes(qClean)
        ) {
          cuisineWeights[r.cuisine] = (cuisineWeights[r.cuisine] || 0) + 3;
          countryWeights[r.country] = (countryWeights[r.country] || 0) + 3;
        }
      }
    }

    // Analyze Views (Moderate signal: +2 weight)
    for (const viewId of viewedIds.slice(-20)) {
      const r = catalog.find(c => c.recipeId === viewId);
      if (r) {
        cuisineWeights[r.cuisine] = (cuisineWeights[r.cuisine] || 0) + 2;
      }
    }

    // Top preferred cuisines/countries
    const topCuisines = Object.entries(cuisineWeights).sort((a, b) => b[1] - a[1]);
    const topCountries = Object.entries(countryWeights).sort((a, b) => b[1] - a[1]);
    const hasStrongActivity = topCuisines.length > 0 || topCountries.length > 0;

    // 2. Score candidate recipes
    const scored: RecommendationItem[] = [];

    for (const recipe of catalog) {
      let score = 0;
      let primaryReason = 'You may also like';

      // Avoid hard recommending recipes cooked 3+ times in "Recommended for You" to promote discovery
      const cookCount = recipeCookCounts[recipe.recipeId] || 0;
      if (cookCount >= 3) {
        score -= 20;
      }

      // Explicit Preferences Check
      if (preferences) {
        // Allergies hard exclusion
        if (preferences.allergies && preferences.allergies.length > 0) {
          const hasAllergen = preferences.allergies.some(allergy =>
            recipe.allergens?.some(a => a.toLowerCase().includes(allergy.toLowerCase())) ||
            recipe.ingredients.some(i => i.name.toLowerCase().includes(allergy.toLowerCase()))
          );
          if (hasAllergen) continue; // Skip completely
        }

        // Dietary tags boost
        if (preferences.dietary && preferences.dietary.length > 0) {
          const matchesDiet = preferences.dietary.some(d =>
            recipe.dietaryTags.some(tag => tag.toLowerCase() === d.toLowerCase())
          );
          if (matchesDiet) {
            score += 15;
          }
        }

        // Avoid ingredients
        if (preferences.avoidIngredients && preferences.avoidIngredients.length > 0) {
          const hasAvoid = preferences.avoidIngredients.some(avoid =>
            recipe.ingredients.some(i => i.name.toLowerCase().includes(avoid.toLowerCase()))
          );
          if (hasAvoid) score -= 25;
        }

        // Favorite ingredients boost
        if (preferences.favoriteIngredients && preferences.favoriteIngredients.length > 0) {
          const hasFav = preferences.favoriteIngredients.some(fav =>
            recipe.ingredients.some(i => i.name.toLowerCase().includes(fav.toLowerCase()))
          );
          if (hasFav) score += 12;
        }

        // Cooking time match
        if (preferences.preferredCookingTime === 'under_30' && recipe.totalTime <= 30) {
          score += 10;
        }
      }

      // Behavioral affinity scoring
      const cuisineScore = (cuisineWeights[recipe.cuisine] || 0) * 1.5;
      const countryScore = (countryWeights[recipe.country] || 0) * 1.2;
      const continentScore = (continentWeights[recipe.continent] || 0) * 0.8;

      score += cuisineScore + countryScore + continentScore;

      // Match categories
      for (const cat of recipe.categories || []) {
        if (categoryWeights[cat.toLowerCase()]) {
          score += categoryWeights[cat.toLowerCase()] * 0.5;
        }
      }

      // Match shared signature ingredients
      for (const ing of recipe.ingredients || []) {
        const ingScore = ingredientWeights[ing.name.toLowerCase()] || 0;
        if (ingScore > 0) {
          score += Math.min(ingScore, 6);
        }
      }

      // Contextual reason generation
      if (cuisineScore > 10) {
        primaryReason = `Because you enjoy ${recipe.cuisine} dishes`;
      } else if (countryScore > 10) {
        primaryReason = `Because you've explored ${recipe.country}`;
      } else if (hasStrongActivity && continentScore > 10) {
        primaryReason = `Discover more of ${recipe.continent}`;
      } else if (recipe.totalTime <= 30 && preferences?.preferredCookingTime === 'under_30') {
        primaryReason = 'Quick meal for your schedule';
      } else if (recipeCookCounts[recipe.recipeId] === 1) {
        primaryReason = 'Because you cooked this recently';
      } else if (favorites.has(recipe.recipeId)) {
        primaryReason = 'Saved in your favorites';
      } else {
        primaryReason = 'You may also like';
      }

      // Diversity slight randomization to prevent stale repetition
      const subtleJitter = Math.sin(recipe.recipeId.length + recipe.prepTime) * 2;
      score += subtleJitter;

      scored.push({
        recipe,
        score,
        reason: primaryReason
      });
    }

    // Sort by final score descending
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit);
  }
}
