/**
 * Sequence Service Interfaces
 *
 * Interfaces for sequence management, creation, updates, and domain logic.
 * This includes both service contracts and related data structures.
 *
 * Also includes page layout services for printable word card creation.
 */

import type { BeatData, SequenceCreateRequest, SequenceData, ValidationResult } from "$shared";
import type { DPIConfiguration, GridCalculationOptions, LayoutCalculationRequest, LayoutCalculationResult, LayoutValidationResult, PageCreationOptions, PageDimensions, PageLayoutConfig, PageMargins, PageOrientation, Rectangle, WordCardGridConfig, WordCardPaperSize } from "$wordcard";
import type { Page } from "@sveltejs/kit";

// ============================================================================
// SERVICE CONTRACTS (Behavioral Interfaces)
// ============================================================================

export interface ISequenceService {
  createSequence(request: SequenceCreateRequest): Promise<SequenceData>;
  updateBeat(
    sequenceId: string,
    beatIndex: number,
    beatData: BeatData
  ): Promise<void>;
  getSequence(id: string): Promise<SequenceData | null>;
  getAllSequences(): Promise<SequenceData[]>;
}

// ISequenceDeletionService moved to sequence-toolkit


export interface ISequenceImportService {
  importFromPNG(id: string): Promise<SequenceData | null>;
  convertPngMetadata(id: string, metadata: unknown[]): Promise<SequenceData>;
}


export interface ISequenceDomainService {
  validateCreateRequest(request: SequenceCreateRequest): ValidationResult;
  createSequence(request: SequenceCreateRequest): SequenceData;
  updateBeat(
    sequence: SequenceData,
    beatIndex: number,
    beatData: BeatData
  ): SequenceData;
  calculateSequenceWord(sequence: SequenceData): string;
}

export interface IPersistenceService {
  saveSequence(sequence: SequenceData): Promise<void>;
  loadSequence(id: string): Promise<SequenceData | null>;
  loadAllSequences(): Promise<SequenceData[]>;
  deleteSequence(id: string): Promise<void>;
}

export interface IWordCardExportIntegrationService {
  /**
   * Export all visible printable pages as image files
   */
  exportPrintablePagesAsImages(
    options?: {
      format?: "PNG" | "JPEG" | "WebP";
      quality?: number;
      scale?: number;
      filenamePrefix?: string;
    },
    onProgress?: (current: number, total: number, message: string) => void
  ): Promise<{ successCount: number; failureCount: number; errors: Error[] }>;

  /**
   * Export selected pages by their indices
   */
  exportSelectedPages(
    pageIndices: number[],
    options?: {
      format?: "PNG" | "JPEG" | "WebP";
      quality?: number;
      scale?: number;
      filenamePrefix?: string;
    },
    onProgress?: (current: number, total: number, message: string) => void
  ): Promise<{ successCount: number; failureCount: number; errors: Error[] }>;

  /**
   * Get printable page elements from the DOM
   */
  getPrintablePageElements(): HTMLElement[];

  /**
   * Validate that export is possible (pages exist, browser supports export)
   */
  validateExportCapability(): {
    canExport: boolean;
    pageCount: number;
    issues: string[];
  };

  /**
   * Cancel any ongoing export operation
   */
  cancelExport(): void;

  /**
   * Get default export options
   */
  getDefaultExportOptions(): {
    format: "PNG" | "JPEG" | "WebP";
    quality: number;
    scale: number;
    filenamePrefix: string;
  };
}
