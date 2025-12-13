/**
 * Thumbnail Asset Cache
 *
 * Singleton cache for thumbnail rendering assets (grid SVGs, prop SVGs, arrow SVGs).
 * Prevents per-instance service resolution for gallery views.
 */

import { tryResolve, TYPES } from "$lib/shared/inversify/di";
import type { ISvgPreloadService } from "$lib/shared/pictograph/shared/services/contracts/ISvgPreloadService";

interface ThumbnailAssetCacheState {
  gridSvg: string | null;
  isInitialized: boolean;
  isLoading: boolean;
}

// Singleton state
let cacheState = $state<ThumbnailAssetCacheState>({
  gridSvg: null,
  isInitialized: false,
  isLoading: false,
});

// Initialization promise to prevent duplicate loads
let initPromise: Promise<void> | null = null;

/**
 * Initialize the thumbnail asset cache
 * Loads commonly used SVGs once for all thumbnail instances
 */
async function initializeCache(): Promise<void> {
  if (cacheState.isInitialized || cacheState.isLoading) {
    return initPromise ?? Promise.resolve();
  }

  cacheState.isLoading = true;

  initPromise = (async () => {
    try {
      const svgPreloadService = tryResolve<ISvgPreloadService>(
        TYPES.ISvgPreloadService
      );

      if (svgPreloadService) {
        // Load diamond grid (base for all grid modes)
        try {
          cacheState.gridSvg = await svgPreloadService.getSvgContent(
            "grid",
            "diamond_grid"
          );
        } catch (error) {
          console.warn("[ThumbnailAssetCache] Failed to load grid SVG:", error);
          // Use fallback grid
          cacheState.gridSvg = createFallbackGrid();
        }
      } else {
        console.warn("[ThumbnailAssetCache] SVG preload service not available");
        cacheState.gridSvg = createFallbackGrid();
      }

      cacheState.isInitialized = true;
    } catch (error) {
      console.error("[ThumbnailAssetCache] Initialization failed:", error);
      cacheState.gridSvg = createFallbackGrid();
      cacheState.isInitialized = true;
    } finally {
      cacheState.isLoading = false;
    }
  })();

  return initPromise;
}

/**
 * Create a simple fallback grid when SVG loading fails
 */
function createFallbackGrid(): string {
  return `
    <g id="fallback-grid">
      <line x1="475" y1="100" x2="475" y2="850" stroke="#e0e0e0" stroke-width="2" />
      <line x1="100" y1="475" x2="850" y2="475" stroke="#e0e0e0" stroke-width="2" />
      <line x1="200" y1="200" x2="750" y2="750" stroke="#e0e0e0" stroke-width="1" opacity="0.5" />
      <line x1="750" y1="200" x2="200" y2="750" stroke="#e0e0e0" stroke-width="1" opacity="0.5" />
      <circle cx="475" cy="475" r="5" fill="#888" />
    </g>
  `;
}

/**
 * Thumbnail Asset Cache API
 */
export interface ThumbnailAssetCache {
  getGridSvg(): string | null;
  isReady(): boolean;
  ensureInitialized(): Promise<void>;
}

/**
 * Get the thumbnail asset cache singleton
 */
export function getThumbnailAssetCache(): ThumbnailAssetCache {
  return {
    getGridSvg: () => cacheState.gridSvg,
    isReady: () => cacheState.isInitialized,
    ensureInitialized: initializeCache,
  };
}

/**
 * Pre-initialize the cache (call early in app lifecycle)
 */
export function preloadThumbnailAssets(): Promise<void> {
  return initializeCache();
}
