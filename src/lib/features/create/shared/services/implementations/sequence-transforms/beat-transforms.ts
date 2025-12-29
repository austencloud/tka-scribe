/**
 * Beat Transforms
 *
 * Pure functions that transform BeatData objects.
 * Composes motion transforms with position updates.
 */

import type { BeatData } from "../../../domain/models/BeatData";
import { createBeatData } from "../../../domain/factories/createBeatData";
import type {
  GridLocation,
  GridPosition,
} from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { MotionColor } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { Letter } from "$lib/shared/foundation/domain/models/Letter";
import type { IMotionQueryHandler } from "$lib/shared/foundation/services/contracts/data/data-contracts";
import type { IGridPositionDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridPositionDeriver";
import {
  VERTICAL_MIRROR_POSITION_MAP,
  HORIZONTAL_MIRROR_POSITION_MAP,
  SWAPPED_POSITION_MAP,
} from "../../../../generate/circular/domain/constants/strict-loop-position-maps";
import {
  mirrorMotion,
  flipMotion,
  rotateMotion,
  swapMotionColor,
  invertMotion,
  rewindMotion,
} from "./motion-transforms";
import { getToggledGridMode } from "./rotation-helpers";

/**
 * Mirror a beat across the vertical axis (E ↔ W).
 */
export function mirrorBeat(beat: BeatData): BeatData {
  if (beat.isBlank || !beat) return beat;

  const mirroredMotions = { ...beat.motions };
  if (beat.motions[MotionColor.BLUE]) {
    mirroredMotions[MotionColor.BLUE] = mirrorMotion(
      beat.motions[MotionColor.BLUE]
    );
  }
  if (beat.motions[MotionColor.RED]) {
    mirroredMotions[MotionColor.RED] = mirrorMotion(
      beat.motions[MotionColor.RED]
    );
  }

  return createBeatData({
    ...beat,
    startPosition: beat.startPosition
      ? VERTICAL_MIRROR_POSITION_MAP[beat.startPosition]
      : null,
    endPosition: beat.endPosition
      ? VERTICAL_MIRROR_POSITION_MAP[beat.endPosition]
      : null,
    motions: mirroredMotions,
  });
}

/**
 * Flip a beat across the horizontal axis (N ↔ S).
 */
export function flipBeat(beat: BeatData): BeatData {
  if (beat.isBlank || !beat) return beat;

  const flippedMotions = { ...beat.motions };
  if (beat.motions[MotionColor.BLUE]) {
    flippedMotions[MotionColor.BLUE] = flipMotion(
      beat.motions[MotionColor.BLUE]
    );
  }
  if (beat.motions[MotionColor.RED]) {
    flippedMotions[MotionColor.RED] = flipMotion(beat.motions[MotionColor.RED]);
  }

  return createBeatData({
    ...beat,
    startPosition: beat.startPosition
      ? HORIZONTAL_MIRROR_POSITION_MAP[beat.startPosition]
      : null,
    endPosition: beat.endPosition
      ? HORIZONTAL_MIRROR_POSITION_MAP[beat.endPosition]
      : null,
    motions: flippedMotions,
  });
}

/**
 * Rotate a beat by 45° steps.
 * Derives new positions from rotated locations.
 */
export function rotateBeat(
  beat: BeatData,
  rotationAmount: number,
  positionDeriver: IGridPositionDeriver
): BeatData {
  if (beat.isBlank || !beat) return beat;

  const currentGridMode =
    beat.motions[MotionColor.BLUE]?.gridMode ?? GridMode.DIAMOND;
  const newGridMode = getToggledGridMode(currentGridMode, rotationAmount);

  const rotatedMotions = { ...beat.motions };
  if (beat.motions[MotionColor.BLUE]) {
    rotatedMotions[MotionColor.BLUE] = rotateMotion(
      beat.motions[MotionColor.BLUE],
      rotationAmount
    );
  }
  if (beat.motions[MotionColor.RED]) {
    rotatedMotions[MotionColor.RED] = rotateMotion(
      beat.motions[MotionColor.RED],
      rotationAmount
    );
  }

  // Derive new positions from rotated locations
  const blueMotion = rotatedMotions[MotionColor.BLUE];
  const redMotion = rotatedMotions[MotionColor.RED];

  let rotatedStartPosition = beat.startPosition ?? null;
  let rotatedEndPosition = beat.endPosition ?? null;

  if (blueMotion && redMotion) {
    rotatedStartPosition = positionDeriver.getGridPositionFromLocations(
      blueMotion.startLocation,
      redMotion.startLocation
    );
    rotatedEndPosition = positionDeriver.getGridPositionFromLocations(
      blueMotion.endLocation,
      redMotion.endLocation
    );
  }

  return createBeatData({
    ...beat,
    startPosition: rotatedStartPosition,
    endPosition: rotatedEndPosition,
    motions: rotatedMotions,
  });
}

/**
 * Swap colors in a beat (blue ↔ red).
 */
export function colorSwapBeat(beat: BeatData): BeatData {
  if (beat.isBlank || !beat) return beat;

  const swappedMotions = {
    [MotionColor.BLUE]: beat.motions[MotionColor.RED]
      ? swapMotionColor(beat.motions[MotionColor.RED], MotionColor.BLUE)
      : undefined,
    [MotionColor.RED]: beat.motions[MotionColor.BLUE]
      ? swapMotionColor(beat.motions[MotionColor.BLUE], MotionColor.RED)
      : undefined,
  };

  return createBeatData({
    ...beat,
    startPosition: beat.startPosition
      ? SWAPPED_POSITION_MAP[beat.startPosition]
      : null,
    endPosition: beat.endPosition
      ? SWAPPED_POSITION_MAP[beat.endPosition]
      : null,
    motions: swappedMotions,
    blueReversal: beat.redReversal,
    redReversal: beat.blueReversal,
  });
}

/**
 * Invert a beat's motion types (PRO ↔ ANTI) and rotation directions (CW ↔ CCW).
 * Looks up correct letter from dataset.
 */
export async function invertBeat(
  beat: BeatData,
  gridMode: GridMode,
  motionQueryHandler: IMotionQueryHandler
): Promise<BeatData> {
  if (beat.isBlank || !beat) return beat;

  const invertedMotions = { ...beat.motions };
  if (beat.motions[MotionColor.BLUE]) {
    invertedMotions[MotionColor.BLUE] = invertMotion(
      beat.motions[MotionColor.BLUE]
    );
  }
  if (beat.motions[MotionColor.RED]) {
    invertedMotions[MotionColor.RED] = invertMotion(
      beat.motions[MotionColor.RED]
    );
  }

  // Look up correct letter from dataset
  let correctLetter: Letter | null = beat.letter ?? null;
  if (invertedMotions[MotionColor.BLUE] && invertedMotions[MotionColor.RED]) {
    try {
      const foundLetter =
        await motionQueryHandler.findLetterByMotionConfiguration(
          invertedMotions[MotionColor.BLUE],
          invertedMotions[MotionColor.RED],
          gridMode
        );
      if (foundLetter) {
        correctLetter = foundLetter as Letter;
      }
    } catch (error) {
      console.warn(
        `Failed to find letter for inverted beat ${beat.beatNumber}:`,
        error
      );
    }
  }

  return createBeatData({
    ...beat,
    letter: correctLetter,
    motions: invertedMotions,
  });
}

/**
 * Rewind a beat (swap start/end, flip rotation).
 * Looks up correct letter from dataset.
 */
export async function rewindBeat(
  beat: BeatData,
  newBeatNumber: number,
  gridMode: GridMode,
  motionQueryHandler: IMotionQueryHandler
): Promise<BeatData> {
  if (beat.isBlank || !beat) {
    return { ...beat, beatNumber: newBeatNumber };
  }

  const rewindMotions = { ...beat.motions };
  if (beat.motions[MotionColor.BLUE]) {
    rewindMotions[MotionColor.BLUE] = rewindMotion(
      beat.motions[MotionColor.BLUE]
    );
  }
  if (beat.motions[MotionColor.RED]) {
    rewindMotions[MotionColor.RED] = rewindMotion(
      beat.motions[MotionColor.RED]
    );
  }

  // Look up correct letter from dataset
  let correctLetter: Letter | null = beat.letter ?? null;
  if (rewindMotions[MotionColor.BLUE] && rewindMotions[MotionColor.RED]) {
    try {
      const foundLetter =
        await motionQueryHandler.findLetterByMotionConfiguration(
          rewindMotions[MotionColor.BLUE],
          rewindMotions[MotionColor.RED],
          gridMode
        );
      if (foundLetter) {
        correctLetter = foundLetter as Letter;
      }
    } catch (error) {
      console.error(`Error looking up letter for rewound beat:`, error);
    }
  }

  return createBeatData({
    ...beat,
    beatNumber: newBeatNumber,
    startPosition: beat.endPosition ?? null,
    endPosition: beat.startPosition ?? null,
    motions: rewindMotions,
    letter: correctLetter,
    // Clear reversal flags - they must be recalculated based on the new sequence order
    blueReversal: false,
    redReversal: false,
  });
}
