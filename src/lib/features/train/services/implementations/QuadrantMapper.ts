import { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

export class QuadrantMapper {
  /**
   * Maps normalized coordinates (0-1) to one of 8 grid quadrants.
   * Assumes camera view where user faces camera (mirrored).
   * @param x - Normalized x coordinate (0=left, 1=right)
   * @param y - Normalized y coordinate (0=top, 1=bottom)
   */
  mapToQuadrant(x: number, y: number): GridLocation {
    // Calculate relative position from center
    const dx = x - 0.5;
    const dy = 0.5 - y; // Invert Y (screen coords vs math coords)

    // Calculate angle from center (0 = up/north, clockwise positive)
    let angle = Math.atan2(dx, dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    // 8 sectors of 45 degrees each, offset by 22.5 degrees
    const sector = Math.floor((angle + 22.5) / 45) % 8;

    const quadrants: GridLocation[] = [
      GridLocation.NORTH,
      GridLocation.NORTHEAST,
      GridLocation.EAST,
      GridLocation.SOUTHEAST,
      GridLocation.SOUTH,
      GridLocation.SOUTHWEST,
      GridLocation.WEST,
      GridLocation.NORTHWEST,
    ];

    return quadrants[sector] ?? GridLocation.NORTH;
  }

  /**
   * Calculate distance between two quadrants (0 = same, 4 = opposite)
   */
  quadrantDistance(a: GridLocation, b: GridLocation): number {
    const order: GridLocation[] = [
      GridLocation.NORTH,
      GridLocation.NORTHEAST,
      GridLocation.EAST,
      GridLocation.SOUTHEAST,
      GridLocation.SOUTH,
      GridLocation.SOUTHWEST,
      GridLocation.WEST,
      GridLocation.NORTHWEST,
    ];

    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);

    let distance = Math.abs(indexA - indexB);
    if (distance > 4) distance = 8 - distance;

    return distance;
  }

  /**
   * Check if detected quadrant is correct or adjacent (within tolerance)
   */
  isQuadrantCorrect(
    detected: GridLocation,
    expected: GridLocation,
    tolerance: number = 0
  ): boolean {
    return this.quadrantDistance(detected, expected) <= tolerance;
  }
}
