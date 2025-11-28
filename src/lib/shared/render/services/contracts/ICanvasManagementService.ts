import type { BeatData } from "../../../../modules/create/shared/domain/models/BeatData";
import type { SequenceData } from "../../../foundation/domain/models/SequenceData";

/**
 * Canvas management and optimization service
 */
export interface ICanvasManagementService {
  /**
   * Create optimized canvas
   */
  createCanvas(width: number, height: number): HTMLCanvasElement;

  /**
   * Clone canvas
   */
  cloneCanvas(source: HTMLCanvasElement): HTMLCanvasElement;

  /**
   * Dispose canvas resources
   */
  disposeCanvas(canvas: HTMLCanvasElement): void;

  /**
   * Get canvas memory usage
   */
  getMemoryUsage(): number;

  /**
   * Clear canvas cache
   */
  clearCache(): void;
}

export interface IReversalDetectionService {
  /**
   * Process reversals for sequence
   */
  processReversals(sequence: SequenceData, beats: BeatData[]): BeatData[];

  /**
   * Detect reversal for single beat
   */
  detectReversal(
    previousBeats: BeatData[],
    currentBeat: BeatData
  ): { blueReversal: boolean; redReversal: boolean };

  /**
   * Apply reversal symbols to beat
   */
  applyReversalSymbols(
    beatData: BeatData,
    reversalInfo: { blueReversal: boolean; redReversal: boolean }
  ): BeatData;
}
