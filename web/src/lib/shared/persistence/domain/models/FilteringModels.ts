/**
 * Simple Filtering Models - Keep It Simple!
 *
 * Just the essential models for basic filtering.
 */

import type { GalleryFilterType } from "../enums/FilteringEnums";
import type { GalleryFilterValue } from "../types/FilteringTypes";

/**
 * Simple active filter - just type and value
 */
export interface ActiveFilter {
  type: GalleryFilterType;
  value: GalleryFilterValue;
  appliedAt: Date;
}

/**
 * Simple filter option for dropdowns
 */
export interface FilterOptionItem {
  label: string;
  value: GalleryFilterValue;
  count: number;
}
