/**
 * Arrow Coordinate System Service Interface
 *
 * Provides coordinate system services for arrow positioning.
 * Handles spatial calculations and coordinate transformations.
 */

import type { GridLocation, MotionData } from "$shared";
import type { Point } from "fabric";

export interface IArrowCoordinateSystemService {
  /**
   * Get initial position coordinates based on motion type and location.
   */
  getInitialPoint(motion: MotionData, location: GridLocation): Point;
  
  getSceneCenter(): Point;
  
  getSceneDimensions(): [number, number];
  
  getCoordinateInfo(location: GridLocation): Record<string, unknown>;
  
  validateCoordinates(point: Point): boolean;
  
  getAllHandPoints(): Record<GridLocation, Point>;
  
  getAllLayer2Points(): Record<GridLocation, Point>;
  
  getSupportedLocations(): GridLocation[];
}
