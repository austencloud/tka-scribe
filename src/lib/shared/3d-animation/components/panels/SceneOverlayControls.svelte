<script lang="ts">
  /**
   * SceneOverlayControls - Overlay controls for 3D scene
   *
   * Positioned absolutely over the scene canvas.
   * Top row: camera presets, sequence info, speed control
   * Bottom: playback controls
   */

  import type { Snippet } from "svelte";
  import CameraPresetBar, { type CameraPreset } from "../controls/CameraPresetBar.svelte";
  import SpeedControlBar from "../controls/SpeedControlBar.svelte";
  import PlaybackControlBar from "../controls/PlaybackControlBar.svelte";
  import SequenceInfoBadge from "../controls/SequenceInfoBadge.svelte";

  interface Props {
    // Camera
    cameraPreset: CameraPreset;
    isCustomCamera?: boolean;
    onCameraChange: (preset: CameraPreset) => void;

    // Speed
    speed: number;
    onSpeedChange: (speed: number) => void;

    // Sequence info (optional)
    sequenceName?: string | null;
    onClearSequence?: () => void;

    // Playback
    isPlaying: boolean;
    progress: number;
    loop: boolean;
    hasSequence?: boolean;
    currentBeatIndex?: number;
    totalBeats?: number;
    onPlay: () => void;
    onPause: () => void;
    onTogglePlay: () => void;
    onReset: () => void;
    onProgressChange: (value: number) => void;
    onLoopChange: (value: boolean) => void;
    onPrevBeat?: () => void;
    onNextBeat?: () => void;

    /** Callback to show keyboard shortcuts help */
    onShowHelp?: () => void;

    /** Optional trailing content (e.g., panel toggle) */
    trailing?: Snippet;
  }

  let {
    cameraPreset,
    isCustomCamera = false,
    onCameraChange,
    speed,
    onSpeedChange,
    sequenceName = null,
    onClearSequence,
    isPlaying,
    progress,
    loop,
    hasSequence = false,
    currentBeatIndex = 0,
    totalBeats = 0,
    onPlay,
    onPause,
    onTogglePlay,
    onReset,
    onProgressChange,
    onLoopChange,
    onPrevBeat,
    onNextBeat,
    onShowHelp,
    trailing,
  }: Props = $props();
</script>

<div class="scene-overlay">
  <!-- Top Row -->
  <div class="top-row">
    <CameraPresetBar
      value={cameraPreset}
      isCustom={isCustomCamera}
      onchange={onCameraChange}
    />

    {#if sequenceName}
      <SequenceInfoBadge
        name={sequenceName}
        onClear={() => onClearSequence?.()}
      />
    {/if}

    <SpeedControlBar value={speed} onchange={onSpeedChange} />

    {#if onShowHelp}
      <button
        class="help-btn"
        onclick={onShowHelp}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (Shift+?)"
      >
        <i class="fas fa-keyboard" aria-hidden="true"></i>
      </button>
    {/if}
  </div>

  <!-- Bottom Row -->
  <div class="bottom-row">
    <PlaybackControlBar
      {isPlaying}
      {progress}
      {loop}
      {hasSequence}
      {currentBeatIndex}
      {totalBeats}
      {onPlay}
      {onPause}
      {onTogglePlay}
      {onReset}
      {onProgressChange}
      {onLoopChange}
      {onPrevBeat}
      {onNextBeat}
    />

    {#if trailing}
      {@render trailing()}
    {/if}
  </div>
</div>

<style>
  .scene-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1rem;
  }

  .scene-overlay > * {
    pointer-events: auto;
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .bottom-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .help-btn {
    width: 48px; /* WCAG AAA touch target */
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-bg, var(--theme-card-bg));
    border: none;
    border-radius: 8px;
    color: var(--theme-text-muted, var(--theme-text-dim));
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .help-btn:hover {
    background: var(--theme-card-hover-bg);
    color: var(--theme-text, var(--theme-text));
  }

  @media (max-width: 600px) {
    .scene-overlay {
      padding: 0.5rem;
    }

    .top-row {
      gap: 0.25rem;
    }

    /* Touch targets remain 48px on mobile for WCAG AAA */
  }
</style>
