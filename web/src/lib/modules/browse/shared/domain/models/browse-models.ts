import type { SequenceData } from "$shared/domain";

export interface BrowseDeleteConfirmationData {
  sequence: SequenceData;
  relatedSequences: SequenceData[];
  hasVariations: boolean;
  willFixVariationNumbers: boolean;
}

export interface BrowseDeleteResult {
  success: boolean;
  deletedSequence: SequenceData | null;
  affectedSequences: SequenceData[];
  error?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
  isActive?: boolean;
  children?: NavigationItem[];
}

export interface NavigationSectionConfig {
  id: string;
  title: string;
  items: NavigationItem[];
  isCollapsible?: boolean;
  isCollapsed?: boolean;
}
