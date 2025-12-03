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
import { authStore } from "../auth/stores/authStore.svelte";
import { featureFlagService } from "../auth/services/FeatureFlagService.svelte";

// Reactive state object using Svelte 5 $state rune
export const navigationCoordinator = $state({
  // Note: Edit and Export are slide-out panels, not navigation sections
  canAccessEditAndExportPanels: false,
});

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

  return baseSections;
}

// Module order for determining slide direction
// Settings is included for transition support but accessed via footer gear icon
const MODULE_ORDER = ['dashboard', 'create', 'discover', 'learn', 'compose', 'train', 'feedback', 'admin', 'settings'];

// Module change handler with View Transitions
// targetTab: Optional tab to navigate to (used when clicking a section in a different module)
export async function handleModuleChange(moduleId: ModuleId, targetTab?: string) {
  const currentMod = currentModule();

  // Skip transition logic if same module
  if (moduleId === currentMod) {
    navigationState.setCurrentModule(moduleId, targetTab);
    return;
  }

  // Determine direction based on module order
  const currentIndex = MODULE_ORDER.indexOf(currentMod);
  const newIndex = MODULE_ORDER.indexOf(moduleId);
  const goingRight = newIndex > currentIndex;

  const doc = document as any;

  // Coming FROM dashboard - skip (Dashboard.svelte handles dive-in animation)
  const isLeavingDashboard = currentMod === 'dashboard';

  // Going TO dashboard - use pull-out animation
  const isGoingToDashboard = moduleId === 'dashboard';

  if (typeof doc.startViewTransition === 'function' && !isLeavingDashboard) {
    if (isGoingToDashboard) {
      // Pull-out effect when going back to dashboard
      document.documentElement.classList.add('back-transition');

      const transition = doc.startViewTransition(async () => {
        navigationState.setCurrentModule(moduleId, targetTab);
        await switchModule(moduleId);
      });

      transition.finished.finally(() => {
        document.documentElement.classList.remove('back-transition');
      });
    } else {
      // Module-to-module: horizontal slide
      document.documentElement.classList.remove('module-slide-left', 'module-slide-right');
      document.documentElement.classList.add(goingRight ? 'module-slide-left' : 'module-slide-right');

      const transition = doc.startViewTransition(async () => {
        navigationState.setCurrentModule(moduleId, targetTab);
        await switchModule(moduleId);
      });

      transition.finished.finally(() => {
        document.documentElement.classList.remove('module-slide-left', 'module-slide-right');
      });
    }
  } else {
    // Fallback or leaving dashboard (Dashboard handles its own animation)
    navigationState.setCurrentModule(moduleId, targetTab);
    await switchModule(moduleId);
  }
}

// Tab order for determining slide direction (per module)
// Note: Compose module playback is an overlay, not a tab
const TAB_ORDERS: Record<string, string[]> = {
  create: ['assembler', 'constructor', 'generator', 'editor', 'export'],
  discover: ['sequences', 'collections', 'creators', 'library'],
  learn: ['concepts', 'play', 'codex'],
  compose: ['arrange', 'browse'],
  train: ['drills', 'challenges', 'progress'],
  collect: ['achievements', 'badges', 'stats'],
  feedback: ['submit', 'manage'],
};

// Section change handler with View Transitions
// Now that Svelte transitions are removed from #key blocks, View Transitions work smoothly
export function handleSectionChange(sectionId: string) {
  const module = currentModule();
  const currentSectionId = currentSection();

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
  if (typeof doc.startViewTransition === 'function') {
    // Add direction class for CSS to target
    document.documentElement.classList.remove('tab-slide-left', 'tab-slide-right');
    document.documentElement.classList.add(goingRight ? 'tab-slide-left' : 'tab-slide-right');

    const transition = doc.startViewTransition(() => {
      updateState();
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('tab-slide-left', 'tab-slide-right');
    });
  } else {
    // Fallback: instant switch for browsers without View Transitions
    updateState();
  }
}

// Export as a getter function that reads feature flags reactively
// This ensures the module list updates when user role or feature flags change
export function getModuleDefinitions() {
  // Read auth state directly in the getter so it's reactive
  const isAuthInitialized = authStore.isInitialized;
  const isFeatureFlagsInitialized = featureFlagService.isInitialized;

  return MODULE_DEFINITIONS.filter((module) => {
    // Settings module is accessed via sidebar footer gear icon, not main module list
    if (module.id === "settings") {
      return false;
    }
    // Admin module only visible to admin users (hide until we know they're admin)
    if (module.id === "admin") {
      return featureFlagService.isAdmin;
    }
    // Feedback module only visible to testers and admins
    if (module.id === "feedback") {
      return featureFlagService.isTester;
    }
    return true;
  }).map((module) => {
    // Optimistic rendering: show modules as enabled until auth/feature flags confirm access
    // This prevents the flash of disabled modules while loading
    // - If not initialized yet: show enabled (optimistic)
    // - If initialized: check feature flag access
    if (isAuthInitialized && isFeatureFlagsInitialized) {
      const hasAccess = featureFlagService.canAccessModule(module.id);
      if (!hasAccess) {
        return {
          ...module,
          disabled: true,
          disabledMessage: "Coming Soon",
        };
      }
    }
    return module;
  });
}
