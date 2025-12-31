/**
 * Variation Exploration Orchestrator Interface
 *
 * Coordinates the "Generate All" flow that explores all possible
 * sequence variations for a given word.
 */

import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
import type { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { SpellPreferences } from "../../domain/models/spell-models";
import type { ScoredVariation } from "../../state/variation-state.svelte";

/**
 * Callbacks for exploration progress updates
 */
export interface ExplorationCallbacks {
  /** Called when a new unique variation is found */
  onVariationFound: (variation: ScoredVariation) => void;
  /** Called periodically with progress count */
  onProgress: (totalExplored: number) => void;
}

/**
 * Result of parsing a word for exploration
 */
export interface WordParseResult {
  /** Whether parsing succeeded */
  success: boolean;
  /** Parsed letters (original, without bridges) */
  originalLetters?: Letter[];
  /** Expanded letters (with bridges inserted) */
  expandedLetters?: Letter[];
  /** Expanded word string */
  expandedWord?: string;
  /** Error message if parsing failed */
  error?: string;
}

/**
 * Result of variation exploration
 */
export interface ExplorationResult {
  /** Total variations explored (including duplicates) */
  totalExplored: number;
  /** Number of unique variations found */
  uniqueCount: number;
  /** Whether exploration was cancelled */
  wasCancelled: boolean;
  /** Error if exploration failed */
  error?: string;
}

export interface IVariationExplorationOrchestrator {
  /**
   * Parse a word and prepare for exploration
   * @param word The input word
   * @returns Parsed result with original and expanded letters
   */
  parseWord(word: string): Promise<WordParseResult>;

  /**
   * Estimate total number of variations for progress UI
   * @param expandedLetters The expanded letters to explore
   * @param gridMode The grid mode to use
   * @returns Estimated total variations
   */
  estimateVariationCount(
    expandedLetters: Letter[],
    gridMode: GridMode
  ): Promise<number>;

  /**
   * Explore all variations for the given letters
   * @param expandedLetters The expanded letters to explore
   * @param preferences User preferences for scoring
   * @param gridMode Grid mode to use
   * @param callbacks Progress callbacks
   * @param signal Abort signal for cancellation
   * @returns Exploration result with counts
   */
  exploreVariations(
    expandedLetters: Letter[],
    preferences: SpellPreferences,
    gridMode: GridMode,
    callbacks: ExplorationCallbacks,
    signal: AbortSignal
  ): Promise<ExplorationResult>;

  /**
   * Reset deduplicator state for a new exploration
   */
  resetDeduplicator(): void;
}
