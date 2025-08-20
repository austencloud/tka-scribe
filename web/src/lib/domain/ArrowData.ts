/**
 * Arrow Domain Model
 *
 * Immutable data for an arrow in a pictograph.
 * Based on modern desktop app's arrow_data.py
 */

import { MotionType, Orientation, RotationDirection } from "./enums";

export interface ArrowData {
  readonly id: string;
  readonly turns: number;
  readonly isMirrored: boolean;

  // Motion properties
  readonly motionType: string;
  readonly start_orientation: string;
  readonly end_orientation: string;
  readonly rotationDirection: string;

  // Position data (calculated by positioning system)
  readonly location?: string | null;
  readonly position_x: number;
  readonly position_y: number;
  readonly rotation_angle: number;
  readonly coordinates?: { x: number; y: number } | null;
  readonly svg_center?: { x: number; y: number } | null;
  readonly svg_mirrored?: boolean;

  // State flags
  readonly isVisible: boolean;
  readonly isSelected: boolean;
}

export function createArrowData(data: Partial<ArrowData> = {}): ArrowData {
  return {
    id: data.id ?? crypto.randomUUID(),
    turns: data.turns ?? 0.0,
    isMirrored: data.isMirrored ?? false,
    motionType: data.motionType ?? MotionType.STATIC,
    start_orientation: data.start_orientation ?? Orientation.IN,
    end_orientation: data.end_orientation ?? Orientation.IN,
    rotationDirection: data.rotationDirection ?? RotationDirection.CLOCKWISE,
    location: data.location ?? null,
    position_x: data.position_x ?? 0.0,
    position_y: data.position_y ?? 0.0,
    rotation_angle: data.rotation_angle ?? 0.0,
    coordinates: data.coordinates ?? null,
    svg_center: data.svg_center ?? null,
    svg_mirrored: data.svg_mirrored ?? false,
    isVisible: data.isVisible ?? true,
    isSelected: data.isSelected ?? false,
  };
}

export function updateArrowData(
  arrow: ArrowData,
  updates: Partial<ArrowData>
): ArrowData {
  return {
    ...arrow,
    ...updates,
  };
}

export function arrowDataToObject(arrow: ArrowData): Record<string, unknown> {
  return {
    id: arrow.id,
    turns: arrow.turns,
    isMirrored: arrow.isMirrored,
    location: arrow.location,
    position_x: arrow.position_x,
    position_y: arrow.position_y,
    rotation_angle: arrow.rotation_angle,
    isVisible: arrow.isVisible,
    isSelected: arrow.isSelected,
  };
}

export function arrowDataFromObject(data: Record<string, unknown>): ArrowData {
  const partialData: Record<string, unknown> = {};

  if (typeof data.id === "string") partialData.id = data.id;
  if (typeof data.turns === "number") partialData.turns = data.turns;
  if (typeof data.isMirrored === "boolean")
    partialData.isMirrored = data.isMirrored;
  if (typeof data.location === "string") partialData.location = data.location;
  if (typeof data.position_x === "number")
    partialData.position_x = data.position_x;
  if (typeof data.position_y === "number")
    partialData.position_y = data.position_y;
  if (typeof data.rotation_angle === "number")
    partialData.rotation_angle = data.rotation_angle;
  if (typeof data.isVisible === "boolean")
    partialData.isVisible = data.isVisible;
  if (typeof data.isSelected === "boolean")
    partialData.isSelected = data.isSelected;

  return createArrowData(partialData as Partial<ArrowData>);
}
