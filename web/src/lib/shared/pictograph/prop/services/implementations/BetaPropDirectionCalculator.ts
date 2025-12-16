/**
 * Beta Prop Direction Calculator
 *
 * Calculates movement directions for beta prop positioning based on legacy logic.
 * Ported from legacy_web BetaPropDirectionCalculator.ts
 */


import { GridLocation, GridMode, MotionColor, MotionType, VectorDirection, type MotionData, type PropPlacementData } from "$shared";

// Location types
type Loc = `${GridLocation}`; // enum string values
type DiamondLoc =
  | GridLocation.NORTH
  | GridLocation.SOUTH
  | GridLocation.EAST
  | GridLocation.WEST;
type BoxLoc =
  | GridLocation.NORTHEAST
  | GridLocation.SOUTHEAST
  | GridLocation.SOUTHWEST
  | GridLocation.NORTHWEST;

// Grid mode constants
const DIAMOND = GridMode.DIAMOND;
const BOX = GridMode.BOX;





export class BetaPropDirectionCalculator {
  // Diamond grid maps for static/dash motions
  private diamondMapRadial: Record<DiamondLoc, Record<MotionColor, VectorDirection>> =
    {
      [GridLocation.NORTH]: { [MotionColor.RED]: VectorDirection.RIGHT, [MotionColor.BLUE]: VectorDirection.LEFT },
      [GridLocation.EAST]: { [MotionColor.RED]: VectorDirection.DOWN, [MotionColor.BLUE]: VectorDirection.UP },
      [GridLocation.SOUTH]: { [MotionColor.RED]: VectorDirection.LEFT, [MotionColor.BLUE]: VectorDirection.RIGHT },
      [GridLocation.WEST]: { [MotionColor.RED]: VectorDirection.UP, [MotionColor.BLUE]: VectorDirection.DOWN },
    };

  private diamondMapNonRadial: Record<
    DiamondLoc,
    Record<MotionColor, VectorDirection>
  > = {
    [GridLocation.NORTH]: { [MotionColor.RED]: VectorDirection.UP, [MotionColor.BLUE]: VectorDirection.DOWN },
    [GridLocation.EAST]: { [MotionColor.RED]: VectorDirection.RIGHT, [MotionColor.BLUE]: VectorDirection.LEFT },
    [GridLocation.SOUTH]: { [MotionColor.RED]: VectorDirection.DOWN, [MotionColor.BLUE]: VectorDirection.UP },
    [GridLocation.WEST]: { [MotionColor.RED]: VectorDirection.LEFT, [MotionColor.BLUE]: VectorDirection.RIGHT },
  };

  // Box grid maps for static/dash motions
  private boxMapRadial: Record<BoxLoc, Record<MotionColor, VectorDirection>> = {
    [GridLocation.NORTHEAST]: { [MotionColor.RED]: VectorDirection.DOWNRIGHT, [MotionColor.BLUE]: VectorDirection.UPLEFT },
    [GridLocation.SOUTHEAST]: { [MotionColor.RED]: VectorDirection.UPRIGHT, [MotionColor.BLUE]: VectorDirection.DOWNLEFT },
    [GridLocation.SOUTHWEST]: { [MotionColor.RED]: VectorDirection.DOWNRIGHT, [MotionColor.BLUE]: VectorDirection.UPLEFT },
    [GridLocation.NORTHWEST]: { [MotionColor.RED]: VectorDirection.UPRIGHT, [MotionColor.BLUE]: VectorDirection.DOWNLEFT },
  };

  private boxMapNonRadial: Record<BoxLoc, Record<MotionColor, VectorDirection>> = {
    [GridLocation.NORTHEAST]: { [MotionColor.RED]: VectorDirection.UPLEFT, [MotionColor.BLUE]: VectorDirection.DOWNRIGHT },
    [GridLocation.SOUTHEAST]: { [MotionColor.RED]: VectorDirection.UPRIGHT, [MotionColor.BLUE]: VectorDirection.DOWNLEFT },
    [GridLocation.SOUTHWEST]: { [MotionColor.RED]: VectorDirection.UPLEFT, [MotionColor.BLUE]: VectorDirection.DOWNRIGHT },
    [GridLocation.NORTHWEST]: { [MotionColor.RED]: VectorDirection.DOWNLEFT, [MotionColor.BLUE]: VectorDirection.UPRIGHT },
  };

