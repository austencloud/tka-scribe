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
import type { ISequenceRepository } from "../services/contracts/ISequenceRepository";
import type { ISequencePersister } from "../services/contracts/ISequencePersister";
import type { ISequenceStatsCalculator } from "../services/contracts/ISequenceStatsCalculator";
import type { ISequenceTransformer } from "../services/contracts/ISequenceTransformer";
import type { ISequenceValidator } from "../services/contracts/ISequenceValidator";
import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
import type { BeatData } from "../domain/models/BeatData";
import type { BuildModeId } from "$lib/shared/foundation/ui/UITypes";
import type { AssemblerTabState } from "./assembler-tab-state.svelte";
import type { GeneratorTabState } from "./generator-tab-state.svelte";

/**
 * Creates the main Create Module state orchestrator
 *
 * @param sequenceService - Service for sequence operations
 * @param SequencePersister - Service for persistence
 * @param sequenceStatisticsService - Optional statistics service for sequence analysis
 * @param SequenceTransformer - Optional transformation service for sequence operations
 * @param sequenceValidationService - Optional validation service for sequence validation
 * @returns Unified state object with all Create module state and methods
 */
export function createCreateModuleState(
  sequenceService: ISequenceRepository,
  SequencePersister?: ISequencePersister,
  sequenceStatisticsService?: ISequenceStatsCalculator,
  SequenceTransformer?: ISequenceTransformer,
  sequenceValidationService?: ISequenceValidator
) {
  // Create sequence state (shared/legacy - kept for backwards compatibility)
  const sequenceState = createSequenceState({
    sequenceService,
    ...(SequencePersister && { SequencePersister }),
    ...(sequenceStatisticsService && { sequenceStatisticsService }),
    ...(SequenceTransformer && { SequenceTransformer }),
    ...(sequenceValidationService && { sequenceValidationService }),
  });

  // Create per-tab fallback sequence states
  // IMPORTANT: Each tab gets its own isolated fallback state to prevent cross-tab data pollution.
  // Previously, all tabs fell back to the shared `sequenceState`, causing data from one tab
  // (e.g., Generator) to appear in another tab (e.g., Assembler) when that tab's state was null.
  const createTabFallbackState = () =>
    createSequenceState({
      sequenceService,
      ...(SequencePersister && { SequencePersister }),
      ...(sequenceStatisticsService && { sequenceStatisticsService }),
      ...(SequenceTransformer && { SequenceTransformer }),
      ...(sequenceValidationService && { sequenceValidationService }),
    });

  const constructorFallbackState = createTabFallbackState();
  const assemblerFallbackState = createTabFallbackState();
  const generatorFallbackState = createTabFallbackState();

  // Create hand path coordinator
  const handPathCoordinator = createHandPathCoordinator();

  // Create option history manager
  const optionHistoryManager = createOptionHistoryManager({
    getSequence: () => sequenceState.currentSequence,
  });

  // Store tab states in closure - moved up so getSequenceStateForTab can access them
  let _constructorTabState: any = null; // Will be set during initialization
  let _assemblerTabState: AssemblerTabState | null = null;
  let _generatorTabState: GeneratorTabState | null = null;

  /**
   * Get the sequence state for a specific tab
   * Used by persistence controller to save/restore the correct tab's state
   *
   * IMPORTANT: Each tab falls back to its own isolated state, NOT the shared state.
   * This prevents cross-tab data pollution where one tab's sequence appears in another tab.
   */
  function getSequenceStateForTab(tab: BuildModeId): SequenceState {
    switch (tab) {
      case "constructor": {
        const ctor = _constructorTabState as {
          sequenceState?: SequenceState;
        } | null;
        return ctor?.sequenceState || constructorFallbackState;
      }
      case "assembler": {
        return _assemblerTabState?.sequenceState || assemblerFallbackState;
      }
      case "generator": {
        return _generatorTabState?.sequenceState || generatorFallbackState;
      }
      default:
        return sequenceState;
    }
  }

  // Create persistence controller with tab-specific state lookup
  const persistenceController = createCreateModulePersistenceController({
    sequenceState,
    ...(SequencePersister && { SequencePersister }),
    handPathCoordinator,
    optionHistoryManager,
    getSequenceStateForTab,
  });

  // Create navigation controller (needs persistence controller)
  const navigationController = createNavigationController({
    sequenceState,
    persistenceController,
    getConstructTabState: () => null, // Will be set later if needed
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

  /**
   * Get the undo controller for the currently active tab
   * Each tab has its own independent undo history
   *
   * @returns The undo controller for the active tab (constructor, assembler, or generator)
   */
  function getActiveTabUndoController() {
    const activeTab = navigationState.activeTab as BuildModeId;
    switch (activeTab) {
      case "constructor": {
        const ctor = _constructorTabState as any;
        return ctor?.undoController || null;
      }
      case "assembler": {
        return _assemblerTabState?.undoController || null;
      }
      case "generator": {
        return _generatorTabState?.undoController || null;
      }
      default:
        return null;
    }
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

    // Undo (tab-scoped - delegates to active tab's undo controller)
    get undoController() {
      return getActiveTabUndoController();
    },
    pushUndoSnapshot: (type: any, metadata?: any) => {
      const controller = getActiveTabUndoController();
      controller?.pushUndoSnapshot(type, metadata);
    },
    undo: () => {
      const controller = getActiveTabUndoController();
      return controller?.undo() || false;
    },
    redo: () => {
      const controller = getActiveTabUndoController();
      return controller?.redo() || false;
    },
    clearUndoHistory: () => {
      const controller = getActiveTabUndoController();
      controller?.clearUndoHistory();
    },
    setShowStartPositionPickerCallback: (callback: () => void) => {
      const controller = getActiveTabUndoController();
      controller?.setShowStartPositionPickerCallback(callback);
    },
    setSyncPickerStateCallback: (callback: () => void) => {
      const controller = getActiveTabUndoController();
      controller?.setSyncPickerStateCallback(callback);
    },
    setOnUndoingOptionCallback: (callback: (isUndoing: boolean) => void) => {
      const controller = getActiveTabUndoController();
      controller?.setOnUndoingOptionCallback(callback);
    },
    get canUndo() {
      const controller = getActiveTabUndoController();
      return controller?.canUndo || false;
    },
    get canRedo() {
      const controller = getActiveTabUndoController();
      return controller?.canRedo || false;
    },
    get undoHistory() {
      const controller = getActiveTabUndoController();
      return controller?.undoHistory || [];
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
    set constructorTabState(value: unknown) {
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
