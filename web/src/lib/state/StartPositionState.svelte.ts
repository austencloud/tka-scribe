/**
 * StartPositionState.svelte.ts
 *
 * Runes-based state management for start position picker.
 * Follows TKA architecture by separating reactive state from business logic.
 */

import type { PictographData } from "$domain/PictographData";
import type { IStartPositionService } from "$services/interfaces/application-interfaces";

/**
 * State interface for start position picker
 */
export interface StartPositionState {
  // Data state
  readonly startPositionPictographs: PictographData[];
  readonly selectedStartPos: PictographData | null;

  // Loading state
  readonly isLoading: boolean;
  readonly loadingError: boolean;
  readonly isTransitioning: boolean;

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
    // Getters for reactive state
    get startPositionPictographs() {
      return startPositionPictographs;
    },

    get selectedStartPos() {
      return selectedStartPos;
    },

    get isLoading() {
      return isLoading;
    },

    get loadingError() {
      return loadingError;
    },

    get isTransitioning() {
      return isTransitioning;
    },

    // Actions to update state
    setStartPositionPictographs: (pictographs: PictographData[]) => {
      startPositionPictographs = pictographs;
    },

    setSelectedStartPos: (pictograph: PictographData | null) => {
      selectedStartPos = pictograph;
    },

    setLoading: (loading: boolean) => {
      isLoading = loading;
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
 * State management service that combines state with service operations
 */
export function createStartPositionStateService(
  startPositionService: IStartPositionService
) {
  const state = createStartPositionState();

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
