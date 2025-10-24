/**
 * Gallery Sort Service
 *
 * Handles sorting and grouping of gallery sequences.
 * Provides consistent sorting behavior across the gallery.
 */

import { injectable } from "inversify";
import type { SequenceData } from "$shared";
import { GallerySortMethod } from "../../../shared/domain/enums";
import type { IGallerySortService } from "../contracts/IGallerySortService";

@injectable()
export class GallerySortService implements IGallerySortService {
  sortSequences(
    sequences: SequenceData[],
    sortMethod: GallerySortMethod
  ): SequenceData[] {
    const sorted = [...sequences];

    switch (sortMethod) {
      case GallerySortMethod.ALPHABETICAL:
        return this.sortAlphabetically(sorted);
      case GallerySortMethod.DATE_ADDED:
        return this.sortByDateAdded(sorted);
      case GallerySortMethod.DIFFICULTY_LEVEL:
        return this.sortByDifficulty(sorted);
      case GallerySortMethod.SEQUENCE_LENGTH:
        return this.sortByLength(sorted);
      case GallerySortMethod.AUTHOR:
        return this.sortByAuthor(sorted);
      case GallerySortMethod.POPULARITY:
        return this.sortByPopularity(sorted);
      default:
        return sorted;
    }
  }

  groupSequencesIntoSections(
    sequences: SequenceData[],
    sortMethod: GallerySortMethod
  ): Record<string, SequenceData[]> {
    const sections: Record<string, SequenceData[]> = {};

    for (const sequence of sequences) {
      const sectionKey = this.getSectionKey(sequence, sortMethod);

      if (!sections[sectionKey]) {
        sections[sectionKey] = [];
      }

      sections[sectionKey].push(sequence);
    }

    return sections;
  }

  // ============================================================================
  // Sorting Methods
  // ============================================================================

  private sortAlphabetically(sequences: SequenceData[]): SequenceData[] {
    return sequences.sort((a, b) => a.word.localeCompare(b.word));
  }

  private sortByDateAdded(sequences: SequenceData[]): SequenceData[] {
    return sequences.sort((a, b) => {
      const dateA = a.dateAdded || new Date(0);
      const dateB = b.dateAdded || new Date(0);
      return dateB.getTime() - dateA.getTime(); // Newest first
    });
  }

  private sortByDifficulty(sequences: SequenceData[]): SequenceData[] {
    return sequences.sort((a, b) => {
      const levelA = this.getDifficultyOrder(a.difficultyLevel);
      const levelB = this.getDifficultyOrder(b.difficultyLevel);
      return levelA - levelB; // Easiest first
    });
  }

  private sortByLength(sequences: SequenceData[]): SequenceData[] {
    return sequences.sort(
      (a, b) => (a.sequenceLength || 0) - (b.sequenceLength || 0)
    );
  }

  private sortByAuthor(sequences: SequenceData[]): SequenceData[] {
    return sequences.sort((a, b) =>
      (a.author || "").localeCompare(b.author || "")
    );
  }

  private sortByPopularity(sequences: SequenceData[]): SequenceData[] {
    return sequences.sort(
      (a, b) => Number(b.isFavorite) - Number(a.isFavorite)
    );
  }

  // ============================================================================
  // Section Key Generation
  // ============================================================================

  private getSectionKey(
    sequence: SequenceData,
    sortMethod: GallerySortMethod
  ): string {
    switch (sortMethod) {
      case GallerySortMethod.ALPHABETICAL:
        return this.getAlphabeticalSection(sequence);
      case GallerySortMethod.DIFFICULTY_LEVEL:
        return sequence.difficultyLevel || "Unknown";
      case GallerySortMethod.AUTHOR:
        return sequence.author || "Unknown";
      case GallerySortMethod.SEQUENCE_LENGTH:
        return this.getLengthSection(sequence);
      default:
        return "All";
    }
  }

  private getAlphabeticalSection(sequence: SequenceData): string {
    return sequence.word[0]?.toUpperCase() || "#";
  }

  private getLengthSection(sequence: SequenceData): string {
    const length = sequence.sequenceLength || 0;

    if (length <= 4) return "3-4 beats";
    if (length <= 6) return "5-6 beats";
    if (length <= 8) return "7-8 beats";
    return "9+ beats";
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private getDifficultyOrder(difficulty?: string): number {
    switch (difficulty) {
      case "beginner":
        return 1;
      case "intermediate":
        return 2;
      case "advanced":
        return 3;
      default:
        return 0;
    }
  }
}