  // Shift motion direction maps
  private directionMapRadialShift: Record<
    Loc,
    Partial<Record<Loc, VectorDirection>>
  > = {
    [GridLocation.EAST]: {
      [GridLocation.NORTH]: VectorDirection.RIGHT,
      [GridLocation.SOUTH]: VectorDirection.RIGHT,
    },
    [GridLocation.WEST]: {
      [GridLocation.NORTH]: VectorDirection.LEFT,
      [GridLocation.SOUTH]: VectorDirection.LEFT,
    },
    [GridLocation.NORTH]: { [GridLocation.EAST]: VectorDirection.UP, [GridLocation.WEST]: VectorDirection.UP },
    [GridLocation.SOUTH]: {
      [GridLocation.EAST]: VectorDirection.DOWN,
      [GridLocation.WEST]: VectorDirection.DOWN,
    },
    [GridLocation.NORTHEAST]: {
      [GridLocation.NORTHWEST]: VectorDirection.UPRIGHT,
      [GridLocation.SOUTHEAST]: VectorDirection.UPRIGHT,
    },
    [GridLocation.SOUTHEAST]: {
      [GridLocation.NORTHEAST]: VectorDirection.DOWNRIGHT,
      [GridLocation.SOUTHWEST]: VectorDirection.DOWNRIGHT,
    },
    [GridLocation.SOUTHWEST]: {
      [GridLocation.NORTHWEST]: VectorDirection.DOWNLEFT,
      [GridLocation.SOUTHEAST]: VectorDirection.DOWNLEFT,
    },
    [GridLocation.NORTHWEST]: {
      [GridLocation.NORTHEAST]: VectorDirection.UPLEFT,
      [GridLocation.SOUTHWEST]: VectorDirection.UPLEFT,
    },
  };

  private directionMapNonRadialShift: Record<
    Loc,
    Partial<Record<Loc, VectorDirection>>
  > = {
    [GridLocation.EAST]: { [GridLocation.NORTH]: VectorDirection.UP, [GridLocation.SOUTH]: VectorDirection.UP },
    [GridLocation.WEST]: {
      [GridLocation.NORTH]: VectorDirection.DOWN,
      [GridLocation.SOUTH]: VectorDirection.DOWN,
    },
    [GridLocation.NORTH]: {
      [GridLocation.EAST]: VectorDirection.RIGHT,
      [GridLocation.WEST]: VectorDirection.RIGHT,
    },
    [GridLocation.SOUTH]: {
      [GridLocation.EAST]: VectorDirection.LEFT,
      [GridLocation.WEST]: VectorDirection.LEFT,
    },
    [GridLocation.NORTHEAST]: {
      [GridLocation.SOUTHEAST]: VectorDirection.UPLEFT,
      [GridLocation.NORTHWEST]: VectorDirection.DOWNRIGHT,
    },
    [GridLocation.SOUTHEAST]: {
      [GridLocation.NORTHEAST]: VectorDirection.UPRIGHT,
      [GridLocation.SOUTHWEST]: VectorDirection.UPRIGHT,
    },
    [GridLocation.SOUTHWEST]: {
      [GridLocation.NORTHWEST]: VectorDirection.UPLEFT,
      [GridLocation.SOUTHEAST]: VectorDirection.DOWNRIGHT,
    },
    [GridLocation.NORTHWEST]: {
      [GridLocation.NORTHEAST]: VectorDirection.DOWNLEFT,
      [GridLocation.SOUTHWEST]: VectorDirection.DOWNLEFT,
    },
  };

  constructor(private motionDataSet: { red: MotionData; blue: MotionData }) {}

  /**
   * Get motion data for a prop by matching its context
   * Since we removed prop.color, we need to determine which motion to use
   * This is a transitional approach - ideally services should be passed the specific motion directly
   */
  private getMotionDataForProp(_prop: PropPlacementData): MotionData | null {
    // For now, we'll need to determine this based on how the service is called
    // This is not ideal but maintains functionality during the transition
    // In the future, services should be passed the specific motion data directly

    // Try to match based on prop properties with motion properties
    // This is a heuristic approach during the transition
    const blueMotion = this.motionDataSet.blue;
    const redMotion = this.motionDataSet.red;

    // For now, assume blue if we can't determine otherwise
    // This will need to be fixed by passing proper context to the service
    return blueMotion || redMotion;
  }

