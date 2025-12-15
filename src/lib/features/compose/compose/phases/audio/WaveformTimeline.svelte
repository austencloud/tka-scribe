<!--
  WaveformTimeline.svelte

  Wavesurfer.js wrapper for audio waveform visualization.
  Displays waveform, handles playback, zoom, and keyboard controls.

  Controls:
  - Click: Seek to position
  - Space: Play/pause
  - Arrow Left/Right: Seek ±5 seconds
  - Ctrl+Wheel: Zoom in/out
  - Home/End: Jump to start/end
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import WaveSurfer from "wavesurfer.js";

  let {
    audioUrl,
    isPlaying = false,
    currentTime = 0,
    onReady,
    onTimeUpdate,
    onDurationChange,
    onSeek,
    onPlayPause,
    onZoomChange,
  }: {
    audioUrl: string;
    isPlaying?: boolean;
    currentTime?: number;
    onReady?: () => void;
    onTimeUpdate?: (time: number) => void;
    onDurationChange?: (duration: number) => void;
    onSeek?: (time: number) => void;
    onPlayPause?: (playing: boolean) => void;
    onZoomChange?: (zoom: number) => void;
  } = $props();

  let containerEl: HTMLDivElement;
  let wavesurfer: WaveSurfer | null = null;
  let isReady = $state(false);
  let duration = $state(0);
  let internalTime = $state(0);
  let isFocused = $state(false);

  // Zoom state (pixels per second)
  const MIN_ZOOM = 20;
  const MAX_ZOOM = 500;
  const DEFAULT_ZOOM = 50;
  let zoomLevel = $state(DEFAULT_ZOOM);

  // Sync external isPlaying prop with wavesurfer
  $effect(() => {
    if (!wavesurfer || !isReady) return;

    if (isPlaying && !wavesurfer.isPlaying()) {
      wavesurfer.play();
    } else if (!isPlaying && wavesurfer.isPlaying()) {
      wavesurfer.pause();
    }
  });

  // Sync external currentTime with wavesurfer (for seeking)
  $effect(() => {
    if (!wavesurfer || !isReady) return;

    // Only seek if the difference is significant (avoid feedback loops)
    const diff = Math.abs(currentTime - internalTime);
    if (diff > 0.1) {
      wavesurfer.seekTo(currentTime / duration);
    }
  });

  // Apply zoom level changes
  $effect(() => {
    if (!wavesurfer || !isReady) return;
    wavesurfer.zoom(zoomLevel);
    onZoomChange?.(zoomLevel);
  });

  onMount(() => {
    if (!containerEl) return;

    wavesurfer = WaveSurfer.create({
      container: containerEl,
      waveColor: "rgba(139, 92, 246, 0.4)",
      progressColor: "rgba(167, 139, 250, 0.8)",
      cursorColor: "rgba(255, 255, 255, 0.8)",
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 120,
      normalize: true,
      backend: "WebAudio",
      minPxPerSec: DEFAULT_ZOOM,
      fillParent: true,
      autoScroll: true,
      autoCenter: true,
    });

    // Load audio
    wavesurfer.load(audioUrl);

    // Event handlers
    wavesurfer.on("ready", () => {
      isReady = true;
      duration = wavesurfer?.getDuration() ?? 0;
      onDurationChange?.(duration);
      onReady?.();
    });

    wavesurfer.on("audioprocess", (time: number) => {
      internalTime = time;
      onTimeUpdate?.(time);
    });

    wavesurfer.on("seeking", (time: number) => {
      internalTime = time;
      onSeek?.(time);
    });

    wavesurfer.on("play", () => {
      onPlayPause?.(true);
    });

    wavesurfer.on("pause", () => {
      onPlayPause?.(false);
    });

    wavesurfer.on("finish", () => {
      onPlayPause?.(false);
    });

    // Click behavior: seek to position (no toggle)
    wavesurfer.on("interaction", () => {
      // The interaction event already seeks, we just don't toggle play
    });
  });

  onDestroy(() => {
    wavesurfer?.destroy();
    wavesurfer = null;
  });

  // Keyboard controls
  function handleKeydown(e: KeyboardEvent) {
    if (!wavesurfer || !isReady || !isFocused) return;

    switch (e.key) {
      case " ":
        e.preventDefault();
        wavesurfer.playPause();
        break;
      case "ArrowLeft":
        e.preventDefault();
        seekRelative(-5);
        break;
      case "ArrowRight":
        e.preventDefault();
        seekRelative(5);
        break;
      case "Home":
        e.preventDefault();
        wavesurfer.seekTo(0);
        break;
      case "End":
        e.preventDefault();
        wavesurfer.seekTo(1);
        break;
    }
  }

  // Wheel zoom (Ctrl+wheel)
  function handleWheel(e: WheelEvent) {
    if (!e.ctrlKey && !e.metaKey) return;

    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel + delta));
  }

  // Seek relative to current position
  function seekRelative(seconds: number) {
    if (!wavesurfer || duration <= 0) return;
    const newTime = Math.max(0, Math.min(duration, internalTime + seconds));
    wavesurfer.seekTo(newTime / duration);
  }

  // Zoom slider handler
  function handleZoomChange(e: Event) {
    const input = e.target as HTMLInputElement;
    zoomLevel = parseInt(input.value, 10);
  }

  // Reset zoom
  function resetZoom() {
    zoomLevel = DEFAULT_ZOOM;
  }

  // Expose methods for parent control
  export function play() {
    wavesurfer?.play();
  }

  export function pause() {
    wavesurfer?.pause();
  }

  export function seekTo(time: number) {
    if (wavesurfer && duration > 0) {
      wavesurfer.seekTo(time / duration);
    }
  }

  export function getDuration(): number {
    return duration;
  }

  export function setZoom(level: number) {
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level));
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="waveform-timeline"
  class:focused={isFocused}
  onfocus={() => (isFocused = true)}
  onblur={() => (isFocused = false)}
  onwheel={handleWheel}
  tabindex="0"
  role="application"
  aria-label="Audio waveform timeline"
