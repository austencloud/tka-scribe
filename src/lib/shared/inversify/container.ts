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
const loadedModules = new Set<string>();
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

    // Save the list of loaded feature modules BEFORE clearing
    const featureModulesToRestore = Array.from(loadedModules).filter(
      (module) =>
        ![
          "core",
          "navigation",
          "data",
          "keyboard",
          "render",
          "pictograph",
          "create",
          "share",
          "animator",
          "gamification",
        ].includes(module)
    );

    try {
      // Clear all existing bindings
      void container.unbindAll();

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
        .then(async () => {
          // Restore previously loaded feature modules
          console.log(
            `🔄 HMR: Restoring feature modules: ${featureModulesToRestore.join(", ")}`
          );
          for (const module of featureModulesToRestore) {
            try {
              await loadFeatureModule(module);
              console.log(`✅ HMR: Restored feature module "${module}"`);
            } catch (error) {
              console.error(
                `❌ HMR: Failed to restore feature module "${module}":`,
                error
              );
            }
          }

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
      void container.unbindAll();
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
    const modules = await import("./modules");

    if (!modules) {
      throw new Error("Failed to import modules - modules is undefined");
    }

    const { coreModule, navigationModule, dataModule, keyboardModule, analyticsModule } =
      modules;

    if (!coreModule) {
      throw new Error("coreModule is undefined");
    }
    if (!navigationModule) {
      throw new Error("navigationModule is undefined");
    }
    if (!dataModule) {
      throw new Error("dataModule is undefined");
    }
    if (!keyboardModule) {
      throw new Error("keyboardModule is undefined");
    }
    if (!analyticsModule) {
      throw new Error("analyticsModule is undefined");
    }

    await container.load(
      coreModule,
      navigationModule,
      dataModule,
      keyboardModule,
      analyticsModule
    );

    loadedModules.add("core");
    loadedModules.add("navigation");
    loadedModules.add("data");
    loadedModules.add("keyboard");
    loadedModules.add("analytics");
    tier1Loaded = true;
  } catch (error) {
    console.error("❌ Failed to load Tier 1 modules:", error);
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
        createModule, // Animator depends on sequence transformation services from create
        shareModule, // CreateModule depends on IShareService
        animatorModule, // Animation panels appear across all modules
        gamificationModule,
      } = modules;

      await container.load(
        renderModule,
        pictographModule,
        createModule,
        shareModule,
        animatorModule,
        gamificationModule
      );

      loadedModules.add("render");
      loadedModules.add("pictograph");
      loadedModules.add("create");
      loadedModules.add("share");
      loadedModules.add("animator");
      loadedModules.add("gamification");
      tier2Loaded = true;
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
 * @param feature - Tab name: 'create', 'explore', 'community', 'learn', 'animate', 'edit', 'collect', 'about', 'word_card', 'write', 'admin', 'share'
 */
export async function loadFeatureModule(feature: string): Promise<void> {
  // Check if already loaded
  if (loadedModules.has(feature)) {
    return;
  }

  try {
    const modules = await import("./modules");

    // Map feature names to their DI modules with dependency tracking
    const moduleMap: Record<string, Array<{ module: any; name: string }>> = {
      create: [
        // createModule and shareModule are now loaded in Tier 2
      ],
      explore: [
        { module: modules.exploreModule, name: "explore" },
        { module: modules.libraryModule, name: "library" },
      ],
      community: [
        { module: modules.exploreModule, name: "explore" },
        { module: modules.communityModule, name: "community" },
      ],
      learn: [{ module: modules.learnModule, name: "learn" }],
      animate: [{ module: modules.exploreModule, name: "explore" }],
      edit: [{ module: modules.exploreModule, name: "explore" }], // Edit uses explore services for sequence browser
      collect: [{ module: modules.libraryModule, name: "library" }],
      library: [{ module: modules.libraryModule, name: "library" }],
      about: [], // About module uses no additional DI services
      word_card: [
        { module: modules.wordCardModule, name: "word_card" },
        { module: modules.exploreModule, name: "explore" },
      ],
      write: [{ module: modules.writeModule, name: "write" }],
      admin: [
        { module: modules.adminModule, name: "admin" },
        { module: modules.libraryModule, name: "library" },
      ],
      share: [{ module: modules.shareModule, name: "share" }],
    };

    const moduleList = moduleMap[feature];
    if (!moduleList) {
      console.warn(`Unknown feature module: ${feature}`);
      return;
    }

    // Filter out already-loaded modules to prevent duplicate bindings
    const modulesToLoad = moduleList.filter(
      ({ name }) => !loadedModules.has(name)
    );

    if (modulesToLoad.length > 0) {
      await container.load(...modulesToLoad.map(({ module }) => module));

      // Mark all newly loaded modules
      modulesToLoad.forEach(({ name }) => {
        loadedModules.add(name);
      });
    }

    // Always mark the feature itself as loaded
    loadedModules.add(feature);
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
      // TIER 1: Load critical infrastructure (BLOCKING - must complete)
      // This makes the app shell interactive quickly
      await loadCriticalModules();

      // TIER 2: Start loading shared services in background (NON-BLOCKING)
      // Animation, rendering, pictographs used across all features
      // Don't await - let it load in parallel while user explores
      tier2Promise = loadSharedModules();

      // TIER 3: Feature modules loaded on-demand when user clicks/hovers tabs
      // Preload the cached module to prevent UI flicker
      preloadCachedFeatureModule();

      isInitialized = true;
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

/**
 * Preload the cached feature module to prevent UI flicker
 * Reads from localStorage and starts loading the user's last active module
 */
function preloadCachedFeatureModule(): void {
  if (!isBrowser) return;

  try {
    const cached = localStorage.getItem("tka-active-module-cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.moduleId && typeof parsed.moduleId === "string") {
        const moduleId = parsed.moduleId as string;
        console.log(
          `⚡ [container] Preloading cached feature module: ${moduleId}`
        );

        // Start loading in background (non-blocking)
        loadFeatureModule(moduleId).catch((error) => {
          console.warn(
            `⚠️ Failed to preload cached module "${moduleId}":`,
            error
          );
        });
      }
    }
  } catch (error) {
    // Ignore errors - this is just an optimization
  }
}

// Initialize the container asynchronously without blocking exports (browser-only)
if (isBrowser) {
  initializeContainer().catch((error) => {
    console.error("💥 FATAL: Container initialization failed:", error);
  });
}

// Export module initialization function for testing or manual control
export { initializeContainer };
