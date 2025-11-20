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
import type { IPixiAnimationRenderer } from "../contracts/IPixiAnimationRenderer";
import type { PropState } from "../../domain/types/PropState";
import type { TrailPoint, TrailSettings } from "../../domain/types/TrailTypes";
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
    const app = await this.appManager.initialize(container, size, backgroundAlpha);

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

    console.log("[PixiAnimationRenderer] Initialized successfully");
  }

  resize(newSize: number): void {
    this.appManager.resize(newSize);
    this.spriteManager?.resizeAllSprites(newSize);
    this.propRenderer?.updateSize(newSize);
  }

  async loadPropTextures(propType: string): Promise<void> {
    await this.textureLoader.loadPropTextures(propType);
    console.log(`[PixiAnimationRenderer] Loaded prop textures for ${propType}`);
  }

  async loadGridTexture(gridMode: string): Promise<void> {
    const canvasSize = this.appManager.getCurrentSize();
    const gridTexture = await this.textureLoader.loadGridTexture(gridMode, canvasSize);

    // Update grid sprite
    this.spriteManager?.updateGridSprite(gridTexture, canvasSize);

    // Trigger a render to show the grid
    this.appManager.render();

    console.log(`[PixiAnimationRenderer] Loaded grid texture for ${gridMode}`);
  }

  async loadGlyphTexture(
    svgString: string,
    _width: number,
    _height: number
  ): Promise<void> {
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

    console.log("[PixiAnimationRenderer] Loaded glyph texture");
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
    if (!this.appManager.isReady() || !this.spriteManager || !this.trailRenderer || !this.propRenderer) {
      return;
    }

    // Update fade progress if fading
    if (this.fadeManager.isFadingInProgress()) {
      const fadeComplete = this.fadeManager.updateFadeProgress(
        params.currentTime,
        this.spriteManager.getGlyphSprite(),
        this.spriteManager.getPreviousGlyphSprite()
      );

      if (fadeComplete) {
        // Remove and destroy previous glyph
        this.spriteManager.removePreviousGlyph();
        this.textureLoader.clearPreviousGlyphTexture();
      }
    }

    // Update grid visibility
    this.spriteManager.setGridVisibility(params.gridVisible);

    // Render trails
    this.trailRenderer.renderTrails(
      params.blueTrailPoints,
      params.redTrailPoints,
      params.trailSettings,
      params.currentTime,
      !!params.blueProp,
      !!params.redProp
    );

    // Get textures
    const bluePropTexture = this.textureLoader.getBluePropTexture();
    const redPropTexture = this.textureLoader.getRedPropTexture();

    // Render primary blue prop
    if (params.blueProp && bluePropTexture && !params.trailSettings.hideProps) {
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

    // Render primary red prop
    if (params.redProp && redPropTexture && !params.trailSettings.hideProps) {
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

    // Render secondary blue prop (tunnel mode)
    if (params.secondaryBlueProp && bluePropTexture && !params.trailSettings.hideProps) {
      const transform = this.propRenderer.calculatePropTransform(
        params.secondaryBlueProp,
        params.bluePropDimensions
      );
      this.spriteManager.updatePropSprite(
        "secondaryBlue",
        bluePropTexture,
        { x: transform.x, y: transform.y },
        { width: transform.width, height: transform.height },
        transform.rotation
      );
    } else {
      this.spriteManager.setPropVisibility("secondaryBlue", false);
    }

    // Render secondary red prop (tunnel mode)
    if (params.secondaryRedProp && redPropTexture && !params.trailSettings.hideProps) {
      const transform = this.propRenderer.calculatePropTransform(
        params.secondaryRedProp,
        params.redPropDimensions
      );
      this.spriteManager.updatePropSprite(
        "secondaryRed",
        redPropTexture,
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

  destroy(): void {
    console.log("[PixiAnimationRenderer] Starting cleanup...");

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

      console.log("[PixiAnimationRenderer] Destroyed");
    } catch (error) {
      console.error("[PixiAnimationRenderer] Error during destroy:", error);
    }
  }
}
