/**
 * Start Position Service Interface
 *
 * Simplified interface focused on core functionality.
 */

import type { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";

export interface IStartPositionService {
  // Core functionality - load and select positions
  getStartPositions(gridMode: GridMode): Promise<PictographData[]>;
  getDefaultStartPositions(gridMode: GridMode): PictographData[];
  getAllStartPositionVariations(gridMode: GridMode): PictographData[];
  selectStartPosition(position: PictographData): void;

  // System method for setting start position in sequence
  setStartPosition(startPosition: BeatData): void;
}
