<!--
  AnimationPreview.svelte

  Animation preview for video recording reference.
  Shows looping animation with configurable speed, trails, and prop visibility.
-->
<script lang="ts">
  import AnimatorCanvas from "$lib/shared/animation-engine/components/AnimatorCanvas.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { AnimationSettings } from "../state/video-record-settings.svelte";
  import {
    DEFAULT_TRAIL_SETTINGS,
    type TrailSettings,
  } from "$lib/features/compose/shared/domain/types/TrailTypes";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

  let {
    sequence = null,
    settings,
    onSettingsChange = () => {},
  }: {
    sequence?: SequenceData | null;
    settings: AnimationSettings;
    onSettingsChange?: (settings: AnimationSettings) => void;
  } = $props();

  // Animation state
  let isPlaying = $state(true); // Auto-play by default

  // Trail settings derived from animation settings
  let trailSettings = $state<TrailSettings>({
    ...DEFAULT_TRAIL_SETTINGS,
    enabled: settings.showTrails,
  });

  // Sync trail settings with animation settings
  $effect(() => {
    trailSettings.enabled = settings.showTrails;
  });

  // Stub handlers (AnimatorCanvas requires these but we don't need them)
  function handleCanvasReady() {}
  function handlePlaybackToggle() {
    isPlaying = !isPlaying;
  }

  // Settings change handlers
  function updateSpeed(delta: number) {
    const newSpeed = Math.max(0.25, Math.min(2.0, settings.speed + delta));
    onSettingsChange({
      ...settings,
      speed: newSpeed,
    });
  }

  function toggleTrails() {
    onSettingsChange({
      ...settings,
      showTrails: !settings.showTrails,
    });
  }

  function toggleBlueMotion() {
    onSettingsChange({
      ...settings,
      blueMotionVisible: !settings.blueMotionVisible,
    });
  }

  function toggleRedMotion() {
    onSettingsChange({
      ...settings,
      redMotionVisible: !settings.redMotionVisible,
    });
  }
</script>

<div class="animation-preview">
  {#if sequence}
    <!-- Animation Canvas -->
    <div class="canvas-container">
      <AnimatorCanvas
        blueProp={null}
        redProp={null}
        gridVisible={true}
        gridMode={GridMode.DIAMOND}
        letter={null}
        beatData={null}
        sequenceData={sequence}
        {isPlaying}
        onCanvasReady={handleCanvasReady}
        onPlaybackToggle={handlePlaybackToggle}
        bind:trailSettings
      />
    </div>

    <!-- Animation Controls -->
    <div class="animation-controls">
      <!-- Speed Control -->
      <div class="control-group">
        <label>Speed: {settings.speed.toFixed(2)}x</label>
        <div class="button-group">
          <button
            class="control-btn"
            onclick={() => updateSpeed(-0.25)}
            disabled={settings.speed <= 0.25}>−</button
          >
          <button
            class="control-btn"
            onclick={() => updateSpeed(0.25)}
            disabled={settings.speed >= 2.0}>+</button
          >
        </div>
      </div>

      <!-- Toggle Controls -->
      <div class="toggle-group">
        <button
          class="toggle-btn"
          class:active={settings.showTrails}
          onclick={toggleTrails}
        >
          Trails
        </button>
        <button
          class="toggle-btn"
          class:active={settings.blueMotionVisible}
          onclick={toggleBlueMotion}
        >
          <span class="color-indicator blue"></span>
          Blue
        </button>
        <button
          class="toggle-btn"
          class:active={settings.redMotionVisible}
          onclick={toggleRedMotion}
        >
          <span class="color-indicator red"></span>
          Red
        </button>
      </div>
    </div>
  {:else}
    <div class="no-sequence">
      <p>No sequence selected</p>
    </div>
  {/if}
</div>

<style>
  .animation-preview {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    overflow: hidden;
  }

  .canvas-container {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
  }

  .animation-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.4);
  }

  /* Control Group */
  .control-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .control-group label {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .button-group {
    display: flex;
    gap: 6px;
  }

  .control-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }

  .control-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Toggle Group */
  .toggle-group {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .toggle-btn {
    flex: 1;
    min-width: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.8);
  }

  .toggle-btn.active {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border-color: transparent;
  }

  .color-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .color-indicator.blue {
    background: #3b82f6;
  }

  .color-indicator.red {
    background: #ef4444;
  }

  /* No Sequence State */
  .no-sequence {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .no-sequence p {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .animation-controls {
      padding: 8px;
      gap: 6px;
    }

    .toggle-btn {
      font-size: 11px;
      padding: 6px 10px;
      min-width: 60px;
    }
  }
</style>
