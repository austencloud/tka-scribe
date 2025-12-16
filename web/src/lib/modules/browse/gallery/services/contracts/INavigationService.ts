import type { SequenceData } from "$shared";
import type {
  GalleryNavigationItem,
  NavigationSectionConfig,
} from "../../domain/models/gallery-models";

export interface INavigationService {
  buildNavigationStructure(
    sequences: SequenceData[]
  ): Promise<NavigationSectionConfig[]>;
  getNavigationItem(
    sectionId: string,
    itemId: string
  ): Promise<GalleryNavigationItem | null>;
  generateNavigationSections(
    sequences: SequenceData[],
    favorites: string[]
  ): Promise<NavigationSectionConfig[]>;
  getSequencesForNavigationItem(
    item: GalleryNavigationItem,
    sectionType:
      | "letter"
      | "author"
      | "level"
      | "length"
      | "favorites"
      | "date",
    allSequences: SequenceData[]
  ): SequenceData[];
  toggleSectionExpansion(
    sectionId: string,
    sections: NavigationSectionConfig[]
  ): NavigationSectionConfig[];
  setActiveItem(
    sectionId: string,
    itemId: string,
    sections: NavigationSectionConfig[]
  ): NavigationSectionConfig[];
  filterSequencesByNavigation(
    sequences: SequenceData[],
    item: unknown,
    sectionType: string
  ): Promise<SequenceData[]>;
}
