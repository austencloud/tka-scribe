/**
 * PDF Service Implementation
 *
 * Service for processing PDF documents using PDF.js and converting pages to images.
 */

import { injectable } from "inversify";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentInfo, PDFPageData } from "../../domain";
import type { IPDFService } from "../contracts";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/node_modules/pdfjs-dist/build/pdf.worker.min.mjs";

@injectable()
export class PDFService implements IPDFService {
  private document: PDFDocumentProxy | null = null;
  private documentInfo: PDFDocumentInfo | null = null;

  async loadPDF(url: string): Promise<PDFDocumentInfo> {
    try {
      console.log("📖 PDFService: Loading PDF from", url);

      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument(url);
      this.document = await loadingTask.promise;

      // Extract document metadata
      const metadata = await this.document.getMetadata();

      this.documentInfo = {
        title: (metadata.info as any)?.Title || "Level 1 Guide",
        author: (metadata.info as any)?.Author || "TKA",
        numPages: this.document.numPages,
      };

      console.log("📖 PDFService: PDF loaded successfully", this.documentInfo);
      return this.documentInfo;
    } catch (error) {
      console.error("📖 PDFService: Error loading PDF", error);
      throw new Error(`Failed to load PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async convertPagesToImages(
    onProgress?: (progress: number, stage: string) => void
  ): Promise<PDFPageData[]> {
    if (!this.document) {
      throw new Error("No PDF document loaded");
    }

    const pages: PDFPageData[] = [];
    const totalPages = this.document.numPages;

    console.log(`📖 PDFService: Converting ${totalPages} pages to images`);

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      onProgress?.(
        ((pageNum - 1) / totalPages) * 100,
        `Converting page ${pageNum} of ${totalPages}`
      );

      const pageData = await this.convertPageToImage(pageNum);
      pages.push(pageData);
    }

    onProgress?.(100, "Conversion complete");
    console.log("📖 PDFService: All pages converted successfully");
    return pages;
  }

  async convertPageToImage(pageNumber: number, scale: number = 1.2): Promise<PDFPageData> {
    if (!this.document) {
      throw new Error("No PDF document loaded");
    }

    try {
      // Get the page
      const page: PDFPageProxy = await this.document.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      // Create canvas for rendering
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      if (!context) {
        throw new Error("Failed to get canvas context");
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render the page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      await page.render(renderContext).promise;

      // Convert to data URL with optimized quality
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.85);

      return {
        pageNumber,
        imageDataUrl,
        width: viewport.width,
        height: viewport.height,
      };
    } catch (error) {
      console.error(`📖 PDFService: Error converting page ${pageNumber}`, error);
      throw new Error(`Failed to convert page ${pageNumber}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  getDocumentInfo(): PDFDocumentInfo | null {
    return this.documentInfo;
  }

  cleanup(): void {
    if (this.document) {
      this.document.destroy();
      this.document = null;
    }
    this.documentInfo = null;
    console.log("📖 PDFService: Cleaned up resources");
  }
}