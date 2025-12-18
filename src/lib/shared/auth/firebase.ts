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
// Firestore, Database, and Analytics are now lazy-loaded - imports moved to async functions
import type { Firestore } from "firebase/firestore";
import type { Analytics } from "firebase/analytics";
import type { Database } from "firebase/database";
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
  databaseURL: "https://the-kinetic-alphabet-default-rtdb.firebaseio.com",
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
 * Get Firestore instance (lazy loaded)
 * Use this for all database operations (gamification, user data, etc.)
 * Configured with persistent local cache for offline support with multi-tab sync
 * Multi-tab mode avoids IndexedDB ownership errors when multiple tabs are open
 * OPTIMIZATION: Lazy-loaded to reduce initial bundle size (~200-300KB saved)
 */
let firestoreInstance: Firestore | null = null;
// Initialization promise to prevent race conditions
let firestoreInitPromise: Promise<Firestore> | null = null;

export async function getFirestoreInstance(): Promise<Firestore> {
  // If already initialized, return immediately
  if (firestoreInstance) {
    return firestoreInstance;
  }

  // If initialization is in progress, wait for it
  if (firestoreInitPromise) {
    return firestoreInitPromise;
  }

  // Start initialization - MUST only happen once
  firestoreInitPromise = (async () => {
    try {
      const { getFirestore } = await import("firebase/firestore");

      // Try to get existing instance first (if already initialized elsewhere)
      try {
        firestoreInstance = getFirestore(app);
        debug.success("Firestore instance retrieved");
      } catch {
        // Not initialized yet, create new instance
        const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } =
          await import("firebase/firestore");

        firestoreInstance = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
        debug.success("Firestore initialized with persistent cache");
      }

      return firestoreInstance;
    } catch (error) {
      // Clear the promise so we can retry
      firestoreInitPromise = null;
      throw error;
    }
  })();

  return firestoreInitPromise;
}

/**
 * Get Firebase Realtime Database instance (lazy loaded)
 * Used for real-time presence tracking (online/offline status, current location)
 * Provides sub-second updates and automatic disconnect detection via onDisconnect()
 * OPTIMIZATION: Lazy-loaded to reduce initial bundle size
 */
let databaseInstance: Database | null = null;
// Forward declare _cachedDatabase for the Proxy
let _cachedDatabase: Database | null = null;
// Initialization promise to prevent race conditions
let databaseInitPromise: Promise<Database> | null = null;

export async function getDatabaseInstance(): Promise<Database> {
  // If already initialized, return immediately
  if (databaseInstance) {
    return databaseInstance;
  }

  // If initialization is in progress, wait for it
  if (databaseInitPromise) {
    return databaseInitPromise;
  }

  // Start initialization
  databaseInitPromise = (async () => {
    const { getDatabase } = await import("firebase/database");
    databaseInstance = getDatabase(app);

    // CRITICAL: Update the Proxy's cached instance so services can use it
    _cachedDatabase = databaseInstance;

    debug.success("Realtime Database lazy-loaded");
    return databaseInstance;
  })();

  return databaseInitPromise;
}

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
 * Get Firebase Analytics instance (lazy loaded)
 * Provides: user demographics, device info, geography, sessions, page views,
 * screen time, crash reporting, funnel analysis, retention reports,
 * A/B testing integration, Google Ads integration, and real-time monitoring.
 *
 * View dashboards at: https://console.firebase.google.com/project/the-kinetic-alphabet/analytics
 * OPTIMIZATION: Lazy-loaded to reduce initial bundle size
 */
let analyticsInstance: Analytics | null = null;
export async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (analyticsInstance) {
    return analyticsInstance;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const { getAnalytics, isSupported } = await import("firebase/analytics");

  const supported = await isSupported();
  if (!supported) {
    debug.warn("Firebase Analytics not supported on this device");
    return null;
  }

  analyticsInstance = getAnalytics(app);
  debug.success("Firebase Analytics lazy-loaded");
  return analyticsInstance;
}

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

/**
 * DEPRECATED: Backward-compatible firestore export
 * For top-level await support in legacy code.
 * New code should use getFirestoreInstance() instead.
 *
 * CRITICAL: Returns the Firestore instance directly (not a Proxy).
 * Code using this MUST ensure Firestore is initialized first via getFirestoreInstance().
 */
export const firestore: Firestore = new Proxy({} as Firestore, {
  get(target, prop, receiver) {
    // If Firestore is initialized, delegate ALL operations to the real instance
    if (firestoreInstance) {
      const value = Reflect.get(firestoreInstance, prop, firestoreInstance);
      // If it's a function, bind it to the real Firestore instance (not the Proxy)
      if (typeof value === 'function') {
        return value.bind(firestoreInstance);
      }
      return value;
    }

    // Not initialized - throw error
    throw new Error(
      `❌ Firestore accessed before initialization (property: ${String(prop)}). ` +
      `Call 'await getFirestoreInstance()' in your initialization code.`
    );
  },
  // Make instanceof checks work correctly
  getPrototypeOf(target) {
    return firestoreInstance ? Object.getPrototypeOf(firestoreInstance) : Object.getPrototypeOf(target);
  },
  // Pass through all descriptor checks to the real instance
  getOwnPropertyDescriptor(target, prop) {
    return firestoreInstance ? Object.getOwnPropertyDescriptor(firestoreInstance, prop) : Object.getOwnPropertyDescriptor(target, prop);
  },
  has(target, prop) {
    return firestoreInstance ? prop in firestoreInstance : prop in target;
  },
  ownKeys(target) {
    return firestoreInstance ? Reflect.ownKeys(firestoreInstance) : Reflect.ownKeys(target);
  }
});

// Initialize firestore asynchronously (browser only)
if (typeof window !== "undefined") {
  getFirestoreInstance().catch((error) => {
    console.error("❌ Failed to initialize Firestore:", error);
  });
}

/**
 * DEPRECATED: Backward-compatible database export
 * For top-level await support in legacy code.
 * New code should use getDatabaseInstance() instead.
 *
 * This is a Proxy that lazy-loads Realtime Database on first property access.
 * Works seamlessly with existing code like `ref(database, 'path')`.
 */
export const database = new Proxy({} as Database, {
  get(_target, prop) {
    // Lazy-load database on first access
    if (!_cachedDatabase) {
      throw new Error(
        "❌ Realtime Database accessed before initialization. " +
        "Import and call getDatabaseInstance() instead, or ensure your component/service " +
        "is only used in browser context after Firebase initialization."
      );
    }
    return Reflect.get(_cachedDatabase, prop);
  }
});

// Initialize database cache asynchronously (browser only)
if (typeof window !== "undefined") {
  getDatabaseInstance().then((instance) => {
    _cachedDatabase = instance;
  });
}

/**
 * DEPRECATED: Backward-compatible analytics export
 * For top-level await support in legacy code.
 * New code should use getAnalyticsInstance() instead.
 *
 * Note: This will be null if analytics is not supported on the device.
 * Always check for null before using, or wrap in try-catch.
 */
export let analytics: Analytics | null = null;

// Initialize analytics asynchronously (browser only)
if (typeof window !== "undefined") {
  getAnalyticsInstance().then((instance) => {
    analytics = instance;
  }).catch(() => {
    // Silently handle analytics initialization failure
    console.debug("[Firebase] Analytics not available");
  });
}
