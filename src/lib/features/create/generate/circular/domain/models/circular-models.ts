/**
 * Circular Generation Models
 *
 * Type definitions for circular word (CAP - Continuous Assembly Pattern) generation.
 */

import type { GridPosition } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

/**
 * CAP Type Enum
 * Defines the different types of Continuous Assembly Patterns
 */
export enum CAPType {
  /** Strict rotated - rotates positions around the grid */
  STRICT_ROTATED = "strict_rotated",

  /** Strict mirrored - mirrors positions vertically */
  STRICT_MIRRORED = "strict_mirrored",

  /** Strict swapped - swaps blue and red attributes */
  STRICT_SWAPPED = "strict_swapped",

  /** Strict inverted - uses inverted letters (opposite motion types) */
  STRICT_INVERTED = "strict_inverted",

  /** Swapped inverted - combines swapping with inverted motion */
  SWAPPED_INVERTED = "swapped_inverted",

  /** Rotated inverted - combines rotation with inverted motion */
  ROTATED_INVERTED = "rotated_inverted",

  /** Mirrored swapped - combines mirroring with color swapping */
  MIRRORED_SWAPPED = "mirrored_swapped",

  /** Mirrored inverted - combines mirroring with inverted motion */
  MIRRORED_INVERTED = "mirrored_inverted",

  /** Rotated swapped - combines rotation with color swapping */
  ROTATED_SWAPPED = "rotated_swapped",

  /** Mirrored rotated - combines mirroring with rotation */
  MIRRORED_ROTATED = "mirrored_rotated",

  /** Mirrored inverted rotated - combines all three transformations */
  MIRRORED_INVERTED_ROTATED = "mirrored_inverted_rotated",

  /** Mirrored rotated inverted swapped - combines all four transformations */
  MIRRORED_ROTATED_INVERTED_SWAPPED = "mirrored_rotated_inverted_swapped",
}

/**
 * Slice Size
 * Determines how the circle is divided for rotation
 */
export enum SliceSize {
  /** Half rotation - 180° */
  HALVED = "halved",

  /** Quarter rotation - 90° */
  QUARTERED = "quartered",
}

/**
 * CAP Generation Options
 * Configuration for generating circular words
 */
export interface CAPGenerationOptions {
  /** Total sequence length (will be multiplied based on slice size) */
  length: number;

  /** CAP type to apply */
  capType: CAPType;

  /** Slice size for rotational CAPs */
  sliceSize: SliceSize;

  /** Turn intensity (1-3) */
  turnIntensity: number;

  /** Difficulty level (1-3) */
  level: number;

  /** Prop continuity setting */
  propContinuity: "continuous" | "non-continuous";

  /** Grid mode */
  gridMode: "box" | "diamond";
}

/**
 * CAP Validation Result
 * Result of validating whether a sequence can perform a given CAP
 */
export interface CAPValidationResult {
  /** Whether the sequence is valid for the CAP type */
  isValid: boolean;

  /** Reason for invalidity (if applicable) */
  reason?: string;

  /** Expected end position for the CAP (if applicable) */
  expectedEndPosition?: GridPosition;
}

/**
 * CAP User-friendly labels
 * Maps CAP types to display names for UI
 */
export const CAP_TYPE_LABELS: Record<CAPType, string> = {
  [CAPType.STRICT_ROTATED]: "Rotated",
  [CAPType.STRICT_MIRRORED]: "Mirrored",
  [CAPType.STRICT_SWAPPED]: "Swapped",
  [CAPType.STRICT_INVERTED]: "Inverted",
  [CAPType.SWAPPED_INVERTED]: "Swapped / Inverted",
  [CAPType.MIRRORED_SWAPPED]: "Mirrored / Swapped",
  [CAPType.ROTATED_INVERTED]: "Rotated / Inverted",
  [CAPType.MIRRORED_INVERTED]: "Mirrored / Inverted",
  [CAPType.ROTATED_SWAPPED]: "Rotated / Swapped",
  [CAPType.MIRRORED_ROTATED]: "Mirrored / Rotated",
  [CAPType.MIRRORED_INVERTED_ROTATED]: "Mir / Comp / Rot",
  [CAPType.MIRRORED_ROTATED_INVERTED_SWAPPED]: "All Four",
};
