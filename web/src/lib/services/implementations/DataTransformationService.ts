/**
 * Data Transformation Service
 *
 * Handles data transformation and adaptation between different formats.
 * Extracted from PictographRenderingService.
 */

import type { BeatData, MotionData, PictographData } from "$lib/domain";
import {
  ArrowType,
  createArrowData,
  createGridData as createDomainGridData,
  createPictographData,
  createPropData,
  GridMode,
  PropType,
} from "$lib/domain";
import { type GridData as RawGridData } from "../../data/gridCoordinates.js";
export interface GridData {
  mode: GridMode;
  allLayer2PointsNormal: Record<
    string,
    { coordinates: { x: number; y: number } }
  >;
  allHandPointsNormal: Record<
    string,
    { coordinates: { x: number; y: number } }
  >;
}

export interface IDataTransformationService {
  beatToPictographData(beat: BeatData): PictographData;
  adaptGridData(rawGridData: RawGridData, mode: GridMode): GridData;
}

export class DataTransformationService implements IDataTransformationService {
  /**
   * Convert beat data to pictograph data
   */
  beatToPictographData(beat: BeatData): PictographData {
    const motions: Record<string, MotionData> = {};
    if (beat.pictograph_data?.motions?.blue)
      motions.blue = beat.pictograph_data.motions.blue;
    if (beat.pictograph_data?.motions?.red)
      motions.red = beat.pictograph_data.motions.red;
    return createPictographData({
      id: `beat-${beat.beat_number}`,
      grid_data: createDomainGridData(),
      arrows: {
        blue: createArrowData({ arrow_type: ArrowType.BLUE, color: "blue" }),
        red: createArrowData({ arrow_type: ArrowType.RED, color: "red" }),
      },
      props: {
        blue: createPropData({ prop_type: PropType.STAFF, color: "blue" }),
        red: createPropData({ prop_type: PropType.STAFF, color: "red" }),
      },
      motions,
      letter: beat.pictograph_data?.letter || null,
      beat: beat.beat_number,
      is_blank: beat.is_blank,
      is_mirrored: false,
    });
  }

  /**
   * Adapt raw grid data to match the interface requirements
   */
  adaptGridData(rawGridData: RawGridData, mode: GridMode): GridData {
    // Filter out null coordinates and adapt to interface
    const adaptPoints = (
      points: Record<string, { coordinates: { x: number; y: number } | null }>
    ) => {
      const adapted: Record<string, { coordinates: { x: number; y: number } }> =
        {};
      for (const [key, point] of Object.entries(points)) {
        if (point.coordinates) {
          adapted[key] = { coordinates: point.coordinates };
        }
      }
      return adapted;
    };

    return {
      mode,
      allLayer2PointsNormal: adaptPoints(
        rawGridData.allLayer2PointsNormal || {}
      ),
      allHandPointsNormal: adaptPoints(rawGridData.allHandPointsNormal || {}),
    };
  }
}
