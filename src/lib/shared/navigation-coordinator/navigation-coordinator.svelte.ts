/**
 * NavigationCoordinator
 * Domain: Navigation State Coordination
 *
 * Responsibilities:
 * - Coordinate between legacy system and new module/section system
 * - Manage module definitions and current module state
 * - Calculate available module sections based on context
 * - Synchronize navigation state changes
 */
import type { ModuleId } from "../navigation/domain/types";
import {
  MODULE_DEFINITIONS,
  navigationState,
} from "../navigation/state/navigation-state.svelte";
import { switchModule } from "../application/state/ui/module-state";
import { authState } from "../auth/state/authState.svelte";
import { featureFlagService } from "../auth/services/FeatureFlagService.svelte";

// Session storage key for persisting navigation history across HMR
const PREVIOUS_MODULE_KEY = "tka-previous-module-before-settings";

// Load persisted previous module from sessionStorage (survives HMR)
function loadPreviousModule(): ModuleId | null {
  if (typeof sessionStorage === "undefined") return null;
  const saved = sessionStorage.getItem(PREVIOUS_MODULE_KEY);
  if (saved && MODULE_DEFINITIONS.some((m) => m.id === saved)) {
    return saved as ModuleId;
  }
  return null;
}

// Persist previous module to sessionStorage
function savePreviousModule(moduleId: ModuleId | null) {
  if (typeof sessionStorage === "undefined") return;
  if (moduleId) {
    sessionStorage.setItem(PREVIOUS_MODULE_KEY, moduleId);
  } else {
    sessionStorage.removeItem(PREVIOUS_MODULE_KEY);
  }
}

// Reactive state object using Svelte 5 $state rune
export const navigationCoordinator = $state({
  // Note: Edit and Export are slide-out panels, not navigation sections
  canAccessEditAndExportPanels: false,
  // Track the module we came from when entering Settings (for return animation)
  // Initialized from sessionStorage to survive HMR
  previousModuleBeforeSettings: loadPreviousModule(),
  // Store the entry point for consistent exit animation
  settingsEntryOrigin: { x: 90, y: 95 } as { x: number; y: number },
});

// Set the portal origin position for Settings transition
// Called when settings button is clicked, before navigation
export function setSettingsPortalOrigin(x: number, y: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Convert to percentage for responsive positioning
  const xPercent = (x / vw) * 100;
  const yPercent = (y / vh) * 100;
  // Store for reuse on exit
  navigationCoordinator.settingsEntryOrigin = { x: xPercent, y: yPercent };
  document.documentElement.style.setProperty(
    "--portal-origin-x",
    `${xPercent}%`
  );
  document.documentElement.style.setProperty(
    "--portal-origin-y",
    `${yPercent}%`
  );
}

// Restore the original entry origin for exit animation
// Creates consistent "dive in / pull out from same spot" experience
export function restoreSettingsPortalOrigin() {
  const { x, y } = navigationCoordinator.settingsEntryOrigin;
  document.documentElement.style.setProperty("--portal-origin-x", `${x}%`);
  document.documentElement.style.setProperty("--portal-origin-y", `${y}%`);
}

// Derived state as functions (Svelte 5 doesn't allow exporting $derived directly)
export function currentModule() {
  return navigationState.currentModule;
}

export function currentSection() {
  return navigationState.currentSection;
}

export function currentModuleDefinition() {
  return navigationState.getModuleDefinition(currentModule());
}

export function currentModuleName() {
  return currentModuleDefinition()?.label || "Unknown";
}

// Get sections for current module
// Create module: Construct and Generate sections are shown when no sequence exists.
// When a sequence exists (canAccessEditAndExportPanels = true), all sections are shown.
// When creation method selector is visible, hide all tabs (user must pick via selector).
// Settings module: AI tab is admin-only.
export function moduleSections() {
  const baseSections = currentModuleDefinition()?.sections || [];
  const module = currentModule();

  // Create module section filtering
  if (module === "create") {
    // Hide all tabs when creation method selector is visible
    if (navigationState.isCreationMethodSelectorVisible) {
      return [];
    }

    // Filter sections based on user's feature access (role-based)
    const availableSections = baseSections.filter((section: { id: string }) => {
      return featureFlagService.canAccessTab("create", section.id);
    });

    if (!navigationCoordinator.canAccessEditAndExportPanels) {
      return availableSections.filter((section: { id: string }) => {
        // Show assembler, constructor, and generator sections when no sequence exists
        return (
          section.id === "assembler" ||
          section.id === "constructor" ||
          section.id === "generator"
        );
      });
    }

    // When sequence exists (edit/export panels accessible), show all sections
    return availableSections;
  }

  // Settings module: Filter AI tab for non-admin users
  if (module === "settings") {
    return baseSections.filter((section: { id: string }) => {
      // AI tab is admin-only
      if (section.id === "ai") {
        return featureFlagService.isAdmin;
      }
      return true;
    });
  }

  // Feedback module: Filter manage tab for non-admin users
  if (module === "feedback") {
    return baseSections.filter((section: { id: string }) => {
      return featureFlagService.canAccessTab("feedback", section.id);
    });
  }

  return baseSections;
}

