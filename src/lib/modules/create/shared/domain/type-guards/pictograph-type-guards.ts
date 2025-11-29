/**
 * Type Guards for Pictograph Data
 *
 * Utilities to distinguish between BeatData and StartPositionData at runtime.
 * These enable TypeScript to narrow union types and enforce type safety.
 */

import type { BeatData } from "../models/BeatData";
import type { StartPositionData } from "../models/StartPositionData";
import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";

/**
 * Union type for all pictograph-based data structures
 */
export type BeatOrStartPosition = BeatData | StartPositionData;

/**
 * Type guard: Check if data is StartPositionData
 *
 * Checks for the presence of isStartPosition discriminator OR beatNumber === 0 (legacy)
 */
export function isStartPosition(
  data: PictographData | BeatData | StartPositionData | unknown
): data is StartPositionData {
  if (!data || typeof data !== "object") {
    return false;
  }

  const obj = data as any;

  // Primary check: Type discriminator field
  if (obj.isStartPosition === true) {
    return true;
  }

  // Fallback check: Legacy beatNumber === 0 pattern
  // This supports old data before migration is complete
  if ("beatNumber" in obj && obj.beatNumber === 0) {
    return true;
  }

  return false;
}

/**
 * Type guard: Check if data is BeatData
 *
 * Checks for the presence of isBeat discriminator OR beatNumber >= 1 (legacy)
 */
export function isBeat(
  data: PictographData | BeatData | StartPositionData | unknown
): data is BeatData {
  if (!data || typeof data !== "object") {
    return false;
  }

  const obj = data as any;

  // Primary check: Type discriminator field
  if (obj.isBeat === true) {
    return true;
  }

  // Fallback check: Legacy beatNumber >= 1 pattern
  // This supports old data before migration is complete
  if ("beatNumber" in obj && typeof obj.beatNumber === "number" && obj.beatNumber >= 1) {
    return true;
  }

  return false;
}

/**
 * Type guard: Check if data is either a beat or start position
 *
 * Useful for validating that data is one of our known types
 */
export function isBeatOrStartPosition(
  data: unknown
): data is BeatOrStartPosition {
  return isStartPosition(data) || isBeat(data);
}

/**
 * Assertion: Throw if data is not StartPositionData
 */
export function assertIsStartPosition(
  data: unknown
): asserts data is StartPositionData {
  if (!isStartPosition(data)) {
    throw new Error(
      `Expected StartPositionData but got ${typeof data}. Data: ${JSON.stringify(data)}`
    );
  }
}

/**
 * Assertion: Throw if data is not BeatData
 */
export function assertIsBeat(data: unknown): asserts data is BeatData {
  if (!isBeat(data)) {
    throw new Error(
      `Expected BeatData but got ${typeof data}. Data: ${JSON.stringify(data)}`
    );
  }
}
