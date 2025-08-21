/**
 * Arrow Domain Model
 *
 * Immutable data for an arrow in a pictograph.
 *
 * ✅ REFACTORED: Motion properties moved to MotionData as single source of truth.
 * ArrowData now only contains arrow-specific rendering and positioning data.
 */

import { Location } from "./enums";

export interface ArrowData {
  readonly id: string;

  readonly arrowLocation: Location | null;

  readonly positionX: number;
  readonly positionY: number;
  readonly rotationAngle: number;
  readonly coordinates: { x: number; y: number } | null;
  readonly svgCenter: { x: number; y: number } | null;
  readonly svgMirrored: boolean;

  readonly isVisible: boolean;
  readonly isSelected: boolean;
}

export function createArrowData(data: Partial<ArrowData> = {}): ArrowData {
  return {
    id: data.id ?? crypto.randomUUID(),

    arrowLocation: data.arrowLocation ?? null,
    positionX: data.positionX ?? 0.0,
    positionY: data.positionY ?? 0.0,
    rotationAngle: data.rotationAngle ?? 0.0,
    coordinates: data.coordinates ?? null,
    svgCenter: data.svgCenter ?? null,
    svgMirrored: data.svgMirrored ?? false,
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

    arrowLocation: arrow.arrowLocation,
    positionX: arrow.positionX,
    positionY: arrow.positionY,
    rotationAngle: arrow.rotationAngle,
    coordinates: arrow.coordinates,
    svgCenter: arrow.svgCenter,
    svgMirrored: arrow.svgMirrored,
    isVisible: arrow.isVisible,
    isSelected: arrow.isSelected,
  };
}

export function arrowDataFromObject(data: Record<string, unknown>): ArrowData {
  const partialData: Record<string, unknown> = {};

  if (typeof data.id === "string") partialData.id = data.id;

  if (typeof data.arrowLocation === "string")
    partialData.arrowLocation = data.arrowLocation;
  if (typeof data.positionX === "number")
    partialData.positionX = data.positionX;
  if (typeof data.positionY === "number")
    partialData.positionY = data.positionY;
  if (typeof data.rotationAngle === "number")
    partialData.rotationAngle = data.rotationAngle;
  if (data.coordinates && typeof data.coordinates === "object")
    partialData.coordinates = data.coordinates;
  if (data.svgCenter && typeof data.svgCenter === "object")
    partialData.svgCenter = data.svgCenter;
  if (typeof data.svgMirrored === "boolean")
    partialData.svgMirrored = data.svgMirrored;
  if (typeof data.isVisible === "boolean")
    partialData.isVisible = data.isVisible;
  if (typeof data.isSelected === "boolean")
    partialData.isSelected = data.isSelected;

  return createArrowData(partialData as Partial<ArrowData>);
}
