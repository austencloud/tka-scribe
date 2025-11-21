/**
 * Mode-Specific Persistence Service Wrapper
 *
 * Wraps the global SequencePersistenceService to ensure each creation mode
 * (constructor, generator, assembler) saves and loads from its own storage key.
 *
 * This solves the issue where all tabs were sharing the same beat grid state
 * because they were all reading from/writing to the same active tab's storage.
 */

import type { ActiveCreateModule, PictographData, SequenceData } from "$shared";

import type { ISequencePersistenceService } from "../contracts";

/**
 * Creates a mode-specific persistence service that always uses the specified mode
 * instead of reading from navigationState.activeTab
 */
export class ModeSpecificPersistenceService
  implements ISequencePersistenceService
{
  constructor(
    private readonly mode: ActiveCreateModule,
    private readonly basePersistenceService: ISequencePersistenceService
  ) {}

  async initialize(): Promise<void> {
    return this.basePersistenceService.initialize();
  }

  async saveCurrentState(state: {
    currentSequence: SequenceData | null;
    selectedStartPosition: PictographData | null;
    hasStartPosition: boolean;
    activeBuildSection: ActiveCreateModule;
  }): Promise<void> {
    // Override activeBuildSection to always use this mode
    return this.basePersistenceService.saveCurrentState({
      ...state,
      activeBuildSection: this.mode,
    });
  }

  async loadCurrentState(): Promise<{
    currentSequence: SequenceData | null;
    selectedStartPosition: PictographData | null;
    hasStartPosition: boolean;
    activeBuildSection: ActiveCreateModule;
  } | null> {
    // Always load from this mode's storage
    return this.basePersistenceService.loadCurrentState(this.mode);
  }

  async clearCurrentState(): Promise<void> {
    // Always clear this mode's storage
    return this.basePersistenceService.clearCurrentState(this.mode);
  }

  async hasSavedState(): Promise<boolean> {
    return this.basePersistenceService.hasSavedState(this.mode);
  }

  async getLastSaveTimestamp(): Promise<number | null> {
    return this.basePersistenceService.getLastSaveTimestamp(this.mode);
  }
}

/**
 * Factory function to create mode-specific persistence services
 */
export function createModeSpecificPersistenceService(
  mode: ActiveCreateModule,
  basePersistenceService: ISequencePersistenceService
): ISequencePersistenceService {
  return new ModeSpecificPersistenceService(mode, basePersistenceService);
}
