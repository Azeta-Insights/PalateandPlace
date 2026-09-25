import { Recipe } from '../src/types/recipe';
import { generatePremiumRecipes } from '../src/data/premiumRecipeGenerator';

// In-memory server cache of full premium recipes
let CACHED_FULL_PREMIUM_RECIPES: Recipe[] | null = null;

export function getAllFullPremiumRecipes(): Recipe[] {
  if (!CACHED_FULL_PREMIUM_RECIPES) {
    CACHED_FULL_PREMIUM_RECIPES = generatePremiumRecipes();
  }
  return CACHED_FULL_PREMIUM_RECIPES;
}

export function getFullPremiumRecipeById(recipeId: string): Recipe | undefined {
  const all = getAllFullPremiumRecipes();
  return all.find(r => r.recipeId === recipeId);
}

export function getFullPremiumRecipesBatch(recipeIds: string[]): Recipe[] {
  const all = getAllFullPremiumRecipes();
  const idSet = new Set(recipeIds);
  return all.filter(r => idSet.has(r.recipeId));
}

// Strip sensitive ingredients & steps for client-side catalog preview
export function getPremiumCatalogSummaries(): Recipe[] {
  const all = getAllFullPremiumRecipes();
  return all.map(r => ({
    recipeId: r.recipeId,
    title: r.title,
    alternateName: r.alternateName,
    country: r.country,
    countryCode: r.countryCode,
    continent: r.continent,
    region: r.region,
    cuisine: r.cuisine,
    description: r.description,
    culturalBackground: r.culturalBackground,
    mealType: r.mealType,
    categories: r.categories,
    dietaryTags: r.dietaryTags,
    allergens: r.allergens,
    // Sensitive details stripped for unentitled bundle
    ingredients: [],
    preparationSteps: [],
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    totalTime: r.totalTime,
    servings: r.servings,
    difficulty: r.difficulty,
    equipment: r.equipment,
    cookingTips: [],
    substitutions: [],
    servingSuggestions: r.servingSuggestions,
    storageInstructions: r.storageInstructions,
    image: r.image,
    isStarter: false,
    isPremium: true,
    offlineAvailable: false,
    searchTags: r.searchTags,
    spiceLevel: r.spiceLevel,
    estimatedCost: r.estimatedCost
  }));
}
