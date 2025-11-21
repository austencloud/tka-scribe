/**
 * Prop Rendering Service Interface
 *
 * Handles rendering of props in pictographs.
 */

import type { GridMode, MotionData } from "$shared";

import type { MotionColor } from "../../../shared/domain/enums/pictograph-enums";

export interface IPropRenderingService {
  renderProp(
    propType: string,
    color: MotionColor,
    motionData: MotionData,
    gridMode: GridMode
  ): Promise<SVGElement>;

  calculatePropPoint(
    motionData: MotionData,
    color: MotionColor,
    gridMode: GridMode
  ): Promise<{ x: number; y: number; rotation: number }>;

  loadPropSVG(propType: string, color: MotionColor): Promise<string>;

  getSupportedPropTypes(): string[];
}
