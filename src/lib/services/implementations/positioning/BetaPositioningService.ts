/**
 * Beta Positioning Service
 * 
 * Calculates beta offsets for all props in a pictograph at once.
 * This eliminates the need to pass allProps to individual Prop components.
 */

import type { PropData, MotionData, PictographData } from "$lib/domain";
import { GridPosition, MotionColor } from "$lib/domain/enums";
import { BetaPropDirectionCalculator } from "./BetaPropDirectionCalculator";
import { BetaOffsetCalculator } from "./BetaOffsetCalculator";

export interface BetaOffsets {
  blue: { x: number; y: number };
  red: { x: number; y: number };
}

export interface IBetaPositioningService {
  calculateBetaOffsets(pictographData: PictographData): BetaOffsets;
}

export class BetaPositioningService implements IBetaPositioningService {
  
  calculateBetaOffsets(pictographData: PictographData): BetaOffsets {
    // Default to no offset
    const defaultOffsets: BetaOffsets = {
      blue: { x: 0, y: 0 },
      red: { x: 0, y: 0 },
    };

    // Check if pictograph ends with beta
    const endsWithBeta = pictographData.endPosition 
      ? pictographData.endPosition.toString().toLowerCase().startsWith('beta')
      : false;

    if (!endsWithBeta) {
      return defaultOffsets;
    }

    // Get props and motions
    const allProps = Object.values(pictographData.props || {});
    const allMotions = pictographData.motions || {};

    // Need at least 2 props for beta positioning
    if (allProps.length < 2) {
      return defaultOffsets;
    }

    try {
      // Find red and blue props
      const redProp = allProps.find(p => this.getPropColor(p, allMotions) === MotionColor.RED);
      const blueProp = allProps.find(p => this.getPropColor(p, allMotions) === MotionColor.BLUE);

      if (!redProp || !blueProp) {
        // Fallback to simple separation
        return {
          blue: { x: -25, y: 0 },
          red: { x: 25, y: 0 },
        };
      }

      // Get motion data
      const redMotion = allMotions.red || this.createStaticMotionData(redProp);
      const blueMotion = allMotions.blue || this.createStaticMotionData(blueProp);

      // Calculate directions using existing calculator
      const directionCalculator = new BetaPropDirectionCalculator({
        red: redMotion,
        blue: blueMotion,
      });

      const redDirection = directionCalculator.getDirection(redProp);
      const blueDirection = directionCalculator.getDirection(blueProp);

      // Calculate offsets using existing calculator
      const offsetCalculator = new BetaOffsetCalculator();
      const basePosition = { x: 0, y: 0 };

      const redOffset = redDirection 
        ? offsetCalculator.calculateNewPositionWithOffset(basePosition, redDirection)
        : { x: 25, y: 0 };

      const blueOffset = blueDirection 
        ? offsetCalculator.calculateNewPositionWithOffset(basePosition, blueDirection)
        : { x: -25, y: 0 };

      return {
        blue: blueOffset,
        red: redOffset,
      };

    } catch (error) {
      // Fallback to simple separation
      return {
        blue: { x: -25, y: 0 },
        red: { x: 25, y: 0 },
      };
    }
  }

  private getPropColor(propData: PropData, allMotions: Record<string, MotionData>): MotionColor {
    // Try to determine color from motion data
    const blueMotion = allMotions.blue;
    const redMotion = allMotions.red;

    // This is a simplified approach - in reality we'd need better color detection
    // For now, assume first prop is blue, second is red
    return MotionColor.BLUE; // This would need proper implementation
  }

  private createStaticMotionData(propData: PropData): MotionData {
    // Create static motion data for props without motion
    return {
      motionType: "static" as any,
      rotationDirection: "no_rotation" as any,
      startLocation: "north" as any,
      endLocation: "north" as any,
      turns: 0,
      startOrientation: "in" as any,
      endOrientation: "in" as any,
      isVisible: true,
      color: MotionColor.BLUE, // This would need proper implementation
    } as MotionData;
  }
}
