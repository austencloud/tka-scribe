import type { SequenceData } from "../../../../../shared";
import type { GalleryNavigationConfig, GalleryNavigationItem } from "../../domain";

export interface INavigationService {
  buildNavigationStructure(
    sequences: SequenceData[]
  ): Promise<GalleryNavigationConfig[]>;
  getNavigationItem(
    sectionId: string,
    itemId: string
  ): Promise<GalleryNavigationItem | null>;
  generateNavigationSections(
    sequences: SequenceData[],
    favorites: string[]
  ): Promise<GalleryNavigationConfig[]>;
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
    sections: GalleryNavigationConfig[]
  ): GalleryNavigationConfig[];
  setActiveItem(
    sectionId: string,
    itemId: string,
    sections: GalleryNavigationConfig[]
  ): GalleryNavigationConfig[];
  filterSequencesByNavigation(
    sequences: SequenceData[],
    item: unknown,
    sectionType: string
  ): Promise<SequenceData[]>;
}
