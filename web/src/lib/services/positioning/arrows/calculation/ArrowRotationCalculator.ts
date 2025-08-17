import type { MotionData } from "$lib/domain";
import { Location, MotionType } from "$lib/domain";

export interface IArrowRotationCalculator {
  calculateRotation(motion: MotionData, location: Location): number;
  getSupportedMotionTypes(): MotionType[];
  validateMotionData(motion: MotionData): boolean;
}

export class ArrowRotationCalculator implements IArrowRotationCalculator {
  /**
   * Pure algorithmic service for calculating arrow rotation angles.
   *
   * Implements rotation calculation algorithms without any UI dependencies.
   * Each motion type has its own rotation strategy based on proven algorithms.
   */

  // Static arrow rotation angles (arrows point inward by default)
  private readonly staticRotationMap: Record<Location, number> = {
    [Location.NORTH]: 180.0,
    [Location.NORTHEAST]: 225.0,
    [Location.EAST]: 270.0,
    [Location.SOUTHEAST]: 315.0,
    [Location.SOUTH]: 0.0,
    [Location.SOUTHWEST]: 45.0,
    [Location.WEST]: 90.0,
    [Location.NORTHWEST]: 135.0,
  };

  // PRO rotation angles by rotation direction
  // FIXED: Corrected +90° clockwise offset by subtracting 90° from all values
  private readonly proClockwiseMap: Record<Location, number> = {
    [Location.NORTH]: 225, // was 315, now 315-90=225
    [Location.EAST]: 315, // was 45, now 45-90=-45 → 315 (normalized)
    [Location.SOUTH]: 45, // was 135, now 135-90=45
    [Location.WEST]: 135, // was 225, now 225-90=135
    [Location.NORTHEAST]: 270, // was 0, now 0-90=-90 → 270 (normalized)
    [Location.SOUTHEAST]: 0, // was 90, now 90-90=0
    [Location.SOUTHWEST]: 90, // was 180, now 180-90=90
    [Location.NORTHWEST]: 180, // was 270, now 270-90=180
  };

  // FIXED: Corrected +90° clockwise offset by subtracting 90° from all values
  private readonly proCounterClockwiseMap: Record<Location, number> = {
    [Location.NORTH]: 225, // was 315, now 315-90=225
    [Location.EAST]: 135, // was 225, now 225-90=135
    [Location.SOUTH]: 45, // was 135, now 135-90=45
    [Location.WEST]: 315, // was 45, now 45-90=-45 → 315 (normalized)
    [Location.NORTHEAST]: 0, // was 90, now 90-90=0
    [Location.SOUTHEAST]: 90, // was 180, now 180-90=90
    [Location.SOUTHWEST]: 180, // was 270, now 270-90=180
    [Location.NORTHWEST]: 270, // was 0, now 0-90=-90 → 270 (normalized)
  };

  // ANTI rotation angles by rotation direction
  private readonly antiClockwiseMap: Record<Location, number> = {
    [Location.NORTH]: 315,
    [Location.EAST]: 225,
    [Location.SOUTH]: 135,
    [Location.WEST]: 45,
    [Location.NORTHEAST]: 90,
    [Location.SOUTHEAST]: 180,
    [Location.SOUTHWEST]: 270,
    [Location.NORTHWEST]: 0,
  };

  private readonly antiCounterClockwiseMap: Record<Location, number> = {
    [Location.NORTH]: 315,
    [Location.EAST]: 45,
    [Location.SOUTH]: 135,
    [Location.WEST]: 225,
    [Location.NORTHEAST]: 0,
    [Location.SOUTHEAST]: 90,
    [Location.SOUTHWEST]: 180,
    [Location.NORTHWEST]: 270,
  };

  // DASH rotation angles by rotation direction
  private readonly dashClockwiseMap: Record<Location, number> = {
    [Location.NORTH]: 270,
    [Location.EAST]: 0,
    [Location.SOUTH]: 90,
    [Location.WEST]: 180,
    [Location.NORTHEAST]: 315,
    [Location.SOUTHEAST]: 45,
    [Location.SOUTHWEST]: 135,
    [Location.NORTHWEST]: 225,
  };

  private readonly dashCounterClockwiseMap: Record<Location, number> = {
    [Location.NORTH]: 270,
    [Location.EAST]: 180,
    [Location.SOUTH]: 90,
    [Location.WEST]: 0,
    [Location.NORTHEAST]: 225,
    [Location.SOUTHEAST]: 135,
    [Location.SOUTHWEST]: 45,
    [Location.NORTHWEST]: 315,
  };

