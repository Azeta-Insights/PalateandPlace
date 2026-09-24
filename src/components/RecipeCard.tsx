import React from 'react';
import { Clock, Flame, Heart, Download, CheckCircle2, Lock, ChefHat } from 'lucide-react';
import { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite?: boolean;
  isDownloaded?: boolean;
  isPremiumUser?: boolean;
  onSelect: (recipe: Recipe) => void;
  onToggleFavorite?: (recipeId: string, e?: React.MouseEvent) => void;
  onDownload?: (recipeId: string, e?: React.MouseEvent) => void;
  onOpenUnlockModal?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite = false,
  isDownloaded = false,
  isPremiumUser = false,
  onSelect,
  onToggleFavorite,
  onDownload,
  onOpenUnlockModal
}) => {
  const isLocked = recipe.isPremium && !isPremiumUser;
  const isOfflineReady = recipe.isStarter || isDownloaded;

  const handleClick = () => {
    if (isLocked && onOpenUnlockModal) {
      onOpenUnlockModal();
    } else {
      onSelect(recipe);
    }
  };

  return (
    <article
      onClick={handleClick}
      className={`group relative bg-[#FFFDF8] rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col ${
        isLocked
          ? 'border-[#E6DEC8] hover:border-[#B85C3A]/40 shadow-xs'
          : 'border-[#E6DEC8] hover:border-[#29231E]/40 hover:shadow-md hover:-translate-y-0.5 shadow-xs'
      }`}
    >
      {/* Editorial Food Photography */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF5EC]">
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Floating Controls */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          {/* Country Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFFDF8]/90 backdrop-blur-md border border-[#E6DEC8] text-[11px] font-medium text-[#29231E] pointer-events-auto shadow-xs font-sans">
            <span className="font-mono text-[#B85C3A] font-semibold">{recipe.countryCode}</span>
            <span className="text-[#D3C7B5]">·</span>
            <span className="truncate max-w-[120px]">{recipe.country}</span>
          </div>

          {/* Quick Actions (Download & Favorite) */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {!isLocked && onDownload && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(recipe.recipeId, e);
                }}
                title={isOfflineReady ? 'Saved for Offline Cooking' : 'Download for Offline Cooking'}
                className={`min-w-[34px] min-h-[34px] p-1.5 flex items-center justify-center rounded-md backdrop-blur-md transition-all active:scale-95 ${
                  isOfflineReady
                    ? 'bg-[#F2F5EC] text-[#68745D] border border-[#D5DEBF]'
                    : 'bg-[#FFFDF8]/90 hover:bg-white text-[#71675D] border border-[#E6DEC8]'
                }`}
              >
                {isOfflineReady ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              </button>
            )}

            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(recipe.recipeId, e);
                }}
                title={isFavorite ? 'Remove from favorites' : 'Save recipe'}
                className={`min-w-[34px] min-h-[34px] p-1.5 flex items-center justify-center rounded-md backdrop-blur-md transition-all active:scale-95 ${
                  isFavorite
                    ? 'bg-[#FDF2ED] text-[#B85C3A] border border-[#F4CEBE]'
                    : 'bg-[#FFFDF8]/90 hover:bg-white text-[#71675D] border border-[#E6DEC8]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#B85C3A] text-[#B85C3A]' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Image Overlay */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-white pointer-events-none">
          {recipe.isStarter ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#68745D]/90 text-[10px] font-medium text-white shadow-xs backdrop-blur-xs font-sans">
              <ChefHat className="w-3 h-3" />
              <span>Starter Dish</span>
            </span>
          ) : isLocked ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#29231E]/90 text-[#D3C7B5] border border-[#B18A58]/40 text-[10px] font-medium shadow-xs backdrop-blur-xs font-sans">
              <Lock className="w-3 h-3 text-[#B18A58]" />
              <span>World Pass</span>
            </span>
          ) : (
            <span className="text-[11px] font-medium text-white/90 drop-shadow-xs font-sans">
              {recipe.mealType}
            </span>
          )}

          {recipe.spiceLevel > 0 && (
            <div className="flex items-center gap-0.5 text-white drop-shadow-xs" title={`Spice Level: ${recipe.spiceLevel}/5`}>
              {Array.from({ length: Math.min(3, recipe.spiceLevel) }).map((_, i) => (
                <Flame key={i} className="w-3 h-3 fill-[#B85C3A] text-[#B85C3A]" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recipe Text & Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#29231E] group-hover:text-[#B85C3A] transition-colors line-clamp-1">
              {recipe.title}
            </h3>
          </div>

          {recipe.alternateName && (
            <p className="font-serif text-xs sm:text-sm text-[#71675D] italic line-clamp-1 mt-0.5">
              {recipe.alternateName}
            </p>
          )}

          <p className="text-xs text-[#71675D] line-clamp-2 mt-2 leading-relaxed font-sans">
            {recipe.description}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="mt-4 pt-3 border-t border-[#E6DEC8] flex items-center justify-between text-xs text-[#71675D] font-sans">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-[#29231E]">{recipe.totalTime} mins</span>
            <span>·</span>
            <span>{recipe.difficulty}</span>
          </div>

          <div className="flex items-center gap-1.5 truncate max-w-[140px]">
            {recipe.dietaryTags.slice(0, 1).map(tag => (
              <span key={tag} className="text-[11px] text-[#68745D] font-medium truncate">
                {tag}
              </span>
            ))}
            {recipe.isStarter && (
              <span className="text-[10px] text-[#71675D] font-mono">Offline</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
