/**
 * Gallery Cache Clear Utility
 *
 * Clears all gallery caching layers to force fresh metadata extraction
 * with the new difficulty calculator.
 *
 * USE THIS to fix cached difficulty levels after implementing the calculator!
 */

import { resolve } from "../inversify/index";
import { TYPES } from "../inversify/types";
import type { IDiscoverCacheService } from "../../modules/discover/gallery/display/services/contracts/IDiscoverCacheService";
import type { IOptimizedDiscoverService } from "../../modules/discover/shared/services/contracts/IOptimizedDiscoverService";

export async function clearAllGalleryCaches(): Promise<void> {
  console.log("🧹 Clearing ALL gallery caches...");

  try {
    // 1. Clear DiscoverCacheService
    const exploreCacheService = resolve<IDiscoverCacheService>(
      TYPES.IDiscoverCacheService
    );
    exploreCacheService.clearCache();
    console.log("✅ Cleared DiscoverCacheService");

    // 2. Clear OptimizedDiscoverService
    const optimizedService = resolve<IOptimizedDiscoverService>(
      TYPES.IOptimizedDiscoverService
    );
    optimizedService.clearCache();
    console.log("✅ Cleared OptimizedDiscoverService");

    // 3. Clear IndexedDB/Dexie cache if it exists
    if ("indexedDB" in window) {
      try {
        const dbName = "tka-persistence";
        await new Promise<void>((resolve, reject) => {
          const request = indexedDB.deleteDatabase(dbName);
          request.onsuccess = () => {
            console.log("✅ Cleared IndexedDB");
            resolve();
          };
          request.onerror = () => reject(request.error);
        });
      } catch (err) {
        console.log("⚠️ No IndexedDB to clear");
      }
    }

    // 4. Clear localStorage gallery data
    const galleryKeys = Object.keys(localStorage).filter(
      (key) =>
        key.includes("gallery") ||
        key.includes("discover") ||
        key.includes("sequence")
    );
    galleryKeys.forEach((key) => localStorage.removeItem(key));
    if (galleryKeys.length > 0) {
      console.log(`✅ Cleared ${galleryKeys.length} localStorage entries`);
    }

    console.log(
      "🎉 All gallery caches cleared! Refresh the page to load fresh data."
    );

    // Return success message
    return Promise.resolve();
  } catch (error) {
    console.error("❌ Error clearing caches:", error);
    throw error;
  }
}

/**
 * Call this from browser console to clear caches:
 *
 * ```javascript
 * import { clearAllGalleryCaches } from './src/lib/shared/utils/clear-gallery-cache';
 * await clearAllGalleryCaches();
 * location.reload();
 * ```
 */

// Make it available globally for easy console access
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__clearGalleryCache = clearAllGalleryCaches;
}
