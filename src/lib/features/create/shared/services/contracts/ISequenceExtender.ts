/**
 * Sequence Extender Interface
 *
 * Detects when a sequence is in an extendable state (end position is a rotation of start)
 * and provides extension options using LOOP (Linked Offset Operation Pattern) types.
 *
 * LOOP = TKA's algorithmic extension patterns (Mirrored, Rotated, Swapped, etc.)
 * that transform and extend sequences based on position symmetries.
 */

import type { BeatData } from "../../domain/models/BeatData";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { GridPosition } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { LOOPType } from "$lib/features/create/generate/circular/domain/models/circular-models";
import type { Letter } from "$lib/shared/foundation/domain/models/Letter";

// Re-export LOOPType for convenience
export type { LOOPType };

/**
 * Describes the type of extension available for a sequence
 */
export type ExtensionType =
  | "already_complete" // End position equals start position
  | "half_rotation" // End position is 180° rotation of start (4 positions away)
  | "quarter_rotation" // End position is 90° rotation of start (2 positions away)
  | "not_extendable"; // End position is not a rotation of start

/**
 * Describes a single LOOP option available for extension
 * LOOP = Linked Offset Operation Pattern
 */
export interface LOOPOption {
  /** The LOOP type */
  loopType: LOOPType;
  /** Human-readable name */
  name: string;
  /** Short description of what this LOOP does */
  description: string;
  /** Icon class (FontAwesome) */
  icon: string;
}

/**
 * Result of analyzing whether a sequence can be extended
 */
export interface ExtensionAnalysis {
  /** Whether extension is available */
  canExtend: boolean;
  /** The type of extension possible */
  extensionType: ExtensionType;
  /** Start position of the sequence */
  startPosition: GridPosition | null;
  /** Current end position of the sequence */
  currentEndPosition: GridPosition | null;
  /** Available LOOP options for extension (will actually work) */
  availableLOOPOptions: LOOPOption[];
  /** Unavailable LOOP options (exist but won't work for this sequence) */
  unavailableLOOPOptions: LOOPOption[];
  /** Human-readable description of the extension */
  description: string;
}

/**
 * Options for generating extension beats
 */
export interface ExtensionOptions {
  /** The LOOP type to use for extension */
  loopType: LOOPType;
  /** Difficulty level (1-3) */
  difficulty?: number;
  /** Turn intensity (0-1) */
  turnIntensity?: number;
}

/**
 * Option for making a non-loopable sequence circular via bridge letter.
 * When a sequence ends at a different position group than it starts,
 * adding a bridge letter can bring it to a position where LOOPs work.
 */
export interface CircularizationOption {
  /** Bridge letters needed to reach a loopable position */
  bridgeLetters: Letter[];
  /** The position we'd end at after adding bridge letters */
  endPosition: string;
  /** Available LOOP types for this ending position */
  availableLOOPs: LOOPOption[];
  /** Description for UI display */
  description: string;
}

export interface ISequenceExtender {
  /**
   * Analyze a sequence to determine if it can be extended
   * @param sequence The sequence to analyze
   * @returns Analysis result with extension information
   */
  analyzeSequence(sequence: SequenceData): ExtensionAnalysis;

  /**
   * Generate beats to extend a sequence back to its starting position
   * @param sequence The sequence to extend
   * @param options Optional generation options
   * @returns The extension beats (excluding the existing sequence)
   * @throws Error if sequence cannot be extended
   */
  generateExtensionBeats(
    sequence: SequenceData,
    options?: ExtensionOptions
  ): Promise<BeatData[]>;

  /**
   * Extend a sequence by appending the generated extension beats
   * @param sequence The sequence to extend
   * @param options Optional generation options
   * @returns A new sequence with extension beats appended
   * @throws Error if sequence cannot be extended
   */
  extendSequence(
    sequence: SequenceData,
    options?: ExtensionOptions
  ): Promise<SequenceData>;

  /**
   * Get circularization options for a sequence that isn't directly loopable.
   * Returns bridge letter options that would bring the sequence to a loopable position.
   * @param sequence The sequence to analyze
   * @returns Array of circularization options, or empty if already loopable or no options exist
   */
  getCircularizationOptions(sequence: SequenceData): Promise<CircularizationOption[]>;

  /**
   * Extend a sequence by first appending a bridge letter, then applying a LOOP.
   * @param sequence The sequence to extend
   * @param bridgeLetter The bridge letter to append before applying LOOP
   * @param loopType The LOOP type to apply after adding bridge letter
   * @returns A new sequence with bridge letter and LOOP applied
   * @throws Error if extension fails
   */
  extendWithBridge(
    sequence: SequenceData,
    bridgeLetter: Letter,
    loopType: LOOPType
  ): Promise<SequenceData>;
}
