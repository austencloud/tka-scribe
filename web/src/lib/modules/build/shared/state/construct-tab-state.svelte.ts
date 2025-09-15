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

import type { PictographData } from "../../../../shared";
import { createSimplifiedStartPositionState } from "../../construct/start-position-picker/state/start-position-state.svelte";
import type { BeatData } from "../domain/models/BeatData";
import type { IBuildTabService, ISequencePersistenceService } from "../services/contracts";

/**
 * Creates construct tab state for construct-specific concerns
 *
 * @param buildTabService - Injected build tab service for business logic
 * @param sequenceState - Sequence state for updating workbench
 * @param sequencePersistenceService - Persistence service for state survival
 * @returns Reactive state object with getters and state mutations
 */
export function createConstructTabState(
  buildTabService: IBuildTabService,
  sequenceState?: any, // TODO: Type this properly
  sequencePersistenceService?: ISequencePersistenceService
) {
  // ============================================================================
  // REACTIVE STATE (Construct-specific)
  // ============================================================================

  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let isTransitioning = $state(false);
  let showStartPositionPicker = $state<boolean | null>(null); // Start with null to prevent flicker during restoration
  let selectedStartPosition = $state<PictographData | null>(null);
  let isInitialized = $state(false); // Track initialization state to prevent flicker

  // Sub-states (construct-specific)
  // Start position state service using proper simplified state
  const startPositionStateService = createSimplifiedStartPositionState();

  // Set up event listener for start position selection using effect
  $effect(() => {
    if (typeof window !== "undefined") {
      const handleStartPositionSelected = async (event: CustomEvent) => {
        setShowStartPositionPicker(false);

        const pictographData = event.detail.startPosition;
        setSelectedStartPosition(pictographData || null);

        // Also update the sequence state for persistence
        if (sequenceState) {
          sequenceState.setSelectedStartPosition(pictographData || null);
        }

        // Update the workbench with the start position
        // Extract data from event

        if (pictographData && sequenceState) {
          console.log("🔧 ConstructTabState: Creating new sequence with start position");

          // Convert PictographData to BeatData format (same as BuildTabService.selectStartPosition)
          const beatData: BeatData = {
            id: `beat-${Date.now()}`,
            beatNumber: 0,
            pictographData: pictographData,
            duration: 1000,
            blueReversal: false,
            redReversal: false,
            isBlank: false,
          };

          // Create a new sequence first (following ConstructCoordinator pattern)
          try {
            const newSequence = await sequenceState.createSequence({
              name: `Sequence ${new Date().toLocaleTimeString()}`,
              length: 0 // Start with 0 beats - beats will be added progressively
            });

            if (newSequence) {
              // Set the current sequence
              sequenceState.setCurrentSequence(newSequence);

              // Set the start position
              try {
                sequenceState.setStartPosition(beatData);
              } catch (error) {
                console.error("❌ ConstructTabState: Error setting start position:", error);
              }
            } else {
              console.error("❌ ConstructTabState: Failed to create new sequence");
            }
          } catch (error) {
            console.error("❌ ConstructTabState: Error creating sequence:", error);
          }
        } else {
          console.error("❌ ConstructTabState: Cannot create sequence - missing pictographData or sequenceState");
        }
      };

      window.addEventListener("start-position-selected", handleStartPositionSelected as unknown as EventListener);

      // Cleanup function
      return () => {
        window.removeEventListener("start-position-selected", handleStartPositionSelected as unknown as EventListener);
      };
    }
  });

  // ============================================================================
  // DERIVED STATE (Construct-specific derived state)
  // ============================================================================

  const hasError = $derived(error !== null);
  const canSelectOptions = $derived(selectedStartPosition !== null);
  const shouldShowStartPositionPicker = $derived(() => {
    // Don't return any state until initialization is complete
    if (!isInitialized) return null;
    return showStartPositionPicker;
  });
  const isPickerStateLoading = $derived(!isInitialized || showStartPositionPicker === null); // Loading state detection like main navigation

  // ============================================================================
  // EFFECTS (Construct-specific effects)
  // ============================================================================

  // Load start positions when construct tab is initialized - using onMount to prevent infinite loops
  let startPositionsLoaded = $state(false);
  let coordinationSetup = $state(false);

  // Initialize construct tab - called from component onMount
  async function initializeConstructTab() {
    if (!startPositionsLoaded) {
      startPositionStateService.reload();
      startPositionsLoaded = true;
    }

    if (!coordinationSetup) {
      buildTabService.initialize();
      coordinationSetup = true;
    }

    // Initialize persistence and restore state if available
    if (sequencePersistenceService && sequenceState) {
      try {
        await sequenceState.initializeWithPersistence();

        // Check if we have a persisted state that should affect UI
        const savedState = await sequencePersistenceService.loadCurrentState();
        if (savedState && savedState.hasStartPosition) {
          setShowStartPositionPicker(false);
          setSelectedStartPosition(savedState.selectedStartPosition);
        } else {
          // No saved state, set default to show start position picker
          setShowStartPositionPicker(true);
        }
      } catch (error) {
        console.error("❌ ConstructTabState: Failed to restore persisted state:", error);
        // On error, default to showing start position picker
        setShowStartPositionPicker(true);
      }
    } else {
      // No persistence service, default to showing start position picker
      setShowStartPositionPicker(true);
    }

    // Mark as initialized after all setup is complete
    isInitialized = true;
    console.log("✅ ConstructTabState: Initialization complete");
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

  async function clearSequenceCompletely() {
    try {
      // Clear sequence state
      if (sequenceState) {
        await sequenceState.clearSequenceCompletely();
      }

      // Reset construct tab UI state
      setShowStartPositionPicker(true);
      setSelectedStartPosition(null);
      clearError();

      console.log("✅ ConstructTabState: Sequence cleared completely");
    } catch (error) {
      console.error("❌ ConstructTabState: Failed to clear sequence:", error);
      setError(error instanceof Error ? error.message : "Failed to clear sequence");
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
    get selectedStartPosition() {
      return selectedStartPosition;
    },
    // CONSOLIDATION: Direct access to sequence state - no duplicate data management
    get sequenceState() {
      return sequenceState;
    },

    // Sub-states
    get startPositionStateService() {
      return startPositionStateService;
    },

    // State mutations
    setLoading,
    setTransitioning,
    setError,
    clearError,
    setShowStartPositionPicker,
    setSelectedStartPosition,
    clearSequenceCompletely,

    // Initialization
    initializeConstructTab,
  };
}

// Import required state factories

