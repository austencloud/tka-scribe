/**
 * Workbench Domain Models
 *
 * Shared workbench data structures used across modules.
 * Moved from main workbench/domain to shared domain.
 */

import type { BeatData, SequenceData } from "$shared";
import { GridMode } from "$shared";

export type WorkbenchMode = "view" | "edit" | "construct";

export interface WorkbenchConfig {
  mode: WorkbenchMode;
  isInitialized: boolean;
}

export interface BeatEditOperation {
  beatIndex: number;
  operation: "edit" | "clear" | "toggle";
  data?: Partial<BeatData>;
}

export interface BeatClickResult {
  success: boolean;
  selectedBeat?: number;
  shouldSelect?: boolean;
  beatIndex?: number;
  error?: string;
}

export interface BeatEditResult {
  success: boolean;
  updatedSequence?: SequenceData;
  updatedBeat?: BeatData;
  error?: string;
}

export interface SequenceCreationResult {
  success: boolean;
  sequence?: SequenceData;
  error?: string;
}

export interface ConfigurationResult {
  success: boolean;
  updatedConfig?: WorkbenchConfig;
  error?: string;
}

export interface WorkbenchActions {
  // Mode actions
  initialize(): void;
  setMode(mode: WorkbenchMode): void;

  // Beat interaction actions
  handleBeatClick(index: number): void;
  handleBeatHover(index: number): void;
  handleBeatLeave(): void;

  // Beat editing actions
  editBeat(index: number): void;
  clearBeat(index: number): void;

  // Sequence actions
  createNewSequence(name?: string, length?: number): void;

  // Configuration actions
  setGridMode(mode: GridMode): void;
  setBeatSize(size: number): void;
}

// Additional domain models that were in the main workbench/domain
export interface SequenceCreateRequest {
  name: string;
  word: string;
  length: number;
  author?: string;
  tags?: string[];
}

export interface SequenceCreationParams {
  name: string;
  length: number;
  author?: string;
  tags?: string[];
}

export interface DeleteResult {
  success: boolean;
  deletedCount: number;
  deletedSequence?: SequenceData | null;
  affectedSequences?: SequenceData[];
  error?: string;
}

export interface DeleteConfirmationData {
  sequenceId: string;
  sequenceName: string;
  beatCount: number;
  sequence?: SequenceData;
  hasVariations?: boolean;
  relatedSequences?: SequenceData[];
  willFixVariationNumbers?: boolean;
}
