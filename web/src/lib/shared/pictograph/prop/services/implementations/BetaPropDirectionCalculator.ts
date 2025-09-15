/**
 * Beta Prop Direction Calculator
 *
 * Calculates movement directions for beta prop positioning based on legacy logic.
 * Ported from legacy_web BetaPropDirectionCalculator.ts
 */

import {
  GridLocation,
  GridMode,
  MotionColor,
  MotionType,
  Orientation,
  VectorDirection,
  type MotionData,
  type PropPlacementData,
} from "$shared";

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
  // Special case maps for Letter I (matching legacy system)
  private directionMapRadialI: Record<
  Loc,
  Record<MotionColor, VectorDirection>
  > = {
  [GridLocation.NORTH]: {
    [MotionColor.RED]: VectorDirection.RIGHT,
    [MotionColor.BLUE]: VectorDirection.LEFT,
  },
  [GridLocation.EAST]: {
    [MotionColor.RED]: VectorDirection.DOWN,
    [MotionColor.BLUE]: VectorDirection.UP,
  },
  [GridLocation.SOUTH]: {
    [MotionColor.RED]: VectorDirection.LEFT,
    [MotionColor.BLUE]: VectorDirection.RIGHT,
  },
  [GridLocation.WEST]: {
    [MotionColor.RED]: VectorDirection.DOWN,
    [MotionColor.BLUE]: VectorDirection.UP,
  },
  [GridLocation.NORTHEAST]: {
    [MotionColor.RED]: VectorDirection.DOWNRIGHT,
    [MotionColor.BLUE]: VectorDirection.UPLEFT,
  },
  [GridLocation.SOUTHEAST]: {
    [MotionColor.RED]: VectorDirection.UPRIGHT,
    [MotionColor.BLUE]: VectorDirection.DOWNLEFT,
  },
  [GridLocation.SOUTHWEST]: {
    [MotionColor.RED]: VectorDirection.DOWNRIGHT,
    [MotionColor.BLUE]: VectorDirection.UPLEFT,
  },
  [GridLocation.NORTHWEST]: {
    [MotionColor.RED]: VectorDirection.UPRIGHT,
    [MotionColor.BLUE]: VectorDirection.DOWNLEFT,
  },
  };

  private directionMapNonRadialI: Record<
  Loc,
  Record<MotionColor, VectorDirection>
  > = {
  [GridLocation.NORTH]: {
    [MotionColor.RED]: VectorDirection.UP,
    [MotionColor.BLUE]: VectorDirection.DOWN,
  },
  [GridLocation.EAST]: {
    [MotionColor.RED]: VectorDirection.RIGHT,
    [MotionColor.BLUE]: VectorDirection.LEFT,
  },
  [GridLocation.SOUTH]: {
    [MotionColor.RED]: VectorDirection.DOWN,
    [MotionColor.BLUE]: VectorDirection.UP,
  },
  [GridLocation.WEST]: {
    [MotionColor.RED]: VectorDirection.RIGHT,
    [MotionColor.BLUE]: VectorDirection.LEFT,
  },
  [GridLocation.NORTHEAST]: {
    [MotionColor.RED]: VectorDirection.UPRIGHT,
    [MotionColor.BLUE]: VectorDirection.DOWNLEFT,
  },
  [GridLocation.SOUTHEAST]: {
    [MotionColor.RED]: VectorDirection.DOWNRIGHT,
    [MotionColor.BLUE]: VectorDirection.UPLEFT,
  },
  [GridLocation.SOUTHWEST]: {
    [MotionColor.RED]: VectorDirection.UPRIGHT,
    [MotionColor.BLUE]: VectorDirection.DOWNLEFT,
  },
  [GridLocation.NORTHWEST]: {
    [MotionColor.RED]: VectorDirection.DOWNRIGHT,
    [MotionColor.BLUE]: VectorDirection.UPLEFT,
  },
  };

  // Diamond grid maps for static/dash motions
  private diamondMapRadial: Record<
  DiamondLoc,
  Record<MotionColor, VectorDirection>
  > = {
  [GridLocation.NORTH]: {
    [MotionColor.RED]: VectorDirection.RIGHT,
    [MotionColor.BLUE]: VectorDirection.LEFT,
  },
  [GridLocation.EAST]: {
    [MotionColor.RED]: VectorDirection.DOWN,
    [MotionColor.BLUE]: VectorDirection.UP,
  },
  [GridLocation.SOUTH]: {
    [MotionColor.RED]: VectorDirection.LEFT,
    [MotionColor.BLUE]: VectorDirection.RIGHT,
  },
  [GridLocation.WEST]: {
    [MotionColor.RED]: VectorDirection.UP,
    [MotionColor.BLUE]: VectorDirection.DOWN,
  },
  };

  private diamondMapNonRadial: Record<
  DiamondLoc,
  Record<MotionColor, VectorDirection>
  > = {
  [GridLocation.NORTH]: {
    [MotionColor.RED]: VectorDirection.UP,
    [MotionColor.BLUE]: VectorDirection.DOWN,
  },
  [GridLocation.EAST]: {
    [MotionColor.RED]: VectorDirection.RIGHT,
    [MotionColor.BLUE]: VectorDirection.LEFT,
  },
  [GridLocation.SOUTH]: {
    [MotionColor.RED]: VectorDirection.DOWN,
    [MotionColor.BLUE]: VectorDirection.UP,
  },
  [GridLocation.WEST]: {
    [MotionColor.RED]: VectorDirection.LEFT,
    [MotionColor.BLUE]: VectorDirection.RIGHT,
  },
  };

  // Box grid maps for static/dash motions
  private boxMapRadial: Record<BoxLoc, Record<MotionColor, VectorDirection>> = {
  [GridLocation.NORTHEAST]: {
    [MotionColor.RED]: VectorDirection.DOWNRIGHT,
    [MotionColor.BLUE]: VectorDirection.UPLEFT,
  },
  [GridLocation.SOUTHEAST]: {
    [MotionColor.RED]: VectorDirection.UPRIGHT,
    [MotionColor.BLUE]: VectorDirection.DOWNLEFT,
  },
  [GridLocation.SOUTHWEST]: {
    [MotionColor.RED]: VectorDirection.DOWNRIGHT,
    [MotionColor.BLUE]: VectorDirection.UPLEFT,
  },
  [GridLocation.NORTHWEST]: {
    [MotionColor.RED]: VectorDirection.UPRIGHT,
    [MotionColor.BLUE]: VectorDirection.DOWNLEFT,
  },
  };

  private boxMapNonRadial: Record<
  BoxLoc,
  Record<MotionColor, VectorDirection>
  > = {
  [GridLocation.NORTHEAST]: {
    [MotionColor.RED]: VectorDirection.UPLEFT,
    [MotionColor.BLUE]: VectorDirection.DOWNRIGHT,
  },
  [GridLocation.SOUTHEAST]: {
    [MotionColor.RED]: VectorDirection.UPRIGHT,
    [MotionColor.BLUE]: VectorDirection.DOWNLEFT,
  },
  [GridLocation.SOUTHWEST]: {
    [MotionColor.RED]: VectorDirection.UPLEFT,
    [MotionColor.BLUE]: VectorDirection.DOWNRIGHT,
  },
  [GridLocation.NORTHWEST]: {
    [MotionColor.RED]: VectorDirection.DOWNLEFT,
    [MotionColor.BLUE]: VectorDirection.UPRIGHT,
  },
  };

  // Shift direction maps for calculating directions from start→end location
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
  [GridLocation.NORTH]: {
    [GridLocation.EAST]: VectorDirection.UP,
    [GridLocation.WEST]: VectorDirection.UP,
  },
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
  [GridLocation.EAST]: {
    [GridLocation.NORTH]: VectorDirection.UP,
    [GridLocation.SOUTH]: VectorDirection.UP,
  },
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
    [GridLocation.NORTHEAST]: VectorDirection.DOWNLEFT,
    [GridLocation.SOUTHWEST]: VectorDirection.UPRIGHT,
  },
  [GridLocation.SOUTHWEST]: {
    [GridLocation.NORTHWEST]: VectorDirection.UPRIGHT,
    [GridLocation.SOUTHEAST]: VectorDirection.DOWNLEFT,
  },
  [GridLocation.NORTHWEST]: {
    [GridLocation.NORTHEAST]: VectorDirection.DOWNRIGHT,
    [GridLocation.SOUTHWEST]: VectorDirection.UPLEFT,
  },
  };

  constructor(
  private motionDataSet: { red: MotionData; blue: MotionData },
  private pictographLetter?: string
  ) {}

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

  // Check for Y/Z letter logic (shift + static/dash combination)
  // Include both static Y/Z and dash Y-/Z- variants
  if (this.pictographLetter === "Y" || this.pictographLetter === "Z" || 
    this.pictographLetter === "Y-" || this.pictographLetter === "Z-") {
    return this.handleYZLetterLogic(motionData);
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
   * Handle Y/Z letter logic (shift + static/dash combination)
   */
  private handleYZLetterLogic(motionData: MotionData): VectorDirection | null {
  // Find shift and static/dash motions
  const redMotion = this.motionDataSet.red;
  const blueMotion = this.motionDataSet.blue;

  const isShiftMotion = (motion: MotionData) =>
    [MotionType.PRO, MotionType.ANTI, MotionType.FLOAT].includes(
    motion.motionType
    );

  const shiftMotion = isShiftMotion(redMotion)
    ? redMotion
    : isShiftMotion(blueMotion)
    ? blueMotion
    : null;
  
  // Check for both static and dash motions (Y/Z can have either)
  const nonShiftMotion =
    redMotion.motionType === MotionType.STATIC
    ? redMotion
    : blueMotion.motionType === MotionType.STATIC
      ? blueMotion
      : redMotion.motionType === MotionType.DASH
      ? redMotion
      : blueMotion.motionType === MotionType.DASH
        ? blueMotion
        : null;

  if (!shiftMotion || !nonShiftMotion) {
    // Fallback to regular logic if not shift+static/dash combination
    if (
    [MotionType.PRO, MotionType.ANTI, MotionType.FLOAT].includes(
      motionData.motionType
    )
    ) {
    return this.handleShiftMotionForData(motionData);
    } else {
    return this.handleStaticDashMotionForData(motionData);
    }
  }

  // Get direction from shift motion
  const isRadial = this.endsWithRadialOrientation();
  const shiftDirection = this.getShiftDirection(
    isRadial,
    shiftMotion.startLocation,
    shiftMotion.endLocation
  );

  if (!shiftDirection) {
    return null;
  }

  // If this motion is the shift motion, return its direction
  // If this motion is the static/dash motion, return opposite direction
  const isThisShiftMotion = motionData.color === shiftMotion.color;
  const finalDirection = isThisShiftMotion 
    ? shiftDirection 
    : this.getOppositeDirection(shiftDirection);

  return finalDirection;
  }

  /**
   * Handle shift motion direction calculation for motion data directly
   */
  private handleShiftMotionForData(
  motionData: MotionData
  ): VectorDirection | null {
  const isRadial = this.endsWithRadialOrientation();
  const startLocation = motionData.startLocation;
  const endLocation =
    (motionData as unknown as { endLocation?: string; end_location?: string })
    .endLocation ??
    (motionData as unknown as { end_location?: string }).end_location ??
    "";

  // Check if this is a G/H letter (uses override logic)
  if (this.pictographLetter === "G" || this.pictographLetter === "H") {
    // G/H letters: Calculate base direction, red gets it, blue gets opposite
    const baseDirection = this.getBaseMotionDirection(isRadial, endLocation);
    if (!baseDirection) {
    return null;
    }
    return motionData.color === "red"
    ? baseDirection
    : this.getOppositeDirection(baseDirection);
  }

  // Check if this is an I letter (uses special direction maps)
  if (this.pictographLetter === "I") {
    if (isRadial) {
    const direction =
      this.directionMapRadialI[endLocation as Loc]?.[
      motionData.color as MotionColor
      ];
    return direction ?? null;
    } else {
    const direction =
      this.directionMapNonRadialI[endLocation as Loc]?.[
      motionData.color as MotionColor
      ];
    return direction ?? null;
    }
  }

  // J/K/L letters and others: Each prop gets direction from its own motion
  return this.getShiftDirection(isRadial, startLocation, endLocation);
  }

  /**
   * Get shift direction based on start and end locations
   */
  private getShiftDirection(
  isRadial: boolean,
  startLoc: string,
  endLoc: string
  ): VectorDirection | null {
  const map = isRadial
    ? this.directionMapRadialShift
    : this.directionMapNonRadialShift;
  return map[startLoc as Loc]?.[endLoc as Loc] ?? null;
  }

  /**
   * Get base motion direction (same calculation for both props, before override)
   */
  private getBaseMotionDirection(
  isRadial: boolean,
  endLocation: string
  ): VectorDirection | null {
  // For G/H letters with shift motions ending at south, the base direction is RIGHT
  // This matches the legacy system's calculation
  if (endLocation === "s" || endLocation === GridLocation.SOUTH) {
    return VectorDirection.RIGHT;
  }

  // For other locations, use the red prop's direction from the map as base
  const map = isRadial ? this.diamondMapRadial : this.diamondMapNonRadial;
  return map[endLocation as DiamondLoc]?.[MotionColor.RED] ?? null;
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
    return (
    map[location as DiamondLoc]?.[motionData.color as MotionColor] ?? null
    );
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
   * Matches legacy logic exactly from BetaPropDirectionCalculator.ts lines 180-196
   */
  private endsWithRadialOrientation(): boolean {
  const redEndOri = this.motionDataSet.red?.endOrientation;
  const blueEndOri = this.motionDataSet.blue?.endOrientation;

  // Legacy logic: radial if either prop ends in IN/OUT
  const isRadial =
    ((redEndOri === Orientation.IN || redEndOri === Orientation.OUT) &&
    blueEndOri === Orientation.IN) ||
    blueEndOri === Orientation.OUT;

  return isRadial;
  }

  /**
   * Check if motion ends with non-radial orientation
   * Matches legacy logic exactly from BetaPropDirectionCalculator.ts lines 189-196
   */
  private endsWithNonRadialOrientation(): boolean {
  const redEndOri = this.motionDataSet.red?.endOrientation;
  const blueEndOri = this.motionDataSet.blue?.endOrientation;

  // Legacy logic: non-radial if either prop ends in CLOCK/COUNTER
  return (
    ((redEndOri === Orientation.CLOCK || redEndOri === Orientation.COUNTER) &&
    blueEndOri === Orientation.CLOCK) ||
    blueEndOri === Orientation.COUNTER
  );
  }
}
