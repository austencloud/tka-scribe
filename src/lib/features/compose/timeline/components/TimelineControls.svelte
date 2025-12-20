<script lang="ts">
  /**
   * TimelineControls - Transport and zoom controls
   *
   * Play/pause, stop, shuttle controls (J/K/L style)
   * Zoom in/out, fit to view
   * Time display
   * Snap settings
   * Add media button
   */

  import { getTimelineState } from "../state/timeline-state.svelte";
  import { getTimelinePlaybackService } from "../services/implementations/TimelinePlaybackService";
  import SnapControls from "./SnapControls.svelte";

  interface Props {
    onOpenMediaBrowser?: () => void;
  }

  let { onOpenMediaBrowser }: Props = $props();

  // Lazy access to state and playback service to avoid initialization timing issues
  function getState() {
    return getTimelineState();
  }

  function getPlayback() {
    return getTimelinePlaybackService();
  }

  // Local reactive state for display values (updated via effects)
  let currentTimeDisplay = $state("00:00.00");
  let totalTimeDisplay = $state("00:00.00");
  let shuttleDisplay = $state<string | null>(null);
  let zoomPercent = $state(100);

  // Playhead state for template bindings
  let isPlaying = $state(false);
  let playheadDirection = $state<1 | -1>(1);
  let shuttleSpeed = $state(1);

  // Format current time as MM:SS.ms
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toFixed(2).padStart(5, "0")}`;
  }

  // Sync local state from timeline state using effects
  $effect(() => {
    const state = getState();
    currentTimeDisplay = formatTime(state.playhead.position);
  });

  $effect(() => {
    const state = getState();
    totalTimeDisplay = formatTime(state.totalDuration);
  });

  $effect(() => {
    const state = getState();
    isPlaying = state.playhead.isPlaying;
    playheadDirection = state.playhead.direction;
    shuttleSpeed = state.playhead.shuttleSpeed;

    if (!state.playhead.isPlaying) {
      shuttleDisplay = null;
    } else {
      const dir = state.playhead.direction === -1 ? "◀" : "▶";
      const speed = state.playhead.shuttleSpeed;
      shuttleDisplay = speed === 1 ? dir : `${dir}${speed}x`;
    }
  });

  $effect(() => {
    const state = getState();
    zoomPercent = Math.round((state.viewport.pixelsPerSecond / 50) * 100);
  });
</script>

<div class="timeline-controls">
  <!-- Transport Section -->
  <div class="transport-section">
    <!-- Go to start -->
    <button
      class="control-btn"
      onclick={() => getPlayback().goToStart()}
      title="Go to start (Home)"
      aria-label="Go to start"
    >
      <i class="fa-solid fa-backward-step"></i>
    </button>

    <!-- Shuttle reverse (J) -->
    <button
      class="control-btn"
      class:active={isPlaying && playheadDirection === -1}
      onclick={() => getPlayback().shuttleReverse()}
      title="Shuttle reverse (J)"
      aria-label="Shuttle reverse"
    >
      <i class="fa-solid fa-backward"></i>
    </button>

    <!-- Play/Pause (K/Space) -->
    <button
      class="control-btn play-btn"
      class:playing={isPlaying}
      onclick={() => getPlayback().togglePlayPause()}
      title={isPlaying ? "Pause (K/Space)" : "Play (K/Space)"}
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {#if isPlaying}
        <i class="fa-solid fa-pause"></i>
      {:else}
        <i class="fa-solid fa-play"></i>
      {/if}
    </button>

    <!-- Shuttle forward (L) -->
    <button
      class="control-btn"
      class:active={isPlaying && playheadDirection === 1 && shuttleSpeed > 1}
      onclick={() => getPlayback().shuttleForward()}
      title="Shuttle forward (L)"
      aria-label="Shuttle forward"
    >
      <i class="fa-solid fa-forward"></i>
    </button>

    <!-- Stop -->
    <button
      class="control-btn"
      onclick={() => getPlayback().stop()}
      title="Stop"
      aria-label="Stop"
    >
      <i class="fa-solid fa-stop"></i>
    </button>

    <!-- Go to end -->
    <button
      class="control-btn"
      onclick={() => getPlayback().goToEnd()}
      title="Go to end (End)"
      aria-label="Go to end"
    >
      <i class="fa-solid fa-forward-step"></i>
    </button>
  </div>

  <!-- Time Display -->
  <div class="time-display">
    <span class="current-time">{currentTimeDisplay}</span>
    <span class="time-separator">/</span>
    <span class="total-time">{totalTimeDisplay}</span>
    {#if shuttleDisplay}
      <span class="shuttle-indicator">{shuttleDisplay}</span>
    {/if}
  </div>

  <!-- Add Media Button -->
  {#if onOpenMediaBrowser}
    <button
      class="add-media-btn"
      onclick={onOpenMediaBrowser}
      title="Add media to timeline"
      aria-label="Add media"
    >
      <i class="fa-solid fa-plus"></i>
      <span>Add Media</span>
    </button>
  {/if}

  <!-- Spacer -->
  <div class="spacer"></div>

  <!-- Snap Controls -->
  <SnapControls />

  <!-- Zoom Section -->
  <div class="zoom-section">
    <button
      class="control-btn"
      onclick={() => getState().zoomOut()}
      title="Zoom out (-)"
      aria-label="Zoom out"
    >
      <i class="fa-solid fa-magnifying-glass-minus"></i>
    </button>

    <span class="zoom-display" title="Zoom level">
      {zoomPercent}%
    </span>

    <button
      class="control-btn"
      onclick={() => getState().zoomIn()}
      title="Zoom in (+)"
      aria-label="Zoom in"
    >
      <i class="fa-solid fa-magnifying-glass-plus"></i>
    </button>

    <button
      class="control-btn"
      onclick={() => getState().zoomToFit()}
      title="Fit to view"
      aria-label="Fit to view"
    >
      <i class="fa-solid fa-expand"></i>
    </button>
  </div>

  <!-- Project Settings -->
  <button
    class="control-btn"
    onclick={() => getState().openProjectSettings()}
    title="Timeline settings"
    aria-label="Timeline settings"
  >
    <i class="fa-solid fa-gear"></i>
  </button>
</div>

<style>
  .timeline-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .transport-section,
  .zoom-section {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .transport-section {
    padding-right: 12px;
    border-right: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .control-btn {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .control-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15),
                0 0 8px color-mix(in srgb, var(--theme-accent, #4a9eff) 15%, transparent);
    transform: translateY(-1px);
  }

  .control-btn:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .control-btn.active {
    background: color-mix(in srgb, var(--theme-accent, #4a9eff) 25%, transparent);
    border-color: var(--theme-accent, #4a9eff);
    color: var(--theme-accent, #4a9eff);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
  }

  .control-btn.play-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
    border-width: 2px;
  }

  .control-btn.play-btn:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2),
                0 0 16px color-mix(in srgb, var(--theme-accent, #4a9eff) 25%, transparent);
  }

  .control-btn.play-btn.playing {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent-strong, #3a7ed0);
    color: white;
    box-shadow: 0 0 20px color-mix(in srgb, var(--theme-accent, #4a9eff) 40%, transparent),
                0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .time-display {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: "SF Mono", "Monaco", "Consolas", monospace;
    font-size: var(--font-size-compact, 12px);
    padding: 6px 14px;
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.4));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 6px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .current-time {
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    min-width: 70px;
  }

  .time-separator {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .total-time {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    min-width: 70px;
  }

  .shuttle-indicator {
    margin-left: 8px;
    padding: 3px 8px;
    background: var(--theme-accent, #4a9eff);
    color: white;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 40%, transparent),
                0 2px 4px rgba(0, 0, 0, 0.2);
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  .spacer {
    flex: 1;
  }

  .zoom-display {
    min-width: 45px;
    text-align: center;
    font-size: var(--font-size-compact, 12px);
    font-weight: 600;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    padding: 4px 8px;
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.3));
    border-radius: 4px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
  }

  .add-media-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid var(--theme-accent, #4a9eff);
    background: color-mix(in srgb, var(--theme-accent, #4a9eff) 12%, transparent);
    color: var(--theme-accent, #4a9eff);
    cursor: pointer;
    font-size: var(--font-size-compact, 12px);
    font-weight: 600;
    transition: all 0.2s ease;
    margin-left: 12px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .add-media-btn:hover {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent-strong, #3a7ed0);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2),
                0 0 16px color-mix(in srgb, var(--theme-accent, #4a9eff) 35%, transparent);
    transform: translateY(-1px);
  }

  .add-media-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .add-media-btn i {
    font-size: 12px;
  }
</style>
