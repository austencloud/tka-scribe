import type { Letter, MotionData, PictographData } from "$shared";
import type { LetterDerivationResult } from "../../domain/models/generate-models";

export interface ILetterDeriver {
  deriveLetterFromMotions(
    blueMotion: MotionData,
    redMotion: MotionData
  ): LetterDerivationResult;
  deriveLetterFromPictograph(
    pictograph: PictographData
  ): LetterDerivationResult;
  validateLetterMatch(
    letter: Letter,
    blueMotion: MotionData,
    redMotion: MotionData
  ): boolean;
}

