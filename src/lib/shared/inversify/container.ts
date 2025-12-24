import { Container } from "inversify";
import type { ContainerModule } from "inversify";

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
// Track modules currently being loaded to prevent race conditions
const pendingModules = new Map<string, Promise<void>>();
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
    // Tier 1 + Tier 2 modules are automatically reloaded, only save Tier 3 feature modules
    const featureModulesToRestore = Array.from(loadedModules).filter(
      (module) =>
        ![
          // Tier 1: Core infrastructure
          "core",
          "navigation",
          "data",
          "keyboard",
          "analytics",
          "presence",
          // Tier 2: Shared services
          "render",
          "pictograph",
          "admin",
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
      pendingModules.clear();

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
    pendingModules.clear();
  });
}

// Primary synchronous resolve used throughout the app
// Throws if the container is not yet initialized; call ensureContainerInitialized() early
export function resolve<T>(serviceType: symbol): T {
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

// Async resolve preserved for callers that want to await initialization explicitly
export async function resolveAsync<T>(serviceType: symbol): Promise<T> {
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
    const [
      { coreModule },
      { navigationModule },
      { dataModule },
      { keyboardModule },
      { analyticsModule },
      { presenceModule },
    ] = await Promise.all([
      import("./modules/core.module"),
      import("./modules/navigation.module"),
      import("./modules/data.module"),
      import("./modules/keyboard.module"),
      import("./modules/analytics.module"),
      import("./modules/presence.module"),
    ]);

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
    if (!presenceModule) {
      throw new Error("presenceModule is undefined");
    }

    await container.load(
      coreModule,
      navigationModule,
      dataModule,
      keyboardModule,
      analyticsModule,
      presenceModule
    );

    loadedModules.add("core");
    loadedModules.add("navigation");
    loadedModules.add("data");
    loadedModules.add("keyboard");
    loadedModules.add("analytics");
    loadedModules.add("presence");
    tier1Loaded = true;
  } catch (error) {
    console.error("❌ Failed to load Tier 1 modules:", error);
    throw error;
  }
}

/**
 * TIER 2: Load shared service modules (rendering, pictographs, admin)
 * ⏱️ Non-blocking - Loads in background while user reads content
 * Only truly shared modules that are needed across ALL features
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
      // Only load modules that are truly needed everywhere
      const [
        { renderModule },
        { pictographModule },
        { adminModule },
        { feedbackModule },
      ] = await Promise.all([
        import("./modules/render.module"),
        import("./modules/pictograph.module"),
        import("./modules/admin.module"),
        import("./modules/feedback.module"),
      ]);

      await container.load(
        renderModule,
        pictographModule,
        adminModule,
        feedbackModule
      );

      loadedModules.add("render");
      loadedModules.add("pictograph");
      loadedModules.add("admin");
      loadedModules.add("feedback");
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
 * @param feature - Tab name: 'create', 'discover', 'community', 'learn', 'animate', 'edit', 'collect', 'about', 'word_card', 'write', 'admin', 'share', 'compose'
 */
