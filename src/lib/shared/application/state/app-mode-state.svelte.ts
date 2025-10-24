/**
 * App Mode State - Svelte 5 Runes
 *
 * Manages application mode transitions and landing page state.
 * Handles the transition between landing page and main app.
 */

import { browser } from "$app/environment";
import {
  DEFAULT_LANDING_BACKGROUND,
  LANDING_BACKGROUND_KEY,
} from "./app-state-constants";
import type { LandingBackground } from "./app-state-types";

// Load from localStorage
function loadLandingBackground(): LandingBackground {
  if (!browser) return DEFAULT_LANDING_BACKGROUND;

  try {
    const stored = localStorage.getItem(LANDING_BACKGROUND_KEY);
    if (stored && ["deepOcean", "snowfall", "nightSky"].includes(stored)) {
      return stored as LandingBackground;
    }
  } catch (error) {
    console.warn("Failed to load landing background from localStorage:", error);
  }

  return DEFAULT_LANDING_BACKGROUND;
}

// Reactive state
const appModeState = $state({
  landingBackground: loadLandingBackground(),
  isTransitioning: false,
});

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Set the landing page background
 */
export function setLandingBackground(background: LandingBackground): void {
  appModeState.landingBackground = background;

  if (browser) {
    try {
      localStorage.setItem(LANDING_BACKGROUND_KEY, background);
    } catch (error) {
      console.warn("Failed to save landing background to localStorage:", error);
    }
  }
}

/**
 * Get the current landing background
 */
export function getLandingBackground(): LandingBackground {
  return appModeState.landingBackground;
}

/**
 * Check if currently transitioning between modes
 */
export function isTransitioning(): boolean {
  return appModeState.isTransitioning;
}
