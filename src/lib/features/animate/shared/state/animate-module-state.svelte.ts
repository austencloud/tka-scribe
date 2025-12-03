/**
 * Animate Module State (Shared)
 *
 * Manages shared state for the Animate module:
 * - Current tab (setup, playback, browse)
 * - Current animation mode for playback (single, tunnel, mirror, grid, side-by-side)
 * - Sequence browser panel visibility and mode
 *
 * New tab structure:
 * - tabs/setup/ - Bento mode selection and sequence configuration
 * - tabs/playback/ - Unified animation playback with per-canvas controls
 * - tabs/browse/ - Saved animations gallery
 */

import type { AnimationMode } from "../domain/AnimationMode";

// Tab types for the new 3-tab structure
export type AnimateTab = "setup" | "playback" | "browse";

// Re-export AnimationMode for backwards compatibility
export type AnimateMode = AnimationMode;

export type BrowserTargetMode =
  | "primary"
  | "secondary"
  | "grid-0"
  | "grid-1"
  | "grid-2"
  | "grid-3";

// LocalStorage keys
const STORAGE_KEYS = {
  CURRENT_TAB: "animate-current-tab",
  CURRENT_MODE: "animate-current-mode",
} as const;

export type AnimateModuleState = {
  // Current tab (setup, playback, browse)
  readonly currentTab: AnimateTab;

  // Current animation mode (for playback) - single, tunnel, mirror, grid, side-by-side
  readonly currentMode: AnimateMode;

  // Sequence browser panel
  readonly isSequenceBrowserOpen: boolean;
  readonly browserMode: BrowserTargetMode;

  // Tab switching
  setCurrentTab: (tab: AnimateTab) => void;

  // Mode switching (for playback configuration)
  setCurrentMode: (mode: AnimateMode) => void;

  // Browser panel
  openSequenceBrowser: (mode: BrowserTargetMode) => void;
  closeSequenceBrowser: () => void;

  // Navigation helpers
  goToPlayback: () => void;
  goToSetup: () => void;

  // Reset
  reset: () => void;
};

// Helper functions for localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (err) {
    console.warn(`Failed to load ${key} from localStorage:`, err);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.warn(`Failed to save ${key} to localStorage:`, err);
  }
}

export function createAnimateModuleState(): AnimateModuleState {
  // Current tab (persisted)
  let currentTab = $state<AnimateTab>(
    loadFromStorage(STORAGE_KEYS.CURRENT_TAB, "setup")
  );

  // Current animation mode (persisted) - used for playback configuration
  let currentMode = $state<AnimateMode>(
    loadFromStorage(STORAGE_KEYS.CURRENT_MODE, "single")
  );

  // Sequence browser panel (not persisted - always starts closed)
  let isSequenceBrowserOpen = $state<boolean>(false);
  let browserMode = $state<BrowserTargetMode>("primary");

  return {
    // Getters
    get currentTab() {
      return currentTab;
    },
    get currentMode() {
      return currentMode;
    },
    get isSequenceBrowserOpen() {
      return isSequenceBrowserOpen;
    },
    get browserMode() {
      return browserMode;
    },

    // Tab switching
    setCurrentTab(tab: AnimateTab) {
      currentTab = tab;
      saveToStorage(STORAGE_KEYS.CURRENT_TAB, tab);
      console.log("🎬 AnimateModuleState: Tab changed to", tab);
    },

    // Mode switching (for playback configuration)
    setCurrentMode(mode: AnimateMode) {
      currentMode = mode;
      saveToStorage(STORAGE_KEYS.CURRENT_MODE, mode);
      console.log("🎬 AnimateModuleState: Mode changed to", mode);
    },

    // Browser panel
    openSequenceBrowser(mode: BrowserTargetMode) {
      console.log("🎬 AnimateModuleState: Opening browser for", mode, {
        currentlyOpen: isSequenceBrowserOpen,
        currentMode: browserMode,
      });

      browserMode = mode;
      isSequenceBrowserOpen = true;
      console.log("🎬 AnimateModuleState: Browser opened for", mode);
    },

    closeSequenceBrowser() {
      isSequenceBrowserOpen = false;
      console.log("🎬 AnimateModuleState: Browser closed");
    },

    // Navigation helpers
    goToPlayback() {
      currentTab = "playback";
      saveToStorage(STORAGE_KEYS.CURRENT_TAB, "playback");
      console.log("🎬 AnimateModuleState: Navigating to Playback");
    },

    goToSetup() {
      currentTab = "setup";
      saveToStorage(STORAGE_KEYS.CURRENT_TAB, "setup");
      console.log("🎬 AnimateModuleState: Navigating to Setup");
    },

    // Reset
    reset() {
      currentTab = "setup";
      currentMode = "single";
      isSequenceBrowserOpen = false;
      browserMode = "primary";

      saveToStorage(STORAGE_KEYS.CURRENT_TAB, "setup");
      saveToStorage(STORAGE_KEYS.CURRENT_MODE, "single");
      console.log("🎬 AnimateModuleState: Reset");
    },
  };
}

// Singleton instance
let animateModuleStateInstance: AnimateModuleState | null = null;

export function getAnimateModuleState(): AnimateModuleState {
  if (!animateModuleStateInstance) {
    animateModuleStateInstance = createAnimateModuleState();
  }
  return animateModuleStateInstance;
}
