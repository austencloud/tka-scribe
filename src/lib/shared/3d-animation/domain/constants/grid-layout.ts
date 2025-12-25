/**
 * 3D Grid Layout Constants
 *
 * Scale: 1 unit = 0.5 cm
 *
 * Defines the radii for center, hand, and outer points,
 * and which locations are hand vs layer2 in each mode.
 */

import { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

// Base radius for hand points (matches GRID_RADIUS_3D)
// ~50cm from body center = comfortable arm extension
export const HAND_POINT_RADIUS = 100; // 50cm

// Outer points where staff tips reach when held at hand point
// Hand at 100 + half of 173-unit staff (86.5) ≈ 186
export const OUTER_POINT_RADIUS = 186;

// Point sizes - scaled proportionally for new grid size
export const CENTER_POINT_SIZE = 8;
export const HAND_POINT_SIZE = 5;
export const OUTER_POINT_SIZE = 16;

/**
 * Grid mode - determines which locations are hand points vs layer2 points
 */
export type GridMode = "diamond" | "box";

/**
 * Diamond mode: Cardinals (N/E/S/W) are hand points
 * Outer points are also on cardinals, just further out
 */
export const DIAMOND_HAND_POINTS = [
  GridLocation.NORTH,
  GridLocation.EAST,
  GridLocation.SOUTH,
  GridLocation.WEST,
] as const;

export const DIAMOND_OUTER_POINTS = [
  GridLocation.NORTH,
  GridLocation.EAST,
  GridLocation.SOUTH,
  GridLocation.WEST,
] as const;

/**
 * Box mode: Diagonals (NE/SE/SW/NW) are hand points
 * Outer points are also on diagonals, just further out
 */
export const BOX_HAND_POINTS = [
  GridLocation.NORTHEAST,
  GridLocation.SOUTHEAST,
  GridLocation.SOUTHWEST,
  GridLocation.NORTHWEST,
] as const;

export const BOX_OUTER_POINTS = [
  GridLocation.NORTHEAST,
  GridLocation.SOUTHEAST,
  GridLocation.SOUTHWEST,
  GridLocation.NORTHWEST,
] as const;

/**
 * Get hand points for a grid mode
 */
export function getHandPoints(mode: GridMode): readonly GridLocation[] {
  return mode === "diamond" ? DIAMOND_HAND_POINTS : BOX_HAND_POINTS;
}

/**
 * Get outer points for a grid mode (same directions as hand points, further radius)
 */
export function getOuterPoints(mode: GridMode): readonly GridLocation[] {
  return mode === "diamond" ? DIAMOND_OUTER_POINTS : BOX_OUTER_POINTS;
}

/**
 * Check if a location is a hand point in the given mode
 */
export function isHandPoint(mode: GridMode, location: GridLocation): boolean {
  const handPoints = getHandPoints(mode);
  return handPoints.includes(location);
}
