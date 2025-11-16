/**
 * Create Module State Factory
 *
 * Main state orchestrator for the Create module that combines all sub-controllers
 * and provides the unified API expected by the rest of the application.
 */

import { createSequenceState } from "./SequenceStateOrchestrator.svelte";
import { createHandPathCoordinator } from "./hand-path-coordinator.svelte";
import { createCreateModulePersistenceController } from "./create-module/persistence-controller.svelte";
import { createNavigationController } from "./create-module/navigation-controller.svelte";
import { createOptionHistoryManager } from "./create-module/option-history-manager.svelte";
import { createUndoController } from "./create-module/undo-controller.svelte";
import type { ISequenceService, ISequencePersistenceService } from "../services/contracts";
import type { IUndoService } from "../services/contracts/IUndoService";
import { resolve, TYPES } from "$shared/inversify";
import type { BeatData, BuildModeId } from "$shared";

/**
 * Creates the main Create Module state orchestrator
 *
 * @param sequenceService - Service for sequence operations
 * @param sequencePersistenceService - Service for persistence
 * @returns Unified state object with all Create module state and methods
 */
export function createCreateModuleState(
  sequenceService: ISequenceService,
  sequencePersistenceService?: ISequencePersistenceService
) {
  // Create sequence state
  const sequenceState = createSequenceState({
    sequenceService,
    sequencePersistenceService,
  });

  // Create hand path coordinator
  const handPathCoordinator = createHandPathCoordinator();

  // Create option history manager
  const optionHistoryManager = createOptionHistoryManager({
    getSequence: () => sequenceState.currentSequence,
  });

  // Resolve undo service from DI container
  const undoService = resolve<IUndoService>(TYPES.IUndoService);

  // Create persistence controller
  const persistenceController = createCreateModulePersistenceController({
    sequenceState,
    sequencePersistenceService,
    handPathCoordinator,
    optionHistoryManager,
    undoService,
  });

  // Create navigation controller (needs persistence controller)
  const navigationController = createNavigationController({
    sequenceState,
    persistenceController,
    getConstructTabState: () => null, // Will be set later if needed
  });

  // Create undo controller (needs navigation controller for callbacks)
  const undoController = createUndoController({
    undoService,
    sequenceState,
    getActiveSection: () => navigationController.activeSection,
    setActiveSectionInternal: (panel, addToHistory) =>
      navigationController.setActiveToolPanelInternal(panel, addToHistory),
  });

  /**
   * Initialize with persisted state
   */
  async function initializeWithPersistence() {
    await persistenceController.initialize();
  }

  /**
   * Add option to history
   */
  function addOptionToHistory(beatIndex: number, beatData: BeatData) {
    optionHistoryManager.add(beatIndex, beatData);
  }

  /**
   * Guided mode header text (for displaying in current word)
   */
  let guidedModeHeaderText = $state<string | null>(null);

  /**
   * Check if workspace is empty (no beats and no start position)
   */
  function isWorkspaceEmpty(): boolean {
    const sequence = sequenceState.currentSequence;
    if (!sequence) {
      return true;
    }
    const hasBeat = sequence.beats && sequence.beats.length > 0;
    const hasStartPosition = sequence.startingPositionBeat || sequence.startPosition;
    return !hasBeat && !hasStartPosition;
  }

  /**
   * Get current beat count
   */
  function getCurrentBeatCount(): number {
    return sequenceState.beatCount();
  }

  /**
   * Check if sequence has content (beats)
   */
  function hasSequence(): boolean {
    return sequenceState.hasSequence();
  }

  /**
   * Check if can clear sequence
   */
  function canClearSequence(): boolean {
    return sequenceState.hasSequence();
  }

  /**
   * Check if action buttons can be shown
   */
  function canShowActionButtons(): boolean {
    const beatCount = sequenceState.beatCount();
    return beatCount > 0;
  }

  /**
   * Check if sequence actions button can be shown
   */
  function canShowSequenceActionsButton(): boolean {
    const beatCount = sequenceState.beatCount();
    return beatCount > 0;
  }

  return {
    // Sequence state
    sequenceState,

    // Navigation
    navigationController,
    get activeSection() {
      return navigationController.activeSection;
    },
    get isNavigatingBack() {
      return navigationController.isNavigatingBack;
    },
    get isUpdatingFromToggle() {
      return navigationController.isUpdatingFromToggle;
    },
    setActiveToolPanel: (panel: BuildModeId) =>
      navigationController.setActiveToolPanel(panel),

    // Persistence
    persistenceController,
    initializeWithPersistence,
    get isPersistenceInitialized() {
      return persistenceController.isInitialized;
    },

    // Option history
    optionHistoryManager,
    addOptionToHistory,

    // Undo
    undoService,
    undoController,
    pushUndoSnapshot: undoController.pushUndoSnapshot,
    undo: undoController.undo,
    clearUndoHistory: undoController.clearUndoHistory,
    get canUndo() {
      return undoController.canUndo;
    },
    get undoHistory() {
      return undoController.undoHistory;
    },

    // Hand path
    handPathCoordinator,

    // Workspace state queries
    isWorkspaceEmpty,
    getCurrentBeatCount,
    hasSequence,
    canClearSequence,
    canShowActionButtons,
    canShowSequenceActionsButton,
    get canAccessEditTab() {
      return sequenceState.beatCount() > 0;
    },

    // Guided mode
    get guidedModeHeaderText() {
      return guidedModeHeaderText;
    },
    setGuidedModeHeaderText: (text: string | null) => {
      guidedModeHeaderText = text;
    },
  };
}

export type CreateModuleState = ReturnType<typeof createCreateModuleState>;
