/**
 * SVG Color Transformer Interface
 */

import type { MotionColor } from "../../../../shared/domain/enums/pictograph-enums";

export interface ISvgColorTransformer {
  /**
   * Apply color transformation to SVG text content
   * Simple regex replacement: blue (#2E3192) to red (#ED1C24) when needed
   */
  applyColorToSvg(svgText: string, color: MotionColor): string;
}
