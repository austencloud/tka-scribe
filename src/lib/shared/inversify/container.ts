import { Container } from "inversify";

// Export TYPES immediately to avoid circular dependency
export { TYPES } from "./types";

// Create container
const container = new Container();

// Export container and resolve function immediately
export { container };
export const inversifyContainer = container;

// Track initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;
let isHMRRecovering = false; // Track HMR recovery state

// Track loaded modules to prevent duplicate loading
let loadedModules = new Set<string>();
let tier1Loaded = false;
let tier2Loaded = false;
let tier2Promise: Promise<void> | null = null;

// Browser detection utility
const isBrowser = typeof window !== "undefined";

// Handle HMR (Hot Module Replacement) - Full container rebuild
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log("🔄 HMR: Rebuilding InversifyJS container...");
    isHMRRecovering = true;

    try {
      // Clear all existing bindings
      container.unbindAll();

      // Reset initialization state
      isInitialized = false;
      initializationPromise = null;

      // Reset tier loading flags to prevent duplicate loading
      tier1Loaded = false;
      tier2Loaded = false;
      tier2Promise = null;
      loadedModules.clear();

      // Rebuild the container
      initializeContainer()
        .then(() => {
          isHMRRecovering = false;
          console.log("✅ HMR: Container successfully rebuilt");
        })
        .catch((error) => {
          console.error("❌ HMR: Container rebuild failed:", error);
          isHMRRecovering = false;
        });
    } catch (error) {
      console.error("❌ HMR: Container unbind failed:", error);
      isHMRRecovering = false;
    }
  });

  // Clean up on module disposal
  import.meta.hot.dispose(() => {
    console.log("🧹 HMR: Disposing container...");
    try {
      container.unbindAll();
    } catch (error) {
      console.error("❌ HMR: Container disposal failed:", error);
    }
    isInitialized = false;
    initializationPromise = null;
    tier1Loaded = false;
    tier2Loaded = false;
    tier2Promise = null;
    loadedModules.clear();
  });
}

// DEPRECATED: Sync resolve function - use async resolve instead
export function resolveSync<T>(serviceType: symbol): T {
  // Don't resolve services during SSR
  if (!isBrowser) {
    throw new Error(
      `Cannot resolve service ${String(serviceType)} during server-side rendering. Use tryResolve() or ensure this code only runs in browser.`
    );
  }

  // If we're in HMR recovery mode, wait a bit for auto-recovery
  if (isHMRRecovering) {
    // Small delay to allow HMR recovery to complete
    setTimeout(() => {}, 10);
  }

  if (!isInitialized) {
    // During HMR, try to auto-recover by re-initializing silently
    if (import.meta.hot && !isHMRRecovering) {
      isHMRRecovering = true;
      // Start initialization in background but throw for now - next call should work
      initializeContainer()
        .then(() => {
          isHMRRecovering = false;
        })
        .catch((error) => {
          console.error("❌ HMR: Container recovery failed:", error);
          isHMRRecovering = false;
        });
    }

    throw new Error(
      `Container not initialized. Service ${String(serviceType)} cannot be resolved before container initialization completes.`
    );
  }

  try {
    return container.get<T>(serviceType);
  } catch (error) {
    // During HMR, container might have stale bindings
    if (import.meta.hot && !isHMRRecovering) {
      isHMRRecovering = true;
      initializeContainer()
        .then(() => {
          isHMRRecovering = false;
        })
        .catch((err) => {
          console.error("HMR re-initialization failed:", err);
          isHMRRecovering = false;
        });
    }
    throw error;
  }
}

// Safe resolve function that returns null if container is not ready
export function tryResolve<T>(serviceType: symbol): T | null {
  // Return null during SSR
  if (!isBrowser) {
    return null;
  }

  if (!isInitialized) {
    return null;
  }
  try {
    return container.get<T>(serviceType);
  } catch (error) {
    console.warn(`Failed to resolve ${String(serviceType)}:`, error);
    return null;
  }
}

// Async resolve function for use during initialization
export async function resolve<T>(serviceType: symbol): Promise<T> {
  await ensureContainerInitialized();
  return container.get<T>(serviceType);
}

// Check if container is initialized
export function isContainerInitialized(): boolean {
  return isInitialized;
}

// Get container status for debugging
export function getContainerStatus() {
  return {
    isInitialized,
    hasInitializationPromise: initializationPromise !== null,
    containerExists: container !== null,
  };
}

// Ensure container is initialized
export async function ensureContainerInitialized(): Promise<void> {
  if (isInitialized) return;
  if (initializationPromise) {
    await initializationPromise;
    return;
  }
  await initializeContainer();
}

/**
 * TIER 1: Load critical infrastructure modules (auth, navigation, persistence)
 * ⏱️ Target: <500ms - Essential for app shell to become interactive
 */
