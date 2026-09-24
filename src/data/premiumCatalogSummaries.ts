import { Recipe } from '../types/recipe';
import { generatePremiumRecipes } from './premiumRecipeGenerator';

// Returns verified, authentic recipes with full ingredient quantities and preparation steps
export function generatePremiumSummaries(): Recipe[] {
  return generatePremiumRecipes();
}
