/**
 * Prop Placement Service
 *
 * Dedicated service for calculating prop placement data.
 * Follows separation of concerns by focusing only on placement calculations.
 * Returns PropPlacementData that can be attached to PropData.
 */

import type {
  MotionData,
  PropPlacementData,
  PictographData,
} from "$lib/domain";
import { createPropPlacementFromPosition } from "$lib/domain/PropPlacementData";
import { DefaultPropPositioner } from "../../DefaultPropPositioner";
import { PropRotAngleManager } from "../../PropRotAngleManager";
import { BetaOffsetCalculator } from "./BetaOffsetCalculator";
import { BetaPropDirectionCalculator } from "./BetaPropDirectionCalculator";
import { endsWithBeta } from "$lib/utils/betaDetection";

export interface IPropPlacementService {
  calculatePlacement(
    pictographData: PictographData,
    motionData: MotionData
  ): PropPlacementData;
}

export class PropPlacementService implements IPropPlacementService {
  calculatePlacement(
    pictographData: PictographData,
    motionData: MotionData
  ): PropPlacementData {
    const gridMode = pictographData.gridData.gridMode;
    const position = this.calculatePosition(pictographData, motionData);

    const rotation = PropRotAngleManager.calculateRotation(
      motionData.endLocation,
      motionData.endOrientation,
      gridMode
    );

    return createPropPlacementFromPosition(position.x, position.y, rotation);
  }

  private calculatePosition(
    pictographData: PictographData,
    motionData: MotionData
  ): { x: number; y: number } {
    const propData = pictographData.props[motionData.color];

    if (!propData) {
      throw new Error(`❌ No prop data found for color: ${motionData.color}`);
    }

    const basePosition = DefaultPropPositioner.calculatePosition(
      motionData.endLocation,
      pictographData.gridData.gridMode
    );

    const betaOffset = this.calculateBetaOffset(pictographData, motionData);

    return {
      x: basePosition.x + betaOffset.x,
      y: basePosition.y + betaOffset.y,
    };
  }

  private calculateBetaOffset(
    pictographData: PictographData,
    motionData: MotionData
  ): { x: number; y: number } {
    const propData = pictographData.props[motionData.color];
    const needsBetaOffset = endsWithBeta(pictographData);

    if (!needsBetaOffset) {
      console.log(
        `🔍 Beta offset: Pictograph does not end with beta, no offset needed`
      );
      return { x: 0, y: 0 };
    }

    console.log(
      `🔍 Beta offset: Pictograph ends with beta, calculating offset for ${motionData.color}`
    );

    const redMotion = pictographData.motions.red;
    const blueMotion = pictographData.motions.blue;

    if (redMotion.endLocation !== blueMotion.endLocation) {
      console.log(
        `🔍 Beta offset: Props end at different locations (red: ${redMotion.endLocation}, blue: ${blueMotion.endLocation}), no offset needed`
      );
      return { x: 0, y: 0 };
    }

    console.log(
      `🔍 Beta offset: Both props end at ${redMotion.endLocation}, calculating separation`
    );

    if (!propData) {
      throw new Error(`❌ No prop data found for color: ${motionData.color}`);
    }

    const directionCalculator = new BetaPropDirectionCalculator({
      red: redMotion,
      blue: blueMotion,
    });

    // ✅ FIXED: Use the specific motion data for this prop instead of trying to guess from propData
    const direction = directionCalculator.getDirectionForMotionData(motionData);

    if (!direction) {
      throw new Error(
        `❌ Could not calculate direction for ${motionData.color} prop in beta position`
      );
    }

    console.log(
      `🔍 Beta offset: Calculated direction for ${motionData.color}: ${direction}`
    );

    const offsetCalculator = new BetaOffsetCalculator();
    const basePosition = { x: 0, y: 0 };
    const newPosition = offsetCalculator.calculateNewPositionWithOffset(
      basePosition,
      direction
    );

    console.log(
      `🔍 Beta offset: Final offset for ${motionData.color}: x=${newPosition.x}, y=${newPosition.y}`
    );

    return { x: newPosition.x, y: newPosition.y };
  }
}
