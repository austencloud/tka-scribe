/**
 * Option Filterer Service Interface
 *
 * Interface for filtering pictograph options by various criteria including
 * position, letter types, rotation, and other motion parameters.
 */

import type { BeatData, PictographData } from "$shared";

// ============================================================================
// FILTER CRITERIA AND RESULT TYPES
// ============================================================================

export interface FilterCriteria {
  startPosition?: string;
  endPosition?: string;
  letterTypes?: string[];
  blueRotationDirection?: string;
  redRotationDirection?: string;
  motionTypes?: string[];
  difficulty?: string;
  excludeLetters?: string[];
}

export interface FilterResult {
  filtered: PictographData[];
  totalOriginal: number;
  totalFiltered: number;
  appliedFilters: string[];
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface IOptionFilterer {
  /**
   * Filter options by start position
   */
  filterByStartPosition(
    options: PictographData[],
    startPosition: string
  ): PictographData[];

  /**
   * Filter options by end position
   */
  filterByEndPosition(
    options: PictographData[],
    endPosition: string
  ): PictographData[];

  /**
   * Filter options by letter types
   */
  filterByLetterTypes(
    options: PictographData[],
    letterTypes: string[]
  ): PictographData[];

  /**
   * Filter options by rotation directions
   */
  filterByRotation(
    options: PictographData[],
    blueRotationDirection: string,
    redRotationDirection: string
  ): PictographData[];

  /**
   * Filter options by multiple criteria with detailed result
   */
  filterByCriteria(
    options: PictographData[],
    criteria: FilterCriteria
  ): FilterResult;

  /**
   * Extract end position from the last beat in a sequence
   */
  extractEndPosition(lastBeat: BeatData): string | null;
}
