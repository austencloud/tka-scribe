/**
 * Data Service Interfaces
 *
 * Interfaces for data loading, parsing, querying, and transformation services.
 * This includes CSV handling, letter queries, and data processing operations.
 */

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
