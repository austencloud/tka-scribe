/**
 * Grid Domain Model
 *
 * Immutable data for the pictograph grid system.
 * Based on modern desktop app's gridData.py
 */

import type { GridPointData } from "$lib/data/gridCoordinates";
import { GridMode } from "./enums";

export interface GridData {
  readonly gridMode: GridMode;
  readonly center_x: number;
  readonly center_y: number;
  readonly radius: number;
  readonly gridPointData: GridPointData; //
}

export function createGridData(data: Partial<GridData> = {}): GridData {
  return {
    gridMode: data.gridMode ?? GridMode.DIAMOND,
    center_x: data.center_x ?? 0.0,
    center_y: data.center_y ?? 0.0,
    radius: data.radius ?? 100.0,
    gridPointData: data.gridPointData ?? {
      allHandPointsStrict: {},
      allHandPointsNormal: {},
      allLayer2PointsStrict: {},
      allLayer2PointsNormal: {},
      allOuterPoints: {},
      centerPoint: { coordinates: { x: 0, y: 0 } }
    },
  };
}

export function updateGridData(
  grid: GridData,
  updates: Partial<GridData>
): GridData {
  return {
    ...grid,
    ...updates,
  };
}

export function gridDataToObject(grid: GridData): Record<string, unknown> {
  return {
    gridMode: grid.gridMode,
    center_x: grid.center_x,
    center_y: grid.center_y,
    radius: grid.radius,
    gridPoints: grid.gridPointData,
  };
}

export function gridDataFromObject(data: Record<string, unknown>): GridData {
  const gridData: Record<string, unknown> = {};

  if (data.gridMode !== undefined) {
    gridData.gridMode = data.gridMode;
  }
  if (data.center_x !== undefined) {
    gridData.center_x = data.center_x;
  }
  if (data.center_y !== undefined) {
    gridData.center_y = data.center_y;
  }
  if (data.radius !== undefined) {
    gridData.radius = data.radius;
  }
  if (data.gridPoints !== undefined) {
    gridData.gridPoints = data.gridPoints;
  }

  return createGridData(gridData as Partial<GridData>);
}
