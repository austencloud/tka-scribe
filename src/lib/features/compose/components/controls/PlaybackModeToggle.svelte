<!--
  PlaybackModeToggle.svelte

  Labeled toggle between Continuous and Step playback modes.
  Used in settings sheets and panels.
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
    aria-pressed={playbackMode === "continuous"}
  >
    <i class="fas fa-play" aria-hidden="true"></i>
    <span>Continuous</span>
  </button>
  <button
    class="mode-btn"
    class:active={playbackMode === "step"}
    onclick={() => handleModeChange("step")}
    type="button"
    aria-pressed={playbackMode === "step"}
  >
    <i class="fas fa-shoe-prints" aria-hidden="true"></i>
    <span>Step-by-Step</span>
  </button>
</div>

<style>
  .mode-toggle {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 36px;
    padding: 6px 10px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .mode-btn i {
    font-size: 12px;
    flex-shrink: 0;
  }

  .mode-btn span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mode-btn.active {
    background: rgba(251, 191, 36, 0.15);
    border-color: rgba(251, 191, 36, 0.4);
    color: rgba(252, 211, 77, 1);
    box-shadow:
      0 0 12px rgba(251, 191, 36, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .mode-btn.active i {
    color: rgba(252, 211, 77, 0.9);
  }

  @media (hover: hover) and (pointer: fine) {
    .mode-btn:hover:not(.active) {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
      border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.18));
      color: var(--theme-text, rgba(255, 255, 255, 0.85));
    }
  }

  .mode-btn:active {
    transform: scale(0.98);
  }
</style>
