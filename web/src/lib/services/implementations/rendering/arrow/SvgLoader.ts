/**
 * SVG Loading Service
 *
 * Handles fetching and loading SVG files.
 * Extracted from ArrowRenderer to improve modularity and reusability.
 */

import type { MotionData } from "$lib/domain";
import type { ArrowPlacementData } from "$lib/domain/core/pictograph/ArrowPlacementData";
import type {
  ArrowSvgData,
  IArrowPathResolutionService,
  ISvgColorTransformer,
  ISvgLoader,
  ISvgParser,
} from "$lib/services/contracts/pictograph-interfaces";

export class SvgLoader implements ISvgLoader {
  constructor(
    private pathResolver: IArrowPathResolutionService,
    private svgParser: ISvgParser,
    private colorTransformer: ISvgColorTransformer
  ) {}

  /**
   * Load arrow SVG data with color transformation (extracted from Arrow.svelte)
   */
  async loadArrowPlacementData(
    arrowData: ArrowPlacementData,
    motionData: MotionData
  ): Promise<ArrowSvgData> {
    const path = this.pathResolver.getArrowPath(arrowData, motionData);

    if (!path) {
      console.error(
        "❌ SvgLoader: No arrow path available - missing motion data"
      );
      throw new Error("No arrow path available - missing motion data");
    }

    const originalSvgText = await this.fetchSvgContent(path);

    const { viewBox, center } = this.svgParser.parseArrowSvg(originalSvgText);

    // Apply color transformation to the SVG
    const coloredSvgText = this.colorTransformer.applyColorToSvg(
      originalSvgText,
      motionData.color
    );

    // Extract just the inner SVG content (no scaling needed - arrows are already correctly sized)
    const svgContent = this.svgParser.extractSvgContent(coloredSvgText);

    const result = {
      imageSrc: svgContent,
      viewBox,
      center,
    };

    return result;
  }

  /**
   * Fetch SVG content from a given path
   */
  async fetchSvgContent(path: string): Promise<string> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.status}`);
    }
    return await response.text();
  }
}
