export interface IWordCardExportIntegrationService {
  /**
   * Export all visible printable pages as image files
   */
  exportPrintablePagesAsImages(
    options?: {
      format?: "PNG" | "JPEG" | "WebP";
      quality?: number;
      scale?: number;
      filenamePrefix?: string;
    },
    onProgress?: (current: number, total: number, message: string) => void
  ): Promise<{ successCount: number; failureCount: number; errors: Error[] }>;

  /**
   * Export selected pages by their indices
   */
  exportSelectedPages(
    pageIndices: number[],
    options?: {
      format?: "PNG" | "JPEG" | "WebP";
      quality?: number;
      scale?: number;
      filenamePrefix?: string;
    },
    onProgress?: (current: number, total: number, message: string) => void
  ): Promise<{ successCount: number; failureCount: number; errors: Error[] }>;

  /**
   * Get printable page elements from the DOM
   */
  getPrintablePageElements(): HTMLElement[];

  /**
   * Validate that export is possible (pages exist, browser supports export)
   */
  validateExportCapability(): {
    canExport: boolean;
    pageCount: number;
    issues: string[];
  };

  /**
   * Cancel any ongoing export operation
   */
  cancelExport(): void;

  /**
   * Get default export options
   */
  getDefaultExportOptions(): {
    format: "PNG" | "JPEG" | "WebP";
    quality: number;
    scale: number;
    filenamePrefix: string;
  };
}
