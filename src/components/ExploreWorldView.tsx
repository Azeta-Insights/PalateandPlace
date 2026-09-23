import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Search, 
  Compass, 
  Clock, 
  Flame, 
  ChefHat, 
  Sparkles, 
  X, 
  RotateCcw,
  Check,
  UtensilsCrossed
} from 'lucide-react';
import { Recipe, Continent } from '../types/recipe';
import { ALL_RECIPES } from '../data/recipes';
import { RecipeCard } from './RecipeCard';
import { useAuth } from '../context/AuthContext';
import { useKitchen } from '../context/KitchenContext';
import { searchRecipesLocally, searchWithGeminiAI } from '../services/smartSearch';

interface ExploreWorldViewProps {
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenUnlockModal: () => void;
  onOpenSurpriseMe: () => void;
  onOpenAIChef: () => void;
}

const CONTINENTS: Array<{ name: Continent | 'All'; icon: string; count: number; description: string }> = [
  { name: 'All', icon: '🌍', count: ALL_RECIPES.length, description: 'All Global Dishes' },
  { name: 'Africa', icon: '🌍', count: ALL_RECIPES.filter(r => r.continent === 'Africa').length, description: 'Bold spices, hearty grains & slow stews' },
  { name: 'Asia', icon: '🌏', count: ALL_RECIPES.filter(r => r.continent === 'Asia').length, description: 'Complex aromatics, noodles & balance' },
  { name: 'Europe', icon: '🏛️', count: ALL_RECIPES.filter(r => r.continent === 'Europe').length, description: 'Rich stocks, regional pasta & heirloom bakes' },
  { name: 'North America', icon: '🌮', count: ALL_RECIPES.filter(r => r.continent === 'North America').length, description: 'Coastal seafood, smoke & indigenous heritage' },
  { name: 'South America', icon: '🏔️', count: ALL_RECIPES.filter(r => r.continent === 'South America').length, description: 'Ceviches, fire roasting & Andean grains' },
  { name: 'Oceania', icon: '🏝️', count: ALL_RECIPES.filter(r => r.continent === 'Oceania').length, description: 'Tropical citrus, fresh catch & coconut cream' }
];

const MEAL_TYPES = [
  'All',
  'Dinner',
  'Lunch',
  'Breakfast',
  'Dessert',
  'Snack',
  'Side Dish'
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Halal',
  'Nut-Free',
  'Low Carb'
];

const KEY_INGREDIENTS = [
  'Chicken',
  'Rice',
  'Noodles',
  'Plantain',
  'Fish',
  'Beef',
  'Tofu',
  'Coconut',
  'Tomato',
  'Garlic'
];

