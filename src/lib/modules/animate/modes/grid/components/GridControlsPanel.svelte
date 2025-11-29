<!--
  GridControlsPanel.svelte

  Playback controls for grid mode with speed slider.
-->
<script lang="ts">
  let {
    isPlaying = $bindable(false),
    shouldLoop = $bindable(false),
    speed = $bindable(1.0),
  }: {
    isPlaying: boolean;
    shouldLoop: boolean;
    speed: number;
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
        onclick={() => isPlaying = false}
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

    <!-- Speed Control -->
    <div class="speed-group">
      <label for="grid-speed">
        <i class="fas fa-gauge"></i>
        Speed
      </label>
      <input
        id="grid-speed"
        type="range"
        min="0.25"
        max="2"
        step="0.25"
        bind:value={speed}
      />
      <span class="speed-value">{speed.toFixed(2)}x</span>
    </div>

    <!-- Export Button -->
    <button class="export-btn">
      <i class="fas fa-download"></i>
      <span>Export Grid</span>
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
    background: rgba(251, 146, 60, 0.25);
    border-color: rgba(251, 146, 60, 0.5);
    color: #fb923c;
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

  .speed-group {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    max-width: 300px;
  }

  .speed-group label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    opacity: 0.7;
    white-space: nowrap;
  }

  .speed-group input[type="range"] {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    outline: none;
  }

  .speed-group input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .speed-value {
    font-size: 0.9rem;
    font-weight: 600;
    min-width: 50px;
    text-align: right;
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

    .speed-group {
      flex: 1 1 100%;
      order: 3;
      margin-top: 0.5rem;
      max-width: none;
    }

    .export-btn span {
      display: none;
    }
  }
</style>
