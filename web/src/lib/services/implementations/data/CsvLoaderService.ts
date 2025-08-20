/**
 * CSV Loader Service - Pure CSV file loading and caching
 *
 * Single responsibility: Load raw CSV files from static directory or window.csvData
 * No parsing, no business logic - just file loading and caching.
 */

export interface CsvDataSet {
  diamondData: string;
  boxData: string;
}

export interface ICsvLoaderService {
  loadCsvData(): Promise<CsvDataSet>;
  getCsvData(): CsvDataSet | null;
  clearCache(): void;
}

export class CsvLoaderService implements ICsvLoaderService {
  private csvData: CsvDataSet | null = null;
  private isLoaded = false;

  /**
   * Load CSV data from static files or window.csvData
   */
  async loadCsvData(): Promise<CsvDataSet> {
    if (this.isLoaded && this.csvData) {
      return this.csvData;
    }

    try {
      // First try to get data from global window.csvData (set by layout)
      if (typeof window !== "undefined" && window.csvData) {
        console.log("📁 Loading CSV data from window.csvData");
        this.csvData = window.csvData;
      } else {
        // Fallback: Fetch CSV files from static directory
        console.log("📁 Loading CSV data from static files");
        const [diamondResponse, boxResponse] = await Promise.all([
          fetch("/DiamondPictographDataframe.csv"),
          fetch("/BoxPictographDataframe.csv"),
        ]);

        if (!diamondResponse.ok || !boxResponse.ok) {
          throw new Error(
            `Failed to load CSV files: Diamond=${diamondResponse.status}, Box=${boxResponse.status}`
          );
        }

        const diamondData = await diamondResponse.text();
        const boxData = await boxResponse.text();

        this.csvData = { diamondData, boxData };
      }

      this.isLoaded = true;
      console.log("✅ CSV data loaded successfully");
      return this.csvData;
    } catch (error) {
      console.error("❌ Error loading CSV data:", error);
      throw new Error(
        `Failed to load CSV data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get cached CSV data (returns null if not loaded)
   */
  getCsvData(): CsvDataSet | null {
    return this.csvData;
  }

  /**
   * Clear cached data (for testing or reloading)
   */
  clearCache(): void {
    this.csvData = null;
    this.isLoaded = false;
    console.log("🧹 CSV loader cache cleared");
  }
}
