/**
 * Persistent PDF State Factory
 *
 * Global state that persists PDF data across component unmounting/remounting.
 * This ensures the PDF only loads once and stays in memory while navigating between tabs.
 */

import { resolve } from "$shared";
import { TYPES } from "$shared/inversify/types";
import type { PDFDocumentInfo, PDFLoadingState, PDFPageData } from "../domain";
import type { IPDFService } from "../services/contracts";

function createPersistentPDFState() {
  // PDF state using Svelte 5 runes
  let documentInfo = $state<PDFDocumentInfo | null>(null);
  let pages = $state<PDFPageData[]>([]);
  let loadingState = $state<PDFLoadingState>({
    isLoading: false,
    progress: 0,
    stage: "Ready",
    error: undefined,
  });

  // Track loaded URLs to avoid reloading
  const loadedUrls = new Set<string>();

  // Track current page for each PDF URL
  const currentPages = new Map<string, number>();

  // Services (lazy loaded)
  let pdfService: IPDFService | null = null;

  function getPDFService(): IPDFService {
    if (!pdfService) {
      pdfService = resolve(TYPES.IPDFService) as IPDFService;
    }
    return pdfService;
  }

  /**
   * Load PDF if not already loaded
   */
  async function ensurePDFLoaded(url: string): Promise<void> {
    // If already loaded for this URL, skip loading
    if (loadedUrls.has(url) && pages.length > 0) {
      console.log("📖 PersistentPDFState: PDF already loaded, skipping reload");
      return;
    }

    await loadPDF(url);
  }

  /**
   * Force reload PDF (for cache busting if needed)
   */
  async function reloadPDF(url: string): Promise<void> {
    loadedUrls.delete(url);
    await loadPDF(url);
  }

  /**
   * Load a PDF from the specified URL
   */
  async function loadPDF(url: string): Promise<void> {
    try {
      console.log("📖 PersistentPDFState: Loading PDF from", url);

      loadingState.isLoading = true;
      loadingState.progress = 0;
      loadingState.stage = "Loading PDF document...";
      loadingState.error = undefined;

      // Load the PDF document
      const pdfServiceInstance = getPDFService();
      const documentInfoResult = await pdfServiceInstance.loadPDF(url);
      documentInfo = documentInfoResult;

      loadingState.stage = "Converting pages to images...";

      // Convert all pages to images
      const pagesResult = await pdfServiceInstance.convertPagesToImages(
        (progress, stage) => {
          loadingState.progress = progress;
          loadingState.stage = stage;
        }
      );
      pages = pagesResult;

      loadingState.isLoading = false;
      loadingState.stage = "PDF loaded successfully";

      // Mark this URL as loaded
      loadedUrls.add(url);

      console.log(
        "📖 PersistentPDFState: PDF loaded with",
        pages.length,
        "pages"
      );
    } catch (error) {
      console.error("📖 PersistentPDFState: Error loading PDF", error);
      loadingState.isLoading = false;
      loadingState.error =
        error instanceof Error ? error.message : "Unknown error";
      loadingState.stage = "Error loading PDF";
    }
  }

  /**
   * Check if a specific URL is already loaded
   */
  function isLoaded(url: string): boolean {
    return loadedUrls.has(url) && pages.length > 0;
  }

  /**
   * Get the current page number for a specific PDF URL
   */
  function getCurrentPage(url: string): number {
    console.log(`📖 PersistentPDFState: Getting current page for ${url}`);

    // First check in-memory cache
    const memoryPage = currentPages.get(url);
    if (memoryPage) {
      console.log(
        `📖 PersistentPDFState: Found page ${memoryPage} in memory for ${url}`
      );
      return memoryPage;
    }

    // Fallback to localStorage
    try {
      const storageKey = `pdf-page-${url}`;
      const savedPage = localStorage.getItem(storageKey);
      console.log(
        `📖 PersistentPDFState: localStorage key ${storageKey} = ${savedPage}`
      );

      if (savedPage) {
        const pageNumber = parseInt(savedPage, 10);
        if (pageNumber >= 1 && pageNumber <= pages.length) {
          console.log(
            `📖 PersistentPDFState: Restored page ${pageNumber} from localStorage for ${url}`
          );
          // Update in-memory cache
          currentPages.set(url, pageNumber);
          return pageNumber;
        } else {
          console.log(
            `📖 PersistentPDFState: Page ${pageNumber} out of range (1-${pages.length}) for ${url}`
          );
        }
      }
    } catch (error) {
      console.warn(
        "📖 PersistentPDFState: Could not read from localStorage:",
        error
      );
    }

    console.log(
      `📖 PersistentPDFState: No saved page found for ${url}, defaulting to page 1`
    );
    return 1; // Default to page 1
  }

  /**
   * Set the current page number for a specific PDF URL
   */
  function setCurrentPage(url: string, pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= pages.length) {
      // Update in-memory cache
      currentPages.set(url, pageNumber);

      // Save to localStorage for persistence across sessions
      try {
        const storageKey = `pdf-page-${url}`;
        localStorage.setItem(storageKey, pageNumber.toString());
        console.log(
          `📖 PersistentPDFState: Saved page ${pageNumber} to localStorage with key ${storageKey}`
        );
      } catch (error) {
        console.warn(
          "📖 PersistentPDFState: Could not save to localStorage:",
          error
        );
      }

      console.log(`📖 PersistentPDFState: Saved page ${pageNumber} for ${url}`);
    } else {
      console.warn(
        `📖 PersistentPDFState: Page ${pageNumber} out of range (1-${pages.length}) for ${url}`
      );
    }
  }

  /**
   * Clear all cached data (for memory management)
   */
  function clearCache(): void {
    console.log("📖 PersistentPDFState: Clearing cache");

    // Clear localStorage entries for page positions
    try {
      for (const url of loadedUrls) {
        const storageKey = `pdf-page-${url}`;
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.warn(
        "📖 PersistentPDFState: Could not clear localStorage:",
        error
      );
    }

    documentInfo = null;
    pages = [];
    loadingState = {
      isLoading: false,
      progress: 0,
      stage: "Ready",
      error: undefined,
    };
    loadedUrls.clear();
    currentPages.clear();
  }

  // Return the state object
  return {
    // Getters
    get documentInfo() {
      return documentInfo;
    },
    get pages() {
      return pages;
    },
    get loadingState() {
      return loadingState;
    },

    // Computed properties
    get hasPages() {
      return pages.length > 0;
    },
    get isReady() {
      return pages.length > 0 && !loadingState.isLoading;
    },
    get totalPages() {
      return pages.length;
    },

    // Methods
    ensurePDFLoaded,
    reloadPDF,
    isLoaded,
    getCurrentPage,
    setCurrentPage,
    clearCache,
  };
}

// Create singleton instance
export const persistentPDFState = createPersistentPDFState();
