/**
 * Workbench Service Interfaces
 *
 * Pure TypeScript interfaces for workbench coordination services.
 * Extracted from WorkbenchService.svelte.ts to enable clean architecture.
 */
// ============================================================================
// WORKBENCH TYPES
// ============================================================================

import type { SequenceData, Letter, PictographData, ValidationResult, GridMode } from "$shared";
import type { WorkbenchConfig, WorkbenchMode, BeatEditOperation, BeatData, SequenceCreationParams, BeatClickResult, BeatEditResult, SequenceCreationResult, ConfigurationResult } from "$shared";


// ============================================================================
// SERVICE CONTRACTS (Behavioral Interfaces)
// ============================================================================


export interface IWorkbenchCoordinationService {
  // Service coordination
  handleBeatClick(beatIndex: number, mode: WorkbenchMode): BeatClickResult;
  handleBeatHover(beatIndex: number): void;
  handleBeatLeave(): void;

  // Beat operations coordination
  editBeat(
    beatIndex: number,
    sequence: SequenceData | null,
    mode: WorkbenchMode
  ): BeatEditResult;
  clearBeat(beatIndex: number, sequence: SequenceData | null): BeatEditResult;

  // Sequence operations coordination
  createNewSequence(name?: string, length?: number): SequenceCreationResult;

  // Configuration coordination
  setGridMode(mode: GridMode): ConfigurationResult;
  setBeatSize(size: number): ConfigurationResult;
}
