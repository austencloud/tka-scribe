/**
 * Variation Scorer Interface
 *
 * Scores sequence variations based on user preferences.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { SpellPreferences } from "../../domain/models/spell-models";

/**
 * Detailed score breakdown for a sequence variation
 */
export interface VariationScore {
  /** Combined weighted score (higher is better) */
  total: number;
  /** Number of reversals in the sequence (lower is better) */
  reversalCount: number;
  /** Continuity score based on rotation direction consistency (higher is better) */
  continuityScore: number;
  /** Motion type score based on dash preference (higher is better when matching preference) */
  motionTypeScore: number;
}

/**
 * Service that scores sequence variations based on user preferences.
 */
export interface IVariationScorer {
  /**
   * Score a sequence based on user preferences.
   *
   * Scoring factors:
   * - minimizeReversals: Penalizes sequences with more prop reversals
   * - preferContinuous: Rewards sequences with consistent rotation direction
   * - favorMotionType: Rewards sequences matching the dash preference
   *
   * @param sequence - The sequence to score
   * @param preferences - User preferences for generation
   * @returns Detailed score breakdown
   */
  scoreSequence(
    sequence: SequenceData,
    preferences: SpellPreferences
  ): VariationScore;
}
