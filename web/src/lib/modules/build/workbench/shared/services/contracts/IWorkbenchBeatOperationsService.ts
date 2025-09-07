/**
 * Workbench Beat Operations Service Contract
 * 
 * Service for beat manipulation operations specific to the workbench/construction interface
 */

import type { BeatData, SequenceData } from "$shared";

export interface IWorkbenchBeatOperationsService {
  /**
   * Add a beat to a sequence
   * @param sequenceId - Sequence identifier
   * @param beatData - Optional beat data (defaults will be used if not provided)
   * @returns Promise resolving to updated sequence
   */
  addBeat(
    sequenceId: string,
    beatData?: Partial<BeatData>
  ): Promise<SequenceData>;

  /**
   * Set the construction start position for a sequence
   * @param sequenceId - Sequence identifier
   * @param startPosition - Start position beat data
   * @returns Promise resolving to updated sequence
   */
  setConstructionStartPosition(
    sequenceId: string,
    startPosition: BeatData
  ): Promise<SequenceData>;
}
