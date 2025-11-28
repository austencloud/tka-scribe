/**
 * Start Position Selector Interface
 *
 * Responsible for selecting random start positions for sequence generation.
 */
import type { BeatData } from "$lib/modules/create/shared/domain/models/BeatData";
import { GridMode } from "$shared/pictograph/grid/domain/enums/grid-enums";
import type { StartPositionData } from "$lib/modules/create/shared/domain/models/StartPositionData";

export interface IStartPositionSelector {
  /**
   * Select a random start position for sequence generation
   * @param gridMode - Grid mode (diamond/box)
   * @returns Promise resolving to StartPositionData (or BeatData for backward compatibility)
   */
  selectStartPosition(gridMode: GridMode): Promise<StartPositionData | BeatData>;
}
