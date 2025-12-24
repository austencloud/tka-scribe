/**
 * 3D Animation Persistence
 *
 * Saves and restores all UI state to localStorage for seamless dev experience.
 */

import type { MotionConfig3D } from "../domain/models/MotionData3D";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { Plane } from "../domain/enums/Plane";
import type { GridMode } from "../domain/constants/grid-layout";

const STORAGE_KEY = "tka-3d-animator-state";

export interface Animation3DPersistedState {
  // Scene settings
  visiblePlanes: string[]; // Plane enum values
  showGrid: boolean;
  showLabels: boolean;
  gridMode: GridMode;
  cameraPreset: "front" | "top" | "side" | "perspective";

  // Custom camera position (from orbit controls)
  cameraPosition: [number, number, number] | null;
  cameraTarget: [number, number, number] | null;

  // UI state
  activeTab: "blue" | "red";
  panelOpen: boolean;
  speedIndex: number;

  // Playback
  loop: boolean;

  // Prop visibility
  showBlue: boolean;
  showRed: boolean;

  // Manual configs
  blueConfig: MotionConfig3D;
  redConfig: MotionConfig3D;

  // Sequence state - store full sequence data for instant restore
  loadedSequence: SequenceData | null;
  currentBeatIndex: number;
}

/**
 * Save state to localStorage
 */
export function saveState(state: Partial<Animation3DPersistedState>): void {
  try {
    const existing = loadState();
    const merged = { ...existing, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn("Failed to save 3D animator state:", e);
  }
}

/**
 * Load state from localStorage
 */
export function loadState(): Partial<Animation3DPersistedState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (e) {
    console.warn("Failed to load 3D animator state:", e);
    return {};
  }
}

/**
 * Clear persisted state
 */
export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Convert plane strings back to Set<Plane>
 */
export function parsePlanes(planeStrings: string[] | undefined): Set<Plane> {
  if (!planeStrings) {
    return new Set([Plane.WALL, Plane.WHEEL, Plane.FLOOR]);
  }
  return new Set(planeStrings.map((p) => p as Plane));
}
