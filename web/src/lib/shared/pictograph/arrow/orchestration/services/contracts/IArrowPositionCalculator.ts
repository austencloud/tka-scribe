/**
 * Arrow Position Calculator Contract
 *
 * Interface for main arrow positioning calculation logic.
 */

import type { ArrowPlacementData, MotionData, PictographData } from "$shared";
import type { Point } from "fabric";

export interface IArrowPositionCalculator {
  /**
   * Calculate arrow position for given motion and pictograph data
   */
  calculateArrowPosition(
    motionData: MotionData,
    pictographData: PictographData
  ): Promise<{ x: number; y: number; rotation: number }>;

  /**
   * Calculate position with adjustment processing
   */
  calculatePositionWithAdjustment(
    motion: MotionData,
    pictographData: PictographData
  ): Promise<Point>;

  /**
   * Calculate rotation angle for arrow
   */
  calculateRotationAngle(
    motion: MotionData,
    pictographData: PictographData
  ): Promise<number>;

  /**
   * Get base position before adjustments
   */
  getBasePosition(
    motion: MotionData,
    pictographData: PictographData
  ): Point;

  /**
   * Apply coordinate transformation to position
   */
  applyCoordinateTransformation(
    position: Point,
    rotation: number
  ): Point;

  /**
   * Validate positioning parameters
   */
  validatePositioningData(
    motionData: MotionData,
    pictographData: PictographData
  ): boolean;
}
