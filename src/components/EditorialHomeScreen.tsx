import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Clock, 
  Flame, 
  ChefHat, 
  Sparkles, 
  ArrowRight, 
  Dices, 
  Download, 
  Check, 
  Star, 
  ChevronRight, 
  ChevronLeft,
  Globe2
} from 'lucide-react';
import { Recipe, Continent } from '../types/recipe';
import { ALL_RECIPES } from '../data/recipes';
import { useAuth } from '../context/AuthContext';
import { useKitchen } from '../context/KitchenContext';
import { RecipeCard } from './RecipeCard';

interface EditorialHomeScreenProps {
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenExplore: (continent?: Continent | 'All') => void;
  onOpenSurpriseMe: () => void;
  onOpenAIChef: () => void;
  onOpenUnlockModal: () => void;
  onOpenSearch: () => void;
}

// Iconic National Dishes for "Popular Around the World"
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
    toggleFavorite,
    downloadRecipe
  } = useKitchen();

  // Curated hero featured recipe
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

  // Recommended for You based on user preferences / starter picks
  const recommendedRecipes = useMemo(() => {
    let pool = ALL_RECIPES;
    const userDietary = profile?.preferences?.dietary;
    if (userDietary && userDietary.length > 0) {
      const matchDietary = pool.filter(r => 
        userDietary.some(p => r.dietaryTags.some(d => d.toLowerCase() === p.toLowerCase()))
      );
      if (matchDietary.length >= 3) pool = matchDietary;
    }
    return pool.slice(0, 6);
  }, [profile]);

  // Your Next Destination: Unexplored countries (not yet in passport)
  const nextDestinationRecipes = useMemo(() => {
    const visitedCodes = new Set(Object.keys(passport));
    const unexplored = ALL_RECIPES.filter(r => !visitedCodes.has(r.countryCode));
    return unexplored.slice(0, 6);
  }, [passport]);

  // Popular Around the World
  const popularRecipes = useMemo(() => {
    const map = new Map(ALL_RECIPES.map(r => [r.recipeId, r]));
    const found = POPULAR_DISH_IDS.map(id => map.get(id)).filter(Boolean) as Recipe[];
    return found.length > 0 ? found : ALL_RECIPES.slice(0, 8);
  }, []);

  // Downloaded for Offline
  const downloadedRecipes = useMemo(() => {
    return ALL_RECIPES.filter(r => r.isStarter || downloadedRecipeIds.has(r.recipeId)).slice(0, 8);
  }, [downloadedRecipeIds]);

  // Cycle hero spotlight safely
  const nextHero = () => {
    if (heroFeaturedRecipes.length === 0) return;
    setHeroIndex((prev) => (prev + 1) % heroFeaturedRecipes.length);
  };

  const prevHero = () => {
    if (heroFeaturedRecipes.length === 0) return;
    setHeroIndex((prev) => (prev - 1 + heroFeaturedRecipes.length) % heroFeaturedRecipes.length);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-24 animate-in fade-in duration-300 select-none">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO SECTION: WHERE ARE WE EATING TODAY?                    */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-stone-800/80 bg-gradient-to-b from-stone-900/60 via-stone-950 to-stone-950 pt-4 pb-8 sm:pt-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Editorial Kicker & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800/60">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                DAILY CULINARY EXPEDITION
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-100 tracking-tight mt-0.5">
                WHERE ARE WE EATING TODAY?
              </h2>
            </div>

            {/* Quick Surprise Me CTA in Header */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenSurpriseMe}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
              >
                <Dices className="w-4 h-4" />
                <span>🎲 Surprise Me</span>
              </button>
              <button
                onClick={() => onOpenExplore('All')}
                className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <span>Browse World Atlas</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>

          {/* Large Editorial Hero Feature Showcase */}
          <div className="mt-6 relative rounded-3xl overflow-hidden border border-stone-800 bg-stone-900 shadow-2xl group flex flex-col justify-end min-h-[460px] sm:min-h-[420px] lg:min-h-[460px]">
            
            {/* Background Hero Image */}
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-stone-950">
              <img
                src={heroRecipe.image}
                alt={heroRecipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 sm:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/50 to-transparent" />
            </div>

            {/* Hero Content Overlay */}
            <div className="relative z-10 p-5 sm:p-8 lg:p-12 flex flex-col justify-between h-full min-h-[460px] sm:min-h-[420px] pointer-events-none">
              
              {/* Top Country Flag & Origin Tag */}
              <div className="flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-950/85 backdrop-blur-md border border-stone-800 text-xs font-bold text-stone-200">
                  <span className="text-base">{heroRecipe.countryCode === 'MA' ? '🇲🇦' : heroRecipe.countryCode === 'JP' ? '🇯🇵' : heroRecipe.countryCode === 'NG' ? '🇳🇬' : heroRecipe.countryCode === 'TH' ? '🇹🇭' : heroRecipe.countryCode === 'IT' ? '🇮🇹' : heroRecipe.countryCode === 'MX' ? '🇲🇽' : '🌍'}</span>
                  <span className="tracking-wide uppercase font-serif text-amber-300">{heroRecipe.country}</span>
                  <span className="text-stone-500">·</span>
                  <span className="text-stone-400 font-normal">{heroRecipe.continent}</span>
                </div>

                {/* Hero Carousel Navigation */}
                <div className="flex items-center gap-1.5 bg-stone-950/80 backdrop-blur-md p-1 rounded-full border border-stone-800 pointer-events-auto">
                  <button
                    onClick={prevHero}
                    aria-label="Previous destination"
                    className="p-1.5 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono px-1.5 text-stone-400">
                    {safeHeroIndex + 1} / {totalHero}
                  </span>
                  <button
                    onClick={nextHero}
                    aria-label="Next destination"
                    className="p-1.5 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Title, Unboxed Metadata & Action */}
              <div className="max-w-2xl space-y-2.5 sm:space-y-3 pointer-events-auto pt-6">
                <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
                  {heroRecipe.title}
                </h3>

                {heroRecipe.alternateName && (
                  <p className="text-xs sm:text-base text-amber-300 font-serif italic">
                    {heroRecipe.alternateName}
                  </p>
                )}

                {/* Unboxed Metadata with · separator */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-stone-300 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {heroRecipe.totalTime} min
                  </span>
                  <span aria-hidden="true" className="text-stone-500">·</span>
                  <span>{heroRecipe.difficulty}</span>
                  <span aria-hidden="true" className="text-stone-500">·</span>
                  <span>{heroRecipe.spiceLevel === 0 ? 'Mild' : `Spice ${heroRecipe.spiceLevel}/5`}</span>
                  <span aria-hidden="true" className="text-stone-500">·</span>
                  <span className="text-emerald-400 font-semibold">
                    {heroRecipe.isStarter || downloadedRecipeIds.has(heroRecipe.recipeId) ? 'Offline Ready' : 'Global Collection'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-300 line-clamp-2 leading-relaxed max-w-xl">
                  {heroRecipe.description}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => onSelectRecipe(heroRecipe)}
                    className="flex-1 sm:flex-none justify-center px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>START COOKING</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextHero}
                    className="sm:hidden px-4 py-3 rounded-2xl bg-stone-950/80 border border-stone-800 text-stone-300 text-xs font-semibold"
                  >
                    Next Dish →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN CURATED EDITORIAL CONTENT SHELVES                      */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 mt-8 sm:mt-12">

        {/* ----------------------------------------------------------- */}
        {/* SECTION: Recommended for You                                */}
        {/* ----------------------------------------------------------- */}
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b border-stone-800/80 pb-3">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
                TAILORED PALATE
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 mt-0.5">
                Recommended for You
              </h3>
            </div>
            <button
              onClick={() => onOpenExplore('All')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 group"
            >
              <span>Explore Collection</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedRecipes.map(recipe => (
              <RecipeCard
                key={recipe.recipeId}
                recipe={recipe}
                isFavorite={favorites.has(recipe.recipeId)}
                isDownloaded={downloadedRecipeIds.has(recipe.recipeId)}
                isPremiumUser={isPremium}
                onSelect={(r) => onSelectRecipe(r)}
                onToggleFavorite={(id, e) => {
                  e.stopPropagation();
                  toggleFavorite(id);
                }}
                onDownload={(id, e) => {
                  e.stopPropagation();
                  downloadRecipe(id);
                }}
                onOpenUnlockModal={onOpenUnlockModal}
              />
            ))}
          </div>
        </section>

        {/* ----------------------------------------------------------- */}
        {/* SECTION: Continue Cooking & Recently Cooked                 */}
        {/* ----------------------------------------------------------- */}
        {recentlyCookedRecipes.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between border-b border-stone-800/80 pb-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
                  YOUR KITCHEN ADVENTURES
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 mt-0.5">
                  Recently Cooked
                </h3>
              </div>
              <span className="text-xs text-stone-400">
                {cookingHistory.length} dishes prepared
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentlyCookedRecipes.map(({ recipe, entry }) => (
                <div
                  key={entry.id}
                  onClick={() => onSelectRecipe(recipe)}
                  className="relative rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 p-4 transition-all cursor-pointer group shadow-lg flex items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-950 shrink-0">
                    <img
                      src={entry.photoUrl || recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <span>{recipe.country}</span>
                      <span>•</span>
                      <span>{new Date(entry.cookedAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm sm:text-base text-stone-100 truncate group-hover:text-amber-400 transition-colors">
                      {recipe.title}
                    </h4>
                    {entry.rating && (
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        {[...Array(entry.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ----------------------------------------------------------- */}
        {/* SECTION: Your Next Destination (Unexplored Countries)       */}
        {/* ----------------------------------------------------------- */}
        {nextDestinationRecipes.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between border-b border-stone-800/80 pb-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
                  UNEXPLORED TERRITORIES
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 mt-0.5">
                  Your Next Destination
                </h3>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Cook and collect new Food Passport stamps
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {nextDestinationRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.recipeId}
                  recipe={recipe}
                  isFavorite={favorites.has(recipe.recipeId)}
                  isDownloaded={downloadedRecipeIds.has(recipe.recipeId)}
                  isPremiumUser={isPremium}
                  onSelect={(r) => onSelectRecipe(r)}
                  onToggleFavorite={(id, e) => {
                    e.stopPropagation();
                    toggleFavorite(id);
                  }}
                  onDownload={(id, e) => {
                    e.stopPropagation();
                    downloadRecipe(id);
                  }}
                  onOpenUnlockModal={onOpenUnlockModal}
                />
              ))}
            </div>
          </section>
        )}

        {/* ----------------------------------------------------------- */}
        {/* SECTION: Popular Around the World                           */}
        {/* ----------------------------------------------------------- */}
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b border-stone-800/80 pb-3">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
                ICONIC DISHES
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 mt-0.5">
                Popular Around the World
              </h3>
            </div>
            <button
              onClick={() => onOpenExplore('All')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 group"
            >
              <span>See All</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularRecipes.map(recipe => (
              <RecipeCard
                key={recipe.recipeId}
                recipe={recipe}
                isFavorite={favorites.has(recipe.recipeId)}
                isDownloaded={downloadedRecipeIds.has(recipe.recipeId)}
                isPremiumUser={isPremium}
                onSelect={(r) => onSelectRecipe(r)}
                onToggleFavorite={(id, e) => {
                  e.stopPropagation();
                  toggleFavorite(id);
                }}
                onDownload={(id, e) => {
                  e.stopPropagation();
                  downloadRecipe(id);
                }}
                onOpenUnlockModal={onOpenUnlockModal}
              />
            ))}
          </div>
        </section>

        {/* ----------------------------------------------------------- */}
        {/* SECTION: Downloaded for Offline                             */}
        {/* ----------------------------------------------------------- */}
        <section className="space-y-4 p-6 sm:p-8 rounded-3xl bg-stone-900/50 border border-stone-800/90">
          <div className="flex items-end justify-between border-b border-stone-800/80 pb-3">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                OFFLINE COOKING VAULT
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 mt-0.5">
                Downloaded for Offline
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Always available in your kitchen without internet connection.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full">
              {downloadedRecipes.length} Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {downloadedRecipes.map(recipe => (
              <RecipeCard
                key={recipe.recipeId}
                recipe={recipe}
                isFavorite={favorites.has(recipe.recipeId)}
                isDownloaded={true}
                isPremiumUser={isPremium}
                onSelect={(r) => onSelectRecipe(r)}
                onToggleFavorite={(id, e) => {
                  e.stopPropagation();
                  toggleFavorite(id);
                }}
                onDownload={(id, e) => {
                  e.stopPropagation();
                  downloadRecipe(id);
                }}
                onOpenUnlockModal={onOpenUnlockModal}
              />
            ))}
          </div>
        </section>

        {/* ----------------------------------------------------------- */}
        {/* EDITORIAL BANNER: EXPLORE THE ENTIRE GLOBE                  */}
        {/* ----------------------------------------------------------- */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/30 via-stone-900 to-stone-950 border border-amber-500/30 p-8 sm:p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Globe2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl sm:text-4xl font-bold text-stone-100">
            300+ Authentic Recipes Across 50+ Countries
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
            Search by ingredients you have at home, explore regional culinary traditions, and bring global kitchens to your dinner table.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenExplore('All')}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all"
            >
              Open Full World Atlas
            </button>
            <button
              onClick={onOpenSurpriseMe}
              className="px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-stone-200 border border-stone-800 font-semibold text-xs sm:text-sm transition-all"
            >
              🎲 Surprise Me
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
