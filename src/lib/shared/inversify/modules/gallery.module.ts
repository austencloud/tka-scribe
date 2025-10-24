import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import {
  FavoritesService,
  GalleryCacheService,
  GalleryDeleteService,
  GalleryFilterService,
  GalleryLoader,
  GalleryMetadataExtractor,
  GallerySectionService,
  GallerySortService,
  GalleryThumbnailService,
  NavigationService,
} from "../../../modules";
import { OptimizedGalleryService } from "../../../modules/gallery/shared/services/implementations/OptimizedGalleryService";
import { FilterPersistenceService } from "../../persistence/services/implementations/FilterPersistenceService";
import { TYPES } from "../types";

export const galleryModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
    // === GALLERY SERVICES ===

    // Specialized gallery services (use directly, no orchestration layer needed!)
    options.bind(TYPES.IGalleryMetadataExtractor).to(GalleryMetadataExtractor);
    options.bind(TYPES.IGalleryCacheService).to(GalleryCacheService);
    options.bind(TYPES.IGalleryFilterService).to(GalleryFilterService);
    options.bind(TYPES.IGallerySortService).to(GallerySortService);
    options.bind(TYPES.IGalleryLoader).to(GalleryLoader);

    // Other gallery services
    options.bind(TYPES.IFavoritesService).to(FavoritesService);
    options.bind(TYPES.IFilterPersistenceService).to(FilterPersistenceService);

    // Note: IPersistenceService is now bound in data.module.ts to DexiePersistenceService
    // options.bind(TYPES.IPersistenceService).to(GalleryPersistenceService); // REMOVED - conflicts with DexiePersistenceService
    options.bind(TYPES.ISectionService).to(GallerySectionService);
    options.bind(TYPES.IGalleryThumbnailService).to(GalleryThumbnailService);
    options.bind(TYPES.IOptimizedGalleryService).to(OptimizedGalleryService);
    options.bind(TYPES.INavigationService).to(NavigationService);
    options.bind(TYPES.IDeleteService).to(GalleryDeleteService);
  }
);
