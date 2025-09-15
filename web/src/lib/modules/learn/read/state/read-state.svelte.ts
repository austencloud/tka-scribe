/**
 * Read State Factory
 *
 * Factory function for creating read module state with PDF and flipbook management.
 */

import type { FlipBookConfig, PDFDocumentInfo, PDFLoadingState, PDFPageData } from "../domain";
import type { IFlipBookService, IPDFService } from "../services/contracts";

/**
 * Create read state for managing PDF loading and flipbook display
 */
export function createReadState(
  pdfService: IPDFService,
  flipBookService: IFlipBookService
) {
  // PDF state
  let documentInfo = $state<PDFDocumentInfo | null>(null);
  let pages = $state<PDFPageData[]>([]);
  let loadingState = $state<PDFLoadingState>({
    isLoading: false,
    progress: 0,
    stage: "Ready",
    error: undefined,
  });

  // Flipbook state
  let currentPage = $state<number>(1);
  let isFlipBookInitialized = $state<boolean>(false);

  // Default flipbook configuration
  const defaultConfig: FlipBookConfig = {
    width: 400,
    height: 600,
    showCover: true,
    drawShadow: true,
    flippingTime: 1000,
    maxShadowOpacity: 0.8,
    mobileScrollSupport: true,
  };

  /**
   * Load a PDF from the specified URL
   */
  async function loadPDF(url: string): Promise<void> {
    try {
      console.log("📖 ReadState: Loading PDF from", url);
      
      loadingState.isLoading = true;
      loadingState.progress = 0;
      loadingState.stage = "Loading PDF document...";
      loadingState.error = undefined;

      // Load the PDF document
      documentInfo = await pdfService.loadPDF(url);
      
      loadingState.stage = "Converting pages to images...";
      
      // Convert all pages to images
      pages = await pdfService.convertPagesToImages((progress, stage) => {
        loadingState.progress = progress;
        loadingState.stage = stage;
      });

      loadingState.isLoading = false;
      loadingState.stage = "PDF loaded successfully";
      
      console.log("📖 ReadState: PDF loaded with", pages.length, "pages");
    } catch (error) {
      console.error("📖 ReadState: Error loading PDF", error);
      loadingState.isLoading = false;
      loadingState.error = error instanceof Error ? error.message : "Unknown error";
      loadingState.stage = "Error loading PDF";
    }
  }

  /**
   * Initialize the flipbook with the loaded pages
   */
  async function initializeFlipBook(
    container: HTMLElement,
    config: Partial<FlipBookConfig> = {}
  ): Promise<void> {
    try {
      console.log("📚 ReadState: Initializing flipbook");

      // Use the provided config with defaults, let StPageFlip handle sizing
      const finalConfig = { ...defaultConfig, ...config };

      if (pages.length > 0) {
        const firstPage = pages[0];
        console.log("📚 ReadState: PDF page dimensions", {
          width: firstPage.width,
          height: firstPage.height,
          aspectRatio: firstPage.width / firstPage.height
        });
      }

      console.log("📚 ReadState: Using flipbook config", finalConfig);

      // Initialize the flipbook
      await flipBookService.initialize(container, finalConfig);

      // Set up page change listener
      flipBookService.onPageChange((pageNumber) => {
        currentPage = pageNumber;
      });

      // Load pages if available
      if (hasPages()) {
        await flipBookService.loadPages(pages);
      }

      isFlipBookInitialized = true;
      currentPage = 1;

      console.log("📚 ReadState: Flipbook initialized successfully");
    } catch (error) {
      console.error("📚 ReadState: Error initializing flipbook", error);
      throw error;
    }
  }

  /**
   * Navigate to a specific page
   */
  function goToPage(pageNumber: number): void {
    if (!isFlipBookInitialized) return;
    
    flipBookService.goToPage(pageNumber);
  }

  /**
   * Go to the next page
   */
  function nextPage(): void {
    if (!isFlipBookInitialized) return;
    
    flipBookService.nextPage();
  }

  /**
   * Go to the previous page
   */
  function previousPage(): void {
    if (!isFlipBookInitialized) return;
    
    flipBookService.previousPage();
  }

  /**
   * Clean up resources
   */
  function cleanup(): void {
    console.log("📖 ReadState: Cleaning up resources");
    
    flipBookService.destroy();
    pdfService.cleanup();
    
    // Reset state
    documentInfo = null;
    pages = [];
    loadingState = {
      isLoading: false,
      progress: 0,
      stage: "Ready",
      error: undefined,
    };
    currentPage = 1;
    isFlipBookInitialized = false;
  }

  // Computed properties
  const totalPages = $derived(() => pages.length);
  const hasPages = $derived(() => pages.length > 0);
  const isReady = $derived(() => hasPages() && !loadingState.isLoading);

  return {
    // State
    get documentInfo() { return documentInfo; },
    get pages() { return pages; },
    get loadingState() { return loadingState; },
    get currentPage() { return currentPage; },
    get isFlipBookInitialized() { return isFlipBookInitialized; },
    
    // Computed
    get totalPages() { return totalPages; },
    get hasPages() { return hasPages; },
    get isReady() { return isReady; },
    
    // Actions
    loadPDF,
    initializeFlipBook,
    goToPage,
    nextPage,
    previousPage,
    cleanup,
  };
}