/**
 * Beat Frame Service (Runes-based)
 * 
 * Service for managing the beat frame display in the workbench.
 * Handles beat visualization, grid layout, and user interactions.
 */

import type { BeatData, PictographData } from '../domain';
import { GridMode } from '../domain';

interface BeatFrameConfig {
  columns: number;
  beatSize: number;
  gap: number;
  gridMode: GridMode;
}

class BeatFrameService {
  // Configuration state
  #config = $state<BeatFrameConfig>({
    columns: 4,
    beatSize: 120,
    gap: 8,
    gridMode: GridMode.DIAMOND
  });

  // Interaction state
  #hoveredBeatIndex = $state<number>(-1);
  #draggedBeatIndex = $state<number>(-1);

  // Derived state
  readonly config = $derived(this.#config);
  readonly hoveredBeatIndex = $derived(this.#hoveredBeatIndex);
  readonly draggedBeatIndex = $derived(this.#draggedBeatIndex);

  // Actions
  setConfig(updates: Partial<BeatFrameConfig>): void {
    this.#config = { ...this.#config, ...updates };
  }

  setHoveredBeat(index: number): void {
    this.#hoveredBeatIndex = index;
  }

  clearHoveredBeat(): void {
    this.#hoveredBeatIndex = -1;
  }

  setDraggedBeat(index: number): void {
    this.#draggedBeatIndex = index;
  }

  clearDraggedBeat(): void {
    this.#draggedBeatIndex = -1;
  }

  // Layout calculations
  calculateBeatPosition(index: number): { x: number; y: number } {
    const row = Math.floor(index / this.#config.columns);
    const col = index % this.#config.columns;
    
    return {
      x: col * (this.#config.beatSize + this.#config.gap),
      y: row * (this.#config.beatSize + this.#config.gap)
    };
  }

  calculateFrameDimensions(beatCount: number): { width: number; height: number } {
    const rows = Math.ceil(beatCount / this.#config.columns);
    
    return {
      width: this.#config.columns * (this.#config.beatSize + this.#config.gap) - this.#config.gap,
      height: rows * (this.#config.beatSize + this.#config.gap) - this.#config.gap
    };
  }

  // Beat interaction helpers
  getBeatAtPosition(x: number, y: number, beatCount: number): number {
    const col = Math.floor(x / (this.#config.beatSize + this.#config.gap));
    const row = Math.floor(y / (this.#config.beatSize + this.#config.gap));
    const index = row * this.#config.columns + col;
    
    return index >= 0 && index < beatCount ? index : -1;
  }

  isBeatVisible(beat: BeatData): boolean {
    return !beat.is_blank || beat.pictograph_data != null;
  }

  getBeatDisplayText(beat: BeatData): string {
    if (beat.is_blank && !beat.pictograph_data) {
      return beat.beat_number.toString();
    }
    
    return beat.pictograph_data?.letter ?? beat.metadata.letter ?? beat.beat_number.toString();
  }
}

// Singleton instance
export const beatFrameService = new BeatFrameService();
