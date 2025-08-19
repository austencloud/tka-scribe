/**
 * Prop Domain Model
 *
 * Immutable data for a prop in a pictograph.
 * Based on modern desktop app's prop_data.py
 */

import { MotionColor, Orientation, PropType, RotationDirection } from "./enums";

export interface PropData {
  readonly id: string;
  readonly propType: PropType;
  readonly color: MotionColor;
  readonly orientation: Orientation;
  readonly rotationDirection: RotationDirection;

  // Position data (calculated by positioning system)
  readonly location?: string | null;
  readonly position_x: number;
  readonly position_y: number;
  readonly rotation_angle: number;
  readonly coordinates?: { x: number; y: number } | null;
  readonly svg_center?: { x: number; y: number } | null;

  // State flags
  readonly isVisible: boolean;
  readonly is_selected: boolean;
}

export function createPropData(data: Partial<PropData> = {}): PropData {
  return {
    id: data.id ?? crypto.randomUUID(),
    propType: data.propType ?? PropType.STAFF,
    color: data.color ?? MotionColor.BLUE,
    orientation: data.orientation ?? Orientation.IN,
    rotationDirection: data.rotationDirection ?? RotationDirection.NO_ROTATION,
    location: data.location ?? null,
    position_x: data.position_x ?? 0.0,
    position_y: data.position_y ?? 0.0,
    rotation_angle: data.rotation_angle ?? 0.0,
    coordinates: data.coordinates ?? null,
    svg_center: data.svg_center ?? null,
    isVisible: data.isVisible ?? true,
    is_selected: data.is_selected ?? false,
  };
}

export function updatePropData(
  prop: PropData,
  updates: Partial<PropData>
): PropData {
  return {
    ...prop,
    ...updates,
  };
}

export function propDataToObject(prop: PropData): Record<string, unknown> {
  return {
    id: prop.id,
    propType: prop.propType,
    color: prop.color,
    orientation: prop.orientation,
    rotationDirection: prop.rotationDirection,
    location: prop.location,
    position_x: prop.position_x,
    position_y: prop.position_y,
    isVisible: prop.isVisible,
    is_selected: prop.is_selected,
  };
}

export function propDataFromObject(data: Record<string, unknown>): PropData {
  const propData: Record<string, unknown> = {};

  if (data.id !== undefined) {
    propData.id = data.id as string;
  }
  if (data.propType !== undefined) {
    propData.propType = data.propType;
  }
  if (data.color !== undefined) {
    propData.color = data.color;
  }
  if (data.orientation !== undefined) {
    propData.orientation = data.orientation;
  }
  if (data.rotationDirection !== undefined) {
    propData.rotationDirection = data.rotationDirection;
  }
  if (data.location !== undefined) {
    propData.location = data.location;
  }
  if (data.position_x !== undefined) {
    propData.position_x = data.position_x;
  }
  if (data.position_y !== undefined) {
    propData.position_y = data.position_y;
  }
  if (data.isVisible !== undefined) {
    propData.isVisible = data.isVisible;
  }
  if (data.is_selected !== undefined) {
    propData.is_selected = data.is_selected;
  }

  return createPropData(propData as Partial<PropData>);
}
