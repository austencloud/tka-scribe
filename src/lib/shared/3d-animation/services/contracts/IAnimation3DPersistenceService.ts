/**
 * IAnimation3DPersistenceService Contract
 *
 * Service for persisting 3D animation UI state to localStorage.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { MotionConfig3D } from "../../domain/models/MotionData3D";
import type { GridMode } from "../../domain/constants/grid-layout";
import type { Plane } from "../../domain/enums/Plane";

/**
 * State structure for persistence
 */
export interface Animation3DPersistedState {
  // Scene settings
  visiblePlanes: string[];
  showGrid: boolean;
  showLabels: boolean;
  gridMode: GridMode;
  cameraPreset: "front" | "top" | "side" | "perspective";

  // Custom camera position
  cameraPosition: [number, number, number] | null;
  cameraTarget: [number, number, number] | null;

  // UI state
  activeTab: "blue" | "red";
  panelOpen: boolean;
  speed: number;

  // Playback
  loop: boolean;

  // Prop visibility
  showBlue: boolean;
  showRed: boolean;

  // Manual configs
  blueConfig: MotionConfig3D;
  redConfig: MotionConfig3D;

  // Sequence state
  loadedSequence: SequenceData | null;
  currentBeatIndex: number;
}

export interface IAnimation3DPersistenceService {
  /**
   * Save state to localStorage (merges with existing)
   */
  saveState(state: Partial<Animation3DPersistedState>): void;

  /**
   * Load state from localStorage
   */
  loadState(): Partial<Animation3DPersistedState>;

  /**
   * Clear all persisted state
   */
  clearState(): void;

  /**
   * Convert plane strings back to Set<Plane>
   */
  parsePlanes(planeStrings: string[] | undefined): Set<Plane>;
}
