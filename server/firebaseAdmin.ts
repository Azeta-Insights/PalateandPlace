import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = 'ai-studio-acafaa41-8ab8-407e-85e5-e51ae1fea3fb';
const firestoreDatabaseId = '(default)';

let adminApp: any = null;
let adminAuthInstance: any = null;
let adminDbInstance: any = null;

try {
  adminApp = getApps().length > 0
    ? getApp()
    : initializeApp({ projectId });

  try {
    adminAuthInstance = getAuth(adminApp);
  } catch (authErr) {
    console.warn('Firebase Admin getAuth warning:', authErr);
  }

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

export const adminAuth = adminAuthInstance;
export const adminDb = adminDbInstance;
export default adminApp;
