/**
 * PixiJS Animation Renderer Service Contract
 *
 * Manages PixiJS-based rendering for the animation module.
 * Replaces Canvas 2D rendering with WebGL-accelerated PixiJS rendering.
 */

import type { Application } from "pixi.js";
import type { PropState } from "../../domain/types/PropState";
import type { TrailPoint, TrailSettings } from "../../domain/types/TrailTypes";

export interface IPixiAnimationRenderer {
  /**
   * Initialize the PixiJS application and attach it to a container
   * @param container - DOM element to attach the PixiJS canvas to
   * @param size - Initial canvas size
   */
  initialize(container: HTMLElement, size: number): Promise<void>;

  /**
   * Resize the renderer and all child elements
   * @param newSize - New canvas size
   */
  resize(newSize: number): void;

  /**
   * Render the complete animation scene
   */
  renderScene(params: {
    blueProp: PropState | null;
    redProp: PropState | null;
    gridVisible: boolean;
    gridMode: string | null;
    letter: string | null;
    turnsTuple: string | null;
    bluePropDimensions: { width: number; height: number };
    redPropDimensions: { width: number; height: number };
    blueTrailPoints: TrailPoint[];
    redTrailPoints: TrailPoint[];
    trailSettings: TrailSettings;
    currentTime: number;
  }): void;

  /**
   * Load prop textures for a specific prop type
   * @param propType - Type of prop (e.g., "staff", "club", "fan")
   */
  loadPropTextures(propType: string): Promise<void>;

  /**
   * Load grid texture for a specific grid mode
   * @param gridMode - Grid mode (e.g., "diamond", "box")
   */
  loadGridTexture(gridMode: string): Promise<void>;

  /**
   * Load glyph texture for rendering letter + turns
   * @param svgString - SVG string of the complete glyph
   * @param width - SVG width
   * @param height - SVG height
   */
  loadGlyphTexture(
    svgString: string,
    width: number,
    height: number
  ): Promise<void>;

  /**
   * Get the underlying PixiJS application
   * (useful for advanced rendering or debugging)
   */
  getApplication(): Application | null;

  /**
   * Destroy the renderer and clean up resources
   */
  destroy(): void;

  /**
   * Get the canvas element created by PixiJS
   */
  getCanvas(): HTMLCanvasElement | null;
}
