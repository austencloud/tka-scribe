/**
 * Simplified Start Position State
 * 
 * Based on the working legacy implementation - simple and effective.
 * No over-engineering, just the core functionality needed.
 */

import { GridMode, resolve, TYPES, type PictographData } from "$shared";
import type { StartPositionState } from "../domain/start-position-picker-types";
import type { IStartPositionService } from "../services/contracts";

export function createSimplifiedStartPositionState() {
  // Get the service
  const startPositionService = resolve(TYPES.IStartPositionService) as IStartPositionService;
  
  // Simple reactive state - just what we need
  let positions = $state<PictographData[]>([]);
  let selectedPosition = $state<PictographData | null>(null);
  let currentState = $state<StartPositionState>('loading');
  let error = $state<string | null>(null);
  
  // Computed values
  const isLoading = $derived(currentState === 'loading');
  const hasError = $derived(currentState === 'error');
  const isReady = $derived(currentState === 'ready');
  
  // Load positions on initialization
  async function loadPositions() {
    try {
      currentState = 'loading';
      error = null;
      
      // Use diamond mode by default (like legacy)
      const loadedPositions = await startPositionService.getStartPositions(GridMode.DIAMOND);
      
      positions = loadedPositions;
      currentState = 'ready';
      
    } catch (err) {
      console.error("Error loading start positions:", err);
      error = err instanceof Error ? err.message : "Failed to load start positions";
      currentState = 'error';
    }
  }
  
  // Select a position
  async function selectPosition(position: PictographData) {
    try {
      await startPositionService.selectStartPosition(position);
      selectedPosition = position;
    } catch (err) {
      console.error("Error selecting start position:", err);
      error = err instanceof Error ? err.message : "Failed to select start position";
      currentState = 'error';
    }
  }
  
  // Clear error
  function clearError() {
    error = null;
    currentState = 'ready';
  }
  
  // Initialize on creation
  loadPositions();
  
  return {
    // State
    get positions() { return positions; },
    get selectedPosition() { return selectedPosition; },
    get currentState() { return currentState; },
    get error() { return error; },
    
    // Computed
    get isLoading() { return isLoading; },
    get hasError() { return hasError; },
    get isReady() { return isReady; },
    
    // Actions
    selectPosition,
    clearError,
    reload: loadPositions
  };
}

export type SimplifiedStartPositionState = ReturnType<typeof createSimplifiedStartPositionState>;
