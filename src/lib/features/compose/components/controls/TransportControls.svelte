<!--
  TransportControls.svelte

  Transport control buttons for animation playback:
  - Full beat backward (<<)
  - Half beat backward (<)
  - Play/Pause (center)
  - Half beat forward (>)
  - Full beat forward (>>)
-->
<script lang="ts">
  let {
    isPlaying = false,
    onPlaybackToggle = () => {},
    onStepHalfBeatBackward = () => {},
    onStepHalfBeatForward = () => {},
    onStepFullBeatBackward = () => {},
    onStepFullBeatForward = () => {},
  }: {
    isPlaying?: boolean;
    onPlaybackToggle?: () => void;
    onStepHalfBeatBackward?: () => void;
    onStepHalfBeatForward?: () => void;
    onStepFullBeatBackward?: () => void;
    onStepFullBeatForward?: () => void;
  } = $props();
</script>

<div class="transport-controls">
  <!-- Full Beat Back -->
  <button
    class="step-btn step-full"
    onclick={onStepFullBeatBackward}
    type="button"
    aria-label="Previous full beat"
  >
    <i class="fas fa-angles-left" aria-hidden="true"></i>
  </button>

  <!-- Half Beat Back -->
  <button
    class="step-btn step-half"
    onclick={onStepHalfBeatBackward}
    type="button"
    aria-label="Previous half beat"
  >
    <i class="fas fa-chevron-left" aria-hidden="true"></i>
  </button>

  <!-- Play/Pause -->
  <button
    class="play-pause-btn large"
    class:playing={isPlaying}
    onclick={onPlaybackToggle}
    aria-label={isPlaying ? "Pause animation" : "Play animation"}
    type="button"
  >
    <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}"></i>
  </button>

  <!-- Half Beat Forward -->
  <button
    class="step-btn step-half"
    onclick={onStepHalfBeatForward}
    type="button"
    aria-label="Next half beat"
  >
    <i class="fas fa-chevron-right" aria-hidden="true"></i>
  </button>

  <!-- Full Beat Forward -->
  <button
    class="step-btn step-full"
    onclick={onStepFullBeatForward}
    type="button"
    aria-label="Next full beat"
  >
    <i class="fas fa-angles-right" aria-hidden="true"></i>
  </button>
</div>

<style>
  /* Transport controls - centered group */
  .transport-controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Step buttons */
  .step-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 50%;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  /* Full beat step buttons - slightly more prominent */
  .step-btn.step-full {
    width: 40px;
    height: 40px;
    font-size: 14px;
    color: var(--theme-text, rgba(255, 255, 255, 0.7));
  }

  @media (hover: hover) and (pointer: fine) {
    .step-btn:hover {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
      border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.25));
      color: var(--theme-text, rgba(255, 255, 255, 0.9));
      transform: scale(1.05);
    }
  }

  .step-btn:active {
    transform: scale(0.95);
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.15));
  }

  /* Play/Pause Button */
  .play-pause-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
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

  /* Larger play button in expanded mode */
  .play-pause-btn.large {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    font-size: 18px;
  }

  /* ===========================
     RESPONSIVE
     =========================== */

  @media (max-width: 480px) {
    .transport-controls {
      gap: 4px;
    }

    .step-btn {
      width: 32px;
      height: 32px;
      font-size: 11px;
    }

    .step-btn.step-full {
      width: 36px;
      height: 36px;
      font-size: 12px;
    }

    .play-pause-btn {
      width: var(--min-touch-target);
      height: var(--min-touch-target);
      font-size: 15px;
    }
  }

  /* Extra small devices (iPhone SE) - ultra compact */
  @media (max-width: 375px) and (max-height: 670px) {
    .transport-controls {
      gap: 3px;
    }

    .step-btn {
      width: 30px;
      height: 30px;
      font-size: 10px;
    }

    .step-btn.step-full {
      width: 34px;
      height: 34px;
      font-size: 11px;
    }

    .play-pause-btn {
      width: 44px;
      height: 44px;
      font-size: 14px;
    }

    .play-pause-btn.large {
      width: 44px;
      height: 44px;
      font-size: 15px;
    }
  }
</style>
