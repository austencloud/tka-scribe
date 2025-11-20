import type { BeatData, SequenceData } from "$shared";

/**
 * Coordination service for the Construct tab within the Create module
 * Restored minimal contract based on usages in CreateModuleEventService.
 */
export interface IConstructCoordinator {
  setupComponentCoordination(components: Record<string, unknown>): void;
  handleSequenceModified(sequence: SequenceData): Promise<void>;
  handleStartPositionSet(startPosition: BeatData): void;
  handleBeatAdded(beatData: BeatData): Promise<void>;
  handleGenerationRequest(config: Record<string, unknown>): void;
  handleUITransitionRequest(targetPanel: string): void;
}

// Legacy type alias for backward compatibility
/** @deprecated Use IConstructCoordinator instead */
export type IBuildConstructSectionCoordinator = IConstructCoordinator;
