/**
 * Interface for sequence CRUD operations (Create, Read, Update, Delete)
 */
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { BeatData } from "../../domain/models/BeatData";
import type { SequenceCreateRequest } from "../../domain/models/sequence-models";

export interface ISequenceCRUDService {
  /**
   * Create a new sequence
   */
  createSequence(request: SequenceCreateRequest): Promise<SequenceData>;

  /**
   * Update an entire sequence
   */
  updateSequence(sequence: SequenceData): Promise<SequenceData>;

  /**
   * Delete a sequence by ID
   */
  deleteSequence(id: string): Promise<void>;

  /**
   * Update a specific beat in a sequence
   */
  updateBeat(
    sequenceId: string,
    beatIndex: number,
    beat: BeatData
  ): Promise<void>;

  /**
   * Add a beat to a sequence
   */
  addBeat(sequenceId: string, beat: BeatData): Promise<void>;

  /**
   * Remove a beat from a sequence
   */
  removeBeat(sequenceId: string, beatIndex: number): Promise<void>;

  /**
   * Load all sequences
   */
  loadAllSequences(): Promise<SequenceData[]>;

  /**
   * Duplicate a sequence
   */
  duplicateSequence(sequence: SequenceData): Promise<SequenceData>;
}
