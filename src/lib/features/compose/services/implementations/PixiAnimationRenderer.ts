/**
 * PixiJS Animation Renderer Implementation (Refactored)
 *
 * High-performance WebGL-based renderer for animation visualization.
 * Uses PixiJS for GPU-accelerated rendering of props, trails, grid, and glyphs.
 *
 * Performance improvements over Canvas 2D:
 * - 3-5x faster trail rendering (WebGL batched line drawing)
 * - 2-3x faster prop rendering (GPU transforms)
 * - Near-zero cost for rotation/scaling (GPU matrix math)
 * - Better mobile performance (efficient on mobile GPUs)
 *
 * Architecture:
 * This class now follows Single Responsibility Principle by delegating to specialized services:
 * - PixiApplicationManager: App lifecycle and canvas management
 * - PixiTextureLoader: Texture loading and caching
 * - PixiSpriteManager: Sprite lifecycle and updates
 * - PixiTrailRenderer: Trail rendering logic
 * - PixiPropRenderer: Prop positioning calculations
 * - PixiFadeTransitionManager: Glyph fade transitions
 */

import { Container, Graphics } from "pixi.js";
import { injectable } from "inversify";
import type {
  IPixiAnimationRenderer,
  AnimationVisibilitySettings,
} from "../contracts/IPixiAnimationRenderer";
import type { PropState } from "../../shared/domain/types/PropState";
import type {
  TrailPoint,
  TrailSettings,
} from "../../shared/domain/types/TrailTypes";
import { PixiApplicationManager } from "./pixi/PixiApplicationManager";
import { PixiTextureLoader } from "./pixi/PixiTextureLoader";
import { PixiSpriteManager } from "./pixi/PixiSpriteManager";
import { PixiTrailRenderer } from "./pixi/PixiTrailRenderer";
import { PixiPropRenderer } from "./pixi/PixiPropRenderer";
import { PixiFadeTransitionManager } from "./pixi/PixiFadeTransitionManager";

@injectable()
export class PixiAnimationRenderer implements IPixiAnimationRenderer {
  // Specialized service managers
  private appManager: PixiApplicationManager;
  private textureLoader: PixiTextureLoader;
  private spriteManager: PixiSpriteManager | null = null;
  private trailRenderer: PixiTrailRenderer | null = null;
  private propRenderer: PixiPropRenderer | null = null;
  private fadeManager: PixiFadeTransitionManager;

  // Layer containers (only needed for initialization)
  private gridContainer: Container | null = null;
  private trailContainer: Container | null = null;
  private propContainer: Container | null = null;
  private glyphContainer: Container | null = null;

  // Track current grid mode for resize operations
  private currentGridMode: string = "diamond";

  constructor() {
    this.appManager = new PixiApplicationManager();
    this.textureLoader = new PixiTextureLoader();
    this.fadeManager = new PixiFadeTransitionManager();
  }

  async initialize(
    container: HTMLElement,
    size: number,
    backgroundAlpha: number = 1
  ): Promise<void> {
    // Initialize PixiJS application
    const app = await this.appManager.initialize(
      container,
      size,
      backgroundAlpha
    );

    // Create layer hierarchy (directly on stage)
    this.gridContainer = new Container();
    this.trailContainer = new Container();
    this.propContainer = new Container();
    this.glyphContainer = new Container();

    // Add layers directly to stage in rendering order (bottom to top)
    app.stage.addChild(this.gridContainer);
    app.stage.addChild(this.trailContainer);
    app.stage.addChild(this.propContainer);
    app.stage.addChild(this.glyphContainer);

    // Create trail graphics (persistent, cleared and redrawn each frame)
    const blueTrailGraphics = new Graphics();
    const redTrailGraphics = new Graphics();
    this.trailContainer.addChild(blueTrailGraphics);
    this.trailContainer.addChild(redTrailGraphics);

    // Initialize specialized managers
    this.spriteManager = new PixiSpriteManager(
      this.gridContainer,
      this.propContainer,
      this.glyphContainer
    );
    this.trailRenderer = new PixiTrailRenderer(this.trailContainer);
    this.propRenderer = new PixiPropRenderer(size);
  }

