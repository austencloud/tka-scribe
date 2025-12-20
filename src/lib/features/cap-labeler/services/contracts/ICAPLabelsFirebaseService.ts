import type { BeatPairRelationship } from "./IBeatPairAnalysisService";
import type { CAPDesignation, SectionDesignation } from "./ICAPDesignationService";

/**
 * Labeled sequence data
 */
export interface LabeledSequence {
  word: string;
  designations: CAPDesignation[]; // Multiple valid designations (whole sequence)
  sections?: SectionDesignation[]; // Section-based designations
  beatPairs?: BeatPairRelationship[]; // Beat-pair relationships
  isFreeform: boolean; // Circular but no recognizable pattern
  isUnknown?: boolean; // Needs further analysis/review
  labeledAt: string;
  notes: string;
}

/**
 * Service for Firebase persistence of CAP labels
 */
export interface ICAPLabelsFirebaseService {
  /**
   * Save a label to Firebase
   */
  saveLabelToFirebase(word: string, label: LabeledSequence): Promise<void>;

  /**
   * Delete a label from Firebase
   */
  deleteLabelFromFirebase(word: string): Promise<void>;

  /**
   * Subscribe to label changes from Firebase
   * Returns unsubscribe function
   */
  subscribeToLabels(
    callback: (labels: Map<string, LabeledSequence>) => void
  ): () => void;

  /**
   * Save labels to localStorage as backup
   */
  saveToLocalStorage(labels: Map<string, LabeledSequence>): void;

  /**
   * Load labels from localStorage
   */
  loadFromLocalStorage(): Map<string, LabeledSequence>;

  /**
   * Sync all localStorage labels to Firebase
   */
  syncLocalStorageToFirebase(
    labels: Map<string, LabeledSequence>
  ): Promise<void>;
}
