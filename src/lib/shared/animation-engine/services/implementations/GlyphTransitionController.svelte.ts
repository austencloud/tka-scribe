/**
 * Glyph Transition Service Implementation
 *
 * Manages cross-fade transitions between glyph states.
 *
 * Uses reactive state ownership - service owns $state, component derives from it.
 */

import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
import type {
  IGlyphTransitionController,
  GlyphTransitionState,
} from "../contracts/IGlyphTransitionController";

const GLYPH_TRANSITION_DURATION_MS = 200;

export class GlyphTransitionController implements IGlyphTransitionController {
  // Reactive state - owned by service
  state = $state<GlyphTransitionState>({
    displayedLetter: null,
    displayedTurnsTuple: "(s, 0, 0)",
    displayedBeatNumber: null,
    fadingOutLetter: null,
    fadingOutTurnsTuple: null,
    fadingOutBeatNumber: null,
    isNewLetter: false,
  });

  private fadeOutTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private newLetterTimeoutId: ReturnType<typeof setTimeout> | null = null;

  updateTarget(
    letter: Letter | null,
    turnsTuple: string,
    beatNumber: number | null
  ): void {
    const hasLetterChanged = letter !== this.state.displayedLetter;
    const hasTurnsChanged = turnsTuple !== this.state.displayedTurnsTuple;
    const hasBeatChanged = beatNumber !== this.state.displayedBeatNumber;

    if (!hasLetterChanged && !hasTurnsChanged && !hasBeatChanged) {
      return; // No change
    }

    // Start fading out old values (if we have any displayed)
    if (
      this.state.displayedLetter !== null ||
      this.state.displayedBeatNumber !== null
    ) {
      this.state.fadingOutLetter = this.state.displayedLetter;
      this.state.fadingOutTurnsTuple = this.state.displayedTurnsTuple;
      this.state.fadingOutBeatNumber = this.state.displayedBeatNumber;
      this.state.isNewLetter = true;

      // Clear any existing timeouts
      if (this.fadeOutTimeoutId) {
        clearTimeout(this.fadeOutTimeoutId);
      }
      if (this.newLetterTimeoutId) {
        clearTimeout(this.newLetterTimeoutId);
      }

      // Remove fading-out values after transition completes
      this.fadeOutTimeoutId = setTimeout(() => {
        this.state.fadingOutLetter = null;
        this.state.fadingOutTurnsTuple = null;
        this.state.fadingOutBeatNumber = null;
      }, GLYPH_TRANSITION_DURATION_MS);

      // Reset isNewLetter flag after transition
      this.newLetterTimeoutId = setTimeout(() => {
        this.state.isNewLetter = false;
      }, GLYPH_TRANSITION_DURATION_MS);
    }

    // Update displayed values
    this.state.displayedLetter = letter;
    this.state.displayedTurnsTuple = turnsTuple;
    this.state.displayedBeatNumber = beatNumber;
  }

  getTransitionDuration(): number {
    return GLYPH_TRANSITION_DURATION_MS;
  }

  dispose(): void {
    if (this.fadeOutTimeoutId) {
      clearTimeout(this.fadeOutTimeoutId);
      this.fadeOutTimeoutId = null;
    }
    if (this.newLetterTimeoutId) {
      clearTimeout(this.newLetterTimeoutId);
      this.newLetterTimeoutId = null;
    }
    // Reset state
    this.state.displayedLetter = null;
    this.state.displayedTurnsTuple = "(s, 0, 0)";
    this.state.displayedBeatNumber = null;
    this.state.fadingOutLetter = null;
    this.state.fadingOutTurnsTuple = null;
    this.state.fadingOutBeatNumber = null;
    this.state.isNewLetter = false;
  }
}
