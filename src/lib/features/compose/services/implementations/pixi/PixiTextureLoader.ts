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
import { createComponentLogger } from "$lib/shared/utils/debug-logger";

const debug = createComponentLogger("PixiTextureLoader");
const VIEWBOX_SIZE = 950;

export class PixiTextureLoader {
  // Texture cache
  private bluePropTexture: Texture | null = null;
  private redPropTexture: Texture | null = null;
  private secondaryBluePropTexture: Texture | null = null;
  private secondaryRedPropTexture: Texture | null = null;
  private gridTexture: Texture | null = null;
  private glyphTexture: Texture | null = null;
  private previousGlyphTexture: Texture | null = null;

  async loadPropTextures(propType: string): Promise<{
    blue: Texture;
    red: Texture;
  }> {
    try {
      // Import SVGGenerator to generate prop SVGs
      const { TYPES } = await import("$lib/shared/inversify/types");
      const { resolve } = await import("$lib/shared/inversify/di");
      const svgGenerator = resolve<ISVGGenerator>(TYPES.ISVGGenerator);

      // Generate blue and red prop SVGs
      const [bluePropData, redPropData] = await Promise.all([
        svgGenerator.generateBluePropSvg(propType),
        svgGenerator.generateRedPropSvg(propType),
      ]);

      // CRITICAL: Create new textures BEFORE destroying old ones
      // This prevents race condition where renderScene uses destroyed texture
      const [newBlueTexture, newRedTexture] = await Promise.all([
        this.createTextureFromSVG(
          bluePropData.svg,
          bluePropData.width,
          bluePropData.height
        ),
        this.createTextureFromSVG(
          redPropData.svg,
          redPropData.width,
          redPropData.height
        ),
      ]);

      // Now safe to destroy old textures and swap
      const oldBlue = this.bluePropTexture;
      const oldRed = this.redPropTexture;
      this.bluePropTexture = newBlueTexture;
      this.redPropTexture = newRedTexture;
      oldBlue?.destroy(true);
      oldRed?.destroy(true);

      return {
        blue: this.bluePropTexture,
        red: this.redPropTexture,
      };
    } catch (error) {
      console.error("[PixiTextureLoader] Failed to load prop textures:", error);
      throw error;
    }
  }

  /**
   * Load different prop types for blue and red props
   * Supports per-color prop type selection
   */
  async loadPerColorPropTextures(
    bluePropType: string,
    redPropType: string
  ): Promise<{
    blue: Texture;
    red: Texture;
  }> {
    try {
      // Import SVGGenerator to generate prop SVGs
      const { TYPES } = await import("$lib/shared/inversify/types");
      const { resolve } = await import("$lib/shared/inversify/di");
      const svgGenerator = resolve<ISVGGenerator>(TYPES.ISVGGenerator);

      // Generate blue and red prop SVGs with different types
      const [bluePropData, redPropData] = await Promise.all([
        svgGenerator.generateBluePropSvg(bluePropType),
        svgGenerator.generateRedPropSvg(redPropType),
      ]);

      // CRITICAL: Create new textures BEFORE destroying old ones
      // This prevents race condition where renderScene uses destroyed texture
      const [newBlueTexture, newRedTexture] = await Promise.all([
        this.createTextureFromSVG(
          bluePropData.svg,
          bluePropData.width,
          bluePropData.height
        ),
        this.createTextureFromSVG(
          redPropData.svg,
          redPropData.width,
          redPropData.height
        ),
      ]);

      // Now safe to destroy old textures and swap
      const oldBlue = this.bluePropTexture;
      const oldRed = this.redPropTexture;
      this.bluePropTexture = newBlueTexture;
      this.redPropTexture = newRedTexture;
      oldBlue?.destroy(true);
      oldRed?.destroy(true);

      return {
        blue: this.bluePropTexture,
        red: this.redPropTexture,
      };
    } catch (error) {
      console.error(
        "[PixiTextureLoader] Failed to load per-color prop textures:",
        error
      );
      throw error;
    }
  }

