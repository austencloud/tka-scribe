/**
 * Image Export Service - Main Implementation
 * 
 * Primary service for exporting TKA sequences as images.
 * Equivalent to desktop ImageExportManager - orchestrates all export operations.
 */

import type { SequenceData } from '$shared';
import { TYPES } from '$shared';
import { inject, injectable } from 'inversify';
import type { SequenceExportOptions } from '../../domain/models';
import type {
  IDimensionCalculationService,
  IFileExportService,
  IImageCompositionService,
  IImageExportService,
  ILayoutCalculationService
} from '../contracts';

@injectable()
export class ImageExportService implements IImageExportService {
  constructor(
    @inject(TYPES.IImageCompositionService)
    private compositionService: IImageCompositionService,
    @inject(TYPES.IFileExportService) 
    private fileService: IFileExportService,
    @inject(TYPES.ILayoutCalculationService)
    private layoutService: ILayoutCalculationService,
    @inject(TYPES.IDimensionCalculationService)
    private dimensionService: IDimensionCalculationService
  ) {}

  /**
   * Export a complete sequence as an image blob
   * Main entry point - equivalent to desktop ImageExportManager.export_image_directly()
   */
  async exportSequenceImage(
    sequence: SequenceData,
    options: Partial<SequenceExportOptions> = {}
  ): Promise<Blob> {
    if (!sequence) {
      throw new Error('Sequence data is required for export');
    }

    // Merge with defaults to get complete options
    const fullOptions = this.mergeWithDefaults(options);

    // Validate export parameters
    const validation = this.validateExport(sequence, fullOptions);
    if (!validation.valid) {
      throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      // Compose the image using the composition service
      const canvas = await this.compositionService.composeSequenceImage(
        sequence,
        fullOptions
      );

      // Convert to blob using the file service
      const blob = await this.fileService.canvasToBlob(
        canvas,
        fullOptions.format,
        fullOptions.quality
      );

      return blob;
    } catch (error) {
      throw new Error(
        `Image export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate a preview image (smaller scale for UI)
   * Returns data URL for immediate display
   */
  async generatePreview(
    sequence: SequenceData,
    options: Partial<SequenceExportOptions> = {}
  ): Promise<string> {
    if (!sequence) {
      throw new Error('Sequence data is required for preview');
    }

    try {
      // Create preview options with smaller scale
      const previewOptions = this.createPreviewOptions(options);

      // Compose preview image
      const canvas = await this.compositionService.composeSequenceImage(
        sequence,
        previewOptions
      );

      // Convert to data URL for immediate display
      return this.fileService.canvasToDataURL(canvas, previewOptions.format, previewOptions.quality);
    } catch (error) {
      throw new Error(
        `Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Export and download image file directly
   * Triggers browser download - equivalent to desktop save dialog
   */
  async exportAndDownload(
    sequence: SequenceData,
    filename?: string,
    options: Partial<SequenceExportOptions> = {}
  ): Promise<void> {
    if (!sequence) {
      throw new Error('Sequence data is required for export and download');
    }

    try {
      // Generate the image blob
      const blob = await this.exportSequenceImage(sequence, options);

      // Generate filename if not provided
      const finalFilename = filename || this.generateDefaultFilename(sequence, options);

      // Download the file
      await this.fileService.downloadBlob(blob, finalFilename);
    } catch (error) {
      throw new Error(
        `Export and download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate sequence and options before export
   * Returns validation result with specific error messages
   */
  validateExport(
    sequence: SequenceData,
    options: SequenceExportOptions
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate sequence
    if (!sequence) {
      errors.push('Sequence data is required');
    } else {
      if (!sequence.beats) {
        errors.push('Sequence must have beats array');
      } else if (sequence.beats.length === 0 && !options.includeStartPosition) {
        errors.push('Empty sequence requires start position to be included');
      } else if (sequence.beats.length > 64) {
        errors.push('Sequence has too many beats (maximum 64)');
      }

      if (options.addWord && (!sequence.word || sequence.word.trim().length === 0)) {
        errors.push('Sequence word is required when "add word" is enabled');
      }
    }

    // Validate options
    if (!options) {
      errors.push('Export options are required');
    } else {
      if (options.beatScale <= 0 || options.beatScale > 5) {
        errors.push('Beat scale must be between 0.1 and 5');
      }

      if (options.beatSize <= 0 || options.beatSize > 1000) {
        errors.push('Beat size must be between 1 and 1000 pixels');
      }

      if (options.margin < 0 || options.margin > 200) {
        errors.push('Margin must be between 0 and 200 pixels');
      }

      if (options.quality < 0 || options.quality > 1) {
        errors.push('Quality must be between 0 and 1');
      }

      if (!['PNG', 'JPEG'].includes(options.format)) {
        errors.push('Format must be PNG or JPEG');
      }

      if (options.addUserInfo && !options.userName) {
        errors.push('User name is required when "add user info" is enabled');
      }
    }

    // Validate memory requirements
    if (sequence && options) {
      const memoryEstimate = this.estimateMemoryUsage(sequence, options);
      if (memoryEstimate.estimatedMB > 200) {
        errors.push(
          `Image would require ${Math.round(memoryEstimate.estimatedMB)}MB memory (limit: 200MB)`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get default export options
   * Returns desktop-compatible default settings
   */
  getDefaultOptions(): SequenceExportOptions {
    return {
      // Core export settings (match desktop defaults)
      includeStartPosition: true,
      addBeatNumbers: true,
      addReversalSymbols: true,
      addUserInfo: true,
      addWord: true,
      combinedGrids: false,
      addDifficultyLevel: false,

      // Scaling and sizing
      beatScale: 1.0,
      beatSize: 144, // Match desktop base beat size
      margin: 50, // Match desktop base margin

      // Visibility settings
      redVisible: true,
      blueVisible: true,

      // User information
      userName: 'TKA User',
      exportDate: new Date()
        .toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        })
        .replace(/\//g, '-'),
      notes: 'Created using The Kinetic Alphabet',

      // Output format
      format: 'PNG',
      quality: 1.0, // Maximum quality
      scale: 1.0, // Default scale
    };
  }

  /**
   * Merge provided options with defaults
   */
  private mergeWithDefaults(options: Partial<SequenceExportOptions>): SequenceExportOptions {
    const defaults = this.getDefaultOptions();
    return { ...defaults, ...options };
  }

  /**
   * Create preview-optimized options
   */
  private createPreviewOptions(options: Partial<SequenceExportOptions>): SequenceExportOptions {
    const baseOptions = this.mergeWithDefaults(options);

    return {
      ...baseOptions,
      beatScale: baseOptions.beatScale * 0.5, // Smaller scale for preview
      quality: 0.8, // Lower quality for faster generation
      // Disable expensive features for preview
      addReversalSymbols: false,
      combinedGrids: false,
    };
  }

  /**
   * Generate default filename for export
   */
  private generateDefaultFilename(
    sequence: SequenceData,
    options: Partial<SequenceExportOptions>
  ): string {
    const word = sequence.word || 'sequence';
    const format = options.format || 'PNG';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    
    // Sanitize word for filename
    const sanitizedWord = word
      .replace(/[^a-zA-Z0-9\-_\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

    return `${sanitizedWord}-${timestamp}.${format.toLowerCase()}`;
  }

  /**
   * Estimate memory usage for export
   */
  private estimateMemoryUsage(
    sequence: SequenceData,
    options: SequenceExportOptions
  ): { estimatedMB: number; safe: boolean } {
    const beatCount = sequence.beats.length;

    // Calculate layout and dimensions
    const [columns, rows] = this.layoutService.calculateLayout(
      beatCount,
      options.includeStartPosition
    );

    const [additionalTop, additionalBottom] = this.dimensionService.determineAdditionalHeights(
      options,
      beatCount,
      options.beatScale
    );

    const [width, height] = this.layoutService.calculateImageDimensions(
      [columns, rows],
      additionalTop + additionalBottom,
      options.beatScale
    );

    // Estimate memory usage
    const mainCanvasBytes = width * height * 4; // RGBA
    const beatCanvasBytes = beatCount * (options.beatSize * options.beatScale) ** 2 * 4;
    const totalBytes = mainCanvasBytes + beatCanvasBytes * 2; // 2x for processing overhead

    const estimatedMB = totalBytes / (1024 * 1024);
    const safe = estimatedMB < 200; // 200MB conservative limit

    return { estimatedMB, safe };
  }

  /**
   * Export sequence as canvas (for internal use)
   */
  async exportSequence(sequence: SequenceData, options: SequenceExportOptions): Promise<HTMLCanvasElement> {
    // This is the main canvas generation method
    const beatCount = sequence.beats.length;

    // Calculate layout
    const [columns, rows] = this.layoutService.calculateLayout(
      beatCount,
      options.includeStartPosition
    );

    // Calculate dimensions
    const [additionalTop, additionalBottom] = this.dimensionService.determineAdditionalHeights(
      options,
      beatCount,
      options.beatScale
    );

    const [width, height] = this.layoutService.calculateImageDimensions(
      [columns, rows],
      additionalTop + additionalBottom,
      options.beatScale
    );

    // Create main canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // Use composition service to render the sequence
    const composedCanvas = await this.compositionService.composeSequenceImage(
      sequence,
      options
    );

    // Copy the composed canvas to our target canvas
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(composedCanvas, 0, 0);

    return canvas;
  }

  /**
   * Batch export multiple sequences
   */
  async batchExport(sequences: SequenceData[], options: SequenceExportOptions): Promise<HTMLCanvasElement[]> {
    const results: HTMLCanvasElement[] = [];

    for (const sequence of sequences) {
      try {
        const canvas = await this.exportSequence(sequence, options);
        results.push(canvas);
      } catch (error) {
        console.error(`Failed to export sequence ${sequence.id}:`, error);
        // Create error canvas
        const errorCanvas = document.createElement('canvas');
        errorCanvas.width = 400;
        errorCanvas.height = 300;
        const ctx = errorCanvas.getContext('2d')!;
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Export Error', 200, 150);
        results.push(errorCanvas);
      }
    }

    return results;
  }
}
