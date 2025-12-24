/**
 * Animation 3D State
 *
 * Composes playback state with motion configuration and prop state calculation.
 * This is the main entry point for 3D animation state management.
 */

import type { PropState3D } from "../domain/models/PropState3D";
import type { MotionConfig3D } from "../domain/models/MotionData3D";
import { Plane } from "../domain/enums/Plane";
import { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import {
  MotionType,
  RotationDirection,
  Orientation,
} from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { createPlaybackState } from "./playback-state.svelte";
import { calculatePropState } from "../services/implementations/PropStateInterpolator";

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

  // Motion configurations
  let blueConfig = $state<MotionConfig3D>({ ...DEFAULT_BLUE_CONFIG });
  let redConfig = $state<MotionConfig3D>({ ...DEFAULT_RED_CONFIG });

  // Visibility
  let showBlue = $state(true);
  let showRed = $state(true);

  // Computed prop states (derived from config + playback progress)
  let bluePropState = $derived(calculatePropState(blueConfig, playback.progress));
  let redPropState = $derived(calculatePropState(redConfig, playback.progress));

  return {
    // Playback (delegate to playback state)
    get isPlaying() { return playback.isPlaying; },
    get progress() { return playback.progress; },
    get speed() { return playback.speed; },
    set speed(value: number) { playback.speed = value; },
    get loop() { return playback.loop; },
    set loop(value: boolean) { playback.loop = value; },

    // Motion configs
    get blueConfig() { return blueConfig; },
    set blueConfig(value: MotionConfig3D) { blueConfig = value; },
    get redConfig() { return redConfig; },
    set redConfig(value: MotionConfig3D) { redConfig = value; },

    // Visibility
    get showBlue() { return showBlue; },
    set showBlue(value: boolean) { showBlue = value; },
    get showRed() { return showRed; },
    set showRed(value: boolean) { showRed = value; },

    // Computed states
    get bluePropState() { return bluePropState; },
    get redPropState() { return redPropState; },

    // Methods (delegate to playback)
    play: playback.play,
    pause: playback.pause,
    togglePlay: playback.togglePlay,
    reset: playback.reset,
    setProgress: playback.setProgress,
    destroy: playback.destroy,
  };
}

export type Animation3DState = ReturnType<typeof createAnimation3DState>;
