/**
 * Sequence State Service Interfaces
 *
 * Pure TypeScript interfaces for sequence state management services.
 * Extracted from SequenceStateService.svelte.ts to enable clean architecture.
 */
// ============================================================================
// SERVICE INTERFACES
// ============================================================================

import type { SequenceData, ValidationResult } from "$shared";
import type { BeatData } from "$shared";

// ============================================================================
// SERVICE CONTRACTS (Behavioral Interfaces)
// ============================================================================


export interface ISequenceStateConfigService {
  getDefaultBeatData(): BeatData;
  getDefaultSequenceLength(): number;
  getMaxSequenceLength(): number;
  validateSequenceName(name: string): ValidationResult;
  validateBeatData(beatData: Partial<BeatData>): ValidationResult;
}