  // DASH NO_ROTATION mapping (start_loc, end_loc) -> angle
  private readonly dashNoRotationMap: Record<string, number> = {
    [`${Location.NORTH},${Location.SOUTH}`]: 90,
    [`${Location.EAST},${Location.WEST}`]: 180,
    [`${Location.SOUTH},${Location.NORTH}`]: 270,
    [`${Location.WEST},${Location.EAST}`]: 0,
    [`${Location.SOUTHEAST},${Location.NORTHWEST}`]: 225,
    [`${Location.SOUTHWEST},${Location.NORTHEAST}`]: 315,
    [`${Location.NORTHWEST},${Location.SOUTHEAST}`]: 45,
    [`${Location.NORTHEAST},${Location.SOUTHWEST}`]: 135,
  };

  calculateRotation(motion: MotionData, location: Location): number {
    /**
     * Calculate arrow rotation angle based on motion type and location.
     *
     * Args:
     *     motion: Motion data containing type and rotation direction
     *     location: Calculated arrow location
     *
     * Returns:
     *     Rotation angle in degrees (0-360)
     */
    const motionType = motion.motion_type?.toLowerCase();

    switch (motionType) {
      case "static":
        return this.calculateStaticRotation(location);
      case "pro":
        return this.calculateProRotation(motion, location);
      case "anti":
        return this.calculateAntiRotation(motion, location);
      case "dash":
        return this.calculateDashRotation(motion, location);
      case "float":
        return this.calculateFloatRotation(motion, location);
      default:
        console.warn(`Unknown motion type: ${motionType}, returning 0.0`);
        return 0.0;
    }
  }

  private calculateStaticRotation(location: Location): number {
    /**Calculate rotation for static arrows (point inward).*/
    return this.staticRotationMap[location] || 0.0;
  }

  private calculateProRotation(motion: MotionData, location: Location): number {
    /**Calculate rotation for PRO arrows based on rotation direction.*/
    const rotDir = motion.prop_rot_dir?.toLowerCase();
    if (rotDir === "clockwise" || rotDir === "cw") {
      return this.proClockwiseMap[location] || 0.0;
    } else {
      // COUNTER_CLOCKWISE
      return this.proCounterClockwiseMap[location] || 0.0;
    }
  }

  private calculateAntiRotation(
    motion: MotionData,
    location: Location
  ): number {
    /**Calculate rotation for ANTI arrows based on rotation direction.*/
    const rotDir = motion.prop_rot_dir?.toLowerCase();
    if (rotDir === "clockwise" || rotDir === "cw") {
      return this.antiClockwiseMap[location] || 0.0;
    } else {
      // COUNTER_CLOCKWISE
      return this.antiCounterClockwiseMap[location] || 0.0;
    }
  }

  private calculateDashRotation(
    motion: MotionData,
    location: Location
  ): number {
    /**Calculate rotation for DASH arrows with special NO_ROTATION handling.*/
    const rotDir = motion.prop_rot_dir?.toLowerCase();

    // Handle NO_ROTATION case first (most common for dash)
    if (rotDir === "no_rotation" || rotDir === "none") {
      const key = `${motion.start_loc},${motion.end_loc}`;
      return this.dashNoRotationMap[key] || 0.0;
    }

    // Handle rotation-based dash arrows
    if (rotDir === "clockwise" || rotDir === "cw") {
      return this.dashClockwiseMap[location] || 0.0;
    } else {
      // COUNTER_CLOCKWISE
      return this.dashCounterClockwiseMap[location] || 0.0;
    }
  }

  private calculateFloatRotation(
    motion: MotionData,
    location: Location
  ): number {
    /**Calculate rotation for FLOAT arrows (similar to PRO).*/
    return this.calculateProRotation(motion, location);
  }

  getSupportedMotionTypes(): MotionType[] {
    /**Get list of motion types supported by this calculator.*/
    return [
      MotionType.STATIC,
      MotionType.PRO,
      MotionType.ANTI,
      MotionType.DASH,
      MotionType.FLOAT,
    ];
  }

  validateMotionData(motion: MotionData): boolean {
    /**Validate that motion data is suitable for rotation calculation.*/
    if (!motion) {
      return false;
    }

    const motionType = motion.motion_type?.toLowerCase();
    if (!this.getSupportedMotionTypes().includes(motionType as MotionType)) {
      return false;
    }

    // Validate rotation direction is provided
    if (!motion.prop_rot_dir) {
      return false;
    }

    return true;
  }
}
