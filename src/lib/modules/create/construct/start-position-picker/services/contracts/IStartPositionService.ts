/**
 * Start Position Service Interface
 *
 * Simplified interface focused on core functionality.
 */

import type { BeatData, GridMode, PictographData } from "$shared";

export interface IStartPositionService {
  // Core functionality - load and select positions
  getStartPositions(gridMode: GridMode): Promise<PictographData[]>;
  getDefaultStartPositions(gridMode: GridMode): PictographData[];
  getAllStartPositionVariations(gridMode: GridMode): PictographData[];
  selectStartPosition(position: PictographData): void;

  // System method for setting start position in sequence
  setStartPosition(startPosition: BeatData): void;
}
