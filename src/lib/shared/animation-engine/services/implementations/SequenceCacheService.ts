/**
 * Sequence Cache Service Implementation
 *
 * Manages cache lifecycle when sequences change or playback stops.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type {
  ISequenceCacheService,
  CacheClearCallback,
} from "../contracts/ISequenceCacheService";

export class SequenceCacheService implements ISequenceCacheService {
  private previousSequenceId: string | null = null;
  private clearCallback: CacheClearCallback | null = null;
  private preRenderClearCallback: CacheClearCallback | null = null;
  private hasPreRenderedFrames = false;

  setClearCallback(callback: CacheClearCallback): void {
    this.clearCallback = callback;
  }

  setPreRenderClearCallback(callback: CacheClearCallback): void {
    this.preRenderClearCallback = callback;
  }

  setHasPreRenderedFrames(value: boolean): void {
    this.hasPreRenderedFrames = value;
  }

  handleSequenceChange(sequenceData: SequenceData | null): string | null {
    if (!sequenceData) {
      // No sequence - clear everything
      this.clearCallback?.();
      this.previousSequenceId = null;
      return null;
    }

    // Generate unique sequence ID
    const word = sequenceData.word || sequenceData.name || "unknown";
    const totalBeats = sequenceData.beats?.length || 0;
    const newSequenceId = `${word}-${totalBeats}`;

    // If sequence changed, clear old data
    if (
      this.previousSequenceId !== null &&
      this.previousSequenceId !== newSequenceId
    ) {
      console.log(
        `🧹 Sequence changed (${this.previousSequenceId} -> ${newSequenceId}), clearing caches to prevent memory leak`
      );
      this.clearCallback?.();
    }

    this.previousSequenceId = newSequenceId;
    return this.previousSequenceId !== newSequenceId ? newSequenceId : null;
  }

  handlePlaybackChange(isPlaying: boolean): void {
    if (!isPlaying && this.hasPreRenderedFrames) {
      console.log(
        `🧹 Playback stopped, clearing pre-rendered frames to free memory`
      );
      this.preRenderClearCallback?.();
      this.hasPreRenderedFrames = false;
    }
  }

  getCurrentSequenceId(): string | null {
    return this.previousSequenceId;
  }

  dispose(): void {
    this.clearCallback = null;
    this.preRenderClearCallback = null;
    this.previousSequenceId = null;
  }
}
