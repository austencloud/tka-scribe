/**
 * TKA Image Export Core Interfaces
 *
 * Core service contracts and types for the TKA image export system.
 * Contains the main orchestrator service and fundamental configuration types.
 */

import type { SequenceData } from "./domain-types";

// ============================================================================
// EXPORT OPTIONS AND CONFIGURATION
// ============================================================================

export interface TKAImageExportOptions {
  // Core export settings (match desktop defaults)
  includeStartPosition: boolean;
  addBeatNumbers: boolean;
  addReversalSymbols: boolean;
  addUserInfo: boolean;
  addWord: boolean;
  combinedGrids: boolean;
  addDifficultyLevel: boolean;

  // Scaling and sizing
  beatScale: number;
  beatSize: number;
  margin: number;

  // Visibility settings
  redVisible: boolean;
  blueVisible: boolean;

  // User information
  userName: string;
  exportDate: string;
  notes: string;

  // Output format
  format: "PNG" | "JPEG";
  quality: number; // 0-1 for JPEG
}

export interface BeatRenderOptions {
  addBeatNumbers: boolean;
  redVisible: boolean;
  blueVisible: boolean;
  combinedGrids: boolean;
  beatScale: number;
}

export interface TextRenderOptions {
  margin: number;
  beatScale: number;
  additionalHeightTop?: number;
  additionalHeightBottom?: number;
}

export interface CompositionOptions extends TKAImageExportOptions {
  layout: [number, number]; // [columns, rows]
  additionalHeightTop: number;
  additionalHeightBottom: number;
}

export interface UserInfo {
  userName: string;
  notes: string;
  exportDate: string;
}

export interface LayoutData {
  columns: number;
  rows: number;
  beatSize: number;
  includeStartPosition: boolean;
  additionalHeightTop: number;
  additionalHeightBottom: number;
}

// ============================================================================
// MAIN IMAGE EXPORT SERVICE
// ============================================================================

/**
 * Main orchestrator for TKA image export operations
 * Equivalent to desktop ImageExportManager
 */
export interface ITKAImageExportService {
  /**
   * Export a complete sequence as an image blob
   */
  exportSequenceImage(
    sequence: SequenceData,
    options?: Partial<TKAImageExportOptions>
  ): Promise<Blob>;

  /**
   * Generate a preview image (smaller scale for UI)
   */
  generatePreview(
    sequence: SequenceData,
    options?: Partial<TKAImageExportOptions>
  ): Promise<string>; // Returns data URL

  /**
   * Export and download image file directly
   */
  exportAndDownload(
    sequence: SequenceData,
    filename?: string,
    options?: Partial<TKAImageExportOptions>
  ): Promise<void>;

  /**
   * Export multiple sequences as a batch
   */
  batchExport(
    sequences: SequenceData[],
    options?: Partial<TKAImageExportOptions>,
    progressCallback?: (current: number, total: number) => void
  ): Promise<void>;

  /**
   * Validate sequence and options before export
   */
  validateExport(
    sequence: SequenceData,
    options: TKAImageExportOptions
  ): { valid: boolean; errors: string[] };

  /**
   * Get default export options
   */
  getDefaultOptions(): TKAImageExportOptions;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ExportProgress {
  stage: "validation" | "rendering" | "composition" | "export" | "complete";
  progress: number; // 0-100
  message: string;
  currentBeat?: number;
  totalBeats?: number;
}

export interface ExportError extends Error {
  stage: string;
  details?: unknown;
}

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  filename: string;
  error?: ExportError;
  metadata: {
    format: string;
    size: number;
    dimensions: { width: number; height: number };
    beatCount: number;
    processingTime: number;
  };
}

export interface RenderQualitySettings {
  antialiasing: boolean;
  smoothScaling: boolean;
  highResolution: boolean;
  textQuality: "low" | "medium" | "high";
}

export interface LayoutConstraints {
  maxColumns: number;
  maxRows: number;
  minBeatSize: number;
  maxBeatSize: number;
  aspectRatio?: number;
}

// ============================================================================
// SERVICE INTERFACE SYMBOLS
// ============================================================================

export const ITKAImageExportServiceInterface = Symbol.for(
  "ITKAImageExportService"
);
