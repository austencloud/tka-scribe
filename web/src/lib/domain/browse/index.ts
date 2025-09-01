/**
 * Browse Domain Models - Main Export
 *
 * Central export for all browse-related domain models and types.
 */

// Filter Types - now from enums and models
export { FilterType } from "../enums/enums";
export {
  createFilterConfig,
  formatFilterDisplayName,
  isMultiValueFilter,
  isRangeFilter,
} from "../models/browse/BrowseFilters";
export type { FilterConfig } from "../models/browse/FilterModels";
export type { FilterValue } from "../types/BrowseTypes";

// Sort Methods - now from enums and models
export { SortMethod } from "../enums/enums";
export {
  createCustomSortConfig,
  getAvailableSortConfigs,
  getAvailableSortMethods,
  getSortConfig,
  getSortDisplayName,
  SORT_CONFIGS,
} from "../models/browse/BrowseSorting";
export type { SortConfig } from "../models/browse/SortModels";
export type { SortDirection } from "../types/BrowseTypes";

// Browse State
export {
  createDefaultBrowseState,
  createDefaultDisplayState,
  createDefaultLoadingState,
  NavigationMode,
  updateBrowseState,
} from "../models/browse/BrowseState";
export type {
  BrowseDisplayState,
  BrowseLoadingState,
  BrowseState,
  SequenceFilterResult,
} from "../models/browse/BrowseState";

// Main browse types including legacy ones from models
export type {
  BrowseConfig,
  BrowseDeleteConfirmationData,
  BrowseDeleteResult,
  BrowseResult,
  FilterOption,
  FilterState,
  NavigationItem,
  NavigationSection,
  SearchCriteria,
  SectionConfiguration,
  SequenceSection,
  SortOption,
} from "../models/browse/BrowseModels";

// Re-export GridMode from main enums to maintain compatibility
export { GridMode } from "../enums/enums";

// Metadata types for Browse functionality
export * from "../models/browse/Metadata";

// Favorites types - now from models
export type {
  FavoriteItem,
  FavoritesCollection,
} from "../models/browse/FavoritesModels";

// Animation types
export type {
  AnimationConfig,
  AnimationState,
} from "../models/browse/AnimationModels";
