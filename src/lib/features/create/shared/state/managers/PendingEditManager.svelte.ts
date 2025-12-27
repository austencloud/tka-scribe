/**
 * Pending Edit Manager
 *
 * Handles pending edits from Discover gallery.
 * When user clicks "Edit" on a sequence in Discover, it's stored
 * and processed when Create module mounts.
 */

import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
import type { IDeepLinkSequenceHandler } from "../../services/contracts/IDeepLinkSequenceHandler";
import type { ICreationMethodPersister } from "../../services/contracts/ICreationMethodPersister";
import type { CreateModuleState } from "../create-module-state.svelte";
import type { ConstructTabState } from "../construct-tab-state.svelte";

export interface PendingEditConfig {
  getDeepLinker: () => IDeepLinkSequenceHandler | null;
  getCreateModuleState: () => CreateModuleState | null;
  getConstructTabState: () => ConstructTabState | null;
  getCreationMethodPersistence: () => ICreationMethodPersister | null;
  isServicesInitialized: () => boolean;
  hasSelectedCreationMethod: () => boolean;
  setHasSelectedCreationMethod: (value: boolean) => void;
}

export function createPendingEditEffect(config: PendingEditConfig): () => void {
  const {
    getDeepLinker,
    getCreateModuleState,
    getConstructTabState,
    getCreationMethodPersistence,
    isServicesInitialized,
    hasSelectedCreationMethod,
    setHasSelectedCreationMethod,
  } = config;

  let pendingEditProcessed = false;

  const cleanup = $effect.root(() => {
    $effect(() => {
      const currentModule = navigationState.currentModule;
      if (currentModule !== "create") return;

      const deepLinkService = getDeepLinker();
      const createModuleState = getCreateModuleState();
      const constructTabState = getConstructTabState();
      const creationMethodPersistence = getCreationMethodPersistence();

      if (
        !deepLinkService ||
        !createModuleState ||
        !constructTabState ||
        !isServicesInitialized()
      ) {
        return;
      }

      if (pendingEditProcessed) return;

      const hasPending = deepLinkService.hasPendingEdit();
      if (!hasPending) return;

      pendingEditProcessed = true;

      deepLinkService.loadFromPendingEdit((sequence) => {
        const constructorSequenceState = constructTabState?.sequenceState;
        if (constructorSequenceState) {
          constructorSequenceState.setCurrentSequence(sequence);
          constructTabState?.syncPickerStateWithSequence();
        } else {
          createModuleState.sequenceState.setCurrentSequence(sequence);
        }

        if (!hasSelectedCreationMethod()) {
          setHasSelectedCreationMethod(true);
          creationMethodPersistence?.markMethodSelected();
        }
        navigationState.setCreationMethodSelectorVisible(false);

        if (constructTabState?.setShowStartPositionPicker) {
          constructTabState.setShowStartPositionPicker(false);
        }
      });
    });
  });

  return cleanup;
}