// Module order for determining slide direction
// Settings is included for transition support but accessed via footer gear icon
const MODULE_ORDER = [
  "dashboard",
  "create",
  "discover",
  "learn",
  "compose",
  "train",
  "feedback",
  "admin",
  "settings",
];

// Module change handler with View Transitions
// targetTab: Optional tab to navigate to (used when clicking a section in a different module)
export async function handleModuleChange(
  moduleId: ModuleId,
  targetTab?: string,
  options?: { skipHistory?: boolean; initiatedByHistory?: boolean }
) {
  const currentMod = currentModule();
  const shouldSkipHistory = options?.skipHistory === true;

  // Skip transition logic if same module
  if (moduleId === currentMod) {
    navigationState.setCurrentModule(moduleId, targetTab);
    if (!shouldSkipHistory) {
      pushHistoryState(moduleId, targetTab ?? navigationState.activeTab);
    }
    return;
  }

  // Determine direction based on module order
  const currentIndex = MODULE_ORDER.indexOf(currentMod);
  const newIndex = MODULE_ORDER.indexOf(moduleId);
  const goingRight = newIndex > currentIndex;

  const doc = document as any;

  // Coming FROM dashboard - skip (Dashboard.svelte handles dive-in animation)
  // Exception: settings portal has its own animation that should always play
  const isLeavingDashboard = currentMod === "dashboard";

  // Going TO dashboard - use pull-out animation
  const isGoingToDashboard = moduleId === "dashboard";

  // Settings portal transitions - special "dimension" feel
  const isEnteringSettings = moduleId === "settings";
  const isExitingSettings = currentMod === "settings";

  // Allow view transitions when:
  // 1. Not leaving dashboard (normal case)
  // 2. OR entering/exiting settings (settings portal always animates)
  const shouldUseViewTransition =
    !isLeavingDashboard || isEnteringSettings || isExitingSettings;

  if (
    typeof doc.startViewTransition === "function" &&
    shouldUseViewTransition
  ) {
    if (isEnteringSettings) {
      // ENTERING SETTINGS - Portal expand animation
      // Store where we came from for the return journey (persist to survive HMR)
      navigationCoordinator.previousModuleBeforeSettings = currentMod;
      savePreviousModule(currentMod);

      document.documentElement.classList.add("settings-portal-enter");

      const transition = doc.startViewTransition(async () => {
        navigationState.setCurrentModule(moduleId, targetTab);
        await switchModule(moduleId);
      });

      transition.finished.finally(() => {
        document.documentElement.classList.remove("settings-portal-enter");
        if (!shouldSkipHistory) {
          pushHistoryState(moduleId, targetTab ?? navigationState.activeTab);
        }
      });
    } else if (isExitingSettings) {
      // EXITING SETTINGS - Portal collapse animation
      // Restore original entry point for consistent "pull out" to same spot
      restoreSettingsPortalOrigin();
      document.documentElement.classList.add("settings-portal-exit");

      const transition = doc.startViewTransition(async () => {
        navigationState.setCurrentModule(moduleId, targetTab);
        await switchModule(moduleId);
      });

      transition.finished.finally(() => {
        document.documentElement.classList.remove("settings-portal-exit");
        navigationCoordinator.previousModuleBeforeSettings = null;
        savePreviousModule(null);
        if (!shouldSkipHistory) {
          pushHistoryState(moduleId, targetTab ?? navigationState.activeTab);
        }
      });
    } else if (isGoingToDashboard) {
      // Pull-out effect when going back to dashboard
      document.documentElement.classList.add("back-transition");

      const transition = doc.startViewTransition(async () => {
        navigationState.setCurrentModule(moduleId, targetTab);
        await switchModule(moduleId);
      });

      transition.finished.finally(() => {
        document.documentElement.classList.remove("back-transition");
        if (!shouldSkipHistory) {
          pushHistoryState(moduleId, targetTab ?? navigationState.activeTab);
        }
      });
    } else {
      // Module-to-module: horizontal slide
      document.documentElement.classList.remove(
        "module-slide-left",
        "module-slide-right"
      );
      document.documentElement.classList.add(
        goingRight ? "module-slide-left" : "module-slide-right"
      );

      const transition = doc.startViewTransition(async () => {
        navigationState.setCurrentModule(moduleId, targetTab);
        await switchModule(moduleId);
      });

      transition.finished.finally(() => {
        document.documentElement.classList.remove(
          "module-slide-left",
          "module-slide-right"
        );
        if (!shouldSkipHistory) {
          pushHistoryState(moduleId, targetTab ?? navigationState.activeTab);
        }
      });
    }
  } else {
    // Fallback or leaving dashboard (Dashboard handles its own animation)
    navigationState.setCurrentModule(moduleId, targetTab);
    await switchModule(moduleId);
    if (!shouldSkipHistory) {
      pushHistoryState(moduleId, targetTab ?? navigationState.activeTab);
    }
  }
}

