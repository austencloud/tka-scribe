/**
 * Construct Tab State - Sub-tab State
 *
 * Manages state specific to the Construct sub-tab functionality.
 * Handles start position selection, option picking, and construct-specific UI state.
 *
 * ✅ All construct-specific runes ($state, $derived, $effect) live here
 * ✅ Pure reactive wrappers - no business logic
 * ✅ Services injected via parameters
 * ✅ Component-scoped state (not global singleton)
 */

import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import { createHMRState } from "$lib/shared/utils/hmr-state-backup";
import { createSimplifiedStartPositionState } from "../../construct/start-position-picker/state/start-position-state.svelte";
import { createComponentLogger } from "$lib/shared/utils/debug-logger";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

const debug = createComponentLogger("ConstructTabState");
import type { BeatData } from "../domain/models/BeatData";
import type { ICreateModuleService } from "../services/contracts/ICreateModuleService";
import type { ISequencePersistenceService } from "../services/contracts/ISequencePersistenceService";
import type { ISequenceService } from "../services/contracts/ISequenceService";
import type { ISequenceStatisticsService } from "../services/contracts/ISequenceStatisticsService";
import type { ISequenceTransformationService } from "../services/contracts/ISequenceTransformationService";
import type { ISequenceValidationService } from "../services/contracts/ISequenceValidationService";
import { createSequenceState } from "./SequenceStateOrchestrator.svelte";
import type { SequenceState } from "./SequenceStateOrchestrator.svelte";
import type { ICreateModuleState } from "../types/create-module-types";
import type { IUndoService } from "../services/contracts/IUndoService";
import { createUndoController } from "./create-module/undo-controller.svelte";
import { resolve } from "$lib/shared/inversify/di";
import { TYPES } from "$lib/shared/inversify/types";

/**
 * Creates construct tab state for construct-specific concerns
 *
 * @param createModuleService - Injected create module service for business logic
 * @param sequenceService - Sequence service for creating Construct tab's own sequence state
 * @param sequencePersistenceService - Persistence service for state survival
 * @param sequenceStatisticsService - Optional statistics service for sequence analysis
 * @param sequenceTransformationService - Optional transformation service for sequence operations
 * @param sequenceValidationService - Optional validation service for sequence validation
 * @param createModuleState - Create module state for accessing navigation history
 * @returns Reactive state object with getters and state mutations
 */
