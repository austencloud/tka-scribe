/**
 * URL Sync Manager
 *
 * Manages synchronization of the current sequence to the browser URL.
 * Uses history.replaceState for seamless sharing without creating history entries.
 *
 * Domain: Create module - URL State Management
 */

import type { createCreateModuleState as CreateModuleStateType } from "../create-module-state.svelte";
import type { navigationState as NavigationStateType } from "$lib/shared/index";
import type { IURLSyncService } from "$lib/shared/navigation/services/contracts";

type CreateModuleState = ReturnType<typeof CreateModuleStateType>;
type NavigationState = typeof NavigationStateType;

/** Tab name to module shorthand mapping for URL encoding */
const TAB_TO_MODULE: Record<string, string> = {
  constructor: "construct",
  assembler: "assemble",
  generator: "generate",
};

export interface URLSyncManagerConfig {
  CreateModuleState: CreateModuleState;
  navigationState: NavigationState;
  urlSyncService: IURLSyncService;
  /** Getter for deepLinkProcessed flag - URL clearing is blocked until this returns true */
  isDeepLinkProcessed: () => boolean;
}

/**
 * Creates URL sync effect that keeps browser URL in sync with current sequence.
 * @returns Cleanup function
 */
export function createURLSyncEffect(config: URLSyncManagerConfig): () => void {
  const { CreateModuleState, navigationState, urlSyncService, isDeepLinkProcessed } = config;

  const cleanup = $effect.root(() => {
    $effect(() => {
      // Only sync when persistence is initialized (services are ready)
      if (!CreateModuleState.isPersistenceInitialized) return;

      // Only sync URL when in create module
      const currentModule = navigationState.currentModule;
      if (currentModule !== "create") return;

      const currentSequence = CreateModuleState.sequenceState.currentSequence;
      const activeTab = navigationState.activeTab;

      // Map active tab to module shorthand for URL
      const moduleShorthand = TAB_TO_MODULE[activeTab] || "construct";

      // Sync URL with current sequence (debounced)
      // Don't allow clearing URL until deep link has been processed
      urlSyncService.syncURLWithSequence(currentSequence, moduleShorthand, {
        debounce: 500,
        allowClear: isDeepLinkProcessed(),
      });
    });
  });

  return cleanup;
}
