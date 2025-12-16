/**
 * Prop Placement Service Interface
 *
 * Calculates prop placement data for pictograph rendering.
 */

import type { MotionData, PictographData, PropPlacementData } from "$shared";

export interface IPropPlacementService {
  calculatePlacement(
    pictographData: PictographData,
    motionData: MotionData
  ): Promise<PropPlacementData>;
}
