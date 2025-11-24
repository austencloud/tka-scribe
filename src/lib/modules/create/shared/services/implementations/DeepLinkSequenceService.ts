/**
 * Deep Link Sequence Service Implementation
 *
 * Handles loading sequences from deep links and pending edits.
 * Encapsulates the complex sequence enrichment logic that was
 * previously in CreateModule.svelte onMount (80+ lines).
 *
 * Domain: Create module - Sequence Loading
 */

import { injectable } from "inversify";
import { deepLinkStore } from "$shared/navigation/utils/deep-link-store.svelte";
import { deriveLettersForSequence } from "$shared/navigation/utils/letter-deriver-helper";
import { derivePositionsForSequence } from "$shared/navigation/utils/position-deriver-helper";
import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";
import type {
  DeepLinkLoadResult,
  IDeepLinkSequenceService,
} from "../contracts/IDeepLinkSequenceService";

const PENDING_EDIT_KEY = "tka-pending-edit-sequence";

@injectable()
export class DeepLinkSequenceService implements IDeepLinkSequenceService {
  hasDeepLink(): boolean {
    return deepLinkStore.has("create");
  }

  hasPendingEdit(): boolean {
    try {
      return localStorage.getItem(PENDING_EDIT_KEY) !== null;
    } catch {
      return false;
    }
  }

  async loadFromDeepLink(
    setSequence: (sequence: SequenceData) => void
  ): Promise<DeepLinkLoadResult> {
    const deepLinkData = deepLinkStore.consume("create");

    if (!deepLinkData) {
      return { loaded: false };
    }

    try {
      // Set sequence immediately (positions/letters enriched async)
      setSequence(deepLinkData.sequence);

      // Enrich sequence with derived data in background
      this.enrichSequenceAsync(deepLinkData.sequence, setSequence);

      return {
        loaded: true,
        source: "deepLink",
        targetTab: deepLinkData.tabId,
      };
    } catch (err) {
      console.error("Failed to load deep link sequence:", err);
      return { loaded: false };
    }
  }

  async loadFromPendingEdit(
    setSequence: (sequence: SequenceData) => void
  ): Promise<DeepLinkLoadResult> {
    try {
      const pendingData = localStorage.getItem(PENDING_EDIT_KEY);

      if (!pendingData) {
        return { loaded: false };
      }

      const sequence = JSON.parse(pendingData) as SequenceData;
      setSequence(sequence);
      this.clearPendingEdit();

      return {
        loaded: true,
        source: "pendingEdit",
      };
    } catch (err) {
      console.error("Failed to load pending edit sequence:", err);
      this.clearPendingEdit(); // Clear invalid data
      return { loaded: false };
    }
  }

  async loadFromAnySource(
    setSequence: (sequence: SequenceData) => void
  ): Promise<DeepLinkLoadResult> {
    // Deep link takes priority
    if (this.hasDeepLink()) {
      return this.loadFromDeepLink(setSequence);
    }

    // Fall back to pending edit
    if (this.hasPendingEdit()) {
      return this.loadFromPendingEdit(setSequence);
    }

    return { loaded: false };
  }

  clearPendingEdit(): void {
    try {
      localStorage.removeItem(PENDING_EDIT_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Enrich sequence with derived positions and letters asynchronously.
   * This is the complex merging logic extracted from CreateModule.svelte.
   */
  private enrichSequenceAsync(
    sequence: SequenceData,
    setSequence: (sequence: SequenceData) => void
  ): void {
    Promise.all([
      derivePositionsForSequence(sequence),
      deriveLettersForSequence(sequence),
    ])
      .then(([sequenceWithPositions, sequenceWithLetters]) => {
        const enrichedSequence = this.mergeEnrichedSequence(
          sequenceWithPositions,
          sequenceWithLetters
        );
        setSequence(enrichedSequence);
      })
      .catch((err) => {
        console.warn("Position/letter derivation failed:", err);
        // Original sequence already loaded, no action needed
      });
  }

  /**
   * Merge position-enriched and letter-enriched sequences.
   * Letters take precedence but preserve positions from position derivation.
   */
  private mergeEnrichedSequence(
    sequenceWithPositions: SequenceData,
    sequenceWithLetters: SequenceData
  ): SequenceData {
    return {
      ...sequenceWithLetters,
      beats: sequenceWithLetters.beats.map((beat, index) => ({
        ...beat,
        startPosition:
          beat.startPosition ??
          sequenceWithPositions.beats[index]?.startPosition,
        endPosition:
          beat.endPosition ?? sequenceWithPositions.beats[index]?.endPosition,
      })),
      startPosition: sequenceWithLetters.startPosition
        ? {
            ...sequenceWithLetters.startPosition,
            startPosition:
              sequenceWithLetters.startPosition.startPosition ??
              sequenceWithPositions.startPosition?.startPosition,
            endPosition:
              sequenceWithLetters.startPosition.endPosition ??
              sequenceWithPositions.startPosition?.endPosition,
          }
        : sequenceWithPositions.startPosition,
      startingPositionBeat: sequenceWithLetters.startingPositionBeat
        ? {
            ...sequenceWithLetters.startingPositionBeat,
            startPosition:
              sequenceWithLetters.startingPositionBeat.startPosition ??
              sequenceWithPositions.startingPositionBeat?.startPosition,
            endPosition:
              sequenceWithLetters.startingPositionBeat.endPosition ??
              sequenceWithPositions.startingPositionBeat?.endPosition,
          }
        : sequenceWithPositions.startingPositionBeat,
      // Add timestamp to ensure reactivity
      metadata: {
        ...sequenceWithLetters.metadata,
        _enrichedAt: Date.now(),
      },
    } as SequenceData;
  }
}
