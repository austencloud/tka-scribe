/**
 * Shared Sequence Parameter Types
 *
 * These types represent the core parameters that define a sequence,
 * used by both:
 * - Generate module (to create new sequences)
 * - Discover module (to filter existing sequences)
 *
 * Keeping these unified ensures consistency across the app.
 */

// ============================================================================
// DIFFICULTY LEVEL
// ============================================================================

export type DifficultyLevel = 1 | 2 | 3;

export interface DifficultyLevelConfig {
  level: DifficultyLevel;
  name: string;
  description: string;
  gradient: string;
  shadowColor: string;
  textColor: "white" | "black";
}

export const DIFFICULTY_LEVELS: Record<DifficultyLevel, DifficultyLevelConfig> = {
  1: {
    level: 1,
    name: "No Turns",
    description: "Beginner-friendly sequences",
    gradient: `radial-gradient(ellipse at top left,
      rgb(186, 230, 253) 0%,
      rgb(125, 211, 252) 30%,
      rgb(56, 189, 248) 70%,
      rgb(14, 165, 233) 100%)`,
    shadowColor: "199deg 89% 48%",
    textColor: "black",
  },
  2: {
    level: 2,
    name: "Whole Turns",
    description: "Intermediate complexity",
    gradient: `radial-gradient(ellipse at top left,
      rgb(226, 232, 240) 0%,
      rgb(148, 163, 184) 30%,
      rgb(100, 116, 139) 70%,
      rgb(71, 85, 105) 100%)`,
    shadowColor: "215deg 16% 35%",
    textColor: "white",
  },
  3: {
    level: 3,
    name: "Half Turns",
    description: "Advanced sequences",
    gradient: `radial-gradient(ellipse at top left,
      rgb(254, 240, 138) 0%,
      rgb(253, 224, 71) 20%,
      rgb(250, 204, 21) 40%,
      rgb(234, 179, 8) 60%,
      rgb(202, 138, 4) 80%,
      rgb(161, 98, 7) 100%)`,
    shadowColor: "45deg 93% 47%",
    textColor: "black",
  },
};

// ============================================================================
// STARTING POSITION
// ============================================================================

export type StartingPosition = "alpha" | "beta" | "gamma";

export interface StartingPositionConfig {
  id: StartingPosition;
  symbol: string;
  fullName: string;
  color: string;
}

export const STARTING_POSITIONS: Record<StartingPosition, StartingPositionConfig> = {
  alpha: {
    id: "alpha",
    symbol: "α",
    fullName: "Alpha",
    color: "#8b5cf6", // Purple
  },
  beta: {
    id: "beta",
    symbol: "β",
    fullName: "Beta",
    color: "#8b5cf6",
  },
  gamma: {
    id: "gamma",
    symbol: "γ",
    fullName: "Gamma",
    color: "#8b5cf6",
  },
};

export const STARTING_POSITIONS_LIST: StartingPositionConfig[] = [
  STARTING_POSITIONS.alpha,
  STARTING_POSITIONS.beta,
  STARTING_POSITIONS.gamma,
];

// ============================================================================
// SEQUENCE LENGTH
// ============================================================================

export interface SequenceLengthConfig {
  min: number;
  max: number;
  step: number;
  default: number;
}

// Generate uses wider range with larger steps
export const GENERATE_LENGTH_CONFIG: SequenceLengthConfig = {
  min: 4,
  max: 64,
  step: 4,
  default: 16,
};

// Filter uses smaller range (based on what exists in library)
export const FILTER_LENGTH_CONFIG: SequenceLengthConfig = {
  min: 2,
  max: 16,
  step: 1,
  default: 8,
};

// ============================================================================
// STARTING LETTER
// ============================================================================

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export interface LetterConfig {
  letter: string;
  color: string;
}

// Default color for letter cards
export const LETTER_CARD_COLOR = "#10b981"; // Emerald green

// ============================================================================
// UNIFIED PARAMETER INTERFACE
// ============================================================================

/**
 * Core sequence parameters shared between Generate and Filter.
 * All fields are optional because:
 * - Generate: User builds up configuration
 * - Filter: User selects which criteria to filter by
 */
export interface SequenceParameters {
  level?: DifficultyLevel | null;
  startingPosition?: StartingPosition | null;
  length?: number | null;
  startingLetter?: string | null;
}

/**
 * Extended parameters for Generate (includes generation-specific options)
 */
export interface GenerateParameters extends SequenceParameters {
  endPosition?: StartingPosition | null;
  mustContainLetters?: string[];
  mustNotContainLetters?: string[];
}

/**
 * Extended parameters for Filter (includes filter-specific options)
 */
export interface FilterParameters extends SequenceParameters {
  favorites?: boolean;
  containsLetters?: string[];
}
