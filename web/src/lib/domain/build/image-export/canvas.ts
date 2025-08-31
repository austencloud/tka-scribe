/**
 * HTML Canvas Domain Types
 *
 * Domain models for HTML canvas and html2canvas functionality used in image export.
 * These types are specific to the build/image-export domain.
 */

// ============================================================================
// HTML2CANVAS INTEGRATION TYPES
// ============================================================================

export interface Html2CanvasOptions {
  scale?: number;
  backgroundColor?: string;
  useCORS?: boolean;
  allowTaint?: boolean;
  width?: number;
  height?: number;
  removeContainer?: boolean;
  [key: string]: unknown; // Allow additional html2canvas options
}

export interface Html2CanvasFunction {
  (
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<HTMLCanvasElement>;
}

export interface WindowWithHtml2Canvas extends Window {
  html2canvas?: Html2CanvasFunction;
}

// ============================================================================
// CANVAS RENDERING TYPES
// ============================================================================

export interface CanvasRenderContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  scale: number;
}

export interface CanvasExportOptions {
  format: "PNG" | "JPEG" | "WebP";
  quality: number; // 0-1 for JPEG/WebP
  backgroundColor?: string;
}
