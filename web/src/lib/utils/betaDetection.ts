/**
 * Beta Detection Utilities
 *
 * Functions to detect beta conditions based on GridPosition enum values
 */

import { GridPosition } from "$lib/domain/enums";
import type { PictographData } from "$lib/domain/PictographData";

/**
 * Check if a grid position is a beta position
 */
export function isBetaPosition(position: string | GridPosition): boolean {
  const positionStr =
    typeof position === "string" ? position : String(position);
  return positionStr.toLowerCase().startsWith("beta");
}

/**
 * Check if a pictograph ends with beta (end position is a beta position)
 */
export function endsWithBeta(pictographData: PictographData): boolean {
  if (!pictographData.endPosition) return false;
  return isBetaPosition(pictographData.endPosition);
}

/**
 * Check if a pictograph starts with beta (start position is a beta position)
 */
export function startsWithBeta(pictographData: PictographData): boolean {
  if (!pictographData.startPosition) return false;
  return isBetaPosition(pictographData.startPosition);
}

/**
 * Get all beta positions from the GridPosition enum
 */
export function getAllBetaPositions(): GridPosition[] {
  return Object.values(GridPosition).filter((position) =>
    isBetaPosition(position)
  );
}
