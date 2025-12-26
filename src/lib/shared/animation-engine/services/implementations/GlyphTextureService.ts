/**
 * Glyph Texture Service Implementation
 *
 * Manages glyph texture loading for AnimatorCanvas.
 * Handles queuing glyphs when renderer isn't ready yet.
 */

import type { IAnimationRenderer } from "$lib/features/compose/services/contracts/IAnimationRenderer";
import type {
  IGlyphTextureService,
  PendingGlyph,
  GlyphLoadCompleteCallback,
} from "../contracts/IGlyphTextureService";

export class GlyphTextureService implements IGlyphTextureService {
  private renderer: IAnimationRenderer | null = null;
  private pendingGlyph: PendingGlyph | null = null;
  private onLoadComplete: GlyphLoadCompleteCallback | null = null;

  initialize(renderer: IAnimationRenderer): void {
    this.renderer = renderer;
  }

  setLoadCompleteCallback(callback: GlyphLoadCompleteCallback): void {
    this.onLoadComplete = callback;
  }

  handleGlyphSvgReady(
    svgString: string,
    width: number,
    height: number,
    _x: number,
    _y: number
  ): void {
    // When called as callback, we assume renderer is initialized if it exists
    this.loadGlyphTexture(svgString, width, height, this.renderer !== null);
  }

  async loadGlyphTexture(
    svgString: string,
    width: number,
    height: number,
    isInitialized: boolean
  ): Promise<void> {
    // Guard: must be initialized before loading textures
    if (!this.renderer || !isInitialized) {
      // Queue for later if not initialized yet
      this.pendingGlyph = { svgString, width, height };
      return;
    }

    try {
      await this.renderer.loadGlyphTexture(svgString, width, height);
      this.pendingGlyph = null; // Clear any pending
      this.onLoadComplete?.();
    } catch (err) {
      console.error("[GlyphTextureService] Failed to load glyph texture:", err);
    }
  }

  getPendingGlyph(): PendingGlyph | null {
    return this.pendingGlyph;
  }

  async processPendingGlyph(): Promise<void> {
    if (this.pendingGlyph && this.renderer) {
      const { svgString, width, height } = this.pendingGlyph;
      await this.loadGlyphTexture(svgString, width, height, true);
    }
  }

  dispose(): void {
    this.renderer = null;
    this.pendingGlyph = null;
    this.onLoadComplete = null;
  }
}