// Tab order for determining slide direction (per module)
// Note: Compose module playback is an overlay, not a tab
const TAB_ORDERS: Record<string, string[]> = {
  create: ["assembler", "constructor", "generator", "editor", "export"],
  discover: ["sequences", "collections", "creators", "library"],
  learn: ["concepts", "play", "codex"],
  compose: ["arrange", "browse"],
  train: ["drills", "challenges", "progress"],
  collect: ["achievements", "badges", "stats"],
  feedback: ["submit", "manage"],
};

// Section change handler with View Transitions
// Now that Svelte transitions are removed from #key blocks, View Transitions work smoothly
export function handleSectionChange(
  sectionId: string,
  options?: { skipHistory?: boolean; initiatedByHistory?: boolean }
) {
  const module = currentModule();
  const currentSectionId = currentSection();
  const shouldSkipHistory = options?.skipHistory === true;

  // Validate section accessibility via feature flags
  if (!featureFlagService.canAccessTab(module, sectionId)) {
    console.warn(`⚠️ User does not have access to ${module}:${sectionId} tab`);
    // Redirect to a default accessible section
    if (module === "create") {
      navigationState.setActiveTab("constructor");
    }
    return;
  }

  // Don't switch if same section
  if (sectionId === currentSectionId) return;

  const doc = document as any;
  const tabOrder = TAB_ORDERS[module] || [];
  const currentIndex = tabOrder.indexOf(currentSectionId);
  const newIndex = tabOrder.indexOf(sectionId);
  const goingRight = newIndex > currentIndex;

  // Helper to update the navigation state
  const updateState = () => {
    if (module === "learn") {
      navigationState.setLearnMode(sectionId);
    } else {
      navigationState.setActiveTab(sectionId);
    }
  };

  // Use View Transitions if available
  if (typeof doc.startViewTransition === "function") {
    // Add direction class for CSS to target
    document.documentElement.classList.remove(
      "tab-slide-left",
      "tab-slide-right"
    );
    document.documentElement.classList.add(
      goingRight ? "tab-slide-left" : "tab-slide-right"
    );

    const transition = doc.startViewTransition(() => {
      updateState();
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove(
        "tab-slide-left",
        "tab-slide-right"
      );
      if (!shouldSkipHistory) {
        pushHistoryState(module as ModuleId, sectionId);
      }
    });
  } else {
    // Fallback: instant switch for browsers without View Transitions
    updateState();
    if (!shouldSkipHistory) {
      pushHistoryState(module as ModuleId, sectionId);
    }
  }
}

