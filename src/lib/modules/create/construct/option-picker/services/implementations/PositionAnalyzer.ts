/**
 * Position Analyzer Implementation
 *
 * Handles analysis of position data for end position calculations and grouping.
 * Extracted from OptionPickerService for better separation of concerns.
 */

import type { PictographData } from "$shared/pictograph/shared/domain/models/PictographData";
import { GridPositionGroup } from "$shared/pictograph/grid/domain/enums/grid-enums";
import { GridPosition } from "$shared/pictograph/grid/domain/enums/grid-enums";
import { TYPES } from "$shared/inversify/types";
import { inject, injectable } from "inversify";
import type { IPositionAnalyzer } from "../contracts/IPositionAnalyzer";
import type { IGridPositionDeriver } from "$shared/pictograph/grid/services/contracts/IGridPositionDeriver";

@injectable()
export class PositionAnalyzer implements IPositionAnalyzer {
  constructor(
    @inject(TYPES.IGridPositionDeriver) private positionMapper: IGridPositionDeriver
  ) {}

  /**
   * Get the position group (Alpha, Beta, Gamma) from a GridPosition
   */
  getEndPositionGroup(
    endPosition: GridPosition | null | undefined
  ): GridPositionGroup | null {
    if (!endPosition) return null;

    const positionStr = endPosition.toString();

    if (positionStr.startsWith("alpha")) return GridPositionGroup.ALPHA;
    if (positionStr.startsWith("beta")) return GridPositionGroup.BETA;
    if (positionStr.startsWith("gamma")) return GridPositionGroup.GAMMA;

    return null;
  }

  /**
   * Calculate end position from motion data
   * PRESERVED: Core position calculation logic
   */
  getEndPosition(pictographData: PictographData): string | null {
    if (!pictographData.motions.blue || !pictographData.motions.red) {
      return null;
    }

    try {
      const endPosition = this.positionMapper.getGridPositionFromLocations(
        pictographData.motions.blue.endLocation,
        pictographData.motions.red.endLocation
      );

      return endPosition.toString();
    } catch (error) {
      console.error("Error calculating end position:", error);
      return null;
    }
  }
}
