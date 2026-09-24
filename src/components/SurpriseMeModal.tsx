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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#FBF9F5] rounded-3xl border border-[#E8E1D7] shadow-2xl overflow-y-auto max-h-[92dvh] touch-scroll animate-in zoom-in-95 duration-200"
      >
        {/* Header Ribbon */}
        <div className="p-4 border-b border-[#E8E1D7] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F7F4EE] text-[#C85A32] flex items-center justify-center border border-[#E8E1D7]">
              <Dices className={`w-4 h-4 ${isShuffling ? 'animate-spin text-[#C85A32]' : ''}`} />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-[#231B15]">
                Surprise Culinary Journey
              </h3>
              <p className="text-[11px] text-[#8E8277]">
                A curated adventure matched to your palate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8277] hover:text-[#231B15] hover:bg-[#F4F0E8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Card Destination */}
        <div className="p-6 space-y-5">
          {/* Destination Callout */}
          <div className="text-center space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-[#C85A32] font-semibold">
              TONIGHT'S DESTINATION
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{selectedRecipe.countryCode === 'NG' ? '🇳🇬' : selectedRecipe.countryCode === 'TH' ? '🇹🇭' : selectedRecipe.countryCode === 'MA' ? '🇲🇦' : selectedRecipe.countryCode === 'IT' ? '🇮🇹' : selectedRecipe.countryCode === 'JP' ? '🇯🇵' : selectedRecipe.countryCode === 'MX' ? '🇲🇽' : '🌍'}</span>
              <h2 className="font-serif text-3xl font-bold text-[#231B15] uppercase tracking-tight">
                {selectedRecipe.country}
              </h2>
            </div>
            {isUnexplored && (
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F2F5EC] border border-[#D5DEBF] text-[11px] font-semibold text-[#5C6B38] mt-1">
                <Compass className="w-3 h-3" />
                <span>New Destination • Stamp your Passport!</span>
              </div>
            )}
          </div>

          {/* Recipe Card Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-[#E8E1D7] bg-white group shadow-sm">
            <div className="aspect-[16/9] w-full overflow-hidden bg-[#F4F0E8]">
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.title}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  isShuffling ? 'blur-sm scale-105 opacity-70' : 'group-hover:scale-105'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#231B15] via-[#231B15]/30 to-transparent" />
            </div>

            <div className="absolute bottom-3 inset-x-4">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {selectedRecipe.title}
              </h3>
              {selectedRecipe.alternateName && (
                <p className="text-xs text-[#E8DAB7] italic">
                  {selectedRecipe.alternateName}
                </p>
              )}

              {/* Clean metadata */}
              <div className="flex items-center gap-2 text-xs text-[#F4F0E8] mt-1.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#E8DAB7]" />
                  {selectedRecipe.totalTime} min
                </span>
                <span aria-hidden="true" className="text-[#8E8277]">·</span>
                <span className="flex items-center gap-1">
                  <ChefHat className="w-3.5 h-3.5 text-[#E8DAB7]" />
                  {selectedRecipe.difficulty}
                </span>
                <span aria-hidden="true" className="text-[#8E8277]">·</span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#E8DAB7]" />
                  {selectedRecipe.spiceLevel === 0 ? 'Mild' : `Spice ${selectedRecipe.spiceLevel}/5`}
                </span>
              </div>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-[#5E5248] line-clamp-2 leading-relaxed italic text-center px-2">
            "{selectedRecipe.description}"
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleRollDice}
              disabled={isShuffling}
              className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-[#F4F0E8] active:scale-95 text-[#5E5248] hover:text-[#231B15] border border-[#E8E1D7] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
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
              className="flex-1 py-3 px-4 rounded-xl bg-[#231B15] hover:bg-[#3D322A] active:scale-95 text-[#FBF9F5] text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <span>LET'S COOK</span>
              <ArrowRight className="w-4 h-4 text-[#E8DAB7]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
