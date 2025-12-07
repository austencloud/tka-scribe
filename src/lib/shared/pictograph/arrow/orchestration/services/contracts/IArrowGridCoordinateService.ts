/**
 * Arrow Grid Coordinate Service Contract
 *
 * Interface for arrow-specific coordinate functionality using the authoritative grid data.
 */

import type { GridLocation, GridMode } from "../../../../grid/domain/enums/grid-enums";
import type { MotionData } from "../../../../shared/domain/models/MotionData";
import type { Point } from "fabric";

export interface IArrowGridCoordinateService {
  /**
   * Get initial position for motion at given location
   */
  getInitialPosition(motion: MotionData, location: GridLocation): Point;

  /**
   * Get scene center point
   */
  getSceneCenter(): Point;

  /**
   * Get scene dimensions as [width, height]
   */
  getSceneDimensions(): [number, number];

  /**
   * Validate coordinates are within scene bounds
   */
  validateCoordinates(point: Point): boolean;

  /**
   * Get all hand points for given grid mode
   */
  getAllHandPoints(gridMode?: GridMode): Partial<Record<GridLocation, Point>>;

  /**
   * Get all layer 2 points for given grid mode
   */
  getAllLayer2Points(gridMode?: GridMode): Partial<Record<GridLocation, Point>>;

  /**
   * Get supported grid locations
   */
  getSupportedLocations(): GridLocation[];
}
