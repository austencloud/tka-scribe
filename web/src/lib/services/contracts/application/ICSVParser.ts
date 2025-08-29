/**
 * CSV Parser Service Interface
 *
 * Interface for CSV parsing utilities.
 * Handles parsing, validation, and structure analysis of CSV data.
 */

export interface ICSVParser {
  parseCSV(csvText: string): {
    headers: string[];
    rows: Array<Record<string, string>>;
    totalRows: number;
    successfulRows: number;
    errors: Array<{ rowIndex: number; error: string; rawRow: string }>;
  };
  parseCSVToRows(csvText: string): Array<Record<string, string>>;
  validateCSVStructure(csvText: string): { isValid: boolean; errors: string[] };
  createRowFromValues(
    headers: string[],
    values: string[]
  ): Record<string, string>;
}
