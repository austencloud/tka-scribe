/**
 * Data Service Interfaces
 *
 * Interfaces for data loading, parsing, querying, and transformation services.
 * This includes CSV handling, letter queries, and data processing operations.
 */

import type { GridMode, Letter, PictographData } from "$lib/domain";

// ============================================================================
// LETTER QUERY SERVICE INTERFACES
// ============================================================================

/**
 * Service for querying pictographs by letter
 *
 * Single responsibility: Query pictographs by letter using LetterMappingRepository
 * Uses shared services for CSV loading, parsing, and transformation.
 */
export interface ILetterQueryHandler {
  getPictographByLetter(
    letter: Letter,
    gridMode: GridMode
  ): Promise<PictographData | null>;
  getAllCodexPictographs(gridMode: GridMode): Promise<PictographData[]>;
  getAllPictographVariations(gridMode: GridMode): Promise<PictographData[]>;
  searchPictographs(
    searchTerm: string,
    gridMode: GridMode
  ): Promise<PictographData[]>;
  getPictographsByLetters(
    letters: Letter[],
    gridMode: GridMode
  ): Promise<PictographData[]>;
}

// ============================================================================
// CSV LOADING SERVICE INTERFACES
// ============================================================================

/**
 * CSV dataset structure
 */
export interface CsvDataSet {
  diamondData: string;
  boxData: string;
}

/**
 * Service for loading and caching CSV data
 *
 * Handles loading and caching of CSV data from static files or preloaded window data.
 * Provides a single source of truth for raw CSV content without parsing logic.
 */
export interface ICsvLoader {
  loadCsvData(): Promise<CsvDataSet>;
  getCsvData(): CsvDataSet | null;
  clearCache(): void;
}

// ============================================================================
// CSV PARSING SERVICE INTERFACES
// ============================================================================

/**
 * Parsed CSV row structure
 */
export interface ParsedCsvRow {
  letter: string;
  startPosition: string;
  endPosition: string;
  timing: string;
  direction: string;
  blueMotionType: string;
  blueRotationDirection: string;
  blueStartLocation: string;
  blueEndLocation: string;
  redMotionType: string;
  redRotationDirection: string;
  redStartLocation: string;
  redEndLocation: string;
  // Add index signature to make it compatible with Record<string, string>
  [key: string]: string;
}

/**
 * CSV parsing result structure
 */
export interface CSVParseResult {
  headers: string[];
  rows: ParsedCsvRow[];
  totalRows: number;
  successfulRows: number;
  errors: Array<{ rowIndex: number; error: string; rawRow: string }>;
}

/**
 * Service for parsing CSV data
 *
 * Provides consistent CSV parsing functionality used across all data services.
 * Handles line splitting, header extraction, and row parsing with error handling.
 */
export interface ICSVParser {
  parseCSV(csvText: string): CSVParseResult;
  parseCSVToRows(csvText: string): ParsedCsvRow[];
  validateCSVStructure(csvText: string): { isValid: boolean; errors: string[] };
  createRowFromValues(headers: string[], values: string[]): ParsedCsvRow;
}

// ============================================================================
// MOTION QUERY SERVICE
// ============================================================================

/**
 * Motion Query Service Interface
 */
export interface IMotionQueryHandler {
  getNextOptionsForSequence(sequence: unknown[]): Promise<PictographData[]>;
}
