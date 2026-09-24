import React, { useState } from 'react';
import { 
  Compass, 
  BookOpen, 
  Sparkles, 
  User, 
  LogOut, 
  Shield, 
  Wifi, 
  WifiOff, 
  Crown, 
  Menu, 
  X, 
  Bookmark, 
  ShoppingBag, 
  History, 
  Settings,
  Globe,
  Dices,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useKitchen } from '../context/KitchenContext';

export type AppView = 'home' | 'explore' | 'cookbook' | 'passport' | 'kitchen';

interface NavbarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenAuth: () => void;
  onOpenUnlock: () => void;
  onOpenAdmin: () => void;
  onOpenAIChef: () => void;
  onOpenSurpriseMe?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  onOpenAuth,
  onOpenUnlock,
  onOpenAdmin,
  onOpenAIChef,
  onOpenSurpriseMe
}) => {
  const { user, profile, isOnline, isAdmin, isPremium, signOut } = useAuth();
  const { passport, shoppingList, favorites } = useKitchen();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const countriesVisitedCount = Object.keys(passport).length;
  const uncheckedShoppingCount = shoppingList.filter(i => !i.checked).length;

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E8E1D7] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Zone 1: Editorial Brand Masthead */}
          <div 
            onClick={() => onSelectView('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#231B15] text-[#FBF9F5] flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 shadow-sm">
              <Compass className="w-5 h-5 text-[#E8DAB7] stroke-[1.8]" />
            </div>
            <div>
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#231B15] group-hover:text-[#C85A32] transition-colors">
                Palate & Place
              </span>
              <p className="hidden sm:block text-[10px] uppercase tracking-widest text-[#8E8277] font-medium -mt-0.5">
                The World Cookbook & Travel Journal
              </p>
            </div>
          </div>

          {/* Zone 2: Editorial Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-[#F4F0E8] rounded-xl border border-[#E8E1D7]">
            <button
              onClick={() => onSelectView('home')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                currentView === 'home'
                  ? 'bg-white text-[#231B15] shadow-sm font-semibold'
                  : 'text-[#6E6258] hover:text-[#231B15] hover:bg-white/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Journal</span>
            </button>

            <button
              onClick={() => onSelectView('explore')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                currentView === 'explore' || currentView === 'cookbook'
                  ? 'bg-white text-[#231B15] shadow-sm font-semibold'
                  : 'text-[#6E6258] hover:text-[#231B15] hover:bg-white/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>World Atlas</span>
            </button>

            <button
              onClick={() => onSelectView('passport')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                currentView === 'passport'
                  ? 'bg-white text-[#231B15] shadow-sm font-semibold'
                  : 'text-[#6E6258] hover:text-[#231B15] hover:bg-white/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Passport</span>
              {countriesVisitedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#E8E1D7] text-[#231B15]">
                  {countriesVisitedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectView('kitchen')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                currentView === 'kitchen'
                  ? 'bg-white text-[#231B15] shadow-sm font-semibold'
                  : 'text-[#6E6258] hover:text-[#231B15] hover:bg-white/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Kitchen</span>
              {(favorites.size > 0 || uncheckedShoppingCount > 0) && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#E8E1D7] text-[#231B15]">
                  {favorites.size + uncheckedShoppingCount}
                </span>
              )}
            </button>

            {onOpenSurpriseMe && (
              <button
                onClick={onOpenSurpriseMe}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#C85A32] hover:bg-[#FDF2ED] transition-all flex items-center gap-1.5"
                title="Random Recipe Discovery"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Surprise Me</span>
              </button>
            )}

            <button
              onClick={onOpenAIChef}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5C6B38] hover:bg-[#F2F5EC] transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#5C6B38]" />
              <span>AI Chef</span>
            </button>
          </nav>

          {/* Zone 3: Actions (Online status, World Unlock, Auth/Profile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Online / Offline status */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                isOnline 
                  ? 'bg-[#F2F5EC] text-[#5C6B38] border-[#D5DEBF]'
                  : 'bg-[#FDF2ED] text-[#C85A32] border-[#F4CEBE]'
              }`}
              title={isOnline ? 'Online • 380+ Global Recipes Synchronized' : 'Offline Mode • 50 Starters & Saved Recipes Ready'}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-[#C85A32]" />}
              <span className="hidden lg:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Admin Console */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#231B15] text-[#FBF9F5] text-xs font-medium hover:bg-[#3D322A] transition-all"
                title="Admin Console"
              >
                <Shield className="w-3.5 h-3.5 text-[#E8DAB7]" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* World Pass CTA (Antique brass highlight) */}
            {!isPremium ? (
              <button
                onClick={onOpenUnlock}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#231B15] hover:bg-[#3D322A] text-[#FBF9F5] text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95 border border-[#3D322A]"
              >
                <Crown className="w-3.5 h-3.5 text-[#E8DAB7]" />
                <span>Unlock All 380+</span>
                <span className="hidden sm:inline text-[#E8DAB7] text-xs font-mono font-bold">₦2,500</span>
              </button>
            ) : (
              <div 
                onClick={onOpenUnlock}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF5E8] border border-[#E8DAB7] text-[#9E740B] text-xs font-medium hover:bg-[#F5EED8] transition-colors"
              >
                <Crown className="w-3.5 h-3.5 text-[#B8860B]" />
                <span className="hidden sm:inline">World Pass</span>
              </div>
            )}

            {/* Profile / Account Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F4F0E8] border border-[#E8E1D7] hover:border-[#231B15] flex items-center justify-center text-xs font-bold text-[#231B15] transition-all overflow-hidden focus:outline-none"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-[#E8E1D7] shadow-xl py-2 z-50 animate-in fade-in duration-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-[#E8E1D7]">
                      <p className="text-xs font-semibold text-[#231B15] truncate">{user.displayName || 'Chef Traveler'}</p>
                      <p className="text-[11px] text-[#8E8277] truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          isPremium ? 'bg-[#FAF5E8] text-[#9E740B] border border-[#E8DAB7]' : 'bg-[#F4F0E8] text-[#6E6258]'
                        }`}>
                          {isPremium ? 'Lifetime World Pass' : 'Free Starter Explorer'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectView('kitchen')}
                      className="w-full text-left px-4 py-2 text-xs text-[#5E5248] hover:text-[#231B15] hover:bg-[#FBF9F5] flex items-center gap-2.5"
                    >
                      <User className="w-3.5 h-3.5 text-[#8E8277]" />
                      <span>My Kitchen & Saved</span>
                    </button>

                    <button
                      onClick={() => onSelectView('passport')}
                      className="w-full text-left px-4 py-2 text-xs text-[#5E5248] hover:text-[#231B15] hover:bg-[#FBF9F5] flex items-center gap-2.5"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#8E8277]" />
                      <span>Food Passport ({countriesVisitedCount} Stamped)</span>
                    </button>

                    <div className="border-t border-[#E8E1D7] mt-1 pt-1">
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-xs text-[#C85A32] hover:bg-[#FDF2ED] flex items-center gap-2.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 sm:py-2 rounded-lg border border-[#E8E1D7] bg-white hover:bg-[#F4F0E8] text-[#231B15] text-xs font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
