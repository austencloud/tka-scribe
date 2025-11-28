/**
 * Beat Converter Service
 *
 * Handles conversion of PictographData to BeatData and StartPositionData.
 * Single Responsibility: Transform pictograph data into proper domain objects.
 *
 * MIGRATION NOTE: Now properly distinguishes between beats and start positions.
 */

import { injectable } from "inversify";
import type { PictographData, BeatData, MotionData, GridMode } from "$shared";
import type { StartPositionData } from "$create/shared";
import { createMotionData } from "$shared";
import { GridLocation } from "$shared/pictograph/grid/domain/enums/grid-enums";
import {
  MotionType,
  RotationDirection,
  Orientation,
} from "$shared/pictograph/shared/domain/enums/pictograph-enums";
import { createBeatData, createStartPositionData } from "$create/shared";

export interface IBeatConverterService {
  /**
   * Convert PictographData to BeatData - creates proper domain object for beats
   */
  convertToBeat(
    pictograph: PictographData,
    beatNumber: number,
    gridMode: GridMode
  ): BeatData;

  /**
   * Convert PictographData to StartPositionData - creates proper domain object for start positions
   */
  convertToStartPosition(
    pictograph: PictographData,
    gridMode: GridMode
  ): StartPositionData;
}

@injectable()
export class BeatConverterService implements IBeatConverterService {
  /**
   * Convert PictographData to BeatData - creates proper domain object for beats
   *
   * @param pictograph - Source pictograph data
   * @param beatNumber - Beat number (should be >= 1, use convertToStartPosition for start position)
   * @param gridMode - Grid mode for the beat
   */
  convertToBeat(
    pictograph: PictographData,
    beatNumber: number,
    gridMode: GridMode
  ): BeatData {
    // MIGRATION NOTE: If beatNumber === 0, should use convertToStartPosition instead
    // But keep backward compatibility for now
    if (beatNumber === 0) {
      // Silently handle beatNumber 0 for backward compatibility
    }

    const motions = this.ensureMotionsWithGridMode(pictograph, gridMode);

    return createBeatData({
      ...pictograph, // Spread PictographData properties
      beatNumber: beatNumber,
      duration: 1.0,
      blueReversal: false,
      redReversal: false,
      isBlank: false,
      motions, // Override motions with the enhanced version
    });
  }

  /**
   * Convert PictographData to StartPositionData - creates proper domain object for start positions
   *
   * @param pictograph - Source pictograph data
   * @param gridMode - Grid mode for the start position
   */
  convertToStartPosition(
    pictograph: PictographData,
    gridMode: GridMode
  ): StartPositionData {
    const motions = this.ensureMotionsWithGridMode(pictograph, gridMode);

    return createStartPositionData({
      ...pictograph, // Spread PictographData properties
      motions, // Override motions with the enhanced version
      gridPosition: pictograph.startPosition, // Use pictograph's startPosition as gridPosition
    });
  }

  /**
   * Ensure motions exist for both colors with proper defaults and gridMode
   * Shared helper for both beat and start position conversion
   */
  private ensureMotionsWithGridMode(
    pictograph: PictographData,
    gridMode: GridMode
  ): { blue: MotionData; red: MotionData } {
    // Create default motion for missing motion data
    const defaultMotion: MotionData = createMotionData({
      motionType: MotionType.STATIC,
      rotationDirection: RotationDirection.NO_ROTATION,
      startLocation: GridLocation.NORTH,
      endLocation: GridLocation.NORTH,
      turns: 0,
      startOrientation: Orientation.IN,
      endOrientation: Orientation.IN,
      gridMode: gridMode,
    });

    return {
      blue: pictograph.motions.blue
        ? { ...pictograph.motions.blue, gridMode }
        : defaultMotion,
      red: pictograph.motions.red
        ? { ...pictograph.motions.red, gridMode }
        : defaultMotion,
    };
  }
}
