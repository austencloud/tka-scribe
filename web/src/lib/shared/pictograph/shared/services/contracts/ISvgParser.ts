/**
 * SVG Parsing Service Interface
 *
 * Handles parsing and analysis of SVG content.
 * Extracts dimensions, content, and other SVG metadata.
 */

import type { SVGDimensions } from "$shared";

export interface ISvgParser {
  /**
   * Parse SVG content and extract dimensions and center point
   */
  parseArrowSvg(svgText: string): SVGDimensions;

  /**
   * Extract SVG content (everything inside the <svg> tags)
   */
  extractSvgContent(svgText: string): string;
}
