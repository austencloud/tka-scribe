/**
 * FlipBook Service Contract
 *
 * Interface for managing StPageFlip flipbook instances.
 */

import type { FlipBookConfig, PDFPageData } from "../../domain";

/**
 * Service for managing flipbook instances and interactions
 */
export interface IFlipBookService {
  /**
   * Initialize a flipbook instance in the specified container
   * @param container - HTML element to contain the flipbook
   * @param config - Flipbook configuration
   * @returns Promise resolving when initialization is complete
   */
  initialize(container: HTMLElement, config: FlipBookConfig): Promise<void>;

  /**
   * Load pages into the flipbook from PDF page data
   * @param pages - Array of PDF page data
   * @returns Promise resolving when pages are loaded
   */
  loadPages(pages: PDFPageData[]): Promise<void>;

  /**
   * Navigate to a specific page
   * @param pageNumber - Page number (1-based)
   */
  goToPage(pageNumber: number): void;

  /**
   * Go to the next page
   */
  nextPage(): void;

  /**
   * Go to the previous page
   */
  previousPage(): void;

  /**
   * Get the current page number
   * @returns Current page number (1-based)
   */
  getCurrentPage(): number;

  /**
   * Get the total number of pages
   * @returns Total page count
   */
  getTotalPages(): number;

  /**
   * Set up event listeners for page changes
   * @param onPageChange - Callback for page change events
   */
  onPageChange(onPageChange: (pageNumber: number) => void): void;

  /**
   * Clean up the flipbook instance and remove event listeners
   */
  destroy(): void;
}