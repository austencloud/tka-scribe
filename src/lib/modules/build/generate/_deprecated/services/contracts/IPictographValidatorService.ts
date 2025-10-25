import type { PictographData } from "$shared";
import { GridPosition } from "$shared";

export interface IPictographValidatorService {
  validatePictograph(pictograph: PictographData): boolean;
  validatePictographs(pictographs: PictographData[]): boolean;
  getValidationErrors(pictograph: PictographData): string[];
  validatePositionSequence(positions: GridPosition[]): boolean;
}

