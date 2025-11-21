/**
 * Letter G/H Handler
 *
 * Letters G and H use override logic:
 * - Red gets the base direction
 * - Blue gets the opposite direction
 */

import {
  GridLocation,
  MotionColor,
  type MotionData,
  VectorDirection,
} from "$shared";

import type { DiamondLoc } from "../../domain/direction/DirectionMaps";
import {
  DIAMOND_NON_RADIAL_MAP,
  DIAMOND_RADIAL_MAP,
} from "../../domain/direction/DirectionMaps";
import type { IDirectionCalculator } from "../contracts/IDirectionCalculator";
import type { IOrientationChecker } from "../contracts/IOrientationChecker";
import { getEndLocation, getOppositeDirection } from "./DirectionUtils";

export class LetterGHHandler implements IDirectionCalculator {
  constructor(private orientationChecker: IOrientationChecker) {}

  /**
   * Calculate direction using G/H override logic.
   *
   * Red gets base direction, blue gets opposite.
   */
  calculate(motionData: MotionData): VectorDirection | null {
    const isRadial = this.orientationChecker.isRadial();
    const endLocation = getEndLocation(motionData);

    const baseDirection = this.getBaseDirection(isRadial, endLocation);
    if (!baseDirection) {
      return null;
    }

    return motionData.color === "red"
      ? baseDirection
      : getOppositeDirection(baseDirection);
  }

  /**
   * Get base motion direction for G/H letters.
   */
  private getBaseDirection(
    isRadial: boolean,
    endLocation: string
  ): VectorDirection | null {
    // Special case: South location always returns RIGHT
    if (endLocation === "s" || endLocation === GridLocation.SOUTH) {
      return VectorDirection.RIGHT;
    }

    // Use red prop's direction from the map as base
    const map = isRadial ? DIAMOND_RADIAL_MAP : DIAMOND_NON_RADIAL_MAP;
    return map[endLocation as DiamondLoc][MotionColor.RED] ?? null;
  }
}
