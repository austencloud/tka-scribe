/**
 * Grid coordinate data for pictograph rendering
 * This data defines the precise positioning points for arrows and props
 * in both diamond and box grid modes.
 *
 * Coordinates are in the 950x950 scene coordinate system with center at (475, 475)
 */

import { GridMode } from "$shared";
import type { GridPointData } from "../domain";
import { gridCoordinates } from "../domain/constants/gridCoordinates";

/**
 * Parse coordinate string "(x, y)" into {x, y} object
 */
export function parseCoordinates(
  coordString: string
): { x: number; y: number } | null {
  if (!coordString || coordString === "None") return null;

  try {
    const parts = coordString.replace(/[()]/g, "").split(", ").map(parseFloat);
    if (parts.length !== 2) {
      console.error(`Invalid coordinate format: "${coordString}"`);
      return null;
    }
    const [x, y] = parts;
    if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
      console.error(`Invalid coordinates parsed: "${coordString}"`);
      return null;
    }
    return { x, y };
  } catch (error) {
    console.error(`Failed to parse coordinates: "${coordString}"`, error);
    return null;
  }
}

/**
 * Convert raw coordinate data into structured GridPointData format
 */
export function createGridPointData(mode: GridMode): GridPointData {
  // SKEWED mode doesn't have its own coordinates - it uses both diamond and box
  // For now, default to diamond when SKEWED is requested
  const actualMode = mode === GridMode.SKEWED ? GridMode.DIAMOND : mode;
  const modeData = gridCoordinates[actualMode];

  const parsePoints = (points: Record<string, string>) =>
    Object.fromEntries(
      Object.entries(points).map(([key, value]) => [
        key,
        { coordinates: parseCoordinates(value) },
      ])
    );

  return {
    allHandPointsStrict: parsePoints(modeData.hand_points.strict),
    allHandPointsNormal: parsePoints(modeData.hand_points.normal),
    allLayer2PointsStrict: parsePoints(modeData.layer2_points.strict),
    allLayer2PointsNormal: parsePoints(modeData.layer2_points.normal),
    allOuterPoints: parsePoints(modeData.outer_points),
    centerPoint: { coordinates: parseCoordinates(modeData.center_point) },
  };
}
