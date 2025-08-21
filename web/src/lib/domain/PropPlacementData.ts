/**
 * Prop Placement Data Model
 *
 * Immutable data for prop positioning and placement calculations.
 * Separated from core PropData to follow separation of concerns principle.
 * This data is calculated by positioning services and represents the visual placement of props.
 */

export interface PropPlacementData {
  // Positioning (calculated coordinates)
  readonly position_x: number;
  readonly position_y: number;
  readonly rotation_angle: number;

  // Calculated coordinates and SVG data
  readonly coordinates?: { x: number; y: number } | null;
  readonly svg_center?: { x: number; y: number } | null;
}

/**
 * Create PropPlacementData with default values
 */
export function createPropPlacementData(
  data: Partial<PropPlacementData> = {}
): PropPlacementData {
  return {
    position_x: data.position_x ?? 0.0,
    position_y: data.position_y ?? 0.0,
    rotation_angle: data.rotation_angle ?? 0.0,
    coordinates: data.coordinates ?? null,
    svg_center: data.svg_center ?? null,
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
    position_x: placement.position_x,
    position_y: placement.position_y,
    rotation_angle: placement.rotation_angle,
    coordinates: placement.coordinates,
    svg_center: placement.svg_center,
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
  if (data.position_x !== undefined) {
    placementData.position_x = data.position_x;
  }
  if (data.position_y !== undefined) {
    placementData.position_y = data.position_y;
  }
  if (data.rotation_angle !== undefined) {
    placementData.rotation_angle = data.rotation_angle;
  }
  if (data.coordinates !== undefined) {
    placementData.coordinates = data.coordinates as {
      x: number;
      y: number;
    } | null;
  }
  if (data.svg_center !== undefined) {
    placementData.svg_center = data.svg_center as {
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
  return placement.position_x !== 0 || placement.position_y !== 0;
}

/**
 * Get position as coordinate object
 */
export function getPlacementPosition(placement: PropPlacementData): {
  x: number;
  y: number;
} {
  return {
    x: placement.position_x,
    y: placement.position_y,
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
    position_x: x,
    position_y: y,
    rotation_angle: rotation,
    coordinates: { x, y },
  });
}
