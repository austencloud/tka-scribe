/**
 * Data Service Interfaces
 *
 * Service contracts for data handling, CSV parsing, and query operations.
 */

import type { PictographData } from "$lib/domain/core/pictograph/PictographData";

// ============================================================================
// DATA CONTRACTS
// ============================================================================

export interface ParsedCsvRow {
  data: Record<string, string>;
  errors: string[];
  isValid: boolean;
}

export interface CsvParseResult {
  data: ParsedCsvRow[];
  errors: Array<{
    error: string;
    rawRow: string;
    lineNumber: number;
  }>;
  isValid: boolean;
}

// ============================================================================
// SERVICE CONTRACTS (Behavioral Interfaces)
// ============================================================================

export interface ILetterQueryHandler {
  /**
   * Get all codex pictographs for a grid mode
   */
  getAllCodexPictographs(gridMode: any): Promise<PictographData[]>;

  /**
   * Search pictographs by term and grid mode
   */
  searchPictographs(
    searchTerm: string,
    gridMode: any
  ): Promise<PictographData[]>;

  /**
   * Get pictograph by letter and grid mode
   */
  getPictographByLetter(
    letter: any,
    gridMode: any
  ): Promise<PictographData | null>;
}

export interface IMotionQueryHandler {
  /**
   * Query motions based on criteria
   */
  queryMotions(criteria: Record<string, any>): Promise<PictographData[]>;

  /**
   * Get motion data by ID
   */
  getMotionById(motionId: string): Promise<PictographData | null>;

  /**
   * Search motions by pattern
   */
  searchMotions(pattern: string): Promise<PictographData[]>;
}

export interface ICSVPictographParserService {
  /**
   * Parse CSV data into pictographs
   */
  parseCsv(csvData: string): Promise<CsvParseResult>;

  /**
   * Validate CSV format
   */
  validateCsvFormat(csvData: string): boolean;

  /**
   * Get supported CSV columns
   */
  getSupportedColumns(): string[];
}

// Re-export from application interfaces for backward compatibility
export type {
  ICSVLoader,
  ICSVLoader as ICsvLoader,
  ICSVParser,
} from "./application-interfaces";