export function createConstructTabState(
  createModuleService: ICreateModuleService,
  sequenceService?: ISequenceService,
  sequencePersistenceService?: ISequencePersistenceService,
  sequenceStatisticsService?: ISequenceStatisticsService,
  sequenceTransformationService?: ISequenceTransformationService,
  sequenceValidationService?: ISequenceValidationService,
  createModuleState?: ICreateModuleState | null
) {
  // ============================================================================
  // HMR STATE BACKUP
  // ============================================================================

  // Create HMR backup for critical state - temporarily disabled to debug effect_orphan error
  const hmrBackup = {
    initialValue: {
      showStartPositionPicker: null as boolean | null,
      selectedStartPosition: null as PictographData | null,
      isInitialized: false,
    },
  };

  // ============================================================================
  // REACTIVE STATE (Construct-specific)
  // ============================================================================

  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let isTransitioning = $state(false);
  let showStartPositionPicker = $state<boolean | null>(
    hmrBackup.initialValue.showStartPositionPicker
  );
  let selectedStartPosition = $state<PictographData | null>(
    hmrBackup.initialValue.selectedStartPosition
  );
  let isInitialized = $state(hmrBackup.initialValue.isInitialized);
  let isContinuousOnly = $state(false); // Filter state for option viewer

  // Construct tab has its own independent sequence state
  // IMPORTANT: Pass tabId="constructor" to ensure persistence loads/saves only constructor's data
  const sequenceState: SequenceState | null = sequenceService
    ? createSequenceState({
        sequenceService,
        ...(sequencePersistenceService && { sequencePersistenceService }),
        ...(sequenceStatisticsService && { sequenceStatisticsService }),
        ...(sequenceTransformationService && { sequenceTransformationService }),
        ...(sequenceValidationService && { sequenceValidationService }),
        tabId: "constructor", // Persistence isolation - only load/save constructor's data
      })
    : null;

  // Construct tab has its own independent undo controller
  const undoService = resolve<IUndoService>(TYPES.IUndoService);
  const undoController = sequenceState
    ? createUndoController({
        undoService,
        sequenceState,
        getActiveSection: () => createModuleState?.activeSection || "constructor",
        setActiveSectionInternal: async (panel, addToHistory) => {
          // Construct tab doesn't need to change active section since it's always constructor
          // This is just for compatibility with the undo controller interface
        },
      })
    : null;

  // Sub-states (construct-specific)
  // Start position state service using proper simplified state
  const startPositionStateService = createSimplifiedStartPositionState();
  let unsubscribeStartPositionListener: (() => void) | null = null;

  // Event handler function for start position selection (reactive listener compatible)
  function handleStartPositionSelected(
    pictographData: PictographData | null,
    source: "user" | "sync" = "user"
  ) {
    if (!pictographData) {
      setSelectedStartPosition(null);
      if (sequenceState) {
        sequenceState.setSelectedStartPosition(null);
      }
      if (source === "user") {
        setShowStartPositionPicker(true);
      }
      return;
    }

    if (source === "user" && undoController) {
      undoController.pushUndoSnapshot("SELECT_START_POSITION", {
        description: "Select start position",
      });
    }

    setShowStartPositionPicker(false);
    setSelectedStartPosition(pictographData);

    if (sequenceState) {
      sequenceState.setSelectedStartPosition(pictographData);
    }

    if (source !== "user" || !sequenceState) {
      return;
    }

    const beatData: BeatData = {
      ...pictographData,
      id: `beat-${Date.now()}`,
      beatNumber: 0,
      duration: 1000,
      blueReversal: false,
      redReversal: false,
      isBlank: false,
    };

    sequenceState
      .createSequence({
        name: `Sequence ${new Date().toLocaleTimeString()}`,
        length: 0,
      })
      .then((newSequence) => {
        if (newSequence) {
          sequenceState.setCurrentSequence(newSequence);
          try {
            sequenceState.setStartPosition(beatData);
          } catch (error) {
            console.error(
              "? ConstructTabState: Error setting start position:",
              error
            );
          }
        } else {
          console.error("? ConstructTabState: Failed to create new sequence");
        }
      })
      .catch((error: unknown) => {
        console.error("? ConstructTabState: Error creating sequence:", error);
      });
  }
  // ============================================================================
  // DERIVED STATE (Construct-specific derived state)
  // ============================================================================

  const hasError = $derived(error !== null);
  const canSelectOptions = $derived(selectedStartPosition !== null);
  const shouldShowStartPositionPicker = $derived(() => {
    // Don't return any state until initialization is complete
    if (!isInitialized) return null;

    // SAFEGUARD: If Constructor has NO sequence data (no beats and no start position),
    // ALWAYS show the Start Position Picker, regardless of what showStartPositionPicker says.
    // This prevents the bug where Option Viewer shows "No options available" when
    // there's nothing to show options for.
    if (sequenceState) {
      const hasNoData =
        !sequenceState.hasStartPosition &&
        sequenceState.getCurrentSequenceData().length === 0;
      if (hasNoData) {
        return true; // Force Start Position Picker when there's no data
      }
    }

    return showStartPositionPicker;
  });
  const isPickerStateLoading = $derived(
    !isInitialized || showStartPositionPicker === null
  ); // Loading state detection like main navigation

  // ============================================================================
  // EFFECTS (Construct-specific effects)
  // ============================================================================

  // NOTE: $effect has been removed from the factory function to prevent effect_orphan error
  // The sync logic is now handled in the initializeConstructTab function
  // This is necessary because factory functions called after async operations lose Svelte context

  // Load start positions when construct tab is initialized - using onMount to prevent infinite loops
  let startPositionsLoaded = $state(false);
  let coordinationSetup = $state(false);

  // Initialize construct tab - called from component onMount
  async function initializeConstructTab() {
    if (!startPositionsLoaded) {
      // Start positions are loaded automatically on state creation
      startPositionsLoaded = true;
    }

    if (!coordinationSetup) {
      void createModuleService.initialize();
      coordinationSetup = true;
    }

    if (
      !unsubscribeStartPositionListener &&
      startPositionStateService.onSelectedPositionChange
    ) {
      unsubscribeStartPositionListener =
        startPositionStateService.onSelectedPositionChange(
          (position: PictographData | null, source) => {
            handleStartPositionSelected(position, source);
          }
        );
    }

    // Register callbacks with local undo controller for undo functionality
    undoController?.setShowStartPositionPickerCallback(() => {
      setShowStartPositionPicker(true);
    });

    // Register sync picker state callback for smart picker detection after undo
    undoController?.setSyncPickerStateCallback(() => {
      syncPickerStateWithSequence();
    });

    // Initialize persistence and restore state if available
    if (sequencePersistenceService && sequenceState) {
      try {
        await sequenceState.initializeWithPersistence();

        // Check if we have a persisted state that should affect UI
        // IMPORTANT: Pass "constructor" to load only Constructor's persisted data
        // Without this, it loads based on navigationState.currentSection which could be another tab
        const savedState = await sequencePersistenceService.loadCurrentState("constructor");
        debug.log("init: savedState =", savedState);
        debug.log("init: savedState?.hasStartPosition =", savedState?.hasStartPosition);
        debug.log("init: sequenceState.hasStartPosition =", sequenceState.hasStartPosition);
        debug.log("init: sequenceState.getCurrentSequenceData() =", sequenceState.getCurrentSequenceData());

        if (savedState && savedState.hasStartPosition) {
          debug.log("Persisted state has start position, setting showStartPositionPicker = false");
          setShowStartPositionPicker(false);
          setSelectedStartPosition(savedState.selectedStartPosition);
          if (savedState.selectedStartPosition) {
            startPositionStateService.setSelectedPosition(
              savedState.selectedStartPosition
            );
          }
        } else {
          // No saved state, set default to show start position picker
          debug.log("No persisted start position, setting showStartPositionPicker = true");
          setShowStartPositionPicker(true);
          startPositionStateService.clearSelectedPosition();
        }
      } catch (error) {
        console.error(
          "❌ ConstructTabState: Failed to restore persisted state:",
          error
        );
        // On error, default to showing start position picker
        setShowStartPositionPicker(true);
        startPositionStateService.clearSelectedPosition();
      }
    } else {
      // No persistence service, default to showing start position picker
      debug.log("No persistence service, setting showStartPositionPicker = true");
      setShowStartPositionPicker(true);
      startPositionStateService.clearSelectedPosition();
    }

    // Sync picker state with construct tab's own sequence state's hasStartPosition
    // This logic was moved from $effect to avoid effect_orphan error
    // IMPORTANT: Uses construct tab's own sequence state, not the shared state
    if (sequenceState) {
      debug.log("sync: sequenceState.hasStartPosition =", sequenceState.hasStartPosition);
      debug.log("sync: showStartPositionPicker =", showStartPositionPicker);
      if (sequenceState.hasStartPosition && showStartPositionPicker === true) {
        debug.log("sync: Sequence has start position, hiding picker");
        setShowStartPositionPicker(false);
      } else if (
        !sequenceState.hasStartPosition &&
        showStartPositionPicker === false
      ) {
        debug.log("sync: Sequence has NO start position, showing picker");
        setShowStartPositionPicker(true);
      }
    }

    debug.log("init complete: showStartPositionPicker =", showStartPositionPicker);

    // Mark as initialized after all setup is complete
    isInitialized = true;
  } 

  // ============================================================================
  // STATE MUTATIONS (Construct-specific state updates)
  // ============================================================================

  function setLoading(loading: boolean) {
    isLoading = loading;
  }

  function setTransitioning(transitioning: boolean) {
    isTransitioning = transitioning;
  }

  function setError(errorMessage: string | null) {
    error = errorMessage;
  }

  function clearError() {
    error = null;
  }

  function setShowStartPositionPicker(show: boolean | null) {
    showStartPositionPicker = show;
  }

  function setSelectedStartPosition(position: PictographData | null) {
    selectedStartPosition = position;
  }

  function setContinuousOnly(continuous: boolean) {
    isContinuousOnly = continuous;
  }

  async function clearSequenceCompletely() {
    try {
      // Start UI transition and sequence clearing simultaneously for smooth UX
      setShowStartPositionPicker(true);
      setSelectedStartPosition(null);
      startPositionStateService.clearSelectedPosition();
      clearError();

      // TODO: Navigation logic needs to be updated after state refactoring
      // The properties lastContentTab and methods setCurrentSection have been moved/renamed
      // Commented out until navigation state is properly wired up

      // Clear sequence state asynchronously
      if (sequenceState) {
        sequenceState
          .clearSequenceCompletely()
          .then(() => {
            // Navigation logic commented out - needs update after state refactoring
          })
          .catch((error: unknown) => {
            console.error(
              "❌ ConstructTabState: Failed to clear sequence state:",
              error
            );
            setError(
              error instanceof Error
                ? error.message
                : "Failed to clear sequence"
            );
          });
      }
    } catch (error) {
      console.error(
        "❌ ConstructTabState: Failed to initiate sequence clear:",
        error
      );
      setError(
        error instanceof Error ? error.message : "Failed to clear sequence"
      );
    }
  }

  /**
   * Restore picker state after undo - shows option picker instead of start position picker
   * Called when undoing a clear sequence operation
   */
  function restorePickerStateAfterUndo() {
    setShowStartPositionPicker(false);
  }

  /**
   * Sync picker state with sequence state's hasStartPosition and grid mode
   * This replaces the $effect that was causing effect_orphan error
   * Call this method whenever sequence state changes that might affect picker visibility
   *
   * IMPORTANT: Uses the construct tab's OWN sequence state, not the shared createModuleState
   */
  function syncPickerStateWithSequence() {
    if (!isInitialized) return;

    // Use construct tab's own sequence state as the source of truth
    // This is critical - construct tab manages its own sequence independently
    if (!sequenceState) return;

    // When sequence state has a start position, hide the start position picker
    if (sequenceState.hasStartPosition && showStartPositionPicker === true) {
      console.log(
        "🔄 ConstructTabState: Syncing picker state - hiding start position picker (hasStartPosition: true)"
      );
      setShowStartPositionPicker(false);
    }

    // When sequence state loses start position, show the start position picker
    if (!sequenceState.hasStartPosition && showStartPositionPicker === false) {
      console.log(
        "🔄 ConstructTabState: Syncing picker state - showing start position picker (hasStartPosition: false)"
      );
      setShowStartPositionPicker(true);
    }

    // Sync grid mode from the current sequence
    const currentSequence = sequenceState.currentSequence;
    if (currentSequence?.gridMode) {
      const sequenceGridMode = currentSequence.gridMode;
      const currentPickerGridMode = startPositionStateService.currentGridMode;

      if (sequenceGridMode !== currentPickerGridMode) {
        console.log(
          `🔄 ConstructTabState: Syncing grid mode from sequence - ${currentPickerGridMode} → ${sequenceGridMode}`
        );
        // Update the start position state's grid mode to match the sequence
        startPositionStateService.loadPositions(sequenceGridMode);
      }
    }
  }

  /**
   * Sync grid mode from an imported sequence
   * Call this after importing a sequence to ensure the option picker uses the correct grid mode
   * Uses synchronous setGridMode to avoid async delays that cause UI flicker
   */
  function syncGridModeFromSequence(gridMode: GridMode | undefined) {
    if (!gridMode) return;

    const currentPickerGridMode = startPositionStateService.currentGridMode;
    if (gridMode !== currentPickerGridMode) {
      console.log(
        `🔄 ConstructTabState: Syncing grid mode from imported sequence - ${currentPickerGridMode} → ${gridMode}`
      );
      // Use synchronous setter to avoid UI flicker from async loadPositions
      startPositionStateService.setGridMode(gridMode);
    }
  }

  // ============================================================================
  // DERIVED STATE - REMOVED
  // ============================================================================

  // CONSOLIDATION: Remove duplicate sequence data management
  // The SequenceState is now the single source of truth for all sequence data
  // Components should access sequence data directly through sequenceState

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    // Readonly state access
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get isTransitioning() {
      return isTransitioning;
    },
    get hasError() {
      return hasError;
    },
    get canSelectOptions() {
      return canSelectOptions;
    },
    get showStartPositionPicker() {
      return showStartPositionPicker;
    },
    get shouldShowStartPositionPicker() {
      return shouldShowStartPositionPicker;
    },
    get isPickerStateLoading() {
      return isPickerStateLoading;
    },
    get isInitialized() {
      return isInitialized;
    },
    // Alias for compatibility with CreationToolPanelSlot
    get isPersistenceInitialized() {
      return isInitialized;
    },
    get selectedStartPosition() {
      return selectedStartPosition;
    },
    get isContinuousOnly() {
      return isContinuousOnly;
    },
    // CONSOLIDATION: Direct access to sequence state - no duplicate data management
    get sequenceState() {
      return sequenceState;
    },

    // Sub-states
    get startPositionStateService() {
      return startPositionStateService;
    },

    // Undo controller (tab-scoped)
    get undoController() {
      return undoController;
    },
    get canUndo() {
      return undoController?.canUndo || false;
    },
    get canRedo() {
      return undoController?.canRedo || false;
    },
    get undoHistory() {
      return undoController?.undoHistory || [];
    },
    pushUndoSnapshot: (type: any, metadata?: any) => {
      undoController?.pushUndoSnapshot(type, metadata);
    },
    undo: () => {
      return undoController?.undo() || false;
    },
    redo: () => {
      return undoController?.redo() || false;
    },
    clearUndoHistory: () => {
      undoController?.clearUndoHistory();
    },

    // State mutations
    setLoading,
    setTransitioning,
    setError,
    clearError,
    setShowStartPositionPicker,
    setSelectedStartPosition,
    setContinuousOnly,
    clearSequenceCompletely,
    restorePickerStateAfterUndo,
    syncPickerStateWithSequence,
    syncGridModeFromSequence,

    // Event handlers
    handleStartPositionSelected,

    // Initialization
    initializeConstructTab,
  };
}

