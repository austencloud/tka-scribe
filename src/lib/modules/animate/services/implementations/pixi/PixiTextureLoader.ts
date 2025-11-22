/**
 * PixiJS Texture Loader
 *
 * Handles texture creation and caching:
 * - SVG to texture conversion
 * - Prop texture loading
 * - Grid texture loading
 * - Glyph texture loading
 * - Texture lifecycle management
 *
 * Single Responsibility: Texture loading and management
 */

import { Texture } from "pixi.js";

import type { ISVGGenerator } from "../../contracts/ISVGGenerator";

const VIEWBOX_SIZE = 950;

export class PixiTextureLoader {
  // Texture cache
  private bluePropTexture: Texture | null = null;
  private redPropTexture: Texture | null = null;
  private gridTexture: Texture | null = null;
  private glyphTexture: Texture | null = null;
  private previousGlyphTexture: Texture | null = null;

  async loadPropTextures(propType: string): Promise<{
    blue: Texture;
    red: Texture;
  }> {
    try {
      // Import SVGGenerator to generate prop SVGs
      const { TYPES } = await import("$shared/inversify/types");
      const { resolve } = await import("$shared");
      const svgGenerator = resolve(TYPES.ISVGGenerator) as ISVGGenerator;

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

      console.log(`[PixiTextureLoader] Loaded prop textures for ${propType}`);

      return {
        blue: this.bluePropTexture,
        red: this.redPropTexture,
      };
    } catch (error) {
      console.error("[PixiTextureLoader] Failed to load prop textures:", error);
      throw error;
    }
  }

  async loadGridTexture(
    gridMode: string,
    canvasSize: number
  ): Promise<Texture> {
    try {
      const { TYPES } = await import("$shared/inversify/types");
      const { resolve, GridMode } = await import("$shared");
      const svgGenerator = resolve(TYPES.ISVGGenerator) as ISVGGenerator;

      // Convert gridMode string to GridMode enum
      const gridModeEnum =
        GridMode[gridMode.toUpperCase() as keyof typeof GridMode] ||
        GridMode.DIAMOND;

      const gridSvg = svgGenerator.generateGridSvg(gridModeEnum);

      // Load texture at current canvas size for optimal quality
      this.gridTexture = await this.createTextureFromSVG(
        gridSvg,
        canvasSize,
        canvasSize
      );

      console.log(`[PixiTextureLoader] Loaded grid texture for ${gridMode}`);

      return this.gridTexture;
    } catch (error) {
      console.error("[PixiTextureLoader] Failed to load grid texture:", error);
      throw error;
    }
  }

  async loadGlyphTexture(
    svgString: string,
    _width: number,
    _height: number
  ): Promise<{
    current: Texture;
    previous: Texture | null;
  }> {
    try {
      // Save previous glyph for fade transition
      if (this.glyphTexture) {
        this.previousGlyphTexture = this.glyphTexture;
      }

      // Create texture from SVG (full 950x950 viewBox)
      this.glyphTexture = await this.createTextureFromSVG(
        svgString,
        VIEWBOX_SIZE,
        VIEWBOX_SIZE
      );

      console.log("[PixiTextureLoader] Loaded glyph texture");

      return {
        current: this.glyphTexture,
        previous: this.previousGlyphTexture,
      };
    } catch (error) {
      console.error("[PixiTextureLoader] Failed to load glyph texture:", error);
      throw error;
    }
  }

  clearPreviousGlyphTexture(): void {
    if (this.previousGlyphTexture) {
      this.previousGlyphTexture.destroy();
      this.previousGlyphTexture = null;
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

  getBluePropTexture(): Texture | null {
    return this.bluePropTexture;
  }

  getRedPropTexture(): Texture | null {
    return this.redPropTexture;
  }

  getGridTexture(): Texture | null {
    return this.gridTexture;
  }

  getGlyphTexture(): Texture | null {
    return this.glyphTexture;
  }

  destroy(): void {
    try {
      this.bluePropTexture?.destroy(true);
      this.redPropTexture?.destroy(true);
      this.gridTexture?.destroy(true);
      this.glyphTexture?.destroy(true);
      this.previousGlyphTexture?.destroy(true);
    } catch (e) {
      // Ignore texture destroy errors
    }

    this.bluePropTexture = null;
    this.redPropTexture = null;
    this.gridTexture = null;
    this.glyphTexture = null;
    this.previousGlyphTexture = null;
  }
}