  async resize(newSize: number): Promise<void> {
    this.appManager.resize(newSize);
    this.spriteManager?.resizeAllSprites(newSize);
    this.propRenderer?.updateSize(newSize);

    // CRITICAL: Reload grid texture at new canvas size
    // Without this, the grid texture (created at old size) gets stretched to new size
    // This fixes the "grid appears at wrong scale" bug on resize/refresh
    await this.loadGridTexture(this.currentGridMode);
  }

  async loadPropTextures(propType: string): Promise<void> {
    await this.textureLoader.loadPropTextures(propType);
  }

  async loadPerColorPropTextures(
    bluePropType: string,
    redPropType: string
  ): Promise<void> {
    await this.textureLoader.loadPerColorPropTextures(
      bluePropType,
      redPropType
    );
  }

  async loadSecondaryPropTextures(
    propType: string,
    blueColor: string,
    redColor: string
  ): Promise<void> {
    await this.textureLoader.loadSecondaryPropTextures(
      propType,
      blueColor,
      redColor
    );
  }

  async loadGridTexture(gridMode: string): Promise<void> {
    // Track current grid mode for resize operations
    this.currentGridMode = gridMode;

    const canvasSize = this.appManager.getCurrentSize();
    const gridTexture = await this.textureLoader.loadGridTexture(
      gridMode,
      canvasSize
    );

    // Update grid sprite
    this.spriteManager?.updateGridSprite(gridTexture, canvasSize);

    // Trigger a render to show the grid
    this.appManager.render();
  }

