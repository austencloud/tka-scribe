/**
 * Motion Path Calculator
 *
 * Calculates motion paths on-demand using existing interpolation logic.
 * Clean, simple, testable approach - no giant JSON files!
 *
 * Starting with ONE motion: PRO from North→East, 0 turns, IN orientation
 */

import type { MotionData } from "$shared/pictograph/shared/domain/models/MotionData";
import { MotionType } from "$shared/pictograph/shared/domain/enums/pictograph-enums";
import type { IEndpointCalculator } from "../contracts/IEndpointCalculator";
import type { IAngleCalculator } from "../contracts/IAngleCalculator";

// Constants matching AnimatorCanvas EXACTLY (critical for accurate trails!)
const VIEWBOX_SIZE = 950;
const GRID_HALFWAY_POINT_OFFSET = 150; // Strict hand points (animation mode)
const INWARD_FACTOR = 1.0; // NO inward adjustment - must match AnimatorCanvas!
const PROP_WIDTH = 252.8; // Actual staff width - must match AnimatorCanvas!

interface Point2D {
  x: number;
  y: number;
}

export class MotionPathCalculator {
  private endpointCalculator: IEndpointCalculator;
  private angleCalculator: IAngleCalculator;

  constructor(
    endpointCalculator: IEndpointCalculator,
    angleCalculator: IAngleCalculator
  ) {
    this.endpointCalculator = endpointCalculator;
    this.angleCalculator = angleCalculator;
  }

  /**
   * Calculate path for a motion
   *
   * @param motionData - Motion configuration
   * @param pointsPerBeat - How many points to generate (default 100)
   * @param endType - Which end to track (0 = left, 1 = right/tip)
   * @returns Array of points in 950x950 coordinate space
   */
  calculatePath(
    motionData: MotionData,
    pointsPerBeat: number = 100,
    endType: 0 | 1 = 1
  ): Point2D[] {
    console.log(`📐 Calculating path for:`, {
      motionType: motionData.motionType,
      start: motionData.startLocation,
      end: motionData.endLocation,
      turns: motionData.turns,
      rotation: motionData.rotationDirection,
      startOrientation: motionData.startOrientation,
      pointsPerBeat,
      endType: endType === 0 ? "left" : "right",
    });

    // Calculate motion endpoints using existing service
    const endpoints =
      this.endpointCalculator.calculateMotionEndpoints(motionData);

    console.log(`📊 Calculated endpoints:`, {
      startCenterAngle:
        ((endpoints.startCenterAngle * 180) / Math.PI).toFixed(1) + "°",
      targetCenterAngle:
        ((endpoints.targetCenterAngle * 180) / Math.PI).toFixed(1) + "°",
      startStaffAngle:
        ((endpoints.startStaffAngle * 180) / Math.PI).toFixed(1) + "°",
      staffRotationDelta:
        ((endpoints.staffRotationDelta * 180) / Math.PI).toFixed(1) + "°",
    });

    const points: Point2D[] = [];

    // Generate points along the path
    for (let i = 0; i <= pointsPerBeat; i++) {
      const progress = i / pointsPerBeat; // 0.0 to 1.0

      // Interpolate prop state
      let centerAngle: number;
      let staffAngle: number;
      let cartesianX: number | undefined;
      let cartesianY: number | undefined;

      if (motionData.motionType === MotionType.DASH) {
        // DASH: Straight line through center
        const startX = Math.cos(endpoints.startCenterAngle);
        const startY = Math.sin(endpoints.startCenterAngle);
        const endX = Math.cos(endpoints.targetCenterAngle);
        const endY = Math.sin(endpoints.targetCenterAngle);

        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;

        centerAngle = Math.atan2(currentY, currentX);
        staffAngle = this.angleCalculator.normalizeAnglePositive(
          endpoints.startStaffAngle + endpoints.staffRotationDelta * progress
        );
        cartesianX = currentX;
        cartesianY = currentY;
      } else {
        // PRO/ANTI/FLOAT/STATIC: Circular interpolation
        centerAngle = this.angleCalculator.lerpAngle(
          endpoints.startCenterAngle,
          endpoints.targetCenterAngle,
          progress
        );
        staffAngle = this.angleCalculator.normalizeAnglePositive(
          endpoints.startStaffAngle + endpoints.staffRotationDelta * progress
        );
      }

      // Calculate endpoint position
      const endpoint = this.calculatePropEndpoint(
        centerAngle,
        staffAngle,
        endType,
        cartesianX,
        cartesianY
      );

      points.push(endpoint);
    }

    console.log(`✅ Generated ${points.length} points`);
    console.log(`📍 First point:`, points[0]);
    console.log(`📍 Last point:`, points[points.length - 1]);

    return points;
  }

  /**
   * Calculate prop endpoint position in 950x950 coordinate space
   * This matches the logic from the generator script
   */
  private calculatePropEndpoint(
    centerAngle: number,
    staffAngle: number,
    endType: 0 | 1,
    x?: number,
    y?: number
  ): Point2D {
    const centerX = VIEWBOX_SIZE / 2; // 475
    const centerY = VIEWBOX_SIZE / 2; // 475
    const scaledHalfwayRadius = GRID_HALFWAY_POINT_OFFSET; // 150

    let propCenterX: number;
    let propCenterY: number;

    if (x !== undefined && y !== undefined) {
      // Cartesian (DASH motions)
      propCenterX = centerX + x * scaledHalfwayRadius * INWARD_FACTOR;
      propCenterY = centerY + y * scaledHalfwayRadius * INWARD_FACTOR;
    } else {
      // Polar (circular motions)
      propCenterX =
        centerX + Math.cos(centerAngle) * scaledHalfwayRadius * INWARD_FACTOR;
      propCenterY =
        centerY + Math.sin(centerAngle) * scaledHalfwayRadius * INWARD_FACTOR;
    }

    // Calculate endpoint based on staff rotation
    const staffHalfWidth = PROP_WIDTH / 2; // 60
    const staffEndOffset = endType === 1 ? staffHalfWidth : -staffHalfWidth;

    return {
      x: propCenterX + Math.cos(staffAngle) * staffEndOffset,
      y: propCenterY + Math.sin(staffAngle) * staffEndOffset,
    };
  }
}
