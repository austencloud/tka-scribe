/**
 * ConstructTab State Factory - Component-Scoped State for Svelte 5 Runes
 *
 * Creates component-scoped state management for ConstructTab component.
 * Takes sequence state as dependency instead of importing global state.
 */

import type { SequenceData } from "$lib/domain";

export type ActiveRightPanel = "build" | "generate" | "edit" | "export";
export type GridMode = "diamond" | "box";

// Type for sequence state dependency
interface SequenceStateType {
  currentSequence: SequenceData | null;
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createConstructTabState(sequenceState: SequenceStateType) {
  // ============================================================================
  // COMPONENT-SCOPED STATE
  // ============================================================================

  const state = $state({
    // Main tab state
    activeRightPanel: "build" as ActiveRightPanel,
    gridMode: "diamond" as GridMode,

    // Transition and loading states
    isTransitioning: false,
    isSubTabTransitionActive: false,
    currentSubTabTransition: null as string | null,

    // Error handling
    errorMessage: null as string | null,

    // Build tab conditional logic
    shouldShowStartPositionPicker: true,
  });

  // ============================================================================
  // STATE MANAGEMENT FUNCTIONS
  // ============================================================================

  // Method to update shouldShowStartPositionPicker - called from components
  function updateShouldShowStartPositionPicker() {
    const sequence = sequenceState.currentSequence;

    // Show start position picker if:
    // 1. No sequence exists, OR
    // 2. Sequence exists but has no start position set
    // FIXED: Check the start_position field directly instead of complex logic
    const shouldShow = !sequence || !sequence.start_position;

    // Only log if the value actually changes to reduce noise
    if (state.shouldShowStartPositionPicker !== shouldShow) {
      console.log(
        `🎯 Start position picker: ${shouldShow ? "show" : "hide"} (sequence exists: ${!!sequence}, has start_position: ${!!sequence?.start_position}, beats: ${sequence?.beats?.length || 0})`
      );
    }

    state.shouldShowStartPositionPicker = shouldShow;
  }

  // State management functions
  function setActiveRightPanel(panel: ActiveRightPanel) {
    state.activeRightPanel = panel;
  }

  function setGridMode(mode: GridMode) {
    state.gridMode = mode;
  }

  function setTransitioning(isTransitioning: boolean) {
    state.isTransitioning = isTransitioning;
  }

  function setSubTabTransition(
    isActive: boolean,
    transitionId: string | null = null
  ) {
    state.isSubTabTransitionActive = isActive;
    state.currentSubTabTransition = transitionId;
  }

  function setError(message: string | null) {
    state.errorMessage = message;
  }

  function clearError() {
    state.errorMessage = null;
  }

  // ============================================================================
  // DERIVED STATE GETTERS
  // ============================================================================

  function getCurrentSequence() {
    return sequenceState.currentSequence;
  }

  function getHasError() {
    return state.errorMessage !== null;
  }

  function getIsInBuildMode() {
    return state.activeRightPanel === "build";
  }

  function getIsInGenerateMode() {
    return state.activeRightPanel === "generate";
  }

  function getIsInEditMode() {
    return state.activeRightPanel === "edit";
  }

  function getIsInExportMode() {
    return state.activeRightPanel === "export";
  }

  // Initialize shouldShowStartPositionPicker based on current sequence
  try {
    updateShouldShowStartPositionPicker();
  } catch (error) {
    // Ignore errors during testing when mocks aren't ready
    console.warn("Failed to initialize shouldShowStartPositionPicker:", error);
  }

  // ============================================================================
  // RETURN STATE OBJECT
  // ============================================================================

  return {
    // State access (reactive)
    get activeRightPanel() {
      return state.activeRightPanel;
    },
    get gridMode() {
      return state.gridMode;
    },
    get isTransitioning() {
      return state.isTransitioning;
    },
    get isSubTabTransitionActive() {
      return state.isSubTabTransitionActive;
    },
    get currentSubTabTransition() {
      return state.currentSubTabTransition;
    },
    get errorMessage() {
      return state.errorMessage;
    },
    get shouldShowStartPositionPicker() {
      return state.shouldShowStartPositionPicker;
    },

    // Actions
    updateShouldShowStartPositionPicker,
    setActiveRightPanel,
    setGridMode,
    setTransitioning,
    setSubTabTransition,
    setError,
    clearError,

    // Getters
    getCurrentSequence,
    getHasError,
    getIsInBuildMode,
    getIsInGenerateMode,
    getIsInEditMode,
    getIsInExportMode,
  };
}
