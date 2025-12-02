<!--
  MobileCanvasArea.svelte
  
  Canvas area for mobile animation view.
  Contains the animation canvas and beat indicator overlay.
-->
<script lang="ts">
  import SingleModeCanvas from "../../shared/SingleModeCanvas.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  let {
    sequence,
    isPlaying = $bindable(false),
    animatingBeatNumber = $bindable<number | null>(null),
    speed,
    totalBeats,
  }: {
    sequence: SequenceData;
    isPlaying: boolean;
    animatingBeatNumber: number | null;
    speed: number;
    totalBeats: number;
  } = $props();
</script>

<div class="mobile-canvas-area">
  <SingleModeCanvas
    {sequence}
    bind:isPlaying
    bind:animatingBeatNumber
    {speed}
  />

  <!-- Beat indicator during playback -->
  {#if animatingBeatNumber !== null && isPlaying}
    <div class="mobile-beat-indicator">
      Beat {Math.floor(animatingBeatNumber) + 1} / {totalBeats}
    </div>
  {/if}
</div>

<style>
  .mobile-canvas-area {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    max-height: 50cqh;
    position: relative;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      rgba(15, 20, 30, 0.5) 0%,
      rgba(10, 15, 25, 0.5) 100%
    );
    padding: 8px;
  }

  /* Constrain the canvas itself to not take full width */
  .mobile-canvas-area :global(canvas) {
    max-width: min(90vw, 250px) !important;
    max-height: min(90vw, 250px) !important;
    width: auto !important;
    height: auto !important;
  }

  /* Beat Indicator - Overlay on canvas during playback */
  .mobile-beat-indicator {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 12px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    z-index: 5;
  }

  /* Container query responsive styles */
  @container mobile-layout (max-width: 360px) {
    .mobile-canvas-area {
      max-height: 280px;
      padding: 6px;
    }

    .mobile-canvas-area :global(canvas) {
      max-width: min(85vw, 280px) !important;
      max-height: min(85vw, 280px) !important;
    }

    .mobile-beat-indicator {
      font-size: 0.7rem;
      padding: 3px 10px;
      border-radius: 12px;
    }
  }

  @container mobile-layout (max-height: 600px) {
    .mobile-canvas-area {
      max-height: 280px;
    }

    .mobile-canvas-area :global(canvas) {
      max-width: min(85vw, 280px) !important;
      max-height: min(85vw, 280px) !important;
    }

    .mobile-beat-indicator {
      bottom: 6px;
      padding: 3px 10px;
      font-size: 0.7rem;
    }
  }

  @container mobile-layout (max-height: 500px) {
    .mobile-canvas-area {
      min-height: 100px;
      max-height: 220px;
      padding: 4px;
    }

    .mobile-canvas-area :global(canvas) {
      max-width: min(80vw, 220px) !important;
      max-height: min(80vw, 220px) !important;
    }

    .mobile-beat-indicator {
      font-size: 0.65rem;
      padding: 2px 8px;
    }
  }

  /* Landscape orientation */
  @media (orientation: landscape) and (max-width: 768px) {
    .mobile-canvas-area {
      flex: 2;
      padding-top: 40px;
    }
  }
</style>
