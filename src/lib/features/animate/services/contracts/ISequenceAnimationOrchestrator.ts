/**
 * Sequence Animation Orchestrator Interface
 *
 * Interface for coordinating multiple animation services.
 * Higher-level orchestration of animation components.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { SequenceMetadata } from "$lib/shared/foundation/domain/models/SequenceData";
import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
import type { PropState, PropStates } from "../../shared/domain";

export interface ISequenceAnimationOrchestrator {
  initializeWithDomainData(sequenceData: SequenceData): boolean;
  calculateState(currentBeat: number): void;
  getPropStates(): PropStates;
  getBluePropState(): PropState;
  getRedPropState(): PropState;
  getMetadata(): SequenceMetadata;
  getCurrentPropStates(): PropStates;
  getCurrentLetter(): Letter | null;
  isInitialized(): boolean;
  dispose(): void;
}
