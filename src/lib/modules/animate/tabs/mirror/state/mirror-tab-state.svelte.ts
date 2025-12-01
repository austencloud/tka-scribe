/**
 * Mirror Tab State
 *
 * State management for the Mirror animation tab.
 * Manages: mirror axis, original visibility, sequence, playback
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

// LocalStorage keys
const STORAGE_KEYS = {
  SEQUENCE: "animate-mirror-sequence",
  AXIS: "animate-mirror-axis",
  SHOW_ORIGINAL: "animate-mirror-show-original",
} as const;

// Mirror axis options (matches component definitions)
export type MirrorAxis = "vertical" | "horizontal";

const DEFAULT_AXIS: MirrorAxis = "vertical";
const DEFAULT_SHOW_ORIGINAL = true;

export type MirrorTabState = {
  // Sequence
  readonly sequence: SequenceData | null;

  // Mirror settings
  readonly mirrorAxis: MirrorAxis;
  readonly showOriginal: boolean;

  // Playback
  readonly isPlaying: boolean;
  readonly speed: number;
  readonly shouldLoop: boolean;
  readonly currentBeat: number;

  // State mutators
  setSequence: (sequence: SequenceData | null) => void;
  setMirrorAxis: (axis: MirrorAxis) => void;
  setShowOriginal: (show: boolean) => void;
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

export function createMirrorTabState(): MirrorTabState {
  // Sequence
  let sequence = $state<SequenceData | null>(
    loadFromStorage(STORAGE_KEYS.SEQUENCE, null)
  );

  // Mirror settings (persisted)
  let mirrorAxis = $state<MirrorAxis>(
    loadFromStorage(STORAGE_KEYS.AXIS, DEFAULT_AXIS)
  );
  let showOriginal = $state<boolean>(
    loadFromStorage(STORAGE_KEYS.SHOW_ORIGINAL, DEFAULT_SHOW_ORIGINAL)
  );

  // Playback state (not persisted)
  let isPlaying = $state<boolean>(false);
  let speed = $state<number>(1.0);
  let shouldLoop = $state<boolean>(true);
  let currentBeat = $state<number>(0);

  return {
    // Getters
    get sequence() {
      return sequence;
    },
    get mirrorAxis() {
      return mirrorAxis;
    },
    get showOriginal() {
      return showOriginal;
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
      currentBeat = 0;
      isPlaying = false;
    },

    setMirrorAxis(axis: MirrorAxis) {
      mirrorAxis = axis;
      saveToStorage(STORAGE_KEYS.AXIS, axis);
    },

    setShowOriginal(show: boolean) {
      showOriginal = show;
      saveToStorage(STORAGE_KEYS.SHOW_ORIGINAL, show);
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
      mirrorAxis = DEFAULT_AXIS;
      showOriginal = DEFAULT_SHOW_ORIGINAL;
      isPlaying = false;
      speed = 1.0;
      shouldLoop = true;
      currentBeat = 0;

      saveToStorage(STORAGE_KEYS.SEQUENCE, null);
      saveToStorage(STORAGE_KEYS.AXIS, DEFAULT_AXIS);
      saveToStorage(STORAGE_KEYS.SHOW_ORIGINAL, DEFAULT_SHOW_ORIGINAL);
    },
  };
}

// Singleton instance
let mirrorTabStateInstance: MirrorTabState | null = null;

export function getMirrorTabState(): MirrorTabState {
  if (!mirrorTabStateInstance) {
    mirrorTabStateInstance = createMirrorTabState();
  }
  return mirrorTabStateInstance;
}
