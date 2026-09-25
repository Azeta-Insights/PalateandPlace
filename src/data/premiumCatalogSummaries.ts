import { Recipe } from '../types/recipe';
import { generatePremiumRecipes } from './premiumRecipeGenerator';

// Returns the complete curated authentic recipes across all global regions
export function generatePremiumSummaries(): Recipe[] {
  return generatePremiumRecipes();
}
