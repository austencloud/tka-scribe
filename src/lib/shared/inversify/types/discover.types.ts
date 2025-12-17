/**
 * Discover/Browse Service Type Identifiers
 *
 * Services for browsing, filtering, and displaying sequences.
 */

export const DiscoverTypes = {
  // Discover Services
  IDiscoverThumbnailService: Symbol.for("IDiscoverThumbnailService"),
  IDiscoverCacheService: Symbol.for("IDiscoverCacheService"),
  IDiscoverFilterService: Symbol.for("IDiscoverFilterService"),
  IDiscoverLoader: Symbol.for("IDiscoverLoader"),
  IDiscoverMetadataExtractor: Symbol.for("IDiscoverMetadataExtractor"),
  IDiscoverSortService: Symbol.for("IDiscoverSortService"),
  IOptimizedDiscoverService: Symbol.for("IOptimizedDiscoverService"),
  IDiscoverEventHandlerService: Symbol.for("IDiscoverEventHandlerService"),
  IDiscoverPanelManager: Symbol.for("IDiscoverPanelManager"),

  // Browse State
  IBrowseStatePersister: Symbol.for("IBrowseStatePersister"),
  IFilterPersistenceService: Symbol.for("IFilterPersistenceService"),

  // Section & Index
  ISectionService: Symbol.for("ISectionService"),
  ISequenceIndexService: Symbol.for("ISequenceIndexService"),
  ISequenceDifficultyCalculator: Symbol.for("ISequenceDifficultyCalculator"),

  // Favorites & Delete
  IFavoritesService: Symbol.for("IFavoritesService"),
  IDeleteService: Symbol.for("IDeleteService"),

  // Community
  ILeaderboardService: Symbol.for("ILeaderboardService"),
  ICommunityStatsService: Symbol.for("ICommunityStatsService"),
} as const;
