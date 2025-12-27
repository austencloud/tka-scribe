/**
 * Prop Type Sync Manager
 *
 * Watches for prop type changes in settings and bulk updates all motions.
 */

import { getSettings } from "$lib/shared/application/state/app-state.svelte";
import type { IBeatOperator } from "../../services/contracts/IBeatOperator";
import type { CreateModuleState } from "../create-module-state.svelte";

export interface PropTypeSyncConfig {
  getBeatOperator: () => IBeatOperator | null;
  getCreateModuleState: () => CreateModuleState | null;
  isServicesInitialized: () => boolean;
}

export function createPropTypeSyncEffect(
  config: PropTypeSyncConfig
): () => void {
  const { getBeatOperator, getCreateModuleState, isServicesInitialized } =
    config;

  let previousBluePropType: string | undefined = undefined;
  let previousRedPropType: string | undefined = undefined;

  const cleanup = $effect.root(() => {
    $effect(() => {
      if (!isServicesInitialized()) return;

      const BeatOperator = getBeatOperator();
      const createModuleState = getCreateModuleState();
      if (!BeatOperator || !createModuleState) return;

      const settings = getSettings();
      const newBluePropType = settings.bluePropType;
      const newRedPropType = settings.redPropType;

      if (
        newBluePropType &&
        newBluePropType !== previousBluePropType &&
        previousBluePropType !== undefined
      ) {
        BeatOperator.bulkUpdatePropType(
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
        BeatOperator.bulkUpdatePropType(
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
