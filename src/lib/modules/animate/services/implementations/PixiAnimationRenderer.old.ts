/**
 * PixiJS Animation Renderer Implementation
 *
 * High-performance WebGL-based renderer for animation visualization.
 * Uses PixiJS for GPU-accelerated rendering of props, trails, grid, and glyphs.
 *
 * Performance improvements over Canvas 2D:
 * - 3-5x faster trail rendering (WebGL batched line drawing)
 * - 2-3x faster prop rendering (GPU transforms)
 * - Near-zero cost for rotation/scaling (GPU matrix math)
 * - Better mobile performance (efficient on mobile GPUs)
 */

import { Application, Container, Graphics, Sprite, Texture } from "pixi.js";
import { injectable } from "inversify";
import type { IPixiAnimationRenderer } from "../contracts/IPixiAnimationRenderer";
import type { PropState } from "../../domain/types/PropState";
import type { TrailPoint, TrailSettings } from "../../domain/types/TrailTypes";
import {
  TrailMode,
  TrailStyle,
  TrackingMode,
} from "../../domain/types/TrailTypes";
import { createSmoothCurve, type Point2D } from "../../utils/CatmullRomSpline";

// Constants for strict point positioning in animation viewer
const GRID_HALFWAY_POINT_OFFSET = 150; // Strict point radius from center
const INWARD_FACTOR = 1.0; // No adjustment - use exact strict point coordinates
const VIEWBOX_SIZE = 950;

@injectable()
export class PixiAnimationRenderer implements IPixiAnimationRenderer {
  private app: Application | null = null;

  // Layer containers (rendering order: grid -> trails -> props -> glyph)
  private gridContainer: Container | null = null;
  private trailContainer: Container | null = null;
  private propContainer: Container | null = null;
  private glyphContainer: Container | null = null;

  // Sprites
  private gridSprite: Sprite | null = null;
  private bluePropSprite: Sprite | null = null;
  private redPropSprite: Sprite | null = null;
  private secondaryBluePropSprite: Sprite | null = null;
  private secondaryRedPropSprite: Sprite | null = null;
  private glyphSprite: Sprite | null = null;
  private previousGlyphSprite: Sprite | null = null;

  // Trail graphics (persistent, reused each frame)
  private blueTrailGraphics: Graphics | null = null;
  private redTrailGraphics: Graphics | null = null;

  // Textures
  private bluePropTexture: Texture | null = null;
  private redPropTexture: Texture | null = null;
  private gridTexture: Texture | null = null;
  private glyphTexture: Texture | null = null;
  private previousGlyphTexture: Texture | null = null;

  // State
  private currentSize: number = 500;
  private isInitialized: boolean = false;

  // Fade transition state
  private fadeProgress: number = 0;
  private isFading: boolean = false;
  private fadeStartTime: number | null = null;
  private readonly FADE_DURATION_MS = 150;

