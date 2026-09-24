import React from 'react';
import { 
  Compass, 
  Clock, 
  ChefHat, 
  ArrowRight, 
  Globe 
} from 'lucide-react';
import { Continent, Recipe } from '../types/recipe';
import { RecipeCard } from './RecipeCard';

interface DiscoveryHubProps {
  onSelectContinent: (continent: Continent) => void;
  onSelectStarterOnly: () => void;
  onSelectQuickTime: (time: number) => void;
  onViewAllRecipes: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  continentCounts: Record<string, number>;
  starterRecipes: Recipe[];
  quickRecipes: Recipe[];
  favorites: Set<string>;
  downloadedRecipeIds: Set<string>;
  isPremium: boolean;
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  onDownload: (id: string, e?: React.MouseEvent) => void;
  onOpenUnlockModal: () => void;
}

interface ContinentCardData {
  continent: Continent;
  icon: string;
  image: string;
  tagline: string;
  signatureDishes: string;
}

const CONTINENT_CARDS: ContinentCardData[] = [
  {
    continent: 'Africa',
    icon: '🌍',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tagline: 'Vibrant spices, slow-simmered stews & smoky heritage',
    signatureDishes: 'Jollof Rice, Moroccan Tagine, Bobotie, Bunny Chow'
  },
  {
    continent: 'Asia',
    icon: '🌏',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    tagline: 'Rich broths, fragrant woks, aromatic curries & street delicacies',
    signatureDishes: 'Tokyo Shoyu Ramen, Pad Kra Pao, Biryani, Pho'
  },
  {
    continent: 'Europe',
    icon: '🏛️',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    tagline: 'Old-world traditions, artisan pasta & rustic coastal feasts',
    signatureDishes: 'Tagliatelle Bolognese, Paella Valenciana, Coq au Vin'
  },
  {
    continent: 'North America',
    icon: '🌮',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    tagline: 'Melting-pot street tacos, Cajun spice & indigenous staples',
    signatureDishes: 'Birria Tacos, New Orleans Gumbo, Quebec Poutine'
  },
  {
    continent: 'South America',
    icon: '🏔️',
    image: 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80',
    tagline: 'Fresh ceviches, open-flame grills & Andean superfoods',
    signatureDishes: 'Peruvian Ceviche, Brazilian Feijoada, Empanadas'
  },
  {
    continent: 'Oceania',
    icon: '🏝️',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    tagline: 'Island coconut cream, earth-oven cooking & fresh seafood',
    signatureDishes: 'Fijian Kokoda, Samoan Palusami, Kiwi Pavlova'
  }
];

