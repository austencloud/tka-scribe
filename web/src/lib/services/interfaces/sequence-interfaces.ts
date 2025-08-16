/**
 * Sequence Service Interfaces
 *
 * Interfaces for sequence management, creation, updates, and domain logic.
 * This includes both service contracts and related data structures.
 */

import type { BeatData, SequenceData, ValidationResult } from "./domain-types";
import type { GridMode } from "./core-types";

// ============================================================================
// SEQUENCE REQUEST TYPES
// ============================================================================

export interface SequenceCreateRequest {
  name: string;
  length: number;
  gridMode?: GridMode;
  propType?: string;
}

// ============================================================================
// SEQUENCE SERVICE INTERFACES
// ============================================================================

/**
 * Main sequence service for CRUD operations and persistence
 */
export interface ISequenceService {
  createSequence(request: SequenceCreateRequest): Promise<SequenceData>;
  updateBeat(
    sequenceId: string,
    beatIndex: number,
    beatData: BeatData
  ): Promise<void>;
  addBeat(sequenceId: string, beatData?: Partial<BeatData>): Promise<void>;
  setSequenceStartPosition(
    sequenceId: string,
    startPosition: BeatData
  ): Promise<void>;
  deleteSequence(id: string): Promise<void>;
  getSequence(id: string): Promise<SequenceData | null>;
  getAllSequences(): Promise<SequenceData[]>;
}

/**
 * Domain-specific sequence operations and business logic
 */
export interface ISequenceDomainService {
  validateCreateRequest(request: SequenceCreateRequest): ValidationResult;
  createSequence(request: SequenceCreateRequest): SequenceData;
  updateBeat(
    sequence: SequenceData,
    beatIndex: number,
    beatData: BeatData
  ): SequenceData;
  calculateSequenceWord(sequence: SequenceData): string;
}

// ============================================================================
// PERSISTENCE SERVICE INTERFACE
// ============================================================================

/**
 * Data persistence abstraction for sequences
 */
export interface IPersistenceService {
  saveSequence(sequence: SequenceData): Promise<void>;
  loadSequence(id: string): Promise<SequenceData | null>;
  loadAllSequences(): Promise<SequenceData[]>;
  deleteSequence(id: string): Promise<void>;
}
