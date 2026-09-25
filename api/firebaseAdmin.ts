import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Client Firebase Auth project is 'cooktheworldapp', Firestore DB ID is 'ai-studio-acafaa41-8ab8-407e-85e5-e51ae1fea3fb'
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'cooktheworldapp';
const firestoreDatabaseId = process.env.FIREBASE_DATABASE_ID || 'ai-studio-acafaa41-8ab8-407e-85e5-e51ae1fea3fb';

let adminApp: any = null;
let adminDbInstance: any = null;

try {
  adminApp = getApps().length > 0
    ? getApp()
    : initializeApp({ projectId });

  try {
    adminDbInstance = (firestoreDatabaseId && firestoreDatabaseId !== '(default)')
      ? getFirestore(adminApp, firestoreDatabaseId)
      : getFirestore(adminApp);

    try {
      adminDbInstance.settings({ ignoreUndefinedProperties: true });
    } catch {
      // Settings already set
    }
  } catch (dbErr) {
    console.warn('Firebase Admin getFirestore warning:', dbErr);
  }
} catch (appErr) {
  console.warn('Firebase Admin initializeApp warning:', appErr);
}

export const adminAuth = null;
export const adminDb = adminDbInstance;
export default adminApp;
