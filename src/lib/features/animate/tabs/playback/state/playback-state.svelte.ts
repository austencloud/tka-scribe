/**
 * Playback State
 *
 * Unified playback state for the Animate module's Playback tab.
 * Manages sequences, canvas settings, and playback controls across all animation modes.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { TrailSettings } from "../../../shared/domain/types/TrailTypes";
import { DEFAULT_TRAIL_SETTINGS } from "../../../shared/domain/types/TrailTypes";
import type { AnimateMode } from "../../../shared/state/animate-module-state.svelte";

/**
 * Animation sequence slot for a specific canvas/position
 */
export interface AnimationSequenceSlot {
  sequence: SequenceData | null;
  visible: boolean;
  blueVisible: boolean;
  redVisible: boolean;
}

/**
 * Per-canvas settings (trail, rotation, etc.)
 */
export interface CanvasSettings {
  id: string;
  trailSettings: TrailSettings;
  rotationOffset?: number; // For grid mode
}

// LocalStorage keys
const STORAGE_KEYS = {
  SPEED: "playback-speed",
  SHOULD_LOOP: "playback-should-loop",
} as const;

export type PlaybackState = {
  // Playback controls
  readonly isPlaying: boolean;
  readonly speed: number;
  readonly shouldLoop: boolean;
  readonly currentBeat: number;

  // Current mode
  readonly currentMode: AnimateMode;

  // Sequences
  readonly sequences: AnimationSequenceSlot[];

  // Canvas settings
  readonly canvasSettings: CanvasSettings[];

  // Mutators - Playback
  play: () => void;
  pause: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  setLoop: (loop: boolean) => void;
  setCurrentBeat: (beat: number) => void;

  // Mutators - Mode & Sequences
  setCurrentMode: (mode: AnimateMode) => void;
  setSequences: (sequences: AnimationSequenceSlot[]) => void;
  updateSequenceSlot: (index: number, slot: Partial<AnimationSequenceSlot>) => void;

  // Mutators - Canvas Settings
  updateCanvasSettings: (canvasId: string, settings: Partial<CanvasSettings>) => void;
  updateTrailSettings: (canvasId: string, trailSettings: Partial<TrailSettings>) => void;

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
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to save ${key} to localStorage:`, err);
  }
}

export function createPlaybackState(): PlaybackState {
  // Playback state
  let isPlaying = $state(false);
  let speed = $state(loadFromStorage(STORAGE_KEYS.SPEED, 1.0));
  let shouldLoop = $state(loadFromStorage(STORAGE_KEYS.SHOULD_LOOP, false));
  let currentBeat = $state(0);

  // Current mode
  let currentMode = $state<AnimateMode>("single");

  // Sequences
  let sequences = $state<AnimationSequenceSlot[]>([]);

  // Canvas settings (one per canvas)
  let canvasSettings = $state<CanvasSettings[]>([
    {
      id: "main",
      trailSettings: { ...DEFAULT_TRAIL_SETTINGS },
    },
  ]);

  return {
    // Getters
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
    get currentMode() {
      return currentMode;
    },
    get sequences() {
      return sequences;
    },
    get canvasSettings() {
      return canvasSettings;
    },

    // Playback controls
    play() {
      isPlaying = true;
      console.log("▶️ Playback: Play");
    },

    pause() {
      isPlaying = false;
      console.log("⏸️ Playback: Pause");
    },

    stop() {
      isPlaying = false;
      currentBeat = 0;
      console.log("⏹️ Playback: Stop");
    },

    setSpeed(newSpeed: number) {
      speed = Math.max(0.1, Math.min(3.0, newSpeed));
      saveToStorage(STORAGE_KEYS.SPEED, speed);
      console.log(`🎬 Playback: Speed set to ${speed}x`);
    },

    setLoop(loop: boolean) {
      shouldLoop = loop;
      saveToStorage(STORAGE_KEYS.SHOULD_LOOP, loop);
      console.log(`🔁 Playback: Loop ${loop ? "enabled" : "disabled"}`);
    },

    setCurrentBeat(beat: number) {
      currentBeat = beat;
    },

    // Mode & Sequences
    setCurrentMode(mode: AnimateMode) {
      currentMode = mode;
      console.log(`🎬 Playback: Mode changed to ${mode}`);
    },

    setSequences(newSequences: AnimationSequenceSlot[]) {
      sequences = newSequences;
      console.log(`🎬 Playback: Sequences updated`, newSequences);
    },

    updateSequenceSlot(index: number, slot: Partial<AnimationSequenceSlot>) {
      const existing = sequences[index];
      if (index >= 0 && index < sequences.length && existing) {
        sequences[index] = {
          sequence: slot.sequence !== undefined ? slot.sequence : existing.sequence,
          visible: slot.visible !== undefined ? slot.visible : existing.visible,
          blueVisible: slot.blueVisible !== undefined ? slot.blueVisible : existing.blueVisible,
          redVisible: slot.redVisible !== undefined ? slot.redVisible : existing.redVisible,
        };
        console.log(`🎬 Playback: Sequence slot ${index} updated`, slot);
      }
    },

    // Canvas Settings
    updateCanvasSettings(canvasId: string, settings: Partial<CanvasSettings>) {
      const index = canvasSettings.findIndex((cs) => cs.id === canvasId);
      const existing = canvasSettings[index];
      if (index !== -1 && existing) {
        canvasSettings[index] = {
          id: settings.id !== undefined ? settings.id : existing.id,
          trailSettings: settings.trailSettings !== undefined ? settings.trailSettings : existing.trailSettings,
          rotationOffset: settings.rotationOffset !== undefined ? settings.rotationOffset : existing.rotationOffset,
        };
        console.log(`🎨 Playback: Canvas settings updated for ${canvasId}`, settings);
      } else {
        // Create new canvas settings if not found
        canvasSettings.push({
          id: canvasId,
          trailSettings: { ...DEFAULT_TRAIL_SETTINGS },
          ...settings,
        });
      }
    },

    updateTrailSettings(canvasId: string, trailSettings: Partial<TrailSettings>) {
      const index = canvasSettings.findIndex((cs) => cs.id === canvasId);
      const existing = canvasSettings[index];
      if (index !== -1 && existing) {
        canvasSettings[index] = {
          ...existing,
          trailSettings: {
            ...existing.trailSettings,
            ...trailSettings,
          },
        };
        console.log(`🎨 Playback: Trail settings updated for ${canvasId}`, trailSettings);
      }
    },

    // Reset
    reset() {
      isPlaying = false;
      speed = 1.0;
      shouldLoop = false;
      currentBeat = 0;
      currentMode = "single";
      sequences = [];
      canvasSettings = [
        {
          id: "main",
          trailSettings: { ...DEFAULT_TRAIL_SETTINGS },
        },
      ];
      console.log("🔄 Playback: State reset");
    },
  };
}

// Singleton instance
let playbackStateInstance: PlaybackState | null = null;

export function getPlaybackState(): PlaybackState {
  if (!playbackStateInstance) {
    playbackStateInstance = createPlaybackState();
  }
  return playbackStateInstance;
}
