/**
 * Grid Tab State
 *
 * State management for the Grid animation tab.
 * Manages: multiple sequences in grid layout, rotation offsets, playback
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

// LocalStorage keys
const STORAGE_KEYS = {
  SEQUENCES: "animate-grid-sequences",
  ROTATION_OFFSETS: "animate-grid-rotation-offsets",
  GRID_SIZE: "animate-grid-size",
} as const;

// Grid configuration
export type GridSize = {
  rows: number;
  cols: number;
};

const DEFAULT_GRID_SIZE: GridSize = { rows: 2, cols: 2 };
const MAX_GRID_CELLS = 16;

export type GridTabState = {
  // Grid configuration
  readonly gridSize: GridSize;
  readonly maxCells: number;

  // Sequences (array for grid cells)
  readonly sequences: (SequenceData | null)[];
  readonly rotationOffsets: number[];

  // Playback
  readonly isPlaying: boolean;
  readonly speed: number;
  readonly shouldLoop: boolean;
  readonly currentBeat: number;

  // Derived
  readonly totalCells: number;
  readonly hasAnySequence: boolean;

  // State mutators
  setGridSize: (size: Partial<GridSize>) => void;
  setSequenceAt: (index: number, sequence: SequenceData | null) => void;
  setRotationOffsetAt: (index: number, offset: number) => void;
  setAllRotationOffsets: (offset: number) => void;
  clearSequenceAt: (index: number) => void;
  clearAllSequences: () => void;
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

// Initialize arrays for grid
function createEmptyArrays(size: number): {
  sequences: (SequenceData | null)[];
  offsets: number[];
} {
  return {
    sequences: new Array(size).fill(null),
    offsets: new Array(size).fill(0),
  };
}

export function createGridTabState(): GridTabState {
  // Grid configuration
  let gridSize = $state<GridSize>(
    loadFromStorage(STORAGE_KEYS.GRID_SIZE, DEFAULT_GRID_SIZE)
  );

  const totalCells = $derived(gridSize.rows * gridSize.cols);

  // Initialize arrays with proper size
  const initialSize = gridSize.rows * gridSize.cols;
  const loadedSequences = loadFromStorage<(SequenceData | null)[]>(
    STORAGE_KEYS.SEQUENCES,
    createEmptyArrays(initialSize).sequences
  );
  const loadedOffsets = loadFromStorage<number[]>(
    STORAGE_KEYS.ROTATION_OFFSETS,
    createEmptyArrays(initialSize).offsets
  );

  // Ensure arrays are correctly sized
  let sequences = $state<(SequenceData | null)[]>(
    loadedSequences.length >= initialSize
      ? loadedSequences.slice(0, initialSize)
      : [...loadedSequences, ...new Array(initialSize - loadedSequences.length).fill(null)]
  );

  let rotationOffsets = $state<number[]>(
    loadedOffsets.length >= initialSize
      ? loadedOffsets.slice(0, initialSize)
      : [...loadedOffsets, ...new Array(initialSize - loadedOffsets.length).fill(0)]
  );

  // Playback state (not persisted)
  let isPlaying = $state<boolean>(false);
  let speed = $state<number>(1.0);
  let shouldLoop = $state<boolean>(true);
  let currentBeat = $state<number>(0);

  // Derived state
  const hasAnySequence = $derived(sequences.some((seq) => seq !== null));

  return {
    // Getters
    get gridSize() {
      return gridSize;
    },
    get maxCells() {
      return MAX_GRID_CELLS;
    },
    get sequences() {
      return sequences;
    },
    get rotationOffsets() {
      return rotationOffsets;
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
    get totalCells() {
      return totalCells;
    },
    get hasAnySequence() {
      return hasAnySequence;
    },

    // Grid configuration
    setGridSize(size: Partial<GridSize>) {
      const newSize = {
        rows: Math.max(1, Math.min(4, size.rows ?? gridSize.rows)),
        cols: Math.max(1, Math.min(4, size.cols ?? gridSize.cols)),
      };

      // Ensure we don't exceed max cells
      if (newSize.rows * newSize.cols > MAX_GRID_CELLS) {
        return;
      }

      gridSize = newSize;
      saveToStorage(STORAGE_KEYS.GRID_SIZE, newSize);

      // Resize arrays
      const newTotal = newSize.rows * newSize.cols;
      if (newTotal > sequences.length) {
        sequences = [...sequences, ...new Array(newTotal - sequences.length).fill(null)];
        rotationOffsets = [...rotationOffsets, ...new Array(newTotal - rotationOffsets.length).fill(0)];
      } else if (newTotal < sequences.length) {
        sequences = sequences.slice(0, newTotal);
        rotationOffsets = rotationOffsets.slice(0, newTotal);
      }

      saveToStorage(STORAGE_KEYS.SEQUENCES, sequences);
      saveToStorage(STORAGE_KEYS.ROTATION_OFFSETS, rotationOffsets);
    },

    // Sequence operations
    setSequenceAt(index: number, sequence: SequenceData | null) {
      if (index >= 0 && index < sequences.length) {
        sequences[index] = sequence;
        saveToStorage(STORAGE_KEYS.SEQUENCES, sequences);
        currentBeat = 0;
        isPlaying = false;
      }
    },

    clearSequenceAt(index: number) {
      if (index >= 0 && index < sequences.length) {
        sequences[index] = null;
        saveToStorage(STORAGE_KEYS.SEQUENCES, sequences);
      }
    },

    clearAllSequences() {
      sequences = new Array(sequences.length).fill(null);
      saveToStorage(STORAGE_KEYS.SEQUENCES, sequences);
      currentBeat = 0;
      isPlaying = false;
    },

    // Rotation operations
    setRotationOffsetAt(index: number, offset: number) {
      if (index >= 0 && index < rotationOffsets.length) {
        // Normalize to 0-360
        rotationOffsets[index] = ((offset % 360) + 360) % 360;
        saveToStorage(STORAGE_KEYS.ROTATION_OFFSETS, rotationOffsets);
      }
    },

    setAllRotationOffsets(offset: number) {
      const normalized = ((offset % 360) + 360) % 360;
      rotationOffsets = new Array(rotationOffsets.length).fill(normalized);
      saveToStorage(STORAGE_KEYS.ROTATION_OFFSETS, rotationOffsets);
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

    // Reset
    reset() {
      gridSize = DEFAULT_GRID_SIZE;
      const newTotal = DEFAULT_GRID_SIZE.rows * DEFAULT_GRID_SIZE.cols;
      sequences = new Array(newTotal).fill(null);
      rotationOffsets = new Array(newTotal).fill(0);
      isPlaying = false;
      speed = 1.0;
      shouldLoop = true;
      currentBeat = 0;

      saveToStorage(STORAGE_KEYS.GRID_SIZE, DEFAULT_GRID_SIZE);
      saveToStorage(STORAGE_KEYS.SEQUENCES, sequences);
      saveToStorage(STORAGE_KEYS.ROTATION_OFFSETS, rotationOffsets);
    },
  };
}

// Singleton instance
let gridTabStateInstance: GridTabState | null = null;

export function getGridTabState(): GridTabState {
  if (!gridTabStateInstance) {
    gridTabStateInstance = createGridTabState();
  }
  return gridTabStateInstance;
}
