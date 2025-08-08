// src/lib/components/PlacementManagers/ArrowPlacementManager/utils/positionCalculator.ts
import type { ArrowData } from '$lib/components/objects/Arrow/ArrowData';
import type { ArrowPlacementConfig, Coordinates } from '../types';
import { ANTI, DASH, FLOAT, PRO, STATIC } from '$lib/types/Constants';

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
  switch (motionType) {
    case PRO:
    case ANTI:
    case FLOAT:
      return getShiftCoordinates(arrow, pictographData, gridData);
    case STATIC:
    case DASH:
      return getStaticDashCoordinates(arrow, pictographData, gridData);
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
  const pointName = `${arrow.loc}_${pictographData.gridMode || 'diamond'}_layer2_point`;
  const point = gridData.allLayer2PointsNormal?.[pointName];

  if (!point?.coordinates) {
    console.warn(`Shift coordinate for '${pointName}' not found, using default.`);
    // Return default coordinates for missing layer2 points
    return getDefaultLayer2Coordinates(arrow.loc, pictographData.gridMode || 'diamond');
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
  const pointName = `${arrow.loc}_${pictographData.gridMode || 'diamond'}_hand_point`;
  const point = gridData.allHandPointsNormal?.[pointName];

  if (!point?.coordinates) {
    console.warn(`Static coordinate for '${pointName}' not found, using default.`);
    // Return default coordinates for missing hand points
    return getDefaultHandCoordinates(arrow.loc, pictographData.gridMode || 'diamond');
  }

  return point.coordinates;
}

/**
 * Provides default layer2 coordinates when grid data is missing
 */
function getDefaultLayer2Coordinates(location: string, gridMode: string): Coordinates {
  const center = { x: 475, y: 475 };
  const layer2Radius = 143; // Standard layer2 radius

  if (gridMode === 'diamond') {
    switch (location) {
      case 'n': return { x: center.x, y: center.y - layer2Radius };
      case 'e': return { x: center.x + layer2Radius, y: center.y };
      case 's': return { x: center.x, y: center.y + layer2Radius };
      case 'w': return { x: center.x - layer2Radius, y: center.y };
      case 'ne': return { x: center.x + layer2Radius * 0.707, y: center.y - layer2Radius * 0.707 };
      case 'se': return { x: center.x + layer2Radius * 0.707, y: center.y + layer2Radius * 0.707 };
      case 'sw': return { x: center.x - layer2Radius * 0.707, y: center.y + layer2Radius * 0.707 };
      case 'nw': return { x: center.x - layer2Radius * 0.707, y: center.y - layer2Radius * 0.707 };
      default: return center;
    }
  }

  // Default fallback
  return center;
}

/**
 * Provides default hand coordinates when grid data is missing
 */
function getDefaultHandCoordinates(location: string, gridMode: string): Coordinates {
  const center = { x: 475, y: 475 };
  const handRadius = 100; // Standard hand radius

  if (gridMode === 'diamond') {
    switch (location) {
      case 'n': return { x: center.x, y: center.y - handRadius };
      case 'e': return { x: center.x + handRadius, y: center.y };
      case 's': return { x: center.x, y: center.y + handRadius };
      case 'w': return { x: center.x - handRadius, y: center.y };
      case 'ne': return { x: center.x + handRadius * 0.707, y: center.y - handRadius * 0.707 };
      case 'se': return { x: center.x + handRadius * 0.707, y: center.y + handRadius * 0.707 };
      case 'sw': return { x: center.x - handRadius * 0.707, y: center.y + handRadius * 0.707 };
      case 'nw': return { x: center.x - handRadius * 0.707, y: center.y - handRadius * 0.707 };
      default: return center;
    }
  }

  // Default fallback
  return center;
}
