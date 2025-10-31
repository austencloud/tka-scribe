/**
 * Firebase Configuration and Initialization
 *
 * Sets up Firebase app and exports auth instance for use throughout the application.
 * Uses environment variables for configuration.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { browser } from "$app/environment";

// Environment variables - use runtime env for compatibility
const PUBLIC_FIREBASE_API_KEY = browser
  ? (import.meta.env.PUBLIC_FIREBASE_API_KEY as string)
  : "";
const PUBLIC_FIREBASE_AUTH_DOMAIN = browser
  ? (import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN as string)
  : "";
const PUBLIC_FIREBASE_PROJECT_ID = browser
  ? (import.meta.env.PUBLIC_FIREBASE_PROJECT_ID as string)
  : "";
const PUBLIC_FIREBASE_STORAGE_BUCKET = browser
  ? (import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET as string)
  : "";
const PUBLIC_FIREBASE_MESSAGING_SENDER_ID = browser
  ? (import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string)
  : "";
const PUBLIC_FIREBASE_APP_ID = browser
  ? (import.meta.env.PUBLIC_FIREBASE_APP_ID as string)
  : "";

// Validate environment variables (only in browser)
if (
  browser &&
  (!PUBLIC_FIREBASE_API_KEY ||
    !PUBLIC_FIREBASE_AUTH_DOMAIN ||
    !PUBLIC_FIREBASE_PROJECT_ID)
) {
  console.warn(
    "Missing Firebase environment variables. Authentication features will be disabled."
  );
}

/**
 * Firebase configuration object
 */
const firebaseConfig = {
  apiKey: PUBLIC_FIREBASE_API_KEY,
  authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialize Firebase App
 * Prevents multiple initializations in development with HMR
 */
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

/**
 * Firebase Auth instance
 * Use this throughout the app for authentication operations
 */
export const auth: Auth = getAuth(app);

/**
 * Export the app instance if needed for other Firebase services
 */
export { app };
