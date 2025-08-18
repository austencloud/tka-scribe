/**
 * Prop Domain Model
 *
 * Immutable data for a prop in a pictograph.
 * Based on modern desktop app's prop_data.py
 */

import { MotionColor, Orientation, PropType, RotationDirection } from "./enums";

export interface PropData {
  readonly id: string;
  readonly prop_type: PropType;
  readonly color: MotionColor;
  readonly orientation: Orientation;
  readonly rotation_direction: RotationDirection;

  // Position data (calculated by positioning system)
  readonly location?: string | null;
  readonly position_x: number;
  readonly position_y: number;
  readonly rotation_angle: number;
  readonly coordinates?: { x: number; y: number } | null;
  readonly svg_center?: { x: number; y: number } | null;

  // State flags
  readonly is_visible: boolean;
  readonly is_selected: boolean;
}

export function createPropData(data: Partial<PropData> = {}): PropData {
  return {
    id: data.id ?? crypto.randomUUID(),
    prop_type: data.prop_type ?? PropType.STAFF,
    color: data.color ?? MotionColor.BLUE,
    orientation: data.orientation ?? Orientation.IN,
    rotation_direction:
      data.rotation_direction ?? RotationDirection.NO_ROTATION,
    location: data.location ?? null,
    position_x: data.position_x ?? 0.0,
    position_y: data.position_y ?? 0.0,
    rotation_angle: data.rotation_angle ?? 0.0,
    coordinates: data.coordinates ?? null,
    svg_center: data.svg_center ?? null,
    is_visible: data.is_visible ?? true,
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
    prop_type: prop.prop_type,
    color: prop.color,
    orientation: prop.orientation,
    rotation_direction: prop.rotation_direction,
    location: prop.location,
    position_x: prop.position_x,
    position_y: prop.position_y,
    is_visible: prop.is_visible,
    is_selected: prop.is_selected,
  };
}

export function propDataFromObject(data: Record<string, unknown>): PropData {
  const propData: Record<string, unknown> = {};

  if (data.id !== undefined) {
    propData.id = data.id as string;
  }
  if (data.prop_type !== undefined) {
    propData.prop_type = data.prop_type;
  }
  if (data.color !== undefined) {
    propData.color = data.color;
  }
  if (data.orientation !== undefined) {
    propData.orientation = data.orientation;
  }
  if (data.rotation_direction !== undefined) {
    propData.rotation_direction = data.rotation_direction;
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
  if (data.is_visible !== undefined) {
    propData.is_visible = data.is_visible;
  }
  if (data.is_selected !== undefined) {
    propData.is_selected = data.is_selected;
  }

  return createPropData(propData as Partial<PropData>);
}
