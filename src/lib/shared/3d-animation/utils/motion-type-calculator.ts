/**
 * Motion Type Calculator
 *
 * Calculates target staff angle based on motion type (PRO, ANTI, STATIC, DASH, FLOAT).
 */

import {
  MotionType,
  RotationDirection,
} from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import type { MotionConfig3D } from "../domain/models/MotionData3D";
import { mapOrientationToAngle } from "./orientation-mapper";

const PI = Math.PI;

/**
 * Calculate target staff angle based on motion type
 */
export function calculateTargetStaffAngle(
  config: MotionConfig3D,
  startStaffAngle: number,
  startCenterAngle: number,
  endCenterAngle: number
): number {
  const centerMovement = endCenterAngle - startCenterAngle;
  const turnRotation =
    config.turns *
    PI *
    (config.rotationDirection === RotationDirection.COUNTER_CLOCKWISE ? 1 : -1);

  switch (config.motionType) {
    case MotionType.PRO:
      // PRO: staff moves WITH grid + prop rotation
      return startStaffAngle + centerMovement + turnRotation;

    case MotionType.ANTI:
      // ANTI: staff moves OPPOSITE to grid + prop rotation
      return startStaffAngle - centerMovement + turnRotation;

    case MotionType.STATIC:
      // STATIC: staff points to end orientation
      return config.turns > 0
        ? startStaffAngle + turnRotation
        : mapOrientationToAngle(config.endOrientation, endCenterAngle);

    case MotionType.DASH:
      // DASH: similar to STATIC
      return config.turns > 0
        ? startStaffAngle + turnRotation
        : mapOrientationToAngle(config.endOrientation, endCenterAngle);

    case MotionType.FLOAT:
      // FLOAT: no rotation change
      return startStaffAngle;

    default:
      return startStaffAngle;
  }
}
