/**
 * Prop Placement Service
 *
 * Dedicated service for calculating prop placement data.
 * Follows separation of concerns by focusing only on placement calculations.
 * Returns PropPlacementData that can be attached to PropData.
 */

import type { PropData, MotionData, PropPlacementData } from "$lib/domain";
import {
  MotionColor,
  GridMode,
  Location,
  MotionType,
  Orientation,
  RotationDirection,
} from "$lib/domain/enums";
import {
  createPropPlacementData,
  createPropPlacementFromPosition,
} from "$lib/domain/PropPlacementData";
import { DefaultPropPositioner } from "../../DefaultPropPositioner";
import { PropRotAngleManager } from "../../PropRotAngleManager";
import { BetaOffsetCalculator } from "./BetaOffsetCalculator";
import { BetaPropDirectionCalculator } from "./BetaPropDirectionCalculator";

export interface IPropPlacementService {
  calculatePlacement(
    propData: PropData,
    motionData?: MotionData,
    gridMode?: GridMode,
    allProps?: PropData[],
    allMotions?: Record<string, MotionData>,
    endsWithBeta?: boolean
  ): PropPlacementData;
}

export class PropPlacementService implements IPropPlacementService {
  calculatePlacement(
    propData: PropData,
    motionData?: MotionData,
    gridMode: GridMode = GridMode.DIAMOND,
    allProps: PropData[] = [],
    allMotions: Record<string, MotionData> = {},
    endsWithBeta: boolean = false
  ): PropPlacementData {
    if (!propData) {
      return createPropPlacementData({
        position_x: 475,
        position_y: 475,
        rotation_angle: 0,
      });
    }

    // Calculate position
    const position = this.calculatePosition(
      propData,
      motionData,
      gridMode,
      allProps,
      allMotions,
      endsWithBeta
    );

    // Calculate rotation
    const rotation = this.calculateRotation(propData, motionData, gridMode);


    return createPropPlacementFromPosition(position.x, position.y, rotation);
  }

  private calculatePosition(
    propData: PropData,
    motionData?: MotionData,
    gridMode: GridMode = GridMode.DIAMOND,
    allProps: PropData[] = [],
    allMotions: Record<string, MotionData> = {},
    endsWithBeta: boolean = false,
    propColor?: string
  ): { x: number; y: number } {
    // Use motion's endLocation since prop no longer stores location
    const location = motionData?.endLocation;

    // Calculate base position using existing service
    const basePosition = DefaultPropPositioner.calculatePosition(
      location as string,
      gridMode
    );

    // Apply beta offset if needed
    const betaOffset = this.calculateBetaOffset(
      propData,
      allProps,
      endsWithBeta,
      motionData,
      allMotions,
      propColor
    );

    return {
      x: basePosition.x + betaOffset.x,
      y: basePosition.y + betaOffset.y,
    };
  }

  private calculateBetaOffset(
    propData: PropData,
    allProps: PropData[],
    endsWithBeta: boolean,
    motionData?: MotionData,
    allMotions: Record<string, MotionData> = {},
    propColor?: string
  ): { x: number; y: number } {
    // Only apply beta offset if pictograph ends with beta
    if (!endsWithBeta || !propData || allProps.length < 2) {
      return { x: 0, y: 0 };
    }

    // Since PropData doesn't have color, we need to determine it from context
    // The propColor parameter should be passed from the calling code
    if (!propColor) {
      console.warn("PropColor not provided for beta offset calculation");
      return { x: 0, y: 0 };
    }

    // Find props at the same location by comparing motion endLocations
    const currentMotion = motionData;
    const otherColor =
      propColor === MotionColor.BLUE ? MotionColor.RED : MotionColor.BLUE;
    const otherMotion = allMotions[otherColor];

    if (!otherMotion || !currentMotion) {
      return { x: 0, y: 0 };
    }

    try {
      // Get motion data directly by color
      const redMotion =
        allMotions[MotionColor.RED] || this.createStaticMotionData(propData);
      const blueMotion =
        allMotions[MotionColor.BLUE] || this.createStaticMotionData(propData);

      const directionCalculator = new BetaPropDirectionCalculator({
        red: redMotion,
        blue: blueMotion,
      });

      const direction = directionCalculator.getDirection(propData);

      if (!direction) {
        return propColor === MotionColor.BLUE
          ? { x: -25, y: 0 }
          : { x: 25, y: 0 };
      }

      // Calculate offset using existing service
      const offsetCalculator = new BetaOffsetCalculator();
      const basePosition = { x: 0, y: 0 };
      const newPosition = offsetCalculator.calculateNewPositionWithOffset(
        basePosition,
        direction
      );

      return { x: newPosition.x, y: newPosition.y };
    } catch (error) {
      // Fallback to simple separation
      return propColor === MotionColor.BLUE
        ? { x: -25, y: 0 }
        : { x: 25, y: 0 };
    }
  }

  private createStaticMotionData(
    _propData: PropData,
    motionData?: MotionData
  ): MotionData {
    const location = motionData?.endLocation || Location.NORTH;
    return {
      motionType: MotionType.STATIC,
      rotationDirection: RotationDirection.CLOCKWISE,
      startLocation: location,
      endLocation: location,
      turns: 0,
      startOrientation: Orientation.IN,
      endOrientation: Orientation.IN,
      isVisible: true,
      color: MotionColor.BLUE, // Default color, will be overridden by caller
    };
  }

  private stringToLocation(locationStr: string | Location): Location {
    if (typeof locationStr !== "string") {
      return locationStr;
    }

    const locationMap: Record<string, Location> = {
      n: Location.NORTH,
      e: Location.EAST,
      s: Location.SOUTH,
      w: Location.WEST,
      ne: Location.NORTHEAST,
      se: Location.SOUTHEAST,
      sw: Location.SOUTHWEST,
      nw: Location.NORTHWEST,
      north: Location.NORTH,
      east: Location.EAST,
      south: Location.SOUTH,
      west: Location.WEST,
      northeast: Location.NORTHEAST,
      southeast: Location.SOUTHEAST,
      southwest: Location.SOUTHWEST,
      northwest: Location.NORTHWEST,
    };

    return locationMap[locationStr.toLowerCase()] || Location.NORTH;
  }

  private calculateRotation(
    propData: PropData,
    motionData?: MotionData,
    gridMode: GridMode = GridMode.DIAMOND
  ): number {
    if (!propData) return 0;

    const locationStr = motionData?.endLocation || "north";
    const location = this.stringToLocation(locationStr);
    const orientation = propData.orientation || Orientation.IN;

    return PropRotAngleManager.calculateRotation(
      location,
      orientation,
      gridMode
    );
  }
}