export const DiscoveryHub: React.FC<DiscoveryHubProps> = ({
  onSelectContinent,
  onSelectStarterOnly,
  onSelectQuickTime,
  onViewAllRecipes,
  onSelectRecipe,
  continentCounts,
  starterRecipes,
  quickRecipes,
  favorites,
  downloadedRecipeIds,
  isPremium,
  onToggleFavorite,
  onDownload,
  onOpenUnlockModal
}) => {
  return (
    <div className="space-y-10 sm:space-y-14 py-6">
      
      {/* SECTION 1: Region / Continent Hub Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85A32] uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Choose Your Destination</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#231B15] tracking-tight">
              Explore by Continent
            </h2>
            <p className="text-xs sm:text-sm text-[#5E5248] mt-0.5">
              Select a region to browse authentic heritage dishes.
            </p>
          </div>

          <button
            onClick={onViewAllRecipes}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85A32] hover:underline py-1.5"
          >
            <span>Browse All 360 Dishes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Responsive Grid of Continent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {CONTINENT_CARDS.map((card) => {
            const count = continentCounts[card.continent] || 0;
            return (
              <div
                key={card.continent}
                onClick={() => onSelectContinent(card.continent)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-[#E8E1D7] hover:border-[#231B15]/40 bg-white transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {/* Visual Image Banner */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F4F0E8]">
                  <img
                    src={card.image}
                    alt={card.continent}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#231B15]/90 via-[#231B15]/30 to-transparent" />

                  {/* Continent Badge & Dish Count */}
                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/95 backdrop-blur-md border border-[#E8E1D7] text-xs font-semibold text-[#231B15] shadow-sm">
                      <span>{card.icon}</span>
                      <span>{card.continent}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-md bg-[#231B15] text-[#FBF9F5] text-xs font-semibold shadow-sm">
                      {count} Dishes
                    </span>
                  </div>

                  {/* Signature Dishes Preview */}
                  <div className="absolute bottom-3 inset-x-3.5">
                    <p className="text-[11px] text-[#E8DAB7] font-medium truncate">
                      ★ {card.signatureDishes}
                    </p>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="p-4 bg-white flex items-center justify-between border-t border-[#E8E1D7]">
                  <span className="text-xs text-[#5E5248] font-medium line-clamp-1">
                    {card.tagline}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#F4F0E8] group-hover:bg-[#231B15] text-[#5E5248] group-hover:text-[#FBF9F5] flex items-center justify-center shrink-0 transition-colors shadow-sm ml-2">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: 50 Free Starter Dishes (Horizontal Carousel) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C6B38] uppercase tracking-wider mb-0.5">
              <ChefHat className="w-3.5 h-3.5" />
              <span>Available Offline</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#231B15]">
              50 Free Starter Dishes
            </h3>
          </div>

          <button
            onClick={onSelectStarterOnly}
            className="text-xs font-semibold text-[#C85A32] hover:underline flex items-center gap-1"
          >
            <span>View All 50</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Card Carousel */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {starterRecipes.slice(0, 6).map((recipe) => (
            <div key={recipe.recipeId} className="w-[260px] sm:w-[280px] shrink-0">
              <RecipeCard
                recipe={recipe}
                isFavorite={favorites.has(recipe.recipeId)}
                isDownloaded={downloadedRecipeIds.has(recipe.recipeId)}
                isPremiumUser={isPremium}
                onSelect={onSelectRecipe}
                onToggleFavorite={onToggleFavorite}
                onDownload={onDownload}
                onOpenUnlockModal={onOpenUnlockModal}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Quick Weeknight Dishes (<= 30 mins) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85A32] uppercase tracking-wider mb-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Fast & Fresh</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#231B15]">
              Weeknight Dinners in 30 Mins or Less
            </h3>
          </div>

          <button
            onClick={() => onSelectQuickTime(30)}
            className="text-xs font-semibold text-[#C85A32] hover:underline flex items-center gap-1"
          >
            <span>See All Fast Dishes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Card Carousel */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {quickRecipes.slice(0, 6).map((recipe) => (
            <div key={recipe.recipeId} className="w-[260px] sm:w-[280px] shrink-0">
              <RecipeCard
                recipe={recipe}
                isFavorite={favorites.has(recipe.recipeId)}
                isDownloaded={downloadedRecipeIds.has(recipe.recipeId)}
                isPremiumUser={isPremium}
                onSelect={onSelectRecipe}
                onToggleFavorite={onToggleFavorite}
                onDownload={onDownload}
                onOpenUnlockModal={onOpenUnlockModal}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Browse Complete Cookbook Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#F7F4EE] border border-[#E8E1D7] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-sm">
          <div className="space-y-1.5">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#231B15]">
              Looking for a specific dish or country?
            </h3>
            <p className="text-xs sm:text-sm text-[#5E5248] max-w-xl">
              Use the search bar or explore all 360 recipes with curated dietary, regional, and culinary filters.
            </p>
          </div>

          <button
            onClick={onViewAllRecipes}
            className="px-6 py-3.5 rounded-xl bg-[#231B15] hover:bg-[#3D322A] text-[#FBF9F5] font-semibold text-xs sm:text-sm shadow-sm active:scale-95 transition-all shrink-0 min-h-[44px] flex items-center gap-2"
          >
            <Globe className="w-4 h-4 text-[#E8DAB7]" />
            <span>Browse All 360 Dishes</span>
          </button>
        </div>
      </div>

    </div>
  );
};
