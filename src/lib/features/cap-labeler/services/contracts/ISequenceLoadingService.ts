import type { SequenceEntry } from "./IBeatDataConversionService";
import type { LabeledSequence } from "./ICAPLabelsFirebaseService";

/**
 * Filter mode for sequences
 */
export type FilterMode = "needsVerification" | "verified";

/**
 * Sequence statistics
 */
export interface SequenceStats {
  total: number;
  needsVerification: number;
  verified: number;
}

/**
 * Service for loading and filtering sequences
 */
export interface ISequenceLoadingService {
  /**
   * Load all sequences from sequence-index.json
   */
  loadSequences(): Promise<SequenceEntry[]>;

  /**
   * Filter sequences based on labeling status
   */
  filterSequences(
    sequences: SequenceEntry[],
    labels: Map<string, LabeledSequence>,
    filterMode: FilterMode
  ): SequenceEntry[];

  /**
   * Calculate statistics for sequences and labels
   */
  calculateStats(
    sequences: SequenceEntry[],
    labels: Map<string, LabeledSequence>
  ): SequenceStats;
}
