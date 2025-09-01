/**
 * Core Models and Shared Interfaces
 *
 * Fundamental interface models used across multiple service domains.
 */

import type {
  DifficultyLevel,
  Location,
  MotionColor,
  MotionType,
  Orientation,
} from "../../enums";

// ============================================================================
// BASIC COORDINATE MODELS
// ============================================================================

export interface Coordinates {
  x: number;
  y: number;
}

export interface GridPoint {
  coordinates: Coordinates;
}

// ============================================================================
// ARROW POSITIONING MODELS
// ============================================================================

export interface LegacyArrowData {
  id: string;
  color: MotionColor;
  motionType: MotionType;
  location: Location;
  startOrientation: Orientation;
  endOrientation: Orientation;
}

// ============================================================================
// OPTION FILTER MODELS
// ============================================================================

export interface OptionFilters {
  difficulty?: DifficultyLevel;
  motionTypes?: MotionType[];
  minTurns?: number;
  maxTurns?: number;
}
