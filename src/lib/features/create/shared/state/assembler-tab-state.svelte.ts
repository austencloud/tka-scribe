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

  // Assembler tab has its own independent sequence state
  const sequenceState: SequenceState | null = sequenceService
    ? createSequenceState({
        sequenceService,
        ...(sequencePersistenceService && { sequencePersistenceService }),
        ...(sequenceStatisticsService && { sequenceStatisticsService }),
        ...(sequenceTransformationService && { sequenceTransformationService }),
        ...(sequenceValidationService && { sequenceValidationService }),
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

    // State mutations
    setLoading,
    setTransitioning,
    setError,
    clearError,
    clearSequenceCompletely,

    // Initialization
    initializeAssemblerTab,
  };
}

/**
 * Type for AssemblerTabState - the return type of createAssemblerTabState
 */
export type AssemblerTabState = ReturnType<typeof createAssemblerTabState>;
