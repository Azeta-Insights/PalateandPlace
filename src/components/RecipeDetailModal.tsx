import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Flame, 
  Users, 
  Plus, 
  Minus, 
  Heart, 
  Download, 
  CheckCircle2, 
  ShoppingBag, 
  Sparkles, 
  Maximize2, 
  Award, 
  Compass, 
  Utensils, 
  Info, 
  ChefHat,
  RotateCcw,
  Star,
  Check,
  Camera,
  Trash2,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  List,
  ChevronLeft,
  ChevronRight,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Recipe, Ingredient } from '../types/recipe';
import { ActiveTimer } from './ActiveTimerOverlay';
import { useKitchen } from '../context/KitchenContext';

interface RecipeDetailModalProps {
  recipe: Recipe;
  isFavorite?: boolean;
  isDownloaded?: boolean;
  isPremiumUser?: boolean;
  onClose: () => void;
  onToggleFavorite?: (recipeId: string) => void;
  onDownload?: (recipe: Recipe) => void;
  onAddToShoppingList?: (recipe: Recipe) => void;
  onCookedRecipe?: (data: {
    recipeId: string;
    recipeTitle: string;
    country: string;
    countryCode: string;
    continent: any;
    servingsCooked: number;
    rating: number;
    notes?: string;
    photoUrl?: string;
  }, photoFile?: File | Blob) => void;
  onStartTimer: (timer: ActiveTimer) => void;
  onOpenChefWithRecipe: (recipe: Recipe, prompt?: string) => void;
  onOpenUnlockModal?: () => void;
  getFullRecipeForView?: (recipeId: string) => Promise<Recipe | undefined>;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe: initialRecipe,
  isFavorite,
  isDownloaded,
  isPremiumUser = false,
  onClose,
  onToggleFavorite,
  onDownload,
  onAddToShoppingList,
  onCookedRecipe,
  onStartTimer,
  onOpenChefWithRecipe,
  onOpenUnlockModal,
  getFullRecipeForView
}) => {
  const {
    favorites,
    downloadedRecipeIds,
    toggleFavorite,
    addToShoppingList,
    downloadRecipe,
    recordCookedRecipe,
    getFullRecipeForView: kitchenGetFullRecipe
  } = useKitchen();

  const isFav = isFavorite !== undefined ? isFavorite : favorites.has(initialRecipe.recipeId);
  const isDl = isDownloaded !== undefined ? isDownloaded : downloadedRecipeIds.has(initialRecipe.recipeId);
  const fetchFullRecipe = getFullRecipeForView || kitchenGetFullRecipe;

  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [isLoadingFullRecipe, setIsLoadingFullRecipe] = useState(false);

  // Load full recipe from IndexedDB or API if it is currently a summary
  useEffect(() => {
    setRecipe(initialRecipe);
    if ((!initialRecipe.ingredients || initialRecipe.ingredients.length === 0) && fetchFullRecipe) {
      setIsLoadingFullRecipe(true);
      fetchFullRecipe(initialRecipe.recipeId).then(full => {
        if (full) {
          setRecipe(full);
        }
        setIsLoadingFullRecipe(false);
      }).catch(() => {
        setIsLoadingFullRecipe(false);
      });
    }
  }, [initialRecipe, fetchFullRecipe]);

  // Servings Scaler state
  const [servings, setServings] = useState(initialRecipe.servings || 4);
  const scalingFactor = servings / (recipe.servings || 4);

  // Unit toggle: 'metric' | 'imperial'
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  // Interactive Checklist
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Distraction-free Cooking Mode (Strictly DARK, high-contrast theme)
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showIngredientsInCooking, setShowIngredientsInCooking] = useState(false);
  const [isSpeakingStep, setIsSpeakingStep] = useState(false);

  // Stop speech when step or mode changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeStepIndex, isCookingMode]);

  const toggleSpeakStep = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeakingStep) {
      window.speechSynthesis.cancel();
      setIsSpeakingStep(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeakingStep(false);
    utterance.onerror = () => setIsSpeakingStep(false);
    setIsSpeakingStep(true);
    window.speechSynthesis.speak(utterance);
  };

  // "I Cooked This" Completion Modal State
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [cookingNotes, setCookingNotes] = useState('');
  const [mealPhotoFile, setMealPhotoFile] = useState<File | null>(null);
  const [mealPhotoPreview, setMealPhotoPreview] = useState<string | null>(null);
  const [hasRecordedCompletion, setHasRecordedCompletion] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMealPhotoFile(file);
    setMealPhotoPreview(URL.createObjectURL(file));
  };

  // Added to shopping list toast state
  const [addedToListToast, setAddedToListToast] = useState(false);

  // Keyboard Escape and browser Back listener for seamless navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCookingMode) {
          setIsCookingMode(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    window.history.pushState({ modal: `recipe-${recipe.recipeId}` }, '');
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose, isCookingMode, recipe.recipeId]);

  // Unit conversion helper
  const formatScaledAmount = (amount: number, unit: string) => {
    let scaled = amount * scalingFactor;
    let finalUnit = unit;

    if (unitSystem === 'imperial') {
      if (unit === 'g') {
        scaled = scaled * 0.035274;
        finalUnit = scaled >= 16 ? 'lb' : 'oz';
        if (finalUnit === 'lb') scaled = scaled / 16;
      } else if (unit === 'ml') {
        scaled = scaled * 0.033814;
        finalUnit = 'fl oz';
      }
    }

    const rounded = Math.round(scaled * 10) / 10;
    return `${rounded} ${finalUnit}`;
  };

  const toggleCheckIngredient = (index: number) => {
    const next = new Set(checkedIngredients);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCheckedIngredients(next);
  };

  const toggleCompleteStep = (stepNumber: number) => {
    const next = new Set(completedSteps);
    if (next.has(stepNumber)) next.delete(stepNumber);
    else next.add(stepNumber);
    setCompletedSteps(next);
  };

  const handleStartStepTimer = (minutes: number, label: string) => {
    onStartTimer({
      id: `timer-${Date.now()}`,
      label: `${recipe.title}: ${label}`,
      totalSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      isRunning: true
    });
  };

  const handleCompleteDish = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    const completionData = {
      recipeId: recipe.recipeId,
      recipeTitle: recipe.title,
      country: recipe.country,
      countryCode: recipe.countryCode,
      continent: recipe.continent,
      servingsCooked: servings,
      rating: userRating,
      notes: cookingNotes,
      photoUrl: mealPhotoPreview || undefined
    };

    if (onCookedRecipe) {
      onCookedRecipe(completionData, mealPhotoFile || undefined);
    } else {
      recordCookedRecipe(completionData, mealPhotoFile || undefined);
    }

    setHasRecordedCompletion(true);
    setShowCompletionModal(false);
  };

  const handleToggleFav = () => {
    if (onToggleFavorite) {
      onToggleFavorite(recipe.recipeId);
    } else {
      toggleFavorite(recipe.recipeId);
    }
  };

  const handleShoppingListClick = () => {
    if (onAddToShoppingList) {
      onAddToShoppingList(recipe);
    } else {
      addToShoppingList(recipe);
    }
    setAddedToListToast(true);
    setTimeout(() => setAddedToListToast(false), 2500);
  };

  // -------------------------------------------------------------
  // DISTRACTION-FREE COOKING MODE (Strictly DARK, high-contrast theme)
  // -------------------------------------------------------------
  if (isCookingMode) {
    const totalSteps = recipe.preparationSteps.length;
    const safeStepNumber = activeStepIndex + 1;
    const currentStep = recipe.preparationSteps[activeStepIndex] || recipe.preparationSteps[0];
    const isCurrentStepDone = completedSteps.has(safeStepNumber);

    return (
      <div className="fixed inset-0 z-50 bg-[#0F0D0B] text-[#FBF9F5] flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCookingMode(false)}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors"
              title="Exit cooking mode"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] font-mono text-[#C85A32] uppercase tracking-wider">
                Cooking Mode · {recipe.country}
              </p>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {recipe.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIngredientsInCooking(!showIngredientsInCooking)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                showIngredientsInCooking
                  ? 'bg-[#C85A32] text-white border-[#C85A32]'
                  : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Ingredients</span>
            </button>

            <button
              onClick={() => onOpenChefWithRecipe(recipe, `I am cooking ${recipe.title} (Step ${safeStepNumber}). Can you help me?`)}
              className="px-3.5 py-2 rounded-xl bg-[#C85A32]/20 hover:bg-[#C85A32]/30 text-[#E8DAB7] border border-[#C85A32]/50 text-xs font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#C85A32]" />
              <span className="hidden sm:inline">Ask AI Chef</span>
            </button>
          </div>
        </div>

        {/* Center Step Workspace */}
        <div className="my-auto max-w-4xl mx-auto w-full py-6 space-y-6">
          {showIngredientsInCooking ? (
            <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <h3 className="font-serif text-lg font-bold text-white">Recipe Ingredients</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-stone-300">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 flex justify-between">
                    <span>{ing.name}</span>
                    <span className="font-mono text-[#E8DAB7]">{formatScaledAmount(ing.amount, ing.unit)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-xs font-mono text-[#E8DAB7]">
                <span>Step {safeStepNumber} of {totalSteps}</span>
                <span>•</span>
                <span>{isCurrentStepDone ? 'Completed' : 'In Progress'}</span>
              </div>

              <p className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl mx-auto">
                {currentStep?.instruction}
              </p>

              {currentStep?.tip && (
                <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 max-w-xl mx-auto text-xs sm:text-sm text-stone-300 italic flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C85A32] shrink-0" />
                  <span>{currentStep.tip}</span>
                </div>
              )}

              {currentStep?.timerMinutes && (
                <div className="pt-2">
                  <button
                    onClick={() => handleStartStepTimer(currentStep.timerMinutes!, `Step ${safeStepNumber}`)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#C85A32] hover:bg-[#B34E2A] text-white font-bold text-sm shadow-xl transition-all"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Start {currentStep.timerMinutes}-Minute Timer</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Step Navigation Bar */}
        <div className="border-t border-stone-800 pt-4 flex items-center justify-between gap-4">
          <button
            disabled={activeStepIndex === 0}
            onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
            className="px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-stone-300 text-xs sm:text-sm font-semibold border border-stone-800 flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => {
              toggleCompleteStep(safeStepNumber);
              if (activeStepIndex < totalSteps - 1) {
                setActiveStepIndex(activeStepIndex + 1);
              } else {
                setIsCookingMode(false);
                setShowCompletionModal(true);
              }
            }}
            className="px-6 py-3 rounded-xl bg-[#C85A32] hover:bg-[#B34E2A] text-white font-bold text-xs sm:text-sm shadow-lg flex items-center gap-1.5"
          >
            <span>{activeStepIndex === totalSteps - 1 ? 'Finish & Stamp Passport' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STANDARD RECIPE VIEW (Warm Editorial Ivory & Espresso Styling)
  // -------------------------------------------------------------
  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#FBF9F5] sm:rounded-2xl border-0 sm:border sm:border-[#E8E1D7] shadow-2xl overflow-hidden h-full sm:h-auto sm:max-h-[92vh] flex flex-col"
      >
        
        {/* Top Control Bar */}
        <div className="absolute top-4 inset-x-4 sm:inset-x-6 z-20 flex items-center justify-between pointer-events-none">
          {/* Country Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#231B15]/85 backdrop-blur-md text-xs font-semibold text-[#FBF9F5] pointer-events-auto border border-black/20">
            <Compass className="w-3.5 h-3.5 text-[#E8DAB7]" />
            <span>{recipe.country}</span>
            <span className="text-[#8E8277]">·</span>
            <span className="text-[#E8DAB7]">{recipe.continent}</span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Cooking Mode Button */}
            <button
              onClick={() => setIsCookingMode(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#231B15] hover:bg-[#3D322A] text-[#FBF9F5] text-xs font-medium shadow-md transition-all"
              title="Enter dark distraction-free cooking mode"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#E8DAB7]" />
              <span className="hidden sm:inline">Cooking Mode</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleToggleFav}
              className={`p-2 rounded-lg backdrop-blur-md transition-all ${
                isFav
                  ? 'bg-white text-[#C85A32] border border-[#C85A32]'
                  : 'bg-[#231B15]/85 hover:bg-[#231B15] text-[#FBF9F5] border border-black/20'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-[#C85A32]' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#231B15]/85 hover:bg-[#231B15] text-[#FBF9F5] border border-black/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Recipe Body */}
        <div className="overflow-y-auto flex-1 overscroll-contain pb-28 sm:pb-8">
          
          {/* Hero Image Section */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-[#EAE4D9]">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#231B15]/80 via-black/30 to-transparent" />

            <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-8">
              <span className="text-[11px] font-mono text-[#E8DAB7] tracking-wider uppercase">
                Traditional Recipe #{recipe.recipeId}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
                {recipe.title}
              </h2>
              {recipe.alternateName && (
                <p className="text-xs sm:text-sm text-[#E8DAB7] italic mt-0.5">
                  {recipe.alternateName}
                </p>
              )}
            </div>
          </div>

          {/* Core Content */}
          <div className="p-4 sm:p-8 space-y-8">
            
            {/* Quick Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-[#E8E1D7] flex items-center gap-3 shadow-sm">
                <div className="p-2 rounded-lg bg-[#F7F4EE] text-[#C85A32]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8E8277]">Prep / Cook</p>
                  <p className="text-xs sm:text-sm font-bold text-[#231B15]">{recipe.prepTime}m / {recipe.cookTime}m</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E8E1D7] flex items-center gap-3 shadow-sm">
                <div className="p-2 rounded-lg bg-[#F7F4EE] text-[#C85A32]">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8E8277]">Spice Level</p>
                  <p className="text-xs sm:text-sm font-bold text-[#231B15]">
                    {recipe.spiceLevel === 0 ? 'Mild' : `${recipe.spiceLevel} / 5`}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E8E1D7] flex items-center gap-3 shadow-sm">
                <div className="p-2 rounded-lg bg-[#F7F4EE] text-[#5C6B38]">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8E8277]">Difficulty</p>
                  <p className="text-xs sm:text-sm font-bold text-[#231B15]">{recipe.difficulty}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E8E1D7] flex items-center gap-3 shadow-sm">
                <div className="p-2 rounded-lg bg-[#F7F4EE] text-[#5C6B38]">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#8E8277]">Offline</p>
                  <p className="text-xs sm:text-sm font-bold text-[#5C6B38]">
                    {recipe.isStarter || isDl ? 'Available Offline' : 'Online View'}
                  </p>
                </div>
              </div>
            </div>

            {/* Cultural Background & Story */}
            <div className="p-5 rounded-xl bg-[#F7F4EE] border border-[#E8E1D7] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#C85A32] uppercase tracking-wider">
                <Info className="w-4 h-4" />
                <span>Cultural Heritage & Origins</span>
              </div>
              <p className="font-editorial text-sm sm:text-base text-[#231B15] leading-relaxed">
                {recipe.culturalBackground}
              </p>
              <p className="text-xs text-[#5E5248] italic pt-1 border-t border-[#E8E1D7]/60">
                {recipe.description}
              </p>
            </div>

            {/* Ingredients Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E1D7]">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-xl font-bold text-[#231B15]">
                    Ingredients
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-[#F4F0E8] text-[#5E5248] font-mono">
                    {recipe.ingredients.length} items
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Servings Scaler */}
                  <div className="flex items-center bg-white rounded-lg border border-[#E8E1D7] p-1">
                    <span className="text-xs text-[#8E8277] px-2 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Serves
                    </span>
                    <button
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="p-1 rounded hover:bg-[#F4F0E8] text-[#231B15]"
                      title="Decrease servings"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center font-bold text-xs text-[#231B15]">
                      {servings}
                    </span>
                    <button
                      onClick={() => setServings(servings + 1)}
                      className="p-1 rounded hover:bg-[#F4F0E8] text-[#231B15]"
                      title="Increase servings"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Unit Switcher */}
                  <div className="flex bg-white rounded-lg border border-[#E8E1D7] p-1 text-xs">
                    <button
                      onClick={() => setUnitSystem('metric')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        unitSystem === 'metric' ? 'bg-[#231B15] text-white font-semibold' : 'text-[#8E8277]'
                      }`}
                    >
                      Metric
                    </button>
                    <button
                      onClick={() => setUnitSystem('imperial')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        unitSystem === 'imperial' ? 'bg-[#231B15] text-white font-semibold' : 'text-[#8E8277]'
                      }`}
                    >
                      Imperial
                    </button>
                  </div>
                </div>
              </div>

              {/* Ingredient Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {recipe.ingredients.map((ing, idx) => {
                  const isChecked = checkedIngredients.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheckIngredient(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isChecked
                          ? 'bg-[#F4F0E8]/60 border-[#E8E1D7] opacity-60 line-through'
                          : 'bg-white border-[#E8E1D7] hover:border-[#231B15]/40 shadow-sm'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        isChecked ? 'bg-[#5C6B38] border-[#5C6B38] text-white' : 'border-[#D8CEBE]'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-[#231B15] text-xs sm:text-sm">
                          {formatScaledAmount(ing.amount, ing.unit)}
                        </span>
                        <span className="text-[#231B15] text-xs sm:text-sm ml-1.5">
                          {ing.name}
                        </span>
                        {ing.notes && (
                          <p className="text-[11px] text-[#8E8277] italic mt-0.5">
                            {ing.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shopping List Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleShoppingListClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-[#F4F0E8] text-[#231B15] border border-[#E8E1D7] text-xs font-semibold transition-all shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C85A32]" />
                  <span>{addedToListToast ? '✓ Added to Shopping List!' : 'Add All to Shopping List'}</span>
                </button>

                <button
                  onClick={() => onOpenChefWithRecipe(recipe, `What substitutions can I make for ${recipe.title}?`)}
                  className="text-xs text-[#C85A32] hover:underline flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Missing an ingredient? Ask Chef
                </button>
              </div>
            </div>

            {/* Preparation Steps Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D7]">
                <h3 className="font-serif text-xl font-bold text-[#231B15]">
                  Step-by-Step Preparation
                </h3>
                <span className="text-xs text-[#8E8277] font-mono">
                  {completedSteps.size} of {recipe.preparationSteps.length} completed
                </span>
              </div>

              <div className="space-y-3">
                {recipe.preparationSteps.map((step) => {
                  const isDone = completedSteps.has(step.stepNumber);
                  return (
                    <div
                      key={step.stepNumber}
                      className={`p-4 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-[#F4F0E8]/50 border-[#E8E1D7] opacity-70'
                          : 'bg-white border-[#E8E1D7] hover:border-[#231B15]/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleCompleteStep(step.stepNumber)}
                          className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isDone
                              ? 'bg-[#5C6B38] text-white'
                              : 'bg-[#F4F0E8] text-[#5E5248] hover:bg-[#EAE4D9]'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.stepNumber}
                        </button>

                        <div className="space-y-2 flex-1">
                          <p className={`text-xs sm:text-sm leading-relaxed ${isDone ? 'line-through text-[#8E8277]' : 'text-[#231B15]'}`}>
                            {step.instruction}
                          </p>

                          {step.timerMinutes && (
                            <button
                              onClick={() => handleStartStepTimer(step.timerMinutes!, `Step ${step.stepNumber}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F7F4EE] hover:bg-[#EAE4D9] border border-[#E8E1D7] text-[#C85A32] text-xs font-semibold transition-all"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Start {step.timerMinutes}m Timer</span>
                            </button>
                          )}

                          {step.tip && (
                            <div className="p-2.5 rounded-lg bg-[#FBF9F5] border border-[#E8E1D7] text-xs text-[#5E5248] flex items-start gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-[#C85A32] shrink-0 mt-0.5" />
                              <span>{step.tip}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-[#E8E1D7] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => onOpenChefWithRecipe(recipe)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-[#F4F0E8] text-[#231B15] border border-[#E8E1D7] text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#C85A32]" />
                <span>Ask AI Mentor About This Recipe</span>
              </button>

              <button
                onClick={() => setShowCompletionModal(true)}
                disabled={hasRecordedCompletion}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all ${
                  hasRecordedCompletion
                    ? 'bg-[#F2F5EC] text-[#5C6B38] border border-[#D5DEBF] cursor-default'
                    : 'bg-[#231B15] hover:bg-[#3D322A] text-[#FBF9F5]'
                }`}
              >
                <Award className="w-4 h-4 text-[#E8DAB7]" />
                <span>{hasRecordedCompletion ? '✓ Stamped in Food Passport!' : 'I Cooked This (Stamp Passport)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* "I COOKED THIS" COMPLETION MODAL */}
        {showCompletionModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl border border-[#E8E1D7] p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-xl bg-[#F7F4EE] border border-[#E8E1D7] text-[#C85A32] flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#231B15]">
                  Congratulations, Chef!
                </h3>
                <p className="text-xs text-[#5E5248]">
                  You just brought {recipe.country} into your kitchen. Stamp your Food Passport and save your personal review.
                </p>
              </div>

              {/* Star Rating */}
              <div className="space-y-1 text-center">
                <label className="text-xs font-semibold text-[#231B15]">How did it turn out?</label>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 text-[#D8CEBE] hover:text-[#B8860B] transition-colors"
                    >
                      <Star className={`w-6 h-6 ${star <= userRating ? 'fill-[#B8860B] text-[#B8860B]' : 'text-[#D8CEBE]'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Cooking Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#231B15]">Personal Tasting Notes (optional)</label>
                <textarea
                  value={cookingNotes}
                  onChange={(e) => setCookingNotes(e.target.value)}
                  placeholder="e.g. Added extra cardamom, perfectly balanced texture..."
                  rows={2}
                  className="w-full p-3 rounded-lg bg-[#FBF9F5] border border-[#E8E1D7] text-xs text-[#231B15] placeholder-[#8E8277] focus:outline-none focus:border-[#231B15]"
                />
              </div>

              {/* Meal Photo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#231B15] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>Dish Photo (optional)</span>
                  </span>
                  {mealPhotoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setMealPhotoPreview(null);
                        setMealPhotoFile(null);
                      }}
                      className="text-[11px] text-[#C85A32] hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </label>

                {mealPhotoPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#E8E1D7] h-28 bg-[#F4F0E8]">
                    <img
                      src={mealPhotoPreview}
                      alt="Cooked Dish"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <label className="cursor-pointer flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-[#D8CEBE] hover:border-[#231B15] bg-[#FBF9F5] transition-all text-xs text-[#8E8277] hover:text-[#231B15]">
                    <Camera className="w-4 h-4 text-[#C85A32]" />
                    <span>Snap or upload your finished dish</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#F4F0E8] hover:bg-[#EAE4D9] text-[#5E5248] text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteDish}
                  className="flex-1 py-2.5 rounded-lg bg-[#231B15] hover:bg-[#3D322A] text-white text-xs font-semibold shadow-sm"
                >
                  Stamp Passport
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
