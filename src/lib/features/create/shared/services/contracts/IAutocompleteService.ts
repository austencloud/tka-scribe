/**
 * Autocomplete Service Interface
 *
 * Detects when a sequence is in a completable state (end position is a rotation of start)
 * and provides automatic completion options using rotational/circular patterns.
 */

import type { BeatData } from "../../domain/models/BeatData";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { GridPosition } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { CAPType } from "$lib/features/create/generate/circular/domain/models/circular-models";

/**
 * Describes the type of completion available for a sequence
 */
export type CompletionType =
  | "already_complete" // End position equals start position
  | "half_rotation"    // End position is 180° rotation of start (4 positions away)
  | "quarter_rotation" // End position is 90° rotation of start (2 positions away)
  | "not_completable"; // End position is not a rotation of start

/**
 * Describes a single CAP option available for autocomplete
 */
export interface CAPOption {
  /** The CAP type */
  capType: CAPType;
  /** Human-readable name */
  name: string;
  /** Short description of what this CAP does */
  description: string;
  /** Icon class (FontAwesome) */
  icon: string;
}

/**
 * Result of analyzing whether a sequence can be autocompleted
 */
export interface AutocompleteAnalysis {
  /** Whether autocomplete is available */
  canComplete: boolean;
  /** The type of completion possible */
  completionType: CompletionType;
  /** Start position of the sequence */
  startPosition: GridPosition | null;
  /** Current end position of the sequence */
  currentEndPosition: GridPosition | null;
  /** Available CAP options for completion */
  availableCAPOptions: CAPOption[];
  /** Human-readable description of the completion */
  description: string;
}

/**
 * Options for generating completion beats
 */
export interface AutocompleteOptions {
  /** The CAP type to use for completion */
  capType: CAPType;
  /** Difficulty level (1-3) */
  difficulty?: number;
  /** Turn intensity (0-1) */
  turnIntensity?: number;
}

export interface IAutocompleteService {
  /**
   * Analyze a sequence to determine if it can be autocompleted
   * @param sequence The sequence to analyze
   * @returns Analysis result with completion information
   */
  analyzeSequence(sequence: SequenceData): AutocompleteAnalysis;

  /**
   * Generate beats to complete a sequence back to its starting position
   * @param sequence The sequence to complete
   * @param options Optional generation options
   * @returns The completion beats (excluding the existing sequence)
   * @throws Error if sequence cannot be completed
   */
  generateCompletionBeats(
    sequence: SequenceData,
    options?: AutocompleteOptions
  ): Promise<BeatData[]>;

  /**
   * Complete a sequence by appending the generated completion beats
   * @param sequence The sequence to complete
   * @param options Optional generation options
   * @returns A new sequence with completion beats appended
   * @throws Error if sequence cannot be completed
   */
  autocompleteSequence(
    sequence: SequenceData,
    options?: AutocompleteOptions
  ): Promise<SequenceData>;
}
