/**
 * Prop State Interpolator
 *
 * Calculates PropState3D from MotionConfig3D and progress (0-1).
 * Handles all motion types and plane transformations.
 */

import { Vector3 } from "three";
import { MotionType } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { LOCATION_ANGLES } from "$lib/features/compose/shared/domain/math-constants";
import type { PropState3D } from "../../domain/models/PropState3D";
import type { MotionConfig3D } from "../../domain/models/MotionData3D";
import {
  planeAngleToWorldPosition,
  calculatePropQuaternion,
  GRID_RADIUS_3D,
} from "../../domain/constants/plane-transforms";
import { normalizeAngle, lerp, lerpAngle } from "../../utils/angle-math";
import { lerpAngleDirectional } from "../../utils/directional-lerp";
import { mapOrientationToAngle } from "../../utils/orientation-mapper";
import { calculateTargetStaffAngle } from "../../utils/motion-type-calculator";

/**
 * Interpolate center path angle based on motion type
 *
 * IMPORTANT: Center path (position on grid) ALWAYS uses shortest path interpolation!
 * The rotation direction only affects STAFF rotation, not position movement.
 * This matches the 2D animator behavior.
 *
 * NOTE: For DASH motions, use interpolateDashPosition instead - it handles
 * the straight-line-through-center path correctly by varying the radius.
 */
function interpolateCenterPath(
  startAngle: number,
  endAngle: number,
  progress: number
): number {
  // All non-DASH motions: interpolate along circular path using SHORTEST PATH
  // This is critical - center path movement is always shortest path, like 2D animator
  return lerpAngle(startAngle, endAngle, progress);
}

/**
 * Interpolate DASH motion in Cartesian space
 *
 * DASH motions move in a straight line through the center, not around the circle.
 * This means the radius varies - at the midpoint of a N→S dash, the prop passes
 * through the center point (radius = 0).
 *
 * @returns Object with world position and the centerPathAngle for state tracking
 */
function interpolateDashPosition(
  config: MotionConfig3D,
  startAngle: number,
  endAngle: number,
  progress: number
): { worldPosition: Vector3; centerPathAngle: number } {
  // Convert start and end angles to Cartesian coordinates (unit circle)
  const startX = Math.cos(startAngle);
  const startY = Math.sin(startAngle);
  const endX = Math.cos(endAngle);
  const endY = Math.sin(endAngle);

  // Linear interpolation in Cartesian space (straight line through center)
  const currentX = lerp(startX, endX, progress);
  const currentY = lerp(startY, endY, progress);

  // Calculate the distance from center (this varies during the dash!)
  const radius = Math.sqrt(currentX * currentX + currentY * currentY);

  // Calculate angle (for state tracking and when not at center)
  // Note: atan2(0, 0) returns 0 but that's fine when radius is 0
  const centerPathAngle = Math.atan2(currentY, currentX);

  // Convert to world position with the interpolated radius
  // When radius is near 0, the position will be near center
  const worldPosition = planeAngleToWorldPosition(
    config.plane,
    centerPathAngle,
    radius * GRID_RADIUS_3D
  );

  return { worldPosition, centerPathAngle };
}

/**
 * Calculate PropState3D from config and progress
 */
export function calculatePropState(
  config: MotionConfig3D,
  progress: number
): PropState3D {
  // Get start/end center angles from grid locations
  const startCenterAngle = LOCATION_ANGLES[config.startLocation] ?? 0;
  const endCenterAngle = LOCATION_ANGLES[config.endLocation] ?? 0;

  // Calculate start staff angle from orientation
  const startStaffAngle = mapOrientationToAngle(
    config.startOrientation,
    startCenterAngle
  );

  // Calculate target staff angle based on motion type
  const targetStaffAngle = calculateTargetStaffAngle(
    config,
    startStaffAngle,
    startCenterAngle,
    endCenterAngle
  );

  // Calculate staff rotation delta (un-normalized for multi-turn)
  const staffRotationDelta = targetStaffAngle - startStaffAngle;

  // Interpolate staff rotation (linear for multi-turn support)
  const staffRotationAngle = normalizeAngle(
    startStaffAngle + staffRotationDelta * progress
  );

  // Calculate 3D rotation
  const worldRotation = calculatePropQuaternion(config.plane, staffRotationAngle);

  // DASH motions use Cartesian interpolation (straight line through center)
  if (config.motionType === MotionType.DASH) {
    const { worldPosition, centerPathAngle } = interpolateDashPosition(
      config,
      startCenterAngle,
      endCenterAngle,
      progress
    );

    return {
      plane: config.plane,
      centerPathAngle,
      staffRotationAngle,
      worldPosition,
      worldRotation,
    };
  }

  // All other motions: interpolate along circular path
  const centerPathAngle = interpolateCenterPath(
    startCenterAngle,
    endCenterAngle,
    progress
  );

  // Convert to 3D position (fixed radius for circular motion)
  const worldPosition = planeAngleToWorldPosition(
    config.plane,
    centerPathAngle,
    GRID_RADIUS_3D
  );

  return {
    plane: config.plane,
    centerPathAngle,
    staffRotationAngle,
    worldPosition,
    worldRotation,
  };
}
