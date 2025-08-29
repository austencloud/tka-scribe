/**
 * Positioning and Placement Service Interfaces
 *
 * Interfaces for arrow positioning, placement calculations, and coordinate systems.
 * This handles all spatial calculations and arrow placement logic.
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { Location, MotionType } from "../../../enums";
import type { ArrowPlacementData } from "../ArrowPlacementData";
import type { MotionData } from "../MotionData";
import type { PictographData } from "../PictographData";

// Re-export commonly used types
export type { Location, MotionType };

// ============================================================================
// BASIC TYPES
// ============================================================================

/**
 * Basic point interface for coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Position interface for beta offset calculations
 */
export interface Position {
  x: number;
  y: number;
}

// Re-export for convenience
export type { ArrowPlacementData, MotionData, PictographData };
