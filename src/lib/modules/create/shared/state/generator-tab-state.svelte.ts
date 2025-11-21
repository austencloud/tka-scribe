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

import type {
  ISequenceService,
  ISequencePersistenceService,
} from "../services/contracts";
import { createSequenceState } from "./SequenceStateOrchestrator.svelte";
import type { SequenceState } from "./SequenceStateOrchestrator.svelte";

/**
 * Creates generator tab state for generator-specific concerns
 *
 * @param sequenceService - Injected sequence service for business logic
 * @param sequencePersistenceService - Optional persistence service for state survival
 * @returns Reactive state object with getters and state mutations
 */
export function createGeneratorTabState(
  sequenceService?: ISequenceService,
  sequencePersistenceService?: ISequencePersistenceService
) {
  // ============================================================================
  // REACTIVE STATE (Generator-specific)
  // ============================================================================

  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let isTransitioning = $state(false);
  let isInitialized = $state(false);

  // Generator tab has its own independent sequence state
  const sequenceState: SequenceState | null = sequenceService
    ? createSequenceState({
        sequenceService,
        ...(sequencePersistenceService && { sequencePersistenceService }),
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
