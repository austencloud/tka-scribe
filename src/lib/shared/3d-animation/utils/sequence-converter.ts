/**
 * Sequence Converter - Converts SequenceData beats to MotionConfig3D
 *
 * Bridges the gap between the 2D sequence data model and the 3D animation system.
 * Existing sequences default to WALL plane (same as 2D behavior).
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
import type { MotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
import type { MotionConfig3D } from "../domain/models/MotionData3D";
import { Plane } from "../domain/enums/Plane";
import { MotionColor, MotionType, RotationDirection, Orientation } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

/**
 * Represents a single beat's worth of motion configurations for animation
 */
export interface BeatMotionConfigs {
  beatNumber: number;
  blue: MotionConfig3D | null;
  red: MotionConfig3D | null;
}

/**
 * Convert a MotionData object to MotionConfig3D
 * Existing 2D sequences default to WALL plane
 */
export function motionDataToConfig3D(
  motion: MotionData,
  plane: Plane = Plane.WALL
): MotionConfig3D {
  // Handle turns - "fl" (float) becomes 0
  const turns = motion.turns === "fl" ? 0 : (motion.turns as number);

  return {
    plane,
    startLocation: motion.startLocation,
    endLocation: motion.endLocation,
    motionType: motion.motionType,
    rotationDirection: motion.rotationDirection,
    turns,
    startOrientation: motion.startOrientation,
    endOrientation: motion.endOrientation,
  };
}

/**
 * Extract motion configs from a BeatData object
 */
export function beatDataToConfigs(beat: BeatData, plane: Plane = Plane.WALL): BeatMotionConfigs {
  const blueMotion = beat.motions?.[MotionColor.BLUE];
  const redMotion = beat.motions?.[MotionColor.RED];

  return {
    beatNumber: beat.beatNumber ?? 0,
    blue: blueMotion && blueMotion.isVisible !== false
      ? motionDataToConfig3D(blueMotion, plane)
      : null,
    red: redMotion && redMotion.isVisible !== false
      ? motionDataToConfig3D(redMotion, plane)
      : null,
  };
}

/**
 * Convert an entire sequence to an array of beat motion configs
 * Filters out beat 0 (start position) - only returns actual motion beats
 */
export function sequenceToMotionConfigs(
  sequence: SequenceData,
  plane: Plane = Plane.WALL
): BeatMotionConfigs[] {
  if (!sequence.beats || sequence.beats.length === 0) {
    return [];
  }

  // Filter out beat 0 (start position) and convert remaining beats
  return sequence.beats
    .filter(beat => beat.beatNumber !== 0)
    .map(beat => beatDataToConfigs(beat, plane))
    .sort((a, b) => a.beatNumber - b.beatNumber);
}

/**
 * Get start position configs from sequence (beat 0 or startPosition field)
 */
export function getStartPositionConfigs(
  sequence: SequenceData,
  plane: Plane = Plane.WALL
): BeatMotionConfigs | null {
  // Try startPosition field first - cast since both types have compatible motion structures
  if (sequence.startPosition) {
    return beatDataToConfigs(sequence.startPosition as BeatData, plane);
  }

  // Fall back to beat 0 in beats array
  const beat0 = sequence.beats?.find(beat => beat.beatNumber === 0);
  if (beat0) {
    return beatDataToConfigs(beat0, plane);
  }

  return null;
}

/**
 * Create default motion config when no motion data exists
 */
export function createDefaultConfig(plane: Plane = Plane.WALL): MotionConfig3D {
  return {
    plane,
    startLocation: GridLocation.NORTH,
    endLocation: GridLocation.NORTH,
    motionType: MotionType.STATIC,
    rotationDirection: RotationDirection.NO_ROTATION,
    turns: 0,
    startOrientation: Orientation.IN,
    endOrientation: Orientation.IN,
  };
}
