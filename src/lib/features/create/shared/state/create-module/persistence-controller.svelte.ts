/**
 * Persistence Controller
 *
 * Centralizes initialization and cross-tab workspace persistence logic for the
 * create module. The navigation controller delegates to this module whenever a
 * mode transition requires saving or loading workspace data.
 *
 * IMPORTANT: Uses getSequenceStateForTab to get tab-specific sequence states.
 * Each tab (constructor, generator, assembler) has its own independent sequence state.
 */

import type { BuildModeId } from "$lib/shared/foundation/ui/UITypes";
import type { SequenceState } from "../SequenceStateOrchestrator.svelte";
import type { ISequencePersistenceService } from "../../services/contracts/ISequencePersistenceService";
import type { IUndoService } from "../../services/contracts/IUndoService";
import type { IDeepLinkService } from "$lib/shared/navigation/services/contracts/IDeepLinkService";
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
  /** Function to get the sequence state for a specific tab (or fallback to shared) */
  getSequenceStateForTab?: (tab: BuildModeId) => SequenceState;
};

export function createCreateModulePersistenceController({
  sequenceState,
  sequencePersistenceService,
  handPathCoordinator,
  optionHistoryManager,
  getSequenceStateForTab,
}: PersistenceControllerDeps) {
  let isPersistenceInitialized = $state(false);

  /**
   * Get the sequence state for a specific tab.
   * Uses getSequenceStateForTab if provided, otherwise falls back to shared state.
   */
  function getSequenceStateFor(tab: BuildModeId): SequenceState {
    if (getSequenceStateForTab) {
      return getSequenceStateForTab(tab);
    }
    return sequenceState;
  }

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
      // Note: Undo history loading is now handled by each tab's undo controller
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
      // Get the correct sequence state for the tab being saved
      const tabSequenceState = getSequenceStateFor(activeSection);
      await tabSequenceState.saveCurrentState(activeSection);
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

    // Get the correct sequence state for the tab being restored
    const tabSequenceState = getSequenceStateFor(panel);
    tabSequenceState.updateCachedActiveTab(panel);

    // Check if there's a pending deep link - if so, skip restoring saved state
    // This prevents overwriting deep link sequences with empty/old persisted state
    let hasDeepLink = false;
    try {
      const { resolve } = await import("$lib/shared/inversify/di");
      const { TYPES } = await import("$lib/shared/inversify/types");
      const deepLinkService = resolve<IDeepLinkService>(TYPES.IDeepLinkService);
      hasDeepLink = deepLinkService.hasDataForModule("create") ?? false;
    } catch {
      // Service not available - assume no deep link
      void 0; // Suppress unused catch binding warning
    }

    if (hasDeepLink) {
      return;
    }

    try {
      const savedState =
        await sequencePersistenceService.loadCurrentState(panel);

      if (savedState) {
        // Load saved state for this tab's specific sequence state
        tabSequenceState.setCurrentSequence(savedState.currentSequence);
        tabSequenceState.setSelectedStartPosition(
          savedState.selectedStartPosition ?? null
        );

        syncConstructTabState(
          constructTabState,
          savedState.hasStartPosition,
          savedState.selectedStartPosition
        );
      } else {
        // FIX: No saved state exists - preserve in-memory sequence!
        // Previously, this would unconditionally clear in-memory sequences on every tab switch
        // if no localStorage data existed. This caused the workspace collapse bug where
        // Constructor's in-memory sequence was cleared when switching back from other tabs.
        // Now we only preserve existing in-memory data instead of clearing it.

        // Don't touch the sequence state - it may already have valid in-memory data
        // Only sync construct tab state to show the start position picker if needed
        if (constructTabState && !tabSequenceState.currentSequence) {
          syncConstructTabState(constructTabState, false, null);
        }
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
