import React, { useState, useEffect } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Globe, 
  CreditCard, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { PaystackService } from '../services/paystackService';

interface WorldUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorldUnlockModal: React.FC<WorldUnlockModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user, isPremium, devFastUnlockPremium, applyEntitlement, signInWithGoogle } = useAuth();
  const [loadingPaystack, setLoadingPaystack] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [testRequestSuccess, setTestRequestSuccess] = useState('');

  // 1. Keyboard Escape to close modal smoothly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 2. Browser Back Button / Mobile Swipe back listener
  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ modal: 'world-unlock' }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore in headless
    }
  };

  const handlePaystackPayment = async () => {
    setLoadingPaystack(true);
    setErrorMessage('');

    let activeUser = user;

    if (!activeUser) {
      try {
        await signInWithGoogle();
        activeUser = auth.currentUser;
      } catch {
        setLoadingPaystack(false);
        setErrorMessage('Please sign in with Google or Email so your World Pass is linked to your account.');
        return;
      }
    }

    if (!activeUser) {
      setLoadingPaystack(false);
      setErrorMessage('Sign-in required to associate your World Pass with your profile.');
      return;
    }

    const idToken = await activeUser.getIdToken().catch(() => '');

    await PaystackService.initiateWorldUnlock(
      activeUser.email || 'guest@palateandplace.app',
      activeUser.uid,
      idToken,
      (result) => {
        setLoadingPaystack(false);
        if (result.entitlement && applyEntitlement) {
          applyEntitlement(result.entitlement);
        }
        triggerCelebration();
        setTimeout(() => {
          onClose();
        }, 1200);
      },
      (err) => {
        setLoadingPaystack(false);
        setErrorMessage(typeof err === 'string' ? err : 'Payment initiation failed');
      }
    );
  };

  const handleDevQuickUnlock = async () => {
    const success = await devFastUnlockPremium();
    if (success) {
      triggerCelebration();
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setErrorMessage('Direct curator activation failed.');
    }
  };

  const PERKS = [
    { title: 'All 300+ Global Recipes', desc: 'Unlock every dish from over 50 countries and 6 continents.' },
    { title: '100 AI Chef Inquiries Each Month', desc: 'Get culinary technique guidance, substitutions, and recipe scaling.' },
    { title: 'Unlimited Offline Saved Dishes', desc: 'Save entire regional collections to cook anywhere without connectivity.' },
    { title: 'Food Passport Stamps & Milestones', desc: 'Collect country stamps and continental badges as you cook around the globe.' },
    { title: 'Pay Once, Keep Forever', desc: 'Just ₦2,500 (approx. $3.00 USD) one time. No recurring subscription fees.' }
  ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/60 backdrop-blur-sm flex justify-center items-start sm:items-center p-3 sm:p-6 py-6 sm:py-10 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#FBF9F5] rounded-3xl border border-[#E8E1D7] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto sm:my-0"
      >
        
        {/* Top-Right Close Button */}
        <button
          onClick={onClose}
          aria-label="Close and return to cookbook"
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-[#F4F0E8] text-[#8E8277] hover:text-[#231B15] border border-[#E8E1D7] transition-all z-20 hover:scale-105 active:scale-95 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 bg-[#F7F4EE] border-b border-[#E8E1D7] text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-[#231B15] text-[#E8DAB7] flex items-center justify-center mx-auto shadow-md">
            <Crown className="w-7 h-7 stroke-[2.2]" />
          </div>

          <span className="inline-block text-xs font-semibold text-[#C85A32] uppercase tracking-widest">
            Palate & Place Passport
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#231B15] tracking-tight">
            Unlock The World Pass
          </h2>

          <p className="text-xs sm:text-sm text-[#5E5248] max-w-md mx-auto leading-relaxed">
            Gain lifetime access to the complete global cookbook, unlimited offline recipes, and comprehensive AI Chef assistance.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E1D7] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-[#8E8277] font-medium">One-Time Lifetime Pass</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#231B15]">
                  ₦2,500
                </span>
                <span className="text-xs text-[#8E8277] font-mono">
                  (approx. $3.00 USD)
                </span>
              </div>
            </div>

            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[#F2F5EC] text-[#5C6B38] border border-[#D5DEBF]">
              Zero Recurring Fees
            </span>
          </div>

          {/* Value Perks List */}
          <div className="space-y-3">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#F2F5EC] text-[#5C6B38] border border-[#D5DEBF] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#231B15]">{perk.title}</p>
                  <p className="text-[11px] text-[#5E5248] mt-0.5">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[#FDF2ED] border border-[#F4CEBE] text-xs text-[#C85A32]">
              {errorMessage}
            </div>
          )}

          {testRequestSuccess && (
            <div className="p-3.5 rounded-xl bg-[#F2F5EC] border border-[#D5DEBF] text-xs text-[#5C6B38]">
              {testRequestSuccess}
            </div>
          )}

          {/* Action: Checkout */}
          {!isPremium ? (
            <div className="space-y-3 pt-2">
              <button
                onClick={handlePaystackPayment}
                disabled={loadingPaystack}
                className="w-full py-4 rounded-2xl bg-[#231B15] hover:bg-[#3D322A] text-[#FBF9F5] font-semibold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                <CreditCard className="w-5 h-5 text-[#E8DAB7]" />
                <span>{loadingPaystack ? 'Connecting to secure checkout...' : 'Unlock World Pass — ₦2,500'}</span>
                <ArrowRight className="w-4 h-4 text-[#E8DAB7]" />
              </button>

              {/* Return to Cookbook button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-white hover:bg-[#F4F0E8] text-[#5E5248] hover:text-[#231B15] border border-[#E8E1D7] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Global Cookbook (Keep Browsing)</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F2F5EC] border border-[#D5DEBF] text-center space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#5C6B38] text-white flex items-center justify-center mx-auto font-bold">
                ✓
              </div>
              <p className="text-sm font-bold text-[#5C6B38]">
                Your Lifetime World Pass is Active!
              </p>
              <p className="text-xs text-[#5E5248]">
                You have unrestricted access to all 300+ recipes, offline collections, and monthly AI Chef guidance.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#231B15] text-[#FBF9F5] font-semibold text-xs shadow-sm"
              >
                Back to Cookbook
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
