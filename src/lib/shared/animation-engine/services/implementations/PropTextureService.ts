/**
 * Prop Texture Service Implementation
 *
 * Handles prop texture loading for AnimatorCanvas.
 * Loads textures and retrieves dimensions for both prop colors.
 */

import type { IPixiAnimationRenderer } from "$lib/features/compose/services/contracts/IPixiAnimationRenderer";
import type { ISVGGenerator } from "$lib/features/compose/services/contracts/ISVGGenerator";
import type { ITrailCaptureService } from "$lib/features/compose/services/contracts/ITrailCaptureService";
import type {
  IPropTextureService,
  PropDimensions,
  DimensionsLoadedCallback,
  LoadCompleteCallback,
} from "../contracts/IPropTextureService";

export class PropTextureService implements IPropTextureService {
  private renderer: IPixiAnimationRenderer | null = null;
  private svgGenerator: ISVGGenerator | null = null;
  private trailCaptureService: ITrailCaptureService | null = null;
  private onDimensionsLoaded: DimensionsLoadedCallback | null = null;
  private onLoadComplete: LoadCompleteCallback | null = null;

  initialize(
    renderer: IPixiAnimationRenderer,
    svgGenerator: ISVGGenerator
  ): void {
    this.renderer = renderer;
    this.svgGenerator = svgGenerator;
  }

  setTrailCaptureService(service: ITrailCaptureService | null): void {
    this.trailCaptureService = service;
  }

  setDimensionsLoadedCallback(callback: DimensionsLoadedCallback): void {
    this.onDimensionsLoaded = callback;
  }

  setLoadCompleteCallback(callback: LoadCompleteCallback): void {
    this.onLoadComplete = callback;
  }

  async loadPropTextures(
    bluePropType: string,
    redPropType: string
  ): Promise<void> {
    if (!this.renderer || !this.svgGenerator) {
      console.warn(
        "[PropTextureService] Cannot load textures - renderer or svgGenerator not initialized"
      );
      return;
    }

    try {
      // Load textures for both prop colors
      await this.renderer.loadPerColorPropTextures(bluePropType, redPropType);

      // Get prop dimensions for each color (may be different types!)
      const [bluePropData, redPropData] = await Promise.all([
        this.svgGenerator.generateBluePropSvg(bluePropType),
        this.svgGenerator.generateRedPropSvg(redPropType),
      ]);

      const blueDimensions: PropDimensions = {
        width: bluePropData.width,
        height: bluePropData.height,
      };
      const redDimensions: PropDimensions = {
        width: redPropData.width,
        height: redPropData.height,
      };

      // Notify of new dimensions
      this.onDimensionsLoaded?.(blueDimensions, redDimensions);

      // Update trail capture service with new prop dimensions
      this.trailCaptureService?.updateConfig({
        bluePropDimensions: blueDimensions,
        redPropDimensions: redDimensions,
      });

      this.onLoadComplete?.();
    } catch (err) {
      console.error("[PropTextureService] Failed to load prop textures:", err);
    }
  }

  dispose(): void {
    this.renderer = null;
    this.svgGenerator = null;
    this.trailCaptureService = null;
    this.onDimensionsLoaded = null;
    this.onLoadComplete = null;
  }
}
