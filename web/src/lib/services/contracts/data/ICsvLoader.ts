import type { CsvDataSet } from "../../../domain/data-interfaces/data-interfaces";

export interface ICsvLoader {
  loadCsvData(): Promise<CsvDataSet>;
  getCsvData(): CsvDataSet | null;
  clearCache(): void;
}
