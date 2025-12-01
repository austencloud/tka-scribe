import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { DiscoverCacheService } from "../../../features/discover/gallery/display/services/implementations/DiscoverCacheService";
import { DiscoverFilterService } from "../../../features/discover/gallery/display/services/implementations/DiscoverFilterService";
import { DiscoverLoader } from "../../../features/discover/gallery/display/services/implementations/DiscoverLoader";
import { DiscoverMetadataExtractor } from "../../../features/discover/gallery/display/services/implementations/DiscoverMetadataExtractor";
import { DiscoverSectionService } from "../../../features/discover/gallery/display/services/implementations/DiscoverSectionService";
import { DiscoverSortService } from "../../../features/discover/gallery/display/services/implementations/DiscoverSortService";
import { DiscoverThumbnailService } from "../../../features/discover/gallery/display/services/implementations/DiscoverThumbnailService";
import { FavoritesService } from "../../../features/discover/shared/services/implementations/FavoritesService";
import { NavigationService } from "../../../features/discover/gallery/navigation/services/implementations/NavigationService";
import { DiscoverDeleteService } from "../../../features/discover/shared/services/implementations/DiscoverDeleteService";
import { DiscoverEventHandlerService } from "../../../features/discover/shared/services/implementations/DiscoverEventHandlerService";
import { SequenceDifficultyCalculator } from "../../../features/discover/gallery/display/services/implementations/SequenceDifficultyCalculator";
import { OptimizedDiscoverService } from "../../../features/discover/shared/services/implementations/OptimizedDiscoverService";
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
    // DiscoverLoader MUST be singleton - sequence index cache (4.7MB) needs to persist
    options.bind(TYPES.IDiscoverLoader).to(DiscoverLoader).inSingletonScope();

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
