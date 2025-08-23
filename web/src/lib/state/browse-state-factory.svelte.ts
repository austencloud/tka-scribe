/**
 * Browse State Factory - Clean Architecture
 *
 * Creates a clean, focused browse state using microservices.
 * Replaces the 738-line monolith with focused, testable services.
 */

import type {
  SequenceData,
  FilterType,
  FilterValue,
  BrowseLoadingState,
} from "$lib/services/interfaces/domain-types";
import type {
  IBrowseService,
  IDeleteService,
  IFavoritesService,
  IFilterPersistenceService,
  INavigationService,
  ISectionService,
  ISequenceIndexService,
  IThumbnailService,
  NavigationSection,
  DeleteConfirmationData,
} from "$lib/services/interfaces/browse-interfaces";
import { NavigationMode } from "$lib/domain/browse";

import { BrowseFilterStateService } from "./services/BrowseFilterStateService.svelte";
import { BrowseNavigationStateService } from "./services/BrowseNavigationStateService.svelte";
import { BrowseSelectionStateService } from "./services/BrowseSelectionStateService.svelte";
import { BrowseDisplayStateService } from "./services/BrowseDisplayStateService.svelte";
import { BrowseSearchStateService } from "./services/BrowseSearchStateService.svelte";
import { BrowseStateCoordinator } from "./services/BrowseStateCoordinator.svelte";

export interface BrowseState {
  // State microservices (reactive)
  readonly filterState: BrowseFilterStateService;
  readonly navigationState: BrowseNavigationStateService;
  readonly selectionState: BrowseSelectionStateService;
  readonly displayState: BrowseDisplayStateService;
  readonly searchState: BrowseSearchStateService;

  // Coordinator (orchestration)
  readonly coordinator: BrowseStateCoordinator;

  // Convenience getters (derived from microservices)
  readonly currentFilter: { type: FilterType; value: FilterValue } | null;
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly displayedSequences: SequenceData[];
  readonly navigationMode: NavigationMode;
  readonly navigationSections: NavigationSection[];
  readonly selectedSequence: SequenceData | null;

  // Additional properties needed by BrowseTab
  readonly allSequences: SequenceData[];
  readonly filteredSequences: SequenceData[];
  readonly loadingState: BrowseLoadingState; // From displayState
  readonly searchQuery: string;

  // Delegation methods (common operations)
  loadAllSequences(): Promise<void>;
  applyFilter(type: FilterType, value: FilterValue): Promise<void>;
  searchSequences(query: string): Promise<void>;
  selectSequence(sequence: SequenceData): Promise<void>;
  backToFilters(): Promise<void>;
  clearError(): void;

  // Additional methods expected by event handlers
  clearSelection(): void;
  toggleFavorite(sequenceId: string): Promise<void>;
  prepareDeleteSequence(sequence: SequenceData): void;
  confirmDeleteSequence(): Promise<void>;
  cancelDeleteSequence(): void;

  // Navigation methods
  toggleNavigationSection(sectionId: string): void;
  setActiveNavigationItem(sectionId: string, itemId: string): void;
  filterSequencesByNavigation(
    item: unknown,
    sectionType: string
  ): Promise<SequenceData[]>;

  // Delete operations (delegated to existing delete service)
  readonly deleteConfirmation: DeleteConfirmationData | null;
  readonly showDeleteDialog: boolean;
}

export function createBrowseState(
  browseService: IBrowseService,
  thumbnailService: IThumbnailService,
  sequenceIndexService: ISequenceIndexService,
  favoritesService: IFavoritesService,
  navigationService: INavigationService,
  _filterPersistenceService: IFilterPersistenceService,
  _sectionService: ISectionService,
  _deleteService: IDeleteService
): BrowseState {
  // Create focused microservices
  const filterState = new BrowseFilterStateService();
  const navigationState = new BrowseNavigationStateService();
  const selectionState = new BrowseSelectionStateService();
  const displayState = new BrowseDisplayStateService();
  const searchState = new BrowseSearchStateService();

  // Create coordinator
  const coordinator = new BrowseStateCoordinator(
    filterState,
    navigationState,
    selectionState,
    displayState,
    searchState,
    browseService,
    navigationService,
    sequenceIndexService,
    favoritesService,
    thumbnailService
  );

  // Delete state (delegate to existing services)
  const deleteConfirmation = $state<DeleteConfirmationData | null>(null);
  const showDeleteDialog = $state<boolean>(false);

  return {
    // Expose microservices
    filterState,
    navigationState,
    selectionState,
    displayState,
    searchState,
    coordinator,

    // Convenience getters (reactive)
    get currentFilter() {
      return filterState.currentFilter;
    },
    get isLoading() {
      return displayState.isLoading;
    },
    get hasError() {
      return displayState.hasError;
    },
    get displayedSequences() {
      return coordinator.displayedSequences;
    },
    get navigationMode() {
      return navigationState.navigationMode;
    },
    get navigationSections() {
      return navigationState.navigationSections;
    },
    get selectedSequence() {
      return selectionState.selectedSequence;
    },

    // Additional properties
    get allSequences() {
      return coordinator.allSequences;
    },
    get filteredSequences() {
      return coordinator.filteredSequences;
    },
    get loadingState() {
      return displayState.loadingState;
    },
    get searchQuery() {
      return searchState.searchQuery;
    },

    // Delete state (TODO: Refactor delete logic into microservice)
    get deleteConfirmation() {
      return deleteConfirmation;
    },
    get showDeleteDialog() {
      return showDeleteDialog;
    },

    // Delegation methods
    async loadAllSequences() {
      await coordinator.loadAllSequences();
    },

    async applyFilter(type: FilterType, value: FilterValue) {
      await coordinator.applyFilter(type, value);
    },

    async searchSequences(query: string) {
      await coordinator.searchSequences(query);
    },

    async selectSequence(sequence: SequenceData) {
      await coordinator.selectSequence(sequence);
    },

    async backToFilters() {
      await coordinator.backToFilters();
    },

    clearError() {
      displayState.clearError();
    },

    // Additional methods expected by event handlers
    clearSelection() {
      selectionState.clearSelection();
    },

    async toggleFavorite(sequenceId: string) {
      // TODO: Implement via coordinator - delegate to FavoritesService
      console.log("Toggle favorite:", sequenceId);
    },

    prepareDeleteSequence(sequence: SequenceData) {
      // TODO: Implement delete confirmation logic
      console.log("Prepare delete:", sequence.id);
    },

    async confirmDeleteSequence() {
      // TODO: Implement delete confirmation logic
      console.log("Confirm delete");
    },

    cancelDeleteSequence() {
      // TODO: Implement delete confirmation logic
      console.log("Cancel delete");
    },

    // Navigation methods
    toggleNavigationSection(sectionId: string) {
      // TODO: Implement navigation section toggle
      console.log("Toggle navigation section:", sectionId);
    },

    setActiveNavigationItem(sectionId: string, itemId: string) {
      // TODO: Implement navigation item activation
      console.log("Set active navigation item:", sectionId, itemId);
    },

    async filterSequencesByNavigation(item: unknown, sectionType: string) {
      // TODO: Implement navigation filtering
      console.log("Filter by navigation:", item, sectionType);
      return [];
    },
  };
}
