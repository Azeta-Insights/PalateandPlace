import { Recipe } from '../types/recipe.js';
import { generatePremiumRecipes } from './premiumRecipeGenerator.js';

// Returns the complete curated authentic recipes across all global regions
export function generatePremiumSummaries(): Recipe[] {
  return generatePremiumRecipes();
}
