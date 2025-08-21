/**
 * StartPositionState.svelte.ts
 *
 * Runes-based state management for start position picker.
 * Follows TKA architecture by separating reactive state from business logic.
 */

import type { PictographData } from "$domain/PictographData";
import type { IStartPositionService } from "$services/interfaces/application-interfaces";
import { GridMode } from "$lib/domain";

/**
 * State interface for start position picker
 */
export interface StartPositionState {
  // Data state (direct access for Svelte 5 runes)
  startPositionPictographs: PictographData[];
  selectedStartPos: PictographData | null;

  // Loading state
  isLoading: boolean;
  loadingError: boolean;
  isTransitioning: boolean;

  // Actions
  setStartPositionPictographs: (pictographs: PictographData[]) => void;
  setSelectedStartPos: (pictograph: PictographData | null) => void;
  setLoading: (loading: boolean) => void;
  setLoadingError: (error: boolean) => void;
  setTransitioning: (transitioning: boolean) => void;
  reset: () => void;
}

/**
 * Create start position state using Svelte 5 runes
 */
export function createStartPositionState(): StartPositionState {
  // Reactive state using runes
  let startPositionPictographs = $state<PictographData[]>([]);
  let selectedStartPos = $state<PictographData | null>(null);
  let isLoading = $state(true);
  let loadingError = $state(false);
  let isTransitioning = $state(false);

  return {
    // Direct access to reactive state (no getters for Svelte 5 runes)
    startPositionPictographs,
    selectedStartPos,
    isLoading,
    loadingError,
    isTransitioning,

    // Actions to update state
    setStartPositionPictographs: (pictographs: PictographData[]) => {
      startPositionPictographs = pictographs;
    },

    setSelectedStartPos: (pictograph: PictographData | null) => {
      selectedStartPos = pictograph;
    },

    setLoading: (loading: boolean) => {
      console.log(
        `🔧 setLoading called with: ${loading}, current isLoading: ${isLoading}`
      );
      isLoading = loading;
      console.log(`🔧 setLoading after update, isLoading: ${isLoading}`);
    },

    setLoadingError: (error: boolean) => {
      loadingError = error;
    },

    setTransitioning: (transitioning: boolean) => {
      isTransitioning = transitioning;
    },

    reset: () => {
      startPositionPictographs = [];
      selectedStartPos = null;
      isLoading = true;
      loadingError = false;
      isTransitioning = false;
    },
  };
}

/**
 * Global state instance to prevent recreation
 */
let globalStartPositionState: StartPositionState | null = null;

/**
 * State management service that combines state with service operations
 */
export function createStartPositionStateService(
  startPositionService: IStartPositionService
) {
  // Use existing global state or create new one
  if (!globalStartPositionState) {
    globalStartPositionState = createStartPositionState();
  }
  const state = globalStartPositionState;

  /**
   * Load start positions for the given grid mode
   */
  async function loadStartPositions(gridMode: GridMode.DIAMOND | GridMode.BOX) {
    console.log(
      "StartPositionStateService: Starting to load start positions, gridMode:",
      gridMode
    );
    state.setLoading(true);
    state.setLoadingError(false);

    try {
      console.log(
        "StartPositionStateService: Calling startPositionService.getDefaultStartPositions..."
      );
      const startPositions =
        await startPositionService.getDefaultStartPositions(gridMode);
      console.log(
        "StartPositionStateService: Received start positions:",
        startPositions?.length || 0
      );
      state.setStartPositionPictographs(startPositions);
      console.log("StartPositionStateService: Set start positions in state");
    } catch (error) {
      console.error(
        "❌ StartPositionStateService: Error loading start positions:",
        error
      );
      state.setLoadingError(true);
      state.setStartPositionPictographs([]);
    } finally {
      console.log("StartPositionStateService: Setting loading to false");
      state.setLoading(false);
      console.log(
        "StartPositionStateService: Loading complete, isLoading:",
        state.isLoading
      );
    }
  }

  return {
    ...state,
    loadStartPositions,
  };
}