export async function loadFeatureModule(feature: string): Promise<void> {
  // Check if already loaded
  if (loadedModules.has(feature)) {
    return;
  }

  try {
    // Helper to load a module only if not already loaded
    // Uses pendingModules map to prevent race conditions during parallel loads
    const loadIfNeeded = async (
      name: string,
      importFn: () => Promise<{ [key: string]: ContainerModule }>
    ): Promise<void> => {
      // Already loaded - return immediately
      if (loadedModules.has(name)) return;

      // Currently loading - wait for the existing promise
      const pending = pendingModules.get(name);
      if (pending) return pending;

      // Start loading and track the promise
      const loadPromise = (async () => {
        try {
          const moduleExports = await importFn();
          const module = Object.values(moduleExports)[0] as ContainerModule;
          if (!module) {
            throw new Error(`Module ${name} export is undefined`);
          }
          await container.load(module);
          loadedModules.add(name);
        } finally {
          pendingModules.delete(name);
        }
      })();

      pendingModules.set(name, loadPromise);
      return loadPromise;
    };

    // Load only the modules needed for each feature
    switch (feature) {
      case "create":
        // Create needs build (create), share, animator, and gamification
        // IMPORTANT: share must load BEFORE build because CreateModuleInitializationService
        // (in build.module) depends on IShareService (in share.module)
        await loadIfNeeded("share", () => import("./modules/share.module"));
        await Promise.all([
          loadIfNeeded("create", () => import("./modules/build.module")),
          loadIfNeeded("animator", () => import("./modules/animator.module")),
          loadIfNeeded(
            "gamification",
            () => import("./modules/gamification.module")
          ),
        ]);
        break;

      case "discover":
        // Discover needs community module for CreatorsPanel (IUserService)
        await Promise.all([
          loadIfNeeded("discover", () => import("./modules/discover.module")),
          loadIfNeeded("community", () => import("./modules/community.module")),
        ]);
        break;

      case "community":
        // Library needs create module for OrientationCycleDetector (used by LibraryService)
        await Promise.all([
          loadIfNeeded("create", () => import("./modules/build.module")),
          loadIfNeeded("discover", () => import("./modules/discover.module")),
          loadIfNeeded("library", () => import("./modules/library.module")),
          loadIfNeeded("community", () => import("./modules/community.module")),
        ]);
        break;

      case "learn":
        await loadIfNeeded("learn", () => import("./modules/learn.module"));
        break;

      case "train":
        await Promise.all([
          loadIfNeeded("discover", () => import("./modules/discover.module")),
          loadIfNeeded("train", () => import("./modules/train.module")),
          loadIfNeeded("animator", () => import("./modules/animator.module")),
        ]);
        break;

      case "compose":
      case "animate":
        // Compose/Animate needs discover (for sequence browser) and animator
        await Promise.all([
          loadIfNeeded("discover", () => import("./modules/discover.module")),
          loadIfNeeded("animator", () => import("./modules/animator.module")),
        ]);
        break;

      case "edit":
        // Edit uses discover services for sequence browser
        await loadIfNeeded(
          "discover",
          () => import("./modules/discover.module")
        );
        break;

      case "collect":
      case "library":
        // Library needs create module for OrientationCycleDetector (used by LibraryService)
        await Promise.all([
          loadIfNeeded("create", () => import("./modules/build.module")),
          loadIfNeeded("library", () => import("./modules/library.module")),
        ]);
        break;

      case "account":
      case "settings":
        // Account/Settings uses library services for user stats
        // Library needs create module for OrientationCycleDetector (used by LibraryService)
        await Promise.all([
          loadIfNeeded("create", () => import("./modules/build.module")),
          loadIfNeeded("library", () => import("./modules/library.module")),
        ]);
        break;

      case "about":
      case "dashboard":
        // These modules use no additional DI services
        break;

      case "feedback":
        // Feedback is loaded in Tier 2, just wait for it
        if (tier2Promise) {
          await tier2Promise;
        }
        break;

      case "word_card":
        await Promise.all([
          loadIfNeeded("word_card", () => import("./modules/word-card.module")),
          loadIfNeeded("discover", () => import("./modules/discover.module")),
        ]);
        break;

      case "write":
        await loadIfNeeded("write", () => import("./modules/write.module"));
        break;

      case "admin":
        // Admin module is loaded in Tier 2, only load its dependencies here
        // Library needs create module for OrientationCycleDetector (used by LibraryService)
        await Promise.all([
          loadIfNeeded("create", () => import("./modules/build.module")),
          loadIfNeeded("library", () => import("./modules/library.module")),
          loadIfNeeded("train", () => import("./modules/train.module")),
          loadIfNeeded("discover", () => import("./modules/discover.module")),
        ]);
        break;

      case "share":
        await loadIfNeeded("share", () => import("./modules/share.module"));
        break;

      case "gamification":
        await loadIfNeeded(
          "gamification",
          () => import("./modules/gamification.module")
        );
        break;

      case "messaging":
        await loadIfNeeded(
          "messaging",
          () => import("./modules/messaging.module")
        );
        break;

      case "inbox":
        // Inbox uses messaging and notification services (loaded in Tier 2)
        await loadIfNeeded("inbox", () => import("./modules/inbox.module"));
        break;

      case "cap-labeler":
        // CAP labeler needs ISequenceAnalysisService from build.module
        await loadIfNeeded("create", () => import("./modules/build.module"));
        await loadIfNeeded(
          "cap-labeler",
          () => import("./modules/cap-labeler.module")
        );
        break;

      default:
        // Silently skip unknown modules (e.g., removed/renamed modules from old persistence data)
        console.warn(`Unknown feature module: ${feature}`);
        return;
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
      pendingModules.clear();
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
