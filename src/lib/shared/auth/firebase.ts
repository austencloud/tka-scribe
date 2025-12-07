/**
 * Firebase Configuration and Initialization
 *
 * Sets up Firebase app and exports auth instance for use throughout the application.
 * Uses environment variables for configuration.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  type Auth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  setPersistence,
} from "firebase/auth";
import {
  initializeFirestore,
  type Firestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAnalytics, type Analytics, isSupported } from "firebase/analytics";
import { createComponentLogger } from "$lib/shared/utils/debug-logger";

const debug = createComponentLogger("Firebase");

// Firebase Storage is lazily loaded - only imported where actually needed
// See: src/routes/api/instagram/upload-media/+server.ts

/**
 * Firebase configuration object
 * Uses hardcoded values for reliable deployment across environments
 */
const firebaseConfig = {
  apiKey: "AIzaSyDKUM9pf0e_KgFjW1OBKChvrU75SnR12v4",
  authDomain: "the-kinetic-alphabet.firebaseapp.com",
  projectId: "the-kinetic-alphabet",
  storageBucket: "the-kinetic-alphabet.firebasestorage.app",
  messagingSenderId: "664225703033",
  appId: "1:664225703033:web:62e6c1eebe4fff3ef760a8",
  measurementId: "G-CQH94GGM6B",
};

/**
 * Initialize Firebase App
 * Prevents multiple initializations in development with HMR
 */
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!; // Safe because we check length above
}

/**
 * Firebase Auth instance
 * Use this throughout the app for authentication operations
 */
export const auth: Auth = getAuth(app);

/**
 * Firestore instance
 * Use this for all database operations (gamification, user data, etc.)
 * Configured with persistent local cache for offline support with multi-tab sync
 * Multi-tab mode avoids IndexedDB ownership errors when multiple tabs are open
 */
export const firestore: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

/**
 * Get Firebase Storage instance (lazy loaded)
 * Use this for file uploads (profile photos, sequence thumbnails, etc.)
 * Storage is loaded on-demand to reduce initial bundle size (~84KB saved)
 */
export async function getStorageInstance(): Promise<import("firebase/storage").FirebaseStorage> {
  const { getStorage } = await import("firebase/storage");
  return getStorage(app);
}

/**
 * Firebase Analytics instance
 * Provides: user demographics, device info, geography, sessions, page views,
 * screen time, crash reporting, funnel analysis, retention reports,
 * A/B testing integration, Google Ads integration, and real-time monitoring.
 *
 * View dashboards at: https://console.firebase.google.com/project/the-kinetic-alphabet/analytics
 */
let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        debug.success("Firebase Analytics initialized");
      }
    })
    .catch((error) => {
      debug.warn("Firebase Analytics not supported:", error);
    });
}

export { analytics };

/**
 * Configure Firebase Auth persistence
 * Try IndexedDB first (most reliable), fallback to localStorage
 * This provides the best resilience against storage clearing during redirects
 */
if (typeof window !== "undefined") {
  setPersistence(auth, indexedDBLocalPersistence)
    .catch(() => {
      return setPersistence(auth, browserLocalPersistence);
    })
    .catch((error) => {
      console.error("❌ [Firebase] Failed to set persistence:", error);
    });
}

/**
 * Export the app instance if needed for other Firebase services
 */
export { app };
