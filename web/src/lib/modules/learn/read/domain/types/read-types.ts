/**
 * Read Module Types
 *
 * Type definitions for PDF reading and flipbook functionality.
 */

/**
 * Configuration for the PDF flipbook
 */
export interface FlipBookConfig {
  /** Base page width */
  width: number;
  /** Base page height */
  height: number;
  /** Whether to show cover page */
  showCover: boolean;
  /** Whether to draw shadows */
  drawShadow: boolean;
  /** Page flipping animation time in milliseconds */
  flippingTime: number;
  /** Maximum shadow opacity (0-1) */
  maxShadowOpacity: number;
  /** Whether to enable mobile scroll support */
  mobileScrollSupport: boolean;
}

/**
 * PDF page data for rendering
 */
export interface PDFPageData {
  /** Page number (1-based) */
  pageNumber: number;
  /** Image data URL for the page */
  imageDataUrl: string;
  /** Original page width */
  width: number;
  /** Original page height */
  height: number;
}

/**
 * PDF document metadata
 */
export interface PDFDocumentInfo {
  /** Document title */
  title?: string;
  /** Document author */
  author?: string;
  /** Total number of pages */
  numPages: number;
  /** File size in bytes */
  fileSize?: number;
}

/**
 * Loading state for PDF processing
 */
export interface PDFLoadingState {
  /** Whether PDF is currently loading */
  isLoading: boolean;
  /** Current loading progress (0-100) */
  progress: number;
  /** Current loading stage description */
  stage: string;
  /** Any error that occurred */
  error?: string;
}