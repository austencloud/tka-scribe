/**
 * Shift Location Calculator
 *
 * Handles location calculation for pro, anti, and float motions.
 * Based on the legacy desktop ShiftLocationCalculator.
 */

import { GridLocation, type MotionData } from "$shared";
import type { IShiftLocationCalculator } from "../contracts";

export class ShiftLocationCalculator implements IShiftLocationCalculator {
  calculateLocation(motion: MotionData): GridLocation {
    const startLocation = motion.startLocation;
    const endLocation = motion.endLocation;

    if (!startLocation || !endLocation) {
      console.warn("Missing startLocation or endLocation for shift motion");
      return GridLocation.NORTHEAST;
    }

    // Direction pairs mapping using GridLocation enum values
    const directionPairs: Record<string, GridLocation> = {
      // North-East combinations
      [`${GridLocation.NORTH}-${GridLocation.EAST}`]: GridLocation.NORTHEAST,
      [`${GridLocation.EAST}-${GridLocation.NORTH}`]: GridLocation.NORTHEAST,

      // East-South combinations
      [`${GridLocation.EAST}-${GridLocation.SOUTH}`]: GridLocation.SOUTHEAST,
      [`${GridLocation.SOUTH}-${GridLocation.EAST}`]: GridLocation.SOUTHEAST,

      // South-West combinations
      [`${GridLocation.SOUTH}-${GridLocation.WEST}`]: GridLocation.SOUTHWEST,
      [`${GridLocation.WEST}-${GridLocation.SOUTH}`]: GridLocation.SOUTHWEST,

      // West-North combinations
      [`${GridLocation.WEST}-${GridLocation.NORTH}`]: GridLocation.NORTHWEST,
      [`${GridLocation.NORTH}-${GridLocation.WEST}`]: GridLocation.NORTHWEST,
    };

    const pairKey = `${startLocation}-${endLocation}`;
    const location = directionPairs[pairKey];

    if (!location) {
      console.warn(
        `Unknown direction pair: ${startLocation} -> ${endLocation}`
      );
      return GridLocation.NORTH; // Default to north
    }

    return location;
  }
}
