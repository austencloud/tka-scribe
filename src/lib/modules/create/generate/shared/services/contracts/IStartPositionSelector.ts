/**
 * Start Position Selector Interface
 *
 * Responsible for selecting random start positions for sequence generation.
 */
import type { BeatData, GridMode } from "$shared";
import type { StartPositionData } from "$create/shared";

export interface IStartPositionSelector {
  /**
   * Select a random start position for sequence generation
   * @param gridMode - Grid mode (diamond/box)
   * @returns Promise resolving to StartPositionData (or BeatData for backward compatibility)
   */
  selectStartPosition(gridMode: GridMode): Promise<StartPositionData | BeatData>;
}
