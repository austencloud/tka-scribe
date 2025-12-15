<!--
  PlaybackModeToggle.svelte

  Simple toggle between Continuous and Step playback modes.
  Just a toggle - no popover or sheet.
-->
<script lang="ts">
  import type { PlaybackMode } from "../../state/animation-panel-state.svelte";

  let {
    playbackMode = "continuous",
    isPlaying = false,
    onPlaybackModeChange = () => {},
    onPlaybackToggle = () => {},
  }: {
    playbackMode?: PlaybackMode;
    isPlaying?: boolean;
    onPlaybackModeChange?: (mode: PlaybackMode) => void;
    onPlaybackToggle?: () => void;
  } = $props();

  function handleModeChange(mode: PlaybackMode) {
    if (mode === playbackMode) return;

    const wasPlaying = isPlaying;
    if (wasPlaying) {
      onPlaybackToggle();
    }
    onPlaybackModeChange(mode);
    if (wasPlaying) {
      setTimeout(() => onPlaybackToggle(), 0);
    }
  }
</script>

<div class="mode-toggle">
  <button
    class="mode-btn"
    class:active={playbackMode === "continuous"}
    onclick={() => handleModeChange("continuous")}
    type="button"
    aria-label="Continuous playback"
  >
    <i class="fas fa-wave-square" aria-hidden="true"></i>
  </button>
  <button
    class="mode-btn"
    class:active={playbackMode === "step"}
    onclick={() => handleModeChange("step")}
    type="button"
    aria-label="Step playback"
  >
    <i class="fas fa-shoe-prints" aria-hidden="true"></i>
  </button>
</div>

<style>
  .mode-toggle {
    display: flex;
    gap: 4px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    padding: 4px;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .mode-btn.active {
    background: rgba(251, 191, 36, 0.15);
    color: rgba(252, 211, 77, 1);
    box-shadow: 0 0 12px rgba(251, 191, 36, 0.15);
  }

  @media (hover: hover) and (pointer: fine) {
    .mode-btn:hover:not(.active) {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.06));
      color: var(--theme-text, rgba(255, 255, 255, 0.8));
    }
  }

  .mode-btn:active {
    transform: scale(0.95);
  }

  /* Responsive */
  @media (max-width: 480px) {
    .mode-btn {
      width: 40px;
      height: 40px;
      font-size: 13px;
    }
  }
</style>