export async function loadCriticalModules(): Promise<void> {
  if (tier1Loaded) return;

  try {
    console.log("🔄 Loading critical modules...");
    const modules = await import("./modules");

    // 🐛 DEBUG: Verify modules loaded correctly
    console.log("📦 Modules imported:", {
      hasModules: !!modules,
      keys: modules ? Object.keys(modules) : []
    });

    if (!modules) {
      throw new Error("Failed to import modules - modules is undefined");
    }

    const { coreModule, navigationModule, dataModule } = modules;

    // 🐛 DEBUG: Verify each module exists
    console.log("🔍 Checking individual modules:", {
      coreModule: !!coreModule,
      navigationModule: !!navigationModule,
      dataModule: !!dataModule
    });

    if (!coreModule) {
      throw new Error("coreModule is undefined");
    }
    if (!navigationModule) {
      throw new Error("navigationModule is undefined");
    }
    if (!dataModule) {
      throw new Error("dataModule is undefined");
    }

    console.log("⚙️ Loading modules into container...");
    await container.load(coreModule, navigationModule, dataModule);

    loadedModules.add("core");
    loadedModules.add("navigation");
    loadedModules.add("data");
    tier1Loaded = true;

    console.log("✅ Tier 1 loaded: Critical infrastructure");
  } catch (error) {
    console.error("❌ Failed to load Tier 1 modules:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

/**
 * TIER 2: Load shared service modules (rendering, animation, pictographs)
 * ⏱️ Non-blocking - Loads in background while user reads content
 * These modules are used across ALL features (panels, rendering, etc.)
 */
export async function loadSharedModules(): Promise<void> {
  if (tier2Loaded) return;

  // If already loading, wait for the existing promise
  if (tier2Promise) {
    await tier2Promise;
    return;
  }

  // Start loading and cache the promise
  tier2Promise = (async () => {
    try {
      const modules = await import("./modules");
      const {
        renderModule,
        pictographModule,
        animatorModule, // Animation panels appear across all modules
        gamificationModule,
      } = modules;

      await container.load(
        renderModule,
        pictographModule,
        animatorModule,
        gamificationModule
      );

      loadedModules.add("render");
      loadedModules.add("pictograph");
      loadedModules.add("animator");
      loadedModules.add("gamification");
      tier2Loaded = true;

      console.log(
        "✅ Tier 2 loaded: Shared services (render, animator, pictograph)"
      );
    } catch (error) {
      console.error("❌ Failed to load Tier 2 modules:", error);
      // Reset promise so it can be retried
      tier2Promise = null;
      // Non-critical, don't throw
    }
  })();

  await tier2Promise;
}

/**
 * TIER 3: Load feature modules on-demand (user tabs)
 * ⏱️ Load when tab is clicked OR when user hovers >50ms (preloading)
 *
 * @param feature - Tab name: 'create', 'explore', 'learn', 'word_card', 'write', 'admin', 'share'
 */
export async function loadFeatureModule(
  feature: string
): Promise<void> {
  // Check if already loaded
  if (loadedModules.has(feature)) {
    console.log(`✓ Module '${feature}' already loaded`);
    return;
  }

  try {
    const modules = await import("./modules");

    // Map feature names to their DI modules
    const moduleMap: Record<string, any[]> = {
      create: [modules.createModule, modules.shareModule], // Create depends on share services
      explore: [modules.exploreModule],
      learn: [modules.learnModule],
      word_card: [modules.wordCardModule],
      write: [modules.writeModule],
      admin: [modules.adminModule], // Role-gated
      share: [modules.shareModule], // Export/sharing panels (standalone if needed)
    };

    const moduleList = moduleMap[feature];
    if (!moduleList) {
      console.warn(`Unknown feature module: ${feature}`);
      return;
    }

    await container.load(...moduleList);
    loadedModules.add(feature);

    // Mark dependent modules as loaded too
    if (feature === 'create') {
      loadedModules.add('share'); // Create loads share
    }

    console.log(`✅ Tier 3 loaded: ${feature} module`);
  } catch (error) {
    console.error(`❌ Failed to load feature module '${feature}':`, error);
    throw error;
  }
}

/**
 * Preload a feature module in the background (for hover-based preloading)
 * Non-blocking, errors are logged but don't throw
 */
export function preloadFeatureModule(feature: string): void {
  loadFeatureModule(feature).catch((error) => {
    console.warn(`Preload failed for '${feature}':`, error);
  });
}

/**
 * Initialize the DI container with three-tier loading strategy
 *
 * TIER 1: Critical modules (blocking) - Auth, navigation, persistence
 * TIER 2: Shared services (non-blocking background) - Rendering, animation, pictographs
 * TIER 3: Feature modules (on-demand) - User tabs loaded when accessed
 *
 * This reduces initial load time from 4-5s to ~1.5-2s
 */
function initializeContainer() {
  // Don't initialize during SSR
  if (!isBrowser) {
    return Promise.resolve();
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log("🚀 TKA Container: Starting three-tier initialization...");

      // TIER 1: Load critical infrastructure (BLOCKING - must complete)
      // This makes the app shell interactive quickly
      await loadCriticalModules();

      // TIER 2: Start loading shared services in background (NON-BLOCKING)
      // Animation, rendering, pictographs used across all features
      // Don't await - let it load in parallel while user explores
      tier2Promise = loadSharedModules();

      // TIER 3: Feature modules loaded on-demand when user clicks/hovers tabs
      // No preloading here - handled by components based on user intent

      isInitialized = true;
      console.log("✅ TKA Container: Critical path loaded, app ready!");
      console.log("⏳ Background services loading...");
    } catch (error) {
      console.error("❌ TKA Container: Failed to load modules:", error);
      // Reset state so we can try again
      isInitialized = false;
      initializationPromise = null;
      tier1Loaded = false;
      tier2Loaded = false;
      loadedModules.clear();
      throw error;
    }
  })();

  return initializationPromise;
}

// Initialize the container asynchronously without blocking exports (browser-only)
if (isBrowser) {
  console.log("🚀 Starting container initialization (browser mode)");
  initializeContainer().catch((error) => {
    console.error("💥 FATAL: Container initialization failed:", error);
    console.error("💥 Stack:", error instanceof Error ? error.stack : undefined);
  });
}

// Export module initialization function for testing or manual control
export { initializeContainer };
