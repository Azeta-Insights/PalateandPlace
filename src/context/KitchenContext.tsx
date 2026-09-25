import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import {
  CookingRecord,
  ShoppingItem,
  PassportCountry,
  Recipe
} from '../types/recipe';
import { indexedDbStorage } from '../services/indexedDbStorage';
import { PhotoStorageService } from '../services/photoStorageService';
import { ALL_STARTER_RECIPES } from '../data/recipes';

export interface KitchenContextType {
  favorites: Set<string>;
  cookingHistory: CookingRecord[];
  passport: Record<string, PassportCountry>;
  shoppingList: ShoppingItem[];
  downloadedRecipeIds: Set<string>;
  viewedIds: string[];
  searchHistory: string[];
  toggleFavorite: (recipeId: string) => Promise<void>;
  recordCookedRecipe: (
    record: Omit<CookingRecord, 'id' | 'cookedAt'>,
    photoFile?: File | Blob
  ) => Promise<void>;
  addToShoppingList: (recipeOrItems: Recipe | ShoppingItem[]) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearCompletedShopping: () => void;
  downloadRecipe: (recipeOrId: Recipe | string) => Promise<boolean>;
  removeDownloadedRecipe: (recipeId: string) => Promise<void>;
  downloadAllPremiumRecipes: (recipeIds: string[]) => Promise<number>;
  getFullRecipeForView: (recipeId: string) => Promise<Recipe | undefined>;
  recordRecipeView: (recipeId: string) => void;
  recordSearchQuery: (query: string) => void;
  syncOfflineData: () => Promise<void>;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export const KitchenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isOnline, isPremium, isAdmin } = useAuth();

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cookingHistory, setCookingHistory] = useState<CookingRecord[]>([]);
  const [passport, setPassport] = useState<Record<string, PassportCountry>>({});
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [downloadedRecipeIds, setDownloadedRecipeIds] = useState<Set<string>>(new Set());
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load user data from IndexedDB upon user change (Strict UID Isolation)
  const loadUserDataFromIndexedDB = useCallback(async (uid: string) => {
    try {
      const [favArray, passMap, shopArray, histArray, dlIds, views, searches] = await Promise.all([
        indexedDbStorage.getUserData<string[]>(uid, 'favorites', []),
        indexedDbStorage.getUserData<Record<string, PassportCountry>>(uid, 'passport', {}),
        indexedDbStorage.getUserData<ShoppingItem[]>(uid, 'shopping', []),
        indexedDbStorage.getUserData<CookingRecord[]>(uid, 'history', []),
        indexedDbStorage.getDownloadedRecipeIds(uid),
        indexedDbStorage.getUserData<string[]>(uid, 'viewed_recipes', []),
        indexedDbStorage.getUserData<string[]>(uid, 'searches', [])
      ]);

      // Re-hydrate local photo blob URLs if needed (survives reload)
      const pendingPhotos = await indexedDbStorage.getPendingPhotos(uid);
      const photoBlobMap = new Map(pendingPhotos.map(p => [p.photoId, p.blob]));

      const hydratedHistory = histArray.map((item) => {
        if (item.photoRefId && photoBlobMap.has(item.photoRefId)) {
          const blob = photoBlobMap.get(item.photoRefId);
          if (blob) {
            return {
              ...item,
              photoUrl: URL.createObjectURL(blob),
              photoUploadStatus: 'local' as const
            };
          }
        }
        return item;
      });

      setFavorites(new Set(favArray));
      setPassport(passMap);
      setShoppingList(shopArray);
      setCookingHistory(hydratedHistory);
      setDownloadedRecipeIds(dlIds);
      setViewedIds(views);
      setSearchHistory(searches);
    } catch (err) {
      console.warn('Error loading user kitchen data from IndexedDB:', err);
    }
  }, []);

  // Fetch Firestore subcollections
  const loadUserSubcollections = useCallback(async (uid: string) => {
    try {
      // 1. Favorites
      const favsRef = collection(db, 'users', uid, 'favorites');
      const favsSnap = await getDocs(favsRef);
      const favSet = new Set<string>();
      favsSnap.forEach(d => favSet.add(d.id));
      if (favSet.size > 0) {
        setFavorites(favSet);
        await indexedDbStorage.setUserData(uid, 'favorites', Array.from(favSet));
      }

      // 2. Cooking History
      const histRef = collection(db, 'users', uid, 'cookingHistory');
      const histSnap = await getDocs(histRef);
      const historyList: CookingRecord[] = [];
      histSnap.forEach(d => historyList.push(d.data() as CookingRecord));
      historyList.sort((a, b) => new Date(b.cookedAt).getTime() - new Date(a.cookedAt).getTime());
      if (historyList.length > 0) {
        setCookingHistory((prev) => {
          // Merge with any local pending photo URLs
          const merged = historyList.map(h => {
            const existing = prev.find(p => p.id === h.id);
            if (existing && existing.photoUrl && !h.photoUrl) {
              return { ...h, photoUrl: existing.photoUrl, photoRefId: existing.photoRefId };
            }
            return h;
          });
          indexedDbStorage.setUserData(uid, 'history', merged);
          return merged;
        });
      }

      // 3. Passport
      const passRef = collection(db, 'users', uid, 'passport');
      const passSnap = await getDocs(passRef);
      const passMap: Record<string, PassportCountry> = {};
      passSnap.forEach(d => {
        passMap[d.id] = d.data() as PassportCountry;
      });
      if (Object.keys(passMap).length > 0) {
        setPassport(passMap);
        await indexedDbStorage.setUserData(uid, 'passport', passMap);
      }
    } catch (err) {
      console.warn('Error fetching Firestore subcollections:', err);
    }
  }, []);

  // Push queued offline mutations when online
  const syncOfflineData = useCallback(async () => {
    if (!user || !navigator.onLine) return;

    try {
      // 1. Sync pending meal photos
      const uploadedPhotos = await PhotoStorageService.syncPendingPhotos(user.uid);

      // Reconcile active history with uploaded URLs
      if (Object.keys(uploadedPhotos).length > 0) {
        setCookingHistory((prev) => {
          const updated = prev.map((item) => {
            if (item.photoRefId && uploadedPhotos[item.photoRefId]) {
              return {
                ...item,
                photoUrl: uploadedPhotos[item.photoRefId],
                photoUploadStatus: 'uploaded' as const
              };
            }
            return item;
          });
          indexedDbStorage.setUserData(user.uid, 'history', updated).catch(() => {});
          return updated;
        });
      }

      // 2. Sync pending mutations from IndexedDB queue
      const pendingMutations = await indexedDbStorage.getPendingMutations(user.uid);
      if (pendingMutations.length === 0) return;

      const syncedIds: string[] = [];
      for (const mut of pendingMutations) {
        try {
          if (mut.type === 'cooking_record') {
            const record = mut.payload as CookingRecord;
            if (record.photoRefId && uploadedPhotos[record.photoRefId]) {
              record.photoUrl = uploadedPhotos[record.photoRefId];
              record.photoUploadStatus = 'uploaded';
            }
            const historyRef = doc(db, 'users', user.uid, 'cookingHistory', record.id);
            await setDoc(historyRef, record, { merge: true });
          } else if (mut.type === 'passport_stamp') {
            const stamp = mut.payload as PassportCountry;
            const passportRef = doc(db, 'users', user.uid, 'passport', stamp.countryCode);
            await setDoc(passportRef, stamp, { merge: true });
          } else if (mut.type === 'favorite_toggle') {
            const { recipeId, isFav } = mut.payload;
            const favRef = doc(db, 'users', user.uid, 'favorites', recipeId);
            if (isFav) {
              await setDoc(favRef, { recipeId, favoritedAt: new Date().toISOString() });
            } else {
              await deleteDoc(favRef);
            }
          } else if (mut.type === 'preference_update') {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { preferences: mut.payload, updatedAt: new Date().toISOString() }, { merge: true });
          }
          syncedIds.push(mut.id);
        } catch (e) {
          console.warn('Error syncing individual kitchen mutation:', e);
        }
      }

      if (syncedIds.length > 0) {
        await indexedDbStorage.markMutationsSynced(syncedIds);
      }
    } catch (err) {
      console.warn('Offline sync error (will retry next connection):', err);
    }
  }, [user]);

  // Load data whenever user authentication state changes
  useEffect(() => {
    if (user) {
      loadUserDataFromIndexedDB(user.uid).then(() => {
        loadUserSubcollections(user.uid);
        syncOfflineData();
      });
    } else {
      setFavorites(new Set());
      setCookingHistory([]);
      setPassport({});
      setShoppingList([]);
      setDownloadedRecipeIds(new Set());
      loadUserDataFromIndexedDB('guest');
    }
  }, [user, loadUserDataFromIndexedDB, loadUserSubcollections, syncOfflineData]);

  // Sync on online transition
  useEffect(() => {
    if (isOnline && user) {
      syncOfflineData();
    }
  }, [isOnline, user, syncOfflineData]);

  // Toggle Favorite
  const toggleFavorite = async (recipeId: string) => {
    const uid = user?.uid || 'guest';
    const next = new Set(favorites);
    let isNowFav = false;

    if (next.has(recipeId)) {
      next.delete(recipeId);
      isNowFav = false;
    } else {
      next.add(recipeId);
      isNowFav = true;
    }

    setFavorites(next);
    await indexedDbStorage.setUserData(uid, 'favorites', Array.from(next));

    if (user) {
      if (isOnline) {
        try {
          const favRef = doc(db, 'users', user.uid, 'favorites', recipeId);
          if (isNowFav) {
            await setDoc(favRef, { recipeId, favoritedAt: new Date().toISOString() });
          } else {
            await deleteDoc(favRef);
          }
        } catch (err) {
          console.warn('Error syncing favorite to Firestore, enqueuing mutation:', err);
          await indexedDbStorage.enqueueMutation({
            uid: user.uid,
            type: 'favorite_toggle',
            payload: { recipeId, isFav: isNowFav }
          });
        }
      } else {
        await indexedDbStorage.enqueueMutation({
          uid: user.uid,
          type: 'favorite_toggle',
          payload: { recipeId, isFav: isNowFav }
        });
      }
    }
  };

  // Record Cooked Recipe
  const recordCookedRecipe = async (
    recordData: Omit<CookingRecord, 'id' | 'cookedAt'>,
    photoFile?: File | Blob
  ) => {
    const uid = user?.uid || 'guest';
    const recordId = `cook-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    let finalPhotoUrl = recordData.photoUrl;
    let photoRefId: string | undefined;
    let photoUploadStatus: 'local' | 'uploading' | 'uploaded' = 'uploaded';

    if (photoFile) {
      try {
        const photoResult = await PhotoStorageService.processMealPhoto(
          photoFile,
          uid,
          recordData.recipeId,
          isOnline
        );
        finalPhotoUrl = photoResult.photoUrl;
        photoRefId = photoResult.photoRefId;
        photoUploadStatus = photoResult.photoUploadStatus;
      } catch (err) {
        console.warn('Photo processing error:', err);
      }
    }

    const newRecord: CookingRecord = {
      ...recordData,
      id: recordId,
      photoUrl: finalPhotoUrl,
      photoRefId,
      photoUploadStatus,
      cookedAt: new Date().toISOString()
    };

    // 1. Update Cooking History in-memory & IndexedDB
    const updatedHistory = [newRecord, ...cookingHistory];
    setCookingHistory(updatedHistory);
    await indexedDbStorage.setUserData(uid, 'history', updatedHistory);

    // 2. Update Passport in-memory & IndexedDB
    const existingPassport = passport[recordData.countryCode];
    const dishes = existingPassport ? [...existingPassport.dishNames] : [];
    if (!dishes.includes(recordData.recipeTitle)) {
      dishes.push(recordData.recipeTitle);
    }

    const updatedCountry: PassportCountry = {
      countryCode: recordData.countryCode,
      country: recordData.country,
      continent: recordData.continent,
      recipesCooked: (existingPassport?.recipesCooked || 0) + 1,
      firstCookedAt: existingPassport?.firstCookedAt || new Date().toISOString(),
      lastCookedAt: new Date().toISOString(),
      dishNames: dishes
    };

    const updatedPassportMap = { ...passport, [recordData.countryCode]: updatedCountry };
    setPassport(updatedPassportMap);
    await indexedDbStorage.setUserData(uid, 'passport', updatedPassportMap);

    // 3. Sync to Firestore or enqueue mutation
    if (user) {
      if (isOnline) {
        try {
          const historyRef = doc(db, 'users', user.uid, 'cookingHistory', newRecord.id);
          await setDoc(historyRef, newRecord);

          const passportRef = doc(db, 'users', user.uid, 'passport', recordData.countryCode);
          await setDoc(passportRef, updatedCountry, { merge: true });
        } catch (err) {
          console.warn('Error saving to Firestore, queuing offline mutation:', err);
          await indexedDbStorage.enqueueMutation({
            uid: user.uid,
            type: 'cooking_record',
            payload: newRecord
          });
          await indexedDbStorage.enqueueMutation({
            uid: user.uid,
            type: 'passport_stamp',
            payload: updatedCountry
          });
        }
      } else {
        await indexedDbStorage.enqueueMutation({
          uid: user.uid,
          type: 'cooking_record',
          payload: newRecord
        });
        await indexedDbStorage.enqueueMutation({
          uid: user.uid,
          type: 'passport_stamp',
          payload: updatedCountry
        });
      }
    }
  };

  // Shopping List Actions (Unified IndexedDB pipeline)
  const addToShoppingList = (recipeOrItems: Recipe | ShoppingItem[]) => {
    const uid = user?.uid || 'guest';
    let newItems: ShoppingItem[] = [];

    if (Array.isArray(recipeOrItems)) {
      newItems = recipeOrItems;
    } else if (recipeOrItems.ingredients) {
      newItems = recipeOrItems.ingredients.map(ing => ({
        id: `shop-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        recipeId: recipeOrItems.recipeId,
        recipeTitle: recipeOrItems.title,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        checked: false,
        category: 'Pantry & Market',
        createdAt: new Date().toISOString()
      }));
    }

    const updated = [...newItems, ...shoppingList];
    setShoppingList(updated);
    indexedDbStorage.setUserData(uid, 'shopping', updated);
  };

  const toggleShoppingItem = (id: string) => {
    const uid = user?.uid || 'guest';
    const current = shoppingList.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setShoppingList(current);
    indexedDbStorage.setUserData(uid, 'shopping', current);
  };

  const removeShoppingItem = (id: string) => {
    const uid = user?.uid || 'guest';
    const filtered = shoppingList.filter(i => i.id !== id);
    setShoppingList(filtered);
    indexedDbStorage.setUserData(uid, 'shopping', filtered);
  };

  const clearCompletedShopping = () => {
    const uid = user?.uid || 'guest';
    const filtered = shoppingList.filter(i => !i.checked);
    setShoppingList(filtered);
    indexedDbStorage.setUserData(uid, 'shopping', filtered);
  };

  // Record Recipe View for personalization telemetry (guarded against re-render loops)
  const recordRecipeView = useCallback((recipeId: string) => {
    if (!recipeId) return;
    const uid = user?.uid || 'guest';
    setViewedIds((prev) => {
      if (prev.length > 0 && prev[0] === recipeId) return prev;
      const filtered = prev.filter(id => id !== recipeId);
      const next = [recipeId, ...filtered].slice(0, 30);
      indexedDbStorage.setUserData(uid, 'viewed_recipes', next).catch(() => {});
      return next;
    });
  }, [user]);

  // Record Search Query for personalization telemetry
  const recordSearchQuery = useCallback((queryText: string) => {
    const q = queryText.trim().toLowerCase();
    if (!q) return;
    const uid = user?.uid || 'guest';
    setSearchHistory((prev) => {
      const filtered = prev.filter(item => item !== q);
      const next = [q, ...filtered].slice(0, 20);
      indexedDbStorage.setUserData(uid, 'searches', next).catch(() => {});
      return next;
    });
  }, [user]);

  // Recipe viewing and offline downloads (memoized to prevent render loops)
  const getFullRecipeForView = useCallback(async (recipeId: string): Promise<Recipe | undefined> => {
    // 1. Check starter recipes
    const starter = ALL_STARTER_RECIPES.find(r => r.recipeId === recipeId);
    if (starter) return starter;

    // 2. Check IndexedDB cached/downloaded recipes (scoped by UID)
    const localRecipe = await indexedDbStorage.getRecipe(recipeId, user?.uid);
    if (localRecipe && localRecipe.ingredients && localRecipe.ingredients.length > 0) {
      return localRecipe;
    }

    // 3. If online: fetch from server
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const token = user ? await user.getIdToken().catch(() => '') : '';
        const res = await fetch(
          `/api/recipes?id=${encodeURIComponent(recipeId)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.recipe) {
            // Save in user-scoped downloads if downloaded
            if (user && downloadedRecipeIds.has(recipeId)) {
              await indexedDbStorage.recordRecipeDownload(user.uid, data.recipe);
            }
            return data.recipe;
          }
        }
      } catch (err) {
        console.warn('Error fetching full recipe from server:', err);
      }
    }

    return undefined;
  }, [user, downloadedRecipeIds]);

  const downloadRecipe = async (recipeOrId: Recipe | string): Promise<boolean> => {
    const uid = user?.uid || 'guest';

    let fullRecipe: Recipe | undefined;
    if (typeof recipeOrId === 'string') {
      fullRecipe = await getFullRecipeForView(recipeOrId);
    } else {
      fullRecipe = recipeOrId;
      if (!fullRecipe.ingredients || fullRecipe.ingredients.length === 0) {
        fullRecipe = await getFullRecipeForView(fullRecipe.recipeId);
      }
    }

    if (!fullRecipe || !fullRecipe.ingredients || fullRecipe.ingredients.length === 0) {
      return false;
    }

    await indexedDbStorage.recordRecipeDownload(uid, fullRecipe);
    const updatedIds = await indexedDbStorage.getDownloadedRecipeIds(uid);
    setDownloadedRecipeIds(updatedIds);
    return true;
  };

  const removeDownloadedRecipe = async (recipeId: string): Promise<void> => {
    const uid = user?.uid || 'guest';
    await indexedDbStorage.removeRecipeDownload(uid, recipeId);
    const updatedIds = await indexedDbStorage.getDownloadedRecipeIds(uid);
    setDownloadedRecipeIds(updatedIds);
  };

  const downloadAllPremiumRecipes = async (recipeIds: string[]): Promise<number> => {
    if (!user) return 0;

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/recipes/download-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipeIds })
      });

      if (!res.ok) throw new Error('Download batch failed');

      const data = await res.json();
      const recipes: Recipe[] = data.recipes || [];

      for (const recipe of recipes) {
        await indexedDbStorage.recordRecipeDownload(user.uid, recipe);
      }

      const dlSet = await indexedDbStorage.getDownloadedRecipeIds(user.uid);
      setDownloadedRecipeIds(dlSet);
      return recipes.length;
    } catch (err) {
      console.error('Batch download error:', err);
      return 0;
    }
  };

  return (
    <KitchenContext.Provider
      value={{
        favorites,
        cookingHistory,
        passport,
        shoppingList,
        downloadedRecipeIds,
        viewedIds,
        searchHistory,
        toggleFavorite,
        recordCookedRecipe,
        addToShoppingList,
        toggleShoppingItem,
        removeShoppingItem,
        clearCompletedShopping,
        downloadRecipe,
        removeDownloadedRecipe,
        downloadAllPremiumRecipes,
        getFullRecipeForView,
        recordRecipeView,
        recordSearchQuery,
        syncOfflineData
      }}
    >
      {children}
    </KitchenContext.Provider>
  );
};

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error('useKitchen must be used within a KitchenProvider');
  }
  return context;
};
