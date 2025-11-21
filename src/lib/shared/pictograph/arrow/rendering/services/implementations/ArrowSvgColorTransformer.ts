/**
 * SVG Color Transformation Service
 *
 * Applies color transformations to SVG content.
 * Extracted from ArrowRenderer to improve modularity and reusability.
 */

import { injectable } from "inversify";

import type { ISvgColorTransformer as IArrowSvgColorTransformer } from "$shared";
import { MotionColor } from "$shared";

@injectable()
export class ArrowSvgColorTransformer implements IArrowSvgColorTransformer {
  private readonly colorMap = new Map([
    [MotionColor.BLUE, "#2E3192"],
    [MotionColor.RED, "#ED1C24"],
  ]);

  /**
   * Apply color transformation to SVG content
   * Simple and correct: arrows are blue by default, change to red when needed
   * Also makes CSS class names unique to prevent conflicts between different colored arrows
   */
  applyColorToSvg(svgText: string, color: MotionColor): string {
    const targetColor = this.colorMap.get(color) || "#2E3192";

    // Replace fill colors in both attribute and CSS style formats
    let coloredSvg = svgText.replace(
      /fill="#[0-9A-Fa-f]{6}"/g,
      `fill="${targetColor}"`
    );
    coloredSvg = coloredSvg.replace(
      /fill:\s*#[0-9A-Fa-f]{6}/g,
      `fill:${targetColor}`
    );

    // DASH ARROW SCALING FIX
    // Apply scaling transformation to dash arrows to match size of other arrows
    const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch?.[1]) {
      const viewBoxValues = viewBoxMatch[1].split(/\s+/).map(Number);
      const viewBoxWidth = viewBoxValues[2] || 100;
      const viewBoxHeight = viewBoxValues[3] || 100;

      // Detect dash arrows by small viewBox size
      const isDashArrow = viewBoxWidth < 50 && viewBoxHeight < 50;
      if (isDashArrow) {
        // Calculate scale factor to match other arrows
        const targetSize = 250;
        const currentSize = Math.max(viewBoxWidth, viewBoxHeight);
        const scaleFactor = targetSize / currentSize;

        // Update the viewBox to the scaled size
        const newViewBox = `0 0 ${viewBoxWidth * scaleFactor} ${viewBoxHeight * scaleFactor}`;
        coloredSvg = coloredSvg.replace(
          /viewBox="[^"]*"/,
          `viewBox="${newViewBox}"`
        );

        // Add scale transform to all path and shape elements
        coloredSvg = coloredSvg.replace(
          /<(path|circle|rect|ellipse|polygon|polyline)([^>]*?)>/g,
          `<$1$2 transform="scale(${scaleFactor})">`
        );
      }
    }

    // Make CSS class names unique for each color to prevent conflicts
    // Replace .st0, .st1, etc. with .st0-blue, .st1-blue, etc.
    const colorSuffix = color.toLowerCase();
    coloredSvg = coloredSvg.replace(/\.st(\d+)/g, `.st$1-${colorSuffix}`);

    // Also update class references in elements
    coloredSvg = coloredSvg.replace(
      /class="st(\d+)"/g,
      `class="st$1-${colorSuffix}"`
    );

    // Remove the centerPoint circle entirely to prevent unwanted visual elements
    coloredSvg = coloredSvg.replace(
      /<circle[^>]*id="centerPoint"[^>]*\/?>/,
      ""
    );

    return coloredSvg;
  }
}
