import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { DiscoverCache } from "../../../features/discover/gallery/display/services/implementations/DiscoverCache";
import { DiscoverFilter } from "../../../features/discover/gallery/display/services/implementations/DiscoverFilter";
import { DiscoverLoader } from "../../../features/discover/gallery/display/services/implementations/DiscoverLoader";
import { DiscoverMetadataExtractor } from "../../../features/discover/gallery/display/services/implementations/DiscoverMetadataExtractor";
import { DiscoverSectionManager } from "../../../features/discover/gallery/display/services/implementations/DiscoverSectionManager";
import { DiscoverSorter } from "../../../features/discover/gallery/display/services/implementations/DiscoverSorter";
import { DiscoverThumbnailProvider } from "../../../features/discover/gallery/display/services/implementations/DiscoverThumbnailProvider";
import { DiscoverThumbnailCache } from "../../../features/discover/gallery/display/services/implementations/DiscoverThumbnailCache";
import { FavoritesManager } from "../../../features/discover/shared/services/implementations/FavoritesManager";
import { Navigator } from "../../../features/discover/gallery/navigation/services/implementations/Navigator";
import { DiscoverDeleter } from "../../../features/discover/shared/services/implementations/DiscoverDeleter";
import { DiscoverEventHandler } from "../../../features/discover/shared/services/implementations/DiscoverEventHandler";
import { SequenceDifficultyCalculator } from "../../../features/discover/gallery/display/services/implementations/SequenceDifficultyCalculator";
import { OptimizedDiscoverer } from "../../../features/discover/shared/services/implementations/OptimizedDiscoverer";
import { FilterPersister } from "../../persistence/services/implementations/FilterPersister";
import { TYPES } from "../types";

export const exploreModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === EXPLORE SERVICES ===

    // Specialized explore/Explore services (use directly, no orchestration layer needed!)
    options
      .bind(TYPES.ISequenceDifficultyCalculator)
      .to(SequenceDifficultyCalculator);
    options
      .bind(TYPES.IDiscoverMetadataExtractor)
      .to(DiscoverMetadataExtractor);
    options.bind(TYPES.IDiscoverCache).to(DiscoverCache);
    options.bind(TYPES.IDiscoverFilter).to(DiscoverFilter);
    options.bind(TYPES.IDiscoverSorter).to(DiscoverSorter);
    // DiscoverLoader MUST be singleton - sequence index cache (4.7MB) needs to persist
    options.bind(TYPES.IDiscoverLoader).to(DiscoverLoader).inSingletonScope();

    // Other explore/Explore services
    options.bind(TYPES.IFavoritesManager).to(FavoritesManager);
    options.bind(TYPES.IFilterPersister).to(FilterPersister);

    // Note: IPersistenceService is now bound in data.module.ts to DexiePersistenceService
    // options.bind(TYPES.IPersistenceService).to(DiscoverPersistenceService); // REMOVED - conflicts with DexiePersistenceService
    options.bind(TYPES.ISectionManager).to(DiscoverSectionManager);
    options
      .bind(TYPES.IDiscoverThumbnailProvider)
      .to(DiscoverThumbnailProvider);
    // Singleton for IndexedDB cache persistence (local device cache)
    options
      .bind(TYPES.IDiscoverThumbnailCache)
      .to(DiscoverThumbnailCache)
      .inSingletonScope();
    // Note: ICloudThumbnailCache is bound in share.module (tier 2) for cross-feature availability
    options.bind(TYPES.IOptimizedDiscoverer).to(OptimizedDiscoverer);
    options.bind(TYPES.INavigator).to(Navigator);
    options.bind(TYPES.IDiscoverDeleter).to(DiscoverDeleter);
    options.bind(TYPES.IDiscoverEventHandler).to(DiscoverEventHandler);
  }
);