  /**
   * Get direction for a prop based on its motion data
   */
  getDirection(prop: PropPlacementData): VectorDirection | null {
    // Get the appropriate motion data for this prop
    const motionData = this.getMotionDataForProp(prop);
    if (!motionData) {
      console.error(`No motion data found for prop`);
      return null;
    }

    return this.getDirectionForMotionData(motionData);
  }

  /**
   * Get direction based on motion data directly (bypasses prop matching)
   */
  getDirectionForMotionData(motionData: MotionData): VectorDirection | null {
    if (!motionData) {
      return null;
    }

    // Handle shift motions (pro, anti, float)
    if (
      [MotionType.PRO, MotionType.ANTI, MotionType.FLOAT].includes(
        motionData.motionType
      )
    ) {
      return this.handleShiftMotionForData(motionData);
    }

    // Handle static/dash motions
    return this.handleStaticDashMotionForData(motionData);
  }

  /**
   * Handle shift motion direction calculation for motion data directly
   */
  private handleShiftMotionForData(
    motionData: MotionData
  ): VectorDirection | null {
    const isRadial = this.endsWithRadialOrientation();
    const startLocation =
      (
        motionData as unknown as {
          startLocation?: string;
          start_location?: string;
        }
      ).startLocation ??
      (motionData as unknown as { start_location?: string }).start_location ??
      "";
    const endLocation =
      (motionData as unknown as { endLocation?: string; end_location?: string })
        .endLocation ??
      (motionData as unknown as { end_location?: string }).end_location ??
      "";
    return this.getShiftDirection(isRadial, startLocation, endLocation);
  }

  /**
   * Get shift direction based on start and end locations
   */
  private getShiftDirection(
    isRadial: boolean,
    startLocation: string,
    endLocation: string
  ): VectorDirection | null {
    const map = isRadial
      ? this.directionMapRadialShift
      : this.directionMapNonRadialShift;
    return map[startLocation as Loc]?.[endLocation as Loc] ?? null;
  }

  /**
   * Handle static/dash motion direction calculation for motion data directly
   */
  private handleStaticDashMotionForData(
    motionData: MotionData
  ): VectorDirection | null {
    const location = motionData.endLocation as Loc;
    const cardinalValues = [
      GridLocation.NORTH,
      GridLocation.SOUTH,
      GridLocation.EAST,
      GridLocation.WEST,
    ] as string[];
    const gridMode = cardinalValues.includes(location) ? DIAMOND : BOX;
    const isRadial = this.endsWithRadialOrientation();

    if (gridMode === DIAMOND) {
      const map = isRadial ? this.diamondMapRadial : this.diamondMapNonRadial;
      return map[location as DiamondLoc]?.[motionData.color as MotionColor] ?? null;
    }

    const map = isRadial ? this.boxMapRadial : this.boxMapNonRadial;
    return map[location as BoxLoc]?.[motionData.color as MotionColor] ?? null;
  }

  /**
   * Get opposite direction
   */
  getOppositeDirection(direction: VectorDirection): VectorDirection {
    const opposites: Record<VectorDirection, VectorDirection> = {
      [VectorDirection.UP]: VectorDirection.DOWN,
      [VectorDirection.DOWN]: VectorDirection.UP,
      [VectorDirection.LEFT]: VectorDirection.RIGHT,
      [VectorDirection.RIGHT]: VectorDirection.LEFT,
      [VectorDirection.UPRIGHT]: VectorDirection.DOWNLEFT,
      [VectorDirection.DOWNLEFT]: VectorDirection.UPRIGHT,
      [VectorDirection.UPLEFT]: VectorDirection.DOWNRIGHT,
      [VectorDirection.DOWNRIGHT]: VectorDirection.UPLEFT,
    };
    return opposites[direction];
  }

  /**
   * Check if motion ends with radial orientation
   * This needs to be passed in from the test or determined by context
   */
  private endsWithRadialOrientation(): boolean {
    // ✅ FIXED: Simplified orientation access using MotionData
    const redEndOri = this.motionDataSet.red?.endOrientation;
    const blueEndOri = this.motionDataSet.blue?.endOrientation;
    if (redEndOri === "in" && blueEndOri === "in") return true;
    if (redEndOri === "out" && blueEndOri === "out") return false;
    return true;
  }
}
