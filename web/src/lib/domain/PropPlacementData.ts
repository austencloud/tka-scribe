/**
 * Prop Placement Data Model
 *
 * Immutable data for prop positioning and placement calculations.
 * Separated from core PropData to follow separation of concerns principle.
 * This data is calculated by positioning services and represents the visual placement of props.
 */

export interface PropPlacementData {
  // Positioning (calculated coordinates)
  readonly positionX: number;
  readonly positionY: number;
  readonly rotationAngle: number;

  // Calculated coordinates and SVG data
  readonly coordinates?: { x: number; y: number } | null;
  readonly svgCenter?: { x: number; y: number } | null;
}

/**
 * Create PropPlacementData with default values
 */
export function createPropPlacementData(
  data: Partial<PropPlacementData> = {}
): PropPlacementData {
  return {
    positionX: data.positionX ?? 0.0,
    positionY: data.positionY ?? 0.0,
    rotationAngle: data.rotationAngle ?? 0.0,
    coordinates: data.coordinates ?? null,
    svgCenter: data.svgCenter ?? null,
  };
}

/**
 * Update PropPlacementData immutably
 */
export function updatePropPlacementData(
  placement: PropPlacementData,
  updates: Partial<PropPlacementData>
): PropPlacementData {
  return {
    ...placement,
    ...updates,
  };
}

/**
 * Convert PropPlacementData to plain object for serialization
 */
export function propPlacementDataToObject(
  placement: PropPlacementData
): Record<string, unknown> {
  return {
    positionX: placement.positionX,
    positionY: placement.positionY,
    rotationAngle: placement.rotationAngle,
    coordinates: placement.coordinates,
    svgCenter: placement.svgCenter,
  };
}

/**
 * Create PropPlacementData from plain object (deserialization)
 */
export function propPlacementDataFromObject(
  data: Record<string, unknown>
): PropPlacementData {
  const placementData: Record<string, unknown> = {};

  if (data.location !== undefined) {
    placementData.location = data.location;
  }
  if (data.positionX !== undefined) {
    placementData.positionX = data.positionX;
  }
  if (data.positionY !== undefined) {
    placementData.positionY = data.positionY;
  }
  if (data.rotationAngle !== undefined) {
    placementData.rotationAngle = data.rotationAngle;
  }
  if (data.coordinates !== undefined) {
    placementData.coordinates = data.coordinates as {
      x: number;
      y: number;
    } | null;
  }
  if (data.svgCenter !== undefined) {
    placementData.svgCenter = data.svgCenter as {
      x: number;
      y: number;
    } | null;
  }

  return createPropPlacementData(placementData as Partial<PropPlacementData>);
}

/**
 * Check if PropPlacementData has valid positioning information
 */
export function hasValidPlacement(placement: PropPlacementData): boolean {
  return placement.positionX !== 0 || placement.positionY !== 0;
}

/**
 * Get position as coordinate object
 */
export function getPlacementPosition(placement: PropPlacementData): {
  x: number;
  y: number;
} {
  return {
    x: placement.positionX,
    y: placement.positionY,
  };
}

/**
 * Create PropPlacementData from position and rotation
 */
export function createPropPlacementFromPosition(
  x: number,
  y: number,
  rotation: number = 0
): PropPlacementData {
  return createPropPlacementData({
    positionX: x,
    positionY: y,
    rotationAngle: rotation,
    coordinates: { x, y },
  });
}
