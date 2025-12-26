/**
 * InversifyJS dependency injection system - Service Resolution and HMR Management
 *
 * This module provides the main DI functionality including:
 * - Service resolution (resolve, tryResolve, resolveAsync)
 * - HMR-safe container management
 * - Container initialization and lifecycle
 *
 * PERFORMANCE FIX: All container access is now dynamic to enable proper code-splitting
 */

// Export type symbols (these are safe to import statically)
import { TYPES } from "./types";
export { TYPES };

// NOTE: Do NOT re-export inversify decorators (inject, injectable, Container) here.
// They require reflect-metadata to be loaded first and break SSR.
// Import them directly from "inversify" in service implementations.
import type { Container as InversifyContainer } from "inversify";
import { debugHMR, debugHMRError } from "../utils/hmr-debug";

// ============================================================================
// HMR-SAFE CONTAINER MANAGEMENT
// ============================================================================

// Global container state that persists across HMR
declare global {
  // eslint-disable-next-line no-var
  var __TKA_CONTAINER__: InversifyContainer | undefined;
  // eslint-disable-next-line no-var
  var __TKA_CONTAINER_PROMISE__: Promise<InversifyContainer> | undefined;
  // eslint-disable-next-line no-var
  var __TKA_CONTAINER_INITIALIZED__: boolean | undefined;
}

// HMR-safe container state management
function getGlobalContainer(): InversifyContainer | null {
  if (globalThis.__TKA_CONTAINER__) {
    return globalThis.__TKA_CONTAINER__;
  }
  return null;
}

function setGlobalContainer(container: InversifyContainer | null): void {
  if (typeof globalThis !== "undefined") {
    if (container) {
      globalThis.__TKA_CONTAINER__ = container;
      globalThis.__TKA_CONTAINER_INITIALIZED__ = true;
    } else {
      globalThis.__TKA_CONTAINER__ = undefined;
      globalThis.__TKA_CONTAINER_INITIALIZED__ = false;
    }
  }
}

function getGlobalPromise(): Promise<InversifyContainer> | null {
  if (globalThis.__TKA_CONTAINER_PROMISE__) {
    return globalThis.__TKA_CONTAINER_PROMISE__;
  }
  return null;
}

function setGlobalPromise(promise: Promise<InversifyContainer> | null): void {
  if (typeof globalThis !== "undefined") {
    globalThis.__TKA_CONTAINER_PROMISE__ = promise || undefined;
  }
}

// Use global state to persist across HMR
let _cachedContainer: InversifyContainer | null = getGlobalContainer();
let _containerPromise: Promise<InversifyContainer> | null = getGlobalPromise();

// HMR support - preserve container across reloads
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log("🔄 HMR: Preserving container state across reload");
    debugHMR("HMR accept triggered");

    // Restore from global state
    _cachedContainer = getGlobalContainer();
    _containerPromise = getGlobalPromise();

    if (_cachedContainer) {
      console.log("✅ HMR: Container restored from global state");
      debugHMR("Container successfully restored");
    } else {
      console.log("⚠️ HMR: No container found in global state");
      debugHMR("No container found in global state");
    }
  });

  import.meta.hot.dispose(() => {
    console.log("🔄 HMR: Saving container state to global");
    debugHMR("HMR dispose triggered");

    // Save to global state before disposal
    setGlobalContainer(_cachedContainer);
    setGlobalPromise(_containerPromise);

    if (_cachedContainer) {
      console.log("✅ HMR: Container saved to global state");
      debugHMR("Container successfully saved to global state");
    } else {
      debugHMR("No container to save during dispose");
    }
  });
}

// ============================================================================
// HMR-SAFE SERVICE RESOLUTION
// ============================================================================

export function resolve<T>(serviceIdentifier: symbol): T {
  // Try to get container from cache first
  if (!_cachedContainer) {
    _cachedContainer = getGlobalContainer();
  }

  if (!_cachedContainer) {
    throw new Error(
      `Container not initialized. Call ensureContainerInitialized() before resolving services. This usually means a component is trying to resolve services before the app is fully loaded.`
    );
  }

  try {
    return _cachedContainer.get<T>(serviceIdentifier);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("❌ Service resolution failed:", {
      symbol: serviceIdentifier,
      symbolString: serviceIdentifier.toString(),
      error: error,
    });

    // Check if this is a "no bindings found" error (missing module)
    if (errorMessage.includes("No bindings found")) {
      console.error(
        `\n💡 HINT: The service "${serviceIdentifier.toString()}" is not bound in the container.\n` +
          `This usually means:\n` +
          `  1. The feature module containing this service hasn't been loaded yet\n` +
          `  2. An HMR update cleared the container but didn't restore the module\n` +
          `  3. The service binding is missing from the module configuration\n`
      );
    }

    // HMR recovery: try to reinitialize container
    console.warn(
      "🔄 HMR: Service resolution failed, attempting container recovery"
    );
    debugHMRError(error as Error, "Service resolution failed");

    _cachedContainer = getGlobalContainer();

    if (_cachedContainer) {
      try {
        const result = _cachedContainer.get<T>(serviceIdentifier);
        debugHMR("Container recovery successful");
        return result;
      } catch (retryError) {
        console.error("❌ HMR: Container recovery failed", retryError);
        debugHMRError(retryError as Error, "Container recovery failed");
        throw retryError;
      }
    }

    debugHMRError(error as Error, "No container available for recovery");
    throw error;
  }
}

