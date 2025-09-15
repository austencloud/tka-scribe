// src/lib/components/PlacementManagers/ArrowPlacementManager/utils/positionCalculator.ts
import type { ArrowData } from "$legacyLib/components/objects/Arrow/ArrowData";
import { ANTI, DASH, FLOAT, PRO, STATIC } from "$legacyLib/types/Constants";
import type { ArrowPlacementConfig, Coordinates } from "../types";

/**
 * Gets the initial position for an arrow based on its type and location
 */
export function getInitialPosition(
  arrow: ArrowData,
  config: ArrowPlacementConfig
): Coordinates {
  const { motionType } = arrow;
  const { pictographData, gridData } = config;

  // Early return for invalid motion types
  if (!motionType) {
    return { x: 0, y: 0 };
  }

  // Determine position based on motion type
  let result: Coordinates;
  switch (motionType) {
    case PRO:
    case ANTI:
    case FLOAT:
      result = getShiftCoordinates(arrow, pictographData, gridData);
      return result;
    case STATIC:
    case DASH:
      result = getStaticDashCoordinates(arrow, pictographData, gridData);
      return result;
    default:
      return { x: 0, y: 0 };
  }
}

/**
 * Gets coordinates for shift-type motions (Pro, Anti, Float)
 */
function getShiftCoordinates(
  arrow: ArrowData,
  pictographData: any,
  gridData: any
): Coordinates {
  // Handle undefined arrow location
  if (!arrow.loc) {
    return { x: 475, y: 475 }; // Center fallback
  }

  const pointName = `${arrow.loc}_${pictographData.gridMode || "diamond"}_layer2_point`;
  const point = gridData.allLayer2PointsNormal[pointName];

  if (!point?.coordinates) {
    return { x: 475, y: 475 }; // Center fallback
  }

  return point.coordinates;
}

/**
 * Gets coordinates for static or dash motions
 */
function getStaticDashCoordinates(
  arrow: ArrowData,
  pictographData: any,
  gridData: any
): Coordinates {
  const pointName = `${arrow.loc}_${pictographData.gridMode || "diamond"}_hand_point`;
  const point = gridData.allHandPointsNormal[pointName];

  if (!point?.coordinates) {
    return { x: 0, y: 0 };
  }

  return point.coordinates;
}
