/**
 * Tunnel Tab State
 *
 * State management for the Tunnel animation tab.
 * Manages: dual sequences, tunnel colors, opacity, playback
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

// LocalStorage keys
const STORAGE_KEYS = {
  PRIMARY_SEQUENCE: "animate-tunnel-primary-sequence",
  SECONDARY_SEQUENCE: "animate-tunnel-secondary-sequence",
  COLORS: "animate-tunnel-colors",
  OPACITY: "animate-tunnel-opacity",
} as const;

// Tunnel color configuration
export type TunnelColors = {
  left: string;
  right: string;
};

const DEFAULT_TUNNEL_COLORS: TunnelColors = {
  left: "#ff6b35",
  right: "#35a7ff",
};

const DEFAULT_OPACITY = 0.8;

export type TunnelTabState = {
  // Sequences (dual mode)
  readonly primarySequence: SequenceData | null;
  readonly secondarySequence: SequenceData | null;

  // Visual settings
  readonly tunnelColors: TunnelColors;
  readonly tunnelOpacity: number;

  // Playback
  readonly isPlaying: boolean;
  readonly speed: number;
  readonly shouldLoop: boolean;
  readonly currentBeat: number;

  // State mutators
  setPrimarySequence: (sequence: SequenceData | null) => void;
  setSecondarySequence: (sequence: SequenceData | null) => void;
  setTunnelColors: (colors: Partial<TunnelColors>) => void;
  setTunnelOpacity: (opacity: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setShouldLoop: (loop: boolean) => void;
  setCurrentBeat: (beat: number) => void;

  // Swap and reset
  swapSequences: () => void;
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

export function createTunnelTabState(): TunnelTabState {
  // Sequences
  let primarySequence = $state<SequenceData | null>(
    loadFromStorage(STORAGE_KEYS.PRIMARY_SEQUENCE, null)
  );
  let secondarySequence = $state<SequenceData | null>(
    loadFromStorage(STORAGE_KEYS.SECONDARY_SEQUENCE, null)
  );

  // Visual settings (persisted)
  let tunnelColors = $state<TunnelColors>(
    loadFromStorage(STORAGE_KEYS.COLORS, DEFAULT_TUNNEL_COLORS)
  );
  let tunnelOpacity = $state<number>(
    loadFromStorage(STORAGE_KEYS.OPACITY, DEFAULT_OPACITY)
  );

  // Playback state (not persisted)
  let isPlaying = $state<boolean>(false);
  let speed = $state<number>(1.0);
  let shouldLoop = $state<boolean>(true);
  let currentBeat = $state<number>(0);

  return {
    // Getters
    get primarySequence() {
      return primarySequence;
    },
    get secondarySequence() {
      return secondarySequence;
    },
    get tunnelColors() {
      return tunnelColors;
    },
    get tunnelOpacity() {
      return tunnelOpacity;
    },
    get isPlaying() {
      return isPlaying;
    },
    get speed() {
      return speed;
    },
    get shouldLoop() {
      return shouldLoop;
    },
    get currentBeat() {
      return currentBeat;
    },

    // Sequence setters
    setPrimarySequence(seq: SequenceData | null) {
      primarySequence = seq;
      saveToStorage(STORAGE_KEYS.PRIMARY_SEQUENCE, seq);
      currentBeat = 0;
      isPlaying = false;
    },

    setSecondarySequence(seq: SequenceData | null) {
      secondarySequence = seq;
      saveToStorage(STORAGE_KEYS.SECONDARY_SEQUENCE, seq);
      currentBeat = 0;
      isPlaying = false;
    },

    // Visual settings setters
    setTunnelColors(colors: Partial<TunnelColors>) {
      tunnelColors = { ...tunnelColors, ...colors };
      saveToStorage(STORAGE_KEYS.COLORS, tunnelColors);
    },

    setTunnelOpacity(opacity: number) {
      tunnelOpacity = Math.max(0, Math.min(1, opacity));
      saveToStorage(STORAGE_KEYS.OPACITY, tunnelOpacity);
    },

    // Playback setters
    setIsPlaying(playing: boolean) {
      isPlaying = playing;
    },

    setSpeed(newSpeed: number) {
      speed = Math.max(0.1, Math.min(3.0, newSpeed));
    },

    setShouldLoop(loop: boolean) {
      shouldLoop = loop;
    },

    setCurrentBeat(beat: number) {
      currentBeat = beat;
    },

    // Utility
    swapSequences() {
      const temp = primarySequence;
      primarySequence = secondarySequence;
      secondarySequence = temp;
      saveToStorage(STORAGE_KEYS.PRIMARY_SEQUENCE, primarySequence);
      saveToStorage(STORAGE_KEYS.SECONDARY_SEQUENCE, secondarySequence);
    },

    // Reset
    reset() {
      primarySequence = null;
      secondarySequence = null;
      tunnelColors = DEFAULT_TUNNEL_COLORS;
      tunnelOpacity = DEFAULT_OPACITY;
      isPlaying = false;
      speed = 1.0;
      shouldLoop = true;
      currentBeat = 0;

      saveToStorage(STORAGE_KEYS.PRIMARY_SEQUENCE, null);
      saveToStorage(STORAGE_KEYS.SECONDARY_SEQUENCE, null);
      saveToStorage(STORAGE_KEYS.COLORS, DEFAULT_TUNNEL_COLORS);
      saveToStorage(STORAGE_KEYS.OPACITY, DEFAULT_OPACITY);
    },
  };
}

// Singleton instance
let tunnelTabStateInstance: TunnelTabState | null = null;

export function getTunnelTabState(): TunnelTabState {
  if (!tunnelTabStateInstance) {
    tunnelTabStateInstance = createTunnelTabState();
  }
  return tunnelTabStateInstance;
}
