/**
 * OrientationService Implementation
 *
 * Maps prop orientations to angles relative to center path.
 */

import { injectable } from "inversify";
import { Orientation } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import type { IOrientationService } from "../contracts/IOrientationService";

const PI = Math.PI;
const HALF_PI = PI / 2;

@injectable()
export class OrientationService implements IOrientationService {
  /**
   * Map orientation to angle relative to center path
   */
  mapOrientationToAngle(orientation: Orientation, centerPathAngle: number): number {
    switch (orientation) {
      case Orientation.IN:
        return centerPathAngle + PI;
      case Orientation.OUT:
        return centerPathAngle;
      case Orientation.CLOCK:
        return centerPathAngle + HALF_PI;
      case Orientation.COUNTER:
        return centerPathAngle - HALF_PI;
      default:
        return centerPathAngle;
    }
  }
}
