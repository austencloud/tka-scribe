<!--
  SingleAnimationViewMobile.svelte

  Mobile-optimized animation view with:
  - Minimal header
  - BeatGrid showing current beat highlighted
  - Maximized pictograph canvas
  - Single row of 48px touch controls
-->
<script lang="ts">
  import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";
  import type { BeatData } from "$create/shared/domain/models/BeatData";
  import type { StartPositionData } from "$create/shared/domain/models/StartPositionData";
  import SingleModeCanvas from "./SingleModeCanvas.svelte";
  import BeatGrid from "$create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";

  let {
    sequence,
    sequenceName,
    isPlaying = $bindable(false),
    shouldLoop = $bindable(true),
    speed,
    onChangeSequence,
    onSpeedChange,
  }: {
    sequence: SequenceData;
    sequenceName: string;
    isPlaying: boolean;
    shouldLoop: boolean;
    speed: number;
    onChangeSequence: () => void;
    onSpeedChange: (speed: number) => void;
  } = $props();

  let animatingBeatNumber = $state<number | null>(null);

  // Computed BPM for display
  const bpm = $derived(Math.round(speed * 60));

  // Get beats array for BeatGrid
  const beats = $derived(sequence.beats || []);

  // Get start position for BeatGrid
  const startPosition = $derived<StartPositionData | BeatData | null>(
    sequence.startPosition || sequence.startingPositionBeat || null
  );

  // Current beat number for highlighting (0=start, 1=first beat, etc.)
  // animatingBeatNumber is 0-indexed for beats array, so add 1 to get beatNumber
  const currentBeatNumber = $derived(
    animatingBeatNumber !== null ? Math.floor(animatingBeatNumber) + 1 : 0
  );

  function togglePlay() {
    isPlaying = !isPlaying;
  }

  function adjustSpeed(delta: number) {
    const newSpeed = Math.max(0.25, Math.min(3, speed + delta));
    onSpeedChange(newSpeed);
  }
</script>

<div class="mobile-animation-view">
  <!-- Minimal Header -->
  <header class="header">
    <span class="sequence-name">{sequenceName}</span>
    <button class="change-btn" onclick={onChangeSequence} aria-label="Change sequence">
      <i class="fas fa-exchange-alt"></i>
    </button>
  </header>

  <!-- Beat Grid -->
  <div class="beat-grid-wrapper">
    <BeatGrid
      {beats}
      {startPosition}
      selectedBeatNumber={currentBeatNumber}
    />
  </div>

  <!-- Maximized Canvas -->
  <div class="canvas-area">
    <SingleModeCanvas
      {sequence}
      bind:isPlaying
      bind:animatingBeatNumber
      {speed}
    />
  </div>

  <!-- Single Row Controls - All 48px -->
  <div class="controls">
    <button
      class="control-btn play-btn"
      class:playing={isPlaying}
      onclick={togglePlay}
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      <i class="fas fa-{isPlaying ? 'pause' : 'play'}"></i>
    </button>

    <button
      class="control-btn speed-btn"
      onclick={() => adjustSpeed(-0.25)}
      aria-label="Decrease speed"
    >
      <i class="fas fa-minus"></i>
    </button>

    <div class="speed-display">
      <span class="speed-value">{bpm}</span>
      <span class="speed-label">BPM</span>
    </div>

    <button
      class="control-btn speed-btn"
      onclick={() => adjustSpeed(0.25)}
      aria-label="Increase speed"
    >
      <i class="fas fa-plus"></i>
    </button>

    <button
      class="control-btn loop-btn"
      class:active={shouldLoop}
      onclick={() => (shouldLoop = !shouldLoop)}
      aria-label={shouldLoop ? "Disable loop" : "Enable loop"}
    >
      <i class="fas fa-repeat"></i>
    </button>
  </div>
</div>

<style>
  .mobile-animation-view {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(15, 20, 30, 1) 0%, rgba(10, 15, 25, 1) 100%);
  }

  /* Minimal Header */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .sequence-name {
    font-size: 1rem;
    font-weight: 600;
    color: #a78bfa;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .change-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
  }

  /* Beat Grid Wrapper */
  .beat-grid-wrapper {
    flex-shrink: 0;
    height: 120px;
    min-height: 120px;
    background: rgba(0, 0, 0, 0.25);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 4px;
  }

  /* Maximized Canvas */
  .canvas-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    padding: 4px;
  }

  /* Single Row Controls - All 48px */
  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 12px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom, 0));
    background: rgba(0, 0, 0, 0.4);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .control-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.15s ease;
  }

  .control-btn:active {
    transform: scale(0.92);
  }

  .play-btn {
    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
    color: white;
    font-size: 1.1rem;
  }

  .play-btn.playing {
    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  }

  .speed-btn {
    background: rgba(59, 130, 246, 0.8);
    color: white;
    font-size: 0.85rem;
  }

  .speed-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0 8px;
  }

  .speed-value {
    font-size: 1rem;
    font-weight: 700;
    color: white;
    line-height: 1;
  }

  .speed-label {
    font-size: 0.55rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .loop-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.4);
    font-size: 1rem;
  }

  .loop-btn.active {
    background: rgba(139, 92, 246, 0.25);
    border-color: rgba(139, 92, 246, 0.5);
    color: #a78bfa;
  }
</style>
