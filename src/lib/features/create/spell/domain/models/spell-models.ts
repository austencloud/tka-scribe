/**
 * Spell Tab Domain Models
 *
 * Models for the word-to-sequence generation feature ("Spell" tab).
 * Handles converting typed words into valid TKA sequences with bridge letters.
 */

import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { GridPositionGroup } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

/**
 * Tracks whether a letter in the sequence is original (user-typed) or a bridge (interpolated)
 */
export interface LetterSource {
  /** The letter in the sequence */
  letter: Letter;
  /** True if user typed this letter, false if it was interpolated as a bridge */
  isOriginal: boolean;
  /** The beat index in the final sequence (1-indexed, after start position) */
  beatIndex: number;
}

/**
 * User preferences for sequence generation
 */
export interface SpellPreferences {
  /** Try to minimize prop reversals in the generated sequence */
  minimizeReversals: boolean;
  /** Prefer continuous prop movement (same rotation direction) */
  preferContinuous: boolean;
  /** Favor or avoid certain motion types: null = no preference, 'dash' = favor dashes, 'no-dash' = avoid dashes */
  favorMotionType: "dash" | "no-dash" | null;
  /** Maximum number of bridge letters allowed between any two original letters */
  maxBridgeLetters: number;
  /** Generate a circular (LOOP) sequence that returns to start */
  makeCircular: boolean;
}

/**
 * Result of word-to-sequence generation
 */
export interface SpellResult {
  /** The generated sequence data */
  sequence: SequenceData;
  /** The original word the user typed */
  originalWord: string;
  /** The expanded word including bridge letters */
  expandedWord: string;
  /** Detailed information about each letter's source */
  letterSources: LetterSource[];
  /** Whether generation was successful */
  success: boolean;
  /** Error message if generation failed */
  error?: string;
}

/**
 * Information about a letter's position transitions
 * Used internally by the LetterTransitionGraph
 */
export interface LetterPositionInfo {
  letter: Letter;
  startPositionGroup: GridPositionGroup;
  endPositionGroup: GridPositionGroup;
  category: LetterCategory;
}

/**
 * Categories of letters based on motion type
 */
export type LetterCategory =
  | "dual-shift"
  | "shift"
  | "cross-shift"
  | "dash"
  | "dual-dash"
  | "static";

/**
 * Options for generating a sequence from a word
 */
export interface SpellGenerationOptions {
  /** The word to convert to a sequence */
  word: string;
  /** User preferences for generation */
  preferences: SpellPreferences;
  /** Optional: specific start position to use */
  startPosition?: GridPositionGroup;
  /** Optional: seed for randomization (for reproducible results) */
  seed?: number;
}

/**
 * Alias mapping for Greek letter input
 * Maps typed text to the corresponding Greek letter
 */
export interface LetterAlias {
  /** The typed text (e.g., "sigma") */
  alias: string;
  /** The actual letter (e.g., "Σ") */
  letter: Letter;
}
