<!--
  GridControlsPanel.svelte

  Playback controls for grid mode with BPM control.
-->
<script lang="ts">
  import {
    BpmControl,
    ExportButton,
    LoopButton,
    PlayPauseButton,
    StopButton,
  } from "../../../shared/components";

  let {
    isPlaying = $bindable(false),
    shouldLoop = $bindable(false),
    bpm = $bindable(60),
    onBpmChange,
  }: {
    isPlaying: boolean;
    shouldLoop: boolean;
    bpm: number;
    onBpmChange?: (bpm: number) => void;
  } = $props();
</script>

<div class="controls-panel">
  <div class="controls-row">
    <!-- Playback Controls -->
    <div class="playback-group">
      <PlayPauseButton bind:isPlaying />
      <StopButton onclick={() => (isPlaying = false)} />
      <LoopButton bind:isLooping={shouldLoop} activeColor="orange" />
    </div>

    <!-- BPM Control -->
    <BpmControl bind:bpm {onBpmChange} />

    <!-- Export Button -->
    <ExportButton label="Export Grid" />
  </div>
</div>

<style>
  .controls-panel {
    padding: 1rem 1.25rem;
    background: rgba(0, 0, 0, 0.25);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .controls-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .playback-group {
    display: flex;
    gap: 0.5rem;
  }

  @media (max-width: 768px) {
    .controls-row {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
</style>
