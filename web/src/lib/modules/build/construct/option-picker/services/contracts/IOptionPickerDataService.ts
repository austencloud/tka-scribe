/**
 * Option Picker Data Service Interface
 *
 * Interface for managing option picker data operations, including loading,
 * filtering, sorting, and selection of pictograph options.
 */

import type { PictographData } from "$shared";

export interface IOptionPickerDataService {
  /**
   * Load available options based on current sequence
   */
  loadOptionsFromSequence(
    sequence: PictographData[]
  ): Promise<PictographData[]>;

  /**
   * Select an option and handle any side effects
   */
  selectOption(option: PictographData): Promise<void>;

  /**
   * Get filtered and sorted options based on current criteria
   */
  getFilteredOptions(
    options: PictographData[],
    sortMethod: string,
    reversalFilter: string
  ): PictographData[];

  /**
   * Calculate end position from motion data
   */
  getEndPosition(pictographData: PictographData): string | null;
}
