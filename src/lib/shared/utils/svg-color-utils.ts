/**
 * SVG Color Utilities
 *
 * Centralized color transformation for SVGs across the entire application.
 * This single source of truth prevents inconsistencies when preserving
 * accent colors during color transformations.
 */

import { MotionColor } from "../pictograph/shared/domain/enums/pictograph-enums";

/**
 * Colors that should NEVER be transformed when applying prop/motion colors.
 * Add new accent colors here and they'll be preserved everywhere.
 */
export const ACCENT_COLORS_TO_PRESERVE = [
  "#c9ac68", // Gold/tan color used for minihoop grip
  "#ffffff", // White - used for background shapes/accents
  "#fff", // White shorthand
] as const;

/**
 * Standard color map for motion colors
 */
export const MOTION_COLOR_MAP: Record<MotionColor, string> = {
  [MotionColor.BLUE]: "#2E3192",
  [MotionColor.RED]: "#ED1C24",
};

/**
 * Check if a color should be preserved (not transformed)
 */
export function shouldPreserveColor(color: string): boolean {
  const colorLower = color.toLowerCase();
  return (
    colorLower === "none" ||
    colorLower === "transparent" ||
    ACCENT_COLORS_TO_PRESERVE.some(
      (accent) => accent.toLowerCase() === colorLower
    )
  );
}

/**
 * Apply color transformation to an SVG string.
 * Preserves accent colors, transparent fills, and "none" values.
 *
 * @param svgText - The raw SVG string
 * @param targetColor - The color to apply (hex string like "#2E3192")
 * @param options - Optional configuration
 * @returns The transformed SVG string
 */
export function applyColorToSvg(
  svgText: string,
  targetColor: string,
  options: {
    transformStroke?: boolean;
    removeCenterPoint?: boolean;
    makeClassNamesUnique?: boolean;
    colorSuffix?: string;
  } = {}
): string {
  const {
    transformStroke = false,
    removeCenterPoint = true,
    makeClassNamesUnique = false,
    colorSuffix = "",
  } = options;

  let coloredSvg = svgText;

  // Replace fill attribute colors
  coloredSvg = coloredSvg.replace(
    /fill="(#[0-9A-Fa-f]{3,6}|rgb[a]?\([^)]+\)|[a-z]+)"/gi,
    (match, capturedColor) => {
      if (shouldPreserveColor(capturedColor)) {
        return match;
      }
      return `fill="${targetColor}"`;
    }
  );

  // Replace fill in style attributes (CSS)
  coloredSvg = coloredSvg.replace(
    /fill:\s*(#[0-9A-Fa-f]{3,6}|rgb[a]?\([^)]+\)|[a-z]+)/gi,
    (match, capturedColor) => {
      if (shouldPreserveColor(capturedColor)) {
        return match;
      }
      return `fill:${targetColor}`;
    }
  );

  // Optionally transform stroke colors
  if (transformStroke) {
    coloredSvg = coloredSvg.replace(
      /stroke="(#[0-9A-Fa-f]{3,6}|rgb[a]?\([^)]+\)|[a-z]+)"/gi,
      (match, capturedColor) => {
        if (shouldPreserveColor(capturedColor)) {
          return match;
        }
        return `stroke="${targetColor}"`;
      }
    );

    coloredSvg = coloredSvg.replace(
      /stroke:\s*(#[0-9A-Fa-f]{3,6}|rgb[a]?\([^)]+\)|[a-z]+)/gi,
      (match, capturedColor) => {
        if (shouldPreserveColor(capturedColor)) {
          return match;
        }
        return `stroke:${targetColor}`;
      }
    );
  }

  // Remove centerPoint circle (used for positioning, not display)
  if (removeCenterPoint) {
    coloredSvg = coloredSvg.replace(
      /<circle[^>]*id="centerPoint"[^>]*\/?>/g,
      ""
    );
  }

  // Make CSS class names unique to prevent conflicts between different colored props
  if (makeClassNamesUnique && colorSuffix) {
    coloredSvg = coloredSvg.replace(/\.st(\d+)/g, `.st$1-${colorSuffix}`);
    coloredSvg = coloredSvg.replace(
      /class="st(\d+)"/g,
      `class="st$1-${colorSuffix}"`
    );
  }

  return coloredSvg;
}

/**
 * Apply motion color to an SVG string.
 * Convenience wrapper that uses the standard motion color map.
 *
 * @param svgText - The raw SVG string
 * @param motionColor - The MotionColor enum value
 * @param options - Optional configuration
 * @returns The transformed SVG string
 */
export function applyMotionColorToSvg(
  svgText: string,
  motionColor: MotionColor,
  options: {
    transformStroke?: boolean;
    removeCenterPoint?: boolean;
    makeClassNamesUnique?: boolean;
  } = {}
): string {
  const targetColor =
    MOTION_COLOR_MAP[motionColor] || MOTION_COLOR_MAP[MotionColor.BLUE];
  const colorSuffix = motionColor.toLowerCase();

  return applyColorToSvg(svgText, targetColor, {
    ...options,
    colorSuffix,
    makeClassNamesUnique: options.makeClassNamesUnique,
  });
}
