/**
 * Sequence Validation Service Interface
 *
 * Pure validation logic for sequences and beats.
 */

import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";
import type { BeatData } from "../../domain/models/BeatData";
import type { ValidationResult } from "$shared/validation/ValidationResult";

export interface ISequenceValidationService {
  /**
   * Validate a complete sequence
   */
  validateSequence(sequence: SequenceData): ValidationResult;

  /**
   * Validate a single beat
   */
  validateBeat(beat: BeatData, expectedBeatNumber: number): string[];

  /**
   * Validate beat index is within bounds
   */
  isValidBeatIndex(sequence: SequenceData | null, beatIndex: number): boolean;

  /**
   * Validate sequence name
   */
  validateSequenceName(name: string): { isValid: boolean; error?: string };

  /**
   * Validate sequence length
   */
  validateSequenceLength(length: number): { isValid: boolean; error?: string };
}
