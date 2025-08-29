/**
 * HTML Canvas Types
 *
 * Domain models for HTML canvas and html2canvas functionality.
 */

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

export interface ExportProgress {
  current: number;
  total: number;
  currentItem: number;
  totalItems: number;
  percentage: number;
  currentPage: number;
  currentOperation: string;
  estimatedTimeRemaining: number;
  isComplete: boolean;
}
