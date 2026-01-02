/**
 * Word Card Export Integration Service Implementation
 *
 * Bridges the gap between UI components and export services.
 * Handles DOM element selection, export orchestration, and file downloads.
 */

import type {
  IFileDownloader,
  DownloadResult,
} from "$lib/shared/foundation/services/contracts/IFileDownloader";
import type { ExportResult } from "$lib/shared/foundation/ui/UITypes";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { inject, injectable } from "inversify";
import { TYPES } from "$lib/shared/inversify/types";
import type {
  BatchExportResult,
  WordCardExportOptions,
} from "../../domain/models/word-card-export";

// Local type definitions

// File download functionality provided by FileDownloader

function generateTimestampedFilename(
  prefix: string,
  extension: string,
  includeTime: boolean = true
): string {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = includeTime
    ? (now.toTimeString().split(" ")[0] ?? "").replace(/:/g, "-")
    : "";
  return `${prefix}_${date}${time ? "_" + time : ""}.${extension}`;
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

function supportsFileDownload(): boolean {
  return typeof window !== "undefined" && "document" in window;
}
// import type {
//   IPageImageExportService,
//   IWordCardExportIntegrationService,
// } from "../contracts";

interface IPageImageExportService {
  exportPagesAsImages?(
    pageElements: HTMLElement[],
    options: WordCardExportOptions
  ): Promise<BatchExportResult>;
  cancelExport?(): Promise<void>;
}

interface IWordCardExportIntegrationService {
  exportWordCards(
    sequences: SequenceData[],
    options: WordCardExportOptions
  ): Promise<ExportResult[]>;
  cancelExport(): Promise<void>;
}

@injectable()
export class WordCardExportIntegrationService
  implements IWordCardExportIntegrationService
{
  private isExporting = false;
  private abortController: AbortController | null = null;

  constructor(
    @inject(TYPES.IFileDownloader)
    private fileDownloadService: IFileDownloader,
    private readonly pageImageExportService: IPageImageExportService
  ) {}

  async exportWordCards(
    _sequences: SequenceData[],
    options: WordCardExportOptions
  ): Promise<ExportResult[]> {
    // Filter options to only include supported formats
    const filteredOptions = {
      format:
        options.format === "PDF"
          ? "PNG"
          : (options.format as "PNG" | "JPEG" | "WebP"),
      quality: options.quality,
      scale: options.scale,
      ...(options.filename && { filenamePrefix: options.filename }),
    };

    // Delegate to the main export method
    const result = await this.exportPrintablePagesAsImages(filteredOptions);

    // Convert result to ExportResult format
    const exportResult: ExportResult = {
      success: result.successCount > 0,
      filename: "word-cards-export",
      ...(result.errors.length > 0 && {
        error: result.errors[0]?.message ?? "Unknown error",
      }),
      metadata: {
        format: "PNG", // Default format for word cards
        size: 0, // Will be set when actual export happens
        dimensions: { width: 800, height: 600 }, // Default dimensions
        beatCount: 0, // Word cards don't have beats
        processingTime: 0, // Will be measured during export
        successCount: result.successCount,
        failureCount: result.failureCount,
        totalErrors: result.errors.length,
      },
    };

    return [exportResult]; // Return as array to match interface
  }

  async exportPrintablePagesAsImages(
    options: {
      format?: "PNG" | "JPEG" | "WebP";
      quality?: number;
      scale?: number;
      filenamePrefix?: string;
    } = {},
    onProgress?: (current: number, total: number, message: string) => void
  ): Promise<{ successCount: number; failureCount: number; errors: Error[] }> {

    // Validate export capability
    const validation = this.validateExportCapability();
    if (!validation.canExport) {
      const error = new Error(
        `Export not possible: ${validation.issues.join(", ")}`
      );
      console.error("❌ Export validation failed:", error);
      return { successCount: 0, failureCount: 1, errors: [error] };
    }

    // Get page elements
    const pageElements = this.getPrintablePageElements();
    if (pageElements.length === 0) {
      const error = new Error("No printable page elements found in DOM");
      console.error("❌ No page elements found:", error);
      return { successCount: 0, failureCount: 1, errors: [error] };
    }


    try {
      this.isExporting = true;
      this.abortController = new AbortController();

      // Prepare export options
      const exportOptions = this.prepareImageExportOptions(options);

      // Progress tracking
      const totalCount = pageElements.length;

      // Export pages to blobs
      onProgress?.(0, totalCount, "Starting page export...");
      const batchResult =
        await this.pageImageExportService.exportPagesAsImages?.(
          pageElements,
          exportOptions
        );

      if (!batchResult) {
        throw new Error("Export service not available");
      }


      // Prepare download data
      const downloadData: Array<{ blob: Blob; filename: string }> = [];
      const errors: Error[] = (batchResult.errors || []).map((err: unknown) =>
        err instanceof Error ? err : new Error(String(err))
      );

      for (let i = 0; i < batchResult.results.length; i++) {
        const result = batchResult.results[i];
        if (!result) continue;

        if (result.success && result.blob) {
          const pageNumber = i + 1;
          const filename = this.generatePageFilename(
            options.filenamePrefix || "word-cards",
            pageNumber,
            exportOptions.format,
            result.metrics?.resolution
          );

          downloadData.push({
            blob: result.blob,
            filename,
          });
        } else if (result.error) {
          errors.push(
            result.error instanceof Error
              ? result.error
              : new Error(String(result.error))
          );
        }
      }


      // Download files
      if (downloadData.length > 0) {
        onProgress?.(
          totalCount,
          totalCount,
          `Downloading ${downloadData.length} files...`
        );

        const downloadResults =
          await this.fileDownloadService.downloadBlobBatch(downloadData, {
            delay: 200, // 200ms delay between downloads
          });

        // Check download results
        const failedDownloads = downloadResults.filter(
          (r: DownloadResult) => !r.success
        );
        if (failedDownloads.length > 0) {
          console.warn("⚠️ Some downloads failed:", failedDownloads);
          failedDownloads.forEach((result: DownloadResult) => {
            if (result.error) {
              errors.push(result.error);
            }
          });
        }
      }

      onProgress?.(
        totalCount,
        totalCount,
        `Export completed! ${batchResult.successCount} pages exported successfully.`
      );

      return {
        successCount: batchResult.successCount,
        failureCount: batchResult.failureCount,
        errors,
      };
    } catch (error) {
      console.error("❌ Export failed with error:", error);
      return {
        successCount: 0,
        failureCount: pageElements.length,
        errors: [error as Error],
      };
    } finally {
      this.isExporting = false;
      this.abortController = null;
    }
  }

  async exportSelectedPages(
    pageIndices: number[],
    options: {
      format?: "PNG" | "JPEG" | "WebP";
      quality?: number;
      scale?: number;
      filenamePrefix?: string;
    } = {},
    onProgress?: (current: number, total: number, message: string) => void
  ): Promise<{ successCount: number; failureCount: number; errors: Error[] }> {

    // Get all page elements
    const allPageElements = this.getPrintablePageElements();

    // Filter to selected pages
    const selectedElements = pageIndices
      .filter((index) => index >= 0 && index < allPageElements.length)
      .map((index) => allPageElements[index]);

    if (selectedElements.length === 0) {
      const error = new Error(
        "No valid page elements found for selected indices"
      );
      console.error("❌ No valid selected elements:", error);
      return { successCount: 0, failureCount: 1, errors: [error] };
    }

    // For now, delegate to the full export method but with filtered elements
    // TODO: Could optimize this by modifying the export service to accept specific elements

    // This is a simplified implementation - in reality, we'd need to modify the export flow
    // For now, we'll export all and notify about the selected ones
    onProgress?.(
      0,
      selectedElements.length,
      "Note: Currently exports all pages (selection feature in development)"
    );

    return this.exportPrintablePagesAsImages(options, onProgress);
  }

  getPrintablePageElements(): HTMLElement[] {

    // Look for page elements with the expected data attribute or class
    const selectors = [
      "[data-page-id]",
      ".printable-page",
      ".page-wrapper .printable-page",
      ".pages-display .printable-page",
    ];

    let elements: HTMLElement[] = [];

    for (const selector of selectors) {
      const found = document.querySelectorAll(selector);
      if (found.length > 0) {
        elements = Array.from(found) as HTMLElement[];
        break;
      }
    }

    if (elements.length === 0) {
      console.warn("⚠️ No printable page elements found with any selector");
    }

    return elements;
  }

  validateExportCapability(): {
    canExport: boolean;
    pageCount: number;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check browser support
    if (!supportsFileDownload()) {
      issues.push("Browser does not support file downloads");
    }

    // Check for DOM elements
    const pageElements = this.getPrintablePageElements();
    const pageCount = pageElements.length;

    if (pageCount === 0) {
      issues.push("No printable page elements found in DOM");
    }

    // Check if already exporting
    if (this.isExporting) {
      issues.push("Export already in progress");
    }

    // Check for required services
    if (!this.pageImageExportService) {
      issues.push("Page image export service not available");
    }

    const canExport = issues.length === 0;

    return {
      canExport,
      pageCount,
      issues,
    };
  }

  cancelExport(): Promise<void> {
    if (this.isExporting && this.abortController) {
      this.abortController.abort();
      void this.pageImageExportService.cancelExport?.();
      this.isExporting = false;
      this.abortController = null;
    }
    return Promise.resolve();
  }

  getDefaultExportOptions(): {
    format: "PNG" | "JPEG" | "WebP";
    quality: number;
    scale: number;
    filenamePrefix: string;
  } {
    return {
      format: "PNG",
      quality: 0.95,
      scale: 2.0, // 2x for high quality
      filenamePrefix: "word-cards",
    };
  }

  // Private helper methods

  private prepareImageExportOptions(options: {
    format?: "PNG" | "JPEG" | "WebP";
    quality?: number;
    scale?: number;
    filenamePrefix?: string;
  }): WordCardExportOptions {
    const defaults = this.getDefaultExportOptions();

    return {
      ...defaults,
      ...options,
      // Override with specific values
      format: options.format || defaults.format,
      quality: options.quality ?? defaults.quality,
      scale: options.scale ?? defaults.scale,
      includeMetadata: true, // Add required property
    };
  }

  private generatePageFilename(
    prefix: string,
    pageNumber: number,
    format: string,
    dimensions?: { width: number; height: number }
  ): string {
    const sanitizedPrefix = sanitizeFilename(prefix);
    const pageNumStr = pageNumber.toString().padStart(3, "0");
    const extension = format.toLowerCase();

    // Include dimensions in filename for reference
    const dimensionStr = dimensions
      ? `_${dimensions.width}x${dimensions.height}`
      : "";

    return generateTimestampedFilename(
      `${sanitizedPrefix}_page_${pageNumStr}${dimensionStr}`,
      extension,
      false // Don't include time, just date
    );
  }
}
