/**
 * Service for sorting and grouping gallery sequences
 */

import type { SequenceData } from "$shared";
import { GallerySortMethod } from "../../../shared/domain/enums";

export interface IGallerySortService {
  /**
   * Sort sequences by the specified method
   */
  sortSequences(
    sequences: SequenceData[],
    sortMethod: GallerySortMethod
  ): SequenceData[];

  /**
   * Group sequences into sections based on sort method
   */
  groupSequencesIntoSections(
    sequences: SequenceData[],
    sortMethod: GallerySortMethod
  ): Record<string, SequenceData[]>;
}
