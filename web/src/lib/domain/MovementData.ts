/**
 * Movement Domain Models
 *
 * Domain models for TKA movement generation and pattern recognition.
 * Represents parsed CSV movement data as typed structures.
 * Integrates with existing TKA domain models and enums.
 */

import {
  type GridPosition,
  Timing,
  Direction,
  MotionType,
  RotationDirection,
  Location,
} from "./enums";

/**
 * Represents a single hand's movement parameters
 */
export interface HandMovement {
  readonly motionType: MotionType;
  readonly rotationDirection: RotationDirection;
  readonly startLocation: Location;
  readonly endLocation: Location;
}

/**
 * Represents a complete movement with both hands
 * Maps directly to CSV row structure
 */
export interface MovementData {
  readonly letter: string;
  readonly startPosition: GridPosition;
  readonly endPosition: GridPosition;
  readonly timing: Timing;
  readonly direction: Direction;
  readonly blueHand: HandMovement;
  readonly redHand: HandMovement;
}

/**
 * Represents a pattern template for generating movements
 */
export interface MovementPattern {
  readonly letter: string;
  readonly timing: Timing;
  readonly direction: Direction;
  readonly positionSystem: "alpha" | "beta" | "gamma";
  readonly baseBlueMotion: MotionType;
  readonly baseRedMotion: MotionType;
  readonly baseBlueRotation: RotationDirection;
  readonly baseRedRotation: RotationDirection;
  readonly variations?: PatternVariation[];
}

/**
 * Represents a variation of a base pattern
 */
export interface PatternVariation {
  readonly name: string;
  readonly blueMotionType?: MotionType;
  readonly redMotionType?: MotionType;
  readonly blueRotation?: RotationDirection;
  readonly redRotation?: RotationDirection;
  readonly reverseDirection?: boolean;
}

/**
 * Represents a complete set of movements for a letter
 */
export interface MovementSet {
  readonly letter: string;
  readonly movements: readonly MovementData[];
  readonly pattern: MovementPattern;
}

/**
 * Factory function to create HandMovement
 */
export function createHandMovement(
  data: Partial<HandMovement> = {}
): HandMovement {
  return {
    motionType: data.motionType ?? MotionType.STATIC,
    rotationDirection: data.rotationDirection ?? RotationDirection.NO_ROTATION,
    startLocation: data.startLocation ?? Location.NORTH,
    endLocation: data.endLocation ?? Location.NORTH,
  };
}

/**
 * Factory function to create MovementData
 */
export function createMovementData(
  data: Partial<MovementData> & {
    letter: string;
    startPosition: GridPosition;
    endPosition: GridPosition;
  }
): MovementData {
  return {
    letter: data.letter,
    startPosition: data.startPosition,
    endPosition: data.endPosition,
    timing: data.timing ?? Timing.SPLIT,
    direction: data.direction ?? Direction.SAME,
    blueHand: data.blueHand ?? createHandMovement(),
    redHand: data.redHand ?? createHandMovement(),
  };
}

/**
 * Factory function to create MovementPattern
 */
export function createMovementPattern(
  data: Partial<MovementPattern> & {
    letter: string;
  }
): MovementPattern {
  return {
    letter: data.letter,
    timing: data.timing ?? Timing.SPLIT,
    direction: data.direction ?? Direction.SAME,
    positionSystem: data.positionSystem ?? "alpha",
    baseBlueMotion: data.baseBlueMotion ?? MotionType.PRO,
    baseRedMotion: data.baseRedMotion ?? MotionType.PRO,
    baseBlueRotation: data.baseBlueRotation ?? RotationDirection.CLOCKWISE,
    baseRedRotation: data.baseRedRotation ?? RotationDirection.CLOCKWISE,
    variations: data.variations ?? [],
  };
}

/**
 * Factory function to create MovementSet
 */
export function createMovementSet(data: {
  letter: string;
  movements: MovementData[];
  pattern: MovementPattern;
}): MovementSet {
  return {
    letter: data.letter,
    movements: Object.freeze(data.movements),
    pattern: data.pattern,
  };
}

/**
 * Type guard to check if a position belongs to alpha system
 */
export function isAlphaPosition(position: GridPosition): boolean {
  return position.toString().startsWith("alpha");
}

/**
 * Type guard to check if a position belongs to beta system
 */
export function isBetaPosition(position: GridPosition): boolean {
  return position.toString().startsWith("beta");
}

/**
 * Type guard to check if a position belongs to gamma system
 */
export function isGammaPosition(position: GridPosition): boolean {
  return position.toString().startsWith("gamma");
}

/**
 * Validates a movement data structure
 */
export function isValidMovement(movement: MovementData): boolean {
  return (
    movement.letter.length > 0 &&
    movement.startPosition !== undefined &&
    movement.endPosition !== undefined &&
    movement.timing !== undefined &&
    movement.direction !== undefined &&
    movement.blueHand !== undefined &&
    movement.redHand !== undefined
  );
}
