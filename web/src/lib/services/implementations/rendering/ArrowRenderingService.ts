/**
 * Arrow Rendering Service
 *
 * Handles arrow rendering with SVG assets, color transformation, and fallbacks.
 * Extracted from PictographRenderingService and Arrow.svelte.
 * 
 * Business logic extracted from Arrow.svelte:
 * - arrowPath calculation logic
 * - parseArrowSvg function
 * - applyColorToSvg function
 * - SVG loading logic
 */

import type { MotionData, ArrowData } from "$lib/domain";
import { MotionColor } from "$lib/domain/enums";
import type { ISvgConfiguration } from "./SvgConfiguration";

export interface ArrowPosition {
  x: number;
  y: number;
  rotation: number;
}

export interface ArrowSvgData {
  imageSrc: string;
  viewBox: { width: number; height: number };
  center: { x: number; y: number };
}

export interface IArrowRenderingService {
  renderArrowAtPosition(
    svg: SVGElement,
    color: MotionColor,
    position: ArrowPosition,
    motionData: MotionData | undefined
  ): Promise<void>;
  
  // New methods extracted from Arrow.svelte
  getArrowPath(arrowData: ArrowData, motionData: MotionData): string | null;
  loadArrowSvgData(arrowData: ArrowData, motionData: MotionData): Promise<ArrowSvgData>;
  parseArrowSvg(svgText: string): { viewBox: { width: number; height: number }; center: { x: number; y: number } };
  applyColorToSvg(svgText: string, color: MotionColor): string;
}

export class ArrowRenderingService implements IArrowRenderingService {
  constructor(private config: ISvgConfiguration) {}

  /**
   * Get arrow SVG path based on motion type and properties (extracted from Arrow.svelte)
   */
  getArrowPath(arrowData: ArrowData, motionData: MotionData): string | null {
    if (!arrowData || !motionData) {
      console.warn(
        "🚫 ArrowRenderingService: Missing arrowData or motionData, cannot determine arrow path"
      );
      return null;
    }

    const { motionType, turns } = motionData;
    const baseDir = `/images/arrows/${motionType}`;

    // For motion types that have turn-based subdirectories (pro, anti, static)
    if (["pro", "anti", "static"].includes(motionType)) {
      // Determine if we should use radial vs non-radial arrows
      // Use non-radial only for clock/counter orientations, radial for everything else
      const startOrientation =
        arrowData.start_orientation || motionData.startOrientation || "in";
      const endOrientation =
        arrowData.end_orientation || motionData.endOrientation || "in";

      const isNonRadial =
        startOrientation === "clock" ||
        startOrientation === "counter" ||
        endOrientation === "clock" ||
        endOrientation === "counter";

      const subDir = isNonRadial ? "from_nonradial" : "from_radial";
      const turnValue = typeof turns === "number" ? turns.toFixed(1) : "0.0";
      const path = `${baseDir}/${subDir}/${motionType}_${turnValue}.svg`;

      return path;
    }

    // For simple motion types (dash, float) - use base directory
    const path = `${baseDir}.svg`;
    return path;
  }

  /**
   * Parse SVG to get proper dimensions and center point (extracted from Arrow.svelte)
   */
  parseArrowSvg(
    svgText: string
  ): {
    viewBox: { width: number; height: number };
    center: { x: number; y: number };
  } {
    const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
    const svg = doc.documentElement;

    // Get viewBox dimensions
    const viewBoxValues = svg.getAttribute("viewBox")?.split(/\s+/) || [
      "0",
      "0",
      "100",
      "100",
    ];
    const viewBox = {
      width: parseFloat(viewBoxValues[2] || "100") || 100,
      height: parseFloat(viewBoxValues[3] || "100") || 100,
    };

    // Get center point from SVG
    let center = { x: viewBox.width / 2, y: viewBox.height / 2 };

    try {
      const centerElement = doc.getElementById("centerPoint");
      if (centerElement) {
        center = {
          x: parseFloat(centerElement.getAttribute("cx") || "0") || center.x,
          y: parseFloat(centerElement.getAttribute("cy") || "0") || center.y,
        };
      }
    } catch {
      // SVG center calculation failed, using default center
    }

    return { viewBox, center };
  }

  /**
   * Apply color transformation to SVG content (extracted from Arrow.svelte)
   */
  applyColorToSvg(svgText: string, color: MotionColor): string {
    const colorMap = new Map([
      [MotionColor.BLUE, "#2E3192"],
      [MotionColor.RED, "#ED1C24"],
    ]);

    const targetColor = colorMap.get(color) || "#2E3192";

    // Use regex replacement to change fill colors directly
    let coloredSvg = svgText.replace(
      /fill="#[0-9A-Fa-f]{6}"/g,
      `fill="${targetColor}"`
    );
    coloredSvg = coloredSvg.replace(
      /fill:\s*#[0-9A-Fa-f]{6}/g,
      `fill:${targetColor}`
    );

    // Remove the centerPoint circle entirely to prevent unwanted visual elements
    coloredSvg = coloredSvg.replace(
      /<circle[^>]*id="centerPoint"[^>]*\/?>/,
      ""
    );

    return coloredSvg;
  }

