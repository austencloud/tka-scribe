/**
 * Start Position Transforms
 *
 * Pure functions that transform StartPositionData objects.
 * Similar to beat transforms but without beat-specific fields.
 */

import type { StartPositionData } from "../../../domain/models/StartPositionData";
import { createStartPositionData } from "../../../domain/factories/createStartPositionData";
import type { GridPosition } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { MotionColor } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { createMotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
import type { IOrientationCalculator } from "$lib/shared/pictograph/prop/services/contracts/IOrientationCalculator";
import type { IGridPositionDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridPositionDeriver";
import {
  VERTICAL_MIRROR_POSITION_MAP,
  HORIZONTAL_MIRROR_POSITION_MAP,
  SWAPPED_POSITION_MAP,
} from "../../../../generate/circular/domain/constants/strict-cap-position-maps";
import {
  mirrorMotion,
  flipMotion,
  rotateMotion,
  swapMotionColor,
  invertMotion,
} from "./motion-transforms";
import { invertMotionType, reverseRotationDirection } from "./rotation-helpers";

/**
 * Mirror a start position across the vertical axis (E ↔ W).
 */
export function mirrorStartPosition(
  startPos: StartPositionData
): StartPositionData {
  const mirroredMotions = { ...startPos.motions };

  if (startPos.motions[MotionColor.BLUE]) {
    mirroredMotions[MotionColor.BLUE] = mirrorMotion(
      startPos.motions[MotionColor.BLUE]
    );
  }
  if (startPos.motions[MotionColor.RED]) {
    mirroredMotions[MotionColor.RED] = mirrorMotion(
      startPos.motions[MotionColor.RED]
    );
  }

  return createStartPositionData({
    ...startPos,
    motions: mirroredMotions,
    gridPosition: startPos.gridPosition
      ? VERTICAL_MIRROR_POSITION_MAP[startPos.gridPosition]
      : null,
  });
}

/**
 * Flip a start position across the horizontal axis (N ↔ S).
 */
export function flipStartPosition(
  startPos: StartPositionData
): StartPositionData {
  const flippedMotions = { ...startPos.motions };

  if (startPos.motions[MotionColor.BLUE]) {
    flippedMotions[MotionColor.BLUE] = flipMotion(
      startPos.motions[MotionColor.BLUE]
    );
  }
  if (startPos.motions[MotionColor.RED]) {
    flippedMotions[MotionColor.RED] = flipMotion(
      startPos.motions[MotionColor.RED]
    );
  }

  return createStartPositionData({
    ...startPos,
    motions: flippedMotions,
    gridPosition: startPos.gridPosition
      ? HORIZONTAL_MIRROR_POSITION_MAP[startPos.gridPosition]
      : null,
  });
}

/**
 * Rotate a start position by 45° steps.
 * Derives new gridPosition from rotated motion locations.
 */
export function rotateStartPosition(
  startPos: StartPositionData,
  rotationAmount: number,
  positionDeriver: IGridPositionDeriver
): StartPositionData {
  const rotatedMotions = { ...startPos.motions };

  if (startPos.motions[MotionColor.BLUE]) {
    rotatedMotions[MotionColor.BLUE] = rotateMotion(
      startPos.motions[MotionColor.BLUE],
      rotationAmount
    );
  }
  if (startPos.motions[MotionColor.RED]) {
    rotatedMotions[MotionColor.RED] = rotateMotion(
      startPos.motions[MotionColor.RED],
      rotationAmount
    );
  }

  // Derive new gridPosition from rotated motion locations
  // This correctly handles the DIAMOND ↔ BOX mode transitions
  let rotatedGridPosition: GridPosition | null = startPos.gridPosition ?? null;
  const blueMotion = rotatedMotions[MotionColor.BLUE];
  const redMotion = rotatedMotions[MotionColor.RED];

  if (blueMotion && redMotion) {
    rotatedGridPosition = positionDeriver.getGridPositionFromLocations(
      blueMotion.startLocation,
      redMotion.startLocation
    );
  }

  return createStartPositionData({
    ...startPos,
    motions: rotatedMotions,
    gridPosition: rotatedGridPosition,
  });
}

/**
 * Swap colors in a start position (blue ↔ red).
 */
export function colorSwapStartPosition(
  startPos: StartPositionData
): StartPositionData {
  const swappedMotions = {
    [MotionColor.BLUE]: startPos.motions[MotionColor.RED]
      ? swapMotionColor(startPos.motions[MotionColor.RED], MotionColor.BLUE)
      : undefined,
    [MotionColor.RED]: startPos.motions[MotionColor.BLUE]
      ? swapMotionColor(startPos.motions[MotionColor.BLUE], MotionColor.RED)
      : undefined,
  };

  return createStartPositionData({
    ...startPos,
    motions: swappedMotions,
    gridPosition: startPos.gridPosition
      ? SWAPPED_POSITION_MAP[startPos.gridPosition]
      : null,
  });
}

/**
 * Invert a start position's motion types and rotation directions.
 * Recalculates endOrientation based on the new motion.
 */
export function invertStartPosition(
  startPos: StartPositionData,
  orientationCalculator: IOrientationCalculator
): StartPositionData {
  const invertedMotions = { ...startPos.motions };

  if (startPos.motions[MotionColor.BLUE]) {
    const blueMotion = startPos.motions[MotionColor.BLUE];
    const invertedBlueMotion = createMotionData({
      ...blueMotion,
      motionType: invertMotionType(blueMotion.motionType),
      rotationDirection: reverseRotationDirection(blueMotion.rotationDirection),
    });
    const newEndOrientation = orientationCalculator.calculateEndOrientation(
      invertedBlueMotion,
      MotionColor.BLUE
    );
    invertedMotions[MotionColor.BLUE] = {
      ...invertedBlueMotion,
      endOrientation: newEndOrientation,
    };
  }

  if (startPos.motions[MotionColor.RED]) {
    const redMotion = startPos.motions[MotionColor.RED];
    const invertedRedMotion = createMotionData({
      ...redMotion,
      motionType: invertMotionType(redMotion.motionType),
      rotationDirection: reverseRotationDirection(redMotion.rotationDirection),
    });
    const newEndOrientation = orientationCalculator.calculateEndOrientation(
      invertedRedMotion,
      MotionColor.RED
    );
    invertedMotions[MotionColor.RED] = {
      ...invertedRedMotion,
      endOrientation: newEndOrientation,
    };
  }

  return createStartPositionData({
    ...startPos,
    motions: invertedMotions,
  });
}
