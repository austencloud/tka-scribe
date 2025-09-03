/**
 * Browse Tab Domain Exports
 *
 * All types, models, and enums for the Browse tab.
 */

// Models
export * from "./models/BrowseFilters";
export * from "./models/BrowseModels";
export * from "./models/BrowseSorting";
export * from "./models/BrowseState";
export * from "./models/FavoritesModels";
export * from "./models/FilterModels";
export * from "./models/Metadata";
export * from "./models/PanelManagement";
export * from "./models/SequenceState";
export * from "./models/SortModels";

// Types
export * from "./types/BrowseTypes";

// Specific type exports with aliases for backward compatibility
export type {
  BrowsePanelConfiguration as BrowsePanelConfig,
  BrowsePanelState,
  ResizeOperation,
  SplitterConfig,
} from "./models/PanelManagement";

// Factory functions
export {
  createFilterConfig,
  formatFilterDisplayName,
  isMultiValueFilter,
  isRangeFilter,
} from "./models/BrowseFilters";

export {
  createCustomSortConfig,
  getAvailableSortConfigs,
  getAvailableSortMethods,
  getSortConfig,
  getSortDisplayName,
  SORT_CONFIGS,
} from "./models/BrowseSorting";

export {
  createDefaultBrowseState,
  createDefaultDisplayState,
  createDefaultLoadingState,
  NavigationMode,
  updateBrowseState,
} from "./models/BrowseState";
