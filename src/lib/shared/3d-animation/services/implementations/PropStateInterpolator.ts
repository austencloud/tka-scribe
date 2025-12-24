/**
 * Prop State Interpolator
 *
 * Calculates PropState3D from MotionConfig3D and progress (0-1).
 * Handles all motion types and plane transformations.
 */

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
 */
function interpolateCenterPath(
  config: MotionConfig3D,
  startAngle: number,
  endAngle: number,
  progress: number
): number {
  if (config.motionType === MotionType.DASH) {
    // DASH: interpolate in Cartesian space (straight line through center)
    const startX = Math.cos(startAngle);
    const startY = Math.sin(startAngle);
    const endX = Math.cos(endAngle);
    const endY = Math.sin(endAngle);
    const currentX = lerp(startX, endX, progress);
    const currentY = lerp(startY, endY, progress);
    return Math.atan2(currentY, currentX);
  }

  // All other motions: interpolate along circular path using SHORTEST PATH
  // This is critical - center path movement is always shortest path, like 2D animator
  return lerpAngle(startAngle, endAngle, progress);
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

  // Interpolate center path angle
  const centerPathAngle = interpolateCenterPath(
    config,
    startCenterAngle,
    endCenterAngle,
    progress
  );

  // Interpolate staff rotation (linear for multi-turn support)
  const staffRotationAngle = normalizeAngle(
    startStaffAngle + staffRotationDelta * progress
  );

  // Convert to 3D position
  const worldPosition = planeAngleToWorldPosition(
    config.plane,
    centerPathAngle,
    GRID_RADIUS_3D
  );

  // Calculate 3D rotation
  const worldRotation = calculatePropQuaternion(config.plane, staffRotationAngle);

  return {
    plane: config.plane,
    centerPathAngle,
    staffRotationAngle,
    worldPosition,
    worldRotation,
  };
}
