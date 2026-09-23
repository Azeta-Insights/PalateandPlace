import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { indexedDbStorage } from './indexedDbStorage';

export class PhotoStorageService {
  /**
   * Compresses image on client to max 1200px and 75% JPEG quality
   */
  static async compressImage(file: File | Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const maxDimension = 1200;
        let { width, height } = img;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file instanceof Blob ? file : new Blob([file]));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file instanceof Blob ? file : new Blob([file]));
            }
          },
          'image/jpeg',
          0.75
        );
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };

      img.src = url;
    });
  }

  /**
   * Securely saves or uploads a user's cooked meal photo
   * Conceptual path: mealPhotos/{uid}/{photoId}.jpg
   */
  static async processMealPhoto(
    file: File | Blob,
    uid: string,
    recipeId: string,
    isOnline: boolean = navigator.onLine
  ): Promise<{ photoUrl: string; pendingUploadId?: string }> {
    const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
    const compressedBlob = await this.compressImage(file);

    // If offline or guest: store in IndexedDB and generate local blob URL
    if (!isOnline || !uid || uid === 'guest') {
      await indexedDbStorage.savePendingPhoto({
        photoId,
        uid: uid || 'guest',
        recipeId,
        blob: compressedBlob,
        mimeType: 'image/jpeg'
      });

      const localBlobUrl = URL.createObjectURL(compressedBlob);
      return {
        photoUrl: localBlobUrl,
        pendingUploadId: photoId
      };
    }

    // If online with authenticated user: upload to Cloud Storage
    try {
      const storagePath = `mealPhotos/${uid}/${photoId}.jpg`;
      const photoRef = ref(storage, storagePath);

      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          uid,
          recipeId,
          uploadedAt: new Date().toISOString()
        }
      };

      await uploadBytes(photoRef, compressedBlob, metadata);
      const downloadUrl = await getDownloadURL(photoRef);

      return {
        photoUrl: downloadUrl
      };
    } catch (err) {
      console.warn('Direct Cloud Storage upload failed, enqueuing offline photo:', err);
      // Fallback: enqueue locally in IndexedDB
      await indexedDbStorage.savePendingPhoto({
        photoId,
        uid,
        recipeId,
        blob: compressedBlob,
        mimeType: 'image/jpeg'
      });

      const localBlobUrl = URL.createObjectURL(compressedBlob);
      return {
        photoUrl: localBlobUrl,
        pendingUploadId: photoId
      };
    }
  }

  /**
   * Syncs pending photos stored in IndexedDB when online
   */
  static async syncPendingPhotos(uid: string): Promise<Record<string, string>> {
    if (!uid || uid === 'guest' || !navigator.onLine) return {};

    const uploadedMap: Record<string, string> = {};
    try {
      const pendingList = await indexedDbStorage.getPendingPhotos(uid);
      for (const item of pendingList) {
        try {
          const storagePath = `mealPhotos/${uid}/${item.photoId}.jpg`;
          const photoRef = ref(storage, storagePath);
          await uploadBytes(photoRef, item.blob, { contentType: item.mimeType });
          const downloadUrl = await getDownloadURL(photoRef);
          uploadedMap[item.photoId] = downloadUrl;
          await indexedDbStorage.markPhotoUploaded(item.photoId);
        } catch (e) {
          console.warn(`Failed to sync pending photo ${item.photoId}:`, e);
        }
      }
    } catch (err) {
      console.warn('Error syncing pending meal photos:', err);
    }

    return uploadedMap;
  }
}
