<!--
  AnimationSettingsContent.svelte

  Content for the animation settings sheet/drawer.
  Consolidates playback configuration options:
  - Playback mode (continuous/step)
  - Motion visibility toggles
  - Speed (BPM) controls
  - Trail presets

  Note: Export settings (loop count) are in ExportActionsPanel
-->
<script lang="ts">
  import BpmChips from "./BpmChips.svelte";
  import SimpleTrailControls from "../trail/SimpleTrailControls.svelte";
  import PlaybackModeToggle from "./PlaybackModeToggle.svelte";
  import StepModeSettings from "./StepModeSettings.svelte";
  import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
  import type {
    PlaybackMode,
    StepPlaybackStepSize,
  } from "../../state/animation-panel-state.svelte";

  let {
    bpm = $bindable(60),
    blueMotionVisible = true,
    redMotionVisible = true,
    currentPropType = null,
    playbackMode = "continuous",
    stepPlaybackPauseMs = 250,
    stepPlaybackStepSize = 1,
    isPlaying = false,
    onBpmChange = () => {},
    onToggleBlue = () => {},
    onToggleRed = () => {},
    onPlaybackModeChange = () => {},
    onStepPlaybackPauseMsChange = () => {},
    onStepPlaybackStepSizeChange = () => {},
    onPlaybackToggle = () => {},
  }: {
    bpm: number;
    blueMotionVisible?: boolean;
    redMotionVisible?: boolean;
    currentPropType?: PropType | string | null;
    playbackMode?: PlaybackMode;
    stepPlaybackPauseMs?: number;
    stepPlaybackStepSize?: StepPlaybackStepSize;
    isPlaying?: boolean;
    onBpmChange?: (bpm: number) => void;
    onToggleBlue?: () => void;
    onToggleRed?: () => void;
    onPlaybackModeChange?: (mode: PlaybackMode) => void;
    onStepPlaybackPauseMsChange?: (pauseMs: number) => void;
    onStepPlaybackStepSizeChange?: (stepSize: StepPlaybackStepSize) => void;
    onPlaybackToggle?: () => void;
  } = $props();
</script>

<div class="settings-content">
  <!-- Playback Mode -->
  <section class="settings-section">
    <h4 class="settings-section-title">Playback Mode</h4>
    <div class="playback-mode-row">
      <PlaybackModeToggle
        {playbackMode}
        {isPlaying}
        onPlaybackModeChange={onPlaybackModeChange}
        onPlaybackToggle={onPlaybackToggle}
      />
    </div>
    {#if playbackMode === "step"}
      <div class="step-settings-wrapper">
        <StepModeSettings
          {stepPlaybackStepSize}
          {stepPlaybackPauseMs}
          {isPlaying}
          onStepPlaybackStepSizeChange={onStepPlaybackStepSizeChange}
          onStepPlaybackPauseMsChange={onStepPlaybackPauseMsChange}
        />
      </div>
    {/if}
  </section>

  <!-- Motion Visibility -->
  <section class="settings-section">
    <h4 class="settings-section-title">Motion Visibility</h4>
    <div class="visibility-toggles">
      <button
        class="visibility-toggle blue"
        class:active={blueMotionVisible}
        onclick={onToggleBlue}
        type="button"
      >
        <i
          class="fas {blueMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"
          aria-hidden="true"
        ></i>
        <span>Blue</span>
      </button>
      <button
        class="visibility-toggle red"
        class:active={redMotionVisible}
        onclick={onToggleRed}
        type="button"
      >
        <i
          class="fas {redMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"
          aria-hidden="true"
        ></i>
        <span>Red</span>
      </button>
    </div>
  </section>

  <!-- Speed -->
  <section class="settings-section">
    <h4 class="settings-section-title">Speed</h4>
    <BpmChips bind:bpm min={15} max={180} step={1} {onBpmChange} />
  </section>

  <!-- Trails -->
  <section class="settings-section">
    <h4 class="settings-section-title">Trails</h4>
    <SimpleTrailControls propType={currentPropType} />
  </section>
</div>

<style>
  .settings-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Settings sections */
  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .settings-section-title {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  /* Visibility toggles */
  .visibility-toggles {
    display: flex;
    gap: 8px;
  }

  .visibility-toggle {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: var(--min-touch-target);
    padding: 10px 14px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .visibility-toggle.blue.active {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.2) 0%,
      rgba(37, 99, 235, 0.15) 100%
    );
    border-color: rgba(59, 130, 246, 0.4);
    color: rgba(191, 219, 254, 1);
  }

  .visibility-toggle.red.active {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.2) 0%,
      rgba(220, 38, 38, 0.15) 100%
    );
    border-color: rgba(239, 68, 68, 0.4);
    color: rgba(254, 202, 202, 1);
  }

  .visibility-toggle:active {
    transform: scale(0.97);
  }

  /* Playback mode */
  .playback-mode-row {
    display: flex;
    justify-content: center;
  }

  .step-settings-wrapper {
    margin-top: 12px;
  }
</style>