// HMR-safe resolve with fallback
export function resolveHMRSafe<T>(serviceIdentifier: symbol): T | null {
  try {
    return resolve<T>(serviceIdentifier);
  } catch (error) {
    console.warn("⚠️ HMR: Service resolution failed, returning null", error);
    return null;
  }
}

// Silent resolve - returns null if service not found, no error logging
// Useful for optional dependencies during HMR or when services may not be bound
export function tryResolve<T>(serviceIdentifier: symbol): T | null {
  if (!_cachedContainer) {
    _cachedContainer = getGlobalContainer();
  }

  if (!_cachedContainer) {
    // Silently return null - this is expected during HMR or early initialization
    return null;
  }

  try {
    return _cachedContainer.get<T>(serviceIdentifier);
  } catch {
    // Silently return null - the caller expects this for optional dependencies
    return null;
  }
}

// ============================================================================
// HMR-SAFE CONTAINER INITIALIZATION
// ============================================================================

export async function ensureContainerInitialized(): Promise<void> {
  // Check if we already have a container from global state
  if (!_cachedContainer) {
    _cachedContainer = getGlobalContainer();
  }

  if (!_cachedContainer) {
    if (!_containerPromise) {
      _containerPromise = getGlobalPromise();
    }

    if (!_containerPromise) {
      _containerPromise = import("./container").then(
        async ({ container, ensureContainerInitialized }) => {
          await ensureContainerInitialized();
          return container;
        }
      );
      // Save promise to global state
      setGlobalPromise(_containerPromise);
    }

    _cachedContainer = await _containerPromise;
    // Save container to global state
    setGlobalContainer(_cachedContainer);
  }
}

// Check if container is ready for synchronous access
export function isContainerReady(): boolean {
  return _cachedContainer !== null;
}

// HMR utility - reset container state
export function resetContainer(): void {
  _cachedContainer = null;
  _containerPromise = null;
  // Clear global state
  setGlobalContainer(null);
  setGlobalPromise(null);
}

// Legacy exports for backward compatibility
export const getContainer = async () => {
  // Use the HMR-safe initialization
  await ensureContainerInitialized();
  return _cachedContainer;
};

// Removed duplicate - using the one above

// DEPRECATED: Use resolve() instead - kept for backward compatibility
export const resolveSyncUnsafe = <T>(serviceIdentifier: symbol): T => {
  if (!_cachedContainer) {
    throw new Error("Container not initialized. Use async resolve() instead.");
  }
  return _cachedContainer.get<T>(serviceIdentifier);
};

// DEPRECATED: Use resolve() instead - kept for backward compatibility
export const resolveAsync = resolve;

// ============================================================================
// LAZY FEATURE MODULE LOADING (prevents static import of container.ts)
// ============================================================================

/**
 * Load a feature module on-demand. Dynamically imports container.ts to enable code-splitting.
 * @param feature - The feature module name to load
 */
export async function loadFeatureModule(feature: string): Promise<void> {
  const { loadFeatureModule: load } = await import("./container");
  return load(feature);
}

/**
 * Preload a feature module in the background (non-blocking).
 * @param feature - The feature module name to preload
 */
export function preloadFeatureModule(feature: string): void {
  import("./container")
    .then(({ preloadFeatureModule: preload }) => {
      preload(feature);
    })
    .catch((error) => {
      console.warn(`Failed to preload feature module '${feature}':`, error);
    });
}

/**
 * Load shared modules (Tier 2). Dynamically imports container.ts to enable code-splitting.
 */
export async function loadSharedModules(): Promise<void> {
  const { loadSharedModules: load } = await import("./container");
  return load();
}

// ============================================================================
// ON-DEMAND HEAVY LIBRARY MODULES
// These modules contain heavy dependencies and are loaded only when needed
// ============================================================================

/**
 * Load the Animation Renderer module on-demand.
 * Call this before using IAnimationRenderer.
 *
 * Uses container.isBound() as the source of truth to prevent duplicate bindings
 * (module-level flags get duplicated across production chunks)
 */
export async function loadAnimationModule(): Promise<void> {
  const container = await getContainerInstance();

  // Use container.isBound() as the source of truth (survives code-splitting)
  if (container.isBound(TYPES.IAnimationRenderer)) {
    return; // Already loaded
  }

  const { pixiModule } = await import(
    "../../features/compose/inversify/PixiModule"
  );
  await container.load(pixiModule);
}

/**
 * @deprecated Use loadAnimationModule() instead
 */
export const loadPixiModule = loadAnimationModule;

/**
 * Get the container instance. Use sparingly - prefer resolve() for service access.
 * This is provided for cases where direct container access is absolutely necessary.
 */
export async function getContainerInstance(): Promise<
  (typeof import("./container"))["container"]
> {
  const { container } = await import("./container");
  return container;
}

// DEPRECATED: Synchronous container access - only works if container is already loaded
// Use getContainerInstance() or resolve() instead
export const container = {
  get: <T>(serviceIdentifier: symbol): T => {
    return resolve<T>(serviceIdentifier);
  },
  // Proxy other methods through resolve for backward compatibility
  isBound: (_serviceIdentifier: symbol): boolean => {
    console.warn(
      "container.isBound() called on lazy proxy - use tryResolve() instead"
    );
    return _cachedContainer !== null;
  },
};

// Alias for convenience in components
export const di = container;
