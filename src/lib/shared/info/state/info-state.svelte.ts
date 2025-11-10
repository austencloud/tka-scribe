/**
 * Info Page State Management
 *
 * Manages the full-screen info modal overlay state.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const FIRST_VISIT_KEY = "tka-has-visited-studio";

// ============================================================================
// UI STATE
// ============================================================================

export const infoUIState = $state({
  isOpen: false,
  isAnimating: false,
  isAutoOpened: false, // Whether it was auto-opened on first visit
  isEnteringStudio: false, // Whether the entry animation is playing
});

// ============================================================================
// VISIT DETECTION
// ============================================================================

/**
 * Check if this is the user's first visit
 */
export function isFirstVisit(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(FIRST_VISIT_KEY) !== "true";
}

/**
 * Mark the studio as visited (called when user enters for the first time)
 */
export function markStudioVisited() {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(FIRST_VISIT_KEY, "true");
}

/**
 * Reset visit status (for testing/debugging)
 */
export function resetVisitStatus() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(FIRST_VISIT_KEY);
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Open the info modal with animation
 * @param autoOpened - Whether this was automatically opened (first visit)
 */
export function openInfo(autoOpened: boolean = false) {
  if (infoUIState.isOpen) return;

  infoUIState.isAnimating = true;
  infoUIState.isOpen = true;
  infoUIState.isAutoOpened = autoOpened;

  // Reset animation flag after transition
  setTimeout(() => {
    infoUIState.isAnimating = false;
  }, 400);
}

/**
 * Close the info modal with animation
 * @param withStudioEntry - Whether to play the studio entry animation
 */
export function closeInfo(withStudioEntry: boolean = false) {
  if (!infoUIState.isOpen) return;

  // If this is a first-time studio entry, play the special animation
  if (withStudioEntry && infoUIState.isAutoOpened) {
    infoUIState.isEnteringStudio = true;
    infoUIState.isAnimating = true;
    markStudioVisited();

    // Extended timing for the entry animation
    setTimeout(() => {
      infoUIState.isOpen = false;
      infoUIState.isAnimating = false;
      infoUIState.isAutoOpened = false;

      // Keep entry animation visible a bit longer
      setTimeout(() => {
        infoUIState.isEnteringStudio = false;
      }, 1200);
    }, 800);
  } else {
    // Standard close - trigger transition immediately, clean up after animation completes
    infoUIState.isOpen = false;
    infoUIState.isAnimating = true;

    // Clean up animation flags after transition completes
    setTimeout(() => {
      infoUIState.isAnimating = false;
      infoUIState.isAutoOpened = false;
    }, 200);
  }
}

/**
 * Toggle info modal (always manual toggle, never auto-opened)
 */
export function toggleInfo() {
  if (infoUIState.isOpen) {
    closeInfo(false);
  } else {
    openInfo(false);
  }
}
