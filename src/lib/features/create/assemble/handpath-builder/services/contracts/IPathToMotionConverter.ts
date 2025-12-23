/**
 * Path to Motion Converter Contract
 *
 * Converts hand paths to MotionData for sequence construction.
 * Handles the critical logic of determining PRO vs ANTI based on
 * hand path direction and user-selected rotation direction.
 */

import type { PropType } from "../../../../../../shared/pictograph/prop/domain/enums/PropType";
import type {
  MotionType,
  RotationDirection,
} from "../../../../../../shared/pictograph/shared/domain/enums/pictograph-enums";
import type { MotionData } from "../../../../../../shared/pictograph/shared/domain/models/MotionData";
import type { DrawnHandPath, HandPathSegment } from "../../domain/path-models";

export interface IPathToMotionConverter {
  /**
   * Convert a single hand path segment to MotionData
   *
   * @param segment Hand path segment
   * @param rotationDirection User-selected rotation direction
   * @param propType Prop type for the sequence (should be HAND)
   * @returns MotionData ready for sequence
   */
  convertSegmentToMotion(
    segment: HandPathSegment,
    rotationDirection: RotationDirection,
    propType: PropType
  ): MotionData;

  /**
   * Convert complete hand path to array of MotionData
   *
   * @param handPath Complete hand path
   * @param rotationDirection User-selected rotation direction
   * @param propType Prop type for the sequence
   * @returns Array of MotionData
   */
  convertHandPathToMotions(
    handPath: DrawnHandPath,
    rotationDirection: RotationDirection,
    propType: PropType
  ): MotionData[];

  /**
   * Determine MotionType based on HandMotionType and rotation
   *
   * Logic:
   * - STATIC → MotionType.STATIC
   * - DASH → MotionType.DASH
   * - SHIFT + NO_ROTATION → MotionType.FLOAT
   * - SHIFT + rotation matching hand path → MotionType.PRO
   * - SHIFT + rotation opposite hand path → MotionType.ANTI
   *
   * @param segment Hand path segment
   * @param rotationDirection User-selected rotation direction
   * @returns MotionType
   */
  determineMotionType(
    segment: HandPathSegment,
    rotationDirection: RotationDirection
  ): MotionType;
}
