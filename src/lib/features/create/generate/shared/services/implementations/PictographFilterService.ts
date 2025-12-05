/**
 * Pictograph Filter Service
 *
 * Handles all filtering logic for pictograph selection during sequence generation.
 * Single Responsibility: Filter pictographs by various criteria (rotation, continuity).
 */

import { injectable } from "inversify";
import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
import { RotationDirection } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { FilteringError } from "../../domain/errors/generation-errors";

// Legacy constants for rotation directions
const ROTATION_DIRS = {
  CLOCKWISE: RotationDirection.CLOCKWISE,
  COUNTER_CLOCKWISE: RotationDirection.COUNTER_CLOCKWISE,
  noRotation: RotationDirection.NO_ROTATION,
} as const;

export interface IPictographFilterService {
  /**
   * Filter pictographs by continuity - next beat's start position must match last beat's end position
   */
  filterByContinuity(
    options: PictographData[],
    lastBeat: BeatData | StartPositionData | null
  ): PictographData[];

  /**
   * Filter pictographs by rotation direction for continuous prop continuity
   */
  filterByRotation(
    options: PictographData[],
    blueRotationDirection: string,
    redRotationDirection: string
  ): PictographData[];

  /**
   * Filter for start positions (where startPosition === endPosition)
   */
  filterStartPositions(options: PictographData[]): PictographData[];

  /**
   * Filter Type 6 (static) pictographs based on difficulty level
   * Level 1: No turns allowed, so filter out ALL Type 6 pictographs
   * Level 2+: Filter out Type 6 pictographs that have no turns applied
   */
  filterStaticType6(options: PictographData[], level: number): PictographData[];

  /**
   * Select random item from array
   */
  selectRandom<T>(array: T[]): T;
}

@injectable()
export class PictographFilterService implements IPictographFilterService {
  /**
   * Filter by continuity - next beat's start position must match last beat's end position
   */
  filterByContinuity(
    options: PictographData[],
    lastBeat: BeatData | StartPositionData | null
  ): PictographData[] {
    if (!lastBeat?.endPosition) {
      return options; // No filtering needed for first beat or if no end position
    }

    const lastEndPosition = lastBeat.endPosition.toLowerCase();

    const filtered = options.filter((option: PictographData) => {
      if (!option.startPosition) return false;
      const optionStartPosition = option.startPosition.toLowerCase();
      return optionStartPosition === lastEndPosition;
    });

    // If filtering eliminates all options, return original options (legacy behavior)
    if (filtered.length === 0) {
      console.warn(
        `⚠️ No options match end position "${lastEndPosition}", using all options`
      );
      return options;
    }

    return filtered;
  }

  /**
   * Filter options by rotation direction - exact port from legacy filter_options_by_rotation()
   * Filters pictographs to match the given rotation directions for continuous prop continuity.
   * Options must have rotation directions that match OR are NO_ROTATION.
   */
  filterByRotation(
    options: PictographData[],
    blueRotDir: string,
    redRotDir: string
  ): PictographData[] {
    const filtered = options.filter((option: PictographData) => {
      const blueMotion = option.motions.blue;
      const redMotion = option.motions.red;

      if (!blueMotion || !redMotion) return false;

      const blueMotionRotDir = blueMotion.rotationDirection;
      const redMotionRotDir = redMotion.rotationDirection;

      // Check if blue rotation matches (either matches target or is NO_ROTATION)
      const blueMatches =
        blueMotionRotDir === blueRotDir ||
        blueMotionRotDir === ROTATION_DIRS.noRotation;

      // Check if red rotation matches (either matches target or is NO_ROTATION)
      const redMatches =
        redMotionRotDir === redRotDir ||
        redMotionRotDir === ROTATION_DIRS.noRotation;

      return blueMatches && redMatches;
    });

    // If filtering eliminates all options, return original options (legacy behavior)
    return filtered.length > 0 ? filtered : options;
  }

  /**
   * Filter for start positions - static pictographs where startPosition === endPosition
   */
  filterStartPositions(options: PictographData[]): PictographData[] {
    const filtered = options.filter((option: PictographData) => {
      if (!option.startPosition || !option.endPosition) return false;
      const startPos = option.startPosition.toLowerCase();
      const endPos = option.endPosition.toLowerCase();
      return startPos === endPos;
    });

    if (filtered.length === 0) {
      throw new FilteringError(
        "No valid start positions found in options",
        "start_positions",
        { totalOptions: options.length }
      );
    }

    return filtered;
  }

  /**
   * Filter Type 6 (static) pictographs based on difficulty level.
   *
   * Level 1: No turns allowed, so filter out ALL Type 6 pictographs
   * Level 2+: Filter out Type 6 pictographs that have no turns applied (keep those with turns > 0)
   *
   * This ensures Type 6 static pictographs are only used when they can have visual interest via turns.
   */
  filterStaticType6(options: PictographData[], level: number): PictographData[] {
    // Dynamic import to get Letter and getLetterType
    const { getLetterType } = require("$lib/shared/foundation/domain/models/Letter");
    const { LetterType } = require("$lib/shared/foundation/domain/models/LetterType");

    const filtered = options.filter((option: PictographData) => {
      if (!option.letter) return true; // Keep if no letter specified

      const letterType = getLetterType(option.letter);

      // If not Type 6, always keep it
      if (letterType !== LetterType.TYPE6) return true;

      // Level 1: No turns allowed, so exclude ALL Type 6 pictographs
      if (level === 1) return false;

      // Level 2+: Keep Type 6 only if at least one motion has turns > 0
      const blueMotion = option.motions.blue;
      const redMotion = option.motions.red;

      const blueTurns = blueMotion?.turns ?? 0;
      const redTurns = redMotion?.turns ?? 0;

      // Keep Type 6 only if at least one motion has turns > 0
      // (turns can be a number or "fl", so handle both cases)
      const blueHasTurns = blueTurns === "fl" || blueTurns > 0;
      const redHasTurns = redTurns === "fl" || redTurns > 0;

      return blueHasTurns || redHasTurns;
    });

    return filtered;
  }

  /**
   * Select random item from array - simple utility for random selection
   */
  selectRandom<T>(array: T[]): T {
    if (array.length === 0) {
      throw new FilteringError(
        "Cannot choose from empty array",
        "random_selection"
      );
    }
    const index = Math.floor(Math.random() * array.length);
    const selected = array[index];
    if (selected === undefined) {
      throw new FilteringError(
        "Selected item is undefined",
        "random_selection",
        { index, arrayLength: array.length }
      );
    }
    return selected;
  }
}
