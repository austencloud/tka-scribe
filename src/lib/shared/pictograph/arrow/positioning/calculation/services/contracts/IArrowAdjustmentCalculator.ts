/**
 * Arrow Adjustment Calculator Interface
 *
 * Calculates position adjustments for arrows based on placement rules.
 */

import type { Point } from "fabric";

import type { GridLocation, MotionData, PictographData } from "$shared";

export interface IArrowAdjustmentCalculator {
  /**
   * Calculate position adjustment for arrow based on placement rules.
   */
  calculateAdjustment(
    pictographData: PictographData,
    motionData: MotionData,
    letter: string,
    location: GridLocation,
    arrowColor?: string
  ): Promise<Point>;
}
