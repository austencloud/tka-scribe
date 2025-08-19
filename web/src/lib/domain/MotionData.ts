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
  readonly startLocation: Location;
  readonly endLocation: Location;
  readonly turns: number | "fl"; // Can be 'fl' for float motions
  readonly startOrientation: Orientation;
  readonly endOrientation: Orientation;
  readonly isVisible: boolean;

  // Prefloat attributes for letter determination
  readonly prefloat_motion_type?: MotionType | null;
  readonly prefloat_prop_rot_dir?: RotationDirection | null;
}

export function createMotionData(data: Partial<MotionData> = {}): MotionData {
  return {
    motionType: data.motionType ?? MotionType.STATIC,
    rotationDirection: data.rotationDirection ?? RotationDirection.NO_ROTATION,
    startLocation: data.startLocation ?? Location.NORTH,
    endLocation: data.endLocation ?? Location.NORTH,
    turns: data.turns ?? 0.0,
    startOrientation: data.startOrientation ?? Orientation.IN,
    endOrientation: data.endOrientation ?? Orientation.IN,
    isVisible: data.isVisible ?? true,
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
    startLocation: motion.startLocation,
    endLocation: motion.endLocation,
    turns: motion.turns,
    startOrientation: motion.startOrientation,
    endOrientation: motion.endOrientation,
    isVisible: motion.isVisible,
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
  if (data.startLocation !== undefined) {
    partialData.startLocation = data.startLocation;
  }
  if (data.endLocation !== undefined) {
    partialData.endLocation = data.endLocation;
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
  if (data.isVisible !== undefined) {
    partialData.isVisible = data.isVisible;
  }
  if (data.prefloat_motion_type !== undefined) {
    partialData.prefloat_motion_type = data.prefloat_motion_type;
  }
  if (data.prefloat_prop_rot_dir !== undefined) {
    partialData.prefloat_prop_rot_dir = data.prefloat_prop_rot_dir;
  }

  return createMotionData(partialData);
}
