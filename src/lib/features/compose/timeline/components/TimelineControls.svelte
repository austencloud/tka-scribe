<script lang="ts">
  /**
   * TimelineControls - Transport and zoom controls
   *
   * Play/pause, stop, shuttle controls (J/K/L style)
   * Zoom in/out, fit to view
   * Time display
   * Snap settings
   */

  import { getTimelineState } from "../state/timeline-state.svelte";
  import { getTimelinePlaybackService } from "../services/implementations/TimelinePlaybackService";
  import SnapSettingsPopover from "./SnapSettingsPopover.svelte";

  // Lazy access to state and playback service to avoid initialization timing issues
  function getState() {
    return getTimelineState();
  }

  function getPlayback() {
    return getTimelinePlaybackService();
  }

  // Snap settings popover state
  let isSnapPopoverOpen = $state(false);

  // Local reactive state for display values (updated via effects)
  let currentTimeDisplay = $state("00:00.00");
  let totalTimeDisplay = $state("00:00.00");
  let shuttleDisplay = $state<string | null>(null);
  let zoomPercent = $state(100);

  // Playhead state for template bindings
  let isPlaying = $state(false);
  let playheadDirection = $state<1 | -1>(1);
  let shuttleSpeed = $state(1);
  let snapEnabled = $state(false);

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

  $effect(() => {
    const state = getState();
    snapEnabled = state.project.snap.enabled;
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

  <!-- Spacer -->
  <div class="spacer"></div>

  <!-- Snap Controls -->
  <div class="snap-section">
    <button
      class="control-btn"
      class:active={snapEnabled}
      onclick={() => getState().updateSnapSettings({ enabled: !snapEnabled })}
      title="Toggle snapping (S)"
      aria-label="Toggle snapping"
    >
      <i class="fa-solid fa-magnet"></i>
    </button>
    <button
      class="control-btn settings-btn"
      class:open={isSnapPopoverOpen}
      onclick={() => isSnapPopoverOpen = !isSnapPopoverOpen}
      title="Snap settings"
      aria-label="Open snap settings"
    >
      <i class="fa-solid fa-chevron-down"></i>
    </button>
    <SnapSettingsPopover
      isOpen={isSnapPopoverOpen}
      onClose={() => isSnapPopoverOpen = false}
    />
  </div>

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

  .snap-section {
    display: flex;
    align-items: center;
    gap: 2px;
    position: relative;
  }

  .transport-section {
    padding-right: 12px;
    border-right: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .control-btn {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: none;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.15s ease;
  }

  .control-btn:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.1));
  }

  .control-btn.active {
    background: var(--theme-accent, #4a9eff);
    color: white;
  }

  .control-btn.play-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .control-btn.play-btn.playing {
    background: var(--theme-accent, #4a9eff);
    color: white;
  }

  .control-btn.settings-btn {
    width: 20px;
    height: 32px;
    font-size: 10px;
    border-radius: 0 6px 6px 0;
    margin-left: -2px;
    border-left: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .control-btn.settings-btn.open {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.1));
  }

  .control-btn.settings-btn i {
    transition: transform 0.2s ease;
  }

  .control-btn.settings-btn.open i {
    transform: rotate(180deg);
  }

  .snap-section .control-btn:first-child {
    border-radius: 6px 0 0 6px;
  }

  .time-display {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: "SF Mono", "Monaco", "Consolas", monospace;
    font-size: var(--font-size-compact, 12px);
    padding: 0 12px;
  }

  .current-time {
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    min-width: 70px;
  }

  .time-separator {
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.4));
  }

  .total-time {
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    min-width: 70px;
  }

  .shuttle-indicator {
    margin-left: 8px;
    padding: 2px 6px;
    background: var(--theme-accent, #4a9eff);
    color: white;
    border-radius: 4px;
    font-size: 10px;
  }

  .spacer {
    flex: 1;
  }

  .zoom-display {
    min-width: 40px;
    text-align: center;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
  }
</style>
