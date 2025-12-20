/**
 * Domain models for beat-pair relationship analysis
 */

export interface BeatPairRelationship {
  keyBeat: number;
  correspondingBeat: number;
  detectedTransformations: string[]; // e.g., ["FLIPPED", "ROTATED_180 + SWAPPED"]
  confirmedTransformation?: string; // User-selected interpretation
}
