/**
 * Position Analysis Service Contract
 *
 * Handles analysis of position data for end position calculations and grouping.
 * Extracted from OptionPickerService for better separation of concerns.
 */

import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import { GridPositionGroup, GridPosition } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

export interface IPositionAnalyzer {
  /**
   * Get the position group (Alpha, Beta, Gamma) from a GridPosition
   */
  getEndPositionGroup(
    endPosition: GridPosition | null | undefined
  ): GridPositionGroup | null;

  /**
   * Calculate end position from motion data
   */
  getEndPosition(pictographData: PictographData): string | null;
}
