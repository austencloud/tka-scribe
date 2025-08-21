import type { IMotionDataCreationService } from "../../interfaces/data/IMotionDataCreationService.js";
import type { MotionData } from "$lib/domain/MotionData";
import type {
  Location,
  Orientation,
  MotionType,
  RotationDirection,
  MotionColor,
} from "$lib/domain/enums";
import { createMotionData } from "$lib/domain/MotionData";

/**
 * Unified service for creating MotionData objects with proper color assignment.
 * Eliminates code duplication between PictographTransformationService and Motion Tester.
 *
 * This microservice follows the established pattern:
 * - Single responsibility: MotionData creation
 * - Dependency injection integration
 * - Consistent color assignment logic
 * - Testable in isolation
 */
export class MotionDataCreationService implements IMotionDataCreationService {
  /**
   * Create a blue motion with explicit blue color assignment
   */
  createBlueMotion(params: {
    startLocation: Location;
    endLocation: Location;
    startOrientation: Orientation;
    endOrientation: Orientation;
    motionType: MotionType;
    rotationDirection: RotationDirection;
    turns: number;
    isVisible: boolean;
  }): MotionData {
    console.log("🔵 MotionDataCreationService: Creating blue motion", params);

    const motion = createMotionData({
      ...params,
      color: "blue" as MotionColor, // ✅ Explicitly set blue color
    });

    console.log(
      "🔵 MotionDataCreationService: Created blue motion with color:",
      motion.color
    );
    return motion;
  }

  /**
   * Create a red motion with explicit red color assignment
   */
  createRedMotion(params: {
    startLocation: Location;
    endLocation: Location;
    startOrientation: Orientation;
    endOrientation: Orientation;
    motionType: MotionType;
    rotationDirection: RotationDirection;
    turns: number;
    isVisible: boolean;
  }): MotionData {
    console.log("🔴 MotionDataCreationService: Creating red motion", params);

    const motion = createMotionData({
      ...params,
      color: "red" as MotionColor, // ✅ Explicitly set red color
    });

    console.log(
      "🔴 MotionDataCreationService: Created red motion with color:",
      motion.color
    );
    return motion;
  }

  /**
   * Create both blue and red motions from CSV row data
   * Used by PictographTransformationService
   */
  createMotionsFromCsvRow(params: {
    // Blue motion parameters
    blueStartLocation: Location;
    blueEndLocation: Location;
    blueStartOrientation: Orientation;
    blueEndOrientation: Orientation;
    blueMotionType: MotionType;
    blueRotationDirection: RotationDirection;

    // Red motion parameters
    redStartLocation: Location;
    redEndLocation: Location;
    redStartOrientation: Orientation;
    redEndOrientation: Orientation;
    redMotionType: MotionType;
    redRotationDirection: RotationDirection;

    // Common parameters
    turns: number;
    isVisible: boolean;
  }): { blueMotion: MotionData; redMotion: MotionData } {
    console.log("🔄 MotionDataCreationService: Creating motions from CSV row");

    const blueMotion = this.createBlueMotion({
      startLocation: params.blueStartLocation,
      endLocation: params.blueEndLocation,
      startOrientation: params.blueStartOrientation,
      endOrientation: params.blueEndOrientation,
      motionType: params.blueMotionType,
      rotationDirection: params.blueRotationDirection,
      turns: params.turns,
      isVisible: params.isVisible,
    });

    const redMotion = this.createRedMotion({
      startLocation: params.redStartLocation,
      endLocation: params.redEndLocation,
      startOrientation: params.redStartOrientation,
      endOrientation: params.redEndOrientation,
      motionType: params.redMotionType,
      rotationDirection: params.redRotationDirection,
      turns: params.turns,
      isVisible: params.isVisible,
    });

    console.log(
      "🔄 MotionDataCreationService: Created motion pair - blue:",
      blueMotion.color,
      "red:",
      redMotion.color
    );

    return { blueMotion, redMotion };
  }

  /**
   * Create both blue and red motions from motion tester parameters
   * Used by Motion Tester StaticSection
   */
  createMotionsFromTesterParams(params: {
    blueParams: {
      startLocation: Location;
      endLocation: Location;
      startOrientation: Orientation;
      endOrientation: Orientation;
      motionType: MotionType;
      rotationDirection: RotationDirection;
      turns: number;
    };
    redParams: {
      startLocation: Location;
      endLocation: Location;
      startOrientation: Orientation;
      endOrientation: Orientation;
      motionType: MotionType;
      rotationDirection: RotationDirection;
      turns: number;
    };
    isVisible: boolean;
  }): { blueMotion: MotionData; redMotion: MotionData } {
    console.log(
      "🎯 MotionDataCreationService: Creating motions from tester params"
    );

    const blueMotion = this.createBlueMotion({
      ...params.blueParams,
      isVisible: params.isVisible,
    });

    const redMotion = this.createRedMotion({
      ...params.redParams,
      isVisible: params.isVisible,
    });

    console.log(
      "🎯 MotionDataCreationService: Created tester motion pair - blue:",
      blueMotion.color,
      "red:",
      redMotion.color
    );

    return { blueMotion, redMotion };
  }
}
