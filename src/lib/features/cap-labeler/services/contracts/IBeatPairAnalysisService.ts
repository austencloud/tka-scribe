import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";

/**
 * Relationship between two beats in a sequence
 */
export interface BeatPairRelationship {
  keyBeat: number;
  correspondingBeat: number;
  detectedTransformations: string[]; // e.g., ["FLIPPED", "ROTATED + SWAPPED"]
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
