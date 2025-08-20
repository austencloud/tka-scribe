/**
 * Browse Service Interface Definitions
 * These handle browsing, thumbnails, favorites, and navigation
 */

import type {
  IBrowseService,
  IDeleteService,
  IFavoritesService,
  IFilterPersistenceService,
  INavigationService,
  ISectionService,
  ISequenceIndexService,
  IThumbnailService,
} from "../../interfaces/browse-interfaces";
import { createServiceInterface } from "../types";

// Import service implementations
import { BrowseService } from "../../implementations/browse/BrowseService";
import { DeleteService } from "../../implementations/sequence/DeleteService";
import { FavoritesService } from "../../implementations/browse/FavoritesService";
import { FilterPersistenceService } from "../../implementations/persistence/FilterPersistenceService";
import { NavigationService } from "../../implementations/navigation/NavigationService";
import { SectionService } from "../../implementations/navigation/SectionService";
import { SequenceIndexService } from "../../implementations/sequence/SequenceIndexService";
import { ThumbnailService } from "../../implementations/export/ThumbnailService";

// Core browse services
export const IBrowseServiceInterface = createServiceInterface<IBrowseService>(
  "IBrowseService",
  BrowseService
);

export const IThumbnailServiceInterface =
  createServiceInterface<IThumbnailService>(
    "IThumbnailService",
    ThumbnailService
  );

export const ISequenceIndexServiceInterface =
  createServiceInterface<ISequenceIndexService>(
    "ISequenceIndexService",
    SequenceIndexService
  );

// Advanced browse services
export const IFavoritesServiceInterface =
  createServiceInterface<IFavoritesService>(
    "IFavoritesService",
    FavoritesService
  );

export const INavigationServiceInterface =
  createServiceInterface<INavigationService>(
    "INavigationService",
    NavigationService
  );

export const ISectionServiceInterface = createServiceInterface<ISectionService>(
  "ISectionService",
  SectionService
);

export const IFilterPersistenceServiceInterface =
  createServiceInterface<IFilterPersistenceService>(
    "IFilterPersistenceService",
    FilterPersistenceService
  );

export const IDeleteServiceInterface = createServiceInterface<IDeleteService>(
  "IDeleteService",
  DeleteService
);
