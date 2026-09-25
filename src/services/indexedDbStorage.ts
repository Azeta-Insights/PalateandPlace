import { Recipe, CookingRecord, ShoppingItem, PassportCountry } from '../types/recipe';
import { ALL_STARTER_RECIPES } from '../data/recipes';

const DB_NAME = 'palate_place_db';
const DB_VERSION = 1;

export interface QueuedMutation {
  id: string;
  uid: string;
  type: 'cooking_record' | 'favorite_toggle' | 'passport_stamp' | 'preference_update' | 'shopping_sync';
  payload: any;
  createdAt: string;
  synced: boolean;
}

export interface PendingPhoto {
  photoId: string;
  uid: string;
  recipeId: string;
  blob: Blob;
  mimeType: string;
  createdAt: string;
  synced: boolean;
}

class IndexedDBStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not available in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store 1: Full Recipe Objects
        if (!db.objectStoreNames.contains('recipes')) {
          db.createObjectStore('recipes', { keyPath: 'recipeId' });
        }

        // Store 2: User Scoped Key-Value Data (favorites, passport, shopping, downloads, history)
        if (!db.objectStoreNames.contains('user_data')) {
          db.createObjectStore('user_data', { keyPath: 'key' });
        }

        // Store 3: Offline Mutation Queue
        if (!db.objectStoreNames.contains('offline_queue')) {
          const queueStore = db.createObjectStore('offline_queue', { keyPath: 'id' });
          queueStore.createIndex('by_uid', 'uid', { unique: false });
          queueStore.createIndex('by_synced', 'synced', { unique: false });
        }

        // Store 4: Pending Meal Photos (Blobs)
        if (!db.objectStoreNames.contains('pending_photos')) {
          const photoStore = db.createObjectStore('pending_photos', { keyPath: 'photoId' });
          photoStore.createIndex('by_uid', 'uid', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Helper for user-scoped storage key
  private userKey(uid: string, keyName: string): string {
    const safeUid = uid || 'guest';
    return `palate_place_${safeUid}_${keyName}`;
  }

  // ---------------- RECIPES STORE (STRICT USER SCOPING) ---------------- //

  async saveRecipe(recipe: Recipe, uid?: string): Promise<void> {
    if (recipe.isStarter) return; // Starters are static in memory
    const safeUid = uid || 'guest';
    await this.setUserData(safeUid, `downloaded_recipe_${recipe.recipeId}`, recipe);
  }

  async saveRecipesBatch(recipes: Recipe[], uid?: string): Promise<void> {
    const safeUid = uid || 'guest';
    for (const recipe of recipes) {
      await this.saveRecipe(recipe, safeUid);
    }
  }

  async getRecipe(recipeId: string, uid?: string): Promise<Recipe | undefined> {
    // 1. First check Starter Recipes (always free and available offline to everyone)
    const starter = ALL_STARTER_RECIPES.find(r => r.recipeId === recipeId);
    if (starter) return starter;

    // 2. Check user-scoped downloaded recipe (strictly scoped by UID to prevent cross-account leakage)
    if (!uid || uid === 'guest') {
      return undefined;
    }

    const downloadedIds = await this.getDownloadedRecipeIds(uid);
    if (!downloadedIds.has(recipeId)) {
      return undefined;
    }

    const userRecipe = await this.getUserData<Recipe | null>(uid, `downloaded_recipe_${recipeId}`, null);
    if (userRecipe && userRecipe.ingredients && userRecipe.ingredients.length > 0) {
      return userRecipe;
    }

    return undefined;
  }

  async getAllDownloadedRecipes(uid?: string): Promise<Recipe[]> {
    if (!uid || uid === 'guest') {
      return [];
    }
    const ids = await this.getDownloadedRecipeIds(uid);
    const recipes: Recipe[] = [];
    for (const id of ids) {
      const r = await this.getRecipe(id, uid);
      if (r) recipes.push(r);
    }
    return recipes;
  }

  async deleteRecipe(recipeId: string, uid?: string): Promise<void> {
    const safeUid = uid || 'guest';
    await this.setUserData(safeUid, `downloaded_recipe_${recipeId}`, null);
  }

  // ---------------- USER-SCOPED DATA ---------------- //

  async getUserData<T>(uid: string, keyName: string, fallback: T): Promise<T> {
    try {
      const db = await this.getDB();
      const fullKey = this.userKey(uid, keyName);
      return new Promise((resolve) => {
        const tx = db.transaction('user_data', 'readonly');
        const store = tx.objectStore('user_data');
        const req = store.get(fullKey);
        req.onsuccess = () => {
          if (req.result && req.result.value !== undefined) {
            resolve(req.result.value as T);
          } else {
            // Check legacy localStorage migration fallback
            const migrated = this.migrateLegacyData(keyName, fallback);
            resolve(migrated);
          }
        };
        req.onerror = () => resolve(fallback);
      });
    } catch {
      return fallback;
    }
  }

  async setUserData<T>(uid: string, keyName: string, value: T): Promise<void> {
    try {
      const db = await this.getDB();
      const fullKey = this.userKey(uid, keyName);
      return new Promise((resolve, reject) => {
        const tx = db.transaction('user_data', 'readwrite');
        const store = tx.objectStore('user_data');
        const req = store.put({ key: fullKey, value, updatedAt: new Date().toISOString() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to set user data in IndexedDB:', err);
    }
  }

  // ---------------- USER DOWNLOADS ---------------- //

  async getDownloadedRecipeIds(uid: string): Promise<Set<string>> {
    const list = await this.getUserData<string[]>(uid, 'downloads', []);
    return new Set(list);
  }

  async recordRecipeDownload(uid: string, recipe: Recipe): Promise<void> {
    // 1. Save user-scoped recipe data
    await this.setUserData(uid, `downloaded_recipe_${recipe.recipeId}`, recipe);

    // 2. Save full recipe object to user-scoped storage
    await this.saveRecipe(recipe, uid);

    // 3. Update user's downloaded IDs set
    const ids = await this.getDownloadedRecipeIds(uid);
    ids.add(recipe.recipeId);
    await this.setUserData(uid, 'downloads', Array.from(ids));

    // 4. Cache image in Cache Storage if supported
    if (recipe.image && typeof caches !== 'undefined') {
      try {
        const imgCache = await caches.open('palate-place-images-v1');
        await imgCache.add(recipe.image);
      } catch (err) {
        console.warn('Image pre-cache note:', err);
      }
    }
  }

  async removeRecipeDownload(uid: string, recipeId: string): Promise<void> {
    // 1. Remove user-scoped recipe copy
    await this.setUserData(uid, `downloaded_recipe_${recipeId}`, null);

    // 2. Remove user-scoped recipe copy
    await this.deleteRecipe(recipeId, uid);

    // 3. Remove from user downloads
    const ids = await this.getDownloadedRecipeIds(uid);
    ids.delete(recipeId);
    await this.setUserData(uid, 'downloads', Array.from(ids));
  }

  // ---------------- OFFLINE MUTATIONS QUEUE ---------------- //

  async enqueueMutation(mutation: Omit<QueuedMutation, 'id' | 'createdAt' | 'synced'>): Promise<void> {
    try {
      const db = await this.getDB();
      const fullMutation: QueuedMutation = {
        ...mutation,
        id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
        createdAt: new Date().toISOString(),
        synced: false
      };
      return new Promise((resolve, reject) => {
        const tx = db.transaction('offline_queue', 'readwrite');
        const store = tx.objectStore('offline_queue');
        const req = store.put(fullMutation);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to enqueue mutation in IndexedDB:', err);
    }
  }

  async getPendingMutations(uid: string): Promise<QueuedMutation[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('offline_queue', 'readonly');
        const store = tx.objectStore('offline_queue');
        const index = store.index('by_uid');
        const req = index.getAll(uid);
        req.onsuccess = () => {
          const all = (req.result || []) as QueuedMutation[];
          resolve(all.filter(m => !m.synced));
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  async markMutationsSynced(ids: string[]): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('offline_queue', 'readwrite');
        const store = tx.objectStore('offline_queue');
        for (const id of ids) {
          store.delete(id);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to clear synced mutations:', err);
    }
  }

  // ---------------- PENDING MEAL PHOTOS ---------------- //

  async savePendingPhoto(photo: Omit<PendingPhoto, 'createdAt' | 'synced'>): Promise<void> {
    try {
      const db = await this.getDB();
      const fullPhoto: PendingPhoto = {
        ...photo,
        createdAt: new Date().toISOString(),
        synced: false
      };
      return new Promise((resolve, reject) => {
        const tx = db.transaction('pending_photos', 'readwrite');
        const store = tx.objectStore('pending_photos');
        const req = store.put(fullPhoto);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to save pending photo in IndexedDB:', err);
    }
  }

  async getPendingPhotos(uid: string): Promise<PendingPhoto[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('pending_photos', 'readonly');
        const store = tx.objectStore('pending_photos');
        const index = store.index('by_uid');
        const req = index.getAll(uid);
        req.onsuccess = () => {
          const all = (req.result || []) as PendingPhoto[];
          resolve(all.filter(p => !p.synced));
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  async markPhotoUploaded(photoId: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('pending_photos', 'readwrite');
        const store = tx.objectStore('pending_photos');
        const req = store.delete(photoId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to delete pending photo:', err);
    }
  }

  // ---------------- SAFE MIGRATION FROM LEGACY LOCALSTORAGE ---------------- //

  private migrateLegacyData<T>(keyName: string, fallback: T): T {
    try {
      const map: Record<string, string> = {
        favorites: 'ctw_local_favorites_v1',
        passport: 'ctw_local_passport_v1',
        shopping: 'ctw_local_shopping_list_v1',
        history: 'ctw_offline_cooking_queue_v1',
        downloads: 'ctw_downloaded_recipes_v1'
      };
      const oldKey = map[keyName];
      if (!oldKey) return fallback;

      const raw = localStorage.getItem(oldKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Clean up legacy key so it does not persist across users
        localStorage.removeItem(oldKey);
        return parsed as T;
      }
    } catch {
      // Ignore migration read error
    }
    return fallback;
  }
}

export const indexedDbStorage = new IndexedDBStorage();
