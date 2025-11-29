/**
 * PropSvgUtils - Utilities for loading and coloring prop SVGs
 */

import { MotionColor } from "../../../../pictograph/shared/domain/enums/pictograph-enums";
import { getPropTypeDisplayInfo } from "./PropTypeRegistry";
import type { PropType } from "../../../../pictograph/prop/domain/enums/PropType";

const ACCENT_COLORS_TO_PRESERVE = ["#c9ac68"];

const COLOR_MAP: Record<MotionColor, string> = {
  [MotionColor.BLUE]: "#2E3192",
  [MotionColor.RED]: "#ED1C24",
};

/**
 * Apply color to an SVG string based on motion color
 */
export function applyColorToSvg(
  svgText: string,
  motionColor: MotionColor
): string {
  const targetColor = COLOR_MAP[motionColor];

  let coloredSvg = svgText.replace(
    /fill="(#[0-9A-Fa-f]{3,6})"/gi,
    (match: string, capturedColor: string) => {
      const colorLower = capturedColor.toLowerCase();
      if (
        ACCENT_COLORS_TO_PRESERVE.some(
          (accent) => accent.toLowerCase() === colorLower
        )
      ) {
        return match;
      }
      return `fill="${targetColor}"`;
    }
  );

  coloredSvg = coloredSvg.replace(
    /fill:\s*(#[0-9A-Fa-f]{3,6})/gi,
    (match: string, capturedColor: string) => {
      const colorLower = capturedColor.toLowerCase();
      if (
        ACCENT_COLORS_TO_PRESERVE.some(
          (accent) => accent.toLowerCase() === colorLower
        )
      ) {
        return match;
      }
      return `fill:${targetColor}`;
    }
  );

  coloredSvg = coloredSvg.replace(
    /stroke="(#[0-9A-Fa-f]{3,6})"/gi,
    (match: string, capturedColor: string) => {
      const colorLower = capturedColor.toLowerCase();
      if (
        ACCENT_COLORS_TO_PRESERVE.some(
          (accent) => accent.toLowerCase() === colorLower
        )
      ) {
        return match;
      }
      return `stroke="${targetColor}"`;
    }
  );

  coloredSvg = coloredSvg.replace(
    /stroke:\s*(#[0-9A-Fa-f]{3,6})/gi,
    (match: string, capturedColor: string) => {
      const colorLower = capturedColor.toLowerCase();
      if (
        ACCENT_COLORS_TO_PRESERVE.some(
          (accent) => accent.toLowerCase() === colorLower
        )
      ) {
        return match;
      }
      return `stroke:${targetColor}`;
    }
  );

  const colorSuffix = motionColor.toLowerCase();
  coloredSvg = coloredSvg.replace(/\.st(\d+)/g, `.st$1-${colorSuffix}`);
  coloredSvg = coloredSvg.replace(
    /class="st(\d+)"/g,
    `class="st$1-${colorSuffix}"`
  );

  coloredSvg = coloredSvg.replace(
    /<circle[^>]*id="centerPoint"[^>]*\/?>/,
    ""
  );

  return coloredSvg;
}

export interface ParsedSvgContent {
  content: string;
  viewBox: string;
}

/**
 * Load and parse an SVG for a prop type with the specified color
 */
export async function loadPropSvg(
  propType: PropType,
  color: MotionColor
): Promise<ParsedSvgContent | null> {
  try {
    const displayInfo = getPropTypeDisplayInfo(propType);
    const response = await fetch(displayInfo.image);
    if (!response.ok) return null;

    let svgText = await response.text();
    svgText = applyColorToSvg(svgText, color);

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    if (svgElement) {
      return {
        content: svgElement.innerHTML,
        viewBox: svgElement.getAttribute("viewBox") ?? "0 0 100 100",
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to load prop SVG:", error);
    return null;
  }
}
