/**
 * Arrange Tab State
 *
 * State management for the Arrange tab in the Compose module.
 * Manages mode selection and sequence slot configuration.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { ComposeMode } from "$lib/features/compose/shared/state/compose-module-state.svelte";

// LocalStorage keys
const STORAGE_KEYS = {
  SELECTED_MODE: "compose-arrange-selected-mode",
  SEQUENCE_SLOTS: "compose-arrange-sequence-slots",
} as const;

export type ArrangeTabState = {
  // Mode selection
  readonly selectedMode: ComposeMode | null;

  // Sequence slots (keyed by slot identifier, e.g., "primary", "secondary", "grid-0", etc.)
  readonly sequenceSlots: Map<string, SequenceData | null>;

  // Derived state
  readonly isConfigurationComplete: boolean;
  readonly requiredSlots: string[];

  // State mutators
  selectMode: (mode: ComposeMode | null) => void;
  setSequenceForSlot: (slotId: string, sequence: SequenceData | null) => void;
  clearSlot: (slotId: string) => void;
  startPlayback: () => void;
  reset: () => void;
};

// Mode slot requirements
const MODE_SLOT_REQUIREMENTS: Record<ComposeMode, string[]> = {
  single: ["primary"],
  mirror: ["primary"],
  tunnel: ["primary", "secondary"],
  grid: ["grid-0", "grid-1", "grid-2", "grid-3"],
  "side-by-side": ["left", "right"],
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

export function createArrangeTabState(): ArrangeTabState {
  // Selected mode
  let selectedMode = $state<ComposeMode | null>(
    loadFromStorage<ComposeMode | null>(STORAGE_KEYS.SELECTED_MODE, null)
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
    selectMode(mode: ComposeMode | null) {
      selectedMode = mode;
      saveToStorage(STORAGE_KEYS.SELECTED_MODE, mode);

      // Clear sequence slots when mode changes
      sequenceSlots = new Map();
      saveToStorage(STORAGE_KEYS.SEQUENCE_SLOTS, {});

      console.log("🎨 ArrangeTabState: Mode selected:", mode);
    },

    // Sequence slot management
    setSequenceForSlot(slotId: string, sequence: SequenceData | null) {
      const newSlots = new Map(sequenceSlots);
      newSlots.set(slotId, sequence);
      sequenceSlots = newSlots;

      saveToStorage(STORAGE_KEYS.SEQUENCE_SLOTS, mapToObject(sequenceSlots));
      console.log(
        `🎨 ArrangeTabState: Sequence set for slot ${slotId}:`,
        sequence?.name
      );
    },

    clearSlot(slotId: string) {
      const newSlots = new Map(sequenceSlots);
      newSlots.delete(slotId);
      sequenceSlots = newSlots;

      saveToStorage(STORAGE_KEYS.SEQUENCE_SLOTS, mapToObject(sequenceSlots));
      console.log(`🎨 ArrangeTabState: Cleared slot ${slotId}`);
    },

    // Start playback (this would transition to the selected mode with configured sequences)
    startPlayback() {
      if (!isConfigurationComplete()) {
        console.warn(
          "🎨 ArrangeTabState: Cannot start playback - configuration incomplete"
        );
        return;
      }

      console.log(
        "🎨 ArrangeTabState: Starting playback with mode:",
        selectedMode
      );
      // The parent component will handle the actual transition
    },

    // Reset
    reset() {
      selectedMode = null;
      sequenceSlots = new Map();

      saveToStorage(STORAGE_KEYS.SELECTED_MODE, null);
      saveToStorage(STORAGE_KEYS.SEQUENCE_SLOTS, {});

      console.log("🎨 ArrangeTabState: Reset");
    },
  };
}

// Singleton instance
let arrangeTabStateInstance: ArrangeTabState | null = null;

export function getArrangeTabState(): ArrangeTabState {
  if (!arrangeTabStateInstance) {
    arrangeTabStateInstance = createArrangeTabState();
  }
  return arrangeTabStateInstance;
}
