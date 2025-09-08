/**
 * SVG Color Transformation Service Interface
 *
 * Handles color transformations for SVG elements and content.
 * Provides consistent color application across pictograph rendering.
 */

import type { MotionColor } from "$shared";

export interface ISvgColorTransformer {
  /**
   * Apply color transformation to SVG text content
   */
  applyColorToSvg(svgText: string, color: MotionColor): string;

  /**
   * Apply color transformation to arrow SVG element
   */
  applyArrowColorTransformation(
    svgElement: SVGElement,
    color: MotionColor
  ): void;

  /**
   * Get fill and stroke colors for a given motion color
   */
  getColorsForMotionColor(color: MotionColor): {
    fill: string;
    stroke: string;
  };
}
