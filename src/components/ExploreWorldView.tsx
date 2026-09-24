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
  UtensilsCrossed,
  Dices
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

  // Handle Gemini Natural-Language Search
  const handleAiSmartSearch = async () => {
    if (!searchQuery.trim() || !isOnline) return;
    setIsAiSearching(true);
    try {
      const result = await searchWithGeminiAI(searchQuery, ALL_RECIPES);
      if (result.explanation) {
        setAiIntentExplanation(result.explanation);
      }
    } catch {
      // Handled gracefully
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-28 pt-6 sm:pt-10 text-[#231B15] animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Editorial Screen Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E8E1D7]">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-[#C85A32] font-semibold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>THE GLOBAL CULINARY ATLAS</span>
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#231B15] tracking-tight mt-1">
              Explore the World
            </h1>
            <p className="text-xs sm:text-sm text-[#5E5248] max-w-xl mt-1.5 leading-relaxed">
              Traverse authentic recipes cataloged across 6 continents, 52 countries, regional cuisines, and specialized culinary dimensions.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenSurpriseMe}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#F4F0E8] text-[#C85A32] border border-[#E8E1D7] text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Surprise Me</span>
            </button>
            <button
              onClick={onOpenAIChef}
              className="px-3.5 py-2 rounded-lg bg-[#231B15] hover:bg-[#3D322A] text-[#FBF9F5] text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E8DAB7]" />
              <span>Ask AI Chef</span>
            </button>
          </div>
        </div>

        {/* Search & Intent Box */}
        <div className="space-y-2">
          <div className="relative flex items-center bg-white rounded-xl border border-[#E8E1D7] shadow-sm focus-within:border-[#231B15] focus-within:ring-1 focus-within:ring-[#231B15] transition-all">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#8E8277] ml-3.5 sm:ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSmartSearch()}
              placeholder='Try "something spicy", "chicken and rice", "under 30 minutes", or "Nigerian soup"...'
              className="w-full py-3.5 pl-3 pr-24 bg-transparent text-xs sm:text-sm text-[#231B15] placeholder-[#8E8277] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setAiIntentExplanation(null);
                }}
                className="p-1.5 mr-2 text-[#8E8277] hover:text-[#231B15] min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isOnline && searchQuery.trim().length > 3 && (
              <button
                onClick={handleAiSmartSearch}
                disabled={isAiSearching}
                className="mr-2 px-3 py-1.5 rounded-lg bg-[#231B15] hover:bg-[#3D322A] text-[#FBF9F5] text-xs font-medium transition-all shrink-0 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#E8DAB7]" />
                <span>{isAiSearching ? 'Reasoning...' : 'AI Search'}</span>
              </button>
            )}
          </div>

          {aiIntentExplanation && (
            <div className="p-3 rounded-lg bg-[#FDF2ED] border border-[#F4CEBE] text-xs text-[#C85A32] flex items-center justify-between">
              <span>✨ {aiIntentExplanation}</span>
              <button 
                onClick={() => setAiIntentExplanation(null)}
                className="text-[#C85A32] hover:text-[#A83E20] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Dimensional Navigation Tabs */}
        <div className="space-y-4">
          <div className="flex items-center gap-1 p-1 bg-[#F4F0E8] rounded-xl border border-[#E8E1D7] overflow-x-auto scrollbar-none">
            {[
              { key: 'continents', label: `Continents (${CONTINENTS.length - 1})` },
              { key: 'countries', label: `Country Index (${countryDirectory.length})` },
              { key: 'cuisines', label: 'Cuisines & Traditions' },
              { key: 'meal_types', label: 'Meal Types' },
              { key: 'dietary', label: 'Dietary & Lifestyle' },
              { key: 'time_difficulty', label: 'Time & Technique' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveDimension(tab.key as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeDimension === tab.key
                    ? 'bg-white text-[#231B15] shadow-sm font-semibold'
                    : 'text-[#6E6258] hover:text-[#231B15]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dimension Controls Content */}
          {activeDimension === 'continents' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-in fade-in duration-150">
              {CONTINENTS.map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedContinent(c.name)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedContinent === c.name
                      ? 'bg-white border-[#231B15] shadow-sm ring-1 ring-[#231B15]'
                      : 'bg-white/80 border-[#E8E1D7] hover:border-[#231B15]/40 hover:bg-white text-[#5E5248]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{c.icon}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F4F0E8] text-[#5E5248]">
                      {c.count} dishes
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base mt-2 text-[#231B15]">{c.name}</h3>
                  <p className="text-[11px] text-[#8E8277] mt-0.5 line-clamp-1">{c.description}</p>
                </button>
              ))}
            </div>
          )}

          {activeDimension === 'countries' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-[#8E8277]">
                <span>Select a country to browse authentic regional dishes</span>
                {selectedCountry !== 'All' && (
                  <button 
                    onClick={() => setSelectedCountry('All')}
                    className="text-[#C85A32] hover:underline font-medium"
                  >
                    Clear Country Filter
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCountry('All')}
                  className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                    selectedCountry === 'All'
                      ? 'bg-[#231B15] text-[#FBF9F5] border-[#231B15]'
                      : 'bg-white border-[#E8E1D7] text-[#5E5248] hover:bg-[#F4F0E8]'
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
                      className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        selectedCountry === c.country
                          ? 'bg-[#231B15] text-[#FBF9F5] border-[#231B15]'
                          : 'bg-white border-[#E8E1D7] text-[#5E5248] hover:bg-[#F4F0E8]'
                      }`}
                    >
                      <span className="truncate">{c.country}</span>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {hasStamp && (
                          <span title="Passport stamped!" className="text-[10px] text-[#C85A32]">★</span>
                        )}
                        <span className="text-[10px] text-[#8E8277] font-mono">({c.count})</span>
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
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedCuisine === cuisine
                      ? 'bg-[#231B15] text-[#FBF9F5] shadow-sm'
                      : 'bg-white border border-[#E8E1D7] text-[#5E5248] hover:bg-[#F4F0E8]'
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
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedMealType === type
                      ? 'bg-[#231B15] text-[#FBF9F5] shadow-sm'
                      : 'bg-white border border-[#E8E1D7] text-[#5E5248] hover:bg-[#F4F0E8]'
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
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-[#5C6B38] text-white shadow-sm'
                          : 'bg-white border border-[#E8E1D7] text-[#5E5248] hover:bg-[#F4F0E8]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      <span>{diet}</span>
                    </button>
                  );
                })}
              </div>

              {/* Key Ingredients */}
              <div className="pt-2 border-t border-[#E8E1D7]">
                <p className="text-xs text-[#8E8277] font-medium mb-2">Filter by Key Ingredient:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedIngredient('All')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      selectedIngredient === 'All' ? 'bg-[#231B15] text-[#FBF9F5]' : 'bg-white border border-[#E8E1D7] text-[#5E5248]'
                    }`}
                  >
                    All Ingredients
                  </button>
                  {KEY_INGREDIENTS.map(ing => (
                    <button
                      key={ing}
                      onClick={() => setSelectedIngredient(ing)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        selectedIngredient === ing ? 'bg-[#231B15] text-[#FBF9F5]' : 'bg-white border border-[#E8E1D7] text-[#5E5248] hover:bg-[#F4F0E8]'
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
              <div className="p-4 rounded-xl bg-white border border-[#E8E1D7] space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8E8277] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Max Preparation + Cooking Time</span>
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
                      className={`py-2 px-1 text-center rounded-lg text-xs font-medium ${
                        maxTime === t.val ? 'bg-[#231B15] text-[#FBF9F5]' : 'bg-[#F4F0E8] text-[#5E5248] hover:bg-[#EAE4D9]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E8E1D7] space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8E8277] flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-[#5C6B38]" />
                  <span>Technique & Difficulty</span>
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {['All', 'Easy', 'Medium', 'Advanced'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-medium ${
                        selectedDifficulty === diff ? 'bg-[#231B15] text-[#FBF9F5]' : 'bg-[#F4F0E8] text-[#5E5248] hover:bg-[#EAE4D9]'
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

        {/* Results Metadata & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-2">
          <div className="flex items-center gap-2 flex-wrap text-xs text-[#8E8277]">
            <span className="font-mono">
              Showing <strong className="text-[#231B15] font-semibold">{filteredRecipes.length}</strong> matching dishes
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#C85A32] hover:underline flex items-center gap-1 font-medium ml-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8E8277]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#E8E1D7] text-xs text-[#231B15] focus:outline-none focus:border-[#231B15]"
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
          <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E1D7] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#F4F0E8] text-[#C85A32] flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#231B15]">No dishes match this exact combination</h3>
            <p className="text-xs text-[#5E5248] max-w-md mx-auto">
              Try broadening your filters, searching by ingredient, or asking AI Chef for guidance.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-lg bg-[#231B15] text-[#FBF9F5] text-xs font-medium shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.recipeId}
                recipe={recipe}
                isFavorite={favorites.has(recipe.recipeId)}
                isDownloaded={downloadedRecipeIds.has(recipe.recipeId)}
                isPremiumUser={isPremium}
                onSelect={(r) => onSelectRecipe(r)}
                onToggleFavorite={(id, e) => {
                  e?.stopPropagation();
                  toggleFavorite(id);
                }}
                onDownload={(id, e) => {
                  e?.stopPropagation();
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
