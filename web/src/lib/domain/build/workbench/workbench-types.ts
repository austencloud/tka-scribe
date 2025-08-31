/**
 * Workbench Domain Types
 *
 * Pure TypeScript domain types for workbench data structures.
 * Contains only data models, not service contracts.
 */
// ============================================================================
// WORKBENCH DOMAIN TYPES
// ============================================================================
import type { BeatData, SequenceData } from "$domain";
import { GridMode } from "$domain";

// ============================================================================
// DOMAIN DATA MODELS
// ============================================================================

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

export interface BeatEditResult {
  success: boolean;
  updatedBeat?: BeatData;
  error?: string;
}

export interface SequenceCreationParams {
  name: string;
  length: number;
}

export interface SequenceCreationResult {
  success: boolean;
  sequence?: SequenceData;
  error?: string;
}

export interface BeatClickResult {
  shouldSelect: boolean;
  beatIndex: number;
}

export interface ConfigurationResult {
  success: boolean;
  error?: string;
}

export interface WorkbenchState {
  config: WorkbenchConfig;
  currentSequence: SequenceData | null;
  selectedBeatIndex: number;
  hoveredBeatIndex: number;
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
