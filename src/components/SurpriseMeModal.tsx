import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Dices, 
  Clock, 
  Flame, 
  ChefHat, 
  Compass, 
  ArrowRight,
  RotateCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Recipe } from '../types/recipe';
import { ALL_RECIPES, ALL_STARTER_RECIPES } from '../data/recipes';
import { useAuth } from '../context/AuthContext';
import { useKitchen } from '../context/KitchenContext';

interface SurpriseMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenUnlock?: () => void;
}

export const SurpriseMeModal: React.FC<SurpriseMeModalProps> = ({
  isOpen,
  onClose,
  onSelectRecipe
}) => {
  const { profile, isPremium, isOnline } = useAuth();
  const { passport, cookingHistory, downloadedRecipeIds } = useKitchen();

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  // Accessible recipe pool
  const candidatePool = useMemo(() => {
    // If offline, only consider downloaded & starter recipes
    if (!isOnline) {
      return ALL_RECIPES.filter(r => r.isStarter || downloadedRecipeIds.has(r.recipeId));
    }
    // If user is premium, all recipes are candidate; if free, starters
    if (isPremium) {
      return ALL_RECIPES;
    }
    return ALL_STARTER_RECIPES;
  }, [isPremium, isOnline, downloadedRecipeIds]);

  // Intelligent Surprise Me Algorithm
  const pickSurpriseRecipe = () => {
    if (candidatePool.length === 0) return null;

    const visitedCountryCodes = new Set(Object.keys(passport));
    const recentlyCookedIds = new Set(cookingHistory.slice(0, 5).map(h => h.recipeId));
    const userDietary = profile?.preferences?.dietary || [];

    // Weighted scoring of recipes
    const scoredRecipes = candidatePool.map(recipe => {
      let weight = 10;

      // 1. Heavy boost for countries NOT yet visited/stamped
      if (!visitedCountryCodes.has(recipe.countryCode)) {
        weight += 25;
      }

      // 2. Heavy penalty for recently cooked dishes (avoid repeats)
      if (recentlyCookedIds.has(recipe.recipeId)) {
        weight = Math.max(1, weight - 20);
      }

      // 3. User dietary preference alignment
      if (userDietary.length > 0) {
        const matchesAll = userDietary.every(dp => 
          recipe.dietaryTags.some(d => d.toLowerCase() === dp.toLowerCase())
        );
        if (matchesAll) {
          weight += 15;
        } else {
          const isVegOnly = userDietary.some(p => p.toLowerCase().includes('vegan') || p.toLowerCase().includes('veg'));
          if (isVegOnly && !recipe.dietaryTags.some(d => d.toLowerCase().includes('veg'))) {
            weight = 0; // Filter out completely
          }
        }
      }

      // 4. User spice preference alignment
      if (profile?.preferences?.spicePreference) {
        const spicePref = profile.preferences.spicePreference.toLowerCase();
        if (spicePref === 'mild' && recipe.spiceLevel <= 1) weight += 10;
        if (spicePref === 'hot' && recipe.spiceLevel >= 3) weight += 10;
      }

      return { recipe, weight };
    }).filter(item => item.weight > 0);

    const pool = scoredRecipes.length > 0 ? scoredRecipes : candidatePool.map(r => ({ recipe: r, weight: 10 }));

    // Weighted random selection
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let randomVal = Math.random() * totalWeight;

    for (const item of pool) {
      randomVal -= item.weight;
      if (randomVal <= 0) {
        return item.recipe;
      }
    }

    return pool[0].recipe;
  };

  const handleRollDice = () => {
    setIsShuffling(true);
    let count = 0;
    const interval = setInterval(() => {
      const tempPick = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      setSelectedRecipe(tempPick);
      count++;
      if (count > 12) {
        clearInterval(interval);
        const finalPick = pickSurpriseRecipe();
        setSelectedRecipe(finalPick);
        setIsShuffling(false);
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {
          // Safe fallback
        }
      }
    }, 80);
  };

  useEffect(() => {
    if (isOpen) {
      handleRollDice();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen || !selectedRecipe) return null;

  const isUnexplored = !passport[selectedRecipe.countryCode];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-stone-950 rounded-3xl border border-stone-800 shadow-2xl overflow-y-auto max-h-[92dvh] touch-scroll animate-in zoom-in-95 duration-200"
      >
        {/* Header Ribbon */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Dices className={`w-4 h-4 ${isShuffling ? 'animate-spin text-amber-300' : ''}`} />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-stone-100">
                TAKE ME SOMEWHERE
              </h3>
              <p className="text-[11px] text-stone-400">
                Random culinary adventure matched to your palate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Card Destination */}
        <div className="p-6 space-y-5">
          {/* Destination Callout */}
          <div className="text-center space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
              TONIGHT WE'RE GOING TO
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{selectedRecipe.countryCode === 'NG' ? '🇳🇬' : selectedRecipe.countryCode === 'TH' ? '🇹🇭' : selectedRecipe.countryCode === 'MA' ? '🇲🇦' : selectedRecipe.countryCode === 'IT' ? '🇮🇹' : selectedRecipe.countryCode === 'JP' ? '🇯🇵' : selectedRecipe.countryCode === 'MX' ? '🇲🇽' : '🌍'}</span>
              <h2 className="font-serif text-3xl font-black text-stone-100 uppercase tracking-tight">
                {selectedRecipe.country}
              </h2>
            </div>
            {isUnexplored && (
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[11px] font-semibold text-emerald-400 mt-1">
                <Compass className="w-3 h-3" />
                <span>New Destination • Stamp your Passport!</span>
              </div>
            )}
          </div>

          {/* Recipe Card Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 group shadow-lg">
            <div className="aspect-[16/9] w-full overflow-hidden bg-stone-950">
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.title}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  isShuffling ? 'blur-sm scale-105 opacity-70' : 'group-hover:scale-105'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
            </div>

            <div className="absolute bottom-3 inset-x-4">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {selectedRecipe.title}
              </h3>
              {selectedRecipe.alternateName && (
                <p className="text-xs text-amber-300 italic">
                  {selectedRecipe.alternateName}
                </p>
              )}

              {/* Clean unboxed metadata with bullet separators */}
              <div className="flex items-center gap-2 text-xs text-stone-300 mt-1.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {selectedRecipe.totalTime} min
                </span>
                <span aria-hidden="true" className="text-stone-500">·</span>
                <span className="flex items-center gap-1">
                  <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                  {selectedRecipe.difficulty}
                </span>
                <span aria-hidden="true" className="text-stone-500">·</span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  {selectedRecipe.spiceLevel === 0 ? 'Mild' : `Spice ${selectedRecipe.spiceLevel}/5`}
                </span>
              </div>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed italic text-center px-2">
            "{selectedRecipe.description}"
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleRollDice}
              disabled={isShuffling}
              className="flex-1 py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-stone-300 border border-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{isShuffling ? 'Spinning...' : '🎲 Spin Again'}</span>
            </button>

            <button
              onClick={() => {
                onSelectRecipe(selectedRecipe);
                onClose();
              }}
              disabled={isShuffling}
              className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>LET'S COOK</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
