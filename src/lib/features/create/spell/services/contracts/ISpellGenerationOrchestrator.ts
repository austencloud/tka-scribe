/**
 * Spell Generation Orchestrator Interface
 *
 * Coordinates single word-to-sequence generation flow.
 * Handles generation, state updates, and extension options fetching.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { CircularizationOption } from "$lib/features/create/shared/services/contracts/ISequenceExtender";
import type {
  SpellPreferences,
  LetterSource,
  ExtensionAnalysis,
} from "../../domain/models/spell-models";

/**
 * Result of a successful spell generation
 */
export interface SpellGenerationResult {
  /** Whether generation succeeded */
  success: true;
  /** The generated sequence */
  sequence: SequenceData;
  /** Original word typed by user */
  originalWord: string;
  /** Expanded word including bridge letters */
  expandedWord: string;
  /** Source information for each letter */
  letterSources: LetterSource[];
  /** LOOP analysis for the sequence */
  loopAnalysis?: ExtensionAnalysis;
  /** Circularization options if not directly loopable */
  circularizationOptions: CircularizationOption[];
  /** Reason direct LOOP isn't available */
  directLoopUnavailableReason: string | null;
  /** All valid extension options (for pictograph-first UX) */
  extensionOptions: CircularizationOption[];
}

/**
 * Result of a failed spell generation
 */
export interface SpellGenerationError {
  /** Generation failed */
  success: false;
  /** Error message */
  error: string;
}

export type SpellGenerationOutcome =
  | SpellGenerationResult
  | SpellGenerationError;

export interface ISpellGenerationOrchestrator {
  /**
   * Generate a sequence from a word
   * @param word The input word to convert
   * @param preferences User preferences for generation
   * @returns Generation result with sequence and metadata, or error
   */
  generate(
    word: string,
    preferences: SpellPreferences
  ): Promise<SpellGenerationOutcome>;
}
