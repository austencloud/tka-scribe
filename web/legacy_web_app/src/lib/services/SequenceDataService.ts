/**
 * Sequence Data Service
 * 
 * Provides access to sequence data and operations
 */

import type { BeatData } from "$legacyLib/state/stores/sequenceStore";
import { sequenceStore } from "$legacyLib/state/stores/sequenceStore";
import { get } from "svelte/store";

/**
 * Interface for a sequence beat - simplified version of BeatData for external use
 */
export interface SequenceBeat {
  id: string;
  number: number;
  letter?: string;
  position?: string;
  orientation?: string;
  turnsTuple?: string;
  redPropData?: any;
  bluePropData?: any;
  redArrowData?: any;
  blueArrowData?: any;
  redMotionData?: any;
  blueMotionData?: any;
  metadata?: Record<string, unknown>;

  // Additional properties used by components
  blue_attributes?: any;
  red_attributes?: any;
  start_pos?: string;
  end_pos?: string;
  timing?: any;
  direction?: any;
  beat?: number; // For beat 0 identification
}

/**
 * Service class for managing sequence data
 */
class SequenceDataService {
  /**
   * Get the current sequence as an array of beats
   */
  getCurrentSequence(): SequenceBeat[] {
    const sequenceState = get(sequenceStore);
    return sequenceState.beats.map(this.convertBeatToSequenceBeat);
  }

  /**
   * Get a specific beat by index
   */
  getBeat(index: number): SequenceBeat | null {
    const sequence = this.getCurrentSequence();
    return sequence[index] || null;
  }

  /**
   * Get the current beat count
   */
  getBeatCount(): number {
    const sequenceState = get(sequenceStore);
    return sequenceState.beats.length;
  }

  /**
   * Check if the sequence is empty
   */
  isEmpty(): boolean {
    return this.getBeatCount() === 0;
  }

  /**
   * Get the sequence as a word (concatenated letters)
   */
  getSequenceWord(): string {
    const sequence = this.getCurrentSequence();
    return sequence
      .map(beat => beat.letter || '')
      .filter(letter => letter.length > 0)
      .join('');
  }

  /**
   * Get the last beat in the sequence
   */
  getLastBeat(): SequenceBeat | null {
    const sequence = this.getCurrentSequence();
    return sequence.length > 0 ? sequence[sequence.length - 1] : null;
  }

  /**
   * Get the first beat in the sequence
   */
  getFirstBeat(): SequenceBeat | null {
    const sequence = this.getCurrentSequence();
    return sequence.length > 0 ? sequence[0] : null;
  }

  /**
   * Convert BeatData to SequenceBeat format
   */
  private convertBeatToSequenceBeat(beat: BeatData): SequenceBeat {
    return {
      id: beat.id,
      number: beat.number,
      letter: beat.letter,
      position: beat.position,
      orientation: beat.orientation,
      turnsTuple: beat.turnsTuple,
      redPropData: beat.redPropData,
      bluePropData: beat.bluePropData,
      redArrowData: beat.redArrowData,
      blueArrowData: beat.blueArrowData,
      redMotionData: beat.redMotionData,
      blueMotionData: beat.blueMotionData,
      metadata: beat.metadata,
    };
  }

  /**
   * Subscribe to sequence changes
   */
  subscribe(callback: (sequence: SequenceBeat[]) => void): () => void {
    return sequenceStore.subscribe((state) => {
      const sequence = state.beats.map(this.convertBeatToSequenceBeat);
      callback(sequence);
    });
  }
}

// Create and export a singleton instance
const sequenceDataService = new SequenceDataService();
export default sequenceDataService;
