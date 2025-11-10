/**
 * Section Service - Manages sequence section organization
 *
 * Handles grouping sequences into sections with headers and counts,
 * following the microservices architecture pattern.
 */

import type { SequenceData } from "$shared";
import { injectable } from "inversify";
import { ExploreSortMethod } from "../../../shared/domain/enums/explore-enums";
import type {
  SectionConfig,
  SequenceSection,
} from "../../../shared/domain/models/explore-models";
import type { IExploreSectionService } from "../contracts/IExploreSectionService";

@injectable()
export class ExploreSectionService implements IExploreSectionService {
  async organizeSections(
    sequences: SequenceData[],
    config: SectionConfig
  ): Promise<SequenceSection[]> {
    if (config.groupBy === "none") {
      return [
        {
          id: "all",
          title: "All Sequences",
          count: sequences.length,
          sequences,
          isExpanded: true,
          sortOrder: 0,
        },
      ];
    }

    const grouped = this.groupSequences(sequences, config.groupBy);
    const sections = this.createSections(grouped, config);

    return this.sortSections(sections, config.groupBy);
  }

  toggleSectionExpansion(
    sectionId: string,
    sections: SequenceSection[]
  ): SequenceSection[] {
    return sections.map((section) => ({
      ...section,
      isExpanded:
        section.id === sectionId ? !section.isExpanded : section.isExpanded,
    }));
  }

  getDefaultSectionConfig(): SectionConfig {
    return {
      groupBy: "letter",
      sortMethod: "alphabetical" as ExploreSortMethod,
      showEmptySections: false,
    };
  }

  updateSectionConfig(
    config: SectionConfig,
    updates: Partial<SectionConfig>
  ): SectionConfig {
    return {
      ...config,
      ...updates,
    };
  }

  getSectionStatistics(sections: SequenceSection[]) {
    const totalSections = sections.length;
    const totalSequences = sections.reduce(
      (sum, section) => sum + section.count,
      0
    );
    const expandedSections = sections.filter(
      (section) => section.isExpanded
    ).length;
    const averageSequencesPerSection =
      totalSections > 0 ? totalSequences / totalSections : 0;

    return {
      totalSections,
      totalSequences,
      expandedSections,
      averageSequencesPerSection:
        Math.round(averageSequencesPerSection * 10) / 10,
    };
  }

  // Private helper methods
  private groupSequences(
    sequences: SequenceData[],
    groupBy: SectionConfig["groupBy"]
  ): Map<string, SequenceData[]> {
    const groups = new Map<string, SequenceData[]>();

    sequences.forEach((sequence) => {
      const key = this.getGroupKey(sequence, groupBy);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      const group = groups.get(key);
      if (group) {
        group.push(sequence);
      }
    });

    return groups;
  }

  private getGroupKey(
    sequence: SequenceData,
    groupBy: SectionConfig["groupBy"]
  ): string {
    switch (groupBy) {
      case "letter": {
        // Sub-group by letter AND beat count for consistent row heights
        // Handle letter types: "W" vs "W-" (type 3 letters)
        const firstChar = sequence.word.charAt(0).toUpperCase();
        const secondChar = sequence.word.charAt(1);
        const letter = secondChar === '-' ? `${firstChar}-` : firstChar;
        const beatCount = sequence.sequenceLength || 0;
        return `${letter}-${beatCount}`;
      }

      case "length": {
        const length = sequence.sequenceLength || sequence.word.length;
        return `${length} beats`;
      }

      case "difficulty":
        return sequence.difficultyLevel || "Unknown";

      case "author":
        return sequence.author || "Unknown Author";

      case "date": {
        if (!sequence.dateAdded) return "Unknown Date";
        const date = new Date(sequence.dateAdded);
        return date.toDateString();
      }

      default:
        return "All";
    }
  }

  private createSections(
    grouped: Map<string, SequenceData[]>,
    config: SectionConfig
  ): SequenceSection[] {
    const sections: SequenceSection[] = [];

    grouped.forEach((sequences, key) => {
      if (!config.showEmptySections && sequences.length === 0) {
        return;
      }

      const section: SequenceSection = {
        id: this.createSectionId(key, config.groupBy),
        title: this.createSectionTitle(key, config.groupBy, sequences.length),
        count: sequences.length,
        sequences: this.sortSequencesInSection(sequences, config.sortMethod),
        isExpanded: config.expandedSections?.has(key) ?? false,
        sortOrder: this.getSectionSortOrder(key, config.groupBy),
      };

      sections.push(section);
    });

    return sections;
  }

  private createSectionId(
    key: string,
    groupBy: SectionConfig["groupBy"]
  ): string {
    return `${groupBy}-${key.toLowerCase().replace(/\s+/g, "-")}`;
  }

