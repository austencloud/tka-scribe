/**
 * 3D Grid Layout Constants
 *
 * Defines the radii for center, hand, and outer points,
 * and which locations are hand vs layer2 in each mode.
 */

import { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

// Base radius for hand points (matches GRID_RADIUS_3D)
// From 2D grid: hand point at radius 150, matching strict mode coordinates
export const HAND_POINT_RADIUS = 150;

// Outer points at 2x hand radius (from 2D grid: center=0, hand=150, outer=300)
// Staff spans from center to outer when grip is at hand point
export const OUTER_POINT_RADIUS = 300;

// Point sizes - exact match to 2D grid SVG (diamond_grid.svg)
// The 2D grid uses viewBox 950×950 with center-to-outer = 300px
// These sizes match the SVG directly since our 3D uses same scale
export const CENTER_POINT_SIZE = 12;  // From SVG: r=12
export const HAND_POINT_SIZE = 8;     // From SVG: r=8
export const OUTER_POINT_SIZE = 25;   // From SVG: r=25

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
