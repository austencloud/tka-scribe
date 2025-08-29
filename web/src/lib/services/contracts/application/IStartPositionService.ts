/**
 * Start Position Service Interface
 *
 * Interface for managing sequence start positions.
 * Handles validation, retrieval, and setting of start positions.
 */

import type { GridMode } from "$lib/domain/core";
import type {
  BeatData,
  PictographData,
  ValidationResult,
} from "$lib/domain/core";

export interface IStartPositionService {
  getAvailableStartPositions(
    propType: string,
    gridMode: GridMode
  ): Promise<BeatData[]>;
  setStartPosition(startPosition: BeatData): Promise<void>;
  validateStartPosition(position: BeatData): ValidationResult;
  getDefaultStartPositions(gridMode: GridMode): Promise<PictographData[]>;
}
