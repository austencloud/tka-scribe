import type { PictographData } from "../../../../../../../shared";
import type { SortMethod, TypeFilter } from "../../domain";

// ===== Service Interface =====
export interface IOptionPickerService {
  /**
   * Load available options based on current sequence
   */
  loadOptionsFromSequence(sequence: PictographData[]): Promise<PictographData[]>;

  /**
   * Get filtered and sorted options
   */
  getFilteredOptions(
    options: PictographData[],
    sortMethod: SortMethod,
    typeFilter?: TypeFilter
  ): PictographData[];



  /**
   * Select an option and handle any side effects
   */
  selectOption(option: PictographData): Promise<void>;

  /**
   * Calculate end position from motion data
   */
  getEndPosition(pictographData: PictographData): string | null;

  /**
   * Organize pictographs by sort method (moved from component)
   */
  organizePictographs(
    pictographs: PictographData[],
    sortMethod: SortMethod
  ): Array<{ title: string; pictographs: PictographData[]; type: 'section' | 'grouped' }>;

  /**
   * Filter pictographs by letter type (moved from component)
   */
  filterPictographsByType(pictographs: PictographData[], letterType: string): PictographData[];
}
