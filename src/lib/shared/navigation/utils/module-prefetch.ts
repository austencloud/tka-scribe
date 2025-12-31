/**
 * Module Prefetch Utility
 *
 * Intelligently prefetches likely next modules based on user navigation patterns.
 * Uses `<link rel="modulepreload">` for predictive loading.
 *
 * 🚀 PERFORMANCE: Reduces perceived load time by preloading modules
 * users are likely to navigate to next.
 */

/**
 * Navigation patterns: most likely next modules from each module
 * Based on user behavior analysis:
 * - Dashboard → Create (start building), Discover (browse)
 * - Discover → Create (fork/modify), Library (save)
 * - Create → Compose (animate), Library (save), Discover (share)
 * - Compose → Create (edit more), Library (save)
 * - Library → Create (edit), Compose (animate), Discover (share)
 * - Learn → Create (try it), Train (practice)
 * - Train → Create (compose), Learn (review)
 */
const NAVIGATION_PATTERNS: Record<string, string[]> = {
  dashboard: ["create", "discover", "library"],
  create: ["compose", "library", "discover"],
  discover: ["create", "library"],
  compose: ["create", "library"],
  library: ["create", "compose", "discover"],
  learn: ["create", "train"],
  train: ["create", "learn"],
  settings: [], // Settings is an endpoint, no prefetch needed
  feedback: ["dashboard"],
  admin: ["dashboard", "feedback"],
};

/**
 * Module chunk paths - maps module IDs to their chunk entry points
 * These are dynamically imported in ModuleRenderer.svelte
 */
const MODULE_PATHS: Record<string, string> = {
  dashboard: "/src/lib/features/dashboard/components/Dashboard.svelte",
  create: "/src/lib/features/create/shared/components/CreateModule.svelte",
  discover: "/src/lib/features/discover/shared/components/DiscoverModule.svelte",
  compose: "/src/lib/features/compose/ComposeModule.svelte",
  library: "/src/lib/features/library/LibraryModule.svelte",
  learn: "/src/lib/features/learn/LearnTab.svelte",
  train: "/src/lib/features/train/components/TrainModule.svelte",
  settings: "/src/lib/features/settings/SettingsModule.svelte",
  feedback: "/src/lib/features/feedback/FeedbackModule.svelte",
  admin: "/src/lib/features/admin/AdminModule.svelte",
};

// Track which modules have been prefetched to avoid duplicates
const prefetchedModules = new Set<string>();

/**
 * Prefetch a specific module by adding a modulepreload link
 */
function prefetchModule(moduleId: string): void {
  if (prefetchedModules.has(moduleId)) return;
  if (typeof document === "undefined") return;

  const modulePath = MODULE_PATHS[moduleId];
  if (!modulePath) return;

  // Create modulepreload link
  const link = document.createElement("link");
  link.rel = "modulepreload";
  link.href = modulePath;
  link.as = "script";

  // Mark as prefetched before adding to DOM
  prefetchedModules.add(moduleId);

  document.head.appendChild(link);

  console.log(`🔮 [Prefetch] Preloading module: ${moduleId}`);
}

/**
 * Prefetch likely next modules based on current module
 *
 * Call this when the user lands on a module to speculatively
 * load modules they're likely to navigate to next.
 *
 * Uses requestIdleCallback to avoid blocking main thread.
 *
 * @param currentModuleId - The module the user is currently on
 */
export function prefetchLikelyNextModules(currentModuleId: string): void {
  if (typeof window === "undefined") return;

  const likelyNextModules = NAVIGATION_PATTERNS[currentModuleId] ?? [];

  if (likelyNextModules.length === 0) return;

  // Use requestIdleCallback to prefetch during idle time
  const schedulePrefetch = window.requestIdleCallback ?? setTimeout;

  schedulePrefetch(
    () => {
      likelyNextModules.forEach((moduleId) => {
        prefetchModule(moduleId);
      });
    },
    { timeout: 2000 } // Fallback timeout if idle callback isn't called
  );
}

/**
 * Prefetch on hover/focus intent
 *
 * Call this when user hovers or focuses on a navigation link
 * to preload that specific module. This provides faster navigation
 * when the user has shown intent.
 *
 * @param targetModuleId - The module the user is hovering/focused on
 */
export function prefetchOnIntent(targetModuleId: string): void {
  prefetchModule(targetModuleId);
}

/**
 * Preload critical modules on app startup
 *
 * Prefetches the most commonly used modules after initial load.
 * Called once after the app has rendered.
 *
 * IMPORTANT: Only prefetch if user is on Dashboard. Prefetching on every
 * page (e.g., Settings) would defeat lazy loading - the Create module has
 * 150+ files that add 5+ seconds to load time.
 *
 * @param currentModuleId - Pass the current module to only prefetch from Dashboard
 */
export function preloadCriticalModules(currentModuleId?: string): void {
  if (typeof window === "undefined") return;

  // Only prefetch from Dashboard - other modules should only load what they need
  // This prevents loading 150+ Create module files when user goes to Settings
  if (currentModuleId && currentModuleId !== "dashboard") {
    console.log(
      `🔮 [Prefetch] Skipping critical prefetch on ${currentModuleId} (not dashboard)`
    );
    return;
  }

  // Wait for initial render to complete
  const schedulePrefetch = window.requestIdleCallback ?? setTimeout;

  schedulePrefetch(
    () => {
      // Most users start on Dashboard and go to Create or Discover
      prefetchModule("create");
      prefetchModule("discover");
    },
    { timeout: 3000 }
  );
}

/**
 * Check if a module has been prefetched
 */
export function isModulePrefetched(moduleId: string): boolean {
  return prefetchedModules.has(moduleId);
}

/**
 * Get statistics about prefetched modules
 */
export function getPrefetchStats(): { prefetched: string[]; count: number } {
  return {
    prefetched: Array.from(prefetchedModules),
    count: prefetchedModules.size,
  };
}
