/**
 * Position Deriver Helper
 *
 * Helper function to derive start/end positions from motion data for deep link sequences.
 * This runs AFTER the sequence is loaded and calculates grid positions based on hand locations.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { BeatData } from "$lib/modules/create/shared/domain/models/BeatData";
import type { StartPositionData } from "$create/shared";
import type { IGridPositionDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridPositionDeriver";
import { tryResolve, TYPES } from "$lib/shared/inversify/container";
import type { GridPosition } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

/**
 * Derive start and end positions for all beats in a sequence using GridPositionDeriver
 * This should be called AFTER loading a deep link sequence to populate the position fields
 *
 * @param sequence - The sequence with motion data but no positions
 * @returns The same sequence with positions populated
 */
export async function derivePositionsForSequence(
  sequence: SequenceData
): Promise<SequenceData> {
  // Try to resolve the required service
  const gridPositionDeriver = tryResolve<IGridPositionDeriver>(
    TYPES.IGridPositionDeriver
  );

  if (!gridPositionDeriver) {
    console.warn(
      "GridPositionDeriver not available - positions will not be derived"
    );
    return sequence;
  }

  // Helper function to derive positions for a single beat
  const derivePositionsForBeat = (beat: BeatData | StartPositionData): BeatData | StartPositionData => {
    // Skip if positions are already set or if motions are missing
    if (
      (beat.startPosition !== null && beat.endPosition !== null) ||
      !beat.motions.blue ||
      !beat.motions.red
    ) {
      return beat;
    }

    try {
      // Calculate start position from starting hand locations
      const startPosition: GridPosition = gridPositionDeriver.getGridPositionFromLocations(
        beat.motions.blue.startLocation,
        beat.motions.red.startLocation
      );

      // Calculate end position from ending hand locations
      const endPosition: GridPosition = gridPositionDeriver.getGridPositionFromLocations(
        beat.motions.blue.endLocation,
        beat.motions.red.endLocation
      );

      return {
        ...beat,
        startPosition,
        endPosition,
      };
    } catch (error) {
      // Use appropriate identifier in warning
      const identifier = "beatNumber" in beat ? `beat ${beat.beatNumber}` : "start position";
      console.warn(
        `Failed to derive positions for ${identifier}:`,
        error
      );
      return beat;
    }
  };

  // Derive positions for all beats in the sequence
  const beatsWithPositions = sequence.beats.map(derivePositionsForBeat) as BeatData[];

  // Derive positions for start position if it exists
  let updatedStartPosition: StartPositionData | BeatData | null | undefined = sequence.startPosition;
  let updatedStartingPositionBeat: StartPositionData | BeatData | undefined = sequence.startingPositionBeat;

  if (sequence.startPosition) {
    updatedStartPosition = derivePositionsForBeat(sequence.startPosition);
  }

  if (sequence.startingPositionBeat) {
    updatedStartingPositionBeat = derivePositionsForBeat(
      sequence.startingPositionBeat
    );
  }

  return {
    ...sequence,
    beats: beatsWithPositions,
    ...(updatedStartPosition !== undefined && updatedStartPosition !== null && {
      startPosition: updatedStartPosition,
    }),
    ...(updatedStartingPositionBeat !== undefined && {
      startingPositionBeat: updatedStartingPositionBeat,
    }),
  };
}
