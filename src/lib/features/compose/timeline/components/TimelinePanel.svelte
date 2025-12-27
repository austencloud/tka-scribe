<script lang="ts">
  /**
   * TimelinePanel - Main DAW-style timeline editor container
   *
   * Professional NLE Layout:
   * ┌──────────────────────────────────────────────────────────────────┐
   * │ Controls Bar                                    [Media] [Preview]│
   * ├───────────────┬───────────────┬──────────────────────────────────┤
   * │    Source     │    Program    │  Media Browser (inline, toggle)  │
   * │    Monitor    │    Monitor    │                                  │
   * ├───────────────┴───────────────┴──────────────────────────────────┤
   * │ Timeline (minimap, tracks, audio)                                 │
   * └──────────────────────────────────────────────────────────────────┘
   */

  import { getTimelineState } from "../state/timeline-state.svelte";
  import { getTimelinePlaybackService } from "../services/implementations/TimelinePlaybackService";
  import { getTimelineSnapService } from "../services/implementations/TimelineSnapService";
  import { loadFromStorage, saveToStorage, TIMELINE_STORAGE_KEYS } from "../state/timeline-storage";
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
  import MediaBrowserPanel, { type MediaImportType } from "./media-browser/MediaBrowserPanel.svelte";
  import TimelinePreview from "./TimelinePreview.svelte";
  import SourcePreview from "./SourcePreview.svelte";
  import PanelGroup from "$lib/shared/panels/PanelGroup.svelte";
  import { timeToPixels } from "../domain/timeline-types";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { untrack } from "svelte";

  // Panel layout persistence
  interface PanelLayout {
    showPreview: boolean;
    showMediaBrowser: boolean;
    verticalSizes: number[];     // [monitors, timeline] ratios
    monitorSizes: number[];      // [source, program] ratios
    mainSizes: number[];         // [left side, media browser] ratios
  }
  const DEFAULT_PANEL_LAYOUT: PanelLayout = {
    showPreview: true,
    showMediaBrowser: false,
    verticalSizes: [1, 2],
    monitorSizes: [1, 1],
    mainSizes: [3, 1],           // 3:1 ratio - left side larger
  };

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

  // Load persisted panel layout
  const savedLayout = loadFromStorage<PanelLayout>(
    TIMELINE_STORAGE_KEYS.PANEL_LAYOUT,
    DEFAULT_PANEL_LAYOUT
  );

  // Panel visibility state (persisted)
  let showPreview = $state(savedLayout.showPreview ?? true);
  let showMediaBrowser = $state(savedLayout.showMediaBrowser ?? false);

  // Panel sizes as flex ratios (persisted)
  let verticalSizes = $state(savedLayout.verticalSizes ?? [1, 2]);
  let monitorSizes = $state(savedLayout.monitorSizes ?? [1, 1]);
  let mainSizes = $state(savedLayout.mainSizes ?? [3, 1]);

  // Source sequence for preview (not persisted)
  let sourceSequence = $state<SequenceData | null>(null);

  // Persist panel layout when it changes
  $effect(() => {
    const layout: PanelLayout = {
      showPreview,
      showMediaBrowser,
      verticalSizes,
      monitorSizes,
      mainSizes,
    };
    untrack(() => {
      saveToStorage(TIMELINE_STORAGE_KEYS.PANEL_LAYOUT, layout);
    });
  });

  // Sync local state from timeline state
  $effect(() => {
    const state = getState();
    const pps = state.viewport.pixelsPerSecond;
    const dur = state.totalDuration;
    const pos = state.playhead.position;
    const playing = state.playhead.isPlaying;
    const hasSel = state.hasSelection;
    const trks = state.project.tracks;
    const clips = state.allClips;

    untrack(() => {
      pixelsPerSecond = pps;
      totalDuration = dur;
      timelineWidth = timeToPixels(dur + 10, pps);
      playheadPosition = pos;
      isPlaying = playing;
      hasSelection = hasSel;
      tracks = trks;
      allClips = clips;
      hasClips = clips.length > 0;
    });
  });

  // Track container width for minimap viewport calculation
  function trackWidth(node: HTMLDivElement) {
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      untrack(() => {
        containerWidth = width;
      });
    });
    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      }
    };
  }

  // Toggle media browser panel
  function toggleMediaBrowser() {
    showMediaBrowser = !showMediaBrowser;
  }

  // Handle media import from browser
  function handleMediaImport(sequence: SequenceData, mediaType: MediaImportType) {
    const state = getState();
    const trackId = state.project.tracks[0]?.id;
    if (!trackId) return;

    const startTime = state.playhead.position;

    switch (mediaType) {
      case "image":
        state.addClip(sequence, trackId, startTime, {
          duration: 3,
          loop: false,
          playbackRate: 1,
          color: "#51cf66",
          label: `${sequence.word || sequence.name} (Image)`,
        });
        break;

      case "recording":
        const recordingDuration = sequence.beats?.length || 5;
        state.addClip(sequence, trackId, startTime, {
          duration: recordingDuration,
          loop: false,
          color: "#ff6b6b",
          label: `${sequence.word || sequence.name} (Recording)`,
        });
        break;

      case "animation":
      default:
        state.addClip(sequence, trackId, startTime);
        break;
    }

    console.log(`🎬 Added ${mediaType} from sequence:`, sequence.word);
  }

  // Source monitor: Load a sequence for preview
  function loadSourceSequence(sequence: SequenceData) {
    sourceSequence = sequence;
    console.log(`👁️ Source monitor: Loaded "${sequence.word || sequence.name}"`);
  }

  // Source monitor: Add currently loaded source to timeline
  function handleAddSourceToTimeline(sequence: SequenceData) {
    const state = getState();
    const trackId = state.project.tracks[0]?.id;
    if (!trackId) {
      console.warn("No track available to add clip");
      return;
    }

    const startTime = state.playhead.position;
    state.addClip(sequence, trackId, startTime);
    console.log(`🎬 Added from source monitor: "${sequence.word || sequence.name}" at ${startTime}s`);
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

  // Minimap seek handler
  function handleMinimapSeek(time: number) {
    getPlayback().seek(time);
  }

  // Minimap scroll handler
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

  // Track header width
  const HEADER_WIDTH = 180;

  // Auto-scroll to keep playhead visible during playback
  $effect(() => {
    if (!isPlaying || !tracksContainer) return;

    const playheadX = timeToPixels(playheadPosition, pixelsPerSecond);
    const containerRect = tracksContainer.getBoundingClientRect();
    const scrollLeft = tracksContainer.scrollLeft;
    const visibleLeft = scrollLeft;
    const visibleRight = scrollLeft + containerRect.width;
    const padding = containerRect.width * 0.2;

    untrack(() => {
      if (playheadX > visibleRight - padding) {
        tracksContainer.scrollLeft = playheadX - containerRect.width + padding;
      } else if (playheadX < visibleLeft + padding) {
        tracksContainer.scrollLeft = Math.max(0, playheadX - padding);
      }
    });
  });

  // Handle wheel events for scroll/zoom
  function handleWheel(e: WheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      const zoomFactor = 1.15;

      const state = getState();
      const currentZoom = state.viewport.pixelsPerSecond;
      const newZoom = delta > 0 ? currentZoom * zoomFactor : currentZoom / zoomFactor;

      if (tracksContainer) {
        const rect = tracksContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const scrollLeft = tracksContainer.scrollLeft;
        const timeAtMouse = (mouseX + scrollLeft) / currentZoom;

        state.setZoom(newZoom);

        const newPixelPos = timeAtMouse * newZoom;
        tracksContainer.scrollLeft = newPixelPos - mouseX;
      } else {
        state.setZoom(newZoom);
      }
      return;
    }

    if (e.shiftKey && tracksContainer) {
      e.preventDefault();
      tracksContainer.scrollLeft += e.deltaY;
      return;
    }
  }

  // Keyboard shortcuts
  function handleKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key) {
      case " ":
        e.preventDefault();
        getPlayback().togglePlayPause();
        break;

      case "j":
      case "J":
        e.preventDefault();
        getPlayback().shuttleReverse();
        break;

      case "k":
      case "K":
        e.preventDefault();
        getPlayback().shuttleStop();
        break;

      case "l":
        if (!hasSelection) {
          e.preventDefault();
          getPlayback().shuttleForward();
        }
        break;

      case "L":
        e.preventDefault();
        getPlayback().shuttleForward();
        break;

      case "Home":
        e.preventDefault();
        getPlayback().goToStart();
        break;

      case "End":
        e.preventDefault();
        getPlayback().goToEnd();
        break;

      case "ArrowLeft":
        e.preventDefault();
        getPlayback().stepBackward(e.shiftKey ? 10 : 1);
        break;

      case "ArrowRight":
        e.preventDefault();
        getPlayback().stepForward(e.shiftKey ? 10 : 1);
        break;

      case "i":
      case "I":
        e.preventDefault();
        getPlayback().setInPointAtPlayhead();
        break;

      case "o":
      case "O":
        e.preventDefault();
        getPlayback().setOutPointAtPlayhead();
        break;

      case "Escape":
        if (getPlayback().hasLoopRegion) {
          e.preventDefault();
          getPlayback().clearLoopRegion();
        }
        break;

      case "Delete":
      case "Backspace":
        if (hasSelection) {
          e.preventDefault();
          getState().removeSelectedClips();
        }
        break;

      case "a":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          getState().selectAllClips();
        }
        break;

      case "=":
      case "+":
        e.preventDefault();
        getState().zoomIn();
        break;

      case "-":
        e.preventDefault();
        getState().zoomOut();
        break;

      case "0":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          getState().zoomToFit();
        }
        break;
    }
  }

  // Build main panels array based on showMediaBrowser
  const mainPanels = $derived.by(() => {
    const panels = [
      { id: "left", content: leftSideContent, defaultSize: 3, minSize: 400 },
    ];
    if (showMediaBrowser) {
      panels.push({ id: "media", content: mediaBrowserContent, defaultSize: 1, minSize: 250 });
    }
    return panels;
  });
