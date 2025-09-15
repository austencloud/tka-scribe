/**
 * Sequence Persistence Service Implementation
 * 
 * Manages sequence state persistence that survives hot module replacement.
 * Uses the shared persistence service to store and restore sequence state.
 */

import type { ActiveBuildTab, IPersistenceService, PictographData, SequenceData } from "$shared";
import { TYPES } from "$shared";
import { inject, injectable } from "inversify";
import type { ISequencePersistenceService } from "../contracts";

@injectable()
export class SequencePersistenceService implements ISequencePersistenceService {
  constructor(
    @inject(TYPES.IPersistenceService) private persistenceService: IPersistenceService
  ) {}

  async initialize(): Promise<void> {
    try {
      // Ensure the persistence service is initialized
      await this.persistenceService.initialize();
      console.log("✅ SequencePersistenceService: Initialized");
    } catch (error) {
      console.error("❌ SequencePersistenceService: Failed to initialize:", error);
      throw error;
    }
  }

  async saveCurrentState(state: {
    currentSequence: SequenceData | null;
    selectedStartPosition: PictographData | null;
    hasStartPosition: boolean;
    activeBuildSubTab: ActiveBuildTab;
  }): Promise<void> {
    try {
      await this.persistenceService.saveCurrentSequenceState(state);
      console.log("✅ SequencePersistenceService: Current state saved");
    } catch (error) {
      console.error("❌ SequencePersistenceService: Failed to save current state:", error);
      throw error;
    }
  }

  async loadCurrentState(): Promise<{
    currentSequence: SequenceData | null;
    selectedStartPosition: PictographData | null;
    hasStartPosition: boolean;
    activeBuildSubTab: ActiveBuildTab;
  } | null> {
    try {
      const state = await this.persistenceService.loadCurrentSequenceState();
      if (state) {
        console.log("✅ SequencePersistenceService: Current state loaded");
        // Ensure backward compatibility - add default activeBuildSubTab if missing
        return {
          currentSequence: state.currentSequence,
          selectedStartPosition: state.selectedStartPosition,
          hasStartPosition: state.hasStartPosition,
          activeBuildSubTab: (state as any).activeBuildSubTab || "construct"
        };
      } else {
        console.log("ℹ️ SequencePersistenceService: No saved state found");
      }
      return state;
    } catch (error) {
      console.error("❌ SequencePersistenceService: Failed to load current state:", error);
      return null;
    }
  }

  async clearCurrentState(): Promise<void> {
    try {
      await this.persistenceService.clearCurrentSequenceState();
      console.log("✅ SequencePersistenceService: Current state cleared");
    } catch (error) {
      console.error("❌ SequencePersistenceService: Failed to clear current state:", error);
      throw error;
    }
  }

  async hasSavedState(): Promise<boolean> {
    try {
      const state = await this.persistenceService.loadCurrentSequenceState();
      return state !== null;
    } catch (error) {
      console.error("❌ SequencePersistenceService: Failed to check for saved state:", error);
      return false;
    }
  }

  async getLastSaveTimestamp(): Promise<number | null> {
    try {
      const state = await this.persistenceService.loadCurrentSequenceState();
      if (state && 'timestamp' in state) {
        return (state as any).timestamp;
      }
      return null;
    } catch (error) {
      console.error("❌ SequencePersistenceService: Failed to get last save timestamp:", error);
      return null;
    }
  }
}
