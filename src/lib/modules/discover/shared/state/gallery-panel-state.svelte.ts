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

import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";

export type PanelType =
  | "filters"
  | "detail"
  | "viewPresets"
  | "sortJump"
  | null;

class GalleryPanelManager {
  // Current open panel
  activePanel = $state<PanelType>(null);

  // Pin state (desktop only)
  isPinned = $state(false);

  // Active sequence for detail panel
  activeSequence = $state<SequenceData | null>(null);

  // Track if we're in a panel transition (prevents grid jumping)
  private isTransitioning = $state(false);

  // Computed
  get isOpen() {
    return this.activePanel !== null || this.isTransitioning;
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
    console.log("🔵 PANEL: openFilters() called");
    this.switchPanel("filters");
  }

  openDetail(sequence: SequenceData) {
    console.log("🔵 PANEL: openDetail() called");
    this.activeSequence = sequence;
    this.switchPanel("detail");
  }

  openViewPresets() {
    console.log("🔵 PANEL: openViewPresets() called");
    this.switchPanel("viewPresets");
  }

  openSortJump() {
    console.log("🔵 PANEL: openSortJump() called");
    this.switchPanel("sortJump");
  }

  // Smart panel switching that handles transitions smoothly
  private switchPanel(newPanel: PanelType) {
    const previousPanel = this.activePanel;
    console.log(`📊 SWITCH: ${previousPanel} → ${newPanel}`);

    // If we're switching from one right-side panel to another (filters ↔ detail)
    // keep grid padding stable during the crossfade
    if (
      previousPanel &&
      previousPanel !== newPanel &&
      ((previousPanel === "filters" && newPanel === "detail") ||
        (previousPanel === "detail" && newPanel === "filters"))
    ) {
      console.log(
        "✨ TRANSITION: Detected right-side panel switch, maintaining grid padding"
      );
      // Switch immediately - drawers will crossfade
      this.activePanel = newPanel;
      this.isTransitioning = true;
      console.log(
        `📊 STATE: activePanel=${this.activePanel}, isTransitioning=${this.isTransitioning}, isOpen=${this.isOpen}`
      );

      // Keep transition active during drawer animation to maintain grid padding
      setTimeout(() => {
        this.isTransitioning = false;
        console.log(
          `📊 STATE (after 350ms): activePanel=${this.activePanel}, isTransitioning=${this.isTransitioning}, isOpen=${this.isOpen}`
        );
      }, 350); // Match drawer animation duration
    } else {
      console.log("⚡ DIRECT: Direct panel switch, no transition needed");
      // Direct switch for other cases
      this.activePanel = newPanel;
      this.isTransitioning = false;
      console.log(
        `📊 STATE: activePanel=${this.activePanel}, isTransitioning=${this.isTransitioning}, isOpen=${this.isOpen}`
      );
    }
  }

  close() {
    console.log("🔵 PANEL: close() called");
    this.activePanel = null;
    this.isTransitioning = false;
    console.log(
      `📊 STATE: activePanel=${this.activePanel}, isTransitioning=${this.isTransitioning}, isOpen=${this.isOpen}`
    );

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
