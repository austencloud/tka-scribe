/**
 * Main Image Export Service Interface
 * 
 * Primary interface for exporting TKA sequences as images.
 * Provides the main API that matches desktop functionality exactly.
 */

import type { SequenceData } from '$shared';
import type { SequenceExportOptions } from '../../domain/models';

export interface IImageExportService {
  /**
   * Export a complete sequence as an image blob
   * Main export method - equivalent to desktop ImageExportManager.export_image_directly()
   */
  exportSequenceImage(
    sequence: SequenceData,
    options?: Partial<SequenceExportOptions>
  ): Promise<Blob>;

  /**
   * Generate a preview image (smaller scale for UI)
   * Returns data URL for immediate display in components
   */
  generatePreview(
    sequence: SequenceData,
    options?: Partial<SequenceExportOptions>
  ): Promise<string>;

  /**
   * Export and download image file directly
   * Triggers browser download - equivalent to desktop save dialog
   */
  exportAndDownload(
    sequence: SequenceData,
    filename?: string,
    options?: Partial<SequenceExportOptions>
  ): Promise<void>;

  /**
   * Validate sequence and options before export
   * Returns validation result with specific error messages
   */
  validateExport(
    sequence: SequenceData,
    options: SequenceExportOptions
  ): { valid: boolean; errors: string[] };

  /**
   * Get default export options
   * Returns desktop-compatible default settings
   */
  getDefaultOptions(): SequenceExportOptions;

  /**
   * Export sequence as canvas (for internal use)
   * Returns canvas element for further processing
   */
  exportSequence(sequence: SequenceData, options: SequenceExportOptions): Promise<HTMLCanvasElement>;

  /**
   * Batch export multiple sequences
   * For compatibility with TKA service
   */
  batchExport?(sequences: SequenceData[], options: SequenceExportOptions): Promise<HTMLCanvasElement[]>;
}
