/**
 * Beta Offset Calculator
 *
 * Converts direction values to pixel offsets for beta prop positioning.
 * Based on legacy beta offset calculation logic.
 */

import { VectorDirection, type IBetaOffsetCalculator } from "$shared";
import { Point } from "fabric";
import { injectable } from "inversify";

@injectable()
export class BetaOffsetCalculator implements IBetaOffsetCalculator {
  // Standard offset distance (matches legacy 25 pixel separation)
  private readonly OFFSET_DISTANCE = 25;

  /**
   * Calculate new position with offset based on direction
   */
  calculateNewPointWithOffset(
    currentPoint: Point,
    direction: VectorDirection
  ): Point {
    const offset = this.getOffsetForDirection(direction);

    return new Point(currentPoint.x + offset.x, currentPoint.y + offset.y);
  }

  /**
   * Get pixel offset for a given direction
   */
  private getOffsetForDirection(direction: VectorDirection): Point {
    const distance = this.OFFSET_DISTANCE;

    switch (direction) {
      case VectorDirection.UP:
        return new Point(0, -distance);
      case VectorDirection.DOWN:
        return new Point(0, distance);
      case VectorDirection.LEFT:
        return new Point(-distance, 0);
      case VectorDirection.RIGHT:
        return new Point(distance, 0);
      case VectorDirection.UPRIGHT:
        return new Point(distance, -distance);
      case VectorDirection.DOWNRIGHT:
        return new Point(distance, distance);
      case VectorDirection.UPLEFT:
        return new Point(-distance, -distance);
      case VectorDirection.DOWNLEFT:
        return new Point(-distance, distance);
      default:
        console.warn(`Unknown direction: ${direction}`);
        return new Point(0, 0);
    }
  }

  /**
   * Calculate beta separation offsets for both props
   * Returns offsets for blue and red props based on their calculated directions
   */
  calculateBetaSeparationOffsets(
    blueDirection: VectorDirection | null,
    redDirection: VectorDirection | null
  ): { blue: Point; red: Point } {
    const blueOffset = blueDirection
      ? this.getOffsetForDirection(blueDirection)
      : new Point(0, 0);

    const redOffset = redDirection
      ? this.getOffsetForDirection(redDirection)
      : new Point(0, 0);

    return {
      blue: blueOffset,
      red: redOffset,
    };
  }
}
