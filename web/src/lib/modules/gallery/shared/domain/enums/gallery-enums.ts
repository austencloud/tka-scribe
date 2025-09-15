// ============================================================================
// BROWSE ENUMS
// ============================================================================

// Note: GalleryFilterType has been moved to filtering/domain/filtering-enums.ts
// and is re-exported from this module's index.ts for compatibility

export enum GallerySortMethod {
  ALPHABETICAL = "alphabetical",
  dateAdded = "dateAdded",
  difficultyLevel = "difficultyLevel",
  sequenceLength = "sequenceLength",
  AUTHOR = "author",
  POPULARITY = "popularity",
}

export enum GalleryNavigationMode {
  FILTER_SELECTION = "filter_selection",
  SEQUENCE_BROWSER = "sequence_browser",
}
