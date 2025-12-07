/**
 * PixiJS Fade Transition Manager
 *
 * Handles glyph fade transitions:
 * - Fade-in/fade-out timing
 * - Alpha interpolation
 * - Transition state management
 * - Cleanup after fade completion
 *
 * Single Responsibility: Glyph fade transition logic
 */

import type { Sprite } from "pixi.js";

export class PixiFadeTransitionManager {
  private readonly FADE_DURATION_MS = 300;

  private isFading: boolean = false;
  private fadeProgress: number = 0;
  private fadeStartTime: number | null = null;

  /**
   * Start a new fade transition
   */
  startFadeTransition(): void {
    this.isFading = true;
    this.fadeProgress = 0;
    this.fadeStartTime = performance.now();
  }

  /**
   * Update fade progress and sprite alphas
   * Returns true if fade is complete
   */
  updateFadeProgress(
    currentTime: number,
    currentGlyphSprite: Sprite | null,
    previousGlyphSprite: Sprite | null
  ): boolean {
    if (!this.isFading || this.fadeStartTime === null) return false;

    const elapsed = currentTime - this.fadeStartTime;
    this.fadeProgress = Math.min(elapsed / this.FADE_DURATION_MS, 1);

    // Update alphas
    if (previousGlyphSprite) {
      previousGlyphSprite.alpha = 1 - this.fadeProgress;
    }
    if (currentGlyphSprite) {
      currentGlyphSprite.alpha = this.fadeProgress;
    }

    // Check if fade complete
    if (this.fadeProgress >= 1) {
      this.isFading = false;
      this.fadeProgress = 1;
      return true; // Fade complete
    }

    return false; // Still fading
  }

  /**
   * Check if currently fading
   */
  isFadingInProgress(): boolean {
    return this.isFading;
  }

  /**
   * Get current fade progress (0-1)
   */
  getFadeProgress(): number {
    return this.fadeProgress;
  }

  /**
   * Reset transition state
   */
  reset(): void {
    this.isFading = false;
    this.fadeProgress = 0;
    this.fadeStartTime = null;
  }
}
