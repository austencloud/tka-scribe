/**
 * Word Card Export Config Types
 *
 * Domain types for exporting sequence cards as images and PDF documents.
 * These types are specific to word card export functionality.
 */

// ============================================================================
// IMAGE EXPORT CONFIGURATION
// ============================================================================

export interface ExportOptions {
  format: "PNG" | "JPEG" | "WebP" | "PDF";
  quality: number; // 0-1 for JPEG/WebP
  width?: number;
  height?: number;
  scale: number; // Device pixel ratio multiplier
  backgroundColor?: string;
  enableMetadata?: boolean;
  filename?: string;
}

export interface ImageExportOptions {
  format: "PNG" | "JPEG" | "WebP";
  quality: number; // 0-1 for JPEG/WebP
  width?: number;
  height?: number;
  scale: number; // Device pixel ratio multiplier
  backgroundColor?: string;
}

// ============================================================================
// PDF EXPORT CONFIGURATION
// ============================================================================

export interface PDFExportOptions {
  orientation: "portrait" | "landscape";
  paperSize: "A4" | "Letter" | "Legal" | "Tabloid";
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  enablePageNumbers: boolean;
  quality: "low" | "medium" | "high";
}

// ============================================================================
// BATCH EXPORT CONFIGURATION
// ============================================================================

export interface WordCardBatchExportOptions {
  batchSize: number;
  enableProgressReporting: boolean;
  memoryOptimization: boolean;
  filenameTemplate: string; // e.g., "sequence-cards-{pageNumber}.pdf"
  outputFormat: "individual" | "combined";
}

// ============================================================================
// EXPORT RESULT TYPES
// ============================================================================

// Extended result with additional service-level metadata
export interface WordCardExportResultWithMetadata extends WordCardExportResult {
  fileName?: string;
  mimeType?: string;
  warnings?: string[];
  // Note: metadata is inherited from WordCardExportResult with proper structure
}

export interface BatchExportResult {
  success: boolean;
  results: WordCardExportResultWithMetadata[];
  totalProcessingTime: number;
  successCount: number;
  failureCount: number;
  totalPages?: number; // Optional for page-specific exports
  errors: Error[] | Array<{ sequenceId: string; error: Error }>; // Support both formats
}

// Note: ExportProgress is now imported from build/image-export/core
// to avoid duplication across the domain

// ============================================================================
// ENHANCED EXPORT RESULT TYPES (from export-config-interfaces.ts)
// ============================================================================

// Extended service-level export result with additional metadata
export interface ServiceExportResult extends WordCardExportResult {
  conversionStartTime: number;
  // Note: filename and metadata are inherited from WordCardExportResult
}

// ============================================================================
// EXPORT PROGRESS TRACKING
// ============================================================================

export interface ExportProgressData {
  currentStep: number;
  totalSteps: number;
  stepDescription: string;
  percentComplete: number;
  estimatedTimeRemaining?: number;
  itemsProcessed: number;
  totalItems: number;
}

export interface ExportBatchProgress extends ExportProgressData {
  currentBatch: number;
  totalBatches: number;
  currentBatchSize: number;
  failedItems: number;
  skippedItems: number;
}

/**
 * Word Card Export Service Inteexport interface BatchExportProgress extends ProgressInfo {
 * Clean, focused service contracts for word card image generation.
 * Follows single responsibility principle and TKA DI patterns.
 */
// ============================================================================
// CORE TYPES
// ============================================================================

// ============================================================================
// DATA CONTRACTS (Domain Models)
// ============================================================================

export interface WordCardDimensions {
  width: number;
  height: number;
  scale?: number; // Device pixel ratio multiplier
}

export interface WordCardMetadata {
  title?: string;
  author?: string;
  beatNumbers?: boolean;
  timestamp?: boolean;
  backgroundColor?: string;
}

// BatchOperationConfig is now imported from shared domain

export interface ExportMetrics {
  processingTime: number;
  fileSize: number;
  resolution: { width: number; height: number };
  memoryUsage?: number;
}

// BatchExportProgress is now imported from shared domain

export interface WordCardExportResult {
  sequenceId: string;
  success: boolean;
  blob?: Blob;
  error?: Error;
  metrics?: ExportMetrics;
}
