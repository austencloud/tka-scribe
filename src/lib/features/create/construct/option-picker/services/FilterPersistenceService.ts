import { injectable } from "inversify";
import type { SortMethod, TypeFilter } from "../option-viewer/domain/option-picker-types";

export interface IFilterPersistenceService {
  saveFilters(
    sortMethod: SortMethod,
    typeFilter: TypeFilter,
    endPositionFilter: Record<string, boolean>,
    reversalFilter: Record<string, boolean>
  ): void;
  loadFilters(): {
    sortMethod: SortMethod;
    typeFilter: TypeFilter;
    endPositionFilter: Record<string, boolean>;
    reversalFilter: Record<string, boolean>;
  } | null;
  clearFilters(): void;
}

@injectable()
export class FilterPersistenceService implements IFilterPersistenceService {
  private readonly STORAGE_KEY = "tka-option-picker-filters";

  saveFilters(
    sortMethod: SortMethod,
    typeFilter: TypeFilter,
    endPositionFilter: Record<string, boolean>,
    reversalFilter: Record<string, boolean>
  ): void {
    try {
      const filterData = {
        sortMethod,
        typeFilter,
        endPositionFilter,
        reversalFilter,
        timestamp: Date.now(),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filterData));
    } catch (error) {
      console.warn(
        "⚠️ FilterPersistenceService: Failed to save filters:",
        error
      );
    }
  }

  loadFilters(): {
    sortMethod: SortMethod;
    typeFilter: TypeFilter;
    endPositionFilter: Record<string, boolean>;
    reversalFilter: Record<string, boolean>;
  } | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const parsed: unknown = JSON.parse(stored);

      // Type guard to validate the parsed data
      if (!this.isValidFilterData(parsed)) {
        console.warn(
          "⚠️ FilterPersistenceService: Invalid filter data structure"
        );
        return null;
      }

      return {
        sortMethod: parsed["sortMethod"],
        typeFilter: parsed["typeFilter"],
        endPositionFilter: parsed.endPositionFilter ?? {},
        reversalFilter: parsed.reversalFilter ?? {},
      };
    } catch (error) {
      console.warn(
        "⚠️ FilterPersistenceService: Failed to load filters:",
        error
      );
      return null;
    }
  }

  /**
   * Type guard for filter data validation
   */
  private isValidFilterData(obj: unknown): obj is {
    sortMethod: SortMethod;
    typeFilter: TypeFilter;
    endPositionFilter?: Record<string, boolean>;
    reversalFilter?: Record<string, boolean>;
  } {
    if (!obj || typeof obj !== "object") return false;

    const data = obj as Record<string, unknown>;

    return (
      typeof data["sortMethod"] === "string" &&
      typeof data["typeFilter"] === "string"
    );
  }

  clearFilters(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn(
        "⚠️ FilterPersistenceService: Failed to clear filters:",
        error
      );
    }
  }
}
