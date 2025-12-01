/**
 * Single Tab State
 *
 * State management for the Single animation tab.
 * Manages: sequence selection, playback state
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

// LocalStorage keys
const STORAGE_KEYS = {
  SEQUENCE: "animate-single-sequence",
} as const;

export type SingleTabState = {
  // Sequence
  readonly sequence: SequenceData | null;

  // Playback
  readonly isPlaying: boolean;
  readonly speed: number;
  readonly shouldLoop: boolean;
  readonly currentBeat: number;

  // State mutators
  setSequence: (sequence: SequenceData | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setShouldLoop: (loop: boolean) => void;
  setCurrentBeat: (beat: number) => void;

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

export function createSingleTabState(): SingleTabState {
  // Sequence
  let sequence = $state<SequenceData | null>(
    loadFromStorage(STORAGE_KEYS.SEQUENCE, null)
  );

  // Playback state
  let isPlaying = $state<boolean>(false);
  let speed = $state<number>(1.0);
  let shouldLoop = $state<boolean>(true);
  let currentBeat = $state<number>(0);

  return {
    // Getters
    get sequence() {
      return sequence;
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

    // Setters
    setSequence(seq: SequenceData | null) {
      sequence = seq;
      saveToStorage(STORAGE_KEYS.SEQUENCE, seq);
      // Reset beat when sequence changes
      currentBeat = 0;
      isPlaying = false;
    },

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

    // Reset
    reset() {
      sequence = null;
      isPlaying = false;
      speed = 1.0;
      shouldLoop = true;
      currentBeat = 0;
      saveToStorage(STORAGE_KEYS.SEQUENCE, null);
    },
  };
}

// Singleton instance
let singleTabStateInstance: SingleTabState | null = null;

export function getSingleTabState(): SingleTabState {
  if (!singleTabStateInstance) {
    singleTabStateInstance = createSingleTabState();
  }
  return singleTabStateInstance;
}
