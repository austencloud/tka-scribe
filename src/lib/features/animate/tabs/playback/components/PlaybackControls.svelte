<!--
  PlaybackControls.svelte

  Bottom control bar with play/pause, stop, speed, and loop controls.
-->
<script lang="ts">
  let {
    isPlaying,
    speed,
    shouldLoop,
    onPlay,
    onPause,
    onStop,
    onSpeedChange,
    onLoopToggle,
  }: {
    isPlaying: boolean;
    speed: number;
    shouldLoop: boolean;
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
    onSpeedChange: (speed: number) => void;
    onLoopToggle: (loop: boolean) => void;
  } = $props();

  // Speed presets
  const speedPresets = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0];

  function handlePlayPause() {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  }

  function handleSpeedClick(preset: number) {
    onSpeedChange(preset);
  }

  function handleLoopClick() {
    onLoopToggle(!shouldLoop);
  }
</script>

<div class="playback-controls">
  <!-- Left: Transport controls -->
  <div class="controls-left">
    <button
      class="control-btn play-pause-btn"
      onclick={handlePlayPause}
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      <i class="fas fa-{isPlaying ? 'pause' : 'play'}"></i>
    </button>

    <button class="control-btn stop-btn" onclick={onStop} aria-label="Stop">
      <i class="fas fa-stop"></i>
    </button>
  </div>

  <!-- Center: Speed controls -->
  <div class="controls-center">
    <span class="speed-label">Speed</span>
    <div class="speed-presets">
      {#each speedPresets as preset}
        <button
          class="speed-btn"
          class:active={Math.abs(speed - preset) < 0.01}
          onclick={() => handleSpeedClick(preset)}
          aria-label="Speed {preset}x"
        >
          {preset}x
        </button>
      {/each}
    </div>
  </div>

  <!-- Right: Loop toggle -->
  <div class="controls-right">
    <button
      class="control-btn loop-btn"
      class:active={shouldLoop}
      onclick={handleLoopClick}
      aria-label={shouldLoop ? "Disable loop" : "Enable loop"}
    >
      <i class="fas fa-repeat"></i>
      <span class="loop-label">Loop</span>
    </button>
  </div>
</div>

<style>
  .playback-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1rem 1.25rem;
    background: rgba(0, 0, 0, 0.4);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    position: sticky;
    bottom: 0;
    z-index: 20;
  }

  .controls-left,
  .controls-center,
  .controls-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .controls-center {
    flex: 1;
    justify-content: center;
    flex-wrap: wrap;
  }

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-width: 52px;
    height: 52px;
    padding: 0 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.95);
  }

  .control-btn:active {
    transform: scale(0.95);
  }

  .play-pause-btn {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.3);
    color: rgba(167, 139, 250, 1);
    font-size: 1.1rem;
  }

  .play-pause-btn:hover {
    background: rgba(139, 92, 246, 0.3);
    border-color: rgba(139, 92, 246, 0.5);
    color: rgba(196, 181, 253, 1);
  }

  .loop-btn.active {
    background: rgba(6, 182, 212, 0.2);
    border-color: rgba(6, 182, 212, 0.4);
    color: rgba(34, 211, 238, 1);
  }

  .speed-label {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.5);
    margin-right: 0.5rem;
  }

  .speed-presets {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .speed-btn {
    min-width: 52px;
    height: 36px;
    padding: 0 0.75rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .speed-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
  }

  .speed-btn.active {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
    color: rgba(167, 139, 250, 1);
    font-weight: 600;
  }

  .speed-btn:active {
    transform: scale(0.95);
  }

  .loop-label {
    font-size: 0.85rem;
    font-weight: 500;
  }

  /* Mobile - compact layout */
  @media (max-width: 768px) {
    .playback-controls {
      padding: 0.75rem 1rem;
      gap: 1rem;
    }

    .speed-label {
      display: none;
    }

    .speed-presets {
      gap: 0.4rem;
    }

    .speed-btn {
      min-width: 44px;
      height: 32px;
      font-size: 0.75rem;
    }

    .loop-label {
      display: none;
    }

    .control-btn {
      min-width: 44px;
      height: 44px;
      padding: 0 0.75rem;
    }
  }

  /* Extra small mobile - minimal layout */
  @media (max-width: 480px) {
    .playback-controls {
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .controls-center {
      order: 3;
      width: 100%;
      justify-content: flex-start;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .speed-btn {
      min-width: 40px;
      height: 30px;
      font-size: 0.7rem;
    }
  }

  /* Safe area for mobile */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .playback-controls {
      padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
    }
  }
</style>
