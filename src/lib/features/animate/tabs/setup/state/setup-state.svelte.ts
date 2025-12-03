/**
 * Setup Tab State
 *
 * State management for the Setup tab in the Animate module.
 * Manages mode selection and sequence slot configuration.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { AnimateMode } from "$lib/features/animate/shared/state/animate-module-state.svelte";

// LocalStorage keys
const STORAGE_KEYS = {
  SELECTED_MODE: "animate-setup-selected-mode",
  SEQUENCE_SLOTS: "animate-setup-sequence-slots",
} as const;

export type SetupTabState = {
  // Mode selection
  readonly selectedMode: AnimateMode | null;

  // Sequence slots (keyed by slot identifier, e.g., "primary", "secondary", "grid-0", etc.)
  readonly sequenceSlots: Map<string, SequenceData | null>;

  // Derived state
  readonly isConfigurationComplete: boolean;
  readonly requiredSlots: string[];

  // State mutators
  selectMode: (mode: AnimateMode | null) => void;
  setSequenceForSlot: (slotId: string, sequence: SequenceData | null) => void;
  clearSlot: (slotId: string) => void;
  startPlayback: () => void;
  reset: () => void;
};

// Mode slot requirements
const MODE_SLOT_REQUIREMENTS: Record<AnimateMode, string[]> = {
  single: ["primary"],
  mirror: ["primary"],
  tunnel: ["primary", "secondary"],
  grid: ["grid-0", "grid-1", "grid-2", "grid-3"],
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

// Map serialization helpers
function mapToObject<T>(map: Map<string, T>): Record<string, T> {
  const obj: Record<string, T> = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

function objectToMap<T>(obj: Record<string, T>): Map<string, T> {
  const map = new Map<string, T>();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(key, value);
  });
  return map;
}

export function createSetupTabState(): SetupTabState {
  // Selected mode
  let selectedMode = $state<AnimateMode | null>(
    loadFromStorage<AnimateMode | null>(STORAGE_KEYS.SELECTED_MODE, null)
  );

  // Sequence slots
  let sequenceSlots = $state<Map<string, SequenceData | null>>(
    objectToMap(
      loadFromStorage<Record<string, SequenceData | null>>(
        STORAGE_KEYS.SEQUENCE_SLOTS,
        {}
      )
    )
  );

  // Derived: required slots for current mode
  const requiredSlots = $derived(() => {
    if (!selectedMode) return [];
    return MODE_SLOT_REQUIREMENTS[selectedMode] || [];
  });

  // Derived: is configuration complete (all required slots filled)
  const isConfigurationComplete = $derived(() => {
    if (!selectedMode) return false;
    const required = requiredSlots();
    return required.every((slotId) => {
      const sequence = sequenceSlots.get(slotId);
      return sequence !== null && sequence !== undefined;
    });
  });

  return {
    // Getters
    get selectedMode() {
      return selectedMode;
    },
    get sequenceSlots() {
      return sequenceSlots;
    },
    get isConfigurationComplete() {
      return isConfigurationComplete();
    },
    get requiredSlots() {
      return requiredSlots();
    },

    // Mode selection
    selectMode(mode: AnimateMode | null) {
      selectedMode = mode;
      saveToStorage(STORAGE_KEYS.SELECTED_MODE, mode);

      // Clear sequence slots when mode changes
      sequenceSlots = new Map();
      saveToStorage(STORAGE_KEYS.SEQUENCE_SLOTS, {});

      console.log("🎨 SetupTabState: Mode selected:", mode);
    },

    // Sequence slot management
    setSequenceForSlot(slotId: string, sequence: SequenceData | null) {
      const newSlots = new Map(sequenceSlots);
      newSlots.set(slotId, sequence);
      sequenceSlots = newSlots;

      saveToStorage(STORAGE_KEYS.SEQUENCE_SLOTS, mapToObject(sequenceSlots));
      console.log(`🎨 SetupTabState: Sequence set for slot ${slotId}:`, sequence?.name);
    },

    clearSlot(slotId: string) {
      const newSlots = new Map(sequenceSlots);
      newSlots.delete(slotId);
      sequenceSlots = newSlots;

      saveToStorage(STORAGE_KEYS.SEQUENCE_SLOTS, mapToObject(sequenceSlots));
      console.log(`🎨 SetupTabState: Cleared slot ${slotId}`);
    },

    // Start playback (this would transition to the selected mode with configured sequences)
    startPlayback() {
      if (!isConfigurationComplete()) {
        console.warn("🎨 SetupTabState: Cannot start playback - configuration incomplete");
        return;
      }

      console.log("🎨 SetupTabState: Starting playback with mode:", selectedMode);
      // The parent component will handle the actual transition
    },

    // Reset
    reset() {
      selectedMode = null;
      sequenceSlots = new Map();

      saveToStorage(STORAGE_KEYS.SELECTED_MODE, null);
      saveToStorage(STORAGE_KEYS.SEQUENCE_SLOTS, {});

      console.log("🎨 SetupTabState: Reset");
    },
  };
}

// Singleton instance
let setupTabStateInstance: SetupTabState | null = null;

export function getSetupTabState(): SetupTabState {
  if (!setupTabStateInstance) {
    setupTabStateInstance = createSetupTabState();
  }
  return setupTabStateInstance;
}
