/**
 * Animate Module State (Shared)
 *
 * Manages shared state for the Animate module:
 * - Current animation mode/tab (single, tunnel, mirror, grid)
 * - Sequence browser panel visibility and mode
 *
 * Tab-specific state (sequences, playback, settings) has been moved to:
 * - tabs/single/state/single-tab-state.svelte.ts
 * - tabs/tunnel/state/tunnel-tab-state.svelte.ts
 * - tabs/mirror/state/mirror-tab-state.svelte.ts
 * - tabs/grid/state/grid-tab-state.svelte.ts
 */

export type AnimateMode = "single" | "tunnel" | "mirror" | "grid";

export type BrowserTargetMode =
  | "primary"
  | "secondary"
  | "grid-0"
  | "grid-1"
  | "grid-2"
  | "grid-3";

// LocalStorage keys
const STORAGE_KEYS = {
  CURRENT_MODE: "animate-current-mode",
} as const;

export type AnimateModuleState = {
  // Current tab/mode
  readonly currentMode: AnimateMode;

  // Sequence browser panel
  readonly isSequenceBrowserOpen: boolean;
  readonly browserMode: BrowserTargetMode;

  // State mutators
  setCurrentMode: (mode: AnimateMode) => void;

  // Browser panel
  openSequenceBrowser: (mode: BrowserTargetMode) => void;
  closeSequenceBrowser: () => void;

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
  // Current mode (persisted)
  let currentMode = $state<AnimateMode>(
    loadFromStorage(STORAGE_KEYS.CURRENT_MODE, "single")
  );

  // Sequence browser panel (not persisted - always starts closed)
  let isSequenceBrowserOpen = $state<boolean>(false);
  let browserMode = $state<BrowserTargetMode>("primary");

  return {
    // Getters
    get currentMode() {
      return currentMode;
    },
    get isSequenceBrowserOpen() {
      return isSequenceBrowserOpen;
    },
    get browserMode() {
      return browserMode;
    },

    // Mode switching
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

    // Reset
    reset() {
      currentMode = "single";
      isSequenceBrowserOpen = false;
      browserMode = "primary";

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