>
  <div class="waveform-container" bind:this={containerEl}></div>

  {#if !isReady}
    <div class="loading-overlay">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Loading waveform...</span>
    </div>
  {/if}

  <!-- Controls bar -->
  <div class="controls-bar">
    <!-- Playback controls -->
    <div class="playback-controls">
      <button
        class="control-btn"
        onclick={() => wavesurfer?.playPause()}
        disabled={!isReady}
        title={isPlaying ? "Pause (Space)" : "Play (Space)"}
      >
        <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}"></i>
      </button>
      <button
        class="control-btn"
        onclick={() => wavesurfer?.stop()}
        disabled={!isReady}
        title="Stop"
      >
        <i class="fas fa-stop"></i>
      </button>
    </div>

    <!-- Time display -->
    <div class="time-display">
      <span class="current">{formatTime(internalTime)}</span>
      <span class="separator">/</span>
      <span class="total">{formatTime(duration)}</span>
    </div>

    <!-- Zoom controls -->
    <div class="zoom-controls">
      <button
        class="control-btn small"
        onclick={() => (zoomLevel = Math.max(MIN_ZOOM, zoomLevel - 20))}
        disabled={!isReady || zoomLevel <= MIN_ZOOM}
        title="Zoom out"
      >
        <i class="fas fa-search-minus"></i>
      </button>
      <input
        type="range"
        class="zoom-slider"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        value={zoomLevel}
        oninput={handleZoomChange}
        disabled={!isReady}
        title="Zoom level: {zoomLevel}px/s"
      />
      <button
        class="control-btn small"
        onclick={() => (zoomLevel = Math.min(MAX_ZOOM, zoomLevel + 20))}
        disabled={!isReady || zoomLevel >= MAX_ZOOM}
        title="Zoom in"
      >
        <i class="fas fa-search-plus"></i>
      </button>
      <button
        class="control-btn small"
        onclick={resetZoom}
        disabled={!isReady || zoomLevel === DEFAULT_ZOOM}
        title="Reset zoom"
      >
        <i class="fas fa-compress-arrows-alt"></i>
      </button>
    </div>
  </div>

  <!-- Keyboard hints (shown when focused) -->
  {#if isFocused && isReady}
    <div class="keyboard-hints">
      <span><kbd>Space</kbd> Play/Pause</span>
      <span><kbd>←</kbd><kbd>→</kbd> Seek ±5s</span>
      <span><kbd>Ctrl</kbd>+<kbd>Scroll</kbd> Zoom</span>
    </div>
  {/if}
</div>

<script context="module" lang="ts">
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
</script>

<style>
  .waveform-timeline {
    position: relative;
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    overflow: hidden;
    outline: none;
    border: 1px solid transparent;
    transition: border-color 0.2s ease;
  }

  .waveform-timeline.focused {
    border-color: rgba(139, 92, 246, 0.4);
  }

  .waveform-container {
    width: 100%;
    min-height: 120px;
    cursor: pointer;
    overflow-x: auto;
  }

  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    background: rgba(0, 0, 0, 0.5);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  .loading-overlay i {
    font-size: 1.5rem;
    color: rgba(139, 92, 246, 0.8);
  }

  /* Controls bar */
  .controls-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .playback-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-btn.small {
    width: 26px;
    height: 26px;
    font-size: 0.75rem;
  }

  .control-btn:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.3);
  }

  .control-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .time-display {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    font-size: 0.8rem;
    font-family: monospace;
    color: rgba(255, 255, 255, 0.9);
  }

  .separator {
    color: rgba(255, 255, 255, 0.4);
  }

  .total {
    color: rgba(255, 255, 255, 0.6);
  }

  /* Zoom controls */
  .zoom-controls {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .zoom-slider {
    width: 80px;
    height: 4px;
    appearance: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    cursor: pointer;
  }

  .zoom-slider::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: rgba(139, 92, 246, 0.8);
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  .zoom-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .zoom-slider:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Keyboard hints */
  .keyboard-hints {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 0.75rem;
    padding: 0.35rem 0.5rem;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.6);
    pointer-events: none;
  }

  .keyboard-hints span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .keyboard-hints kbd {
    padding: 0.1rem 0.3rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.6rem;
  }

  /* Hide hints on small screens */
  @media (max-width: 600px) {
    .keyboard-hints {
      display: none;
    }

    .zoom-slider {
      width: 50px;
    }
  }
</style>
