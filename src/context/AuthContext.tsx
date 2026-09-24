import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import {
  UserProfile,
  UserEntitlement
} from '../types/recipe';

export const ADMIN_EMAIL = 'blessing.waydiva@gmail.com';

export interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isOnline: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserProfile['preferences']>) => Promise<void>;
  applyEntitlement: (entitlement: UserEntitlement) => void;
  requestTestPremium: (name: string) => Promise<{ success: boolean; message: string }>;
  devFastUnlockPremium: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAdmin, setIsAdmin] = useState(false);

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch server-authoritative entitlement
  const checkServerEntitlement = async (uid: string): Promise<UserEntitlement | null> => {
    try {
      const res = await fetch(`/api/entitlements?userId=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        return data.entitlement || null;
      }
    } catch {
      // Ignore network error; fallback to profile
    }
    return null;
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        // Check admin status via custom claim or allowlist email
        fbUser
          .getIdTokenResult()
          .then((tokenResult) => {
            const hasAdminClaim = tokenResult.claims.admin === true;
            const isEmailAdmin = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
            setIsAdmin(hasAdminClaim || isEmailAdmin);
          })
          .catch(() => {
            setIsAdmin(fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
          });

        // Fetch or create Firestore user profile
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let currentProfile: UserProfile;

          if (userDocSnap.exists()) {
            currentProfile = userDocSnap.data() as UserProfile;
          } else {
            // New user defaults
            currentProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Chef',
              photoURL: fbUser.photoURL || undefined,
              entitlement: {
                tier: 'free',
                source: 'default'
              },
              preferences: {
                dietary: [],
                allergies: [],
                favoriteIngredients: [],
                avoidIngredients: [],
                preferredCookingTime: 'any',
                spicePreference: 'medium'
              },
              aiUsage: {
                totalCount: 0,
                rollingCount: 0,
                todayCount: 0,
                lastResetDay: new Date().toISOString().split('T')[0],
                lastResetMonth: new Date().toISOString().slice(0, 7)
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            await setDoc(userDocRef, currentProfile);
          }

          // Verify server-authoritative entitlement
          const serverEnt = await checkServerEntitlement(fbUser.uid);
          if (serverEnt && serverEnt.tier !== currentProfile.entitlement.tier) {
            currentProfile.entitlement = serverEnt;
          }

          setProfile(currentProfile);
        } catch (err) {
          console.warn('Error fetching user profile from Firestore:', err);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auth Actions
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user && name) {
      await updateProfile(cred.user, { displayName: name });
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    setProfile(null);
    setIsAdmin(false);
    await firebaseSignOut(auth);
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await deleteDoc(userDocRef);
      await deleteUser(user);
    } catch (err) {
      console.error('Delete account error:', err);
      throw err;
    }
  };

  const updatePreferences = async (prefs: Partial<UserProfile['preferences']>) => {
    if (!profile) return;
    const nextPrefs = { ...profile.preferences, ...prefs };
    setProfile((prev) => (prev ? { ...prev, preferences: nextPrefs } : null));

    if (user && isOnline) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          preferences: nextPrefs,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Error saving preferences:', err);
      }
    }
  };

  const applyEntitlement = (entitlement: UserEntitlement) => {
    setProfile((prev) => (prev ? { ...prev, entitlement } : null));
  };

  const requestTestPremium = async (name: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Please sign in before requesting test premium.' };
    }

    try {
      const res = await fetch('/api/admin/request-test-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          name: name || user.displayName || 'Tester',
          email: user.email || ''
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');

      return {
        success: true,
        message: 'Your request to access the World Pass has been submitted to the admin for review'
      };
    } catch (err: any) {
      console.error('Request Test Premium Error:', err);
      return { success: false, message: err.message || 'Unable to submit request.' };
    }
  };

  const devFastUnlockPremium = async (): Promise<boolean> => {
    if (!user?.email) return false;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/dev-grant-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userEmail: user.email, userId: user.uid })
      });
      const data = await res.json();
      if (data.success && data.entitlement) {
        setProfile((prev) => (prev ? { ...prev, entitlement: data.entitlement } : null));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Dev grant premium error:', err);
      return false;
    }
  };

  const isPremium =
    profile?.entitlement?.tier === 'premium' || profile?.entitlement?.tier === 'test_premium';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isOnline,
        isAdmin,
        isPremium,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        deleteAccount,
        updatePreferences,
        applyEntitlement,
        requestTestPremium,
        devFastUnlockPremium
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
