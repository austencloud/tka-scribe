<!--
  MobileAnimationView.svelte

  Mobile-optimized layout for single animation mode.
  Displays: Header → Canvas → Controls → BeatGrid (4 rows minimum)
-->
<script lang="ts">
  import { BpmControl, PlayPauseButton } from "../../../components/v2";
  import { animationSettings } from "$lib/shared/animate/state/animation-settings-state.svelte";
  import BeatGrid from "$create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";
  import { SingleModeCanvas } from "../shared";
  import type { BeatData } from "$create/shared/domain/models/BeatData";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  type DeviceSize = "xs" | "sm" | "md" | "lg" | "xl";

  let {
    sequence,
    sequenceName = "",
    deviceSize,
    isShortScreen = false,
    isPlaying = $bindable(false),
    animatingBeatNumber = $bindable<number | null>(null),
    speed,
    beats,
    startPosition,
    currentBeatNumber,
    onChangeSequence,
    onPlayToggle,
    onStop,
    onOpenAdvancedSettings,
  }: {
    sequence: SequenceData;
    sequenceName?: string;
    deviceSize: DeviceSize;
    isShortScreen?: boolean;
    isPlaying: boolean;
    animatingBeatNumber: number | null;
    speed: number;
    beats: readonly BeatData[];
    startPosition: any;
    currentBeatNumber: number;
    onChangeSequence: () => void;
    onPlayToggle: (playing: boolean) => void;
    onStop: () => void;
    onOpenAdvancedSettings: () => void;
  } = $props();
</script>

<div
  class="mobile-layout"
  class:xs={deviceSize === "xs"}
  class:sm={deviceSize === "sm"}
  class:short={isShortScreen}
>
  <!-- Compact Header with sequence name -->
  <div class="mobile-header-compact">
    <span class="sequence-name">{sequenceName}</span>
    <button
      class="change-btn"
      onclick={onChangeSequence}
      aria-label="Change sequence"
    >
      <i class="fas fa-exchange-alt"></i>
    </button>
  </div>

  <!-- Animation Canvas - Balanced size -->
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
        Beat {Math.floor(animatingBeatNumber) + 1} / {beats.length}
      </div>
    {/if}
  </div>

  <!-- Consolidated Controls - Always visible, single compact row -->
  <div class="mobile-controls-unified">
    <div class="controls-row">
      <!-- BPM Control -->
      <div class="control-item">
        <BpmControl
          bpm={animationSettings.bpm}
          min={30}
          max={180}
          step={5}
          onBpmChange={(newBpm) => animationSettings.setBpm(newBpm)}
        />
      </div>

      <!-- Play/Pause -->
      <div class="control-item">
        <PlayPauseButton
          bind:isPlaying
          onToggle={(playing) => {
            onPlayToggle(playing);
            if (!playing) onStop();
          }}
        />
      </div>

      <!-- Visibility Toggles -->
      <div class="control-item visibility-mini">
        <button
          class="visibility-toggle"
          class:active={animationSettings.motionVisibility.blue}
          onclick={() => animationSettings.setBlueVisible(!animationSettings.motionVisibility.blue)}
          aria-label="Toggle blue motion"
        >
          <i class="fas fa-circle" style="color: #6366f1;"></i>
        </button>
        <button
          class="visibility-toggle"
          class:active={animationSettings.motionVisibility.red}
          onclick={() => animationSettings.setRedVisible(!animationSettings.motionVisibility.red)}
          aria-label="Toggle red motion"
        >
          <i class="fas fa-circle" style="color: #ef4444;"></i>
        </button>
      </div>

      <!-- Settings Button -->
      <button
        class="settings-btn-mini"
        onclick={onOpenAdvancedSettings}
        aria-label="Settings"
      >
        <i class="fas fa-sliders"></i>
      </button>
    </div>
  </div>

  <!-- Sequence/BeatGrid - Always visible, compact -->
  <div class="mobile-sequence-panel">
    <BeatGrid
      {beats}
      {startPosition}
      selectedBeatNumber={currentBeatNumber}
    />
  </div>
</div>

