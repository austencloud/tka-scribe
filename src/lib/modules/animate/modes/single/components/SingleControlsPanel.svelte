<!--
  SingleControlsPanel.svelte

  Playback controls panel with play/pause, stop, loop, BPM controls, and export.
-->
<script lang="ts">
  import AnimationControls from "../../../components/AnimationControls.svelte";

  // Props
  let {
    isPlaying = $bindable(false),
    shouldLoop = $bindable(false),
    speed,
    onStop,
    onSpeedChange,
  }: {
    isPlaying: boolean;
    shouldLoop: boolean;
    speed: number;
    onStop: () => void;
    onSpeedChange: (speed: number) => void;
  } = $props();
</script>

<div class="controls-panel">
  <div class="controls-row">
    <!-- Playback Controls -->
    <div class="playback-group">
      <button
        class="control-btn play-btn"
        class:playing={isPlaying}
        aria-label={isPlaying ? "Pause" : "Play"}
        onclick={() => isPlaying = !isPlaying}
      >
        <i class="fas fa-{isPlaying ? 'pause' : 'play'}"></i>
      </button>

      <button
        class="control-btn"
        aria-label="Stop"
        onclick={onStop}
      >
        <i class="fas fa-stop"></i>
      </button>

      <button
        class="control-btn"
        class:active={shouldLoop}
        aria-label="Loop"
        onclick={() => shouldLoop = !shouldLoop}
      >
        <i class="fas fa-repeat"></i>
      </button>
    </div>

    <!-- BPM Controls -->
    <div class="bpm-group">
      <AnimationControls {speed} {onSpeedChange} />
    </div>

    <!-- Export Button -->
    <button class="export-btn">
      <i class="fas fa-download"></i>
      <span>Export</span>
    </button>
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

  .control-btn {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .control-btn.active {
    background: rgba(139, 92, 246, 0.25);
    border-color: rgba(139, 92, 246, 0.5);
    color: #a78bfa;
  }

  .control-btn.play-btn {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.4) 0%, rgba(22, 163, 74, 0.4) 100%);
    border-color: rgba(34, 197, 94, 0.5);
    font-size: 1.1rem;
  }

  .control-btn.play-btn:hover {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.5) 0%, rgba(22, 163, 74, 0.5) 100%);
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
  }

  .control-btn.play-btn.playing {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.4) 100%);
    border-color: rgba(251, 191, 36, 0.5);
  }

  .bpm-group {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .export-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .export-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  @media (max-width: 768px) {
    .controls-row {
      flex-wrap: wrap;
      justify-content: center;
    }

    .bpm-group {
      flex: 1 1 100%;
      order: 3;
      margin-top: 0.5rem;
    }

    .export-btn span {
      display: none;
    }
  }
</style>
