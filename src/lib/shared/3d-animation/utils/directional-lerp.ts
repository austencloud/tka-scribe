/**
 * Directional Angle Interpolation
 *
 * Interpolates angles with explicit rotation direction control.
 */

import { RotationDirection } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { normalizeAngle, lerpAngle } from "./angle-math";

const TWO_PI = Math.PI * 2;

/**
 * Interpolate angle with explicit direction (CW, CCW, or shortest path)
 */
export function lerpAngleDirectional(
  start: number,
  end: number,
  direction: RotationDirection,
  t: number
): number {
  if (direction === RotationDirection.NO_ROTATION) {
    return lerpAngle(start, end, t);
  }

  let delta = end - start;

  // Force direction
  if (direction === RotationDirection.CLOCKWISE) {
    // Clockwise = negative in canvas coords
    if (delta > 0) delta -= TWO_PI;
  } else {
    // Counter-clockwise = positive
    if (delta < 0) delta += TWO_PI;
  }

  return normalizeAngle(start + delta * t);
}
