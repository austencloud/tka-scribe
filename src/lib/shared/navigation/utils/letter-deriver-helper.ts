/**
 * Letter Deriver Helper
 *
 * Helper function to derive letters from motion data for deep link sequences.
 * This runs AFTER the sequence is loaded into the module and the pictograph
 * services are available.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { BeatData } from "$lib/modules/create/shared/domain/models/BeatData";
import type { StartPositionData } from "$create/shared";
import type { IMotionQueryHandler } from "$lib/shared/foundation/services/contracts/data";
import type { IGridModeDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridModeDeriver";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { tryResolve, TYPES } from "$lib/shared/inversify/container";

/**
 * Derive letters for all beats in a sequence using the Motion Query Handler
 * This should be called AFTER loading a deep link sequence to populate the letter fields
 *
 * @param sequence - The sequence with motion data but no letters
 * @returns The same sequence with letters populated
 */
export async function deriveLettersForSequence(
  sequence: SequenceData
): Promise<SequenceData> {
  // Try to resolve the required services
  const motionQueryHandler = tryResolve<IMotionQueryHandler>(
    TYPES.IMotionQueryHandler
  );
  const gridModeDeriver = tryResolve<IGridModeDeriver>(
    TYPES.IGridModeDeriver
  );

  if (!motionQueryHandler) {
    console.warn(
      "MotionQueryHandler not available - letters will not be derived"
    );
    return sequence;
  }

  if (!gridModeDeriver) {
    console.warn(
      "GridModeDeriver not available - letters will not be derived"
    );
    return sequence;
  }

  // Helper function to derive letter for a single beat or start position
  const deriveLetterForBeat = async (beat: BeatData | StartPositionData): Promise<BeatData | StartPositionData> => {
    // Skip if letter is already set or if motions are missing
    if (beat.letter !== null || !beat.motions.blue || !beat.motions.red) {
      return beat;
    }

    try {
      // Derive the correct grid mode from the motions
      const gridMode = gridModeDeriver.deriveGridMode(
        beat.motions.blue,
        beat.motions.red
      );

      const letter = await motionQueryHandler.findLetterByMotionConfiguration(
        beat.motions.blue,
        beat.motions.red,
        gridMode
      );

      if (letter) {
        return { ...beat, letter };
      } else {
        // Use appropriate identifier in warning
        const identifier = 'beatNumber' in beat ? `beat ${beat.beatNumber}` : 'start position';
        console.warn(
          `Could not derive letter for ${identifier} (gridMode: ${gridMode}) - no matching pictograph found`
        );
        return beat;
      }
    } catch (error) {
      // Use appropriate identifier in warning
      const identifier = 'beatNumber' in beat ? `beat ${beat.beatNumber}` : 'start position';
      console.warn(
        `Failed to derive letter for ${identifier}:`,
        error
      );
      return beat;
    }
  };

  // Derive letters for all beats in the sequence
  const beatsWithLetters = (await Promise.all(
    sequence.beats.map(deriveLetterForBeat)
  )) as BeatData[];

  // Derive letter for start position if it exists
  let updatedStartPosition: StartPositionData | BeatData | null | undefined = sequence.startPosition;
  let updatedStartingPositionBeat: StartPositionData | BeatData | undefined = sequence.startingPositionBeat;

  if (sequence.startPosition) {
    updatedStartPosition = await deriveLetterForBeat(sequence.startPosition);
  }

  if (sequence.startingPositionBeat) {
    updatedStartingPositionBeat = await deriveLetterForBeat(
      sequence.startingPositionBeat
    );
  }

  // Build the word from the letters
  const word = beatsWithLetters
    .map((beat) => beat.letter ?? "")
    .join("")
    .toUpperCase();

  return {
    ...sequence,
    beats: beatsWithLetters,
    word,
    ...(updatedStartPosition !== undefined && updatedStartPosition !== null && {
      startPosition: updatedStartPosition,
    }),
    ...(updatedStartingPositionBeat !== undefined && {
      startingPositionBeat: updatedStartingPositionBeat,
    }),
  };
}
