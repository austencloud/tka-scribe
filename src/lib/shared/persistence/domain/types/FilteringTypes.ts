/**
 * Simple Filtering Types - Keep It Simple!
 *
 * Just the essential types for basic filtering.
 */

/**
 * Simple filter value - just strings, numbers, or booleans
 */
export type ExploreFilterValue = string | number | boolean | string[] | null;

/**
 * Explore Filter Interface
 *
 * Represents the current filter state in the explore module.
 */
export interface ExploreFilter {
  showFavoritesOnly?: boolean;
  sortBy?: string;
  difficultyLevels?: number[];
}
