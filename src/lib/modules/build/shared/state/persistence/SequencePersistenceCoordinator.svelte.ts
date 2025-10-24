/**
 * Sequence Persistence Coordinator
 *
 * Coordinates persistence operations for sequence state:
 * - Initializes persistence service
 * - Auto-saves state changes
 * - Manages persistence lifecycle
 *
 * RESPONSIBILITY: Persistence coordination, observes state changes
 */

import type {
    ActiveBuildTab,
    PictographData,
    SequenceData,
} from "$shared";
import type { ISequencePersistenceService } from "../../services/contracts";

export interface PersistenceState {
  currentSequence: SequenceData | null;
  selectedStartPosition: PictographData | null;
  hasStartPosition: boolean;
  activeBuildSubTab: ActiveBuildTab;
}

export interface SequencePersistenceStateData {
  isInitialized: boolean;
  autoSaveEnabled: boolean;
}

export function createSequencePersistenceCoordinator(
  persistenceService: ISequencePersistenceService | null,
  applyReversalDetection?: (sequence: SequenceData) => SequenceData
) {
  const state = $state<SequencePersistenceStateData>({
    isInitialized: false,
    autoSaveEnabled: true,
  });

  return {
    // Getters
    get isInitialized() {
      return state.isInitialized;
    },
    get autoSaveEnabled() {
      return state.autoSaveEnabled;
    },

    // Core operations
    async initialize(): Promise<PersistenceState | null> {
      if (!persistenceService || state.isInitialized) return null;

      try {
        await persistenceService.initialize();
        const savedState = await persistenceService.loadCurrentState();

        if (savedState && savedState.currentSequence && applyReversalDetection) {
          savedState.currentSequence = applyReversalDetection(savedState.currentSequence);
        }

        state.isInitialized = true;
        return savedState;
      } catch (error) {
        console.error("❌ PersistenceCoordinator: Failed to initialize:", error);
        state.isInitialized = true; // Continue without persistence
        return null;
      }
    },

    async saveState(persistenceState: PersistenceState): Promise<void> {
      if (!persistenceService || !state.autoSaveEnabled) return;

      try {
        await persistenceService.saveCurrentState(persistenceState);
      } catch (error) {
        console.error("❌ PersistenceCoordinator: Failed to save state:", error);
      }
    },

    async saveSequenceOnly(
      currentSequence: SequenceData | null,
      selectedStartPosition: PictographData | null,
      hasStartPosition: boolean
    ): Promise<void> {
      if (!persistenceService || !state.autoSaveEnabled) return;

      try {
        // Load current state to preserve the active tab
        const currentState = await persistenceService.loadCurrentState();
        const preservedTab = currentState?.activeBuildSubTab || "construct";

        await persistenceService.saveCurrentState({
          currentSequence,
          selectedStartPosition,
          hasStartPosition,
          activeBuildSubTab: preservedTab,
        });
      } catch (error) {
        console.error("❌ PersistenceCoordinator: Failed to save sequence:", error);
      }
    },

    async clearState(): Promise<void> {
      if (!persistenceService) return;

      try {
        await persistenceService.clearCurrentState();
      } catch (error) {
        console.error("❌ PersistenceCoordinator: Failed to clear state:", error);
      }
    },

    setAutoSaveEnabled(enabled: boolean) {
      state.autoSaveEnabled = enabled;
    },

    reset() {
      state.isInitialized = false;
      state.autoSaveEnabled = true;
    },
  };
}

export type SequencePersistenceCoordinator = ReturnType<
  typeof createSequencePersistenceCoordinator
>;
