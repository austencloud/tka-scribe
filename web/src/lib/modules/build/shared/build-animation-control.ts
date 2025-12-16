/**
 * Simple Animation Control
 * Just checks if animations should be enabled
 */

import { browser } from "$app/environment";

/**
 * Check if animations should run based on settings and user preferences
 */
export function shouldAnimate(): boolean {
  // Check user's reduced motion preference
  if (browser && typeof window !== "undefined") {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return false;
  }

  // For now, default to true. Can be enhanced with app settings later
  return true;
}

/**
 * Get current settings for use in fade functions
 */
export function getAnimationSettings() {
  return {
    animationsEnabled: shouldAnimate(),
  };
}