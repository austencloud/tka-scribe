/**
 * Assembler Tab State - Sub-tab State
 *
 * Manages state specific to the Assembler sub-tab functionality.
 * Handles hand path assembly and assembler-specific UI state.
 *
 * ✅ All assembler-specific runes ($state, $derived, $effect) live here
 * ✅ Pure reactive wrappers - no business logic
 * ✅ Services injected via parameters
 * ✅ Component-scoped state (not global singleton)
 * ✅ Each tab maintains its own independent sequence state
 */

import type { ISequenceService } from "../services/contracts/ISequenceService";
import type { ISequencePersistenceService } from "../services/contracts/ISequencePersistenceService";
import type { ISequenceStatisticsService } from "../services/contracts/ISequenceStatisticsService";
import type { ISequenceTransformationService } from "../services/contracts/ISequenceTransformationService";
import type { ISequenceValidationService } from "../services/contracts/ISequenceValidationService";
import { createSequenceState } from "./SequenceStateOrchestrator.svelte";
import type { SequenceState } from "./SequenceStateOrchestrator.svelte";
import type { IUndoService } from "../services/contracts/IUndoService";
import { createUndoController } from "./create-module/undo-controller.svelte";
import { resolve } from "$lib/shared/inversify/di";
import { TYPES } from "$lib/shared/inversify/types";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { CreateTabDraft } from "../domain/models/CreateTabDraft";
import { createTabDraftsState_instance } from "./create-tab-drafts-state.svelte";

/**
 * Creates assembler tab state for assembler-specific concerns
 *
 * @param sequenceService - Injected sequence service for business logic
 * @param sequencePersistenceService - Optional persistence service for state survival
 * @param sequenceStatisticsService - Optional statistics service for sequence analysis
 * @param sequenceTransformationService - Optional transformation service for sequence operations
 * @param sequenceValidationService - Optional validation service for sequence validation
 * @returns Reactive state object with getters and state mutations
 */
export function createAssemblerTabState(
  sequenceService?: ISequenceService,
  sequencePersistenceService?: ISequencePersistenceService,
  sequenceStatisticsService?: ISequenceStatisticsService,
  sequenceTransformationService?: ISequenceTransformationService,
  sequenceValidationService?: ISequenceValidationService
) {
  // ============================================================================
  // REACTIVE STATE (Assembler-specific)
  // ============================================================================

  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let isTransitioning = $state(false);
  let isInitialized = $state(false);

  // Start screen state - show by default until user starts or continues
  let showStartScreen = $state(true);
  let gridMode = $state<GridMode>(GridMode.DIAMOND);

  // Assembler tab has its own independent sequence state
  // IMPORTANT: Pass tabId="assembler" to ensure persistence loads/saves only assembler's data
  const sequenceState: SequenceState | null = sequenceService
    ? createSequenceState({
        sequenceService,
        ...(sequencePersistenceService && { sequencePersistenceService }),
        ...(sequenceStatisticsService && { sequenceStatisticsService }),
        ...(sequenceTransformationService && { sequenceTransformationService }),
        ...(sequenceValidationService && { sequenceValidationService }),
        tabId: "assembler", // Persistence isolation - only load/save assembler's data
      })
    : null;

  // Assembler tab has its own independent undo controller
  const undoService = resolve<IUndoService>(TYPES.IUndoService);
  const undoController = sequenceState
    ? createUndoController({
        undoService,
        sequenceState,
        getActiveSection: () => "assembler",
        setActiveSectionInternal: async (panel, addToHistory) => {
          // Assembler tab doesn't need to change active section since it's always assembler
          // This is just for compatibility with the undo controller interface
        },
      })
    : null;

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const hasError = $derived(error !== null);
  const hasSequence = $derived(() => {
    return sequenceState ? sequenceState.hasSequence() : false;
  });

  // Get current draft for this tab
  const currentDraft = $derived(createTabDraftsState_instance.getDraftForTab("assembler"));

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize assembler tab - called from component onMount
   */
  async function initializeAssemblerTab() {
    if (!sequenceState) {
      console.warn(
        "⚠️ AssemblerTabState: No sequence service provided, skipping sequence state initialization"
      );
      isInitialized = true;
      return;
    }

    try {
      // Initialize persistence and restore state if available
      if (sequencePersistenceService) {
        await sequenceState.initializeWithPersistence();
      }

      isInitialized = true;
    } catch (error) {
      console.error(
        "❌ AssemblerTabState: Failed to initialize:",
        error
      );
      setError(
        error instanceof Error ? error.message : "Failed to initialize"
      );
    }
  }

  // ============================================================================
  // STATE MUTATIONS
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

  async function clearSequenceCompletely() {
    try {
      clearError();

      // Clear sequence state asynchronously
      if (sequenceState) {
        await sequenceState.clearSequenceCompletely();
      }
    } catch (error) {
      console.error(
        "❌ AssemblerTabState: Failed to clear sequence:",
        error
      );
      setError(
        error instanceof Error ? error.message : "Failed to clear sequence"
      );
    }
  }

  // ============================================================================
  // START SCREEN METHODS
  // ============================================================================

  /**
   * Set grid mode (called from start screen)
   */
  function setGridMode(mode: GridMode) {
    gridMode = mode;
  }

  /**
   * Start a new sequence (hides start screen, begins fresh)
   */
  async function startNewSequence() {
    // Save current work as draft before starting new
    if (sequenceState?.hasSequence()) {
      const currentSequence = sequenceState.currentSequence;
      if (currentSequence) {
        createTabDraftsState_instance.saveDraft(
          "assembler",
          currentSequence,
          gridMode
        );
      }
    }

    // Clear current sequence
    await clearSequenceCompletely();

    // Hide start screen
    showStartScreen = false;
  }

  /**
   * Continue from a saved draft
   */
  async function continueDraft(draft: CreateTabDraft) {
    if (!sequenceState) return;

    try {
      // Set grid mode from draft
      gridMode = draft.gridMode;

      // Load draft sequence into state
      sequenceState.setCurrentSequence(draft.sequence);

      // Set start position if available
      const startPos = draft.sequence.startPosition || draft.sequence.startingPositionBeat;
      if (startPos) {
        sequenceState.setSelectedStartPosition(startPos);
      }

      // Hide start screen
      showStartScreen = false;
    } catch (err) {
      console.error("❌ AssemblerTabState: Failed to continue draft:", err);
      setError(err instanceof Error ? err.message : "Failed to load draft");
    }
  }

  /**
   * Delete the current draft
   */
  function deleteDraft() {
    createTabDraftsState_instance.deleteDraft("assembler");
  }

  /**
   * Show start screen (e.g., when sequence is cleared)
   */
  function showStartScreenAgain() {
    showStartScreen = true;
  }

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
    get isInitialized() {
      return isInitialized;
    },
    get isPersistenceInitialized() {
      return isInitialized;
    },
    get hasSequence() {
      return hasSequence;
    },

    // Start screen state
    get showStartScreen() {
      return showStartScreen;
    },
    get gridMode() {
      return gridMode;
    },
    get currentDraft() {
      return currentDraft;
    },

    // Sequence state access
    get sequenceState() {
      return sequenceState;
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
    clearSequenceCompletely,

    // Start screen methods
    setGridMode,
    startNewSequence,
    continueDraft,
    deleteDraft,
    showStartScreenAgain,

    // Initialization
    initializeAssemblerTab,
  };
}

/**
 * Type for AssemblerTabState - the return type of createAssemblerTabState
 */
export type AssemblerTabState = ReturnType<typeof createAssemblerTabState>;
