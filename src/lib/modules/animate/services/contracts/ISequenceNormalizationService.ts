/**
 * Sequence Normalization Service Interface
 *
 * Handles normalization of sequence data for consistent consumption by UI components.
 * Specifically handles the separation of beat 0 (start position) from the beats array.
 */

import type { BeatData, SequenceData } from "$shared";

export interface NormalizedSequenceData {
  /**
   * Beats array with beatNumber >= 1 (excludes start position)
   */
  beats: BeatData[];

  /**
   * Start position (beat 0), if it exists
   */
  startPosition: BeatData | null;
}

export interface ISequenceNormalizationService {
  /**
   * Normalize sequence data by separating start position from beats array.
   * Some sequences have startPosition as a separate field, others have it mixed
   * in the beats array as beatNumber 0.
   *
   * This ensures consistent data structure for components like BeatGrid.
   *
   * @param sequence The sequence to normalize
   * @returns Normalized data with beats and startPosition separated
   */
  separateBeatsFromStartPosition(
    sequence: SequenceData
  ): NormalizedSequenceData;
}
