/**
 * Build Tab State - Master Tab State
 *
 * Manages shared state for the Build tab (master tab).
 * Handles concerns that are shared across all sub-tabs (Construct, Generate, Edit, Export).
 *
 * ✅ All runes ($state, $derived, $effect) live here
 * ✅ Pure reactive wrappers - no business logic
 * ✅ Services injected via parameters
 * ✅ Component-scoped state (not global singleton)
 */

// Import required state factories
import type { ActiveBuildTab } from "$shared";
import type { ISequencePersistenceService, ISequenceService, ISequenceStateService } from "../services/contracts";
import { createSequenceState } from "./sequence-state.svelte";

/**
 * Creates master build tab state for shared concerns
 *
 * @param sequenceService - Injected sequence service
 * @param sequenceStateService - Injected sequence state service
 * @param sequencePersistenceService - Injected persistence service
 * @returns Reactive state object with getters and state mutations
 */
export function createBuildTabState(
  sequenceService: ISequenceService,
  sequenceStateService: ISequenceStateService,
  sequencePersistenceService?: ISequencePersistenceService
) {
  // ============================================================================
  // REACTIVE STATE
  // ============================================================================

  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let isTransitioningSubTab = $state(false);
  let activeSubTab = $state<ActiveBuildTab | null>(null); // Start with null to prevent flicker during restoration
  let isPersistenceInitialized = $state(false); // Track if persistence has been loaded

  // Shared sub-states
  const sequenceState = createSequenceState({
    sequenceService,
    sequenceStateService,
    sequencePersistenceService
  });

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const hasError = $derived(error !== null);
  const hasSequence = $derived(sequenceState.currentSequence !== null);
  const isSubTabLoading = $derived(activeSubTab === null); // Loading state detection like main navigation

  // ============================================================================
  // STATE MUTATIONS
  // ============================================================================

  function setLoading(loading: boolean) {
    isLoading = loading;
  }

  function setTransitioningSubTab(transitioning: boolean) {
    isTransitioningSubTab = transitioning;
  }

  function setError(errorMessage: string | null) {
    error = errorMessage;
  }

  function clearError() {
    error = null;
  }

  function setActiveRightPanel(panel: ActiveBuildTab) {
    activeSubTab = panel;
    // Save the active tab to persistence
    saveCurrentState();
  }

  // ============================================================================
  // PERSISTENCE FUNCTIONS
  // ============================================================================

  async function initializeWithPersistence(): Promise<void> {
    try {
      // Initialize sequence state first
      await sequenceState.initializeWithPersistence();

      // Load saved build tab state using the sequence persistence service
      if (sequencePersistenceService) {
        const savedState = await sequencePersistenceService.loadCurrentState();
        if (savedState?.activeBuildSubTab) {
          activeSubTab = savedState.activeBuildSubTab;
        } else {
          // Set default tab when no saved state is found
          activeSubTab = "construct";
        }
      } else {
        // Set default tab when no persistence service is available
        activeSubTab = "construct";
      }

      isPersistenceInitialized = true;
      console.log("✅ BuildTabState: Persistence initialized");
    } catch (error) {
      console.error("❌ BuildTabState: Failed to initialize persistence:", error);
      isPersistenceInitialized = true; // Still mark as initialized to prevent blocking
    }
  }

  async function saveCurrentState(): Promise<void> {
    if (!isPersistenceInitialized) return;

    try {
      if (activeSubTab) {
        await sequenceState.saveCurrentState(activeSubTab);
      }
    } catch (error) {
      console.error("❌ BuildTabState: Failed to save current state:", error);
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
      return isTransitioningSubTab;
    },
    get hasError() {
      return hasError;
    },
    get hasSequence() {
      return hasSequence;
    },
    get activeSubTab() {
      return activeSubTab;
    },
    get isPersistenceInitialized() {
      return isPersistenceInitialized;
    },
    get isSubTabLoading() {
      return isSubTabLoading;
    },

    // Sub-states
    get sequenceState() {
      return sequenceState;
    },

    // State mutations
    setLoading,
    setTransitioning: setTransitioningSubTab,
    setError,
    clearError,
    setActiveRightPanel,

    // Persistence functions
    initializeWithPersistence,
    saveCurrentState,
  };
}
