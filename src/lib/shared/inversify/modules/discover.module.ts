import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import {
  DiscoverCacheService,
  DiscoverDeleteService,
  DiscoverEventHandlerService,
  DiscoverFilterService,
  DiscoverLoader,
  DiscoverMetadataExtractor,
  DiscoverSectionService,
  DiscoverSortService,
  DiscoverThumbnailService,
  FavoritesService,
  NavigationService,
} from "../../../modules";
import { SequenceDifficultyCalculator } from "../../../modules/discover/gallery/display/services/implementations/SequenceDifficultyCalculator";
import { OptimizedDiscoverService } from "../../../modules/discover/shared/services/implementations/OptimizedDiscoverService";
import { FilterPersistenceService } from "../../persistence/services/implementations/FilterPersistenceService";
import { TYPES } from "../types";

export const exploreModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === EXPLORE SERVICES ===

    // Specialized explore/Explore services (use directly, no orchestration layer needed!)
    options
      .bind(TYPES.ISequenceDifficultyCalculator)
      .to(SequenceDifficultyCalculator);
    options.bind(TYPES.IDiscoverMetadataExtractor).to(DiscoverMetadataExtractor);
    options.bind(TYPES.IDiscoverCacheService).to(DiscoverCacheService);
    options.bind(TYPES.IDiscoverFilterService).to(DiscoverFilterService);
    options.bind(TYPES.IDiscoverSortService).to(DiscoverSortService);
    options.bind(TYPES.IDiscoverLoader).to(DiscoverLoader);

    // Other explore/Explore services
    options.bind(TYPES.IFavoritesService).to(FavoritesService);
    options.bind(TYPES.IFilterPersistenceService).to(FilterPersistenceService);

    // Note: IPersistenceService is now bound in data.module.ts to DexiePersistenceService
    // options.bind(TYPES.IPersistenceService).to(DiscoverPersistenceService); // REMOVED - conflicts with DexiePersistenceService
    options.bind(TYPES.ISectionService).to(DiscoverSectionService);
    options.bind(TYPES.IDiscoverThumbnailService).to(DiscoverThumbnailService);
    options.bind(TYPES.IOptimizedDiscoverService).to(OptimizedDiscoverService);
    options.bind(TYPES.INavigationService).to(NavigationService);
    options.bind(TYPES.IDeleteService).to(DiscoverDeleteService);
    options
      .bind(TYPES.IDiscoverEventHandlerService)
      .to(DiscoverEventHandlerService);
  }
);
