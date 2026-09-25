import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Clock, 
  Flame, 
  ChefHat, 
  Sparkles, 
  ArrowRight, 
  Dices, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Globe2,
  BookOpen,
  MapPin,
  Heart
} from 'lucide-react';
import { Recipe, Continent } from '../types/recipe';
import { ALL_RECIPES } from '../data/recipes';
import { useAuth } from '../context/AuthContext';
import { useKitchen } from '../context/KitchenContext';
import { PersonalizationService } from '../services/personalizationService';
import { RecipeCard } from './RecipeCard';

interface EditorialHomeScreenProps {
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenExplore: (continent?: Continent | 'All') => void;
  onOpenSurpriseMe: () => void;
  onOpenAIChef: () => void;
  onOpenUnlockModal: () => void;
  onOpenSearch: () => void;
}

// Curated iconic global dishes for Discovery Spotlight
const POPULAR_DISH_IDS = [
  'ng-jollof-rice',
  'jp-tokyo-ramen',
  'it-carbonara',
  'th-pad-thai',
  'mx-birria-tacos',
  'ma-chicken-tagine',
  'in-butter-chicken',
  'gr-moussaka'
];

export const EditorialHomeScreen: React.FC<EditorialHomeScreenProps> = ({
  onSelectRecipe,
  onOpenExplore,
  onOpenSurpriseMe,
  onOpenUnlockModal
}) => {
  const { profile, isPremium } = useAuth();
  const {
    favorites,
    passport,
    cookingHistory,
    downloadedRecipeIds,
    viewedIds,
    searchHistory,
    toggleFavorite,
    downloadRecipe
  } = useKitchen();

  // Curated hero featured recipe index
  const [heroIndex, setHeroIndex] = useState(0);

  // Curated hero pool
  const heroFeaturedRecipes = useMemo(() => {
    const list = [
      ALL_RECIPES.find(r => r.recipeId === 'ma-chicken-tagine'),
      ALL_RECIPES.find(r => r.recipeId === 'jp-tokyo-ramen'),
      ALL_RECIPES.find(r => r.recipeId === 'ng-jollof-rice'),
      ALL_RECIPES.find(r => r.recipeId === 'th-pad-thai'),
      ALL_RECIPES.find(r => r.recipeId === 'it-carbonara'),
      ALL_RECIPES.find(r => r.recipeId === 'mx-birria-tacos')
    ].filter(Boolean) as Recipe[];

    return list.length > 0 ? list : ALL_RECIPES.slice(0, 6);
  }, []);

  const totalHero = heroFeaturedRecipes.length || 1;
  const safeHeroIndex = Math.min(heroIndex, totalHero - 1);
  const heroRecipe = heroFeaturedRecipes[safeHeroIndex] || ALL_RECIPES[0];

  // Recently Cooked recipes
  const recentlyCookedRecipes = useMemo(() => {
    if (cookingHistory.length === 0) return [];
    const recipeMap = new Map(ALL_RECIPES.map(r => [r.recipeId, r]));
    return cookingHistory
      .slice(0, 6)
      .map(entry => ({
        recipe: recipeMap.get(entry.recipeId),
        entry
      }))
      .filter(item => Boolean(item.recipe)) as Array<{ recipe: Recipe; entry: typeof cookingHistory[0] }>;
  }, [cookingHistory]);

  // True Behavior-Driven Personalization
  const recommendedItems = useMemo(() => {
    return PersonalizationService.getPersonalizedRecommendations(
      {
        cookingHistory,
        favorites,
        downloadedIds: downloadedRecipeIds,
        viewedIds,
        searchHistory,
        preferences: profile?.preferences,
        passportCountries: passport
      },
      ALL_RECIPES,
      8
    );
  }, [cookingHistory, favorites, downloadedRecipeIds, viewedIds, searchHistory, profile?.preferences, passport]);

  // Your Next Destination: Unexplored countries from passport
  const nextDestinationRecipes = useMemo(() => {
    const visitedCodes = new Set(Object.keys(passport));
    const unexplored = ALL_RECIPES.filter(r => !visitedCodes.has(r.countryCode));
    return unexplored.slice(0, 8);
  }, [passport]);

  // Popular Around the World
  const popularRecipes = useMemo(() => {
    const map = new Map(ALL_RECIPES.map(r => [r.recipeId, r]));
    const found = POPULAR_DISH_IDS.map(id => map.get(id)).filter(Boolean) as Recipe[];
    return found.length > 0 ? found : ALL_RECIPES.slice(0, 8);
  }, []);

  // Downloaded / Starter for Offline
  const offlineReadyRecipes = useMemo(() => {
    return ALL_RECIPES.filter(r => r.isStarter || downloadedRecipeIds.has(r.recipeId)).slice(0, 8);
  }, [downloadedRecipeIds]);

  // Cycle hero spotlight
  const nextHero = () => {
    if (heroFeaturedRecipes.length === 0) return;
    setHeroIndex((prev) => (prev + 1) % heroFeaturedRecipes.length);
  };

  const prevHero = () => {
    if (heroFeaturedRecipes.length === 0) return;
    setHeroIndex((prev) => (prev - 1 + heroFeaturedRecipes.length) % heroFeaturedRecipes.length);
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#29231E] pb-24 animate-in fade-in duration-200">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. EDITORIAL HERO SECTION                                     */}
      {/* ------------------------------------------------------------- */}
      <section className="relative border-b border-[#E6DEC8] bg-[#FFFDF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          
          {/* Magazine Sub-Header Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-[#E6DEC8] text-xs font-sans">
            <div className="flex items-center gap-2 text-[#71675D]">
              <span className="font-bold tracking-widest text-[#B85C3A] uppercase">Daily Culinary Digest</span>
              <span className="text-[#D3C7B5]">•</span>
              <span>Issue {new Date().getFullYear()}</span>
              <span className="text-[#D3C7B5]">•</span>
              <span>300+ Authentic Global Dishes</span>
            </div>
            <div className="flex items-center gap-3 text-[#71675D]">
              <span>Discover Places Through Food</span>
            </div>
          </div>

          {/* Hero Feature Grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Editorial Story & Title */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#E6DEC8] text-xs font-medium text-[#71675D]">
                <MapPin className="w-3.5 h-3.5 text-[#B85C3A]" />
                <span className="uppercase tracking-wider font-semibold text-[#29231E]">{heroRecipe.country}</span>
                <span className="text-[#D3C7B5]">•</span>
                <span>{heroRecipe.region || heroRecipe.continent}</span>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold tracking-widest text-[#B85C3A] uppercase font-sans">Where are we eating today?</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#29231E] leading-[1.08] tracking-tight">
                  {heroRecipe.title}
                </h1>
                <p className="text-sm sm:text-base text-[#71675D] leading-relaxed line-clamp-3 font-sans">
                  {heroRecipe.culturalBackground || heroRecipe.description}
                </p>
              </div>

              {/* Dish Meta */}
              <div className="flex flex-wrap items-center gap-4 py-3 border-y border-[#E6DEC8] text-xs text-[#71675D] font-sans">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#B85C3A]" />
                  <span>{heroRecipe.totalTime} min total</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#B85C3A]" />
                  <span>{heroRecipe.difficulty}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-[#68745D]" />
                  <span>{heroRecipe.servings} Servings</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onSelectRecipe(heroRecipe)}
                  className="px-6 py-3.5 rounded-lg bg-[#B85C3A] hover:bg-[#A34F30] text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-all active:scale-98"
                >
                  <span>Start Cooking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenSurpriseMe}
                  className="px-4 py-3.5 rounded-lg bg-[#FAF5EC] hover:bg-[#F2EADB] text-[#29231E] border border-[#E6DEC8] font-medium text-sm flex items-center gap-2 transition-all"
                >
                  <Dices className="w-4 h-4 text-[#B85C3A]" />
                  <span>Surprise Dish</span>
                </button>
              </div>

              {/* Carousel Indicators */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-1.5">
                  {heroFeaturedRecipes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === safeHeroIndex ? 'w-6 bg-[#B85C3A]' : 'w-2 bg-[#E6DEC8]'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevHero}
                    className="p-2 rounded-lg bg-[#FAF5EC] hover:bg-[#F2EADB] border border-[#E6DEC8] text-[#71675D] transition-colors"
                    aria-label="Previous Featured Dish"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextHero}
                    className="p-2 rounded-lg bg-[#FAF5EC] hover:bg-[#F2EADB] border border-[#E6DEC8] text-[#71675D] transition-colors"
                    aria-label="Next Featured Dish"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right: Immersive Dish Photography */}
            <div className="lg:col-span-7">
              <div
                onClick={() => onSelectRecipe(heroRecipe)}
                className="group relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden shadow-md border border-[#E6DEC8] cursor-pointer bg-[#29231E]"
              >
                <img
                  src={heroRecipe.image}
                  alt={heroRecipe.title}
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#29231E]/80 via-transparent to-black/20" />

                {/* Top badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#29231E]/80 backdrop-blur-md text-white text-xs font-medium border border-white/10 flex items-center gap-1.5">
                    <span>{heroRecipe.cuisine} Tradition</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(heroRecipe.recipeId);
                    }}
                    className="p-2 rounded-full bg-[#29231E]/80 backdrop-blur-md text-white hover:text-[#B85C3A] transition-colors border border-white/10"
                    aria-label="Save dish"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.has(heroRecipe.recipeId) ? 'fill-[#B85C3A] text-[#B85C3A]' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Bottom caption overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#FFFDF8]/80 font-sans">{heroRecipe.country}</p>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-white drop-shadow-sm">
                        {heroRecipe.title}
                      </h3>
                    </div>
                    <span className="text-xs bg-[#FFFDF8] text-[#29231E] px-3 py-1.5 rounded-lg font-medium shadow flex items-center gap-1 group-hover:bg-[#B85C3A] group-hover:text-white transition-colors">
                      View Recipe
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. RECOMMENDED FOR YOU (BEHAVIOR-DRIVEN PERSONALIZATION)       */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#E6DEC8]">
          <div>
            <div className="flex items-center gap-2 text-[#B85C3A] text-xs font-bold uppercase tracking-wider mb-1 font-sans">
              <Sparkles className="w-4 h-4" />
              <span>Tailored Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#29231E]">
              Recommended for You
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#71675D] max-w-md font-sans">
            Personalized recipes crafted from your cooking journal, flavor preferences, and regional journeys.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedItems.map((item) => (
            <div key={item.recipe.recipeId} className="flex flex-col">
              <div className="text-[11px] font-medium text-[#B85C3A] mb-1.5 flex items-center gap-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B85C3A]" />
                <span>{item.reason}</span>
              </div>
              <RecipeCard
                recipe={item.recipe}
                isFavorite={favorites.has(item.recipe.recipeId)}
                isDownloaded={downloadedRecipeIds.has(item.recipe.recipeId)}
                isPremiumUser={isPremium}
                onSelect={() => onSelectRecipe(item.recipe)}
                onToggleFavorite={() => toggleFavorite(item.recipe.recipeId)}
                onDownload={() => downloadRecipe(item.recipe)}
                onOpenUnlockModal={onOpenUnlockModal}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. CONTINUE COOKING (RECENT COOKING HISTORY)                   */}
      {/* ------------------------------------------------------------- */}
      {recentlyCookedRecipes.length > 0 && (
        <section className="bg-[#FFFDF8] border-y border-[#E6DEC8] py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E6DEC8]">
              <div>
                <div className="flex items-center gap-2 text-[#68745D] text-xs font-bold uppercase tracking-wider mb-1 font-sans">
                  <BookOpen className="w-4 h-4" />
                  <span>Cooking Journal</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#29231E]">
                  Continue Cooking
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyCookedRecipes.map(({ recipe, entry }) => (
                <div
                  key={entry.id}
                  onClick={() => onSelectRecipe(recipe)}
                  className="group bg-[#FAF5EC] rounded-xl p-4 border border-[#E6DEC8] hover:border-[#B85C3A]/50 transition-all cursor-pointer flex gap-4 items-center"
                >
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#71675D] font-sans">{recipe.country}</p>
                    <h4 className="font-serif font-bold text-base text-[#29231E] group-hover:text-[#B85C3A] transition-colors truncate">
                      {recipe.title}
                    </h4>
                    <p className="text-xs text-[#71675D] mt-1 font-sans">
                      Cooked {new Date(entry.cookedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#8E8277] group-hover:text-[#B85C3A] group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. YOUR NEXT DESTINATION (UNEXPLORED COUNTRIES)                */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#E6DEC8]">
          <div>
            <div className="flex items-center gap-2 text-[#B85C3A] text-xs font-bold uppercase tracking-wider mb-1 font-sans">
              <Compass className="w-4 h-4" />
              <span>Culinary Passport</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#29231E]">
              Your Next Destination
            </h2>
          </div>
          <button
            onClick={() => onOpenExplore('All')}
            className="text-xs sm:text-sm font-semibold text-[#B85C3A] hover:text-[#A34F30] flex items-center gap-1 font-sans"
          >
            Explore all countries
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {nextDestinationRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.recipeId}
              recipe={recipe}
              isFavorite={favorites.has(recipe.recipeId)}
              isDownloaded={downloadedRecipeIds.has(recipe.recipeId)}
              isPremiumUser={isPremium}
              onSelect={() => onSelectRecipe(recipe)}
              onToggleFavorite={() => toggleFavorite(recipe.recipeId)}
              onDownload={() => downloadRecipe(recipe)}
              onOpenUnlockModal={onOpenUnlockModal}
            />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. EXPLORE BY PLACE (CONTINENTS)                               */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-[#FAF5EC] border-y border-[#E6DEC8] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#29231E]">
              Explore by Place
            </h2>
            <p className="text-sm text-[#71675D] mt-2 font-sans">
              Journey across six continents through authentic regional cooking traditions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { continent: 'Africa', count: '65+ Recipes', color: 'bg-[#B85C3A]' },
              { continent: 'Asia', count: '85+ Recipes', color: 'bg-[#68745D]' },
              { continent: 'Europe', count: '70+ Recipes', color: 'bg-[#B18A58]' },
              { continent: 'North America', count: '35+ Recipes', color: 'bg-[#71675D]' },
              { continent: 'South America', count: '30+ Recipes', color: 'bg-[#B85C3A]' },
              { continent: 'Oceania', count: '15+ Recipes', color: 'bg-[#68745D]' }
            ].map((item) => (
              <button
                key={item.continent}
                onClick={() => onOpenExplore(item.continent as Continent)}
                className="group bg-[#FFFDF8] rounded-xl p-5 border border-[#E6DEC8] hover:border-[#B85C3A] transition-all text-center flex flex-col items-center justify-center gap-2 shadow-xs hover:shadow-md"
              >
                <div className={`w-10 h-10 rounded-full ${item.color}/15 flex items-center justify-center text-[#29231E] group-hover:scale-110 transition-transform`}>
                  <Globe2 className="w-5 h-5 text-[#29231E]" />
                </div>
                <span className="font-serif font-bold text-base text-[#29231E] group-hover:text-[#B85C3A] transition-colors">
                  {item.continent}
                </span>
                <span className="text-[11px] text-[#71675D] font-sans">{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. POPULAR AROUND THE WORLD                                   */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#E6DEC8]">
          <div>
            <div className="flex items-center gap-2 text-[#B85C3A] text-xs font-bold uppercase tracking-wider mb-1 font-sans">
              <Globe2 className="w-4 h-4" />
              <span>World Icons</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#29231E]">
              Popular Around the World
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.recipeId}
              recipe={recipe}
              isFavorite={favorites.has(recipe.recipeId)}
              isDownloaded={downloadedRecipeIds.has(recipe.recipeId)}
              isPremiumUser={isPremium}
              onSelect={() => onSelectRecipe(recipe)}
              onToggleFavorite={() => toggleFavorite(recipe.recipeId)}
              onDownload={() => downloadRecipe(recipe)}
              onOpenUnlockModal={onOpenUnlockModal}
            />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. UNLOCK BANNER (IF NOT PREMIUM)                              */}
      {/* ------------------------------------------------------------- */}
      {!isPremium && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="rounded-2xl bg-gradient-to-br from-[#29231E] via-[#352B24] to-[#29231E] text-white p-8 sm:p-12 border border-[#B18A58]/30 shadow-lg relative overflow-hidden">
            <div className="max-w-2xl relative z-10 space-y-4">
              <span className="text-xs font-bold tracking-widest text-[#B18A58] uppercase font-sans">
                Curator Collection
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
                Unlock the World
              </h3>
              <p className="text-sm sm:text-base text-[#D3C7B5] leading-relaxed font-sans">
                300+ recipes across 50+ countries and 6 continents. Download dishes for offline cooking in the kitchen, with AI Chef fair-use access included.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenUnlockModal}
                  className="px-6 py-3 rounded-lg bg-[#B85C3A] hover:bg-[#A34F30] text-white font-medium text-sm transition-all shadow-sm"
                >
                  Unlock Now — ₦2,500 One-Time
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
