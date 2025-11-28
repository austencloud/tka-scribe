/**
 * Start Position Service Interface
 *
 * Simplified interface focused on core functionality.
 */

import { GridMode } from "$shared/pictograph/grid/domain/enums/grid-enums";
import type { BeatData } from "$lib/modules/create/shared/domain/models/BeatData";
import type { PictographData } from "$shared/pictograph/shared/domain/models/PictographData";

export interface IStartPositionService {
  // Core functionality - load and select positions
  getStartPositions(gridMode: GridMode): Promise<PictographData[]>;
  getDefaultStartPositions(gridMode: GridMode): PictographData[];
  getAllStartPositionVariations(gridMode: GridMode): PictographData[];
  selectStartPosition(position: PictographData): void;

  // System method for setting start position in sequence
  setStartPosition(startPosition: BeatData): void;
}
