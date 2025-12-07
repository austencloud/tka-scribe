/**
 * SVG Loader Interface
 */

import type { ArrowPlacementData } from "../../../positioning/placement/domain/ArrowPlacementData";
import type { ArrowSvgData } from "../../../../shared/domain/models/svg-models";
import type { MotionData } from "../../../../shared/domain/models/MotionData";

export interface IArrowSvgLoader {
  /**
   * Load arrow SVG data with color transformation based on placement data
   */
  loadArrowSvg(
    arrowData: ArrowPlacementData,
    motionData: MotionData
  ): Promise<ArrowSvgData>;

  /**
   * Fetch SVG content from a given path
   */
  fetchSvgContent(path: string): Promise<string>;
}
