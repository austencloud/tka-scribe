/**
 * Option Data Service Interface
 *
 * Interface for managing motion options and compatibility.
 * Handles filtering, validation, and conversion of motion options.
 */

import type { DifficultyLevel, OptionFilters } from "../core-types";
import type {
  MotionType,
  PictographData,
  SequenceData,
  ValidationResult,
} from "../domain-types";

export interface IOptionDataService {
  getNextOptions(
    currentSequence: SequenceData,
    filters?: OptionFilters
  ): Promise<PictographData[]>;
  filterOptionsByDifficulty(
    options: PictographData[],
    level: DifficultyLevel
  ): PictographData[];
  validateOptionCompatibility(
    option: PictographData,
    sequence: SequenceData
  ): ValidationResult;
  getAvailableMotionTypes(): MotionType[];
  convertCsvRowToPictographData(
    row: Record<string, string>,
    index: number
  ): PictographData | null;
}
