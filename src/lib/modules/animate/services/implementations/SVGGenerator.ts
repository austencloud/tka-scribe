import { GridMode } from "$shared";
import { injectable } from "inversify";
import type { ISVGGenerator, PropSvgData } from "../contracts/ISVGGenerator";

/**
 * SVG Generator for creating prop staff images and grid
 * Based on the exact implementation from standalone_animator.html
 */

@injectable()
export class SVGGenerator implements ISVGGenerator {
  /**
   * Generate grid SVG with support for strict mode points
   * Loads the actual grid SVG files and adds strict-mode class for animation viewer
   * @param gridMode - Type of grid to generate (GridMode.DIAMOND or GridMode.BOX)
   * @param useStrictPoints - Whether to enable strict mode (for animation viewer)
   */
  generateGridSvg(
    gridMode: GridMode = GridMode.DIAMOND,
    useStrictPoints: boolean = true
  ): string {
    // For animation viewer, always use strict mode
    // Load from actual grid SVG files to get the complete grid with all point layers
    const gridFileName =
      gridMode === GridMode.BOX ? "box_grid.svg" : "diamond_grid.svg";

    // Note: This is a synchronous method but ideally should be async
    // For now, we'll fetch synchronously using XMLHttpRequest
    // In production, consider making this async

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", `/images/grid/${gridFileName}`, false); // Synchronous request
      xhr.send();

      if (xhr.status === 200) {
        let svgContent = xhr.responseText;

        // Add strict-mode class to the SVG root element if strict points are enabled
        if (useStrictPoints) {
          svgContent = svgContent.replace(
            /<svg([^>]*)>/,
            '<svg$1 class="strict-mode">'
          );
        }

        return svgContent;
      } else {
        console.error(`Failed to load grid SVG: ${xhr.status}`);
        return this.getFallbackGridSvg(gridMode);
      }
    } catch (error) {
      console.error("Error loading grid SVG:", error);
      return this.getFallbackGridSvg(gridMode);
    }
  }

  /**
   * Fallback grid SVG for when file loading fails
   */
  private getFallbackGridSvg(gridMode: GridMode): string {
    if (gridMode === GridMode.BOX) {
      return `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 950 950" xml:space="preserve" class="strict-mode">
<style>
  .box-grid-stroke{stroke:#000;stroke-width:7;stroke-miterlimit:10}
  .normal-hand-point{fill:none}
  .strict-hand-point{fill:currentColor}
</style>
<circle id="center_point" cx="475" cy="475" r="11.2"/>
<circle id="strict_ne_box_hand_point" class="strict-hand-point" cx="581.1" cy="368.9" r="4.7"/>
<circle id="strict_se_box_hand_point" class="strict-hand-point" cx="581.1" cy="581.1" r="4.7"/>
<circle id="strict_sw_box_hand_point" class="strict-hand-point" cx="368.9" cy="581.1" r="4.7"/>
<circle id="strict_nw_box_hand_point" class="strict-hand-point" cx="368.9" cy="368.9" r="4.7"/>
</svg>`;
    } else {
      return `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 950 950" xml:space="preserve" class="strict-mode">
<style>
  .normal-hand-point{fill:none}
  .strict-hand-point{fill:currentColor}
</style>
<circle id="n_diamond_hand_point_strict" class="strict-hand-point" cx="475" cy="325" r="4.7"/>
<circle id="e_diamond_hand_point_strict" class="strict-hand-point" cx="625" cy="475" r="4.7"/>
<circle id="s_diamond_hand_point_strict" class="strict-hand-point" cx="475" cy="625" r="4.7"/>
<circle id="w_diamond_hand_point_strict" class="strict-hand-point" cx="325" cy="475" r="4.7"/>
<circle id="center_point" cx="475" cy="475" r="12"/>
</svg>`;
    }
  }

  /**
   * Generate blue staff SVG exactly as in standalone_animator.html
   */
  generateBlueStaffSvg(): string {
    return `<svg version="1.1" id="staff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 252.8 77.8" style="enable-background:new 0 0 252.8 77.8;" xml:space="preserve"><path fill="#2E3192" stroke="#555555" stroke-width="1" stroke-miterlimit="10" d="M251.4,67.7V10.1c0-4.8-4.1-8.7-9.1-8.7s-9.1,3.9-9.1,8.7v19.2H10.3c-4.9,0-8.9,3.8-8.9,8.5V41 c0,4.6,4,8.5,8.9,8.5h222.9v18.2c0,4.8,4.1,8.7,9.1,8.7S251.4,72.5,251.4,67.7z"/><circle id="centerPoint" fill="#FF0000" cx="126.4" cy="38.9" r="5" /></svg>`;
  }

  /**
   * Generate red staff SVG exactly as in standalone_animator.html
   */
  generateRedStaffSvg(): string {
    return `<svg version="1.1" id="staff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 252.8 77.8" style="enable-background:new 0 0 252.8 77.8;" xml:space="preserve"><path fill="#ED1C24" stroke="#555555" stroke-width="1" stroke-miterlimit="10" d="M251.4,67.7V10.1c0-4.8-4.1-8.7-9.1-8.7s-9.1,3.9-9.1,8.7v19.2H10.3c-4.9,0-8.9,3.8-8.9,8.5V41 c0,4.6,4,8.5,8.9,8.5h222.9v18.2c0,4.8,4.1,8.7,9.1,8.7S251.4,72.5,251.4,67.7z"/><circle id="centerPoint" fill="#FF0000" cx="126.4" cy="38.9" r="5" /></svg>`;
  }

  /**
   * Generate blue prop SVG with dynamic prop type
   */
  async generateBluePropSvg(
    propType: string = "staff"
  ): Promise<PropSvgData> {
    // Use the 300px scaled versions from animated directory for animation display
    const propTypeLower = propType.toLowerCase();
    const path = `/images/props/animated/${propTypeLower}.svg`;
    const originalSvg = await this.fetchPropSvg(path);
    const coloredSvg = this.applyColorToPropSvg(originalSvg, "#2E3192");
    const { width, height } = this.extractViewBoxDimensions(originalSvg);
    return { svg: coloredSvg, width, height };
  }

  /**
   * Generate red prop SVG with dynamic prop type
   */
  async generateRedPropSvg(
    propType: string = "staff"
  ): Promise<PropSvgData> {
    // Use the 300px scaled versions from animated directory for animation display
    const propTypeLower = propType.toLowerCase();
    const path = `/images/props/animated/${propTypeLower}.svg`;
    const originalSvg = await this.fetchPropSvg(path);
    const coloredSvg = this.applyColorToPropSvg(originalSvg, "#ED1C24");
    const { width, height } = this.extractViewBoxDimensions(originalSvg);
    return { svg: coloredSvg, width, height };
  }

  /**
   * Fetch prop SVG from server
   */
  private async fetchPropSvg(path: string): Promise<string> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch prop SVG from ${path}: ${response.statusText}`
      );
    }
    return await response.text();
  }

  /**
   * Apply color to prop SVG while preserving transparent sections and accent colors
   */
  private applyColorToPropSvg(svgText: string, color: string): string {
    let coloredSvg = svgText;

    // Colors to preserve (like minihoop's gold/tan grip)
    const ACCENT_COLORS_TO_PRESERVE = [
      "#c9ac68", // Gold/tan color used for minihoop grip
    ];

    // Replace fill colors ONLY if they have an actual color value (not "none" or transparent)
    coloredSvg = coloredSvg.replace(
      /fill="(#[0-9A-Fa-f]{3,6}|rgb[a]?\([^)]+\)|[a-z]+)"/gi,
      (match, capturedColor) => {
        const colorLower = capturedColor.toLowerCase();
        if (
          colorLower === "none" ||
          colorLower === "transparent" ||
          ACCENT_COLORS_TO_PRESERVE.some(
            (accent) => accent.toLowerCase() === colorLower
          )
        ) {
          return match;
        }
        return `fill="${color}"`;
      }
    );

    // Also handle style attributes
    coloredSvg = coloredSvg.replace(
      /fill:\s*(#[0-9A-Fa-f]{3,6}|rgb[a]?\([^)]+\)|[a-z]+)/gi,
      (match, capturedColor) => {
        const colorLower = capturedColor.toLowerCase();
        if (
          colorLower === "none" ||
          colorLower === "transparent" ||
          ACCENT_COLORS_TO_PRESERVE.some(
            (accent) => accent.toLowerCase() === colorLower
          )
        ) {
          return match;
        }
        return `fill:${color}`;
      }
    );

    // Remove centerPoint circle
    coloredSvg = coloredSvg.replace(
      /<circle[^>]*id="centerPoint"[^>]*\/?>/g,
      ""
    );

    return coloredSvg;
  }

  /**
   * Scale SVG to 300px width while maintaining aspect ratio
   */
  private scaleSvgTo300px(svgText: string): string {
    const TARGET_WIDTH = 300;

    // Extract current viewBox
    const viewBoxMatch = svgText.match(/viewBox=["']([^"']+)["']/);
    if (!viewBoxMatch?.[1]) {
      console.warn("Could not find viewBox, returning original SVG");
      return svgText;
    }

    const viewBoxValues = viewBoxMatch[1].split(/\s+/).map(Number);
    if (viewBoxValues.length !== 4) {
      console.warn("Invalid viewBox format, returning original SVG");
      return svgText;
    }

    const [minX, minY, currentWidth, currentHeight] = viewBoxValues;

    // Calculate scale factor
    const scaleFactor = TARGET_WIDTH / currentWidth;

    // Calculate new dimensions
    const newWidth = TARGET_WIDTH;
    const newHeight = currentHeight * scaleFactor;

    // Replace viewBox with scaled version
    const scaledSvg = svgText.replace(
      /viewBox=["']([^"']+)["']/,
      `viewBox="${minX} ${minY} ${newWidth.toFixed(2)} ${newHeight.toFixed(2)}"`
    );

    return scaledSvg;
  }

  /**
   * Extract viewBox dimensions from SVG
   */
  private extractViewBoxDimensions(svgText: string): {
    width: number;
    height: number;
  } {
    // Try to extract from viewBox attribute
    const viewBoxMatch = svgText.match(/viewBox=["']([^"']+)["']/);
    if (viewBoxMatch?.[1]) {
      const viewBoxValues = viewBoxMatch[1].split(/\s+/).map(Number);
      if (viewBoxValues.length === 4) {
        return { width: viewBoxValues[2]!, height: viewBoxValues[3]! };
      }
    }

    // Fallback to width/height attributes
    const widthMatch = svgText.match(/width=["']([^"']+)["']/);
    const heightMatch = svgText.match(/height=["']([^"']+)["']/);

    if (widthMatch && heightMatch) {
      return {
        width: parseFloat(widthMatch[1]!),
        height: parseFloat(heightMatch[1]!),
      };
    }

    // Default fallback (staff dimensions)
    console.warn(
      "Could not extract SVG dimensions, using default staff dimensions"
    );
    return { width: 252.8, height: 77.8 };
  }
}