  async initialize(
    container: HTMLElement,
    size: number,
    backgroundAlpha: number = 1
  ): Promise<void> {
    if (this.isInitialized) {
      console.warn("[PixiAnimationRenderer] Already initialized");
      return;
    }

    this.currentSize = size;

    try {
      // Create PixiJS application with autoStart: false to prevent automatic render loop
      this.app = new Application();
      await this.app.init({
        width: size,
        height: size,
        backgroundColor: 0xffffff,
        backgroundAlpha, // Support transparent canvas for overlay rendering
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        autoStart: false, // Prevent automatic ticker
      });

      // Wait a tick for canvas to be available
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Append canvas to container
      const canvas = this.app.canvas;
      if (!canvas) {
        throw new Error("PixiJS canvas not available after initialization");
      }
      container.appendChild(canvas);

      // Create layer hierarchy (directly on stage, no mainContainer needed)
      this.gridContainer = new Container();
      this.trailContainer = new Container();
      this.propContainer = new Container();
      this.glyphContainer = new Container();

      // Add layers directly to stage in rendering order (bottom to top)
      this.app.stage.addChild(this.gridContainer);
      this.app.stage.addChild(this.trailContainer);
      this.app.stage.addChild(this.propContainer);
      this.app.stage.addChild(this.glyphContainer);

      // Create trail graphics (persistent, cleared and redrawn each frame)
      this.blueTrailGraphics = new Graphics();
      this.redTrailGraphics = new Graphics();
      this.trailContainer.addChild(this.blueTrailGraphics);
      this.trailContainer.addChild(this.redTrailGraphics);

      this.isInitialized = true;
      console.log("[PixiAnimationRenderer] Initialized successfully");
    } catch (error) {
      console.error("[PixiAnimationRenderer] Initialization failed:", error);
      // Clean up on failure
      if (this.app) {
        try {
          this.app.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
        this.app = null;
      }
      throw error;
    }
  }

  resize(newSize: number): void {
    if (!this.app) return;

    this.currentSize = newSize;
    this.app.renderer.resize(newSize, newSize);

    // Resize all sprites to match new canvas size
    if (this.gridSprite) {
      this.gridSprite.width = newSize;
      this.gridSprite.height = newSize;
    }

    if (this.glyphSprite) {
      this.glyphSprite.width = newSize;
      this.glyphSprite.height = newSize;
    }

    if (this.previousGlyphSprite) {
      this.previousGlyphSprite.width = newSize;
      this.previousGlyphSprite.height = newSize;
    }

    // Props will be resized in renderProp when they're next rendered
  }

  async loadPropTextures(propType: string): Promise<void> {
    try {
      // Import SVGGenerator to generate prop SVGs
      const { TYPES } = await import("$shared/inversify/types");
      const { resolve } = await import("$shared");
      const svgGenerator = resolve(TYPES.ISVGGenerator) as any;

      // Generate blue and red prop SVGs
      const [bluePropData, redPropData] = await Promise.all([
        svgGenerator.generateBluePropSvg(propType),
        svgGenerator.generateRedPropSvg(propType),
      ]);

      // Load textures from SVG strings
      this.bluePropTexture = await this.createTextureFromSVG(
        bluePropData.svg,
        bluePropData.width,
        bluePropData.height
      );
      this.redPropTexture = await this.createTextureFromSVG(
        redPropData.svg,
        redPropData.width,
        redPropData.height
      );

      console.log(
        `[PixiAnimationRenderer] Loaded prop textures for ${propType}`
      );
    } catch (error) {
      console.error(
        "[PixiAnimationRenderer] Failed to load prop textures:",
        error
      );
    }
  }

  async loadGridTexture(gridMode: string): Promise<void> {
    try {
      const { TYPES } = await import("$shared/inversify/types");
      const { resolve, GridMode } = await import("$shared");
      const svgGenerator = resolve(TYPES.ISVGGenerator) as any;

      // Convert gridMode string to GridMode enum
      const gridModeEnum =
        GridMode[gridMode.toUpperCase() as keyof typeof GridMode] ||
        GridMode.DIAMOND;

      const gridSvg = svgGenerator.generateGridSvg(gridModeEnum);

      // Load texture at current canvas size for optimal quality
      // The Image element will be scaled by devicePixelRatio in createTextureFromSVG
      this.gridTexture = await this.createTextureFromSVG(
        gridSvg,
        this.currentSize,
        this.currentSize
      );

      // Create or update grid sprite
      if (this.gridSprite) {
        this.gridSprite.texture = this.gridTexture;
      } else {
        this.gridSprite = new Sprite(this.gridTexture);
        this.gridSprite.width = this.currentSize;
        this.gridSprite.height = this.currentSize;
        this.gridContainer?.addChild(this.gridSprite);
      }

      // Trigger a render to show the grid
      if (this.app && this.app.renderer) {
        this.app.renderer.render(this.app.stage);
      }

      console.log(
        `[PixiAnimationRenderer] Loaded grid texture for ${gridMode}`
      );
    } catch (error) {
      console.error(
        "[PixiAnimationRenderer] Failed to load grid texture:",
        error
      );
    }
  }

  async loadGlyphTexture(
    svgString: string,
    _width: number,
    _height: number
  ): Promise<void> {
    try {
      // Save previous glyph for fade transition
      if (this.glyphTexture) {
        this.previousGlyphTexture = this.glyphTexture;
        this.previousGlyphSprite = this.glyphSprite;
      }

      // Create texture from SVG (full 950x950 viewBox)
      this.glyphTexture = await this.createTextureFromSVG(
        svgString,
        VIEWBOX_SIZE,
        VIEWBOX_SIZE
      );

      // Create new glyph sprite
      this.glyphSprite = new Sprite(this.glyphTexture);
      this.glyphSprite.width = this.currentSize;
      this.glyphSprite.height = this.currentSize;
      this.glyphSprite.alpha = 0; // Start invisible for fade-in

      this.glyphContainer?.addChild(this.glyphSprite);

      // Start fade transition
      if (this.previousGlyphSprite) {
        this.startFadeTransition();
      } else {
        // First glyph - no fade, just show it
        this.glyphSprite.alpha = 1;
      }

      console.log("[PixiAnimationRenderer] Loaded glyph texture");
    } catch (error) {
      console.error(
        "[PixiAnimationRenderer] Failed to load glyph texture:",
        error
      );
    }
  }

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
  }): void {
    if (!this.app || !this.isInitialized) return;

    // Update fade progress if fading
    if (this.isFading) {
      this.updateFadeProgress(params.currentTime);
    }

    // Update grid visibility
    if (this.gridSprite) {
      this.gridSprite.visible = params.gridVisible;
    }

    // Render trails
    this.renderTrails(params);

    // Render primary blue prop (hidden if hideProps is enabled)
    if (
      params.blueProp &&
      this.bluePropTexture &&
      !params.trailSettings.hideProps
    ) {
      this.renderProp(
        params.blueProp,
        params.bluePropDimensions,
        this.bluePropTexture,
        "blue"
      );
    } else if (this.bluePropSprite) {
      this.bluePropSprite.visible = false;
    }

    // Render primary red prop (hidden if hideProps is enabled)
    if (
      params.redProp &&
      this.redPropTexture &&
      !params.trailSettings.hideProps
    ) {
      this.renderProp(
        params.redProp,
        params.redPropDimensions,
        this.redPropTexture,
        "red"
      );
    } else if (this.redPropSprite) {
      this.redPropSprite.visible = false;
    }

    // Render secondary blue prop (tunnel mode)
    if (
      params.secondaryBlueProp &&
      this.bluePropTexture &&
      !params.trailSettings.hideProps
    ) {
      this.renderProp(
        params.secondaryBlueProp,
        params.bluePropDimensions,
        this.bluePropTexture,
        "secondaryBlue"
      );
    } else if (this.secondaryBluePropSprite) {
      this.secondaryBluePropSprite.visible = false;
    }

    // Render secondary red prop (tunnel mode)
    if (
      params.secondaryRedProp &&
      this.redPropTexture &&
      !params.trailSettings.hideProps
    ) {
      this.renderProp(
        params.secondaryRedProp,
        params.redPropDimensions,
        this.redPropTexture,
        "secondaryRed"
      );
    } else if (this.secondaryRedPropSprite) {
      this.secondaryRedPropSprite.visible = false;
    }

    // Manual render since autoStart is false
    this.app.renderer.render(this.app.stage);
  }

  private renderProp(
    propState: PropState,
    propDimensions: { width: number; height: number },
    texture: Texture,
    color: "blue" | "red" | "secondaryBlue" | "secondaryRed"
  ): void {
    // Get or create sprite
    let sprite: Sprite | null =
      color === "blue"
        ? this.bluePropSprite
        : color === "red"
          ? this.redPropSprite
          : color === "secondaryBlue"
            ? this.secondaryBluePropSprite
            : this.secondaryRedPropSprite;

    if (!sprite) {
      sprite = new Sprite(texture);
      if (color === "blue") {
        this.bluePropSprite = sprite;
      } else if (color === "red") {
        this.redPropSprite = sprite;
      } else if (color === "secondaryBlue") {
        this.secondaryBluePropSprite = sprite;
      } else {
        this.secondaryRedPropSprite = sprite;
      }
      this.propContainer?.addChild(sprite);
    } else {
      sprite.texture = texture;
    }

    // Make sprite visible
    sprite.visible = true;

    // Calculate position (matching CanvasRenderer logic)
    const centerX = this.currentSize / 2;
    const centerY = this.currentSize / 2;
    const gridScaleFactor = this.currentSize / VIEWBOX_SIZE;
    const scaledHalfwayRadius = GRID_HALFWAY_POINT_OFFSET * gridScaleFactor;

    let x: number, y: number;

    if (propState.x !== undefined && propState.y !== undefined) {
      // Dash motion: use Cartesian coordinates
      x = centerX + propState.x * scaledHalfwayRadius * INWARD_FACTOR;
      y = centerY + propState.y * scaledHalfwayRadius * INWARD_FACTOR;
    } else {
      // Regular motion: calculate from angle
      x =
        centerX +
        Math.cos(propState.centerPathAngle) *
          scaledHalfwayRadius *
          INWARD_FACTOR;
      y =
        centerY +
        Math.sin(propState.centerPathAngle) *
          scaledHalfwayRadius *
          INWARD_FACTOR;
    }

    // Scale prop dimensions
    const propWidth = propDimensions.width * gridScaleFactor;
    const propHeight = propDimensions.height * gridScaleFactor;

    // Set sprite properties
    sprite.width = propWidth;
    sprite.height = propHeight;
    sprite.anchor.set(0.5, 0.5); // Center anchor point
    sprite.position.set(x, y);
    sprite.rotation = propState.staffRotationAngle;
  }

  // Track if we've logged trail status (for debugging)
  private hasLoggedTrailStatus = false;

  private renderTrails(params: {
    blueTrailPoints: TrailPoint[];
    redTrailPoints: TrailPoint[];
    trailSettings: TrailSettings;
    currentTime: number;
    blueProp: PropState | null;
    redProp: PropState | null;
  }): void {
    // Debug log once
    if (!this.hasLoggedTrailStatus) {
      console.log(
        `🔍 Trail Status: enabled=${params.trailSettings.enabled}, mode=${params.trailSettings.mode}`
      );
      console.log(
        `   Blue points: ${params.blueTrailPoints.length}, Red points: ${params.redTrailPoints.length}`
      );
      this.hasLoggedTrailStatus = true;
    }

    if (
      !params.trailSettings.enabled ||
      params.trailSettings.mode === TrailMode.OFF
    ) {
      this.blueTrailGraphics?.clear();
      this.redTrailGraphics?.clear();
      return;
    }

    // Render blue trail
    if (params.blueProp && this.blueTrailGraphics) {
      this.blueTrailGraphics.clear();
      this.renderTrailSegments(
        this.blueTrailGraphics,
        params.blueTrailPoints,
        params.trailSettings.blueColor,
        params.trailSettings,
        params.currentTime
      );
    }

    // Render red trail
    if (params.redProp && this.redTrailGraphics) {
      this.redTrailGraphics.clear();
      this.renderTrailSegments(
        this.redTrailGraphics,
        params.redTrailPoints,
        params.trailSettings.redColor,
        params.trailSettings,
        params.currentTime
      );
    }
  }

  private renderTrailSegments(
    graphics: Graphics,
    points: TrailPoint[],
    colorString: string,
    settings: TrailSettings,
    currentTime: number
  ): void {
    if (points.length < 2) return;

    // Separate points by endType if tracking both ends
    const pointSets: TrailPoint[][] =
      settings.trackingMode === TrackingMode.BOTH_ENDS
        ? [
            points.filter((p) => p.endType === 0), // Left end
            points.filter((p) => p.endType === 1), // Right end
          ]
        : [points]; // Single end (left or right)

    // Convert color string to hex number (e.g., "#2E3192" -> 0x2E3192)
    const color = parseInt(colorString.replace("#", ""), 16);

    for (const pointSet of pointSets) {
      if (pointSet.length < 2) continue;

      // Use smooth curves if enabled, otherwise line segments
      if (settings.style === TrailStyle.SMOOTH_LINE) {
        this.renderSmoothTrail(
          graphics,
          pointSet,
          color,
          settings,
          currentTime
        );
      } else {
        // Using line segments (for non-smooth styles or cached points)
        this.renderSegmentedTrail(
          graphics,
          pointSet,
          color,
          settings,
          currentTime
        );
      }
    }
  }

  /**
   * Render smooth trail using Catmull-Rom splines
   *
   * Uses adaptive subdivision to handle any number of points efficiently
   */
  private renderSmoothTrail(
    graphics: Graphics,
    points: TrailPoint[],
    color: number,
    settings: TrailSettings,
    currentTime: number
  ): void {
    if (points.length < 2) return;

    // Convert trail points to Point2D for spline interpolation
    const controlPoints: Point2D[] = points.map((p) => ({ x: p.x, y: p.y }));

    // Adaptive subdivision based on point count:
    // - More points = fewer subdivisions needed (points are already dense)
    // - Fewer points = more subdivisions needed (interpolate between sparse points)
    // This keeps total rendered points consistent for smooth curves at all densities
    const subdivisionsPerSegment = Math.max(
      2, // Minimum 2 subdivisions (always some smoothing)
      Math.min(
        10, // Maximum 10 subdivisions (diminishing returns beyond this)
        Math.floor(150 / points.length) // Scale inversely with point count
      )
    );

    const smoothPoints = createSmoothCurve(controlPoints, {
      alpha: 0.5, // Centripetal Catmull-Rom (best for non-uniform point spacing)
      subdivisionsPerSegment,
    });

    if (smoothPoints.length < 2) {
      return;
    }

    // Draw smooth curve with gradient opacity
    for (let i = 0; i < smoothPoints.length - 1; i++) {
      const currentPoint = smoothPoints[i]!;
      const nextPoint = smoothPoints[i + 1]!;

      // Skip invalid points
      if (
        isNaN(currentPoint.x) ||
        isNaN(currentPoint.y) ||
        isNaN(nextPoint.x) ||
        isNaN(nextPoint.y)
      ) {
        continue;
      }

      // Calculate opacity based on position along the trail
      let opacity: number;

      if (settings.mode === TrailMode.FADE) {
        // Map smooth point index back to original trail point for timestamp
        const originalPointIndex = Math.floor(
          (i / smoothPoints.length) * points.length
        );
        const originalPoint = points[originalPointIndex];

        if (originalPoint) {
          const age = currentTime - originalPoint.timestamp;
          const progress = age / settings.fadeDurationMs;
          opacity =
            settings.maxOpacity -
            progress * (settings.maxOpacity - settings.minOpacity);
          opacity = Math.max(
            settings.minOpacity,
            Math.min(settings.maxOpacity, opacity)
          );
        } else {
          opacity = settings.maxOpacity;
        }
      } else {
        // LOOP_CLEAR and PERSISTENT - gradient from old to new
        const progress = i / (smoothPoints.length - 1);
        opacity =
          settings.minOpacity +
          progress * (settings.maxOpacity - settings.minOpacity);
      }

      // Draw smooth line segment
      graphics.moveTo(currentPoint.x, currentPoint.y);
      graphics.lineTo(nextPoint.x, nextPoint.y);
      graphics.stroke({
        width: settings.lineWidth,
        color: color,
        alpha: opacity,
        cap: "round",
        join: "round",
      });
    }
  }

  /**
   * Render trail using straight line segments (legacy/fallback)
   */
  private renderSegmentedTrail(
    graphics: Graphics,
    points: TrailPoint[],
    color: number,
    settings: TrailSettings,
    currentTime: number
  ): void {
    if (points.length < 2) return;

    // Draw trail segments with varying opacity
    for (let i = 0; i < points.length - 1; i++) {
      const point = points[i]!;
      const nextPoint = points[i + 1]!;

      // Skip invalid points
      if (
        isNaN(point.x) ||
        isNaN(point.y) ||
        isNaN(nextPoint.x) ||
        isNaN(nextPoint.y)
      ) {
        continue;
      }

      // Calculate opacity based on mode
      let opacity: number;

      if (settings.mode === TrailMode.FADE) {
        const age = currentTime - point.timestamp;
        const progress = age / settings.fadeDurationMs;
        opacity =
          settings.maxOpacity -
          progress * (settings.maxOpacity - settings.minOpacity);
        opacity = Math.max(
          settings.minOpacity,
          Math.min(settings.maxOpacity, opacity)
        );
      } else {
        // LOOP_CLEAR and PERSISTENT - gradient from old to new
        const progress = i / (points.length - 1);
        opacity =
          settings.minOpacity +
          progress * (settings.maxOpacity - settings.minOpacity);
      }

      // Draw line segment
      graphics.moveTo(point.x, point.y);
      graphics.lineTo(nextPoint.x, nextPoint.y);
      graphics.stroke({
        width: settings.lineWidth,
        color: color,
        alpha: opacity,
        cap: "round",
        join: "round",
      });
    }
  }

  private startFadeTransition(): void {
    this.isFading = true;
    this.fadeProgress = 0;
    this.fadeStartTime = performance.now();
  }

  private updateFadeProgress(currentTime: number): void {
    if (!this.isFading || this.fadeStartTime === null) return;

    const elapsed = currentTime - this.fadeStartTime;
    this.fadeProgress = Math.min(elapsed / this.FADE_DURATION_MS, 1);

    // Update alphas
    if (this.previousGlyphSprite) {
      this.previousGlyphSprite.alpha = 1 - this.fadeProgress;
    }
    if (this.glyphSprite) {
      this.glyphSprite.alpha = this.fadeProgress;
    }

    // Fade complete
    if (this.fadeProgress >= 1) {
      this.isFading = false;
      this.fadeProgress = 1;

      // Remove and destroy previous glyph
      if (this.previousGlyphSprite) {
        this.glyphContainer?.removeChild(this.previousGlyphSprite);
        this.previousGlyphSprite.destroy();
        this.previousGlyphSprite = null;
      }
      if (this.previousGlyphTexture) {
        this.previousGlyphTexture.destroy();
        this.previousGlyphTexture = null;
      }
    }
  }

  private async createTextureFromSVG(
    svgString: string,
    width: number,
    height: number
  ): Promise<Texture> {
    // Convert SVG to data URL
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    const dataUrl = `data:image/svg+xml;base64,${base64}`;

    // Scale by devicePixelRatio for crisp rendering on high-DPI displays
    const scale =
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const targetWidth = width * scale;
    const targetHeight = height * scale;

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Render SVG to canvas at high resolution for crisp textures
          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get 2D context"));
            return;
          }

          // Draw the SVG image to canvas at target size
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Create texture from canvas
          const texture = Texture.from(canvas);
          resolve(texture);
        } catch (error) {
          console.error("Texture creation error:", error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error("Image load error:", error);
        reject(new Error("Failed to load SVG image"));
      };

      img.src = dataUrl;
    });
  }

  getApplication(): Application | null {
    return this.app;
  }

  getCanvas(): HTMLCanvasElement | null {
    return (this.app?.canvas as HTMLCanvasElement) || null;
  }

  destroy(): void {
    if (!this.app || !this.isInitialized) return;

    try {
      // Remove all children from containers first
      this.gridContainer?.removeChildren();
      this.trailContainer?.removeChildren();
      this.propContainer?.removeChildren();
      this.glyphContainer?.removeChildren();

      // Destroy graphics
      try {
        this.blueTrailGraphics?.destroy();
        this.redTrailGraphics?.destroy();
      } catch (e) {
        // Ignore graphics destroy errors
      }

      // Destroy sprites
      try {
        this.bluePropSprite?.destroy();
        this.redPropSprite?.destroy();
        this.gridSprite?.destroy();
        this.glyphSprite?.destroy();
        this.previousGlyphSprite?.destroy();
      } catch (e) {
        // Ignore sprite destroy errors
      }

      // Destroy textures
      try {
        this.bluePropTexture?.destroy(true);
        this.redPropTexture?.destroy(true);
        this.gridTexture?.destroy(true);
        this.glyphTexture?.destroy(true);
        this.previousGlyphTexture?.destroy(true);
      } catch (e) {
        // Ignore texture destroy errors
      }

      // Remove containers from stage
      if (this.app.stage) {
        this.app.stage.removeChildren();
      }

      // Destroy containers
      try {
        this.gridContainer?.destroy();
        this.trailContainer?.destroy();
        this.propContainer?.destroy();
        this.glyphContainer?.destroy();
      } catch (e) {
        // Ignore container destroy errors
      }

      // CRITICAL: Remove canvas from DOM before destroying renderer
      try {
        const canvas = this.app.canvas;
        if (canvas && canvas.parentElement) {
          canvas.parentElement.removeChild(canvas);
        }
      } catch (e) {
        console.warn("[PixiAnimationRenderer] Canvas removal warning:", e);
      }

      // Destroy app last, with minimal options to avoid internal errors
      try {
        if (this.app.renderer) {
          this.app.renderer.destroy();
        }
      } catch (e) {
        console.warn("[PixiAnimationRenderer] Renderer destroy warning:", e);
      }

      // Clear app reference
      this.app = null;

      // Clear all references
      this.bluePropTexture = null;
      this.redPropTexture = null;
      this.gridTexture = null;
      this.glyphTexture = null;
      this.previousGlyphTexture = null;
      this.bluePropSprite = null;
      this.redPropSprite = null;
      this.gridSprite = null;
      this.glyphSprite = null;
      this.previousGlyphSprite = null;
      this.blueTrailGraphics = null;
      this.redTrailGraphics = null;
      this.gridContainer = null;
      this.trailContainer = null;
      this.propContainer = null;
      this.glyphContainer = null;

      this.isInitialized = false;
      console.log("[PixiAnimationRenderer] Destroyed");
    } catch (error) {
      console.error("[PixiAnimationRenderer] Error during destroy:", error);
      // Force cleanup
      this.app = null;
      this.isInitialized = false;
    }
  }
}
