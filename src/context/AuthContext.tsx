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
  deleteDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import {
  UserProfile,
  UserEntitlement
} from '../types/recipe';
import { indexedDbStorage } from '../services/indexedDbStorage';

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
  requestTestPremium: (name: string, emailOverride?: string) => Promise<{ success: boolean; message: string }>;
  checkAndActivateReviewerEmail: (email: string) => Promise<{ success: boolean; message: string }>;
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

  // Fetch server-authoritative entitlement from Firestore & backend API
  // Strict: The client only READS, NEVER writes entitlement records!
  const checkServerEntitlement = async (uid: string, token?: string): Promise<UserEntitlement | null> => {
    try {
      const isEntitledTier = (tier?: string) => {
        const t = (tier || '').toLowerCase();
        return t === 'premium' || t === 'test_premium';
      };

      // 1. Query authoritative backend API with verified ID token
      if (token) {
        try {
          const res = await fetch('/api/entitlements', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.entitlement && isEntitledTier(data.entitlement.tier)) {
              return data.entitlement;
            }
          }
        } catch {
          // Fallback to Firestore check
        }
      }

      // 2. Direct entitlement document in Firestore (read-only)
      try {
        const entDoc = await getDoc(doc(db, 'entitlements', uid));
        if (entDoc.exists()) {
          const data = entDoc.data() as UserEntitlement;
          if (data && isEntitledTier(data.tier)) {
            return data;
          }
        }
      } catch {
        // Handled
      }
    } catch {
      // Ignore error
    }
    return null;
  };

  // Auth state listener with real-time Firestore entitlement syncing
  useEffect(() => {
    let unsubs: Unsubscribe[] = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      // Clean up previous real-time listeners
      unsubs.forEach((u) => u());
      unsubs = [];

      setUser(fbUser);
      if (fbUser) {
        const userEmail = (fbUser.email || '').toLowerCase();

        // Check admin status strictly via token claims and allowlisted verified email
        let idToken = '';
        try {
          idToken = await fbUser.getIdToken();
          const tokenResult = await fbUser.getIdTokenResult();
          const hasAdminClaim = tokenResult.claims.admin === true;
          const isEmailAdmin = userEmail === ADMIN_EMAIL.toLowerCase();
          setIsAdmin(hasAdminClaim || isEmailAdmin);
        } catch {
          setIsAdmin(userEmail === ADMIN_EMAIL.toLowerCase());
        }

        // Fetch or create Firestore user profile
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let currentProfile: UserProfile;

          if (userDocSnap.exists()) {
            currentProfile = userDocSnap.data() as UserProfile;
          } else {
            // New user defaults (tier must be free on creation)
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

          // Merge any offline preferences saved in IndexedDB
          try {
            const cachedPrefs = await indexedDbStorage.getUserData<UserProfile['preferences'] | null>(
              fbUser.uid,
              'preferences',
              null
            );
            if (cachedPrefs) {
              currentProfile.preferences = { ...currentProfile.preferences, ...cachedPrefs };
            }
          } catch {
            // Ignore
          }

          // Check server-authoritative entitlement
          const serverEnt = await checkServerEntitlement(fbUser.uid, idToken);
          if (serverEnt) {
            currentProfile.entitlement = serverEnt;
          }

          setProfile(currentProfile);

          // 1. Attach real-time snapshot listener on user document
          const unsubUser = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              const updatedData = snap.data() as UserProfile;
              setProfile((prev) => {
                if (!prev) return updatedData;
                return { ...prev, ...updatedData };
              });
            }
          });
          unsubs.push(unsubUser);

          // 2. Attach real-time snapshot listener on user's entitlement document (server-written)
          const entDocRef = doc(db, 'entitlements', fbUser.uid);
          const unsubEnt = onSnapshot(entDocRef, (snap) => {
            if (snap.exists()) {
              const entData = snap.data() as UserEntitlement;
              if (entData && entData.tier) {
                setProfile((prev) => {
                  if (!prev) return null;
                  if (prev.entitlement?.tier === entData.tier) return prev;
                  return { ...prev, entitlement: entData };
                });
              }
            }
          });
          unsubs.push(unsubEnt);
        } catch (err) {
          console.warn('Error setting up user profile from Firestore:', err);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubs.forEach((u) => u());
    };
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
    try {
      localStorage.removeItem('palate_curator_mode');
      localStorage.removeItem('palate_guest_entitlement');
      localStorage.removeItem('palate_reviewer_email');
    } catch {
      // Ignore
    }
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

    const uid = user?.uid || 'guest';
    // Persist to IndexedDB immediately so changes survive offline reloads
    await indexedDbStorage.setUserData(uid, 'preferences', nextPrefs);

    if (user) {
      if (isOnline) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          // Note: Does not touch entitlement!
          await setDoc(
            userDocRef,
            {
              preferences: nextPrefs,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Error saving preferences to Firestore, queuing mutation:', err);
          await indexedDbStorage.enqueueMutation({
            uid: user.uid,
            type: 'preference_update',
            payload: nextPrefs
          });
        }
      } else {
        // Enqueue offline mutation for automatic syncing when internet is restored
        await indexedDbStorage.enqueueMutation({
          uid: user.uid,
          type: 'preference_update',
          payload: nextPrefs
        });
      }
    }
  };

  const applyEntitlement = (entitlement: UserEntitlement) => {
    setProfile((prev) => (prev ? { ...prev, entitlement } : null));
  };

  /**
   * Tester premium request architecture.
   * Sends request to server via verified token. Client never directly creates Firestore request document.
   */
  const requestTestPremium = async (
    name: string,
    _emailOverride?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return {
        success: false,
        message: 'Please sign in with Google or Email before requesting reviewer access.'
      };
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/request-test-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim() || user.displayName || 'Reviewer'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Failed to submit reviewer request.'
        };
      }

      return {
        success: true,
        message: 'Your request to access the World Pass has been submitted to the admin for review.'
      };
    } catch (err: any) {
      console.error('Request Test Premium Error:', err);
      return {
        success: false,
        message: 'Network error submitting request. Please try again.'
      };
    }
  };

  /**
   * Checks reviewer email against server-authoritative backend.
   * Client NEVER writes to entitlements.
   */
  const checkAndActivateReviewerEmail = async (
    emailInput: string
  ): Promise<{ success: boolean; message: string }> => {
    const emailClean = (emailInput || '').trim().toLowerCase();
    if (!emailClean) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    // Query backend to verify if entitlement exists
    try {
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('/api/entitlements', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        const data = await res.json();
        const tier = (data?.entitlement?.tier || '').toLowerCase();
        if (tier === 'premium' || tier === 'test_premium') {
          setProfile((prev) => (prev ? { ...prev, entitlement: data.entitlement } : null));
          return { success: true, message: 'World Pass verified and active!' };
        }
      }

      return {
        success: false,
        message: 'No approved World Pass found for this account.'
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Verification failed' };
    }
  };

  /**
   * Fast Dev Unlock:
   * Verified developer/curator -> secure backend endpoint -> TEST_PREMIUM -> persisted -> client refresh.
   */
  const devFastUnlockPremium = async (): Promise<boolean> => {
    if (!user) {
      console.warn('Dev unlock requires user to be signed in');
      return false;
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/dev-grant-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.uid })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Dev grant rejected by server:', errData);
        return false;
      }

      const data = await res.json();
      if (data.success && data.entitlement) {
        const grantedEnt: UserEntitlement = {
          tier: data.entitlement.tier || 'test_premium',
          source: data.entitlement.source || 'dev',
          validUntil: 'never',
          grantedAt: data.entitlement.unlockedAt || new Date().toISOString()
        };
        setProfile((prev) => (prev ? { ...prev, entitlement: grantedEnt } : null));
        return true;
      }

      return false;
    } catch (err) {
      console.error('Dev grant premium error:', err);
      return false;
    }
  };

  const isPremium =
    isAdmin ||
    profile?.entitlement?.tier?.toLowerCase() === 'premium' ||
    profile?.entitlement?.tier?.toLowerCase() === 'test_premium' ||
    (profile?.entitlement?.tier as string)?.toUpperCase() === 'PREMIUM' ||
    (profile?.entitlement?.tier as string)?.toUpperCase() === 'TEST_PREMIUM';

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
        checkAndActivateReviewerEmail,
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
