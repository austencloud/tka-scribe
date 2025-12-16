/**
 * Beat Grid State Factory
 *
 * Reactive state wrapper around the pure BeatGridService.
 * Follows the established TKA state factory pattern.
 */

import type { BeatData, BeatGridConfig, ContainerDimensions } from "$shared";
import type { IBeatGridService } from "../services/contracts";

/**
 * Creates component-scoped beat grid state
 *
 * @param beatGridService - Injected via DI container
 * @returns Reactive state object with getters and actions
 */
export function createBeatGridState(beatGridService: IBeatGridService) {
  // ============================================================================
  // REACTIVE STATE (Component-scoped)
  // ============================================================================

  let config = $state<BeatGridConfig>(beatGridService.getDefaultConfig());
  let containerDimensions = $state<ContainerDimensions>({
    width: 0,
    height: 0,
    isFullscreen: false,
  });

  // Interaction state
  let hoveredBeatIndex = $state<number>(-1);
  let draggedBeatIndex = $state<number>(-1);

  // ============================================================================
  // DERIVED STATE (Reactive computations)
  // ============================================================================

  const layoutInfo = $derived(() => {
    // This will reactively update when config or containerDimensions change
    return beatGridService.calculateLayoutInfo(0, config, containerDimensions);
  });

  // ============================================================================
  // GETTERS (Reactive access to state)
  // ============================================================================

  return {
    // Configuration getters
    get config() {
      return config;
    },

    get containerDimensions() {
      return containerDimensions;
    },

    // Interaction state getters
    get hoveredBeatIndex() {
      return hoveredBeatIndex;
    },

    get draggedBeatIndex() {
      return draggedBeatIndex;
    },

    // Derived state getters
    get layoutInfo() {
      return layoutInfo;
    },

    // ============================================================================
    // ACTIONS (State mutations and service calls)
    // ============================================================================

    // Configuration actions
    setConfig(updates: Partial<BeatGridConfig>) {
      config = beatGridService.validateConfig({ ...config, ...updates });
    },

    resetConfig() {
      config = beatGridService.getDefaultConfig();
    },

    // Container dimension actions
    updateContainerDimensions(dimensions: Partial<ContainerDimensions>) {
      containerDimensions = { ...containerDimensions, ...dimensions };
    },

    // Interaction actions
    setHoveredBeatIndex(index: number) {
      hoveredBeatIndex = index;
    },

    clearHover() {
      hoveredBeatIndex = -1;
    },

    setDraggedBeatIndex(index: number) {
      draggedBeatIndex = index;
    },

    clearDrag() {
      draggedBeatIndex = -1;
    },

    // ============================================================================
    // SERVICE DELEGATION (Pure business logic calls)
    // ============================================================================

    // Layout calculation methods (delegated to service)
    calculateBeatPosition(index: number, beatCount?: number) {
      return beatGridService.calculateBeatPosition(index, beatCount, config);
    },

    calculateStartPosition(beatCount: number) {
      return beatGridService.calculateStartPosition(beatCount, config);
    },

    calculateFrameDimensions(beatCount: number) {
      return beatGridService.calculateFrameDimensions(beatCount, config);
    },

    calculateLayoutInfo(beatCount: number) {
      return beatGridService.calculateLayoutInfo(
        beatCount,
        config,
        containerDimensions
      );
    },

    // Beat interaction helpers (delegated to service)
    getBeatAtPosition(x: number, y: number, beatCount: number) {
      return beatGridService.getBeatAtPosition(x, y, beatCount, config);
    },

    isBeatVisible(beat: BeatData) {
      return beatGridService.isBeatVisible(beat);
    },

    getBeatDisplayText(beat: BeatData) {
      return beatGridService.getBeatDisplayText(beat);
    },

    // Layout optimization methods (delegated to service)
    autoAdjustLayout(beatCount: number) {
      return beatGridService.autoAdjustLayout(beatCount);
    },

    // ============================================================================
    // CONVENIENCE METHODS
    // ============================================================================

    // Check interaction state
    isHovered(index: number) {
      return hoveredBeatIndex === index;
    },

    isDragged(index: number) {
      return draggedBeatIndex === index;
    },

    // Update beat size based on container (reactive effect trigger)
    updateBeatSizeFromContainer(beatCount = 0) {
      if (containerDimensions.width <= 0 || containerDimensions.height <= 0) {
        return; // Wait for valid dimensions
      }

      const [rows, cols] = beatGridService.autoAdjustLayout(beatCount);
      const totalCols = cols + (config.hasStartTile ? 1 : 0);

      const newCellSize = beatGridService.calculateCellSize(
        beatCount,
        containerDimensions.width,
        containerDimensions.height,
        rows,
        totalCols,
        config.gap
      );

      // Update configuration with new size and layout
      config = {
        ...config,
        beatSize: newCellSize,
        columns: cols,
      };
    },
  };
}

/**
 * Type definition for the beat grid state
 */
export type BeatGridState = ReturnType<typeof createBeatGridState>;
