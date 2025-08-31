/**
 * TKA Image Format Domain Types
 *
 * Domain models for image format conversion, optimization, and export.
 * Consolidates image format types from across the TKA system.
 */

// ============================================================================
// IMAGE FORMAT CONFIGURATION
// ============================================================================

/**
 * Comprehensive image format options
 * Consolidates ImageFormatOptions, CanvasExportOptions, and ImageExportOptions
 */
export interface ImageFormatOptions {
  format: "PNG" | "JPEG" | "WEBP";
  quality: number; // 0-1, only used for JPEG/WEBP
  optimize: boolean;
  backgroundColor?: string;
  width?: number;
  height?: number;
  scale?: number; // Device pixel ratio multiplier
}

/**
 * Image optimization settings for different use cases
 */
export interface OptimizationSettings {
  useCase: "web" | "print" | "archive";
  maxFileSize?: number; // bytes
  preserveQuality?: boolean;
  compressionLevel?: number; // 0-9
}

// ============================================================================
// CONVERSION RESULTS AND METRICS
// ============================================================================

/**
 * Metrics collected during image conversion
 */
export interface ConversionMetrics {
  originalSize: number; // bytes
  compressedSize: number; // bytes
  compressionRatio: number; // 0-1
  processingTime: number; // ms
  format: string;
  dimensions: { width: number; height: number };
}

/**
 * Result of image format conversion operation
 */
export interface ConversionResult {
  success: boolean;
  blob?: Blob;
  dataURL?: string;
  error?: string;
  metrics: ConversionMetrics;
}

// ============================================================================
// LEGACY COMPATIBILITY TYPES
// ============================================================================

/**
 * @deprecated Use ImageFormatOptions instead
 * Kept for backward compatibility with existing canvas export code
 */
export interface CanvasExportOptions {
  format: "PNG" | "JPEG" | "WebP";
  quality: number; // 0-1 for JPEG/WebP
  backgroundColor?: string;
}

/**
 * @deprecated Use ImageFormatOptions instead
 * Kept for backward compatibility with sequence card export code
 */
export interface ImageExportOptions {
  format: "PNG" | "JPEG" | "WebP";
  quality: number; // 0-1 for JPEG/WebP
  width?: number;
  height?: number;
  scale: number; // Device pixel ratio multiplier
  backgroundColor?: string;
}
