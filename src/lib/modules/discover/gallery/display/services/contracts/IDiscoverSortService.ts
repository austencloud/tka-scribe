/**
 * Service for sorting and grouping gallery sequences
 */

import type { SequenceData } from "$shared";
import type { ExploreSortMethod } from "../../../../shared/domain/enums";

export interface IDiscoverSortService {
  /**
   * Sort sequences by the specified method
   */
  sortSequences(
    sequences: SequenceData[],
    sortMethod: ExploreSortMethod
  ): SequenceData[];

  /**
   * Group sequences into sections based on sort method
   */
  groupSequencesIntoSections(
    sequences: SequenceData[],
    sortMethod: ExploreSortMethod
  ): Record<string, SequenceData[]>;
}
