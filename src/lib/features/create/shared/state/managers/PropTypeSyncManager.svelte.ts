/**
 * Prop Type Sync Manager
 *
 * Watches for prop type changes in settings and bulk updates all motions.
 */

import { getSettings } from "$lib/shared/application/state/app-state.svelte";
import type { IBeatOperationsService } from "../../services/contracts/IBeatOperationsService";
import type { CreateModuleState } from "../create-module-state.svelte";

export interface PropTypeSyncConfig {
  getBeatOperationsService: () => IBeatOperationsService | null;
  getCreateModuleState: () => CreateModuleState | null;
  isServicesInitialized: () => boolean;
}

export function createPropTypeSyncEffect(
  config: PropTypeSyncConfig
): () => void {
  const { getBeatOperationsService, getCreateModuleState, isServicesInitialized } =
    config;

  let previousBluePropType: string | undefined = undefined;
  let previousRedPropType: string | undefined = undefined;

  const cleanup = $effect.root(() => {
    $effect(() => {
      if (!isServicesInitialized()) return;

      const beatOperationsService = getBeatOperationsService();
      const createModuleState = getCreateModuleState();
      if (!beatOperationsService || !createModuleState) return;

      const settings = getSettings();
      const newBluePropType = settings.bluePropType;
      const newRedPropType = settings.redPropType;

      if (
        newBluePropType &&
        newBluePropType !== previousBluePropType &&
        previousBluePropType !== undefined
      ) {
        beatOperationsService.bulkUpdatePropType(
          "blue",
          newBluePropType,
          createModuleState
        );
      }
      previousBluePropType = newBluePropType;

      if (
        newRedPropType &&
        newRedPropType !== previousRedPropType &&
        previousRedPropType !== undefined
      ) {
        beatOperationsService.bulkUpdatePropType(
          "red",
          newRedPropType,
          createModuleState
        );
      }
      previousRedPropType = newRedPropType;
    });
  });

  return cleanup;
}
