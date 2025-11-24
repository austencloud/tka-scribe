/**
 * Sequence Frame Pre-Renderer Service Interface
 *
 * Pre-renders entire animation sequences to ImageBitmap frames for perfect smooth playback.
 */

import type { SequenceData } from "$shared";
import type {
  PreRenderedSequence,
  PreRenderConfig,
  PreRenderProgress,
} from "../implementations/SequenceFramePreRenderer";

export interface ISequenceFramePreRenderer {
  /**
   * Pre-render entire sequence to frames
   *
   * @param sequenceData - Sequence to render
   * @param config - Rendering configuration
   * @param onProgress - Progress callback for UI updates
   * @returns Promise resolving to pre-rendered sequence
   */
  preRenderSequence(
    sequenceData: SequenceData,
    config?: Partial<PreRenderConfig>,
    onProgress?: (progress: PreRenderProgress) => void
  ): Promise<PreRenderedSequence>;

  /**
   * Get frame for specific timestamp
   *
   * @param timestamp - Time in ms from animation start
   * @returns Frame bitmap or null if not available
   */
  getFrameAtTimestamp(timestamp: number): ImageBitmap | null;

  /**
   * Get frame for specific beat number
   *
   * @param beat - Beat number (fractional)
   * @returns Frame bitmap or null if not available
   */
  getFrameAtBeat(beat: number): ImageBitmap | null;

  /**
   * Cancel current pre-render operation
   */
  cancel(): void;

  /**
   * Check if pre-render is in progress
   */
  isPreRendering(): boolean;

  /**
   * Check if sequence is ready for playback
   */
  isReady(): boolean;

  /**
   * Get current pre-rendered sequence
   */
  getCurrentSequence(): PreRenderedSequence | null;

  /**
   * Clear pre-rendered frames (free memory)
   */
  clear(): void;
}
