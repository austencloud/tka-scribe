<!--
  AnimationControls.svelte

  2026 Bento Box Design - Reusable animation controls
  - Play/pause button
  - BPM preset chips
-->
<script lang="ts">
  import BpmControl from "$lib/features/animate/components/controls/BpmControl.svelte";

  // Constants - BPM conversion
  const DEFAULT_BPM = 60; // Base tempo
  const MIN_BPM = 15; // Minimum speed
  const MAX_BPM = 180; // Maximum speed
  const BPM_INCREMENT = 1; // Increment/decrement by 1 BPM per button click

  // Props
  let {
    speed = 1,
    isPlaying = false,
    onSpeedChange = () => {},
    onPlaybackStart = () => {},
    onPlaybackToggle = () => {},
  }: {
    speed?: number;
    isPlaying?: boolean;
    onSpeedChange?: (newSpeed: number) => void;
    onPlaybackStart?: () => void;
    onPlaybackToggle?: () => void;
  } = $props();

  // State: Convert speed multiplier to BPM (writable for binding)
  let bpm = $state(Math.round(speed * DEFAULT_BPM));

  // Sync bpm with speed prop changes
  $effect(() => {
    bpm = Math.round(speed * DEFAULT_BPM);
  });

  // BPM change handler - converts BPM back to speed multiplier
  function handleBpmChange(newBpm: number) {
    const newSpeed = newBpm / DEFAULT_BPM;
    onSpeedChange(newSpeed);
  }
</script>

<div class="animation-controls-container">
  <!-- Playback Row -->
  <div class="playback-row">
    <button
      class="play-pause-btn"
      class:playing={isPlaying}
      onclick={() => {
        console.log("▶️ Play/Pause button clicked");
        console.log("  isPlaying:", isPlaying);
        console.log("  onPlaybackToggle:", onPlaybackToggle);
        onPlaybackToggle();
      }}
      aria-label={isPlaying ? "Pause animation" : "Play animation"}
      type="button"
    >
      <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}"></i>
    </button>
  </div>

  <!-- BPM Control Row -->
  <div class="speed-control">
    <BpmControl
      bind:bpm
      min={MIN_BPM}
      max={MAX_BPM}
      step={BPM_INCREMENT}
      onBpmChange={handleBpmChange}
    />
  </div>
</div>

<style>
  /* ===========================
     2026 BENTO BOX DESIGN
     Animation Controls Container
     =========================== */

  .animation-controls-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .playback-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  /* ===========================
     PLAY/PAUSE BUTTON
     =========================== */

  .play-pause-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.25) 0%,
      rgba(22, 163, 74, 0.2) 100%
    );
    border: 1.5px solid rgba(34, 197, 94, 0.4);
    border-radius: 50%;
    color: rgba(134, 239, 172, 1);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 8px rgba(34, 197, 94, 0.15),
      0 0 16px rgba(34, 197, 94, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    -webkit-tap-highlight-color: transparent;
    font-size: 16px;
  }

  .play-pause-btn.playing {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.25) 0%,
      rgba(220, 38, 38, 0.2) 100%
    );
    border-color: rgba(239, 68, 68, 0.4);
    color: rgba(254, 202, 202, 1);
    box-shadow:
      0 2px 8px rgba(239, 68, 68, 0.15),
      0 0 16px rgba(239, 68, 68, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  @media (hover: hover) and (pointer: fine) {
    .play-pause-btn:hover {
      transform: scale(1.05);
      background: linear-gradient(
        135deg,
        rgba(34, 197, 94, 0.35) 0%,
        rgba(22, 163, 74, 0.3) 100%
      );
      border-color: rgba(34, 197, 94, 0.6);
      box-shadow:
        0 4px 14px rgba(34, 197, 94, 0.25),
        0 0 20px rgba(34, 197, 94, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }

    .play-pause-btn.playing:hover {
      background: linear-gradient(
        135deg,
        rgba(239, 68, 68, 0.35) 0%,
        rgba(220, 38, 38, 0.3) 100%
      );
      border-color: rgba(239, 68, 68, 0.6);
      box-shadow:
        0 4px 14px rgba(239, 68, 68, 0.25),
        0 0 20px rgba(239, 68, 68, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
  }

  .play-pause-btn:active {
    transform: scale(0.96);
  }

  /* ===========================
     SPEED CONTROL
     =========================== */

  .speed-control {
    flex: 1;
    display: flex;
    min-width: 0;
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  @media (prefers-reduced-motion: reduce) {
    .play-pause-btn {
      transition: none;
      animation: none;
    }

    .play-pause-btn:hover,
    .play-pause-btn:active {
      transform: none;
    }
  }
</style>
