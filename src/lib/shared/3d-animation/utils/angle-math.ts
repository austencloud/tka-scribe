/**
 * Angle Math Utilities
 *
 * Pure functions for angle normalization and interpolation.
 * Used throughout the animation system.
 */

const TWO_PI = Math.PI * 2;
const PI = Math.PI;

/**
 * Normalize angle to [0, 2π)
 */
export function normalizeAngle(angle: number): number {
  let normalized = angle % TWO_PI;
  if (normalized < 0) normalized += TWO_PI;
  return normalized;
}

/**
 * Normalize angle to signed range (-π, π]
 * Used for calculating shortest path differences
 */
export function normalizeAngleSigned(angle: number): number {
  const norm = normalizeAngle(angle);
  return norm > PI ? norm - TWO_PI : norm;
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolate angle taking shortest path
 */
export function lerpAngle(a: number, b: number, t: number): number {
  const diff = b - a;

  // Normalize difference to [-π, π]
  let normalizedDiff = diff % TWO_PI;
  if (normalizedDiff > PI) normalizedDiff -= TWO_PI;
  if (normalizedDiff < -PI) normalizedDiff += TWO_PI;

  return normalizeAngle(a + normalizedDiff * t);
}
