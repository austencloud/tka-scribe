/**
 * Navigation Sync Manager
 *
 * Consolidates navigation synchronization effects into a single manager.
 * Handles bidirectional sync between navigation state and Create Module State.
 *
 * Domain: Create module - Navigation State Management
 */

import type {
  CreateModuleStateForSync,
  INavigationSyncer,
} from "../../services/contracts/INavigationSyncer";
import type { createCreateModuleState as CreateModuleStateType } from "../create-module-state.svelte";
import type { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";

type CreateModuleState = ReturnType<typeof CreateModuleStateType>;
type NavigationState = typeof navigationState;

export interface NavigationSyncManagerConfig {
  CreateModuleState: CreateModuleState;
  navigationState: NavigationState;
  NavigationSyncer: INavigationSyncer;
}

/**
 * Creates navigation sync effects
 * @returns Cleanup function
 */
export function createNavigationSyncEffects(
  config: NavigationSyncManagerConfig
): () => void {
  const { CreateModuleState, navigationState, NavigationSyncer } = config;
  const createStateForSync =
    CreateModuleState as unknown as CreateModuleStateForSync;

  // Effect: Sync navigation state TO Create Module State
  const cleanup1 = $effect.root(() => {
    $effect(() => {
      NavigationSyncer.syncNavigationToCreateModule(
        createStateForSync,
        navigationState
      );
    });
  });

  // Effect: Sync Create Module State BACK to navigation state
  const cleanup2 = $effect.root(() => {
    $effect(() => {
      if (CreateModuleState.isUpdatingFromToggle) return;

      NavigationSyncer.syncCreateModuleToNavigation(
        createStateForSync,
        navigationState
      );
    });
  });

  return () => {
    cleanup1();
    cleanup2();
  };
}
