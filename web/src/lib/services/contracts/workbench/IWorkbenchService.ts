/**
 * Workbench Service Interface
 *
 * Interface for managing workbench operations.
 */

import type { BeatData } from "$lib/domain/core";

export interface IWorkbenchService {
  initializeWorkbench(): Promise<void>;
  getCurrentBeat(): BeatData | null;
  updateBeat(beat: BeatData): Promise<void>;
  clearWorkbench(): void;
}

// Re-export data types that services need
export type {
  BeatEditOperation,
  SequenceCreationParams,
  WorkbenchConfig,
  WorkbenchMode,
} from "$lib/domain/data-interfaces/workbench-interfaces-data";
