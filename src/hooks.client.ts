/**
 * Client-side hooks for PWA service worker registration
 * This enables the app to be installed on Android (via TWA) and iOS (Add to Home Screen)
 */

import { browser } from "$app/environment";

// Register service worker on app load
if (browser) {
  // Dynamic import to avoid SSR issues
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onRegisteredSW(swScriptUrl) {
        console.log("✅ Service worker registered:", swScriptUrl);
      },
      onOfflineReady() {
        console.log("📱 App ready to work offline");
      },
      onNeedRefresh() {
        // Auto-update when new version is available
        console.log("🔄 New content available, refreshing...");
      },
      onRegisterError(error) {
        console.error("❌ Service worker registration failed:", error);
      },
    });
  });
}
