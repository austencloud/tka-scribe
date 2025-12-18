<script lang="ts">
  /**
   * TimelinePanel - Main DAW-style timeline editor container
   *
   * Layout:
   * ┌─────────────────────────────────────────────────────────┐
   * │ [Controls]              [Time Ruler]                    │
   * ├─────────────┬───────────────────────────────────────────┤
   * │ Track 1     │ [====clip====]    [==clip==]              │
   * │ Track 2     │        [======clip======]                 │
   * │ Track 3     │ [clip]                  [====clip====]    │
   * ├─────────────┴───────────────────────────────────────────┤
   * │ [Audio Waveform]                                        │
   * └─────────────────────────────────────────────────────────┘
   */

  import { getTimelineState } from "../state/timeline-state.svelte";
  import { getTimelinePlaybackService } from "../services/implementations/TimelinePlaybackService";
  import { getTimelineSnapService } from "../services/implementations/TimelineSnapService";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import TimeRuler from "./TimeRuler.svelte";
  import TrackLane from "./TrackLane.svelte";
  import TrackHeader from "./TrackHeader.svelte";
  import Playhead from "./Playhead.svelte";
  import TimelineControls from "./TimelineControls.svelte";
  import TimelineAudioTrack from "./TimelineAudioTrack.svelte";
  import SnapGuides from "./SnapGuides.svelte";
  import ClipInspector from "./ClipInspector.svelte";
  import TimelineEmptyState from "./TimelineEmptyState.svelte";
  import TimelineMinimap from "./TimelineMinimap.svelte";
  import { timeToPixels } from "../domain/timeline-types";

  // Lazy access to state and services to avoid initialization timing issues
  function getState() {
    return getTimelineState();
  }
  function getPlayback() {
    return getTimelinePlaybackService();
  }
  function getSnap() {
    return getTimelineSnapService();
  }

  // Container refs for scroll sync
  let tracksContainer: HTMLDivElement;
  let rulerContainer: HTMLDivElement;
  let panelElement: HTMLDivElement;

  // Local reactive state (synced via effects)
  let timelineWidth = $state(1000);
  let playheadPosition = $state(0);
  let pixelsPerSecond = $state(50);
  let totalDuration = $state(60);
  let isPlaying = $state(false);
  let hasSelection = $state(false);
  let tracks = $state<any[]>([]);
  let hasClips = $state(false);
  let allClips = $state<any[]>([]);
  let containerWidth = $state(0);
  let viewportStartTime = $state(0);

  // Sync local state from timeline state
  $effect(() => {
    const state = getState();
    pixelsPerSecond = state.viewport.pixelsPerSecond;
    totalDuration = state.totalDuration;
    timelineWidth = timeToPixels(totalDuration + 10, pixelsPerSecond);
    playheadPosition = state.playhead.position;
    isPlaying = state.playhead.isPlaying;
    hasSelection = state.hasSelection;
    tracks = state.project.tracks;
    allClips = state.allClips;
    hasClips = allClips.length > 0;
  });

  // Track container width for minimap viewport calculation using Svelte action
  // DISABLED - testing if this causes the loop
  function trackWidth(_node: HTMLDivElement) {
    // const observer = new ResizeObserver((entries) => {
    //   containerWidth = entries[0]?.contentRect.width ?? 0;
    // });
    // observer.observe(node);
    return {
      destroy() {
        // observer.disconnect();
      }
    };
  }

  // Handler to open library browser - navigates to the Library module
  function handleBrowseLibrary() {
    navigationState.setCurrentModule("library");
  }

  // Sync horizontal scroll between ruler and tracks
  function handleTracksScroll(e: Event) {
    const target = e.target as HTMLDivElement;
    if (rulerContainer) {
      rulerContainer.scrollLeft = target.scrollLeft;
    }
    viewportStartTime = target.scrollLeft / pixelsPerSecond;
    getState().setScrollX(viewportStartTime);
  }

  // Minimap seek handler (click to jump)
  function handleMinimapSeek(time: number) {
    getPlayback().seek(time);
  }

  // Minimap scroll handler (drag viewport)
  function handleMinimapScroll(startTime: number) {
    if (tracksContainer) {
      tracksContainer.scrollLeft = startTime * pixelsPerSecond;
      viewportStartTime = startTime;
    }
  }

  // Click on empty area to set playhead
  function handleTimelineClick(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left + (tracksContainer?.scrollLeft ?? 0);
    const time = x / pixelsPerSecond;
    getPlayback().seek(time);
  }

  // Track header width (fixed) - needs space for color bar, name, M/S/Lock buttons
  const HEADER_WIDTH = 180;

  // Auto-scroll to keep playhead visible during playback
  $effect(() => {
    if (!isPlaying || !tracksContainer) return;

    const playheadX = timeToPixels(playheadPosition, pixelsPerSecond);
    const containerRect = tracksContainer.getBoundingClientRect();
    const scrollLeft = tracksContainer.scrollLeft;
    const visibleLeft = scrollLeft;
    const visibleRight = scrollLeft + containerRect.width;

    // Add padding so we scroll before hitting the edge
    const padding = containerRect.width * 0.2;

    if (playheadX > visibleRight - padding) {
      // Scroll right
      tracksContainer.scrollLeft = playheadX - containerRect.width + padding;
    } else if (playheadX < visibleLeft + padding) {
      // Scroll left
      tracksContainer.scrollLeft = Math.max(0, playheadX - padding);
    }
  });

  // Handle wheel events for scroll/zoom
  function handleWheel(e: WheelEvent) {
    // Ctrl+scroll = zoom (horizontal)
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1; // Scroll down = zoom out, scroll up = zoom in
      const zoomFactor = 1.15; // Smaller increments for smoother zoom

      const state = getState();
      const currentZoom = state.viewport.pixelsPerSecond;
      const newZoom = delta > 0 ? currentZoom * zoomFactor : currentZoom / zoomFactor;

      // Zoom toward mouse position
      if (tracksContainer) {
        const rect = tracksContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const scrollLeft = tracksContainer.scrollLeft;

        // Time at mouse position
        const timeAtMouse = (mouseX + scrollLeft) / currentZoom;

        // Apply zoom
        state.setZoom(newZoom);

        // Adjust scroll to keep mouse over same time position
        const newPixelPos = timeAtMouse * newZoom;
        tracksContainer.scrollLeft = newPixelPos - mouseX;
      } else {
        state.setZoom(newZoom);
      }
      return;
    }

    // Shift+scroll = horizontal scroll (for mice without horizontal scroll)
    if (e.shiftKey && tracksContainer) {
      e.preventDefault();
      tracksContainer.scrollLeft += e.deltaY;
      return;
    }

    // Regular scroll is handled natively by the tracks container
  }

  // Keyboard shortcuts
  function handleKeyDown(e: KeyboardEvent) {
    // Don't handle if user is typing in an input
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    switch (e.key) {
      case " ": // Spacebar - play/pause
        e.preventDefault();
        getPlayback().togglePlayPause();
        break;

      case "j": // Shuttle reverse
      case "J":
        e.preventDefault();
        getPlayback().shuttleReverse();
        break;

      case "k": // Shuttle stop / pause
      case "K":
        e.preventDefault();
        getPlayback().shuttleStop();
        break;

      case "l": // Shuttle forward (avoid conflict with clip lock)
        if (!hasSelection) {
          e.preventDefault();
          getPlayback().shuttleForward();
        }
        break;

      case "L": // Shift+L always shuttles forward
        e.preventDefault();
        getPlayback().shuttleForward();
        break;

      case "Home": // Go to start
        e.preventDefault();
        getPlayback().goToStart();
        break;

      case "End": // Go to end
        e.preventDefault();
        getPlayback().goToEnd();
        break;

      case "ArrowLeft": // Step backward
        e.preventDefault();
        getPlayback().stepBackward(e.shiftKey ? 10 : 1);
        break;

      case "ArrowRight": // Step forward
        e.preventDefault();
        getPlayback().stepForward(e.shiftKey ? 10 : 1);
        break;

      case "i": // Set in point
      case "I":
        e.preventDefault();
        getPlayback().setInPointAtPlayhead();
        break;

      case "o": // Set out point
      case "O":
        e.preventDefault();
        getPlayback().setOutPointAtPlayhead();
        break;

      case "Escape": // Clear loop region
        if (getPlayback().hasLoopRegion) {
          e.preventDefault();
          getPlayback().clearLoopRegion();
        }
        break;

      case "Delete": // Delete selected clips
      case "Backspace":
        if (hasSelection) {
          e.preventDefault();
          getState().removeSelectedClips();
        }
        break;

      case "a": // Select all
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          getState().selectAllClips();
        }
        break;

      case "=": // Zoom in
      case "+":
        e.preventDefault();
        getState().zoomIn();
        break;

      case "-": // Zoom out
        e.preventDefault();
        getState().zoomOut();
        break;

      case "0": // Fit to view
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          getState().zoomToFit();
        }
        break;
    }
  }