/**
 * Type for ConstructTabState - the return type of createConstructTabState
 */
export type ConstructTabState = ReturnType<typeof createConstructTabState>;

// ============================================================================
// HMR STATE PERSISTENCE EFFECT
// ============================================================================

/**
 * Add this effect to any component using ConstructTabState to enable HMR backup
 * IMPORTANT: This must be called from within a component's script context, not from
 * an async callback or after a setTimeout, to avoid effect_orphan errors
 *
 * Example usage in a component:
 * ```svelte
 * <script lang="ts">
 *   import { createConstructTabState, addHMRBackupEffect } from "../state";
 *
 *   let constructTabState = createConstructTabState(...);
 *
 *   // Call this directly in component script, NOT in onMount or async context
 *   addHMRBackupEffect(constructTabState);
 * </script>
 * ```
 */
export function addHMRBackupEffect(
  constructTabState: ReturnType<typeof createConstructTabState>
) {
  // Auto-save critical state changes for HMR persistence
  $effect(() => {
    const stateToBackup = {
      showStartPositionPicker: constructTabState.showStartPositionPicker,
      selectedStartPosition: constructTabState.selectedStartPosition,
      isInitialized: constructTabState.isInitialized,
    };

    // Only save if initialized to avoid saving empty initial state
    if (constructTabState.isInitialized) {
      const hmrBackup = createHMRState("construct-tab-state", stateToBackup);
      hmrBackup.saveState(stateToBackup);
    }
  });
}

// Import required state factories
