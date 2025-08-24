/**
 * GridModeDerivationService - Simple service for determining grid mode from motion data
 */

import { GridMode, Location } from "../../../domain/enums";
import { createGridData } from "../../../domain/GridData";
import type { MotionData } from "../../../domain/MotionData";
import type { IGridModeDerivationService } from "../../interfaces/movement/IGridModeDerivationService";

export class GridModeDerivationService implements IGridModeDerivationService {
  private readonly cardinalLocations = [
    Location.NORTH,
    Location.EAST,
    Location.SOUTH,
    Location.WEST,
  ];
  
  private readonly intercardinalLocations = [
    Location.NORTHEAST,
    Location.SOUTHEAST,
    Location.SOUTHWEST,
    Location.NORTHWEST,
  ];

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
      console.warn("GridModeDerivationService: Unable to determine grid mode from motions. Defaulting to DIAMOND.");
      return GridMode.DIAMOND;
    }
  }

  usesDiamondLocations(motion: MotionData): boolean {
    return (
      this.cardinalLocations.includes(motion.startLocation) &&
      this.cardinalLocations.includes(motion.endLocation)
    );
  }

  usesBoxLocations(motion: MotionData): boolean {
    return (
      this.intercardinalLocations.includes(motion.startLocation) &&
      this.intercardinalLocations.includes(motion.endLocation)
    );
  }

  private isSkewed(motion: MotionData): boolean {
    const startIsCardinal = this.cardinalLocations.includes(motion.startLocation);
    const endIsCardinal = this.cardinalLocations.includes(motion.endLocation);
    const startIsBox = this.intercardinalLocations.includes(motion.startLocation);
    const endIsBox = this.intercardinalLocations.includes(motion.endLocation);
    return (startIsCardinal && endIsBox) || (startIsBox && endIsCardinal);
  }

  computeGridData(blueMotion: MotionData, redMotion: MotionData) {
    const gridMode = this.deriveGridMode(blueMotion, redMotion);
    return createGridData({
      gridMode,
      centerX: 0.0,
      centerY: 0.0,
      radius: 100.0,
    });
  }
}
