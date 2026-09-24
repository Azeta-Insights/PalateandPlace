import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { KitchenProvider, useKitchen } from './context/KitchenContext';
import { Recipe } from './types/recipe';
import { Navbar, AppView } from './components/Navbar';
import { EditorialHomeScreen } from './components/EditorialHomeScreen';
import { ExploreWorldView } from './components/ExploreWorldView';
import { SurpriseMeModal } from './components/SurpriseMeModal';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { AIChefDrawer } from './components/AIChefDrawer';
import { FoodPassportView } from './components/FoodPassportView';
import { MyKitchenView } from './components/MyKitchenView';
import { WorldUnlockModal } from './components/WorldUnlockModal';
import { AdminConsoleModal } from './components/AdminConsoleModal';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ActiveTimerOverlay, ActiveTimer } from './components/ActiveTimerOverlay';
import { Sparkles, Compass } from 'lucide-react';

function AppContent() {
  const {
    profile,
    isPremium,
    isOnline
  } = useAuth();

  const {
    favorites,
    passport,
    shoppingList,
    downloadedRecipeIds,
    toggleFavorite,
    recordCookedRecipe,
    addToShoppingList,
    downloadRecipe,
    getFullRecipeForView
  } = useKitchen();

  // Navigation view state: default to curated editorial 'home'
  const [currentView, setCurrentView] = useState<AppView>('home');

  // Modals & Drawers state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isSurpriseMeOpen, setIsSurpriseMeOpen] = useState(false);
  const [isAIChefOpen, setIsAIChefOpen] = useState(false);
  const [aiChefInitialPrompt, setAiChefInitialPrompt] = useState<string | undefined>(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Kitchen timers
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);

  const handleUpdateTimer = (id: string, updates: Partial<ActiveTimer>) => {
    setActiveTimers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleRemoveTimer = (id: string) => {
    setActiveTimers(prev => prev.filter(t => t.id !== id));
  };

  const handleStartTimer = (timer: ActiveTimer) => {
    setActiveTimers(prev => [timer, ...prev]);
  };

  const handleOpenChefWithRecipe = (recipe: Recipe, prompt?: string) => {
    setSelectedRecipe(recipe);
    setAiChefInitialPrompt(prompt);
    setIsAIChefOpen(true);
  };

  const handleCountryExploreFromPassport = (_countryName: string) => {
    setCurrentView('explore');
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#231B15] flex flex-col selection:bg-[#C85A32]/20 selection:text-[#231B15]">
      
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenUnlock={() => setIsUnlockOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSurpriseMe={() => setIsSurpriseMeOpen(true)}
        onOpenAIChef={() => {
          setAiChefInitialPrompt(undefined);
          setIsAIChefOpen(true);
        }}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 pb-20 sm:pb-12">
        {currentView === 'home' && (
          <EditorialHomeScreen
            onSelectRecipe={(r) => setSelectedRecipe(r)}
            onOpenExplore={() => {
              setCurrentView('explore');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSurpriseMe={() => setIsSurpriseMeOpen(true)}
            onOpenAIChef={() => {
              setAiChefInitialPrompt(undefined);
              setIsAIChefOpen(true);
            }}
            onOpenUnlockModal={() => setIsUnlockOpen(true)}
            onOpenSearch={() => {
              setCurrentView('explore');
            }}
          />
        )}

        {(currentView === 'explore' || currentView === 'cookbook') && (
          <ExploreWorldView
            onSelectRecipe={(r) => setSelectedRecipe(r)}
            onOpenUnlockModal={() => setIsUnlockOpen(true)}
            onOpenSurpriseMe={() => setIsSurpriseMeOpen(true)}
            onOpenAIChef={() => {
              setAiChefInitialPrompt(undefined);
              setIsAIChefOpen(true);
            }}
          />
        )}

        {currentView === 'passport' && (
          <FoodPassportView
            passport={passport}
            onExploreCountry={handleCountryExploreFromPassport}
            onOpenCookbook={() => setCurrentView('explore')}
          />
        )}

        {currentView === 'kitchen' && (
          <MyKitchenView
            onSelectRecipe={(r) => setSelectedRecipe(r)}
            onOpenUnlockModal={() => setIsUnlockOpen(true)}
          />
        )}
      </main>

      {/* Floating AI Chef Trigger Button (Desktop Only) */}
      <button
        onClick={() => {
          setAiChefInitialPrompt(undefined);
          setIsAIChefOpen(true);
        }}
        className="fixed bottom-6 left-6 z-30 hidden sm:flex px-4 py-3 rounded-full bg-[#231B15] hover:bg-[#3D322A] text-[#FBF9F5] font-semibold text-xs sm:text-sm shadow-xl items-center gap-2 transition-all transform hover:scale-105 active:scale-95 border border-[#E8E1D7]"
      >
        <Sparkles className="w-4 h-4 text-[#E8DAB7]" />
        <span>Ask AI Chef</span>
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAIChef={() => {
          setAiChefInitialPrompt(undefined);
          setIsAIChefOpen(true);
        }}
        onOpenSurpriseMe={() => setIsSurpriseMeOpen(true)}
        countriesVisitedCount={Object.keys(passport).length}
        shoppingListCount={shoppingList.filter(i => !i.checked).length}
        activeTimers={activeTimers}
      />

      {/* Active Kitchen Timers Overlay */}
      <ActiveTimerOverlay
        timers={activeTimers}
        onUpdateTimer={handleUpdateTimer}
        onRemoveTimer={handleRemoveTimer}
      />

      {/* Surprise Me Modal */}
      <SurpriseMeModal
        isOpen={isSurpriseMeOpen}
        onClose={() => setIsSurpriseMeOpen(false)}
        onSelectRecipe={(r) => setSelectedRecipe(r)}
        onOpenUnlock={() => setIsUnlockOpen(true)}
      />

      {/* Detailed Recipe Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          isFavorite={favorites.has(selectedRecipe.recipeId)}
          isDownloaded={downloadedRecipeIds.has(selectedRecipe.recipeId)}
          isPremiumUser={isPremium}
          onClose={() => setSelectedRecipe(null)}
          onToggleFavorite={toggleFavorite}
          onDownload={downloadRecipe}
          onAddToShoppingList={addToShoppingList}
          onCookedRecipe={recordCookedRecipe}
          onStartTimer={handleStartTimer}
          onOpenChefWithRecipe={handleOpenChefWithRecipe}
          onOpenUnlockModal={() => setIsUnlockOpen(true)}
          getFullRecipeForView={getFullRecipeForView}
        />
      )}

      {/* AI Chef Mentor Drawer */}
      <AIChefDrawer
        isOpen={isAIChefOpen}
        onClose={() => setIsAIChefOpen(false)}
        activeRecipe={selectedRecipe}
        userProfile={profile}
        isPremiumUser={isPremium}
        isOnline={isOnline}
        downloadedIds={downloadedRecipeIds}
        onStartTimer={handleStartTimer}
        onOpenUnlockModal={() => setIsUnlockOpen(true)}
        initialPrompt={aiChefInitialPrompt}
      />

      {/* World Unlock Modal */}
      <WorldUnlockModal
        isOpen={isUnlockOpen}
        onClose={() => setIsUnlockOpen(false)}
      />

      {/* Admin / Curator Portal Modal */}
      <AdminConsoleModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Editorial Footer */}
      <footer className="border-t border-[#E8E1D7] bg-[#F7F4EE] py-10 text-[#5E5248] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#C85A32]" />
            <span className="font-serif font-bold text-[#231B15]">Palate & Place</span>
            <span>—</span>
            <span>Discover places through food.</span>
          </div>

          <div className="flex items-center gap-4 text-[#8E8277]">
            <span>50 Free Starter Recipes</span>
            <span>•</span>
            <span>Offline Ready</span>
            <span>•</span>
            <span>World Pass Lifetime</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <KitchenProvider>
        <AppContent />
      </KitchenProvider>
    </AuthProvider>
  );
}
