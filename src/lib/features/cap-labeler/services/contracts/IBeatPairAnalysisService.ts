import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";

/**
 * Relationship between two beats in a sequence
 */
export interface BeatPairRelationship {
  keyBeat: number;
  correspondingBeat: number;
  /** Primary transformation (contextual, after priority filtering) */
  detectedTransformations: string[]; // e.g., ["ROTATED 180+SWAPPED"]
  /** All valid transformations this pair satisfies (before filtering) */
  allValidTransformations?: string[]; // e.g., ["ROTATED 180+SWAPPED", "MIRRORED+INVERTED"]
  confirmedTransformation?: string; // User-selected interpretation
}

/**
 * Service for analyzing relationships between beat pairs
 */
export interface IBeatPairAnalysisService {
  /**
   * Analyze a pair of beats and detect CAP transformations
   */
  analyzeBeatPair(beat1: BeatData, beat2: BeatData): BeatPairRelationship;
}