</script>

<!-- DEBUGGING: Simplified render to find infinite loop source -->
<div class="timeline-panel" style="padding: 20px; color: white;">
  <h2>Timeline Panel - Debug Mode</h2>
  <p>If you see this without errors, the issue is in one of the child components.</p>
</div>

<style>
  .timeline-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    /* Solid dark background - no transparency so animated bg doesn't show through */
    background: #121218;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .controls-bar {
    flex-shrink: 0;
    padding: 8px 12px;
    background: #1a1a24;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }

  .timeline-body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .track-headers {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: #16161e;
    border-right: 1px solid rgba(255, 255, 255, 0.12);
  }

  .header-spacer {
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #16161e;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }

  .add-track-btn {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px dashed var(--theme-stroke, rgba(255, 255, 255, 0.2));
    background: transparent;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.15s ease;
  }

  .add-track-btn:hover {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
    color: white;
  }

  .timeline-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  .ruler-container {
    flex-shrink: 0;
    height: 32px;
    overflow: hidden;
    background: #16161e;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }

  .ruler-scroll-content {
    height: 100%;
  }

  .tracks-container {
    flex: 1;
    overflow: auto;
    position: relative;
    background: #0e0e12;
  }

  .tracks-scroll-content {
    position: relative;
    min-height: 100%;
  }

  .drop-zone {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 4px;
    margin: 8px;
    opacity: 0.5;
    transition: opacity 0.2s ease;
  }

  .drop-zone:hover {
    opacity: 1;
    border-color: var(--theme-accent, #4a9eff);
  }

  .drop-hint {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

</style>
