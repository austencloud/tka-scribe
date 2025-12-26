/**
 * Creation Flow Manager
 *
 * Manages the creation method onboarding flow.
 * Handles: selector visibility, tab accessibility notifications.
 */

import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
import type { CreateModuleState } from "../create-module-state.svelte";

export interface CreationFlowConfig {
  getCreateModuleState: () => CreateModuleState | null;
  hasSelectedCreationMethod: () => boolean;
  onTabAccessibilityChange?: (canAccess: boolean) => void;
}

export function createCreationFlowEffects(
  config: CreationFlowConfig
): () => void {
  const {
    getCreateModuleState,
    hasSelectedCreationMethod,
    onTabAccessibilityChange,
  } = config;

  const cleanup = $effect.root(() => {
    // Sync creation method selector visibility
    $effect(() => {
      const state = getCreateModuleState();
      if (!state?.isPersistenceInitialized) return;

      const shouldShow = !hasSelectedCreationMethod();
      navigationState.setCreationMethodSelectorVisible(shouldShow);
    });

    // Notify parent of tab accessibility changes
    $effect(() => {
      const state = getCreateModuleState();
      if (!state || !onTabAccessibilityChange) return;

      onTabAccessibilityChange(state.canAccessEditTab);
    });
  });

  return cleanup;
}
