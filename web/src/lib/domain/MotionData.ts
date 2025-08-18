/**
 * Motion Domain Models
 *
 * Immutable data structures for motion representation in TKA.
 * Handles prop and arrow motion data with type safety and serialization.
 * Based on modern desktop app's motion_data.py
 */

import { Location, MotionType, Orientation, RotationDirection } from "./enums";

export interface MotionData {
  readonly motionType: MotionType;
  readonly rotationDirection: RotationDirection;
  readonly start_loc: Location;
  readonly end_loc: Location;
  readonly turns: number | "fl"; // Can be 'fl' for float motions
  readonly startOrientation: Orientation;
  readonly endOrientation: Orientation;
  readonly is_visible: boolean;

  // Prefloat attributes for letter determination
  readonly prefloat_motion_type?: MotionType | null;
  readonly prefloat_prop_rot_dir?: RotationDirection | null;
}

export function createMotionData(data: Partial<MotionData> = {}): MotionData {
  return {
    motionType: data.motionType ?? MotionType.STATIC,
    rotationDirection: data.rotationDirection ?? RotationDirection.NO_ROTATION,
    start_loc: data.start_loc ?? Location.NORTH,
    end_loc: data.end_loc ?? Location.NORTH,
    turns: data.turns ?? 0.0,
    startOrientation: data.startOrientation ?? Orientation.IN,
    endOrientation: data.endOrientation ?? Orientation.IN,
    is_visible: data.is_visible ?? true,
    prefloat_motion_type: data.prefloat_motion_type ?? null,
    prefloat_prop_rot_dir: data.prefloat_prop_rot_dir ?? null,
  };
}

export function updateMotionData(
  motion: MotionData,
  updates: Partial<MotionData>
): MotionData {
  return {
    ...motion,
    ...updates,
  };
}

export function isValidMotion(motion: MotionData): boolean {
  // Handle 'fl' turns for float motions
  if (
    motion.turns !== "fl" &&
    typeof motion.turns === "number" &&
    motion.turns < 0
  ) {
    return false;
  }
  return true;
}

export function isFloatMotion(motion: MotionData): boolean {
  return motion.motionType === MotionType.FLOAT;
}

export function hasPrefloatData(motion: MotionData): boolean {
  return (
    motion.prefloat_motion_type != null || motion.prefloat_prop_rot_dir != null
  );
}

export function motionDataToObject(
  motion: MotionData
): Record<string, unknown> {
  return {
    motionType: motion.motionType,
    rotationDirection: motion.rotationDirection,
    start_loc: motion.start_loc,
    end_loc: motion.end_loc,
    turns: motion.turns,
    startOrientation: motion.startOrientation,
    endOrientation: motion.endOrientation,
    is_visible: motion.is_visible,
    prefloat_motion_type: motion.prefloat_motion_type,
    prefloat_prop_rot_dir: motion.prefloat_prop_rot_dir,
  };
}

export function motionDataFromObject(
  data: Record<string, unknown>
): MotionData {
  const partialData: Record<string, unknown> = {};

  if (data.motionType !== undefined) {
    partialData.motionType = data.motionType;
  }
  if (data.rotationDirection !== undefined) {
    partialData.rotationDirection = data.rotationDirection;
  }
  if (data.start_loc !== undefined) {
    partialData.start_loc = data.start_loc;
  }
  if (data.end_loc !== undefined) {
    partialData.end_loc = data.end_loc;
  }
  if (data.turns !== undefined) {
    partialData.turns = data.turns;
  }
  if (data.startOrientation !== undefined) {
    partialData.startOrientation = data.startOrientation;
  }
  if (data.endOrientation !== undefined) {
    partialData.endOrientation = data.endOrientation;
  }
  if (data.is_visible !== undefined) {
    partialData.is_visible = data.is_visible;
  }
  if (data.prefloat_motion_type !== undefined) {
    partialData.prefloat_motion_type = data.prefloat_motion_type;
  }
  if (data.prefloat_prop_rot_dir !== undefined) {
    partialData.prefloat_prop_rot_dir = data.prefloat_prop_rot_dir;
  }

  return createMotionData(partialData);
}
