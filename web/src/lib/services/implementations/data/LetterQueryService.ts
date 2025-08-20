/**
 * Letter Query Service - Letter-based pictograph lookups
 *
 * Single responsibility: Query pictographs by letter using LetterMappingRepository
 * Uses shared services for CSV loading, parsing, and transformation.
 */

import { GridMode } from "$lib/domain";
import type { PictographData } from "$lib/domain";
import type { LetterMapping, MotionType } from "$lib/domain/codex/types";
import type { ILetterMappingRepository } from "$lib/repositories/LetterMappingRepository";
import type { ICsvLoaderService } from "./CsvLoaderService";
import type { ICSVParserService, ParsedCsvRow } from "./CSVParserService";
import type { IPictographTransformationService } from "./PictographTransformationService";

export interface ILetterQueryService {
  getPictographByLetter(
    letter: string,
    gridMode: GridMode
  ): Promise<PictographData | null>;
  getAllCodexPictographs(gridMode: GridMode): Promise<PictographData[]>;
  searchPictographs(
    searchTerm: string,
    gridMode: GridMode
  ): Promise<PictographData[]>;
  getPictographsByLetters(
    letters: string[],
    gridMode: GridMode
  ): Promise<PictographData[]>;
}

export class LetterQueryService implements ILetterQueryService {
  private parsedData: Record<GridMode, ParsedCsvRow[]> | null = null;
  private isInitialized = false;

  constructor(
    private letterMappingRepository: ILetterMappingRepository,
    private csvLoaderService: ICsvLoaderService,
    private csvParserService: ICSVParserService,
    private pictographTransformationService: IPictographTransformationService
  ) {}

  /**
   * Initialize CSV data and letter mapping repository if not already loaded
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize letter mapping repository first
      if (
        this.letterMappingRepository &&
        typeof this.letterMappingRepository.initialize === "function"
      ) {
        await this.letterMappingRepository.initialize();
        console.log(
          "✅ LetterQueryService: Letter mapping repository initialized"
        );
      }

      // Load raw CSV data
      const csvData = await this.csvLoaderService.loadCsvData();

      // Parse CSV data using shared service
      const diamondParseResult = this.csvParserService.parseCSV(
        csvData.diamondData
      );
      const boxParseResult = this.csvParserService.parseCSV(csvData.boxData);

      this.parsedData = {
        [GridMode.DIAMOND]: diamondParseResult.rows,
        [GridMode.BOX]: boxParseResult.rows,
      };

      this.isInitialized = true;
      console.log("✅ LetterQueryService: CSV data loaded and parsed");
    } catch (error) {
      console.error("❌ LetterQueryService: Error loading CSV data:", error);
      throw new Error(
        `Failed to load CSV data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get a specific pictograph by letter using LetterMappingRepository
   */
  async getPictographByLetter(
    letter: string,
    gridMode: GridMode
  ): Promise<PictographData | null> {
    if (!this.letterMappingRepository) {
      console.error(
        "❌ LetterMappingRepository not available for getPictographByLetter"
      );
      return null;
    }

    await this.ensureInitialized();

    try {
      // Get letter mapping from repository
      const mapping = this.letterMappingRepository.getLetterMapping(letter);
      if (!mapping) {
        console.warn(`⚠️ No letter mapping found for letter: ${letter}`);
        return null;
      }

      console.log(
        `🔍 Finding CSV data for letter ${letter} with mapping:`,
        mapping
      );

      // Find matching CSV row
      const csvRow = this.findMatchingCsvRowByMapping(
        letter,
        mapping,
        gridMode
      );
      if (!csvRow) {
        console.warn(`⚠️ No CSV data found for letter ${letter}`);
        return null;
      }

      console.log(`✅ Found CSV data for letter ${letter}:`, csvRow);

      // Transform CSV row to PictographData using shared service
      return this.pictographTransformationService.convertCsvRowToPictographData(
        csvRow,
        gridMode.toString()
      );
    } catch (error) {
      console.error(`❌ Error getting pictograph for letter ${letter}:`, error);
      return null;
    }
  }

  /**
   * Get all pictographs from the codex using LetterMappingRepository
   */
  async getAllCodexPictographs(gridMode: GridMode): Promise<PictographData[]> {
    if (!this.letterMappingRepository) {
      console.error(
        "❌ LetterMappingRepository not available for getAllCodexPictographs"
      );
      return [];
    }

    await this.ensureInitialized();

    try {
      const allLetters = this.letterMappingRepository.getAllLetters();
      console.log(`📚 Getting all ${allLetters.length} pictographs from codex`);

      const pictographs: PictographData[] = [];
      for (const letter of allLetters) {
        const pictograph = await this.getPictographByLetter(letter, gridMode);
        if (pictograph) {
          pictographs.push(pictograph);
        }
      }

      console.log(`✅ Retrieved ${pictographs.length} pictographs from codex`);
      return pictographs;
    } catch (error) {
      console.error("❌ Error getting all codex pictographs:", error);
      return [];
    }
  }

  /**
   * Search pictographs by letter patterns
   */
  async searchPictographs(
    searchTerm: string,
    gridMode: GridMode
  ): Promise<PictographData[]> {
    if (!this.letterMappingRepository) {
      console.error(
        "❌ LetterMappingRepository not available for searchPictographs"
      );
      return [];
    }

    await this.ensureInitialized();

    try {
      const allLetters = this.letterMappingRepository.getAllLetters();
      const matchingLetters = allLetters.filter((letter) =>
        letter.toLowerCase().includes(searchTerm.toLowerCase())
      );

      console.log(
        `🔍 Found ${matchingLetters.length} letters matching "${searchTerm}"`
      );

      const pictographs: PictographData[] = [];
      for (const letter of matchingLetters) {
        const pictograph = await this.getPictographByLetter(letter, gridMode);
        if (pictograph) {
          pictographs.push(pictograph);
        }
      }

      return pictographs;
    } catch (error) {
      console.error(
        `❌ Error searching pictographs for "${searchTerm}":`,
        error
      );
      return [];
    }
  }

  /**
   * Get pictographs for multiple letters
   */
  async getPictographsByLetters(
    letters: string[],
    gridMode: GridMode
  ): Promise<PictographData[]> {
    await this.ensureInitialized();

    const pictographs: PictographData[] = [];
    for (const letter of letters) {
      const pictograph = await this.getPictographByLetter(letter, gridMode);
      if (pictograph) {
        pictographs.push(pictograph);
      }
    }

    return pictographs;
  }

  /**
   * Find matching CSV row by letter mapping
   */
  private findMatchingCsvRowByMapping(
    letter: string,
    mapping: LetterMapping,
    gridMode: GridMode
  ): ParsedCsvRow | null {
    if (!this.parsedData) {
      return null;
    }

    const csvRows = this.parsedData[gridMode];
    if (!csvRows) {
      return null;
    }

    // Handle the mismatch between JSON config and LetterMapping interface
    const mappingData = mapping as LetterMapping & {
      blueMotion?: MotionType;
      redMotion?: MotionType;
    };
    const matchingRow = csvRows.find(
      (row) =>
        row.letter === letter &&
        row.startPosition === mapping.startPosition &&
        row.endPosition === mapping.endPosition &&
        row.blueMotionType ===
          (mappingData.blueMotion || mappingData.blueMotionType) &&
        row.redMotionType ===
          (mappingData.redMotion || mappingData.redMotionType)
    );

    return matchingRow || null;
  }
}
