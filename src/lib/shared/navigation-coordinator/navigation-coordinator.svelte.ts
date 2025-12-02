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

// Module change handler
// targetTab: Optional tab to navigate to (used when clicking a section in a different module)
export async function handleModuleChange(moduleId: ModuleId, targetTab?: string) {
  navigationState.setCurrentModule(moduleId, targetTab);
  // Switch module with proper persistence (saves to localStorage + Firestore)
  await switchModule(moduleId);
}

// Section change handler
export function handleSectionChange(sectionId: string) {
  const module = currentModule();

  // Validate section accessibility via feature flags
  if (!featureFlagService.canAccessTab(module, sectionId)) {
    console.warn(`⚠️ User does not have access to ${module}:${sectionId} tab`);
    // Redirect to a default accessible section
    if (module === "create") {
      navigationState.setActiveTab("constructor");
    }
    return;
  }

  if (module === "learn") {
    navigationState.setLearnMode(sectionId);
  } else {
    // All other modules use the new navigation system
    navigationState.setActiveTab(sectionId);
  }
}

// Export as a getter function that reads feature flags reactively
// This ensures the module list updates when user role or feature flags change
export function getModuleDefinitions() {
  // Read auth state directly in the getter so it's reactive
  const isAuthInitialized = authStore.isInitialized;
  const isFeatureFlagsInitialized = featureFlagService.isInitialized;

  return MODULE_DEFINITIONS.filter((module) => {
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
