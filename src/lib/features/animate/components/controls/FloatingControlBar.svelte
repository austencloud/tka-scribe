<!--
  FloatingControlBar.svelte

  Tier 1: Always-visible floating control bar.
  Contains BPM control, Play/Pause button, and optional Export button.

  Uses glassmorphism styling for modern appearance.
-->
<script lang="ts">
  import TappableBpmControl from "./TappableBpmControl.svelte";
  import ExportButton from "./ExportButton.svelte";
  import PlayPauseButton from "./PlayPauseButton.svelte";

  let {
    bpm = $bindable(60),
    isPlaying = $bindable(false),
    showExport = true,
    onBpmChange,
    onPlayToggle,
    onExport,
  }: {
    bpm: number;
    isPlaying: boolean;
    showExport?: boolean;
    onBpmChange?: (bpm: number) => void;
    onPlayToggle?: (playing: boolean) => void;
    onExport?: () => void;
  } = $props();
</script>

<div class="floating-control-bar">
  <div class="bar-content">
    <!-- BPM Control -->
    <div class="control-section bpm-section">
      <TappableBpmControl bind:bpm {onBpmChange} />
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Play/Pause Button -->
    <div class="control-section play-section">
      <PlayPauseButton bind:isPlaying onToggle={onPlayToggle} />
    </div>

    <!-- Export Button (optional) -->
    {#if showExport}
      <div class="divider"></div>
      <div class="control-section export-section">
        <ExportButton
          label="Export"
          icon="fa-video"
          onclick={onExport}
          ariaLabel="Export video"
        />
      </div>
    {/if}
  </div>
</div>

<style>
  .floating-control-bar {
    background: rgba(20, 25, 35, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 12px 16px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .bar-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .control-section {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
  }

  .play-section {
    padding: 0 4px;
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .floating-control-bar {
      padding: 10px 12px;
      border-radius: 12px;
    }

    .bar-content {
      gap: 8px;
    }

    .divider {
      height: 32px;
    }
  }

  /* Very small screens - hide export and minimize padding */
  @media (max-width: 360px) {
    .export-section {
      display: none;
    }

    .floating-control-bar {
      padding: 6px 8px;
      border-radius: 10px;
    }

    .bar-content {
      gap: 6px;
    }

    .divider {
      height: 28px;
    }
  }

  /* Ultra-compact for xs screens */
  @media (max-width: 320px) {
    .floating-control-bar {
      padding: 4px 6px;
    }

    .bar-content {
      gap: 4px;
    }

    .divider {
      height: 24px;
    }
  }
</style>
