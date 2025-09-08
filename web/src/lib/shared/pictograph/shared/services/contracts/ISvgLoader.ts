/**
 * SVG Loading Service Interface
 *
 * Handles loading and fetching of SVG content for pictograph rendering.
 * Provides abstraction for SVG resource management.
 */

import type { ArrowPlacementData, ArrowSvgData, MotionData } from "$shared";

export interface ISvgLoader {
  /**
   * Load arrow SVG data with color transformation
   */
  loadArrowPlacementData(
    arrowData: ArrowPlacementData,
    motionData: MotionData
  ): Promise<ArrowSvgData>;

  /**
   * Fetch SVG content from a given path
   */
  fetchSvgContent(path: string): Promise<string>;
}
