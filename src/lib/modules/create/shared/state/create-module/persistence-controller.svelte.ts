/**
 * Persistence Controller
 *
 * Centralizes initialization and cross-tab workspace persistence logic for the
 * create module. The navigation controller delegates to this module whenever a
 * mode transition requires saving or loading workspace data.
 */

import type { BuildModeId } from "$shared";
import type { SequenceState } from "../SequenceStateOrchestrator.svelte";
import type { ISequencePersistenceService } from "../../services/contracts";
import type { IUndoService } from "../../services/contracts/IUndoService";
import type { OptionHistoryManager } from "./option-history-manager.svelte";

type ConstructTabState =
  | {
      setShowStartPositionPicker: (show: boolean) => void;
      setSelectedStartPosition: (value: unknown) => void;
    }
  | null
  | undefined;

type PersistenceControllerDeps = {
  sequenceState: SequenceState;
  sequencePersistenceService?: ISequencePersistenceService;
  handPathCoordinator: { initializeServices: () => void };
  optionHistoryManager: OptionHistoryManager;
  undoService: IUndoService;
};

export function createCreateModulePersistenceController({
  sequenceState,
  sequencePersistenceService,
  handPathCoordinator,
  optionHistoryManager,
  undoService,
}: PersistenceControllerDeps) {
  let isPersistenceInitialized = $state(false);

  async function initialize(): Promise<BuildModeId> {
    handPathCoordinator.initializeServices();
    let modeToLoad: BuildModeId = "constructor";

    try {
      if (sequencePersistenceService) {
        const lastActiveState =
          await sequencePersistenceService.loadCurrentState();
        if (lastActiveState?.activeBuildSection) {
          modeToLoad = lastActiveState.activeBuildSection;
        }
      }

      await sequenceState.initializeWithPersistence();

      if (sequencePersistenceService) {
        await restoreWorkspaceForMode(modeToLoad, null, {
          bypassInitializationGuard: true,
        });
      }

      optionHistoryManager.rebuildFromSequence();
      await undoService.loadHistory();
    } catch (error) {
      console.error(
        "? CreateModuleState: Failed to initialize persistence:",
        error
      );
    } finally {
      isPersistenceInitialized = true;
    }

    return modeToLoad;
  }

  async function saveCurrentState(activeSection: BuildModeId): Promise<void> {
    if (!isPersistenceInitialized) {
      return;
    }

    try {
      await sequenceState.saveCurrentState(activeSection);
    } catch (error) {
      console.error(
        "? CreateModuleState: Failed to save current state:",
        error
      );
    }
  }

  async function restoreWorkspaceForMode(
    panel: BuildModeId,
    constructTabState: ConstructTabState,
    options?: { bypassInitializationGuard?: boolean }
  ): Promise<void> {
    if (!sequencePersistenceService) {
      return;
    }

    if (!isPersistenceInitialized && !options?.bypassInitializationGuard) {
      return;
    }

    sequenceState.updateCachedActiveTab(panel);

    // Check if there's a pending deep link - if so, skip restoring saved state
    // This prevents overwriting deep link sequences with empty/old persisted state
    const { deepLinkStore } = await import(
      "$shared/navigation/utils/deep-link-store.svelte"
    );
    const hasDeepLink = deepLinkStore.has("create");

    if (hasDeepLink) {
      console.log(
        `🚫 Skipping workspace restoration for ${panel} - deep link present`
      );
      return;
    }

    try {
      const savedState =
        await sequencePersistenceService.loadCurrentState(panel);

      if (savedState) {
        // Load saved state for this tab (overwrites any existing sequence from previous tab)
        sequenceState.setCurrentSequence(savedState.currentSequence);
        sequenceState.setSelectedStartPosition(
          savedState.selectedStartPosition ?? null
        );

        syncConstructTabState(
          constructTabState,
          savedState.hasStartPosition,
          savedState.selectedStartPosition
        );
      } else {
        // No saved state for this tab - clear the workspace
        sequenceState.setCurrentSequence(null);
        sequenceState.setSelectedStartPosition(null);
        syncConstructTabState(constructTabState, false, null);
      }
    } catch (error) {
      console.error(`? Failed to load ${panel} state:`, error);
    }
  }

  function syncConstructTabState(
    constructTabState: ConstructTabState,
    hasStartPosition: boolean,
    selectedStartPosition: unknown
  ) {
    if (!constructTabState) {
      return;
    }

    if (hasStartPosition && selectedStartPosition) {
      constructTabState.setShowStartPositionPicker(false);
      constructTabState.setSelectedStartPosition(selectedStartPosition);
    } else {
      constructTabState.setShowStartPositionPicker(true);
      constructTabState.setSelectedStartPosition(null);
    }
  }

  return {
    get isInitialized() {
      return isPersistenceInitialized;
    },
    initialize,
    saveCurrentState,
    restoreWorkspaceForMode,
  };
}

export type CreateModulePersistenceController = ReturnType<
  typeof createCreateModulePersistenceController
>;
