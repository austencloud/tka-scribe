/**
 * Prop Domain Model
 *
 * Immutable data for a prop in a pictograph.
 * Core prop identity separated from placement data for better separation of concerns.
 * Based on modern desktop app's prop_data.py
 */

import { Orientation, PropType, RotationDirection } from "./enums";
import type { PropPlacementData } from "./PropPlacementData";
import { createPropPlacementData } from "./PropPlacementData";

export interface PropData {
  readonly id: string;
  readonly propType: PropType;
  readonly orientation: Orientation;
  readonly rotationDirection: RotationDirection;
  readonly placementData: PropPlacementData;
  readonly isVisible: boolean;
  readonly isSelected: boolean;
}

export function createPropData(data: Partial<PropData> = {}): PropData {
  return {
    id: data.id ?? crypto.randomUUID(),
    propType: data.propType ?? PropType.STAFF,
    orientation: data.orientation ?? Orientation.IN,
    rotationDirection: data.rotationDirection ?? RotationDirection.NO_ROTATION,
    placementData: data.placementData ?? createPropPlacementData(),
    isVisible: data.isVisible ?? true,
    isSelected: data.isSelected ?? false,
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
    orientation: prop.orientation,
    rotationDirection: prop.rotationDirection,
    placementData: prop.placementData,
    isVisible: prop.isVisible,
    isSelected: prop.isSelected,
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
  if (data.orientation !== undefined) {
    propData.orientation = data.orientation;
  }
  if (data.rotationDirection !== undefined) {
    propData.rotationDirection = data.rotationDirection;
  }
  if (data.placementData !== undefined) {
    propData.placementData = data.placementData;
  }
  if (data.isVisible !== undefined) {
    propData.isVisible = data.isVisible;
  }
  if (data.isSelected !== undefined) {
    propData.isSelected = data.isSelected;
  }

  return createPropData(propData as Partial<PropData>);
}
