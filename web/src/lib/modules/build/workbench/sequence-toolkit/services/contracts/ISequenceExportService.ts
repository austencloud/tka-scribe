/**
 * Sequence Export Service Contract
 * 
 * Defines interface for sequence export operations with various options and formats.
 * These operations handle exporting sequence data as images with configurable parameters.
 */

import type { ExportResult, SequenceData } from "$shared";
import type { SequenceExportOptions } from "../../../../export/domain/models";


export interface ISequenceExportService {
  /**
   * Export sequence with full result information
   * @param sequence - The sequence to export
   * @param options - Export configuration options
   * @returns Promise that resolves to export result with success status, assets, and any errors/warnings
   */
  exportSequence(sequence: SequenceData, options: SequenceExportOptions): Promise<ExportResult>;

  /**
   * Export sequence as blob
   * @param sequence - The sequence to export
   * @param options - Export configuration options
   * @returns Promise that resolves to blob representation
   */
  exportSequenceAsBlob(sequence: SequenceData, options: SequenceExportOptions): Promise<Blob>;

  /**
   * Export sequence as data URL
   * @param sequence - The sequence to export
   * @param options - Export configuration options
   * @returns Promise that resolves to data URL string
   */
  exportSequenceAsDataUrl(sequence: SequenceData, options: SequenceExportOptions): Promise<string>;

  /**
   * Validate export options
   * @param options - Export options to validate
   * @returns Validation result with errors and warnings
   */
  validateExportOptions(options: SequenceExportOptions): { isValid: boolean; errors: string[]; warnings: string[] };
}
