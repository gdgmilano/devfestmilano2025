import { getAnalytics } from 'firebase/analytics';
import { FirebaseOptions, initializeApp } from 'firebase/app';
import { Firestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getPerformance, initializePerformance } from 'firebase/performance';

/**
 * Load Firebase config in index.html with /__/firebase/init.js. It stubs out
 * window.firebase.initializeApp to grab the config and saves it on the window
 * for use here. This is a workaround for the fact that the Firebase SDK v9 is
 * modular and doesn't support init.js and top-level await is not well supported
 * so loading from init.json caused issues with Safari, Jest, Vite, etc.
 *
 * https://github.com/gdg-x/hoverboard/pull/2368
 */

declare global {
  interface Window {
    firebaseConfig?: FirebaseOptions;
    firestoreDatabaseId?: string;
  }
}

const firebaseConfig = window.firebaseConfig;

if (!firebaseConfig) {
  throw new Error('window.firebaseConfig is not defined');
}

// Use specific database ID if provided, otherwise use default
const databaseId = window.firestoreDatabaseId || '(default)';

// Debug log to see which database is being used
console.log('🔥 Firebase Database ID:', databaseId);
console.log('🔥 Firebase Config:', firebaseConfig);

export const firebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = initializeFirestore(
  firebaseApp,
  {
    localCache: persistentLocalCache(),
  },
  databaseId
);
export const performance = getPerformance(firebaseApp);
export const analytics = getAnalytics(firebaseApp);

initializePerformance(firebaseApp);
