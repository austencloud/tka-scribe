/**
 * Prop SVG Loader Interface
 *
 * Fast, direct SVG loading for props - mirrors arrow loading approach
 */

import type { MotionData, PropPlacementData } from "$shared";

import type { PropRenderData } from "../../domain/models/PropRenderData";

export interface IPropSvgLoader {
  /**
   * Load prop SVG data with color transformation - fast direct approach
   * @param propData - Prop placement data
   * @param motionData - Motion data including prop type
   * @param useAnimatedVersion - If true, loads {propType}_animated.svg instead of {propType}.svg
   */
  loadPropSvg(
    propData: PropPlacementData,
    motionData: MotionData,
    useAnimatedVersion?: boolean
  ): Promise<PropRenderData>;

  /**
   * Fetch SVG content from a given path - direct fetch
   */
  fetchSvgContent(path: string): Promise<string>;
}
