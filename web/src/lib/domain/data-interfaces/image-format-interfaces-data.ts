/**
 * Image Format Conversion Service Interfaces
 *
 * Service contracts for converting Canvas to various image formats.
 * Consolidates the canvas-to-blob/dataURL logic that was duplicated
 * across FileExportService, SequenceCardImageConversionService,
 * PageImageExportService, and others.
 */

// ============================================================================
// DATA CONTRACTS (Domain Models)
// ============================================================================

export interface ImageFormatOptions {
  format: "PNG" | "JPEG" | "WEBP";
  quality: number; // 0-1, only used for JPEG/WEBP
  optimize: boolean;
}

export interface OptimizationSettings {
  useCase: "web" | "print" | "archive";
  maxFileSize?: number; // bytes
  preserveQuality?: boolean;
  compressionLevel?: number; // 0-9
}

export interface ConversionMetrics {
  originalSize: number; // bytes
  compressedSize: number; // bytes
  compressionRatio: number; // 0-1
  processingTime: number; // ms
  format: string;
  dimensions: { width: number; height: number };
}

export interface ConversionResult {
  success: boolean;
  blob?: Blob;
  dataURL?: string;
  error?: string;
  metrics: ConversionMetrics;
}
