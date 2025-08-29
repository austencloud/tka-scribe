/**
 * Motion Query Service - Motion parameter-based pictograph queries
 *
 * Single responsibility: Query pictographs by motion parameters
 * Uses shared services for CSV loading, parsing, and transformation.
 */

import type { PictographData } from "$lib/domain";
import { GridMode } from "$lib/domain";
import type {
  ICsvLoader,
  ICSVParser,
  IMotionQueryHandler,
  ParsedCsvRow,
} from "$lib/services/contracts/data-interfaces";
import { inject, injectable } from "inversify";
import { TYPES } from "../../inversify/types";
import type {
  CSVRow,
  ICSVPictographParserService,
} from "../movement/CSVPictographParserService";

@injectable()
export class MotionQueryHandler implements IMotionQueryHandler {
  private parsedData: Record<
    Exclude<GridMode, GridMode.SKEWED>,
    ParsedCsvRow[]
  > | null = null;
  private isInitialized = false;

  constructor(
    @inject(TYPES.ICsvLoader)
    private csvLoaderService: ICsvLoader,
    @inject(TYPES.ICSVParser)
    private CSVParser: ICSVParser,
    @inject(TYPES.ICSVPictographParser)
    private csvPictographParser: ICSVPictographParserService
  ) {}

  /**
   * Initialize CSV data if not already loaded
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load raw CSV data
      const csvData = await this.csvLoaderService.loadCSVDataSet();

      // Parse CSV data using shared service
      const diamondParseResult = this.CSVParser.parseCSV(
        csvData.data?.diamondData || ""
      );
      const boxParseResult = this.CSVParser.parseCSV(
        csvData.data?.boxData || ""
      );

      this.parsedData = {
        [GridMode.DIAMOND]: diamondParseResult.rows.map((row) => ({
          data: row,
          errors: [],
          isValid: true,
        })),
        [GridMode.BOX]: boxParseResult.rows.map((row) => ({
          data: row,
          errors: [],
          isValid: true,
        })),
        // SKEWED mode doesn't have separate data - it uses both diamond and box
      };

      this.isInitialized = true;
      console.log("✅ MotionQueryHandler: CSV data loaded and parsed");
    } catch (error) {
      console.error("❌ MotionQueryHandler: Error loading CSV data:", error);
      throw new Error(
        `Failed to load CSV data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get next options for sequence building (placeholder implementation)
   */
  async getNextOptionsForSequence(
    _sequence: unknown[]
  ): Promise<PictographData[]> {
    await this.ensureInitialized();

    if (!this.parsedData) {
      console.error("❌ No parsed CSV data available");
      return [];
    }

    // For now, return all available pictographs for diamond mode
    // This would need more sophisticated logic based on sequence context
    const csvRows = this.parsedData[GridMode.DIAMOND] || [];
    const pictographs: PictographData[] = [];

    for (const row of csvRows.slice(0, 20)) {
      // Limit to first 20 for performance
      const pictograph = this.csvPictographParser.parseCSVRowToPictograph(
        row as CSVRow
      );
      if (pictograph) {
        pictographs.push(pictograph);
      }
    }

    console.log(
      `✅ MotionQueryHandler: Retrieved ${pictographs.length} next options`
    );
    return pictographs;
  }
}
