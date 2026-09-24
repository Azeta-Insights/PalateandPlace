import { Recipe, Continent, CookingRecord, UserProfile } from '../types/recipe';

export interface PersonalizationSignals {
  cookingHistory?: CookingRecord[];
  favorites?: Set<string>;
  downloadedIds?: Set<string>;
  passport?: Record<string, any>;
  preferences?: UserProfile['preferences'];
  searchHistory?: string[];
}

export interface RecommendedRecipeItem {
  recipe: Recipe;
  score: number;
  reasonTag: string;
  reasonDescription: string;
}

export class RecommendationEngine {
  /**
   * Generates tailored, behavior-driven recipe recommendations.
   * Leverages real user cooking signals, favorites, passport stamps, and flavor preferences.
   */
  static getPersonalizedRecommendations(
    allRecipes: Recipe[],
    signals: PersonalizationSignals,
    limit: number = 8
  ): RecommendedRecipeItem[] {
    const {
      cookingHistory = [],
      favorites = new Set(),
      downloadedIds = new Set(),
      passport = {},
      preferences = {
        dietary: [],
        allergies: [],
        favoriteIngredients: [],
        avoidIngredients: [],
        preferredCookingTime: 'any',
        spicePreference: 'medium'
      }
    } = signals;

    // 1. Extract high-signal country, cuisine, and ingredient vectors
    const cookedRecipeIds = new Set(cookingHistory.map(h => h.recipeId));
    const cookedCountries = new Map<string, number>();
    const cookedContinents = new Map<string, number>();
    const cookedCuisines = new Map<string, number>();

    cookingHistory.forEach(h => {
      if (h.country) cookedCountries.set(h.country, (cookedCountries.get(h.country) || 0) + 1);
      if (h.continent) cookedContinents.set(h.continent, (cookedContinents.get(h.continent) || 0) + 1);
    });

    // Map recipes by ID
    const recipeMap = new Map<string, Recipe>(allRecipes.map(r => [r.recipeId, r]));

    // Find favorite cuisines from favorited recipes
    favorites.forEach(favId => {
      const rec = recipeMap.get(favId);
      if (rec) {
        cookedCuisines.set(rec.cuisine, (cookedCuisines.get(rec.cuisine) || 0) + 1.5);
      }
    });

    const recentCooked = cookingHistory.slice(0, 3).map(h => h.recipeTitle);
    const primaryRecentCook = recentCooked[0];

    // 2. Score candidates
    const scored: RecommendedRecipeItem[] = [];

    for (const recipe of allRecipes) {
      let score = 50; // baseline score
      let reasonTag = 'Curated for You';
      let reasonDesc = `A classic representative of ${recipe.country} gastronomy.`;

      // HARD FILTER: Allergies (zero tolerance)
      if (preferences.allergies && preferences.allergies.length > 0) {
        const hasAllergen = recipe.allergens.some(a =>
          preferences.allergies!.some(userAllergen =>
            a.toLowerCase().includes(userAllergen.toLowerCase())
          )
        );
        if (hasAllergen) continue;
      }

      // Dietary preference alignment
      if (preferences.dietary && preferences.dietary.length > 0) {
        const matchesDietary = recipe.dietaryTags.some(tag =>
          preferences.dietary!.some(d => tag.toLowerCase() === d.toLowerCase())
        );
        if (matchesDietary) {
          score += 25;
          reasonTag = `${preferences.dietary[0]} Pick`;
          reasonDesc = `Matches your ${preferences.dietary[0].toLowerCase()} dietary lifestyle.`;
        }
      }

      // Avoided ingredients penalty
      if (preferences.avoidIngredients && preferences.avoidIngredients.length > 0) {
        const hasAvoided = recipe.ingredients.some(ing =>
          preferences.avoidIngredients!.some(avoid =>
            ing.name.toLowerCase().includes(avoid.toLowerCase())
          )
        );
        if (hasAvoided) score -= 40;
      }

      // Favorite ingredients boost
      if (preferences.favoriteIngredients && preferences.favoriteIngredients.length > 0) {
        const matchingFavs = recipe.ingredients.filter(ing =>
          preferences.favoriteIngredients!.some(fav =>
            ing.name.toLowerCase().includes(fav.toLowerCase())
          )
        );
        if (matchingFavs.length > 0) {
          score += matchingFavs.length * 12;
          reasonTag = `Features ${matchingFavs[0].name}`;
          reasonDesc = `Crafted with ${matchingFavs[0].name.toLowerCase()}, one of your favorites.`;
        }
      }

      // Cooking time affinity
      if (preferences.preferredCookingTime === 'quick' && recipe.totalTime <= 30) {
        score += 20;
        reasonTag = 'Quick Weeknight';
        reasonDesc = `Ready in just ${recipe.totalTime} minutes.`;
      } else if (preferences.preferredCookingTime === 'weekend' && recipe.totalTime > 45) {
        score += 15;
        reasonTag = 'Weekend Project';
        reasonDesc = `A rich, slow-simmered weekend project.`;
      }

      // Behavior Signals: Cooked cuisines / countries
      const countryFrequency = cookedCountries.get(recipe.country) || 0;
      const cuisineFrequency = cookedCuisines.get(recipe.cuisine) || 0;
      const continentFrequency = cookedContinents.get(recipe.continent) || 0;

      if (primaryRecentCook && (countryFrequency > 0 || cuisineFrequency > 0)) {
        score += 35;
        reasonTag = `Because you enjoyed ${primaryRecentCook}`;
        reasonDesc = `Shares the aromatic flavor profile and spices of ${recipe.cuisine} cuisine.`;
      } else if (continentFrequency > 0 && countryFrequency === 0) {
        // Encourage exploring adjacent countries in the same continent
        score += 22;
        reasonTag = `Next stop in ${recipe.continent}`;
        reasonDesc = `Expand your palate with authentic dishes from ${recipe.country}.`;
      }

      // Favorited item boost
      if (favorites.has(recipe.recipeId)) {
        score += 15;
      }

      // Downloaded offline item boost
      if (downloadedIds.has(recipe.recipeId)) {
        score += 10;
      }

      // Slight diversity penalty if already cooked recently to avoid repetitive feeds
      if (cookedRecipeIds.has(recipe.recipeId)) {
        score -= 10;
      }

      // Spice level alignment
      if (preferences.spicePreference === 'mild' && recipe.spiceLevel <= 1) {
        score += 10;
      } else if (preferences.spicePreference === 'high' && recipe.spiceLevel >= 3) {
        score += 15;
        if (reasonTag === 'Curated for You') {
          reasonTag = 'Bold Spice Profile';
          reasonDesc = `Delivers the vibrant, fiery heat you prefer.`;
        }
      }

      scored.push({
        recipe,
        score,
        reasonTag,
        reasonDescription: reasonDesc
      });
    }

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Variety filter: ensure no more than 2 recipes from the exact same country in the top recommendations
    const countryCounts = new Map<string, number>();
    const diversePicks: RecommendedRecipeItem[] = [];

    for (const item of scored) {
      const count = countryCounts.get(item.recipe.country) || 0;
      if (count < 2) {
        diversePicks.push(item);
        countryCounts.set(item.recipe.country, count + 1);
      }
      if (diversePicks.length >= limit) break;
    }

    return diversePicks.length > 0 ? diversePicks : scored.slice(0, limit);
  }