// Export as a getter function that reads feature flags reactively
// This ensures the module list updates when user role or feature flags change
export function getModuleDefinitions() {
  // Read auth state directly in the getter so it's reactive
  const isAuthInitialized = authState.isInitialized;
  const isFeatureFlagsInitialized = featureFlagService.isInitialized;

  // Read role-based flags BEFORE the filter to establish Svelte reactivity
  // This ensures $derived recalculates when these values change
  const _isAdmin = featureFlagService.isAdmin;
  const _isTester = featureFlagService.isTester;
  const _isPremium = featureFlagService.isPremium;
  const _effectiveRole = featureFlagService.effectiveRole;

  return MODULE_DEFINITIONS.filter((module) => {
    // Settings module is accessed via sidebar footer gear icon, not main module list
    if (module.id === "settings") {
      return false;
    }

    // Premium module is admin-only (features not ready for public release)
    if (module.id === "premium") {
      // Hide if auth not initialized (prevents flash of premium module)
      if (!isAuthInitialized || !isFeatureFlagsInitialized) {
        return false;
      }
      // Admin-only access for testing/preview until premium features are built
      return _isAdmin;
    }

    // If auth/feature flags not initialized, show core modules optimistically
    // This prevents layout shifts while waiting for auth
    if (!isAuthInitialized || !isFeatureFlagsInitialized) {
      // Only show these core modules before auth is ready
      return ["dashboard", "create", "discover"].includes(module.id);
    }

    // Once initialized, use feature flags to determine visibility
    // Modules the user can't access are hidden entirely (not shown with "Coming Soon")
    // This provides an accurate preview when impersonating users
    return featureFlagService.canAccessModule(module.id);
  });
}

// ---------------------------------------------------------------------------
// History integration (native back/forward without route-per-tab)
// ---------------------------------------------------------------------------

type HistoryState = { moduleId: ModuleId; sectionId?: string };

function buildHash(moduleId: ModuleId, sectionId?: string) {
  return sectionId ? `${moduleId}/${sectionId}` : moduleId;
}

function replaceHistoryState(moduleId: ModuleId, sectionId?: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.hash = buildHash(moduleId, sectionId);
  window.history.replaceState({ moduleId, sectionId }, "", url);
}

function pushHistoryState(moduleId: ModuleId, sectionId?: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.hash = buildHash(moduleId, sectionId);
  window.history.pushState({ moduleId, sectionId }, "", url);
}

let historyInitialized = false;

/**
 * Parse the URL hash and extract module/section IDs
 * Expected format: #moduleId or #moduleId/sectionId
 */
function parseHashNavigation(): {
  moduleId: ModuleId;
  sectionId?: string;
} | null {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash;
  if (!hash || hash === "#") return null;

  // Remove leading # and split by /
  const parts = hash.substring(1).split("/");
  const moduleId = parts[0] as ModuleId;
  const sectionId = parts[1];

  // Validate module exists
  const moduleDefinition = MODULE_DEFINITIONS.find((m) => m.id === moduleId);
  if (!moduleDefinition) return null;

  // If section is provided, validate it exists for this module
  if (sectionId) {
    const validSection = moduleDefinition.sections.some(
      (s) => s.id === sectionId
    );
    if (!validSection) {
      // Module is valid but section isn't - return module only
      return { moduleId };
    }
    return { moduleId, sectionId };
  }

  return { moduleId };
}

export function initializeNavigationHistory() {
  if (historyInitialized || typeof window === "undefined") return;
  historyInitialized = true;

  // First, parse the URL hash to see if user navigated directly to a specific module/tab
  const hashNav = parseHashNavigation();
  if (hashNav) {
    // URL has a valid module/section - navigate to it (overrides localStorage)
    if (hashNav.moduleId !== navigationState.currentModule) {
      navigationState.setCurrentModule(hashNav.moduleId, hashNav.sectionId);
    } else if (
      hashNav.sectionId &&
      hashNav.sectionId !== navigationState.activeTab
    ) {
      navigationState.setActiveTab(hashNav.sectionId);
    }
  }

  // Seed initial state so back/forward has a valid entry
  replaceHistoryState(navigationState.currentModule, navigationState.activeTab);

  window.addEventListener("popstate", async (event: PopStateEvent) => {
    const state = event.state as HistoryState | null;
    if (!state?.moduleId) return;

    const targetModule = state.moduleId;
    const targetSection = state.sectionId;

    if (targetModule !== navigationState.currentModule) {
      await handleModuleChange(targetModule, targetSection, {
        skipHistory: true,
        initiatedByHistory: true,
      });
    } else if (targetSection && targetSection !== navigationState.activeTab) {
      handleSectionChange(targetSection, {
        skipHistory: true,
        initiatedByHistory: true,
      });
    } else if (!targetSection && navigationState.activeTab) {
      // Module with no stored tab; clear any lingering tab state
      navigationState.setActiveTab("");
    }
  });
}