  async loadSecondaryPropTextures(
    propType: string,
    blueColor: string,
    redColor: string
  ): Promise<{
    blue: Texture;
    red: Texture;
  }> {
    try {
      // Import SVGGenerator to generate prop SVGs
      const { TYPES } = await import("$lib/shared/inversify/types");
      const { resolve } = await import("$lib/shared/inversify/di");
      const svgGenerator = resolve<ISVGGenerator>(TYPES.ISVGGenerator);

      // Generate secondary prop SVGs with custom colors
      const [secondaryBluePropData, secondaryRedPropData] = await Promise.all([
        svgGenerator.generatePropSvg(propType, blueColor),
        svgGenerator.generatePropSvg(propType, redColor),
      ]);

      // CRITICAL: Create new textures BEFORE destroying old ones
      // This prevents race condition where renderScene uses destroyed texture
      const [newBlueTexture, newRedTexture] = await Promise.all([
        this.createTextureFromSVG(
          secondaryBluePropData.svg,
          secondaryBluePropData.width,
          secondaryBluePropData.height
        ),
        this.createTextureFromSVG(
          secondaryRedPropData.svg,
          secondaryRedPropData.width,
          secondaryRedPropData.height
        ),
      ]);

      // Now safe to destroy old textures and swap
      const oldBlue = this.secondaryBluePropTexture;
      const oldRed = this.secondaryRedPropTexture;
      this.secondaryBluePropTexture = newBlueTexture;
      this.secondaryRedPropTexture = newRedTexture;
      oldBlue?.destroy(true);
      oldRed?.destroy(true);

      console.log(
        `[PixiTextureLoader] Loaded secondary prop textures for ${propType} (blue: ${blueColor}, red: ${redColor})`
      );

      return {
        blue: this.secondaryBluePropTexture,
        red: this.secondaryRedPropTexture,
      };
    } catch (error) {
      console.error(
        "[PixiTextureLoader] Failed to load secondary prop textures:",
        error
      );
      throw error;
    }
  }

  async loadGridTexture(
    gridMode: string,
    canvasSize: number
  ): Promise<Texture> {
    try {
      const { TYPES } = await import("$lib/shared/inversify/types");
      const { resolve } = await import("$lib/shared/inversify/di");
      const { GridMode } = await import(
        "$lib/shared/pictograph/grid/domain/enums/grid-enums"
      );
      const svgGenerator = resolve<ISVGGenerator>(TYPES.ISVGGenerator);

      // Convert gridMode string to GridMode enum
      const gridModeEnum =
        GridMode[gridMode.toUpperCase() as keyof typeof GridMode] ||
        GridMode.DIAMOND;

      const gridSvg = svgGenerator.generateGridSvg(gridModeEnum);

      // CRITICAL: Create new texture BEFORE destroying old one
      // This prevents race condition where renderScene uses destroyed texture
      const newTexture = await this.createTextureFromSVG(
        gridSvg,
        canvasSize,
        canvasSize
      );

      // Now safe to destroy old texture and swap
      const oldTexture = this.gridTexture;
      this.gridTexture = newTexture;
      oldTexture?.destroy(true);

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

      // Validate texture has content by checking if canvas has pixels
      const source = this.glyphTexture.source;
      const resource = source.resource as any;
      let hasContent = false;

      if (resource?.source) {
        const canvas = resource.source as HTMLCanvasElement;
        if (canvas instanceof HTMLCanvasElement) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Check a small region where the glyph should be (bottom-left)
            // Glyph at x=50, y=800 in 952px viewBox = x=100, y=1600 in 1900px texture
            const imageData = ctx.getImageData(100, 1600, 50, 50);
            const pixels = imageData.data;
            // Check if any pixel has non-zero alpha
            for (let i = 3; i < pixels.length; i += 4) {
              const alpha = pixels[i];
              if (alpha !== undefined && alpha > 0) {
                hasContent = true;
                break;
              }
            }
          }
        }
      }

      debug.log("Glyph texture created:", {
        textureWidth: this.glyphTexture.width,
        textureHeight: this.glyphTexture.height,
        sourceWidth: this.glyphTexture.source.width,
        sourceHeight: this.glyphTexture.source.height,
        hasContent,
      });

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

      img.onerror = () => {
        console.error("Image load error");
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

  getSecondaryBluePropTexture(): Texture | null {
    return this.secondaryBluePropTexture;
  }

  getSecondaryRedPropTexture(): Texture | null {
    return this.secondaryRedPropTexture;
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
      this.secondaryBluePropTexture?.destroy(true);
      this.secondaryRedPropTexture?.destroy(true);
      this.gridTexture?.destroy(true);
      this.glyphTexture?.destroy(true);
      this.previousGlyphTexture?.destroy(true);
    } catch (_e) {
      // Ignore texture destroy errors
    }

    this.bluePropTexture = null;
    this.redPropTexture = null;
    this.secondaryBluePropTexture = null;
    this.secondaryRedPropTexture = null;
    this.gridTexture = null;
    this.glyphTexture = null;
    this.previousGlyphTexture = null;
  }
}
