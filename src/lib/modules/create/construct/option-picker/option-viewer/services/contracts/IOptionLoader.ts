/**
 * Option Loader Service Contract
 *
 * Handles loading of available pictograph options based on sequence context.
 * Extracted from OptionPickerService for better separation of concerns.
 */

import { GridMode } from "$shared/pictograph/grid/domain/enums/grid-enums";
import type { PictographData } from "$shared/pictograph/shared/domain/models/PictographData";

export interface IOptionLoader {
  /**
   * Load available options based on current sequence and grid mode
   */
  loadOptions(
    sequence: PictographData[],
    gridMode: GridMode
  ): Promise<PictographData[]>;
}
