/**
 * Export and Sequence Card Service Interfaces
 *
 * Interfaces for exporting sequences, generating sequence cards,
 * and managing print layouts. This includes batch processing and caching.
 */

import type {
  SequenceData,
  ExportOptions,
  LayoutConfig,
  DeviceCapabilities,
  PrintLayoutOptions,
  SequenceCardExportSettings,
  CacheConfig,
  ProgressInfo,
  ExportResult,
  ValidationResult,
} from "./domain-types";

// ============================================================================
// BASIC EXPORT SERVICE
// ============================================================================

/**
 * Basic export service for sequences
 */
export interface IExportService {
  exportSequenceAsImage(
    sequence: SequenceData,
    options: ExportOptions
  ): Promise<Blob>;
  exportSequenceAsJson(sequence: SequenceData): Promise<string>;
}

// ============================================================================
// SEQUENCE CARD SERVICES
// ============================================================================

/**
 * Service for generating sequence card images
 */
export interface ISequenceCardImageService {
  /**
   * Generate a high-quality image for a single sequence card
   */
  generateSequenceCardImage(
    sequence: SequenceData,
    options: ExportOptions
  ): Promise<Blob>;

  /**
   * Generate images for multiple sequences in batch
   */
  generateBatchImages(
    sequences: SequenceData[],
    options: ExportOptions,
    onProgress?: (progress: ProgressInfo) => void
  ): Promise<ExportResult[]>;

  /**
   * Get cached image for a sequence
   */
  getCachedImage(
    sequenceId: string,
    options: ExportOptions
  ): Promise<Blob | null>;

  /**
   * Preload images for a set of sequences
   */
  preloadImages(
    sequences: SequenceData[],
    options: ExportOptions
  ): Promise<void>;

  /**
   * Clear image cache
   */
  clearImageCache(): Promise<void>;

  /**
   * Get cache statistics
   */
  getCacheStats(): Promise<{ size: number; count: number; hitRate: number }>;
}

/**
 * Service for calculating sequence card layouts
 */
export interface ISequenceCardLayoutService {
  /**
   * Calculate optimal grid layout for given constraints
   */
  calculateOptimalLayout(
    containerWidth: number,
    containerHeight: number,
    cardCount: number,
    preferredColumns?: number
  ): LayoutConfig;

  /**
   * Calculate responsive layout based on device capabilities
   */
  getResponsiveLayout(
    deviceCapabilities: DeviceCapabilities,
    cardCount: number
  ): LayoutConfig;

  /**
   * Calculate column layout for specific column count
   */
  calculateColumnLayout(
    columnCount: number,
    containerWidth: number,
    cardAspectRatio?: number
  ): { cardWidth: number; cardHeight: number; spacing: number };

  /**
   * Get layout for printable pages
   */
  getPrintableLayout(
    printOptions: PrintLayoutOptions,
    cardCount: number
  ): LayoutConfig;

  /**
   * Validate layout constraints
   */
  validateLayoutConstraints(layout: LayoutConfig): ValidationResult;

  /**
   * Get optimal column count for container size
   */
  getOptimalColumnCount(
    containerWidth: number,
    cardAspectRatio?: number
  ): number;
}

/**
 * Service for generating complete pages with multiple sequence cards
 */
export interface ISequenceCardPageService {
  /**
   * Generate a complete page with multiple sequence cards
   */
  generatePage(
    sequences: SequenceData[],
    layout: LayoutConfig,
    options: ExportOptions
  ): Promise<HTMLElement>;

  /**
   * Generate printable page as image
   */
  generatePrintablePage(
    sequences: SequenceData[],
    printOptions: PrintLayoutOptions
  ): Promise<Blob>;

  /**
   * Generate PDF with multiple pages
   */
  generatePDF(
    sequences: SequenceData[],
    printOptions: PrintLayoutOptions
  ): Promise<Blob>;

  /**
   * Calculate pagination for sequences
   */
  calculatePagination(
    sequences: SequenceData[],
    itemsPerPage: number
  ): SequenceData[][];

  /**
   * Generate page preview
   */
  generatePagePreview(
    sequences: SequenceData[],
    layout: LayoutConfig
  ): Promise<string>; // Returns data URL
}

/**
 * Service for batch processing large numbers of sequences
 */
export interface ISequenceCardBatchService {
  /**
   * Process large batch of sequences with memory management
   */
  processBatch(
    sequences: SequenceData[],
    options: SequenceCardExportSettings,
    onProgress?: (progress: ProgressInfo) => void
  ): Promise<ExportResult[]>;

  /**
   * Estimate processing time for batch
   */
  estimateProcessingTime(
    sequences: SequenceData[],
    options: ExportOptions
  ): Promise<number>; // milliseconds

  /**
   * Check memory requirements for batch
   */
  getMemoryRequirements(
    sequences: SequenceData[],
    options: ExportOptions
  ): Promise<number>; // bytes

  /**
   * Cancel running batch operation
   */
  cancelBatch(): void;

  /**
   * Get optimal batch size for current system
   */
  getOptimalBatchSize(): Promise<number>;
}

/**
 * Service for caching sequence card images
 */
export interface ISequenceCardCacheService {
  /**
   * Store image in cache
   */
  storeImage(
    sequenceId: string,
    imageBlob: Blob,
    options: ExportOptions
  ): Promise<void>;

  /**
   * Retrieve image from cache
   */
  retrieveImage(
    sequenceId: string,
    options: ExportOptions
  ): Promise<Blob | null>;

  /**
   * Check if image is cached
   */
  isImageCached(sequenceId: string, options: ExportOptions): Promise<boolean>;

  /**
   * Clear all cached images
   */
  clearCache(): Promise<void>;

  /**
   * Clear cache entries older than specified date
   */
  clearOldEntries(olderThan: Date): Promise<void>;

  /**
   * Get cache statistics
   */
  getCacheStats(): Promise<{
    entryCount: number;
    totalSize: number;
    hitRate: number;
    oldestEntry?: Date;
  }>;

  /**
   * Optimize cache (remove least recently used items)
   */
  optimizeCache(): Promise<void>;

  /**
   * Set cache configuration
   */
  setCacheConfig(config: Partial<CacheConfig>): Promise<void>;
}

// ============================================================================
// ENHANCED EXPORT SERVICE
// ============================================================================

/**
 * Enhanced export service with sequence card support
 */
export interface IEnhancedExportService extends IExportService {
  /**
   * Export multiple sequence cards as individual images
   */
  exportSequenceCardsAsImages(
    sequences: SequenceData[],
    options: ExportOptions
  ): Promise<Blob[]>;

  /**
   * Export sequence cards as printable PDF
   */
  exportSequenceCardsAsPDF(
    sequences: SequenceData[],
    layoutOptions: PrintLayoutOptions
  ): Promise<Blob>;

  /**
   * Export single sequence card with advanced options
   */
  exportSingleSequenceCard(
    sequence: SequenceData,
    options: ExportOptions
  ): Promise<Blob>;

  /**
   * Export sequence cards as ZIP archive
   */
  exportSequenceCardsAsZip(
    sequences: SequenceData[],
    options: ExportOptions,
    filename?: string
  ): Promise<Blob>;

  /**
   * Get available export formats
   */
  getAvailableFormats(): string[];

  /**
   * Get default export options for sequence cards
   */
  getDefaultSequenceCardExportOptions(): ExportOptions;
}
