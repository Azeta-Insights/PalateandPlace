import React from 'react';
import { Home, Globe, Compass, ChefHat, Sparkles, Dices, Timer } from 'lucide-react';
import { ActiveTimer } from './ActiveTimerOverlay';
import { AppView } from './Navbar';

interface MobileBottomNavProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenAIChef: () => void;
  onOpenSurpriseMe?: () => void;
  countriesVisitedCount: number;
  shoppingListCount: number;
  activeTimers: ActiveTimer[];
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenAIChef,
  onOpenSurpriseMe,
  countriesVisitedCount,
  shoppingListCount,
  activeTimers
}) => {
  const hasRunningTimers = activeTimers.some(t => t.isRunning);

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-xl border-t border-[#E8E1D7] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 px-2 shadow-sm"
    >
      <div className="grid grid-cols-5 items-center h-14 max-w-lg mx-auto">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => onSelectView('home')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            currentView === 'home'
              ? 'text-[#C85A32] font-semibold'
              : 'text-[#8E8277] hover:text-[#231B15]'
          }`}
        >
          <Home className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${currentView === 'home' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight mt-1">Journal</span>
          {currentView === 'home' && (
            <span className="absolute bottom-0 w-6 h-0.5 bg-[#C85A32] rounded-full" />
          )}
        </button>

        {/* Tab 2: Explore */}
        <button
          onClick={() => onSelectView('explore')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            currentView === 'explore' || currentView === 'cookbook'
              ? 'text-[#C85A32] font-semibold'
              : 'text-[#8E8277] hover:text-[#231B15]'
          }`}
        >
          <Globe className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${currentView === 'explore' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight mt-1">Atlas</span>
          {(currentView === 'explore' || currentView === 'cookbook') && (
            <span className="absolute bottom-0 w-6 h-0.5 bg-[#C85A32] rounded-full" />
          )}
        </button>

        {/* Tab 3: Surprise / Center Action */}
        <button
          onClick={onOpenSurpriseMe || onOpenAIChef}
          className="flex flex-col items-center justify-center h-full min-h-[44px] transition-colors group relative"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#231B15] text-[#FBF9F5] flex items-center justify-center shadow-md group-active:scale-95 transition-transform relative -mt-3.5 border-2 border-[#FBF9F5]">
            {hasRunningTimers ? (
              <Timer className="w-4 h-4 text-[#E8DAB7] animate-pulse" />
            ) : (
              <Dices className="w-4 h-4 text-[#E8DAB7]" />
            )}
            {hasRunningTimers && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C85A32] rounded-full ring-2 ring-[#FBF9F5] animate-ping" />
            )}
          </div>
          <span className="text-[10px] tracking-tight text-[#231B15] font-medium mt-1">Surprise</span>
        </button>

        {/* Tab 4: Passport */}
        <button
          onClick={() => onSelectView('passport')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            currentView === 'passport'
              ? 'text-[#C85A32] font-semibold'
              : 'text-[#8E8277] hover:text-[#231B15]'
          }`}
        >
          <div className="relative">
            <Compass className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${currentView === 'passport' ? 'scale-110' : ''}`} />
            {countriesVisitedCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 bg-[#5C6B38] text-white text-[8px] font-bold rounded-full">
                {countriesVisitedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Passport</span>
          {currentView === 'passport' && (
            <span className="absolute bottom-0 w-6 h-0.5 bg-[#C85A32] rounded-full" />
          )}
        </button>

        {/* Tab 5: My Kitchen */}
        <button
          onClick={() => onSelectView('kitchen')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            currentView === 'kitchen'
              ? 'text-[#C85A32] font-semibold'
              : 'text-[#8E8277] hover:text-[#231B15]'
          }`}
        >
          <div className="relative">
            <ChefHat className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${currentView === 'kitchen' ? 'scale-110' : ''}`} />
            {shoppingListCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-[#F4F0E8] text-[#231B15] text-[8px] font-bold rounded-full border border-[#E8E1D7]">
                {shoppingListCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Kitchen</span>
          {currentView === 'kitchen' && (
            <span className="absolute bottom-0 w-6 h-0.5 bg-[#C85A32] rounded-full" />
          )}
        </button>

      </div>
    </nav>
  );
};
