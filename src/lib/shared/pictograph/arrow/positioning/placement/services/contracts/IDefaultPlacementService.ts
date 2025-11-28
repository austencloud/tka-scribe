/**
 * Default Placement Service Contract
 */

import { MotionType } from "../../../../../shared/domain/enums/pictograph-enums";
import { GridMode } from "../../../../../grid/domain/enums/grid-enums";

export interface IDefaultPlacementService {
  getDefaultAdjustment(
    placementKey: string,
    turns: number | string,
    motionType: MotionType,
    gridMode: GridMode
  ): Promise<{ x: number; y: number }>;

  getAvailablePlacementKeys(
    motionType: MotionType,
    gridMode: GridMode
  ): Promise<string[]>;

  isLoaded(): boolean;

  getPlacementData(
    motionType: MotionType,
    placementKey: string,
    gridMode: GridMode
  ): Promise<{ [turns: string]: [number, number] }>;

  debugAvailableKeys(motionType: MotionType, gridMode: GridMode): Promise<void>;
}
