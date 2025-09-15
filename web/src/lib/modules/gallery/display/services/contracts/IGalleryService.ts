import type { SequenceData } from "$shared";
import type { GalleryFilterType, GalleryFilterValue } from "$shared/persistence/domain";
import type { GallerySortMethod } from "../../../shared/domain/enums";

export interface IGalleryService {
  loadSequenceMetadata(): Promise<SequenceData[]>;
  applyFilter(
    sequences: SequenceData[],
    filterType: GalleryFilterType,
    filterValue: GalleryFilterValue
  ): Promise<SequenceData[]>;
  sortSequences(
    sequences: SequenceData[],
    sortMethod: GallerySortMethod
  ): Promise<SequenceData[]>;
  groupSequencesIntoSections(
    sequences: SequenceData[],
    sortMethod: GallerySortMethod
  ): Promise<Record<string, SequenceData[]>>;
  getUniqueValues(field: keyof SequenceData): Promise<string[]>;
  getFilterOptions(filterType: GalleryFilterType): Promise<string[]>;
}
