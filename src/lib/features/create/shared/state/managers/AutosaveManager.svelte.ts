/**
 * Autosave Manager
 *
 * Marks autosave as dirty when sequence changes.
 */

import type { AutosaveService } from "../../services/AutosaveService";
import type { CreateModuleState } from "../create-module-state.svelte";

export interface AutosaveConfig {
  getCreateModuleState: () => CreateModuleState | null;
  getAutosaveService: () => AutosaveService | null;
}

export function createAutosaveEffect(config: AutosaveConfig): () => void {
  const { getCreateModuleState, getAutosaveService } = config;

  const cleanup = $effect.root(() => {
    $effect(() => {
      const createModuleState = getCreateModuleState();
      const autosaveService = getAutosaveService();

      if (createModuleState?.sequenceState.currentSequence && autosaveService) {
        autosaveService.markDirty();
      }
    });
  });

  return cleanup;
}
