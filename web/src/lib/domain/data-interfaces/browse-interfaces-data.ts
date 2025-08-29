/**
 * Browse Service Interfaces
 *
 * Interfaces for browsing, filtering, searching, and managing sequences.
 * This includes navigation, thumbnails, and search functionality.
 */
// ============================================================================
// BROWSE SERVICE INTERFACES
// ============================================================================
/**
 * Main browse service for sequence discovery and filtering
 */
import type { FilterType, FilterValue, SequenceData, SortMethod } from "$lib/domain/core";

// ============================================================================
// DATA CONTRACTS (Domain Models)
// ============================================================================

export interface DeleteConfirmationData {
  sequence: SequenceData;
  relatedSequences: SequenceData[];
  hasVariations: boolean;
  willFixVariationNumbers: boolean;
}

export interface DeleteResult {
  success: boolean;
  deletedSequence: SequenceData | null;
  affectedSequences: SequenceData[];
  error?: string;
}

export interface BrowseDisplayState {
  currentView: "filter_selection" | "sequence_browser";
  selectedSequence: SequenceData | null;
  isSequenceDetailOpen: boolean;
}

export interface BrowseLoadingState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
}

export interface FilterState {
  activeFilters: Record<FilterType, FilterValue>;
  sortMethod: SortMethod;
  searchQuery: string;
}

export interface BrowseState {
  displayState: BrowseDisplayState;
  loadingState: BrowseLoadingState;
  filterState: FilterState;
}

export interface NavigationItem {
  id: string;
  label: string;
  value: string | number;
  count: number;
  isActive: boolean;
  sequences: SequenceData[];
}

export interface NavigationSection {
  id: string;
  title: string;
  type: "date" | "length" | "letter" | "level" | "author" | "favorites";
  items: NavigationItem[];
  isExpanded: boolean;
  totalCount: number;
}

export interface SectionConfiguration {
  groupBy:
    | keyof SequenceData
    | "letter"
    | "length"
    | "difficulty"
    | "date"
    | "none";
  sortMethod: SortMethod;
  showEmptySections: boolean;
  expandedSections?: Set<string>;
}

export interface SequenceSection {
  id: string;
  title: string;
  count: number;
  sequences: SequenceData[];
  isExpanded: boolean;
  metadata?: Record<string, unknown>;
}