<style>
  /* ============================================
     MOBILE LAYOUT - BALANCED FOR iPhone SE
     Four sections: Header → Canvas → Controls → Sequence
     All always visible for clarity
     ============================================ */
  .mobile-layout {
    container-type: size;
    container-name: mobile-layout;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(15, 20, 30, 1) 0%, rgba(10, 15, 25, 1) 100%);
  }

  /* Compact Header */
  .mobile-header-compact {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
    min-height: 36px;
  }

  .sequence-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #a78bfa;
    white-space: nowrap;
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    margin-right: 8px;
  }

  .change-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.7rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.2s ease;
  }

  .change-btn:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.9);
  }

  /* Canvas Area - Constrained width to prevent 1:1 ratio from dominating */
  .mobile-canvas-area {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    max-height: 350px; /* Limit max height so BeatGrid gets priority */
    position: relative;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      rgba(15, 20, 30, 0.5) 0%,
      rgba(10, 15, 25, 0.5) 100%
    );
    padding: 8px; /* Add padding to center canvas */
  }

  /* Constrain the canvas itself to not take full width */
  .mobile-canvas-area :global(canvas) {
    max-width: min(90vw, 350px) !important;
    max-height: min(90vw, 350px) !important;
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

  /* Unified Controls Row - Always visible, single compact bar */
  .mobile-controls-unified {
    flex-shrink: 0;
    background: rgba(10, 15, 25, 0.9);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 6px 8px;
  }

  .controls-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    max-width: 100%;
  }

  .control-item {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Visibility Mini Toggles */
  .visibility-mini {
    display: flex;
    gap: 4px;
  }

  .visibility-toggle {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .visibility-toggle.active {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .visibility-toggle:active {
    transform: scale(0.9);
  }

  .visibility-toggle i {
    font-size: 0.7rem;
    opacity: 0.4;
  }

  .visibility-toggle.active i {
    opacity: 1;
  }

  /* Settings Button Mini */
  .settings-btn-mini {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .settings-btn-mini:active {
    transform: scale(0.9);
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
  }

  /* Sequence Panel - Always visible, sized for 4 rows minimum */
  .mobile-sequence-panel {
    flex-shrink: 0;
    /* Ensure at least 4 rows of beats are visible (roughly 30-35px per row) */
    height: clamp(130px, 22vh, 160px);
    background: rgba(0, 0, 0, 0.25);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding: 6px;
    padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
  }

  /* ============================================
     CONTAINER QUERIES - Responsive to container size
     ============================================ */

  /* Very small containers (< 360px width) */
  @container mobile-layout (max-width: 360px) {
    .mobile-header-compact {
      padding: 4px 6px;
      min-height: 32px;
    }

    .sequence-name {
      font-size: 0.75rem;
      max-width: 180px;
    }

    .change-btn {
      width: 24px;
      height: 24px;
      font-size: 0.65rem;
    }

    .mobile-canvas-area {
      max-height: 280px; /* Smaller max on very small screens */
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

    .visibility-toggle,
    .settings-btn-mini {
      width: 28px;
      height: 28px;
      font-size: 0.75rem;
    }

    .controls-row {
      gap: 4px;
    }

    .mobile-controls-unified {
      padding: 5px 6px;
    }

    .mobile-sequence-panel {
      /* Still maintain 4 rows even on very small screens */
      height: clamp(120px, 20vh, 145px);
      padding: 4px;
    }
  }

  /* Short containers (< 600px height) */
  @container mobile-layout (max-height: 600px) {
    .mobile-canvas-area {
      max-height: 280px; /* Constrain canvas on short screens */
    }

    .mobile-canvas-area :global(canvas) {
      max-width: min(85vw, 280px) !important;
      max-height: min(85vw, 280px) !important;
    }

    .mobile-sequence-panel {
      /* Prioritize 4 rows, reduce to 120px min on short screens */
      height: clamp(120px, 20vh, 150px);
    }

    .mobile-beat-indicator {
      bottom: 6px;
      padding: 3px 10px;
      font-size: 0.7rem;
    }

    .mobile-controls-unified {
      padding: 5px 6px;
    }

    .mobile-header-compact {
      /* Reduce header on short screens */
      padding: 4px 6px;
      min-height: 32px;
    }
  }

  /* Very short containers (< 500px height) */
  @container mobile-layout (max-height: 500px) {
    .mobile-header-compact {
      /* Further reduce header */
      padding: 3px 5px;
      min-height: 28px;
    }

    .sequence-name {
      font-size: 0.75rem;
    }

    .mobile-canvas-area {
      /* Aggressively limit canvas on very short screens */
      min-height: 100px;
      max-height: 220px;
      padding: 4px;
    }

    .mobile-canvas-area :global(canvas) {
      max-width: min(80vw, 220px) !important;
      max-height: min(80vw, 220px) !important;
    }

    .mobile-sequence-panel {
      /* Even on very short screens, keep at least 110px for 4 rows */
      height: clamp(110px, 18vh, 135px);
    }

    .mobile-controls-unified {
      padding: 4px 5px;
    }

    .mobile-beat-indicator {
      font-size: 0.65rem;
      padding: 2px 8px;
    }
  }

  /* ============================================
     LANDSCAPE ORIENTATION on Mobile
     ============================================ */
  @media (orientation: landscape) and (max-width: 768px) {
    .mobile-layout {
      flex-direction: row;
    }

    .mobile-header-compact {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(12px);
    }

    .mobile-canvas-area {
      flex: 2;
      padding-top: 40px; /* Space for header */
    }

    .mobile-controls-unified {
      flex-shrink: 0;
      width: auto;
      border-top: none;
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
    }

    .mobile-sequence-panel {
      flex: 1;
      height: auto;
      max-width: clamp(180px, 28vw, 280px);
      border-top: none;
      border-left: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 44px; /* Space for header */
    }
  }
</style>
