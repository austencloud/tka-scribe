import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { ExploreSortMethod } from "../../domain/enums";
import type {
  SectionConfig,
  SequenceSection,
} from "../../domain/models/discover-models";

/**
 * Service for organizing sequences into sections
 */
export interface ISectionService {
  organizeIntoSections(
    sequences: SequenceData[],
    config: SectionConfig
  ): Promise<SequenceSection[]>;
  getSectionConfig(sortMethod: ExploreSortMethod): Promise<SectionConfig>;
  organizeSections(
    sequences: SequenceData[],
    config: SectionConfig
  ): Promise<SequenceSection[]>;
  toggleSectionExpansion(
    sectionId: string,
    sections: SequenceSection[]
  ): SequenceSection[];
  updateSectionConfig(
    config: SectionConfig,
    updates: Partial<SectionConfig>
  ): SectionConfig;
}