  /**
   * Identifies next culinary destinations from countries the user has not yet cooked.
   */
  static getNextDestinations(
    allRecipes: Recipe[],
    passport: Record<string, any>,
    limit: number = 8
  ): Recipe[] {
    const visitedCodes = new Set(Object.keys(passport));
    const unexplored = allRecipes.filter(r => !visitedCodes.has(r.countryCode));

    // Shuffle slightly for fresh inspiration while keeping starter & iconic dishes prioritized
    const sorted = [...unexplored].sort((a, b) => (b.isStarter ? 1 : 0) - (a.isStarter ? 1 : 0));
    return sorted.slice(0, limit);
  }

  /**
   * Fast weeknight recipes (under 30 minutes total time).
   */
  static getQuickWeeknightDinners(
    allRecipes: Recipe[],
    limit: number = 8
  ): Recipe[] {
    return allRecipes
      .filter(r => r.totalTime <= 30 && r.mealType !== 'Dessert')
      .slice(0, limit);
  }

  /**
   * Finds recipes with similar regional herbs, proteins, and cooking techniques.
   */
  static getSimilarRecipes(
    targetRecipe: Recipe,
    allRecipes: Recipe[],
    limit: number = 4
  ): Recipe[] {
    return allRecipes
      .filter(r => r.recipeId !== targetRecipe.recipeId)
      .map(r => {
        let similarity = 0;
        if (r.continent === targetRecipe.continent) similarity += 3;
        if (r.cuisine === targetRecipe.cuisine) similarity += 4;
        if (r.mealType === targetRecipe.mealType) similarity += 2;
        if (Math.abs(r.spiceLevel - targetRecipe.spiceLevel) <= 1) similarity += 2;
        return { recipe: r, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.recipe);
  }
}
