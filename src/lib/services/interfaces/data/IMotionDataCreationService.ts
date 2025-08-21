import type { MotionData } from "$lib/domain/MotionData";
import type {
  Location,
  Orientation,
  MotionType,
  RotationDirection,
} from "$lib/domain/enums";

/**
 * Interface for unified MotionData creation service.
 * Eliminates code duplication and ensures consistent color assignment.
 */
export interface IMotionDataCreationService {
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
  }): MotionData;

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
  }): MotionData;

  /**
   * Create both blue and red motions from CSV row data
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
  }): { blueMotion: MotionData; redMotion: MotionData };

  /**
   * Create both blue and red motions from motion tester parameters
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
  }): { blueMotion: MotionData; redMotion: MotionData };
}
