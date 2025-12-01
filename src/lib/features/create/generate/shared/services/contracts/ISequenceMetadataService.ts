import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
import type { GenerationOptions, DifficultyLevel } from "../../domain/models/generate-models";

export interface ISequenceMetadataService {
  generateSequenceName(options: GenerationOptions): string;
  calculateWordFromBeats(beats: BeatData[]): string;
  mapDifficultyToLevel(difficulty: DifficultyLevel): number;
  createGenerationMetadata(options: {
    beatsGenerated: number;
    propContinuity: string;
    blueRotationDirection: string;
    redRotationDirection: string;
    turnIntensity: number;
    level: number;
  }): Record<string, unknown>;
}