</script>

<!-- Snippet: Source Monitor -->
{#snippet sourceMonitorContent()}
  <div class="monitor-panel source-monitor">
    <div class="monitor-label">
      <i class="fas fa-photo-film"></i>
      <span>Source</span>
    </div>
    <div class="monitor-viewport">
      <SourcePreview
        sequence={sourceSequence}
        onAddToTimeline={handleAddSourceToTimeline}
      />
    </div>
  </div>
{/snippet}

<!-- Snippet: Program Monitor -->
{#snippet programMonitorContent()}
  <div class="monitor-panel program-monitor">
    <div class="monitor-label">
      <i class="fas fa-play-circle"></i>
      <span>Program</span>
    </div>
    <div class="monitor-viewport">
      <TimelinePreview
        {playheadPosition}
        clips={allClips}
        {isPlaying}
        {pixelsPerSecond}
      />
    </div>
  </div>
{/snippet}

<!-- Snippet: Monitors Area (horizontal layout: Program | Source) -->
{#snippet monitorsContent()}
  <div class="monitors-area">
    <PanelGroup
      direction="horizontal"
      panels={[
        { id: "program", content: programMonitorContent, defaultSize: 1, minSize: 200 },
        { id: "source", content: sourceMonitorContent, defaultSize: 1, minSize: 200 },
      ]}
      bind:sizes={monitorSizes}
    />
  </div>
{/snippet}

<!-- Snippet: Left side content (monitors + timeline in vertical stack) -->
{#snippet leftSideContent()}
  <div class="left-side-content">
    {#if showPreview}
      <PanelGroup
        direction="vertical"
        panels={[
          { id: "monitors", content: monitorsContent, defaultSize: 1, minSize: 180 },
          { id: "timeline", content: timelineContent, defaultSize: 2, minSize: 100 }
        ]}
        bind:sizes={verticalSizes}
      />
    {:else}
      {@render timelineContent()}
    {/if}
  </div>
{/snippet}

<!-- Snippet: Media Browser Panel (full height) -->
{#snippet mediaBrowserContent()}
  <MediaBrowserPanel
    onLoadToSource={loadSourceSequence}
    onImport={handleMediaImport}
  />
{/snippet}

<!-- Snippet: Timeline Content -->
{#snippet timelineContent()}
  <div class="timeline-area">
    <TimelineMinimap
      {totalDuration}
      playheadPosition={playheadPosition}
      viewportStartTime={viewportStartTime}
      {pixelsPerSecond}
      {containerWidth}
      clips={allClips}
      onSeek={handleMinimapSeek}
      onScroll={handleMinimapScroll}
    />

    <div class="timeline-body">
      <div class="track-headers" style="width: {HEADER_WIDTH}px">
        <div class="header-spacer">
          <button class="add-track-btn" onclick={() => getState().addTrack()} title="Add Track" aria-label="Add track">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        {#each tracks as track (track.id)}
          <TrackHeader {track} />
        {/each}
      </div>

      <div class="timeline-content">
        <div class="ruler-container" bind:this={rulerContainer}>
          <div class="ruler-scroll-content" style="width: {timelineWidth}px">
            <TimeRuler duration={totalDuration + 10} {pixelsPerSecond} />
          </div>
        </div>

        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div
          class="tracks-container"
          bind:this={tracksContainer}
          use:trackWidth
          onscroll={handleTracksScroll}
          onclick={handleTimelineClick}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTimelineClick(e as any);
            }
          }}
          role="application"
          aria-label="Timeline tracks"
        >
          <div class="tracks-scroll-content" style="width: {timelineWidth}px">
            <SnapGuides activeSnapTime={getSnap().activeSnapTime} height={tracks.length * 80 + 60} />
            <Playhead position={playheadPosition} {pixelsPerSecond} height={tracks.length * 80} />

            {#each tracks as track (track.id)}
              <TrackLane {track} {pixelsPerSecond} />
            {/each}

            {#if !hasClips}
              <TimelineEmptyState onBrowseLibrary={toggleMediaBrowser} />
            {:else}
              <div class="drop-zone">
                <span class="drop-hint">Drag sequences here to add clips</span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <TimelineAudioTrack headerWidth={HEADER_WIDTH} />
  </div>
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="timeline-panel"
  bind:this={panelElement}
  onkeydown={handleKeyDown}
  onwheel={handleWheel}
  tabindex="0"
  role="application"
  aria-label="Timeline editor"
>
  <!-- Top Controls Bar -->
  <div class="controls-bar">
    <TimelineControls onOpenMediaBrowser={toggleMediaBrowser} />

    <!-- Layout Toggles -->
    <div class="layout-toggles">
      <button
        class="toggle-btn"
        class:active={showMediaBrowser}
        onclick={toggleMediaBrowser}
        title={showMediaBrowser ? "Hide media browser" : "Show media browser"}
        aria-label={showMediaBrowser ? "Hide media browser" : "Show media browser"}
      >
        <i class="fas fa-photo-film"></i>
      </button>
      <button
        class="toggle-btn"
        class:active={showPreview}
        onclick={() => showPreview = !showPreview}
        title={showPreview ? "Hide monitors" : "Show monitors"}
        aria-label={showPreview ? "Hide monitors" : "Show monitors"}
      >
        <i class="fa-solid fa-tv"></i>
      </button>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="main-content">
    {#if showMediaBrowser}
      <PanelGroup
        direction="horizontal"
        panels={mainPanels}
        bind:sizes={mainSizes}
      />
    {:else}
      {@render leftSideContent()}
    {/if}
  </div>

  <!-- Clip Inspector Panel (right sidebar) -->
  <ClipInspector />
</div>

<style>
  .timeline-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.6));
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    box-shadow: var(--theme-shadow, 0 14px 36px rgba(0, 0, 0, 0.4));
  }

  .controls-bar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .layout-toggles {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .toggle-btn {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    transition: all 0.2s ease;
  }

  .toggle-btn:hover {
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    color: var(--theme-text, white);
    transform: translateY(-1px);
  }

  .toggle-btn.active {
    background: color-mix(in srgb, var(--theme-accent, #4a9eff) 20%, transparent);
    border-color: var(--theme-accent, #4a9eff);
    color: var(--theme-accent, #4a9eff);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
  }

  .main-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* Left side content wrapper (monitors + timeline) */
  .left-side-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    min-width: 0;
  }

  /* Monitors area (horizontal PanelGroup container) */
  .monitors-area {
    display: flex;
    flex: 1;
    min-height: 0;
    min-width: 0;
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
  }

  /* Individual monitor panels */
  .monitor-panel {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    min-width: 0;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
    border-right: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .monitor-panel:last-child {
    border-right: none;
  }

  .monitor-label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    flex-shrink: 0;
  }

  .source-monitor .monitor-label {
    color: #ffd43b;
    border-left: 3px solid #ffd43b;
    text-shadow: 0 0 8px rgba(255, 212, 59, 0.3);
  }

  .program-monitor .monitor-label {
    color: var(--theme-accent, #4a9eff);
    border-left: 3px solid var(--theme-accent, #4a9eff);
    text-shadow: 0 0 8px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
  }

  .monitor-label i {
    font-size: 13px;
    filter: drop-shadow(0 0 4px currentColor);
  }

  .monitor-viewport {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .monitor-viewport :global(.source-preview),
  .monitor-viewport :global(.timeline-preview) {
    flex: 1;
    min-height: 0;
  }

  /* Timeline area */
  .timeline-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
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
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
    border-right: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .header-spacer {
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .add-track-btn {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px dashed var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    background: transparent;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    transition: all 0.2s ease;
  }

  .add-track-btn:hover {
    background: color-mix(in srgb, var(--theme-accent, #4a9eff) 20%, transparent);
    border-style: solid;
    border-color: var(--theme-accent, #4a9eff);
    color: var(--theme-accent, #4a9eff);
    box-shadow: 0 0 10px color-mix(in srgb, var(--theme-accent, #4a9eff) 25%, transparent);
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
    height: 36px;
    overflow: hidden;
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .ruler-scroll-content {
    height: 100%;
  }

  .tracks-container {
    flex: 1;
    overflow-x: scroll;
    overflow-y: auto;
    position: relative;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.6));
    scrollbar-width: thin;
    scrollbar-color: var(--theme-stroke, rgba(255, 255, 255, 0.08)) transparent;
  }

  .tracks-container::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  .tracks-container::-webkit-scrollbar-track {
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
  }

  .tracks-container::-webkit-scrollbar-thumb {
    background: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    border-radius: 6px;
    border: 2px solid var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
  }

  .tracks-container::-webkit-scrollbar-thumb:hover {
    background: var(--theme-accent, #4a9eff);
    box-shadow: 0 0 8px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
  }

  .tracks-scroll-content {
    position: relative;
    min-height: 100%;
  }

  .drop-zone {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    border-radius: 12px;
    margin: 12px;
    opacity: 0.5;
    transition: all 0.2s ease;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
  }

  .drop-zone:hover {
    opacity: 1;
    border-color: var(--theme-accent, #4a9eff);
    background: color-mix(in srgb, var(--theme-accent, #4a9eff) 10%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 20%, transparent);
  }

  .drop-hint {
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    font-weight: 500;
  }
</style>
