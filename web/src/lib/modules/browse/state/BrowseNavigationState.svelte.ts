/**
 * Browse Navigation State Service
 *
 * Focused microservice for managing browse navigation state.
 * Handles navigation mode and sections without business logic.
 */

import type { NavigationSectionConfig } from "$browse/domain";
import { GalleryNvaigationMode } from "$browse/domain";

export interface IBrowseNavigationState {
  // Reactive state getters
  readonly GalleryNvaigationMode: GalleryNvaigationMode;
  readonly navigationSections: NavigationSectionConfig[];

  // Actions
  setGalleryNvaigationMode(mode: GalleryNvaigationMode): void;
  setNavigationSections(sections: NavigationSectionConfig[]): void;
  goToFilterSelection(): void;
  goToSequenceBrowser(): void;
}

export class BrowseNavigationState implements IBrowseNavigationState {
  // Private reactive state
  #GalleryNvaigationMode = $state<GalleryNvaigationMode>(
    GalleryNvaigationMode.FILTER_SELECTION
  );
  #navigationSections = $state<NavigationSectionConfig[]>([]);

  // Reactive getters
  get GalleryNvaigationMode() {
    return this.#GalleryNvaigationMode;
  }

  get navigationSections() {
    return this.#navigationSections;
  }

  // Actions
  setGalleryNvaigationMode(mode: GalleryNvaigationMode): void {
    this.#GalleryNvaigationMode = mode;
  }

  setNavigationSections(sections: NavigationSectionConfig[]): void {
    this.#navigationSections = sections;
  }

  goToFilterSelection(): void {
    this.#GalleryNvaigationMode = GalleryNvaigationMode.FILTER_SELECTION;
  }

  goToSequenceBrowser(): void {
    this.#GalleryNvaigationMode = GalleryNvaigationMode.SEQUENCE_BROWSER;
  }
}
