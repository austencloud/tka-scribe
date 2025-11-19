/**
 * Hand Path Sequence Converter
 *
 * Converts hand paths (arrays of grid positions) into MotionData sequences
 * and merges blue/red hand paths into dual-prop PictographData sequences.
 */

import type {
  GridLocation,
  GridMode,
} from "$shared/pictograph/grid/domain/enums/grid-enums";
import {
  MotionColor,
  MotionType,
  Orientation,
  RotationDirection,
  HandMotionType,
} from "$shared/pictograph/shared/domain/enums/pictograph-enums";
import { PropType } from "$shared/pictograph/prop/domain/enums/PropType";
import { createMotionData } from "$shared/pictograph/shared/domain/models/MotionData";
import { createPictographData } from "$shared/pictograph/shared/domain/factories/createPictographData";
import type { MotionData } from "$shared/pictograph/shared/domain/models/MotionData";
import type { PictographData } from "$shared/pictograph/shared/domain/models/PictographData";
import { HandPathMotionCalculator } from "./HandPathMotionCalculator";

export class HandPathSequenceConverter {
  private calculator: HandPathMotionCalculator;

  constructor() {
    this.calculator = new HandPathMotionCalculator();
  }

  /**
   * Convert a hand path to a sequence of MotionData
   * IMPORTANT: Always uses PropType.HAND regardless of user settings
   * @param handPath - Array of grid locations representing the hand's path
   * @param color - Blue or Red
   * @param userSelectedRotation - The rotation direction the user selected for SHIFT motions
   * @param gridMode - Diamond or Box mode
   */
  convertHandPathToMotions(
    handPath: GridLocation[],
    color: MotionColor,
    userSelectedRotation: RotationDirection,
    gridMode: GridMode
  ): MotionData[] {
    if (handPath.length < 2) {
      throw new Error(
        "Hand path must have at least 2 positions (start and one move)"
      );
    }

    const motions: MotionData[] = [];
    // FORCE PropType.HAND for hand path assembly
    const propType = PropType.HAND;

    // Process each transition in the hand path
    for (let i = 0; i < handPath.length - 1; i++) {
      const from = handPath[i];
      const to = handPath[i + 1];

      const handMotionType = this.calculator.calculateMotionType(
        from,
        to,
        gridMode
      );
      const motionType = this.convertHandMotionTypeToMotionType(
        handMotionType,
        userSelectedRotation
      );
      const rotationDirection = this.getRotationDirection(
        handMotionType,
        userSelectedRotation
      );

      const motion = createMotionData({
        color,
        startLocation: from,
        endLocation: to,
        motionType,
        rotationDirection,
        gridMode,
        propType,
        startOrientation: Orientation.IN,
        endOrientation: Orientation.IN,
        // FLOAT motions use "fl" for turns, others use 0
        turns: motionType === MotionType.FLOAT ? "fl" : 0,
        arrowLocation: from, // Will be calculated by arrow services
        isVisible: true,
      });

      motions.push(motion);
    }

    return motions;
  }

  /**
   * Convert HandMotionType to MotionType based on user-selected rotation
   * IMPORTANT: Hand paths always use FLOAT for SHIFT motions (adjacent movements)
   * to display float arrows which best represent hand path movements
   */
  private convertHandMotionTypeToMotionType(
    handMotionType: HandMotionType,
    userSelectedRotation: RotationDirection
  ): MotionType {
    switch (handMotionType) {
      case HandMotionType.STATIC:
        return MotionType.STATIC;

      case HandMotionType.DASH:
        return MotionType.DASH;

      case HandMotionType.SHIFT:
        // SHIFT motions (adjacent movements) always use FLOAT for hand paths
        // This displays float arrows which best represent hand path movements
        return MotionType.FLOAT;

      default:
        throw new Error(`Unknown HandMotionType: ${handMotionType}`);
    }
  }

  /**
   * Get the rotation direction for a motion
   */
  private getRotationDirection(
    handMotionType: HandMotionType,
    userSelectedRotation: RotationDirection
  ): RotationDirection {
    if (handMotionType === HandMotionType.SHIFT) {
      return userSelectedRotation;
    }
    return RotationDirection.NO_ROTATION;
  }

  /**
   * Create single-prop pictographs from hand path
   * IMPORTANT: Always uses PropType.HAND regardless of user settings
   */
  convertHandPathToPictographs(
    handPath: GridLocation[],
    color: MotionColor,
    userSelectedRotation: RotationDirection,
    gridMode: GridMode
  ): PictographData[] {
    const motions = this.convertHandPathToMotions(
      handPath,
      color,
      userSelectedRotation,
      gridMode
    );

    return motions.map((motion) =>
      createPictographData({
        motions: {
          [color]: motion,
        },
      })
    );
  }

  /**
   * Merge blue and red hand paths into dual-prop pictograph sequence
   * IMPORTANT: Always uses PropType.HAND regardless of user settings
   * @param blueHandPath - Array of grid locations for blue hand
   * @param redHandPath - Array of grid locations for red hand
   * @param userSelectedRotation - The rotation direction for SHIFT motions
   * @param gridMode - Diamond or Box mode
   */
  mergeToDualPropSequence(
    blueHandPath: GridLocation[],
    redHandPath: GridLocation[],
    userSelectedRotation: RotationDirection,
    gridMode: GridMode
  ): PictographData[] {
    // Both hands must have the same length
    if (blueHandPath.length !== redHandPath.length) {
      throw new Error(
        `Blue and red hand paths must be the same length. Blue: ${blueHandPath.length}, Red: ${redHandPath.length}`
      );
    }

    const blueMotions = this.convertHandPathToMotions(
      blueHandPath,
      MotionColor.BLUE,
      userSelectedRotation,
      gridMode
    );

    const redMotions = this.convertHandPathToMotions(
      redHandPath,
      MotionColor.RED,
      userSelectedRotation,
      gridMode
    );

    // Merge into dual-prop pictographs (beat by beat)
    return blueMotions.map((blueMotion, index) => {
      const redMotion = redMotions[index];

      return createPictographData({
        motions: {
          [MotionColor.BLUE]: blueMotion,
          [MotionColor.RED]: redMotion,
        },
      });
    });
  }

  /**
   * Validate that a hand path is valid for the given grid mode
   */
  validateHandPath(handPath: GridLocation[], gridMode: GridMode): boolean {
    if (handPath.length < 2) {
      return false;
    }

    const activePositions = this.calculator.getActivePositions(gridMode);

    // Check all positions are valid for the grid mode
    for (const position of handPath) {
      if (!activePositions.includes(position)) {
        return false;
      }
    }

    return true;
  }
}
