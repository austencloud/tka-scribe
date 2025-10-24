/**
 * Angle Calculation Service
 *
 * Handles all angle-related calculations including normalization,
 * position mapping, and orientation mapping.
 */

import { GridLocation, Orientation } from "$shared";
import { injectable } from "inversify";
import { HALF_PI, LOCATION_ANGLES, PI, TWO_PI } from "../../domain/math-constants.js";
import type { IAngleCalculator } from "../contracts/IAngleCalculator";

// ============================================================================
// Standalone utility functions (exported for use by domain layer)
// ============================================================================

export function normalizeAnglePositive(angle: number): number {
  const norm = angle % TWO_PI;
  return norm < 0 ? norm + TWO_PI : norm;
}

export function normalizeAngleSigned(angle: number): number {
  const norm = normalizeAnglePositive(angle);
  return norm > PI ? norm - TWO_PI : norm;
}

export function mapPositionToAngle(loc: GridLocation): number {
  return LOCATION_ANGLES[loc] ?? 0;
}

export function mapOrientationToAngle(ori: Orientation, centerPathAngle: number): number {
  if (!ori) return centerPathAngle + PI;

  if (ori === Orientation.IN) {
    return normalizeAnglePositive(centerPathAngle + PI);
  }

  if (ori === Orientation.OUT) {
    return normalizeAnglePositive(centerPathAngle);
  }

  if (ori === Orientation.CLOCK) {
    return normalizeAnglePositive(centerPathAngle + HALF_PI);
  }

  if (ori === Orientation.COUNTER) {
    return normalizeAnglePositive(centerPathAngle - HALF_PI);
  }

  return normalizeAnglePositive(centerPathAngle + PI);
}

// ============================================================================
// Service class (uses standalone functions internally)
// ============================================================================

@injectable()
export class AngleCalculator implements IAngleCalculator {
  /**
   * Normalize angle to positive range [0, 2π)
   */
  normalizeAnglePositive(angle: number): number {
    return normalizeAnglePositive(angle);
  }

  /**
   * Normalize angle to signed range (-π, π]
   */
  normalizeAngleSigned(angle: number): number {
    return normalizeAngleSigned(angle);
  }

  /**
   * Map grid position to angle using centralized enums
   */
  mapPositionToAngle(loc: GridLocation): number {
    return mapPositionToAngle(loc);
  }

  /**
   * Map orientation to staff angle using centralized enums
   */
  mapOrientationToAngle(ori: Orientation, centerPathAngle: number): number {
    return mapOrientationToAngle(ori, centerPathAngle);
  }

  /**
   * Linear interpolation between two values
   */
  lerp(a: number, b: number, t: number): number {
    return a * (1 - t) + b * t;
  }

  /**
   * Angular interpolation (handles wraparound)
   */
  lerpAngle(a: number, b: number, t: number): number {
    const d = this.normalizeAngleSigned(b - a);
    return this.normalizeAnglePositive(a + d * t);
  }
}
