/**
 * Browse Service Interfaces
 *
 * Interfaces for browsing, filtering, searching, and managing sequences.
 * This includes navigation, thumbnails, and search functionality.
 */

import type {
  BrowseSequenceMetadata,
  FilterType,
  FilterValue,
  SortMethod,
} from "./domain-types";

// ============================================================================
// BROWSE SERVICE INTERFACES
// ============================================================================

/**
 * Main browse service for sequence discovery and filtering
 */
export interface IBrowseService {
  loadSequenceMetadata(): Promise<BrowseSequenceMetadata[]>;
  applyFilter(
    sequences: BrowseSequenceMetadata[],
    filterType: FilterType,
    filterValue: FilterValue
  ): Promise<BrowseSequenceMetadata[]>;
  sortSequences(
    sequences: BrowseSequenceMetadata[],
    sortMethod: SortMethod
  ): Promise<BrowseSequenceMetadata[]>;
  groupSequencesIntoSections(
    sequences: BrowseSequenceMetadata[],
    sortMethod: SortMethod
  ): Promise<Record<string, BrowseSequenceMetadata[]>>;
  getUniqueValues(field: keyof BrowseSequenceMetadata): Promise<string[]>;
  getFilterOptions(filterType: FilterType): Promise<string[]>;
}

/**
 * Thumbnail management service
 */
export interface IThumbnailService {
  getThumbnailUrl(sequenceId: string, thumbnailPath: string): string;
  preloadThumbnail(sequenceId: string, thumbnailPath: string): Promise<void>;
  getThumbnailMetadata(
    sequenceId: string
  ): Promise<{ width: number; height: number } | null>;
  clearThumbnailCache(): void;
}

/**
 * Sequence indexing and search service
 */
export interface ISequenceIndexService {
  loadSequenceIndex(): Promise<BrowseSequenceMetadata[]>;
  buildSearchIndex(sequences: BrowseSequenceMetadata[]): Promise<void>;
  searchSequences(query: string): Promise<BrowseSequenceMetadata[]>;
  refreshIndex(): Promise<void>;
}

// ============================================================================
// BROWSE MANAGEMENT SERVICES
// ============================================================================

// Re-export types from service implementations for convenience
export type {
  DeleteConfirmationData,
  DeleteResult,
  IDeleteService,
} from "../implementations/DeleteService";

export type { IFavoritesService } from "../implementations/FavoritesService";

export type {
  BrowseState,
  FilterState,
  IFilterPersistenceService,
} from "../implementations/FilterPersistenceService";

export type {
  INavigationService,
  NavigationItem,
  NavigationSection,
} from "../implementations/NavigationService";

export type {
  ISectionService,
  SectionConfiguration,
  SequenceSection,
} from "../implementations/SectionService";
