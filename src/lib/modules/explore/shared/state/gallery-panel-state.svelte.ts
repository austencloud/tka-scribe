/**
 * Gallery Panel State
 *
 * Manages the unified side panel system for Gallery:
 * - Filters panel
 * - Sequence detail panel
 * - View presets sheet (mobile)
 * - Sort/jump sheet (mobile)
 *
 * Ensures panels are mutually exclusive and handles pin state
 */

import type { SequenceData } from "$shared";

export type PanelType = "filters" | "detail" | "viewPresets" | "sortJump" | null;

class GalleryPanelManager {
  // Current open panel
  activePanel = $state<PanelType>(null);

  // Pin state (desktop only)
  isPinned = $state(false);

  // Active sequence for detail panel
  activeSequence = $state<SequenceData | null>(null);

  // Computed
  get isOpen() {
    return this.activePanel !== null;
  }

  get isFiltersOpen() {
    return this.activePanel === "filters";
  }

  get isDetailOpen() {
    return this.activePanel === "detail";
  }

  get isViewPresetsOpen() {
    return this.activePanel === "viewPresets";
  }

  get isSortJumpOpen() {
    return this.activePanel === "sortJump";
  }

  // Actions
  openFilters() {
    this.activePanel = "filters";
  }

  openDetail(sequence: SequenceData) {
    this.activeSequence = sequence;
    this.activePanel = "detail";
  }

  openViewPresets() {
    this.activePanel = "viewPresets";
  }

  openSortJump() {
    this.activePanel = "sortJump";
  }

  close() {
    this.activePanel = null;
    // Clear sequence after animation completes
    setTimeout(() => {
      if (!this.isOpen) {
        this.activeSequence = null;
      }
    }, 400);
  }

  togglePin() {
    this.isPinned = !this.isPinned;
  }
}

export const galleryPanelManager = new GalleryPanelManager();
