/**
 * Image Preview Generator Service
 *
 * Generates preview images for export operations.
 */

import { injectable, inject } from "inversify";
import { TYPES } from "$shared";
import type { SequenceData } from "$shared";
import type { SequenceExportOptions } from "../../domain/models";
import type { IImageExportService } from "../contracts";

export interface PreviewOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "PNG" | "JPEG" | "WebP";
}

export interface PreviewResult {
  canvas: HTMLCanvasElement;
  dataUrl: string;
  blob: Blob;
  dimensions: { width: number; height: number };
}

export interface IImagePreviewGenerator {
  generatePreview(sequence: SequenceData, options: SequenceExportOptions, previewOptions?: PreviewOptions): Promise<PreviewResult>;
  generateThumbnail(sequence: SequenceData, size?: number): Promise<PreviewResult>;
  scaleCanvas(sourceCanvas: HTMLCanvasElement, maxWidth: number, maxHeight: number): HTMLCanvasElement;
}

@injectable()
export class ImagePreviewGenerator implements IImagePreviewGenerator {
  constructor(
    @inject(TYPES.ITKAImageExportService) private imageExportService: IImageExportService
  ) {}

  async generatePreview(
    sequence: SequenceData, 
    options: SequenceExportOptions, 
    previewOptions: PreviewOptions = {}
  ): Promise<PreviewResult> {
    const {
      maxWidth = 800,
      maxHeight = 600,
      quality = 0.8,
      format = "PNG"
    } = previewOptions;

    // Generate full-size image
    const fullCanvas = await this.imageExportService.exportSequence(sequence, options);

    // Scale down for preview
    const previewCanvas = this.scaleCanvas(fullCanvas, maxWidth, maxHeight);

    // Generate data URL
    const dataUrl = previewCanvas.toDataURL(`image/${format.toLowerCase()}`, quality);

    // Generate blob
    const blob = await new Promise<Blob>((resolve) => {
      previewCanvas.toBlob((blob) => {
        resolve(blob!);
      }, `image/${format.toLowerCase()}`, quality);
    });

    return {
      canvas: previewCanvas,
      dataUrl,
      blob,
      dimensions: {
        width: previewCanvas.width,
        height: previewCanvas.height
      }
    };
  }

  async generateThumbnail(sequence: SequenceData, size: number = 200): Promise<PreviewResult> {
    // Use minimal export options for thumbnail
    const thumbnailOptions: SequenceExportOptions = {
      includeStartPosition: true,
      addBeatNumbers: false,
      addReversalSymbols: false,
      addUserInfo: false,
      addWord: false,
      combinedGrids: false,
      addDifficultyLevel: false,
      beatScale: 0.5, // Smaller scale for thumbnail
      beatSize: 72, // Smaller beat size
      margin: 10, // Smaller margin
      redVisible: true,
      blueVisible: true,
      userName: '',
      exportDate: '',
      notes: '',
      format: "PNG",
      quality: 0.8,
      scale: 1.0
    };

    return this.generatePreview(sequence, thumbnailOptions, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.8,
      format: "PNG"
    });
  }

  scaleCanvas(sourceCanvas: HTMLCanvasElement, maxWidth: number, maxHeight: number): HTMLCanvasElement {
    const { width: sourceWidth, height: sourceHeight } = sourceCanvas;

    // Calculate scale factor to fit within max dimensions
    const scaleX = maxWidth / sourceWidth;
    const scaleY = maxHeight / sourceHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

    const targetWidth = Math.floor(sourceWidth * scale);
    const targetHeight = Math.floor(sourceHeight * scale);

    // Create scaled canvas
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = targetWidth;
    scaledCanvas.height = targetHeight;

    const ctx = scaledCanvas.getContext('2d')!;
    
    // Use high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw scaled image
    ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);

    return scaledCanvas;
  }
}
