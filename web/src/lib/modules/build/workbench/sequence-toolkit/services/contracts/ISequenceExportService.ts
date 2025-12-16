/**
 * Sequence Export Service Contract
 * 
 * Defines interface for sequence export operations like JSON export and dictionary addition.
 * These operations handle exporting sequence data in various formats.
 */

import type { SequenceData } from "$shared";

export interface ISequenceExportService {
  /**
   * Export sequence as JSON string
   * @param sequence - The sequence to export
   * @returns JSON string representation of the sequence
   */
  exportAsJson(sequence: SequenceData): string;

  /**
   * Copy sequence JSON to clipboard
   * @param sequence - The sequence to copy
   * @returns Promise that resolves when copy is complete
   */
  copyJsonToClipboard(sequence: SequenceData): Promise<void>;

  /**
   * Add sequence to dictionary/library
   * @param sequence - The sequence to add to dictionary
   * @returns Promise that resolves when sequence is added
   */
  addToDictionary(sequence: SequenceData): Promise<void>;

  /**
   * Export sequence for fullscreen display
   * @param sequence - The sequence to display
   * @returns Promise that resolves when fullscreen is activated
   */
  exportToFullscreen(sequence: SequenceData): Promise<void>;

  /**
   * Prepare sequence data for export with validation
   * @param sequence - The sequence to prepare
   * @returns Validated and formatted sequence data
   */
  prepareForExport(sequence: SequenceData): SequenceData;
}
