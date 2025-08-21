/**
 * Centralized PictographData Factory
 *
 * Ensures ALL pictographs are correctly constructed with complete data.
 * This is the ONLY way pictographs should be created to ensure consistency.
 */

import {
  createPictographData,
  createGridData,
  createMotionData,
  createPropData,
  createArrowData,
  type PictographData,
  type MotionData,
  type PropData,
  type ArrowData,
  type GridData,
} from "$lib/domain";
import {
  GridMode,
  GridPosition,
  Location,
  MotionType,
  Orientation,
  RotationDirection,
  MotionColor,
  PropType,
} from "$lib/domain/enums";
import { Letter } from "$lib/domain/Letter";

export interface PictographCreationParams {
  // Required fields
  letter: Letter;
  gridMode: GridMode;

  // Motion data (required)
  motions: {
    blue: Partial<MotionData>;
    red: Partial<MotionData>;
  };

  // Optional fields with smart defaults
  id?: string;
  startPosition?: GridPosition;
  endPosition?: GridPosition; // Will be derived if not provided
  props?: {
    blue?: Partial<PropData>;
    red?: Partial<PropData>;
  };
  arrows?: {
    blue?: Partial<ArrowData>;
    red?: Partial<ArrowData>;
  };
  gridData?: Partial<GridData>;
  isBlank?: boolean;
  isMirrored?: boolean;
  metadata?: Record<string, any>;
}

export class PictographDataFactory {
  /**
   * Create a complete, validated PictographData with all required fields
   */
  static create(params: PictographCreationParams): PictographData {
    // ✅ CENTRALIZED: Ensure all pictographs have complete data

    // Derive endPosition if not provided
    const endPosition =
      params.endPosition || this.deriveEndPosition(params.motions);

    // Derive startPosition if not provided
    const startPosition =
      params.startPosition || this.deriveStartPosition(params.motions);

    // Create complete motion data with defaults
    const blueMotion = this.createCompleteMotionData(
      params.motions.blue,
      MotionColor.BLUE
    );
    const redMotion = this.createCompleteMotionData(
      params.motions.red,
      MotionColor.RED
    );

    // Create complete prop data with defaults
    const blueProp = this.createCompletePropData(
      params.props?.blue,
      MotionColor.BLUE
    );
    const redProp = this.createCompletePropData(
      params.props?.red,
      MotionColor.RED
    );

    // Create complete arrow data with defaults
    const blueArrow = this.createCompleteArrowData(
      params.arrows?.blue,
      MotionColor.BLUE
    );
    const redArrow = this.createCompleteArrowData(
      params.arrows?.red,
      MotionColor.RED
    );

    // Create complete grid data
    const gridData = createGridData({
      gridMode: params.gridMode,
      center_x: 475,
      center_y: 475,
      radius: 100,
      ...params.gridData,
    });

    return createPictographData({
      id: params.id || `pictograph-${params.letter}-${Date.now()}`,
      letter: params.letter,
      startPosition,
      endPosition, // ✅ GUARANTEED: Always set
      gridData,
      motions: {
        blue: blueMotion,
        red: redMotion,
      },
      props: {
        blue: blueProp,
        red: redProp,
      },
      arrows: {
        blue: blueArrow,
        red: redArrow,
      },
      isBlank: params.isBlank || false,
      isMirrored: params.isMirrored || false,
      metadata: params.metadata || {},
    });
  }

  /**
   * Derive endPosition from motion data
   */
  private static deriveEndPosition(motions: {
    blue: Partial<MotionData>;
    red: Partial<MotionData>;
  }): GridPosition {
    // Check if both motions end at the same location
    const blueEndLocation = motions.blue.endLocation;
    const redEndLocation = motions.red.endLocation;

    if (blueEndLocation === redEndLocation && blueEndLocation) {
      // Convert location to GridPosition
      return this.locationToGridPosition(blueEndLocation);
    }

    // Default fallback
    return GridPosition.ALPHA1;
  }

  /**
   * Derive startPosition from motion data
   */
  private static deriveStartPosition(_motions: {
    blue: Partial<MotionData>;
    red: Partial<MotionData>;
  }): GridPosition {
    // For now, use a simple default - could be enhanced later
    return GridPosition.ALPHA1;
  }

  /**
   * Convert Location enum to GridPosition enum
   */
  private static locationToGridPosition(location: Location): GridPosition {
    const locationMap: Record<Location, GridPosition> = {
      [Location.NORTH]: GridPosition.ALPHA1,
      [Location.NORTHEAST]: GridPosition.ALPHA2,
      [Location.EAST]: GridPosition.ALPHA3,
      [Location.SOUTHEAST]: GridPosition.ALPHA4,
      [Location.SOUTH]: GridPosition.BETA5,
      [Location.SOUTHWEST]: GridPosition.ALPHA6,
      [Location.WEST]: GridPosition.ALPHA7,
      [Location.NORTHWEST]: GridPosition.ALPHA8,
    };

    return locationMap[location] || GridPosition.ALPHA1;
  }

  /**
   * Create complete motion data with all required fields
   */
  private static createCompleteMotionData(
    partial: Partial<MotionData>,
    color: MotionColor
  ): MotionData {
    return createMotionData({
      motionType: partial.motionType || MotionType.STATIC,
      startLocation: partial.startLocation || Location.NORTH,
      endLocation: partial.endLocation || Location.NORTH,
      startOrientation: partial.startOrientation || Orientation.IN,
      endOrientation: partial.endOrientation || Orientation.IN,
      rotationDirection:
        partial.rotationDirection || RotationDirection.CLOCKWISE,
      turns: partial.turns || 0,
      isVisible: partial.isVisible !== undefined ? partial.isVisible : true,
      color,
      ...partial,
    });
  }

  /**
   * Create complete prop data with all required fields
   */
  private static createCompletePropData(
    partial: Partial<PropData> | undefined,
    _color: MotionColor
  ): PropData {
    return createPropData({
      propType: partial?.propType || PropType.STAFF,
      orientation: partial?.orientation || Orientation.IN,
      rotationDirection:
        partial?.rotationDirection || RotationDirection.CLOCKWISE,
      ...partial,
    });
  }

  /**
   * Create complete arrow data with all required fields
   */
  private static createCompleteArrowData(
    partial: Partial<ArrowData> | undefined,
    _color: MotionColor
  ): ArrowData {
    return createArrowData({
      // ✅ SIMPLIFIED: Only arrow-specific properties, motion data comes from MotionData
      arrowLocation: partial?.arrowLocation || null, // Will be calculated by positioning system
      positionX: partial?.positionX || 0,
      positionY: partial?.positionY || 0,
      rotationAngle: partial?.rotationAngle || 0,
      ...partial,
    });
  }
}
