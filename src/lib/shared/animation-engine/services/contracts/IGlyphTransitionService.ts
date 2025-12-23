/**
 * Glyph Transition Service Interface
 *
 * Manages cross-fade transitions between glyph states (letter, turns, beat number).
 * Handles the timing and state management for smooth visual transitions.
 */

import type { Letter } from "$lib/shared/foundation/domain/models/Letter";

/**
 * Current transition state
 */
export interface GlyphTransitionState {
  // Currently displayed values
  displayedLetter: Letter | null;
  displayedTurnsTuple: string;
  displayedBeatNumber: number | null;

  // Fading out values (during transition)
  fadingOutLetter: Letter | null;
  fadingOutTurnsTuple: string | null;
  fadingOutBeatNumber: number | null;

  // Transition flags
  isNewLetter: boolean;
}

/**
 * Callback for transition state changes
 */
export type TransitionStateCallback = (state: GlyphTransitionState) => void;

/**
 * Service for managing glyph cross-fade transitions
 */
export interface IGlyphTransitionService {
  /**
   * Get current transition state
   */
  getState(): GlyphTransitionState;

  /**
   * Set callback for state changes
   */
  setStateCallback(callback: TransitionStateCallback): void;

  /**
   * Update the target glyph values - triggers transition if changed
   * @param letter - New letter (or null)
   * @param turnsTuple - New turns tuple string
   * @param beatNumber - New beat number
   */
  updateTarget(
    letter: Letter | null,
    turnsTuple: string,
    beatNumber: number | null
  ): void;

  /**
   * Get the transition duration in milliseconds
   */
  getTransitionDuration(): number;

  /**
   * Clean up resources (cancel any pending timeouts)
   */
  dispose(): void;
}
