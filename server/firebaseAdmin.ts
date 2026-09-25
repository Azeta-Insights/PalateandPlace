import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseAppletConfig from '../firebase-applet-config.json';

const adminApp = getApps().length > 0
  ? getApp()
  : initializeApp({
      projectId: firebaseAppletConfig.projectId
    });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp, firebaseAppletConfig.firestoreDatabaseId);

try {
  adminDb.settings({ ignoreUndefinedProperties: true });
} catch {
  // Already initialized settings
}

export default adminApp;
