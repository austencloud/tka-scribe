/**
 * Arrow SVG Loader for Legacy App
 *
 * Loads arrow SVG files and provides proper ArrowSvgData with viewBox, center, and imageSrc.
 * Compatible with the legacy Arrow.svelte component.
 */

import type { ArrowSvgData } from "../../../SvgManager/ArrowSvgData";
import { parseArrowSvg } from "../../../SvgManager/parseArrowSvg";
import type SvgManager from "../../../SvgManager/SvgManager";

export class ArrowSvgLoader {
  constructor(private svgManager: SvgManager) {}

  /**
   * Load SVG based on motion parameters
   */
  async loadSvg(
    motionType: string,
    startOri: string,
    turns: string | number,
    color: string,
    svgMirrored: boolean
  ): Promise<{ svgData: ArrowSvgData }> {
    try {
      const svgPath = this.getSvgPath(motionType, startOri, turns);
      const svgText = await this.fetchSvgContent(svgPath);
      const coloredSvg = this.applyColorToSvg(svgText, color);

      // Parse the SVG to get dimensions and center
      const parsedData = parseArrowSvg(coloredSvg);

      // Create data URL for the colored SVG
      const imageSrc = `data:image/svg+xml;base64,${btoa(coloredSvg)}`;

      const svgData: ArrowSvgData = {
        imageSrc,
        viewBox: parsedData.viewBox,
        center: parsedData.center,
      };

      return { svgData };
    } catch (error) {
      console.error("ArrowSvgLoader: Failed to load SVG:", error);
      return { svgData: this.getFallbackSvgData() };
    }
  }

  /**
   * Get SVG file path based on motion parameters
   */
  private getSvgPath(
    motionType: string,
    startOri: string,
    turns: string | number
  ): string {
    const basePath = "/images/arrows";
    const motion = motionType.toLowerCase();

    // Handle special cases
    if (turns === "fl" && motion === "float") {
      return `${basePath}/float.svg`;
    }

    if (motion === "dash") {
      return `${basePath}/dash.svg`;
    }

    // Determine radial vs non-radial path
    const radialPath =
      startOri === "out" || startOri === "in"
        ? "from_radial"
        : "from_nonradial";

    // Convert turns to number and format
    const turnsNum = typeof turns === "string" ? parseFloat(turns) : turns;
    const formattedTurns = turnsNum.toFixed(1);

    return `${basePath}/${motion}/${radialPath}/${motion}_${formattedTurns}.svg`;
  }

  /**
   * Fetch SVG content from URL
   */
  private async fetchSvgContent(path: string): Promise<string> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch SVG: ${response.status} ${response.statusText}`
      );
    }
    return await response.text();
  }

  /**
   * Apply color transformation to SVG
   */
  private applyColorToSvg(svgText: string, color: string): string {
    const colorMap: Record<string, string> = {
      red: "#ED1C24",
      blue: "#2E3192",
    };

    const targetColor = colorMap[color.toLowerCase()] || "#2E3192";

    // Replace fill colors in both attribute and CSS style formats
    let coloredSvg = svgText.replace(
      /fill="#[0-9A-Fa-f]{6}"/g,
      `fill="${targetColor}"`
    );
    coloredSvg = coloredSvg.replace(
      /fill:\s*#[0-9A-Fa-f]{6}/g,
      `fill:${targetColor}`
    );

    return coloredSvg;
  }

  /**
   * Get fallback SVG data when loading fails
   */
  getFallbackSvgData(): ArrowSvgData {
    // Use the simple arrow.svg as fallback
    const fallbackSvg = `
      <svg viewBox="0 0 88.9 34.8" xmlns="http://www.w3.org/2000/svg">
        <line stroke="#2E3192" stroke-width="4" x1="0" y1="17.4" x2="63.9" y2="17.4"/>
        <polygon fill="#2E3192" points="58.8,34.8 88.9,17.4 58.8,0"/>
      </svg>
    `;

    const imageSrc = `data:image/svg+xml;base64,${btoa(fallbackSvg)}`;

    return {
      imageSrc,
      viewBox: { x: 0, y: 0, width: 88.9, height: 34.8 },
      center: { x: 44.45, y: 17.4 },
    };
  }
}
