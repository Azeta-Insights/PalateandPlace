import React from 'react';
import { 
  Search, 
  Compass, 
  SlidersHorizontal, 
  X, 
  Sparkles, 
  Check, 
  RotateCcw,
  Clock,
  Globe
} from 'lucide-react';
import { Continent } from '../types/recipe';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedContinent: Continent | 'All';
  onSelectContinent: (c: Continent | 'All') => void;
  starterOnly: boolean;
  onToggleStarterOnly: () => void;
  offlineOnly: boolean;
  onToggleOfflineOnly: () => void;
  quickTimeFilter: number | null;
  onSelectTimeFilter: (time: number | null) => void;
  selectedDietary: string[];
  onRemoveDietary: (tag: string) => void;
  selectedDifficulty: string;
  onResetDifficulty: () => void;
  selectedMealType: string;
  onResetMealType: () => void;
  onOpenFilterDrawer: () => void;
  onResetAllFilters: () => void;
  activeFiltersCount: number;
  totalFilteredCount: number;
  continentCounts: Record<string, number>;
}

const CONTINENTS: Array<{ label: Continent | 'All'; icon: string }> = [
  { label: 'All', icon: '🌍' },
  { label: 'Africa', icon: '🌍' },
  { label: 'Asia', icon: '🌏' },
  { label: 'Europe', icon: '🏛️' },
  { label: 'North America', icon: '🌮' },
  { label: 'South America', icon: '🏔️' },
  { label: 'Oceania', icon: '🏝️' }
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedContinent,
  onSelectContinent,
  starterOnly,
  onToggleStarterOnly,
  offlineOnly,
  onToggleOfflineOnly,
  quickTimeFilter,
  onSelectTimeFilter,
  selectedDietary,
  onRemoveDietary,
  selectedDifficulty,
  onResetDifficulty,
  selectedMealType,
  onResetMealType,
  onOpenFilterDrawer,
  onResetAllFilters,
  activeFiltersCount,
  totalFilteredCount,
  continentCounts
}) => {
  return (
    <div className="relative pt-6 pb-8 sm:pt-12 sm:pb-12 border-b border-[#E8E1D7] bg-[#F7F4EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Masthead Headline */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F2F5EC] border border-[#D5DEBF] text-[#5C6B38] text-[11px] font-semibold tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive World Culinary Atlas</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#231B15] tracking-tight leading-[1.15]">
            Discover places <br className="hidden sm:inline" />
            <span className="text-[#C85A32] italic font-editorial">
              through food.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#5E5248] leading-relaxed max-w-2xl mx-auto">
            From Nigerian Jollof and Tokyo Shoyu Ramen to authentic Roman Carbonara and Peruvian Ceviche. 
            Enjoy <strong className="text-[#231B15] font-semibold">50 free starter dishes ready offline</strong>, stamp your personal Food Passport, and cook with authentic technique.
          </p>
        </div>

        {/* Clean Editorial Search & Filter Bar */}
        <div className="mt-6 sm:mt-8 max-w-2xl mx-auto flex items-center gap-2">
          <div className="relative flex-1 flex items-center bg-white rounded-xl border border-[#E8E1D7] shadow-sm focus-within:border-[#231B15] focus-within:ring-1 focus-within:ring-[#231B15] transition-all">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#8E8277] ml-3.5 sm:ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search recipes, ingredients, countries, techniques..."
              className="w-full py-3 sm:py-3.5 pl-2.5 sm:pl-3 pr-9 bg-transparent text-xs sm:text-sm text-[#231B15] placeholder-[#8E8277] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1.5 mr-2 text-[#8E8277] hover:text-[#231B15] min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Drawer Trigger */}
          <button
            onClick={onOpenFilterDrawer}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl border font-medium text-xs sm:text-sm transition-all shrink-0 min-h-[44px] shadow-sm ${
              activeFiltersCount > 0
                ? 'bg-[#231B15] text-[#FBF9F5] border-[#231B15]'
                : 'bg-white text-[#5E5248] border-[#E8E1D7] hover:border-[#231B15]/40 hover:text-[#231B15]'
            }`}
            title="Open Recipe Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden xs:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-[#E8DAB7] text-[#231B15]">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Continent Quick Filter Bar */}
        <div className="mt-5 flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {CONTINENTS.map((c) => {
            const isSelected = selectedContinent === c.label;
            const count = continentCounts[c.label] || 0;
            return (
              <button
                key={c.label}
                onClick={() => onSelectContinent(c.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#231B15] text-[#FBF9F5] border-[#231B15] shadow-sm'
                    : 'bg-white text-[#5E5248] border-[#E8E1D7] hover:border-[#231B15]/40 hover:text-[#231B15]'
                }`}
              >
                <span>{c.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-[#E8DAB7]' : 'text-[#8E8277]'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Filter Tags Strip (Zero-pill clean text tags) */}
        {(activeFiltersCount > 0 || starterOnly || offlineOnly || quickTimeFilter) && (
          <div className="mt-4 pt-3 border-t border-[#E8E1D7] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5E5248]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#8E8277] text-[11px] uppercase tracking-wider font-semibold">Active:</span>
              
              {starterOnly && (
                <button
                  onClick={onToggleStarterOnly}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F2F5EC] border border-[#D5DEBF] text-[#5C6B38] text-xs font-medium hover:bg-[#E2EBD5]"
                >
                  <span>50 Starters Only</span>
                  <X className="w-3 h-3" />
                </button>
              )}

              {offlineOnly && (
                <button
                  onClick={onToggleOfflineOnly}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F2F5EC] border border-[#D5DEBF] text-[#5C6B38] text-xs font-medium hover:bg-[#E2EBD5]"
                >
                  <span>Offline Saved</span>
                  <X className="w-3 h-3" />
                </button>
              )}

              {quickTimeFilter && (
                <button
                  onClick={() => onSelectTimeFilter(null)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#E8E1D7] text-[#231B15] text-xs font-medium"
                >
                  <span>≤ {quickTimeFilter} mins</span>
                  <X className="w-3 h-3" />
                </button>
              )}

              {selectedDietary.map(tag => (
                <button
                  key={tag}
                  onClick={() => onRemoveDietary(tag)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#E8E1D7] text-[#231B15] text-xs font-medium"
                >
                  <span>{tag}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}

              {selectedDifficulty !== 'All' && (
                <button
                  onClick={onResetDifficulty}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#E8E1D7] text-[#231B15] text-xs font-medium"
                >
                  <span>Difficulty: {selectedDifficulty}</span>
                  <X className="w-3 h-3" />
                </button>
              )}

              {selectedMealType !== 'All' && (
                <button
                  onClick={onResetMealType}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#E8E1D7] text-[#231B15] text-xs font-medium"
                >
                  <span>{selectedMealType}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#8E8277]">
                Showing {totalFilteredCount} recipes
              </span>
              <button
                onClick={onResetAllFilters}
                className="text-xs text-[#C85A32] hover:underline font-medium"
              >
                Reset all
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
