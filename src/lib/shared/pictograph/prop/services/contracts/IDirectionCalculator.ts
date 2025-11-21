/**
 * Direction Calculator Contract
 */

import type { MotionData } from "$shared";

import type { VectorDirection } from "../../../shared/domain/enums/pictograph-enums";

export interface IDirectionCalculator {
  /**
   * Calculate the movement direction for a given motion.
   */
  calculate(motionData: MotionData): VectorDirection | null;
}
