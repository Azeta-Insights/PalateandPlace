import React, { useState } from 'react';
import { 
  Compass, 
  Award, 
  Globe, 
  Calendar, 
  Utensils, 
  CheckCircle2, 
  Share2, 
  Search, 
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { PassportCountry, Continent } from '../types/recipe';
import { COUNTRIES_DATABASE } from '../data/premiumCatalogData';

interface FoodPassportViewProps {
  passport: Record<string, PassportCountry>;
  onExploreCountry: (countryName: string) => void;
  onOpenCookbook: () => void;
}

export const FoodPassportView: React.FC<FoodPassportViewProps> = ({
  passport,
  onExploreCountry,
  onOpenCookbook
}) => {
  const [selectedContinentFilter, setSelectedContinentFilter] = useState<Continent | 'All'>('All');

  const visitedCountries = Object.values(passport);
  const totalVisited = visitedCountries.length;
  const totalDishesCooked = visitedCountries.reduce((acc, c) => acc + c.recipesCooked, 0);

  // Continents visited
  const visitedContinents = new Set(visitedCountries.map(c => c.continent));

  // Continents Explorer Badges
  const continentBadges: Array<{ id: string; name: string; continent: Continent; icon: string; unlocked: boolean }> = [
    { id: 'africa', name: 'African Hearth', continent: 'Africa', icon: '🌍', unlocked: visitedContinents.has('Africa') },
    { id: 'asia', name: 'Silk Route Master', continent: 'Asia', icon: '🥢', unlocked: visitedContinents.has('Asia') },
    { id: 'europe', name: 'Old World Gourmet', continent: 'Europe', icon: '🏛️', unlocked: visitedContinents.has('Europe') },
    { id: 'na', name: 'New World Explorer', continent: 'North America', icon: '🌮', unlocked: visitedContinents.has('North America') },
    { id: 'sa', name: 'Andean Asador', continent: 'South America', icon: '🥩', unlocked: visitedContinents.has('South America') },
    { id: 'oceania', name: 'Pacific Voyager', continent: 'Oceania', icon: '🏝️', unlocked: visitedContinents.has('Oceania') }
  ];

  const isGlobeTrotter = continentBadges.every(b => b.unlocked);

  // Filter countries
  const filteredCountries = COUNTRIES_DATABASE.filter(c => {
    if (selectedContinentFilter !== 'All' && c.continent !== selectedContinentFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200">
      
      {/* Passport Book Cover Header */}
      <div className="relative rounded-2xl bg-[#F7F4EE] border border-[#E8E1D7] p-6 sm:p-10 shadow-sm overflow-hidden">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C85A32] uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5" />
              <span>Food Passport</span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#231B15] tracking-tight">
              Food Passport
            </h1>
            
            <p className="text-xs sm:text-sm text-[#5E5248] max-w-xl leading-relaxed">
              Every time you prepare a recipe, stamp this culinary journal with that nation’s seal. 
              Track your authentic cooking journey across 52 countries and all 6 continental hearths.
            </p>
          </div>

          {/* Clean Editorial Stats Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-[#E8E1D7] shadow-sm">
            <div className="text-center p-2">
              <p className="font-mono text-2xl sm:text-3xl font-bold text-[#C85A32]">{totalVisited}</p>
              <p className="text-[11px] text-[#8E8277] mt-0.5 uppercase tracking-wider font-medium">Nations</p>
            </div>
            <div className="text-center p-2">
              <p className="font-mono text-2xl sm:text-3xl font-bold text-[#231B15]">{totalDishesCooked}</p>
              <p className="text-[11px] text-[#8E8277] mt-0.5 uppercase tracking-wider font-medium">Cooked</p>
            </div>
            <div className="text-center p-2">
              <p className="font-mono text-2xl sm:text-3xl font-bold text-[#5C6B38]">{visitedContinents.size}/6</p>
              <p className="text-[11px] text-[#8E8277] mt-0.5 uppercase tracking-wider font-medium">Continents</p>
            </div>
            <div className="text-center p-2">
              <p className="font-mono text-2xl sm:text-3xl font-bold text-[#231B15]">
                {Math.round((totalVisited / COUNTRIES_DATABASE.length) * 100)}%
              </p>
              <p className="text-[11px] text-[#8E8277] mt-0.5 uppercase tracking-wider font-medium">World Map</p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTINENT EXPLORER BADGES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C85A32]" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#231B15]">
              Continental Milestones
            </h2>
          </div>
          {isGlobeTrotter && (
            <span className="text-xs px-3 py-1 rounded-md bg-[#FAF5E8] border border-[#E8DAB7] text-[#9E740B] font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Master Globe Trotter (6/6)</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {continentBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border text-center transition-all ${
                badge.unlocked
                  ? 'bg-white border-[#5C6B38] shadow-sm'
                  : 'bg-white/60 border-[#E8E1D7] opacity-60'
              }`}
            >
              <div className="text-2xl mb-2">{badge.icon}</div>
              <p className="font-serif font-bold text-xs text-[#231B15] line-clamp-1">{badge.name}</p>
              <p className="text-[10px] text-[#8E8277] mt-0.5">{badge.continent}</p>
              <span className={`inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded ${
                badge.unlocked ? 'bg-[#F2F5EC] text-[#5C6B38] border border-[#D5DEBF]' : 'bg-[#F4F0E8] text-[#8E8277]'
              }`}>
                {badge.unlocked ? 'Stamped' : 'Unexplored'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PASSPORT STAMPS GRID */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E1D7]">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#231B15]">
              National Stamps & Regional Heritage
            </h2>
            <p className="text-xs text-[#8E8277] mt-0.5">
              Select any nation to discover authentic dishes or view your cooking journal.
            </p>
          </div>

          {/* Continent Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {['All', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedContinentFilter(c as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedContinentFilter === c
                    ? 'bg-[#231B15] text-[#FBF9F5] border-[#231B15]'
                    : 'bg-white text-[#5E5248] border-[#E8E1D7] hover:border-[#231B15]/40'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Countries Stamp Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCountries.map((c) => {
            const stampedInfo = passport[c.code];
            const isStamped = !!stampedInfo;

            return (
              <div
                key={c.code}
                onClick={() => onExploreCountry(c.country)}
                className={`group relative p-5 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                  isStamped
                    ? 'bg-white border-[#5C6B38]/60 hover:border-[#5C6B38] shadow-sm hover:shadow-md'
                    : 'bg-white/70 border-[#E8E1D7] hover:border-[#231B15]/40 hover:bg-white'
                }`}
              >
                {/* Vintage postal stamp watermark */}
                {isStamped && (
                  <div className="absolute top-3 right-3 w-14 h-14 rounded-full border-2 border-[#5C6B38]/30 flex items-center justify-center rotate-12 pointer-events-none">
                    <div className="w-11 h-11 rounded-full border border-dashed border-[#5C6B38]/40 flex flex-col items-center justify-center text-[8px] font-mono text-[#5C6B38] font-bold uppercase tracking-tighter">
                      <span>PASSPORT</span>
                      <span>STAMPED</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#C85A32]">{c.code}</span>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#231B15] group-hover:text-[#C85A32] transition-colors">
                        {c.country}
                      </h3>
                    </div>
                    <p className="text-xs text-[#8E8277] mt-0.5">
                      {c.cuisine} Cuisine · {c.region}
                    </p>
                  </div>
                </div>

                {isStamped ? (
                  <div className="mt-4 pt-3 border-t border-[#E8E1D7] space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#5E5248]">
                      <span className="flex items-center gap-1.5 text-[#5C6B38] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cooked {stampedInfo.recipesCooked} {stampedInfo.recipesCooked === 1 ? 'dish' : 'dishes'}
                      </span>
                      <span className="text-[11px] text-[#8E8277]">
                        {new Date(stampedInfo.lastCookedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {stampedInfo.dishNames.slice(0, 2).map((d, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#F4F0E8] text-[#5E5248] font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-[#E8E1D7] flex items-center justify-between text-xs text-[#8E8277]">
                    <span>Awaiting your culinary arrival</span>
                    <span className="text-[#C85A32] group-hover:underline flex items-center gap-0.5 text-xs font-medium">
                      Cook this country →
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
