/**
 * Animation 3D State
 *
 * Composes playback state with motion configuration and prop state calculation.
 * Supports both manual configuration and sequence-based animation.
 */

import type { PropState3D } from "../domain/models/PropState3D";
import type { MotionConfig3D } from "../domain/models/MotionData3D";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { Plane } from "../domain/enums/Plane";
import { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import {
  MotionType,
  RotationDirection,
  Orientation,
} from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { createPlaybackState } from "./playback-state.svelte";
import { calculatePropState } from "../services/implementations/PropStateInterpolator";
import {
  sequenceToMotionConfigs,
  createDefaultConfig,
  type BeatMotionConfigs,
} from "../utils/sequence-converter";

/**
 * Default motion config for blue prop
 */
const DEFAULT_BLUE_CONFIG: MotionConfig3D = {
  plane: Plane.WALL,
  startLocation: GridLocation.NORTH,
  endLocation: GridLocation.SOUTH,
  motionType: MotionType.PRO,
  rotationDirection: RotationDirection.CLOCKWISE,
  turns: 1,
  startOrientation: Orientation.IN,
  endOrientation: Orientation.OUT,
};

/**
 * Default motion config for red prop
 */
const DEFAULT_RED_CONFIG: MotionConfig3D = {
  plane: Plane.WALL,
  startLocation: GridLocation.SOUTH,
  endLocation: GridLocation.NORTH,
  motionType: MotionType.ANTI,
  rotationDirection: RotationDirection.COUNTER_CLOCKWISE,
  turns: 1,
  startOrientation: Orientation.OUT,
  endOrientation: Orientation.IN,
};

/**
 * Create Animation 3D State
 */
export function createAnimation3DState() {
  // Compose playback state
  const playback = createPlaybackState();

  // Motion configurations (manual mode)
  let blueConfig = $state<MotionConfig3D>({ ...DEFAULT_BLUE_CONFIG });
  let redConfig = $state<MotionConfig3D>({ ...DEFAULT_RED_CONFIG });

  // Visibility
  let showBlue = $state(true);
  let showRed = $state(true);

  // Sequence mode state
  let loadedSequence = $state<SequenceData | null>(null);
  let beatConfigs = $state<BeatMotionConfigs[]>([]);
  let currentBeatIndex = $state(0);

  // Mode: "manual" (user controls) or "sequence" (loaded from gallery)
  let mode = $derived<"manual" | "sequence">(loadedSequence ? "sequence" : "manual");

  // Current beat info for display
  let currentBeat = $derived<BeatMotionConfigs | null>(
    beatConfigs.length > 0 ? beatConfigs[currentBeatIndex] ?? null : null
  );
  let totalBeats = $derived(beatConfigs.length);

  // Active configs (either manual or from current beat)
  let activeBlueConfig = $derived<MotionConfig3D>(
    mode === "sequence" && currentBeat?.blue ? currentBeat.blue : blueConfig
  );

  let activeRedConfig = $derived<MotionConfig3D>(
    mode === "sequence" && currentBeat?.red ? currentBeat.red : redConfig
  );

  // Computed prop states (derived from active config + playback progress)
  let bluePropState = $derived(calculatePropState(activeBlueConfig, playback.progress));
  let redPropState = $derived(calculatePropState(activeRedConfig, playback.progress));

  /**
   * Load a sequence for animation
   */
  function loadSequence(sequence: SequenceData) {
    loadedSequence = sequence;
    beatConfigs = sequenceToMotionConfigs(sequence, Plane.WALL);
    currentBeatIndex = 0;
    playback.reset();

    // Update visibility based on what motions exist in first beat
    if (beatConfigs.length > 0) {
      const firstBeat = beatConfigs[0];
      showBlue = firstBeat?.blue !== null;
      showRed = firstBeat?.red !== null;
    }
  }

  /**
   * Clear loaded sequence, return to manual mode
   */
  function clearSequence() {
    loadedSequence = null;
    beatConfigs = [];
    currentBeatIndex = 0;
    blueConfig = { ...DEFAULT_BLUE_CONFIG };
    redConfig = { ...DEFAULT_RED_CONFIG };
    showBlue = true;
    showRed = true;
    playback.reset();
  }

  /**
   * Navigate to next beat
   */
  function nextBeat() {
    if (beatConfigs.length === 0) return;
    currentBeatIndex = Math.min(currentBeatIndex + 1, beatConfigs.length - 1);
    playback.reset();

    // Update visibility based on current beat
    const beat = beatConfigs[currentBeatIndex];
    if (beat) {
      showBlue = beat.blue !== null;
      showRed = beat.red !== null;
    }
  }

  /**
   * Navigate to previous beat
   */
  function prevBeat() {
    if (beatConfigs.length === 0) return;
    currentBeatIndex = Math.max(currentBeatIndex - 1, 0);
    playback.reset();

    // Update visibility based on current beat
    const beat = beatConfigs[currentBeatIndex];
    if (beat) {
      showBlue = beat.blue !== null;
      showRed = beat.red !== null;
    }
  }

  /**
   * Jump to specific beat
   */
  function goToBeat(index: number) {
    if (beatConfigs.length === 0) return;
    currentBeatIndex = Math.max(0, Math.min(index, beatConfigs.length - 1));
    playback.reset();

    // Update visibility based on current beat
    const beat = beatConfigs[currentBeatIndex];
    if (beat) {
      showBlue = beat.blue !== null;
      showRed = beat.red !== null;
    }
  }

  return {
    // Mode
    get mode() { return mode; },

    // Playback (delegate to playback state)
    get isPlaying() { return playback.isPlaying; },
    get progress() { return playback.progress; },
    get speed() { return playback.speed; },
    set speed(value: number) { playback.speed = value; },
    get loop() { return playback.loop; },
    set loop(value: boolean) { playback.loop = value; },

    // Motion configs (for manual mode editing)
    get blueConfig() { return blueConfig; },
    set blueConfig(value: MotionConfig3D) { blueConfig = value; },
    get redConfig() { return redConfig; },
    set redConfig(value: MotionConfig3D) { redConfig = value; },

    // Active configs (read-only, for display)
    get activeBlueConfig() { return activeBlueConfig; },
    get activeRedConfig() { return activeRedConfig; },

    // Visibility
    get showBlue() { return showBlue; },
    set showBlue(value: boolean) { showBlue = value; },
    get showRed() { return showRed; },
    set showRed(value: boolean) { showRed = value; },

    // Computed states
    get bluePropState() { return bluePropState; },
    get redPropState() { return redPropState; },

    // Sequence state
    get loadedSequence() { return loadedSequence; },
    get currentBeatIndex() { return currentBeatIndex; },
    get currentBeat() { return currentBeat; },
    get totalBeats() { return totalBeats; },

    // Playback methods
    play: playback.play,
    pause: playback.pause,
    togglePlay: playback.togglePlay,
    reset: playback.reset,
    setProgress: playback.setProgress,
    destroy: playback.destroy,

    // Sequence methods
    loadSequence,
    clearSequence,
    nextBeat,
    prevBeat,
    goToBeat,
  };
}

export type Animation3DState = ReturnType<typeof createAnimation3DState>;
