/**
 * Letter Deriver Helper
 *
 * Helper function to derive letters from motion data for deep link sequences.
 * This runs AFTER the sequence is loaded into the module and the pictograph
 * services are available.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { BeatData } from "$lib/modules/create/shared/domain/models/BeatData";
import type { IMotionQueryHandler } from "$lib/shared/foundation/services/contracts/data";
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
  // Try to resolve the MotionQueryHandler
  const motionQueryHandler = tryResolve<IMotionQueryHandler>(
    TYPES.IMotionQueryHandler
  );

  if (!motionQueryHandler) {
    console.warn(
      "MotionQueryHandler not available - letters will not be derived"
    );
    return sequence;
  }

  // Helper function to derive letter for a single beat
  const deriveLetterForBeat = async (beat: BeatData): Promise<BeatData> => {
    // Skip if letter is already set or if motions are missing
    if (beat.letter !== null || !beat.motions.blue || !beat.motions.red) {
      return beat;
    }

    try {
      const letter = await motionQueryHandler.findLetterByMotionConfiguration(
        beat.motions.blue,
        beat.motions.red,
        GridMode.DIAMOND
      );

      if (letter) {
        return { ...beat, letter };
      } else {
        console.warn(
          `Could not derive letter for beat ${beat.beatNumber} - no matching pictograph found`
        );
        return beat;
      }
    } catch (error) {
      console.warn(
        `Failed to derive letter for beat ${beat.beatNumber}:`,
        error
      );
      return beat;
    }
  };

  // Derive letters for all beats in the sequence
  const beatsWithLetters = await Promise.all(
    sequence.beats.map(deriveLetterForBeat)
  );

  // Derive letter for start position if it exists
  let updatedStartPosition: BeatData | null | undefined = sequence.startPosition;
  let updatedStartingPositionBeat: BeatData | undefined = sequence.startingPositionBeat;

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
    ...(updatedStartPosition !== undefined && {
      startPosition: updatedStartPosition,
    }),
    ...(updatedStartingPositionBeat !== undefined && {
      startingPositionBeat: updatedStartingPositionBeat,
    }),
  };
}