  private createSectionTitle(
    key: string,
    groupBy: SectionConfig["groupBy"],
    count: number
  ): string {
    const countText = count === 1 ? "1 sequence" : `${count} sequences`;

    switch (groupBy) {
      case "letter": {
        // Key format: "A-4" or "W--4" (letter-beatcount, where letter might be "W-")
        // Split and handle both "W-4" and "W--4" formats
        const lastDashIndex = key.lastIndexOf('-');
        const letter = key.substring(0, lastDashIndex);
        const beatCount = key.substring(lastDashIndex + 1);
        const beats = parseInt(beatCount) || 0;
        return `${letter} - ${beats} beats (${countText})`;
      }

      case "length":
        return `${key} (${countText})`;

      case "difficulty": {
        const difficultyEmoji =
          {
            beginner: "🟢",
            intermediate: "🟡",
            advanced: "🔴",
            Unknown: "⚪",
          }[key] || "⚪";
        return `${difficultyEmoji} ${key} (${countText})`;
      }

      case "author":
        return `👤 ${key} (${countText})`;

      case "date":
        return `📅 ${this.formatDateForSection(key)} (${countText})`;

      default:
        return `${key} (${countText})`;
    }
  }

  private sortSequencesInSection(
    sequences: SequenceData[],
    sortMethod: ExploreSortMethod
  ): SequenceData[] {
    const sorted = [...sequences];

    switch (sortMethod) {
      case "alphabetical":
        return sorted.sort((a, b) => {
          // First sort by sequence length (ascending) within the section
          const lengthDiff = (a.sequenceLength || 0) - (b.sequenceLength || 0);
          // If same length, sort alphabetically by word
          if (lengthDiff === 0) {
            return a.word.localeCompare(b.word);
          }
          return lengthDiff;
        });

      case ExploreSortMethod.DIFFICULTY_LEVEL:
        return sorted.sort((a, b) => {
          const getDifficultyOrder = (level?: string) => {
            switch (level) {
              case "beginner":
                return 1;
              case "intermediate":
                return 2;
              case "advanced":
                return 3;
              default:
                return 0;
            }
          };
          return (
            getDifficultyOrder(a.difficultyLevel) -
            getDifficultyOrder(b.difficultyLevel)
          );
        });

      case ExploreSortMethod.SEQUENCE_LENGTH:
        return sorted.sort((a, b) => {
          const lengthA = a.sequenceLength || a.word.length;
          const lengthB = b.sequenceLength || b.word.length;
          return lengthA - lengthB;
        });

      case ExploreSortMethod.DATE_ADDED:
        return sorted.sort((a, b) => {
          const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
          const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
          return dateB - dateA; // Most recent first
        });

      case "author":
        return sorted.sort((a, b) =>
          (a.author || "").localeCompare(b.author || "")
        );

      default:
        return sorted;
    }
  }

  private sortSections(
    sections: SequenceSection[],
    _groupBy: SectionConfig["groupBy"]
  ): SequenceSection[] {
    return sections.sort((a, b) => {
      // Primary sort by sortOrder
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }

      // Secondary sort by title for consistent ordering
      return a.title.localeCompare(b.title);
    });
  }

  private getSectionSortOrder(
    key: string,
    groupBy: SectionConfig["groupBy"]
  ): number {
    switch (groupBy) {
      case "letter": {
        // Key format: "A-4" or "W--4" (letter-beatcount, where letter might be "W-")
        // Sort by letter first, then by beat count
        const lastDashIndex = key.lastIndexOf('-');
        const letter = key.substring(0, lastDashIndex);
        const beatCount = key.substring(lastDashIndex + 1);

        // Sort order: base letter, then with dash (W before W-)
        const baseChar = letter.charAt(0);
        const hasDash = letter.endsWith('-') ? 1 : 0;
        const letterOrder = (baseChar.charCodeAt(0) * 1000) + (hasDash * 100);
        const beatOrder = parseInt(beatCount) || 0; // Beat count as tertiary
        return letterOrder + beatOrder;
      }

      case "length": {
        // Extract number from "X beats"
        const match = key.match(/^(\d+)/);
        return match && match[1] ? parseInt(match[1]) : 999;
      }

      case "difficulty": {
        // Difficulty order
        const difficultyOrder = {
          beginner: 1,
          intermediate: 2,
          advanced: 3,
          Unknown: 4,
        };
        return difficultyOrder[key as keyof typeof difficultyOrder] || 999;
      }

      case "author":
        // Alphabetical by author
        return 0; // Will be sorted by title comparison

      case "date": {
        // Most recent first
        const date = new Date(key);
        return -date.getTime(); // Negative for reverse chronological
      }

      default:
        return 0;
    }
  }

  private formatDateForSection(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString();
  }

  // Additional methods required by browse-interfaces.ts
  async organizeIntoSections(
    sequences: SequenceData[],
    config: SectionConfig
  ): Promise<SequenceSection[]> {
    // Use the existing organizeSections method
    return this.organizeSections(sequences, config);
  }

  async getSectionConfig(
    sortMethod: ExploreSortMethod
  ): Promise<SectionConfig> {
    // Return a basic configuration based on sort method
    return {
      groupBy: "letter" as const,
      sortMethod: sortMethod,
      showEmptySections: false,
      expandedSections: new Set<string>(),
    };
  }
}
