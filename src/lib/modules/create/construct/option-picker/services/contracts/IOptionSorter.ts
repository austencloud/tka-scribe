/**
 * Sorting Service Contract
 *
 * Handles sorting of pictograph options by different methods.
 * Extracted from OptionPickerService for better separation of concerns.
 */

import type { PictographData } from "$shared/pictograph/shared/domain/models/PictographData";
import type { SortMethod } from "../../domain";

export interface IOptionSorter {
  /**
   * Apply sorting to options based on the specified sort method
   */
  applySorting(
    options: PictographData[],
    sortMethod: SortMethod
  ): PictographData[];
}
