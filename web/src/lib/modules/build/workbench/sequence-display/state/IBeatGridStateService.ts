/**
 * Beat Grid State Service Interface
 *
 * Service contract for managing beat grid interaction state.
 * One-to-one mapping with BeatGridStateService implementation.
 */

/**
 * Service for managing beat grid interaction state (hover, drag, selection)
 */
export interface IBeatGridStateService {
  // Hover state
  getHoveredBeatIndex(): number;
  setHoveredBeatIndex(index: number): void;
  clearHover(): void;

  // Drag state
  getDraggedBeatIndex(): number;
  setDraggedBeatIndex(index: number): void;
  clearDrag(): void;

  // Selection helpers
  isHovered(index: number): boolean;
  isDragged(index: number): boolean;
}
