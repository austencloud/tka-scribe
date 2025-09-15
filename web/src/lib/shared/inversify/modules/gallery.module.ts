import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { FavoritesService, GalleryDeleteService, GallerySectionService, GalleryService, GalleryThumbnailService, NavigationService } from "../../../modules";
import { FilterPersistenceService } from "../../persistence/services/implementations/FilterPersistenceService";
import { TYPES } from "../types";


export const galleryModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
    // === GALLERY SERVICES ===

    options.bind(TYPES.IFavoritesService).to(FavoritesService);
    options.bind(TYPES.IFilterPersistenceService).to(FilterPersistenceService);

    // Note: IPersistenceService is now bound in data.module.ts to DexiePersistenceService
    // options.bind(TYPES.IPersistenceService).to(GalleryPersistenceService); // REMOVED - conflicts with DexiePersistenceService
    options.bind(TYPES.ISectionService).to(GallerySectionService);
    options.bind(TYPES.IGalleryService).to(GalleryService);
    options.bind(TYPES.IGalleryThumbnailService).to(GalleryThumbnailService);
    options.bind(TYPES.INavigationService).to(NavigationService);
    options.bind(TYPES.IDeleteService).to(GalleryDeleteService);
  }
);
