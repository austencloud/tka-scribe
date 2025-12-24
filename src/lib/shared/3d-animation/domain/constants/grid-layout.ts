/**
 * 3D Grid Layout Constants
 *
 * Defines the radii for center, hand, and outer points,
 * and which locations are hand vs layer2 in each mode.
 */

import { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

// Base radius for hand points (matches GRID_RADIUS_3D)
export const HAND_POINT_RADIUS = 150;

// Outer points are ~2.1x the hand point radius (from 2D grid proportions)
export const OUTER_POINT_RADIUS = 315;

// Point sizes
export const CENTER_POINT_SIZE = 10;
export const HAND_POINT_SIZE = 8;
export const OUTER_POINT_SIZE = 6;

/**
 * Grid mode - determines which locations are hand points vs layer2 points
 */
export type GridMode = "diamond" | "box";

/**
 * Diamond mode: Cardinals (N/E/S/W) are hand points, diagonals are layer2
 */
export const DIAMOND_HAND_POINTS = [
  GridLocation.NORTH,
  GridLocation.EAST,
  GridLocation.SOUTH,
  GridLocation.WEST,
] as const;

export const DIAMOND_LAYER2_POINTS = [
  GridLocation.NORTHEAST,
  GridLocation.SOUTHEAST,
  GridLocation.SOUTHWEST,
  GridLocation.NORTHWEST,
] as const;

/**
 * Box mode: Diagonals (NE/SE/SW/NW) are hand points, cardinals are layer2
 */
export const BOX_HAND_POINTS = [
  GridLocation.NORTHEAST,
  GridLocation.SOUTHEAST,
  GridLocation.SOUTHWEST,
  GridLocation.NORTHWEST,
] as const;

export const BOX_LAYER2_POINTS = [
  GridLocation.NORTH,
  GridLocation.EAST,
  GridLocation.SOUTH,
  GridLocation.WEST,
] as const;

/**
 * Get hand points for a grid mode
 */
export function getHandPoints(mode: GridMode): readonly GridLocation[] {
  return mode === "diamond" ? DIAMOND_HAND_POINTS : BOX_HAND_POINTS;
}

/**
 * Get layer2/outer points for a grid mode
 */
export function getOuterPoints(mode: GridMode): readonly GridLocation[] {
  return mode === "diamond" ? DIAMOND_LAYER2_POINTS : BOX_LAYER2_POINTS;
}

/**
 * Check if a location is a hand point in the given mode
 */
export function isHandPoint(mode: GridMode, location: GridLocation): boolean {
  const handPoints = getHandPoints(mode);
  return handPoints.includes(location);
}
