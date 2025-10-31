/**
 * FlipBook Service Implementation
 *
 * Service for managing StPageFlip flipbook instances.
 */

import { browser } from "$app/environment";
import { injectable } from "inversify";
import type { FlipBookConfig, PDFPageData } from "../../domain";
import type { IFlipBookService } from "../contracts";

// Type definitions from page-flip library
type PageFlipConfig = Partial<{
  width: number;
  height: number;
  showCover: boolean;
  drawShadow: boolean;
  flippingTime: number;
  maxShadowOpacity: number;
  mobileScrollSupport: boolean;
  size: string;
  autoSize: boolean;
  usePortrait: boolean;
}>;

type PageFlipType = {
  new (container: HTMLElement, config: PageFlipConfig): PageFlipInstance;
};

type PageFlipInstance = {
  loadFromImages(images: string[]): void;
  on(
    event: string,
    callback: (e: { data: number; object: PageFlipInstance }) => void
  ): void;
  turnToPage(page: number): void;
  flipNext(corner?: string): void;
  flipPrev(corner?: string): void;
  getCurrentPageIndex(): number;
  getPageCount(): number;
  destroy(): void;
};

// Dynamic import for page-flip (browser-only)
let PageFlipClass: PageFlipType | null = null;
let pageFlipPromise: Promise<PageFlipType> | null = null;

// Initialize page-flip only in browser environment
if (browser) {
  pageFlipPromise = import("page-flip").then((module) => {
    PageFlipClass = (module.PageFlip ||
      module.default ||
      module) as PageFlipType;
    return PageFlipClass;
  });
}

@injectable()
export class FlipBookService implements IFlipBookService {
  private pageFlip: PageFlipInstance | null = null;
  private container: HTMLElement | null = null;
  private pageChangeCallback: ((pageNumber: number) => void) | null = null;

  async initialize(
    container: HTMLElement,
    config: FlipBookConfig
  ): Promise<void> {
    try {
      // Ensure we're in browser environment
      if (!browser) {
        throw new Error("PageFlip is only available in browser environment");
      }

      this.container = container;

      // Wait for PageFlip to load if it hasn't already
      if (!PageFlipClass && pageFlipPromise) {
        await pageFlipPromise;
      }

      if (!PageFlipClass) {
        throw new Error("Failed to load PageFlip library");
      }

      // Create the PageFlip instance
      this.pageFlip = new PageFlipClass(container, {
        width: config.width,
        height: config.height,
        showCover: config.showCover,
        drawShadow: config.drawShadow,
        flippingTime: config.flippingTime,
        maxShadowOpacity: config.maxShadowOpacity,
        mobileScrollSupport: config.mobileScrollSupport,
        size: "stretch", // Use stretch to fit container properly
        autoSize: true, // Let the book control its own size
        usePortrait: false, // Use landscape mode to show both pages
      });

      // Set up event listeners with proper typing
      this.pageFlip.on("flip", (e) => {
        const currentPage = (e.data as number) + 1; // Convert from 0-based to 1-based
        this.pageChangeCallback?.(currentPage);
      });
    } catch (error) {
      console.error("📚 FlipBookService: Error initializing flipbook", error);
      throw new Error(
        `Failed to initialize flipbook: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async loadPages(pages: PDFPageData[]): Promise<void> {
    if (!this.pageFlip) {
      throw new Error("Flipbook not initialized");
    }

    try {
      // Convert page data to image URLs for StPageFlip
      const imageUrls = pages.map((page) => page.imageDataUrl);

      // Load images into the flipbook
      this.pageFlip.loadFromImages(imageUrls);
    } catch (error) {
      console.error("📚 FlipBookService: Error loading pages", error);
      throw new Error(
        `Failed to load pages: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  goToPage(pageNumber: number): void {
    if (!this.pageFlip) {
      throw new Error("Flipbook not initialized");
    }

    // Convert from 1-based to 0-based indexing
    const pageIndex = pageNumber - 1;
    this.pageFlip.turnToPage(pageIndex);
  }

  nextPage(): void {
    if (!this.pageFlip) {
      throw new Error("Flipbook not initialized");
    }

    this.pageFlip.flipNext("bottom");
  }

  previousPage(): void {
    if (!this.pageFlip) {
      throw new Error("Flipbook not initialized");
    }

    this.pageFlip.flipPrev("top");
  }

  getCurrentPage(): number {
    if (!this.pageFlip) {
      return 1;
    }

    // Convert from 0-based to 1-based indexing
    return this.pageFlip.getCurrentPageIndex() + 1;
  }

  getTotalPages(): number {
    if (!this.pageFlip) {
      return 0;
    }

    return this.pageFlip.getPageCount();
  }

  onPageChange(callback: (pageNumber: number) => void): void {
    this.pageChangeCallback = callback;
  }

  destroy(): void {
    if (this.pageFlip) {
      this.pageFlip.destroy();
      this.pageFlip = null;
    }
    this.container = null;
    this.pageChangeCallback = null;
  }
}
