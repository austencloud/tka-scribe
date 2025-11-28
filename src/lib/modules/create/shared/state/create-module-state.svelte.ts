/**
 * Create Module State Factory
 *
 * Main state orchestrator for the Create module that combines all sub-controllers
 * and provides the unified API expected by the rest of the application.
 */

import { createSequenceState } from "./SequenceStateOrchestrator.svelte";
import type { SequenceState } from "./SequenceStateOrchestrator.svelte";
import { createHandPathCoordinator } from "./hand-path-coordinator.svelte";
import { createCreateModulePersistenceController } from "./create-module/persistence-controller.svelte";
import { createNavigationController } from "./create-module/navigation-controller.svelte";
import { createOptionHistoryManager } from "./create-module/option-history-manager.svelte";
import { createUndoController } from "./create-module/undo-controller.svelte";
import type {
  ISequenceService,
  ISequencePersistenceService,
} from "../services/contracts";
import type { IUndoService } from "../services/contracts/IUndoService";
import type { ISequenceStatisticsService } from "../services/contracts/ISequenceStatisticsService";
import type { ISequenceTransformationService } from "../services/contracts/ISequenceTransformationService";
import type { ISequenceValidationService } from "../services/contracts/ISequenceValidationService";
import { resolve } from "$shared/inversify";
import { TYPES } from "$shared/inversify/types";
import { navigationState } from "$shared/navigation/state/navigation-state.svelte";
import type { BeatData } from "../domain/models/BeatData";
import type { BuildModeId } from "$shared/foundation/ui/UITypes";
import type { AssemblerTabState } from "./assembler-tab-state.svelte";
import type { GeneratorTabState } from "./generator-tab-state.svelte";

/**
 * Creates the main Create Module state orchestrator
 *
 * @param sequenceService - Service for sequence operations
 * @param sequencePersistenceService - Service for persistence
 * @param sequenceStatisticsService - Optional statistics service for sequence analysis
 * @param sequenceTransformationService - Optional transformation service for sequence operations
 * @param sequenceValidationService - Optional validation service for sequence validation
 * @returns Unified state object with all Create module state and methods
 */
export function createCreateModuleState(
  sequenceService: ISequenceService,
  sequencePersistenceService?: ISequencePersistenceService,
  sequenceStatisticsService?: ISequenceStatisticsService,
  sequenceTransformationService?: ISequenceTransformationService,
  sequenceValidationService?: ISequenceValidationService
) {
  // Create sequence state
  const sequenceState = createSequenceState({
    sequenceService,
    ...(sequencePersistenceService && { sequencePersistenceService }),
    ...(sequenceStatisticsService && { sequenceStatisticsService }),
    ...(sequenceTransformationService && { sequenceTransformationService }),
    ...(sequenceValidationService && { sequenceValidationService }),
  });

  // Create hand path coordinator
  const handPathCoordinator = createHandPathCoordinator();

  // Create option history manager
  const optionHistoryManager = createOptionHistoryManager({
    getSequence: () => sequenceState.currentSequence,
  });

  // Resolve undo service from DI container
  const undoService = resolve<IUndoService>(TYPES.IUndoService);

  // Store tab states in closure - moved up so getSequenceStateForTab can access them
  let _constructorTabState: any = null; // Will be set during initialization
  let _assemblerTabState: AssemblerTabState | null = null;
  let _generatorTabState: GeneratorTabState | null = null;

  /**
   * Get the sequence state for a specific tab
   * Used by persistence controller to save/restore the correct tab's state
   */
  function getSequenceStateForTab(tab: BuildModeId): SequenceState {
    switch (tab) {
      case "constructor": {
        return _constructorTabState?.sequenceState || sequenceState;
      }
      case "assembler": {
        return _assemblerTabState?.sequenceState || sequenceState;
      }
      case "generator": {
        return _generatorTabState?.sequenceState || sequenceState;
      }
      default:
        return sequenceState;
    }
  }

  // Create persistence controller with tab-specific state lookup
  const persistenceController = createCreateModulePersistenceController({
    sequenceState,
    ...(sequencePersistenceService && { sequencePersistenceService }),
    handPathCoordinator,
    optionHistoryManager,
    undoService,
    getSequenceStateForTab,
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
    const activeSequenceState = getActiveTabSequenceState();
    const sequence = activeSequenceState.currentSequence;
    if (!sequence) {
      return true;
    }
    const hasBeat = sequence.beats && sequence.beats.length > 0;
    const hasStartPosition =
      sequence.startingPositionBeat || sequence.startPosition;
    return !hasBeat && !hasStartPosition;
  }

  /**
   * Get current beat count
   */
  function getCurrentBeatCount(): number {
    const activeSequenceState = getActiveTabSequenceState();
    return activeSequenceState.beatCount();
  }

  /**
   * Check if sequence has content (beats)
   */
  function hasSequence(): boolean {
    const activeSequenceState = getActiveTabSequenceState();
    return activeSequenceState.hasSequence();
  }

  /**
   * Check if can clear sequence
   */
  function canClearSequence(): boolean {
    const activeSequenceState = getActiveTabSequenceState();
    return activeSequenceState.hasSequence();
  }

  /**
   * Check if action buttons can be shown
   */
  function canShowActionButtons(): boolean {
    const activeSequenceState = getActiveTabSequenceState();
    const beatCount = activeSequenceState.beatCount();
    return beatCount > 0;
  }

  /**
   * Check if sequence actions button can be shown
   */
  function canShowSequenceActionsButton(): boolean {
    const activeSequenceState = getActiveTabSequenceState();
    const beatCount = activeSequenceState.beatCount();
    return beatCount > 0;
  }

  /**
   * Get the sequence state for the currently active tab
   * This allows tab-specific sequence operations (e.g., sequence actions)
   *
   * @returns The sequence state for the active tab (constructor, assembler, or generator)
   */
  function getActiveTabSequenceState(): SequenceState {
    const activeTab = navigationState.activeTab as BuildModeId;
    return getSequenceStateForTab(activeTab);
  }

  const stateObject = {
    // Sequence state - now returns active tab's sequence state
    get sequenceState() {
      return getActiveTabSequenceState();
    },

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
      const activeSequenceState = getActiveTabSequenceState();
      return activeSequenceState.beatCount() > 0;
    },

    // Guided mode
    get guidedModeHeaderText() {
      return guidedModeHeaderText;
    },
    setGuidedModeHeaderText: (text: string | null) => {
      guidedModeHeaderText = text;
    },

    // Tab-aware sequence access
    getActiveTabSequenceState,

    // Tab states (will be attached by initialization service)
    get constructorTabState() {
      return _constructorTabState;
    },
    set constructorTabState(value: any) {
      _constructorTabState = value;
    },
    constructTabState: null as any, // Legacy accessor - will be set by initializer
    get assemblerTabState() {
      return _assemblerTabState;
    },
    set assemblerTabState(value: AssemblerTabState | null) {
      _assemblerTabState = value;
    },
    get generatorTabState() {
      return _generatorTabState;
    },
    set generatorTabState(value: GeneratorTabState | null) {
      _generatorTabState = value;
    },
  };

  return stateObject;
}

export type CreateModuleState = ReturnType<typeof createCreateModuleState>;
