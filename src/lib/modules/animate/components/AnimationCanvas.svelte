<!--
  AnimationCanvas.svelte

  Wraps AnimatorCanvas with styling container.
  Handles canvas display and container styling.

  Now includes AnimationVideoPlayer for video generation/playback.
-->
<script lang="ts">
  import { AnimatorCanvas } from '$lib/shared/animate/components';
  import AnimationVideoPlayer from "./AnimationVideoPlayer.svelte";
  import { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import type { BeatData } from "../../create/shared/domain/models/BeatData";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { StartPositionData } from "../../create/shared/domain/models/StartPositionData";
  import type { PropState } from "../domain/types/PropState";
  import type { TrailSettings } from "../domain/types/TrailTypes";
  import type { VideoRenderResult } from "../services/contracts/IVideoPreRenderService";

  let {
    blueProp = null,
    redProp = null,
    gridVisible = true,
    gridMode = null,
    letter = null,
    beatData = null,
    sequenceData = null,
    isPlaying = false,
    speed = 1.0,
    trailSettings = $bindable(),
    onCanvasReady = () => {},
    onVideoBeatChange = () => {},
    onPlaybackToggle = () => {},
  }: {
    blueProp?: PropState | null;
    redProp?: PropState | null;
    gridVisible?: boolean;
    gridMode?: GridMode | null | undefined;
    letter?: Letter | null;
    beatData?: StartPositionData | BeatData | null;
    sequenceData?: SequenceData | null;
    isPlaying?: boolean;
    speed?: number;
    trailSettings?: TrailSettings;
    onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
    onVideoBeatChange?: (beat: number) => void;
    onPlaybackToggle?: () => void;
  } = $props();

  // Video player state
  let playbackMode = $state<"live" | "video">("live");

  function handleVideoReady(result: VideoRenderResult) {
    console.log("🎬 Video ready:", result.sequenceId, `(${result.duration?.toFixed(1)}s)`);
  }

  function handleModeChange(mode: "live" | "video") {
    playbackMode = mode;
    console.log("🔄 Playback mode changed to:", mode);
  }
</script>

<div class="canvas-area">
  <!-- Live canvas (hidden when video mode is active) -->
  <div class="canvas-wrapper" class:hidden={playbackMode === "video"}>
    <AnimatorCanvas
      {blueProp}
      {redProp}
      {gridVisible}
      {gridMode}
      {letter}
      {beatData}
      {sequenceData}
      {isPlaying}
      {onCanvasReady}
      {onPlaybackToggle}
      bind:trailSettings
    />
  </div>

  <!-- Video player overlay -->
  <AnimationVideoPlayer
    {sequenceData}
    {isPlaying}
    {speed}
    autoGenerateVideo={false}
    onVideoReady={handleVideoReady}
    onModeChange={handleModeChange}
    onBeatChange={onVideoBeatChange}
  />
</div>

<style>
  .canvas-area {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 200px; /* Ensure canvas is always visible */
    min-width: 0;
    /* Canvas expands aggressively to fill available space */
    flex: 1 1 auto;
    container-type: size;
    container-name: canvas-zone;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    overflow: hidden;
  }

  .canvas-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .canvas-wrapper.hidden {
    display: none;
  }
</style>
