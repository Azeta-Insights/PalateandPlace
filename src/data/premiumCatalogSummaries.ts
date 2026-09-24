import { Recipe } from '../types/recipe';
import { generatePremiumRecipes } from './premiumRecipeGenerator';

// Generates public metadata summaries for browsing/searching without exposing proprietary recipes in initial JS bundle
export function generatePremiumSummaries(): Recipe[] {
  const fullPremiumRecipes = generatePremiumRecipes();

  return fullPremiumRecipes.map(r => ({
    ...r,
    // When in summary mode, omit full preparation steps and full quantities to keep initial bundle lightweight
    ingredients: r.ingredients.map(i => ({ name: i.name, amount: 0, unit: '' })),
    preparationSteps: []
  }));
}
