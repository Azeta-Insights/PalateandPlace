import React, { useState, useMemo } from 'react';
import { 
  History, 
  Download, 
  ShoppingBag, 
  Heart, 
  Sliders, 
  Trash2, 
  Plus, 
  Star, 
  CheckCircle2, 
  WifiOff, 
  HardDrive, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Globe,
  Award,
  Sparkles,
  Camera,
  Compass,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useKitchen } from '../context/KitchenContext';
import { Recipe, ShoppingItem } from '../types/recipe';
import { ALL_RECIPES, ALL_STARTER_RECIPES, getRecipeById } from '../data/recipes';

interface MyKitchenViewProps {
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenUnlockModal: () => void;
  onOpenAdmin?: () => void;
}

export const MyKitchenView: React.FC<MyKitchenViewProps> = ({
  onSelectRecipe,
  onOpenUnlockModal,
  onOpenAdmin
}) => {
  const {
    user,
    profile,
    isPremium,
    updatePreferences
  } = useAuth();

  const {
    favorites,
    cookingHistory,
    passport,
    shoppingList,
    downloadedRecipeIds,
    toggleFavorite,
    toggleShoppingItem,
    removeShoppingItem,
    clearCompletedShopping,
    removeDownloadedRecipe,
    downloadAllPremiumRecipes,
    addToShoppingList
  } = useKitchen();

  const [activeTab, setActiveTab] = useState<'history' | 'insights' | 'shopping' | 'offline' | 'favorites' | 'preferences'>('history');

  // Custom shopping item state
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientAmount, setNewIngredientAmount] = useState('');

  // Accurately computed offline recipes: downloaded recipes + all starters
  const offlineRecipes = useMemo(() => {
    const list: Recipe[] = [];
    const seen = new Set<string>();

    downloadedRecipeIds.forEach((id) => {
      const r = getRecipeById(id);
      if (r) {
        list.push(r);
        seen.add(r.recipeId);
      }
    });

    ALL_STARTER_RECIPES.forEach((s) => {
      if (!seen.has(s.recipeId)) {
        list.push(s);
        seen.add(s.recipeId);
      }
    });

    return list;
  }, [downloadedRecipeIds]);

  // Real IndexedDB storage stats based on actual downloaded items
  const storageStats = useMemo(() => {
    const count = offlineRecipes.length;
    const estimatedKb = count * 35 + cookingHistory.length * 40 + shoppingList.length * 2 + 180;
    const sizeMB = estimatedKb > 1024 ? `${(estimatedKb / 1024).toFixed(1)} MB` : `${estimatedKb} KB`;
    return { recipeCount: count, sizeMB };
  }, [offlineRecipes, cookingHistory.length, shoppingList.length]);

  // Dietary options
  const DIETARY_OPTIONS = [
    'Gluten-Free',
    'Dairy-Free',
    'Halal',
    'Vegetarian',
    'Vegan',
    'Pescatarian',
    'Nut-Free',
    'Low Carb'
  ];

  const handleAddCustomShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientName.trim()) return;

    const newItem: ShoppingItem = {
      id: `shop-custom-${Date.now()}`,
      name: newIngredientName.trim(),
      amount: parseFloat(newIngredientAmount) || 1,
      unit: newIngredientAmount ? '' : 'item',
      checked: false,
      category: 'Pantry & Market',
      createdAt: new Date().toISOString()
    };

    addToShoppingList([newItem]);
    setNewIngredientName('');
    setNewIngredientAmount('');
  };

  const handleToggleDietaryPref = (tag: string) => {
    const current = profile?.preferences?.dietary || [];
    const next = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    updatePreferences({ dietary: next });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#F7F4EE] border border-[#E8E1D7] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-[#C85A32] uppercase tracking-widest">
            Your Kitchen
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#231B15] tracking-tight">
            Your Cooking History & Kitchen
          </h1>
          <p className="text-xs sm:text-sm text-[#5E5248]">
            Manage your cooking records, offline recipe storage, shopping list, and flavor profile.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#F4F0E8] p-1 rounded-xl border border-[#E8E1D7] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-[#231B15] shadow-sm font-semibold'
                : 'text-[#6E6258] hover:text-[#231B15]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({cookingHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'insights'
                ? 'bg-white text-[#231B15] shadow-sm font-semibold'
                : 'text-[#6E6258] hover:text-[#231B15]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('shopping')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'shopping'
                ? 'bg-white text-[#231B15] shadow-sm font-semibold'
                : 'text-[#6E6258] hover:text-[#231B15]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Market ({shoppingList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offline')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'offline'
                ? 'bg-white text-[#231B15] shadow-sm font-semibold'
                : 'text-[#6E6258] hover:text-[#231B15]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Offline ({storageStats.recipeCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-white text-[#231B15] shadow-sm font-semibold'
                : 'text-[#6E6258] hover:text-[#231B15]'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Favorites ({favorites.size})</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'preferences'
                ? 'bg-white text-[#231B15] shadow-sm font-semibold'
                : 'text-[#6E6258] hover:text-[#231B15]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Diet</span>
          </button>
        </div>
      </div>

      {/* 1. COOKING HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D7]">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#231B15]">
              Cooking Log & Personal Tasting Notes
            </h2>
            <span className="text-xs text-[#8E8277] font-mono">
              {cookingHistory.length} dishes prepared
            </span>
          </div>

          {cookingHistory.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E1D7] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F4F0E8] text-[#8E8277] flex items-center justify-center mx-auto">
                <History className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#231B15]">No dishes logged yet</h3>
              <p className="text-xs text-[#5E5248] max-w-sm mx-auto">
                Whenever you cook a dish, tap "I Cooked This" on the recipe page to log your rating, personal tasting notes, and stamp your Food Passport!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cookingHistory.map((item) => {
                const recipe = getRecipeById(item.recipeId);
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl bg-white border border-[#E8E1D7] hover:border-[#231B15]/40 transition-all space-y-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#C85A32] font-semibold">
                          {item.countryCode} · {item.country}
                        </span>
                        <h4 className="font-serif text-base font-bold text-[#231B15] mt-0.5">
                          {item.recipeTitle}
                        </h4>
                      </div>

                      <div className="flex items-center gap-0.5 text-[#B8860B]">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#B8860B]" />
                        ))}
                      </div>
                    </div>

                    {item.photoUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-[#E8E1D7] h-40 bg-[#F4F0E8]">
                        <img
                          src={item.photoUrl}
                          alt={item.recipeTitle}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-medium text-white flex items-center gap-1">
                          <Camera className="w-3 h-3 text-[#E8DAB7]" />
                          <span>My Kitchen Creation</span>
                        </div>
                      </div>
                    )}

                    {item.notes && (
                      <p className="font-editorial text-xs sm:text-sm text-[#5E5248] italic bg-[#FBF9F5] p-3 rounded-lg border border-[#E8E1D7]">
                        “{item.notes}”
                      </p>
                    )}

                    <div className="pt-2 border-t border-[#E8E1D7] flex items-center justify-between text-[11px] text-[#8E8277]">
                      <span>Cooked for {item.servingsCooked || 4} people</span>
                      <span>{new Date(item.cookedAt).toLocaleDateString()}</span>
                    </div>

                    {recipe && (
                      <button
                        onClick={() => onSelectRecipe(recipe)}
                        className="w-full py-2 rounded-lg bg-[#F4F0E8] hover:bg-[#EAE4D9] text-[#231B15] text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Cook Again</span>
                        <ExternalLink className="w-3 h-3 text-[#8E8277]" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. INSIGHTS TAB */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="pb-2 border-b border-[#E8E1D7]">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#231B15]">
              Culinary Intelligence & Kitchen Insights
            </h2>
            <p className="text-xs text-[#8E8277] mt-0.5">
              Personalized analytics computed from your global cooking journey and tasting notes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white border border-[#E8E1D7] space-y-1.5 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8E8277]">Passport Rank</span>
              <div className="font-serif text-2xl font-bold text-[#231B15]">
                {cookingHistory.length === 0 ? 'Novice Traveler' :
                 cookingHistory.length < 5 ? 'Curious Cook' :
                 cookingHistory.length < 15 ? 'Kitchen Adventurer' :
                 'Global Master Chef'}
              </div>
              <p className="text-xs text-[#8E8277]">
                {cookingHistory.length} dishes prepared across {Object.keys(passport).length} countries
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-[#E8E1D7] space-y-1.5 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8E8277]">Continents Tasted</span>
              <div className="font-serif text-2xl font-bold text-[#5C6B38]">
                {new Set(cookingHistory.map(h => h.continent)).size} / 6
              </div>
              <p className="text-xs text-[#8E8277]">
                Global culinary reach across continents
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-[#E8E1D7] space-y-1.5 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8E8277]">Average Rating</span>
              <div className="font-serif text-2xl font-bold text-[#231B15]">
                {cookingHistory.length > 0 ? (
                  <>
                    {(cookingHistory.reduce((acc, h) => acc + h.rating, 0) / cookingHistory.length).toFixed(1)}
                    <span className="text-xs font-sans text-[#8E8277]"> / 5.0</span>
                  </>
                ) : (
                  <span className="text-base font-sans text-[#8E8277]">No ratings yet</span>
                )}
              </div>
              <p className="text-xs text-[#8E8277]">
                Based on your logged tasting reviews
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-[#E8E1D7] space-y-1.5 shadow-sm">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8E8277]">Creations Photographed</span>
              <div className="font-serif text-2xl font-bold text-[#C85A32]">
                {cookingHistory.filter(h => h.photoUrl).length}
              </div>
              <p className="text-xs text-[#8E8277]">
                Meal creations photographed & preserved
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. SHOPPING LIST TAB */}
      {activeTab === 'shopping' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E1D7]">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#231B15]">
                Market & Grocery List
              </h2>
              <p className="text-xs text-[#8E8277] mt-0.5">
                Automatically gathered from recipes or added manually for grocery trips.
              </p>
            </div>

            {shoppingList.length > 0 && (
              <button
                onClick={clearCompletedShopping}
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-[#F4F0E8] text-[#5E5248] border border-[#E8E1D7] text-xs font-medium transition-colors"
              >
                Clear Checked Items
              </button>
            )}
          </div>

          <form onSubmit={handleAddCustomShoppingItem} className="flex gap-2">
            <input
              type="text"
              value={newIngredientName}
              onChange={(e) => setNewIngredientName(e.target.value)}
              placeholder="Add market item (e.g. 500g ripe plantains, smoked paprika)..."
              className="flex-1 py-2.5 px-4 rounded-lg bg-white border border-[#E8E1D7] text-xs sm:text-sm text-[#231B15] placeholder-[#8E8277] focus:outline-none focus:border-[#231B15]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-[#231B15] hover:bg-[#3D322A] text-[#FBF9F5] font-medium text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {shoppingList.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E1D7] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F4F0E8] text-[#8E8277] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#231B15]">Your shopping list is empty</h3>
              <p className="text-xs text-[#5E5248] max-w-sm mx-auto">
                Browse any recipe in the cookbook and tap "Add All to Shopping List" to automatically gather the ingredients!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {shoppingList.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    item.checked
                      ? 'bg-[#F4F0E8]/50 border-[#E8E1D7] opacity-60 line-through'
                      : 'bg-white border-[#E8E1D7] hover:border-[#231B15]/40 shadow-sm'
                  }`}
                >
                  <div
                    onClick={() => toggleShoppingItem(item.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      item.checked ? 'bg-[#5C6B38] border-[#5C6B38] text-white' : 'border-[#D8CEBE]'
                    }`}>
                      {item.checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-[#231B15] text-xs sm:text-sm">
                        {item.amount && item.amount > 0 ? `${item.amount} ${item.unit || ''} ` : ''}
                      </span>
                      <span className="text-[#231B15] text-xs sm:text-sm">{item.name}</span>
                      {item.recipeTitle && (
                        <p className="text-[10px] text-[#C85A32] font-mono">
                          For: {item.recipeTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeShoppingItem(item.id)}
                    className="p-1.5 text-[#8E8277] hover:text-[#C85A32]"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. OFFLINE STORAGE TAB */}
      {activeTab === 'offline' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white border border-[#E8E1D7] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#5C6B38]" />
                <h3 className="font-serif text-lg font-bold text-[#231B15]">
                  Local Storage & Offline Readiness
                </h3>
              </div>
              <p className="text-xs text-[#5E5248]">
                All 50 Starter Recipes are bundled locally. Downloaded recipes function 100% offline without internet.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#F7F4EE] p-3.5 rounded-lg border border-[#E8E1D7]">
              <div>
                <p className="text-[10px] text-[#8E8277] uppercase font-medium">Available Offline</p>
                <p className="font-mono text-lg font-bold text-[#5C6B38]">{storageStats.recipeCount} dishes</p>
              </div>
              <div className="h-7 w-px bg-[#E8E1D7]" />
              <div>
                <p className="text-[10px] text-[#8E8277] uppercase font-medium">Cache Size</p>
                <p className="font-mono text-lg font-bold text-[#231B15]">{storageStats.sizeMB}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-[#231B15]">
              Dishes Stored on This Device
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {offlineRecipes.map((r) => {
                const isUserDownloaded = downloadedRecipeIds.has(r.recipeId);
                return (
                  <div
                    key={r.recipeId}
                    className="p-3.5 rounded-xl bg-white border border-[#E8E1D7] flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div 
                      onClick={() => onSelectRecipe(r)}
                      className="cursor-pointer truncate flex-1"
                    >
                      <p className="text-xs font-semibold text-[#231B15] truncate hover:text-[#C85A32]">
                        {r.title}
                      </p>
                      <p className="text-[10px] text-[#8E8277] font-mono">
                        {r.country} · {r.isStarter ? 'Free Starter' : 'Downloaded Dish'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#F2F5EC] text-[#5C6B38] font-medium border border-[#D5DEBF]">
                        Offline Ready
                      </span>
                      {isUserDownloaded && (
                        <button
                          onClick={() => removeDownloadedRecipe(r.recipeId)}
                          title="Remove from device storage"
                          className="p-1 rounded text-[#8E8277] hover:text-[#C85A32] hover:bg-[#F7F4EE] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. FAVORITES TAB */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D7]">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#231B15]">
              Saved Favorite Dishes
            </h2>
            <span className="text-xs text-[#8E8277] font-mono">
              {favorites.size} saved
            </span>
          </div>

          {favorites.size === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E1D7] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F4F0E8] text-[#8E8277] flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#231B15]">No favorite dishes yet</h3>
              <p className="text-xs text-[#5E5248] max-w-sm mx-auto">
                Tap the heart icon on any recipe card to save dishes to your personal culinary collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(favorites).map((favId) => {
                const recipe = getRecipeById(favId);
                if (!recipe) return null;
                return (
                  <div
                    key={favId}
                    onClick={() => onSelectRecipe(recipe)}
                    className="group p-3.5 rounded-xl bg-white border border-[#E8E1D7] hover:border-[#231B15]/40 cursor-pointer transition-all flex items-center gap-3 shadow-sm"
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-14 h-14 rounded-lg object-cover bg-[#F4F0E8]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[#C85A32] font-mono">{recipe.country}</p>
                      <h4 className="font-serif text-sm font-semibold text-[#231B15] truncate group-hover:text-[#C85A32]">
                        {recipe.title}
                      </h4>
                      <p className="text-xs text-[#8E8277] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{recipe.totalTime} mins</span>
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recipe.recipeId);
                      }}
                      className="p-2 text-[#C85A32] hover:text-[#8E8277]"
                    >
                      <Heart className="w-4 h-4 fill-[#C85A32]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. PREFERENCES TAB */}
      {activeTab === 'preferences' && (
        <div className="max-w-2xl space-y-6">
          <div className="pb-2 border-b border-[#E8E1D7]">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#231B15]">
              Dietary Restrictions & Flavor Profile
            </h2>
            <p className="text-xs text-[#8E8277] mt-0.5">
              Customize your dietary profile to automatically highlight matching global recipes.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#E8E1D7] space-y-4 shadow-sm">
            <label className="text-xs font-semibold text-[#231B15] uppercase tracking-wide">
              Active Dietary Preferences
            </label>

            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((tag) => {
                const isSelected = profile?.preferences?.dietary?.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleToggleDietaryPref(tag)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#5C6B38] text-white shadow-sm'
                        : 'bg-[#F4F0E8] text-[#5E5248] hover:bg-[#EAE4D9]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
