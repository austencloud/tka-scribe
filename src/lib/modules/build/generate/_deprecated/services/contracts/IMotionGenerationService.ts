import type { BeatData, MotionData } from "$shared";
import { MotionColor } from "$shared";
import type { GenerationOptions } from "../../domain/models/generate-models";

export interface IMotionGenerationService {
  generateMotion(
    color: MotionColor,
    options: GenerationOptions,
    previousBeats: BeatData[]
  ): Promise<MotionData>;
  generateConstrainedMotion(
    color: MotionColor,
    options: GenerationOptions,
    previousBeats: BeatData[],
    constraints: {
      allowedMotionTypes?: string[];
      allowedStartLocations?: string[];
      allowedEndLocations?: string[];
    }
  ): Promise<MotionData>;
  validateMotion(
    motion: MotionData,
    color: MotionColor,
    previousBeats: BeatData[]
  ): { isValid: boolean; reasons: string[] };
}