  /**
   * Load arrow SVG data with color transformation (extracted from Arrow.svelte)
   */
  async loadArrowSvgData(arrowData: ArrowData, motionData: MotionData): Promise<ArrowSvgData> {
    const path = this.getArrowPath(arrowData, motionData);
    if (!path) {
      throw new Error("No arrow path available - missing motion data");
    }

    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.status}`);
    }

    const originalSvgText = await response.text();
    const { viewBox, center } = this.parseArrowSvg(originalSvgText);

    // Apply color transformation to the SVG
    const coloredSvgText = this.applyColorToSvg(originalSvgText, arrowData.color);

    return {
      imageSrc: `data:image/svg+xml;base64,${btoa(coloredSvgText)}`,
      viewBox,
      center,
    };
  }

  /**
   * Render arrow at sophisticated calculated position using real SVG assets
   */
  async renderArrowAtPosition(
    svg: SVGElement,
    color: MotionColor,
    position: ArrowPosition,
    motionData: MotionData | undefined
  ): Promise<void> {
    try {
      // Get the correct arrow SVG path
      const arrowSvgPath = this.getArrowSvgPath(motionData);

      // Load the arrow SVG
      const response = await fetch(arrowSvgPath);
      if (!response.ok) {
        throw new Error(`Failed to load arrow SVG: ${response.status}`);
      }

      const svgContent = await response.text();

      // Create arrow group with metadata
      const arrowGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      arrowGroup.setAttribute(
        "class",
        `arrow-${color} sophisticated-positioning`
      );
      arrowGroup.setAttribute("data-color", color);
      arrowGroup.setAttribute("data-position", `${position.x},${position.y}`);
      arrowGroup.setAttribute("data-rotation", position.rotation.toString());

      // Apply sophisticated position and rotation transform
      const transform = `translate(${position.x}, ${position.y}) rotate(${position.rotation})`;
      arrowGroup.setAttribute("transform", transform);

      // Parse and insert the SVG content
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgElement = svgDoc.documentElement as unknown as SVGElement;

      // Apply color transformation
      this.applyArrowColorTransformation(svgElement, color);

      // Import the SVG content into the arrow group
      const importedSvg = document.importNode(svgElement, true);
      arrowGroup.appendChild(importedSvg);

      svg.appendChild(arrowGroup);
    } catch (error) {
      console.error(`❌ Error loading arrow SVG for ${color}:`, error);
      // Fallback to simple arrow
      this.renderFallbackArrow(svg, color, position);
    }
  }

  /**
   * Get the correct arrow SVG path based on motion data (like ArrowSvgManager)
   */
  private getArrowSvgPath(motionData: MotionData | undefined): string {
    if (!motionData) {
      return "/images/arrows/static/from_radial/static_0.svg";
    }
    const motionType = motionData.motionType;
    const turnsVal = motionData.turns;
    const startOrientation = motionData.startOrientation;
    if (motionType === "float") return "/images/arrows/float.svg";
    const radialPath =
      startOrientation === "in" ? "from_radial" : "from_nonradial";
    let turnsStr: string;
    if (turnsVal === "fl") {
      turnsStr = "fl";
    } else if (typeof turnsVal === "number") {
      turnsStr = turnsVal % 1 === 0 ? `${turnsVal}.0` : turnsVal.toString();
    } else {
      turnsStr = "0.0";
    }
    return `/images/arrows/${motionType}/${radialPath}/${motionType}_${turnsStr}.svg`;
  }

  /**
   * Apply color transformation to arrow SVG
   */
  private applyArrowColorTransformation(
    svgElement: SVGElement,
    color: MotionColor
  ): void {
    // Find all path elements and apply color
    const paths = svgElement.querySelectorAll("path");
    const fillColor = color === MotionColor.BLUE ? "#3b82f6" : "#ef4444";
    const strokeColor = color === MotionColor.BLUE ? "#1d4ed8" : "#dc2626";

    paths.forEach((path) => {
      path.setAttribute("fill", fillColor);
      path.setAttribute("stroke", strokeColor);
      path.setAttribute("stroke-width", "1");
    });
  }

  /**
   * Render fallback arrow if SVG loading fails
   */
  private renderFallbackArrow(
    svg: SVGElement,
    color: MotionColor,
    position: ArrowPosition
  ): void {
    // Create arrow group
    const arrowGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    arrowGroup.setAttribute("class", `arrow-${color} fallback`);
    arrowGroup.setAttribute(
      "transform",
      `translate(${position.x}, ${position.y}) rotate(${position.rotation})`
    );

    // Create simple arrow path
    const arrowPath = this.createEnhancedArrowPath(color);
    arrowGroup.appendChild(arrowPath);

    svg.appendChild(arrowGroup);
  }

  /**
   * Create enhanced arrow SVG path with sophisticated styling
   */
  private createEnhancedArrowPath(color: MotionColor): SVGElement {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    // More sophisticated arrow shape
    path.setAttribute("d", "M 0,-25 L 15,0 L 0,25 L -8,15 L -8,-15 Z");
    path.setAttribute("fill", color);
    path.setAttribute("stroke", "#000000");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("opacity", "0.9");

    // Add sophisticated styling
    path.setAttribute("filter", "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))");
    path.setAttribute("class", "sophisticated-arrow");

    return path;
  }
}
