/**
 * PixiJS Animation Renderer Service Contract
 *
 * Manages PixiJS-based rendering for the animation module.
 * Replaces Canvas 2D rendering with WebGL-accelerated PixiJS rendering.
 */

import type { Application } from "pixi.js";
import type { PropState } from "../../shared/domain/types/PropState";
import type { TrailPoint, TrailSettings } from "../../shared/domain/types/TrailTypes";

/**
 * Visibility settings for animation rendering
 */
export interface AnimationVisibilitySettings {
  gridVisible: boolean;
  propsVisible: boolean;
  trailsVisible: boolean;
  blueMotionVisible: boolean;
  redMotionVisible: boolean;
}

export interface IPixiAnimationRenderer {
  /**
   * Initialize the PixiJS application and attach it to a container
   * @param container - DOM element to attach the PixiJS canvas to
   * @param size - Initial canvas size
   * @param backgroundAlpha - Alpha value for canvas background (0 = transparent, 1 = opaque)
   */
  initialize(
    container: HTMLElement,
    size: number,
    backgroundAlpha?: number
  ): Promise<void>;

  /**
   * Resize the renderer and all child elements
   * @param newSize - New canvas size
   */
  resize(newSize: number): Promise<void>;

  /**
   * Render the complete animation scene
   */
  renderScene(params: {
    blueProp: PropState | null;
    redProp: PropState | null;
    secondaryBlueProp?: PropState | null;
    secondaryRedProp?: PropState | null;
    gridVisible: boolean;
    gridMode: string | null;
    letter: string | null;
    turnsTuple: string | null;
    bluePropDimensions: { width: number; height: number };
    redPropDimensions: { width: number; height: number };
    blueTrailPoints: TrailPoint[];
    redTrailPoints: TrailPoint[];
    secondaryBlueTrailPoints?: TrailPoint[];
    secondaryRedTrailPoints?: TrailPoint[];
    trailSettings: TrailSettings;
    currentTime: number;
    visibility: AnimationVisibilitySettings;
  }): void;

  /**
   * Load prop textures for a specific prop type
   * @param propType - Type of prop (e.g., "staff", "club", "fan")
   */
  loadPropTextures(propType: string): Promise<void>;

  /**
   * Load different prop types for blue and red props
   * Supports per-color prop type selection
   * @param bluePropType - Type of prop for blue hand (e.g., "staff", "club", "fan")
   * @param redPropType - Type of prop for red hand (e.g., "staff", "club", "fan")
   */
  loadPerColorPropTextures(
    bluePropType: string,
    redPropType: string
  ): Promise<void>;

  /**
   * Load secondary prop textures with custom colors (for tunnel mode)
   * @param propType - Type of prop (e.g., "staff", "club", "fan")
   * @param blueColor - Hex color for the blue prop
   * @param redColor - Hex color for the red prop
   */
  loadSecondaryPropTextures(
    propType: string,
    blueColor: string,
    redColor: string
  ): Promise<void>;

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
   * Capture current frame as ImageBitmap
   * Used for pre-rendering sequences to frames
   * @returns Promise resolving to ImageBitmap of current frame
   */
  captureFrame(): Promise<ImageBitmap>;

  /**
   * Destroy the renderer and clean up resources
   */
  destroy(): void;

  /**
   * Get the canvas element created by PixiJS
   */
  getCanvas(): HTMLCanvasElement | null;
}
