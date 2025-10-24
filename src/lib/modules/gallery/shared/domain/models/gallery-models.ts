import type { SequenceData } from "$shared";
import type { GallerySortMethod } from "../enums";

/**
 * Essential Browse Models - Keep It Simple!
 *
 * Only the models actually needed for basic browse functionality.
 * No over-engineering, no complex state management.
 */

export interface GallerySection {
  id: string;
  title: string;
  count: number;
  sequences: SequenceData[];
  isExpanded: boolean;
  sortOrder: number;
}

// Simple delete confirmation data
export interface SequenceDeleteConfirmationData {
  sequence: SequenceData;
  relatedSequences: SequenceData[];
}

// Essential types that are still needed by other modules
export interface SectionConfig {
  groupBy:
    | keyof SequenceData
    | "letter"
    | "length"
    | "difficulty"
    | "date"
    | "none";
  sortMethod: GallerySortMethod;
  showEmptySections: boolean;
  expandedSections?: Set<string>;
  sortOrder?: "asc" | "desc";
  showCounts?: boolean;
}

export interface SequenceSection {
  id: string;
  title: string;
  count: number;
  sequences: SequenceData[];
  isExpanded: boolean;
  sortOrder: number;
}

// Simple display state for components that need it
export interface GalleryDisplayState {
  currentView: "filter_selection" | "sequence_browser";
  selectedSequence: SequenceData | null;
  isSequenceDetailOpen: boolean;
}

export interface GalleryLoadingState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
}

// Factory functions
export function createDefaultDisplayState(): GalleryDisplayState {
  return {
    currentView: "filter_selection",
    selectedSequence: null,
    isSequenceDetailOpen: false,
  };
}

export function createDefaultLoadingState(): GalleryLoadingState {
  return {
    isLoading: false,
    hasError: false,
    errorMessage: null,
  };
}

// Simple state for persistence (if needed)
export interface CompleteGalleryState {
  lastUpdated: Date;
  version: number;
}
