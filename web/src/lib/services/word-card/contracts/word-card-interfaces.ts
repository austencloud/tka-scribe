/**
 * Word Card Export Interfaces
 *
 * Service contracts for generating, layouting, and processing sequence cards
 * for printable formats. Includes caching and batch processing capabilities.
 */

import type { ExportOptions, SequenceData } from "$domain";

// Local type definitions for missing domain types
interface GridLayout {
  rows: number;
  columns: number;
}

interface LayoutRecommendation {
  gridLayout: GridLayout;
  cardSize: { width: number; height: number };
  confidence: number;
}

interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface Page {
  id: string;
  sequences: SequenceData[];
  pageNumber: number;
}

// ============================================================================
// SEQUENCE CARD SERVICE INTERFACES
// ============================================================================

/**
 * Service for generating word card images
 */
export interface IWordCardImageService {
  /**
   * Generate image for a word card
   */
  generateWordCardImage(
    sequenceId: string,
    width: number,
    height: number
  ): Promise<HTMLCanvasElement>;

  /**
   * Batch generate word card images
   */
  batchGenerateImages(
    sequenceIds: string[],
    dimensions: { width: number; height: number }
  ): Promise<Map<string, HTMLCanvasElement>>;
}

/**
 * Service for managing word card layouts
 */
export interface IWordCardLayoutService {
  /**
   * Calculate optimal layout for sequence cards
   */
  calculateLayout(
    cardCount: number,
    pageSize: { width: number; height: number },
    margins: Margins
  ): GridLayout;

  /**
   * Get layout recommendations
   */
  getLayoutRecommendations(cardCount: number): LayoutRecommendation[];
}

/**
 * Service for managing word card pages
 */
export interface IWordCardPageService {
  /**
   * Create printable page from sequence cards
   */
  createPage(
    sequences: SequenceData[],
    layout: GridLayout,
    pageNumber: number
  ): Promise<Page>;

  /**
   * Generate multiple pages
   */
  generatePages(sequences: SequenceData[], layout: GridLayout): Promise<Page[]>;
}

/**
 * Service for batch processing sequence cards
 */
export interface IWordCardBatchService {
  /**
   * Process batch of sequence cards
   */
  processBatch(
    sequences: SequenceData[],
    batchSize: number,
    processor: (batch: SequenceData[]) => Promise<void>
  ): Promise<void>;

  /**
   * Get batch processing status
   */
  getBatchStatus(): {
    total: number;
    processed: number;
    remaining: number;
    isProcessing: boolean;
  };
}

/**
 * Service for caching word card data
 */
export interface IWordCardCacheService {
  /**
   * Cache word card data
   */
  cacheWordCard(sequenceId: string, data: SequenceData): Promise<void>;

  /**
   * Get cached word card
   */
  getCachedWordCard(sequenceId: string): Promise<SequenceData | null>;

  /**
   * Store image in cache
   */
  storeImage(
    sequenceId: string,
    imageBlob: Blob,
    options?: ExportOptions
  ): Promise<void>;

  /**
   * Retrieve image from cache
   */
  retrieveImage(
    sequenceId: string,
    options?: ExportOptions
  ): Promise<Blob | null>;

  /**
   * Clear cache
   */
  clearCache(): Promise<void>;

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    entryCount: number;
    totalSize: number;
    hitRate: number;
  };
}
