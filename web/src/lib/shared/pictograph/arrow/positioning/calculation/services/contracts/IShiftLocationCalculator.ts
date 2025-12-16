/**
 * Shift Location Calculator Contract
 *
 * Handles location calculation for pro, anti, and float motions.
 * Returns the arrow location based on start and end positions.
 */

import type { GridLocation, MotionData } from "$shared";

export interface IShiftLocationCalculator {
  /**
   * Calculate the arrow location for a shift motion (pro, anti, float)
   * @param motion The motion data containing start and end locations
   * @returns The grid location where the arrow should be positioned
   */
  calculateLocation(motion: MotionData): GridLocation;
}
