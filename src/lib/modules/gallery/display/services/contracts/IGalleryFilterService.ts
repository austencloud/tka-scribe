/**
 * Service for filtering gallery sequences
 */

import type { SequenceData } from "$shared";
import type { GalleryFilterValue } from "../../../../../shared/persistence/domain";
import { GalleryFilterType } from "../../../../../shared/persistence/domain";

export interface IGalleryFilterService {
  /**
   * Apply a filter to a list of sequences
   */
  applyFilter(
    sequences: SequenceData[],
    filterType: GalleryFilterType,
    filterValue: GalleryFilterValue
  ): SequenceData[];

  /**
   * Get available filter options for a given filter type
   */
  getFilterOptions(
    filterType: GalleryFilterType,
    sequences: SequenceData[]
  ): string[];
}