  async loadGlyphTexture(
    svgString: string,
    _width: number,
    _height: number
  ): Promise<void> {
    // Guard: spriteManager must be initialized
    if (!this.spriteManager) {
      console.warn(
        "[PixiAnimationRenderer] Cannot load glyph texture - not fully initialized"
      );
      return;
    }

    const { current, previous } = await this.textureLoader.loadGlyphTexture(
      svgString,
      _width,
      _height
    );

    const canvasSize = this.appManager.getCurrentSize();
    const sprites = this.spriteManager!.updateGlyphSprite(
      current,
      canvasSize,
      previous
    );

    // Start fade transition
    if (sprites.previous) {
      this.fadeManager.startFadeTransition();
    } else {
      // First glyph - no fade, just show it
      this.spriteManager!.setGlyphAlpha(1);
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
    visibility: AnimationVisibilitySettings;
  }): void {
    if (
      !this.appManager.isReady() ||
      !this.spriteManager ||
      !this.trailRenderer ||
      !this.propRenderer
    ) {
      console.warn("[PixiAnimationRenderer] renderScene skipped - not ready");
      return;
    }

    // Update fade progress if fading
    if (this.fadeManager.isFadingInProgress()) {
      const currentSprite = this.spriteManager.getGlyphSprite();
      const previousSprite = this.spriteManager.getPreviousGlyphSprite();

      const fadeComplete = this.fadeManager.updateFadeProgress(
        params.currentTime,
        currentSprite,
        previousSprite
      );

      if (fadeComplete) {
        // Remove and destroy previous glyph
        this.spriteManager.removePreviousGlyph();
        this.textureLoader.clearPreviousGlyphTexture();
      }
    }

    // Update grid visibility
    this.spriteManager.setGridVisibility(params.visibility.gridVisible);

    // Render trails (only if trails are visible)
    if (params.visibility.trailsVisible) {
      this.trailRenderer.renderTrails(
        params.blueTrailPoints,
        params.redTrailPoints,
        params.trailSettings,
        params.currentTime,
        !!params.blueProp && params.visibility.blueMotionVisible,
        !!params.redProp && params.visibility.redMotionVisible
      );
    } else {
      // Clear trails when hidden
      this.trailRenderer.clearTrails();
    }

    // Get textures
    const bluePropTexture = this.textureLoader.getBluePropTexture();
    const redPropTexture = this.textureLoader.getRedPropTexture();
    const secondaryBluePropTexture =
      this.textureLoader.getSecondaryBluePropTexture();
    const secondaryRedPropTexture =
      this.textureLoader.getSecondaryRedPropTexture();

    // Render primary blue prop (respect propsVisible and blueMotionVisible)
    if (
      params.blueProp &&
      bluePropTexture &&
      params.visibility.propsVisible &&
      params.visibility.blueMotionVisible &&
      !params.trailSettings.hideProps
    ) {
      const transform = this.propRenderer.calculatePropTransform(
        params.blueProp,
        params.bluePropDimensions
      );
      this.spriteManager.updatePropSprite(
        "blue",
        bluePropTexture,
        { x: transform.x, y: transform.y },
        { width: transform.width, height: transform.height },
        transform.rotation
      );
    } else {
      this.spriteManager.setPropVisibility("blue", false);
    }

    // Render primary red prop (respect propsVisible and redMotionVisible)
    if (
      params.redProp &&
      redPropTexture &&
      params.visibility.propsVisible &&
      params.visibility.redMotionVisible &&
      !params.trailSettings.hideProps
    ) {
      const transform = this.propRenderer.calculatePropTransform(
        params.redProp,
        params.redPropDimensions
      );
      this.spriteManager.updatePropSprite(
        "red",
        redPropTexture,
        { x: transform.x, y: transform.y },
        { width: transform.width, height: transform.height },
        transform.rotation
      );
    } else {
      this.spriteManager.setPropVisibility("red", false);
    }

    // Render secondary blue prop (tunnel mode - respect visibility settings)
    if (
      params.secondaryBlueProp &&
      secondaryBluePropTexture &&
      params.visibility.propsVisible &&
      params.visibility.blueMotionVisible &&
      !params.trailSettings.hideProps
    ) {
      const transform = this.propRenderer.calculatePropTransform(
        params.secondaryBlueProp,
        params.bluePropDimensions
      );
      this.spriteManager.updatePropSprite(
        "secondaryBlue",
        secondaryBluePropTexture,
        { x: transform.x, y: transform.y },
        { width: transform.width, height: transform.height },
        transform.rotation
      );
    } else {
      this.spriteManager.setPropVisibility("secondaryBlue", false);
    }

    // Render secondary red prop (tunnel mode - respect visibility settings)
    if (
      params.secondaryRedProp &&
      secondaryRedPropTexture &&
      params.visibility.propsVisible &&
      params.visibility.redMotionVisible &&
      !params.trailSettings.hideProps
    ) {
      const transform = this.propRenderer.calculatePropTransform(
        params.secondaryRedProp,
        params.redPropDimensions
      );
      this.spriteManager.updatePropSprite(
        "secondaryRed",
        secondaryRedPropTexture,
        { x: transform.x, y: transform.y },
        { width: transform.width, height: transform.height },
        transform.rotation
      );
    } else {
      this.spriteManager.setPropVisibility("secondaryRed", false);
    }

    // Manual render since autoStart is false
    this.appManager.render();
  }

  getApplication() {
    return this.appManager.getApplication();
  }

  getCanvas() {
    return this.appManager.getCanvas();
  }

  async captureFrame(): Promise<ImageBitmap> {
    const canvas = this.appManager.getCanvas();
    if (!canvas) {
      throw new Error("Cannot capture frame - canvas not initialized");
    }

    // Ensure frame is fully rendered
    this.appManager.render();

    // Wait for next frame to ensure rendering is complete
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Capture canvas as ImageBitmap (GPU-ready format)
    return createImageBitmap(canvas);
  }

  destroy(): void {
    try {
      // Destroy specialized managers
      this.spriteManager?.destroy();
      this.trailRenderer?.destroy();
      this.textureLoader.destroy();
      this.fadeManager.reset();

      // Get app for container cleanup
      const app = this.appManager.getApplication();
      if (app?.stage) {
        app.stage.removeChildren();
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

      // Destroy application (handles canvas removal)
      this.appManager.destroy();

      // Clear references
      this.spriteManager = null;
      this.trailRenderer = null;
      this.propRenderer = null;
      this.gridContainer = null;
      this.trailContainer = null;
      this.propContainer = null;
      this.glyphContainer = null;
    } catch (error) {
      console.error("[PixiAnimationRenderer] Error during destroy:", error);
    }
  }
}
