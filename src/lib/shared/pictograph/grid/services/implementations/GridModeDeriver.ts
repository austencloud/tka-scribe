/**
 * GridModeDeriver - Microservice for determining grid mode from motion data
 *
 * CORRECTED LOGIC:
 * - Cardinal locations (N, E, S, W) in start/end positions = DIAMOND mode
 * - Box locations (NE, SE, SW, NW) in start/end positions = BOX mode
 */

import type { IGridModeDeriver } from "../contracts";
import { GridLocation, GridMode } from "../../domain/enums/grid-enums";
import type { GridData } from "../../domain/models/grid-models";
import type { MotionData } from "../../../shared/domain/models/MotionData";
import { injectable } from "inversify";

@injectable()
export class GridModeDeriver implements IGridModeDeriver {
  private readonly cardinalLocations = [
    GridLocation.NORTH,
    GridLocation.EAST,
    GridLocation.SOUTH,
    GridLocation.WEST,
  ];
  private readonly intercardinalLocations = [
    GridLocation.NORTHEAST,
    GridLocation.SOUTHEAST,
    GridLocation.SOUTHWEST,
    GridLocation.NORTHWEST,
  ];

  /**
   * Determine grid mode from motion start/end locations
   *
   * CORRECTED: Cardinal locations = Diamond mode (not the other way around)
   */
  deriveGridMode(blueMotion: MotionData, redMotion: MotionData): GridMode {
    const blueIsDiamond = this.usesDiamondLocations(blueMotion);
    const redIsDiamond = this.usesDiamondLocations(redMotion);

    const blueIsBox = this.usesBoxLocations(blueMotion);
    const redIsBox = this.usesBoxLocations(redMotion);

    const blueIsSkewed = this.isSkewed(blueMotion);
    const redIsSkewed = this.isSkewed(redMotion);

    if (blueIsSkewed || redIsSkewed) {
      return GridMode.SKEWED;
    }

    if (blueIsDiamond && redIsDiamond) {
      return GridMode.DIAMOND;
    } else if (blueIsBox && redIsBox) {
      return GridMode.BOX;
    } else {
      // Fallback if motions don't match expected patterns
      console.warn(
        "GridModeDeriver: Unable to determine grid mode from motions. Defaulting to DIAMOND."
      );
      return GridMode.DIAMOND;
    }
  }

  /**
   * Determine if motion uses cardinal locations
   */
  usesDiamondLocations(motion: MotionData): boolean {
    return (
      this.cardinalLocations.includes(motion.startLocation) &&
      this.cardinalLocations.includes(motion.endLocation)
    );
  }

  /**
   * Determine if motion uses intercardinal locations
   */
  usesBoxLocations(motion: MotionData): boolean {
    return (
      this.intercardinalLocations.includes(motion.startLocation) &&
      this.intercardinalLocations.includes(motion.endLocation)
    );
  }

  /**
   * Determine if motion is skewed (starts in one mode and ends in another)
   */
  isSkewed(motion: MotionData): boolean {
    const startIsCardinal = this.cardinalLocations.includes(
      motion.startLocation
    );
    const endIsCardinal = this.cardinalLocations.includes(motion.endLocation);
    const startIsBox = this.intercardinalLocations.includes(
      motion.startLocation
    );
    const endIsBox = this.intercardinalLocations.includes(motion.endLocation);

    return (startIsCardinal && endIsBox) || (startIsBox && endIsCardinal);
  }

  /**
   * Compute complete GridData from motion data
   * Uses existing deriveGridMode logic and creates GridData with default positioning
   */
  computeGridData(blueMotion: MotionData, redMotion: MotionData): GridData {
    const gridMode = this.deriveGridMode(blueMotion, redMotion);
    // Create basic GridData - simplified since we don't have createGridData function
    const gridData: GridData = {
      gridMode,
      // Add other required GridData properties as needed based on the actual interface
    } as GridData;
    return gridData;
  }
}
