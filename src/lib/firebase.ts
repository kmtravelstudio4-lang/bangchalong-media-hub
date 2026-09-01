/**
 * ============================================================================
 * FIREBASE BACKUP & REFERENCE MODULE
 * ============================================================================
 * NOTE: This module is retained for backup and reference purposes only.
 * The production runtime database has migrated to Supabase PostgreSQL (Single Source of Truth).
 * AppContext and UI components do NOT use Firebase in production runtime.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

let db: any = null;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, dbId);
} catch (e) {
  db = getFirestore(app, dbId);
}

export const auth = getAuth(app);
export { db };
export default app;
