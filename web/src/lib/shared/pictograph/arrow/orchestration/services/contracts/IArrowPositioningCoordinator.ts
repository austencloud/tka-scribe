/**
 * Arrow Positioning Coordination Service Contract
 *
 * Service for coordinating bulk arrow positioning calculations.
 * Uses the existing ArrowPositioningService for individual arrows.
 */

import type { PictographData } from '../../../shared';

export interface ArrowPositionResult {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
}

export interface ArrowPositioningResult {
  readonly positions: Record<string, ArrowPositionResult>;
  readonly mirroring: Record<string, boolean>;
  readonly showArrows: boolean;
}

export interface IArrowPositioningCoordinator {
  /**
   * Calculate arrow positions for all arrows in the pictograph
   * @param pictographData - The pictograph data containing arrow information
   * @returns Promise resolving to positioning results for all arrows
   */
  calculateAllArrowPositions(pictographData: PictographData | null): Promise<ArrowPositioningResult>;
}