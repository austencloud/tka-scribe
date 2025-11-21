/**
 * Arrow Adjustment Processor Contract
 *
 * Interface for handling adjustment calculations and directional tuple processing.
 */

import type { Point } from "fabric";

import type {
  GridLocation,
  IArrowLocationCalculator,
  MotionData,
} from "$shared";

export interface IArrowAdjustmentProcessor {
  /**
   * Get basic adjustment for synchronous operations with directional tuple processing
   */
  getBasicAdjustment(
    motion: MotionData,
    locationCalculator: IArrowLocationCalculator
  ): Point;

  /**
   * Get base adjustment values before directional processing
   */
  getBaseAdjustmentValues(motion: MotionData): Point;

  /**
   * Process directional tuples to get location-specific adjustments
   */
  processDirectionalTuples(
    baseAdjustment: Point,
    motion: MotionData,
    location: GridLocation
  ): Point;

  /**
   * Generate directional tuples using rotation matrices
   */
  generateDirectionalTuples(
    motion: MotionData,
    baseX: number,
    baseY: number
  ): Array<[number, number]>;
}
