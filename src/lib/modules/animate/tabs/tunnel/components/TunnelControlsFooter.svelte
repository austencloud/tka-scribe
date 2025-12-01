<!--
  TunnelControlsFooter.svelte

  Playback controls footer with play/pause, speed controls, and beat indicator.
-->
<script lang="ts">
  // Props
  let {
    isPlaying = $bindable(false),
    speed = $bindable(1.0),
    animatingBeatNumber,
    totalBeats,
  }: {
    isPlaying: boolean;
    speed: number;
    animatingBeatNumber: number | null;
    totalBeats: number;
  } = $props();

  function decreaseSpeed() {
    speed = Math.max(0.25, speed - 0.25);
  }

  function increaseSpeed() {
    speed = Math.min(3, speed + 0.25);
  }
</script>

<div class="controls-footer">
  <div class="playback-controls">
    <button
      class="control-btn play-btn"
      class:playing={isPlaying}
      onclick={() => isPlaying = !isPlaying}
      aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
    >
      <i class="fas fa-{isPlaying ? 'pause' : 'play'}"></i>
    </button>
    <div class="speed-control">
      <button
        class="speed-btn"
        disabled={speed <= 0.25}
        onclick={decreaseSpeed}
        aria-label="Decrease speed"
      >
        <i class="fas fa-minus"></i>
      </button>
      <span class="speed-display">{speed.toFixed(2)}x</span>
      <button
        class="speed-btn"
        disabled={speed >= 3}
        onclick={increaseSpeed}
        aria-label="Increase speed"
      >
        <i class="fas fa-plus"></i>
      </button>
    </div>
  </div>
  <div class="beat-indicator">
    <span class="beat-label">Beat</span>
    <span class="beat-number">{animatingBeatNumber ?? '-'}</span>
    <span class="beat-total">/ {totalBeats}</span>
  </div>
</div>

<style>
  .controls-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(6, 182, 212, 0.03) 100%);
    border-top: 1px solid rgba(20, 184, 166, 0.1);
    flex-shrink: 0;
  }

  .playback-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .play-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);
  }

  .play-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
  }

  .play-btn.playing {
    background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  }

  .speed-control {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .speed-btn {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .speed-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .speed-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .speed-display {
    min-width: 50px;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    font-family: 'SF Mono', 'Monaco', monospace;
  }

  .beat-indicator {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .beat-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .beat-number {
    font-size: 1.1rem;
    font-weight: 700;
    color: #14b8a6;
    font-family: 'SF Mono', 'Monaco', monospace;
  }

  .beat-total {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.4);
    font-family: 'SF Mono', 'Monaco', monospace;
  }

  @media (max-width: 600px) {
    .controls-footer {
      flex-direction: column;
      gap: 12px;
    }

    .playback-controls {
      width: 100%;
      justify-content: center;
    }
  }
</style>
