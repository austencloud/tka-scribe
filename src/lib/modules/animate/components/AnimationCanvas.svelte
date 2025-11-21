<!--
  AnimationCanvas.svelte

  Wraps AnimatorCanvas with styling container.
  Handles canvas display and container styling.
-->
<script lang="ts">
  import AnimatorCanvas from "./AnimatorCanvas.svelte";
  import type { GridMode, Letter, BeatData, SequenceData } from "$shared";
  import type { PropState } from "../domain/types/PropState";
  import type { TrailSettings } from "../domain/types/TrailTypes";

  let {
    blueProp = null,
    redProp = null,
    gridVisible = true,
    gridMode = null,
    letter = null,
    beatData = null,
    sequenceData = null,
    trailSettings = $bindable(),
    onCanvasReady = (_canvas) => {},
  }: {
    blueProp?: PropState | null;
    redProp?: PropState | null;
    gridVisible?: boolean;
    gridMode?: GridMode | null | undefined;
    letter?: Letter | null;
    beatData?: BeatData | null;
    sequenceData?: SequenceData | null;
    trailSettings?: TrailSettings;
    onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
  } = $props();
</script>

<div class="canvas-area">
  <AnimatorCanvas
    {blueProp}
    {redProp}
    {gridVisible}
    {gridMode}
    {letter}
    {beatData}
    {sequenceData}
    {onCanvasReady}
    bind:trailSettings
  />
</div>

<style>
  .canvas-area {
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
</style>
