/**
 * Generator Tab State - Sub-tab State
 *
 * Manages state specific to the Generator sub-tab functionality.
 * Handles CAP (Circular Auto-Pattern) generation and generator-specific UI state.
 *
 * ✅ All generator-specific runes ($state, $derived, $effect) live here
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

/**
 * Creates generator tab state for generator-specific concerns
 *
 * @param sequenceService - Injected sequence service for business logic
 * @param sequencePersistenceService - Optional persistence service for state survival
 * @param sequenceStatisticsService - Optional statistics service for sequence analysis
 * @param sequenceTransformationService - Optional transformation service for sequence operations
 * @param sequenceValidationService - Optional validation service for sequence validation
 * @returns Reactive state object with getters and state mutations
 */
export function createGeneratorTabState(
  sequenceService?: ISequenceService,
  sequencePersistenceService?: ISequencePersistenceService,
  sequenceStatisticsService?: ISequenceStatisticsService,
  sequenceTransformationService?: ISequenceTransformationService,
  sequenceValidationService?: ISequenceValidationService
) {
  // ============================================================================
  // REACTIVE STATE (Generator-specific)
  // ============================================================================

  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let isTransitioning = $state(false);
  let isInitialized = $state(false);

  // Generator tab has its own independent sequence state
  // IMPORTANT: Pass tabId="generator" to ensure persistence loads/saves only generator's data
  const sequenceState: SequenceState | null = sequenceService
    ? createSequenceState({
        sequenceService,
        ...(sequencePersistenceService && { sequencePersistenceService }),
        ...(sequenceStatisticsService && { sequenceStatisticsService }),
        ...(sequenceTransformationService && { sequenceTransformationService }),
        ...(sequenceValidationService && { sequenceValidationService }),
        tabId: "generator", // Persistence isolation - only load/save generator's data
      })
    : null;

  // Generator tab has its own independent undo controller
  const undoService = resolve<IUndoService>(TYPES.IUndoService);
  const undoController = sequenceState
    ? createUndoController({
        undoService,
        sequenceState,
        getActiveSection: () => "generator",
        setActiveSectionInternal: async (panel, addToHistory) => {
          // Generator tab doesn't need to change active section since it's always generator
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

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize generator tab - called from component onMount
   */
  async function initializeGeneratorTab() {
    if (!sequenceState) {
      console.warn(
        "⚠️ GeneratorTabState: No sequence service provided, skipping sequence state initialization"
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
      console.error("❌ GeneratorTabState: Failed to initialize:", error);
      setError(error instanceof Error ? error.message : "Failed to initialize");
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
      console.error("❌ GeneratorTabState: Failed to clear sequence:", error);
      setError(
        error instanceof Error ? error.message : "Failed to clear sequence"
      );
    }
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

    // Initialization
    initializeGeneratorTab,
  };
}

/**
 * Type for GeneratorTabState - the return type of createGeneratorTabState
 */
export type GeneratorTabState = ReturnType<typeof createGeneratorTabState>;