export const ExploreWorldView: React.FC<ExploreWorldViewProps> = ({
  onSelectRecipe,
  onOpenUnlockModal,
  onOpenSurpriseMe,
  onOpenAIChef
}) => {
  const { isPremium, isOnline } = useAuth();
  const { passport, favorites, downloadedRecipeIds, toggleFavorite, downloadRecipe } = useKitchen();

  // Exploration dimension state
  const [activeDimension, setActiveDimension] = useState<'continents' | 'countries' | 'cuisines' | 'meal_types' | 'dietary' | 'time_difficulty'>('continents');
  const [selectedContinent, setSelectedContinent] = useState<Continent | 'All'>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [selectedMealType, setSelectedMealType] = useState<string>('All');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiIntentExplanation, setAiIntentExplanation] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recommended' | 'time' | 'title' | 'country' | 'spice'>('recommended');

  // Country directory grouped with counts and stamps
  const countryDirectory = useMemo(() => {
    const map = new Map<string, { country: string; code: string; continent: Continent; count: number }>();
    ALL_RECIPES.forEach(r => {
      const existing = map.get(r.country) || { country: r.country, code: r.countryCode, continent: r.continent, count: 0 };
      existing.count += 1;
      map.set(r.country, existing);
    });
    return Array.from(map.values()).sort((a, b) => a.country.localeCompare(b.country));
  }, []);

  // Cuisines list
  const cuisinesList = useMemo(() => {
    const set = new Set<string>();
    ALL_RECIPES.forEach(r => {
      if (r.cuisine) set.add(r.cuisine);
    });
    return ['All', ...Array.from(set).sort()];
  }, []);

  // Toggle dietary tag
  const toggleDietary = (tag: string) => {
    setSelectedDietary(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Reset all exploration filters
  const resetFilters = () => {
    setSelectedContinent('All');
    setSelectedCountry('All');
    setSelectedCuisine('All');
    setSelectedMealType('All');
    setSelectedDietary([]);
    setSelectedDifficulty('All');
    setMaxTime(null);
    setSelectedIngredient('All');
    setSearchQuery('');
    setAiIntentExplanation(null);
  };

  const hasActiveFilters = 
    selectedContinent !== 'All' || 
    selectedCountry !== 'All' || 
    selectedCuisine !== 'All' || 
    selectedMealType !== 'All' || 
    selectedDietary.length > 0 || 
    selectedDifficulty !== 'All' || 
    maxTime !== null || 
    selectedIngredient !== 'All' || 
    searchQuery.trim() !== '';

  // Smart Search & Dynamic Filtering
  const filteredRecipes = useMemo(() => {
    let pool = ALL_RECIPES;

    // Search query with offline / smart parser
    if (searchQuery.trim()) {
      const localResult = searchRecipesLocally(pool, searchQuery);
      pool = localResult.recipes;
    }

    // Continent filter
    if (selectedContinent !== 'All') {
      pool = pool.filter(r => r.continent === selectedContinent);
    }

    // Country filter
    if (selectedCountry !== 'All') {
      pool = pool.filter(r => r.country === selectedCountry);
    }

    // Cuisine filter
    if (selectedCuisine !== 'All') {
      pool = pool.filter(r => r.cuisine.toLowerCase() === selectedCuisine.toLowerCase());
    }

    // Meal type filter
    if (selectedMealType !== 'All') {
      pool = pool.filter(r => r.mealType.toLowerCase() === selectedMealType.toLowerCase());
    }

    // Dietary filter
    if (selectedDietary.length > 0) {
      pool = pool.filter(r => 
        selectedDietary.every(tag => r.dietaryTags.some(t => t.toLowerCase() === tag.toLowerCase()))
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      pool = pool.filter(r => r.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
    }

    // Time filter
    if (maxTime !== null) {
      pool = pool.filter(r => r.totalTime <= maxTime);
    }

    // Ingredient filter
    if (selectedIngredient !== 'All') {
      const ingLower = selectedIngredient.toLowerCase();
      pool = pool.filter(r => 
        r.ingredients.some(i => i.name.toLowerCase().includes(ingLower))
      );
    }

    // Sorting
    const sorted = [...pool].sort((a, b) => {
      if (sortBy === 'time') return a.totalTime - b.totalTime;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'country') return a.country.localeCompare(b.country);
      if (sortBy === 'spice') return b.spiceLevel - a.spiceLevel;
      return 0; // Default recommended
    });

    return sorted;
  }, [
    searchQuery,
    selectedContinent,
    selectedCountry,
    selectedCuisine,
    selectedMealType,
    selectedDietary,
    selectedDifficulty,
    maxTime,
    selectedIngredient,
    sortBy
  ]);

  // Handle Gemini Natural-Language Search when user requests
  const handleAiSmartSearch = async () => {
    if (!searchQuery.trim() || !isOnline) return;
    setIsAiSearching(true);
    try {
      const result = await searchWithGeminiAI(searchQuery, ALL_RECIPES);
      if (result.explanation) {
        setAiIntentExplanation(result.explanation);
      }
    } catch {
      // Handled
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 pb-28 pt-4 sm:pt-8 text-stone-100 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Editorial Screen Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-800">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              GLOBAL CULINARY ATLAS
            </span>
            <h1 className="font-serif text-2xl sm:text-5xl font-black text-stone-100 tracking-tight mt-1">
              EXPLORE THE WORLD
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-xl mt-1.5">
              Traverse authentic recipes cataloged across 6 continents, 50+ countries, regional cuisines, and specialized culinary dimensions.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenSurpriseMe}
              className="px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>🎲 Surprise Me</span>
            </button>
            <button
              onClick={onOpenAIChef}
              className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 text-xs font-semibold flex items-center gap-2 transition-all min-h-[44px]"
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              <span>Ask AI Chef</span>
            </button>
          </div>
        </div>

        {/* Search & Intent Box */}
        <div className="space-y-2">
          <div className="relative flex items-center bg-stone-900/90 rounded-2xl border border-stone-800 shadow-xl focus-within:border-amber-500/80 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <Search className="w-5 h-5 text-stone-400 ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSmartSearch()}
              placeholder='Try "something spicy", "chicken and rice", "under 30 minutes", or "Nigerian soup"...'
              className="w-full py-3.5 pl-3 pr-24 bg-transparent text-sm sm:text-base text-stone-100 placeholder-stone-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setAiIntentExplanation(null);
                }}
                className="p-2 mr-2 text-stone-400 hover:text-stone-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isOnline && searchQuery.trim().length > 3 && (
              <button
                onClick={handleAiSmartSearch}
                disabled={isAiSearching}
                className="mr-2 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shrink-0 flex items-center gap-1 min-h-[38px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiSearching ? 'Reasoning...' : 'AI Search'}</span>
              </button>
            )}
          </div>

          {aiIntentExplanation && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
              <span>✨ {aiIntentExplanation}</span>
              <button 
                onClick={() => setAiIntentExplanation(null)}
                className="text-amber-400 hover:text-amber-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Dimensional Navigation Tabs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-scroll border-b border-stone-800/80">
            <button
              onClick={() => setActiveDimension('continents')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[40px] ${
                activeDimension === 'continents'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              Continents ({CONTINENTS.length - 1})
            </button>

            <button
              onClick={() => setActiveDimension('countries')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[40px] ${
                activeDimension === 'countries'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              Countries Directory ({countryDirectory.length})
            </button>

            <button
              onClick={() => setActiveDimension('cuisines')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[40px] ${
                activeDimension === 'cuisines'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              Cuisines & Traditions
            </button>

            <button
              onClick={() => setActiveDimension('meal_types')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[40px] ${
                activeDimension === 'meal_types'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              Meal Types & Occasions
            </button>

            <button
              onClick={() => setActiveDimension('dietary')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[40px] ${
                activeDimension === 'dietary'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              Dietary & Lifestyle
            </button>

            <button
              onClick={() => setActiveDimension('time_difficulty')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[40px] ${
                activeDimension === 'time_difficulty'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              Time & Technique
            </button>
          </div>

          {/* Dimension Controls Content */}
          {activeDimension === 'continents' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-in fade-in duration-150">
              {CONTINENTS.map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedContinent(c.name)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedContinent === c.name
                      ? 'bg-amber-500/10 border-amber-500 text-stone-100 shadow-lg'
                      : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{c.icon}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                      {c.count} dishes
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base mt-2 text-stone-100">{c.name}</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{c.description}</p>
                </button>
              ))}
            </div>
          )}

          {activeDimension === 'countries' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>Select a country to browse authentic regional dishes</span>
                {selectedCountry !== 'All' && (
                  <button 
                    onClick={() => setSelectedCountry('All')}
                    className="text-amber-400 hover:underline"
                  >
                    Clear Country Filter
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCountry('All')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    selectedCountry === 'All'
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-500'
                      : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  🌍 All Countries
                </button>
                {countryDirectory.map(c => {
                  const hasStamp = passport[c.code];
                  return (
                    <button
                      key={c.country}
                      onClick={() => setSelectedCountry(c.country)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        selectedCountry === c.country
                          ? 'bg-amber-500 text-stone-950 font-bold border-amber-500'
                          : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <span className="truncate">{c.country}</span>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {hasStamp && (
                          <span title="Passport stamped!" className="text-[10px] text-amber-400">★</span>
                        )}
                        <span className="text-[10px] text-stone-400 font-mono">({c.count})</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeDimension === 'cuisines' && (
            <div className="flex flex-wrap gap-2 animate-in fade-in duration-150">
              {cuisinesList.map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCuisine === cuisine
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                      : 'bg-stone-900/80 border border-stone-800 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          )}

          {activeDimension === 'meal_types' && (
            <div className="flex flex-wrap gap-2 animate-in fade-in duration-150">
              {MEAL_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedMealType(type)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedMealType === type
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                      : 'bg-stone-900/80 border border-stone-800 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          {activeDimension === 'dietary' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map(diet => {
                  const isSelected = selectedDietary.includes(diet);
                  return (
                    <button
                      key={diet}
                      onClick={() => toggleDietary(diet)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                          : 'bg-stone-900/80 border border-stone-800 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{diet}</span>
                    </button>
                  );
                })}
              </div>

              {/* Key Ingredients */}
              <div className="pt-2 border-t border-stone-800/80">
                <p className="text-xs text-stone-400 font-semibold mb-2">Filter by Key Ingredient:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedIngredient('All')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      selectedIngredient === 'All' ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-stone-300'
                    }`}
                  >
                    All Ingredients
                  </button>
                  {KEY_INGREDIENTS.map(ing => (
                    <button
                      key={ing}
                      onClick={() => setSelectedIngredient(ing)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        selectedIngredient === ing ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      {ing}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeDimension === 'time_difficulty' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Max Preparation + Cooking Time
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Any Time', val: null },
                    { label: '≤ 20 min', val: 20 },
                    { label: '≤ 30 min', val: 30 },
                    { label: '≤ 45 min', val: 45 }
                  ].map(t => (
                    <button
                      key={t.label}
                      onClick={() => setMaxTime(t.val)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold ${
                        maxTime === t.val ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4" />
                  Technique & Difficulty
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {['All', 'Easy', 'Medium', 'Advanced'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold ${
                        selectedDifficulty === diff ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Pills Bar & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-400 font-mono">
              Showing <strong className="text-stone-100">{filteredRecipes.length}</strong> matching dishes
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 underline ml-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset all filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            >
              <option value="recommended">Curated / Recommended</option>
              <option value="time">Fastest First</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="country">Country</option>
              <option value="spice">Spiciest First</option>
            </select>
          </div>
        </div>

        {/* Recipe Results Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-stone-900/40 border border-stone-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-200">No dishes match this exact combination</h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              Try broadening your filters, searching by ingredient, or let AI Chef generate a custom recipe.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold shadow-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredRecipes.map(recipe => (
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
        )}
      </div>
    </div>
  );
};
