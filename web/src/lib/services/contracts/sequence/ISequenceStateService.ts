/**
 * Sequence State Service Interface
 *
 * Interface for managing sequence state operations.
 */

import type { SequenceData, ValidationResult } from "$lib/domain/core";

export interface ISequenceStateService {
  getCurrentSequence(): SequenceData | null;
  updateSequence(sequence: SequenceData): Promise<void>;
  validateSequence(sequence: SequenceData): ValidationResult;
  resetSequence(): void;
}

// Re-export data types that services need
export type { SequenceStatistics } from "$lib/domain/data-interfaces/sequence-state-interfaces-data";
