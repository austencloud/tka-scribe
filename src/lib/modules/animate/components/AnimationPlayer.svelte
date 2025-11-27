<!--
AnimationPlayer.svelte

Self-contained animation playback component that can be used anywhere in the app.
Takes a SequenceData and renders an animated beat-by-beat preview with play/pause controls.

This uses a simple "slideshow" approach that cycles through beats at a configurable BPM,
avoiding complex animation state and Svelte reactivity issues.
-->
<script lang="ts">
  import { onMount, untrack } from "svelte";
  import type { SequenceData, BeatData } from "$shared";

  // Props
  let {
    sequenceData,
    autoPlay = false,
    showControls = true,
    loop = true,
    bpm = 60,
  }: {
    sequenceData: SequenceData | null;
    autoPlay?: boolean;
    showControls?: boolean;
    loop?: boolean;
    bpm?: number;
  } = $props();

  // UI state (minimal reactivity - only for display)
  let isPlaying = $state(false);
  let currentBeatIndex = $state(0);
  let totalBeats = $state(0);
  let canvasElement: HTMLCanvasElement | null = $state(null);

  // Non-reactive state for animation loop (plain JS variables)
  let animationIntervalId: ReturnType<typeof setInterval> | null = null;
  let beats: BeatData[] = [];
  let beatDurationMs = 1000; // Default 60 BPM = 1 beat per second

  // Calculate beat duration from BPM
  $effect(() => {
    beatDurationMs = 60000 / bpm;
  });

  // Initialize when sequence changes
  $effect(() => {
    const seq = sequenceData;
    untrack(() => {
      stopAnimation();
      currentBeatIndex = 0;

      if (seq?.beats && seq.beats.length > 0) {
        beats = [...seq.beats];
        totalBeats = beats.length;

        // Draw initial beat
        requestAnimationFrame(() => drawCurrentBeat());

        if (autoPlay) {
          startAnimation();
        }
      } else {
        beats = [];
        totalBeats = 0;
      }
    });
  });

  // Cleanup on unmount
  onMount(() => {
    return () => {
      stopAnimation();
    };
  });

  function startAnimation() {
    if (animationIntervalId !== null || beats.length === 0) return;

    isPlaying = true;

    animationIntervalId = setInterval(() => {
      // Advance to next beat
      const nextIndex = currentBeatIndex + 1;

      if (nextIndex >= beats.length) {
        if (loop) {
          currentBeatIndex = 0;
        } else {
          stopAnimation();
          return;
        }
      } else {
        currentBeatIndex = nextIndex;
      }

      drawCurrentBeat();
    }, beatDurationMs);
  }

  function stopAnimation() {
    if (animationIntervalId !== null) {
      clearInterval(animationIntervalId);
      animationIntervalId = null;
    }
    isPlaying = false;
  }

  function togglePlayback() {
    if (isPlaying) {
      stopAnimation();
    } else {
      startAnimation();
    }
  }

  function drawCurrentBeat() {
    if (!canvasElement || beats.length === 0) return;

    const ctx = canvasElement.getContext("2d");
    if (!ctx) return;

    const beat = beats[currentBeatIndex];
    if (!beat) return;

    // Get canvas dimensions
    const width = canvasElement.width;
    const height = canvasElement.height;

    // Clear canvas with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    drawGrid(ctx, width, height);

    // Draw props from beat data
    const blueMotion = beat.motions?.blue;
    if (blueMotion) {
      drawPropFromMotion(ctx, blueMotion, "#3b82f6", width, height);
    }
    const redMotion = beat.motions?.red;
    if (redMotion) {
      drawPropFromMotion(ctx, redMotion, "#ef4444", width, height);
    }
  }

  function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const centerX = width / 2;
    const centerY = height / 2;
    const gridSize = Math.min(width, height) * 0.35;

    ctx.fillStyle = "#1a1a1a";

    // Diamond grid points
    const points = [
      { x: centerX, y: centerY - gridSize }, // top (n)
      { x: centerX + gridSize, y: centerY }, // right (e)
      { x: centerX, y: centerY + gridSize }, // bottom (s)
      { x: centerX - gridSize, y: centerY }, // left (w)
      { x: centerX, y: centerY }, // center
    ];

    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPropFromMotion(
    ctx: CanvasRenderingContext2D,
    motion: any,
    color: string,
    width: number,
    height: number
  ) {
    const centerX = width / 2;
    const centerY = height / 2;
    const gridSize = Math.min(width, height) * 0.35;
    const propLength = gridSize * 0.8;

    // Get end position from motion
    const endPos = motion.endPosition ?? motion.startPosition;
    if (!endPos) return;

    // Map position to coordinates
    const pos = getPositionCoordinates(endPos, centerX, centerY, gridSize);

    // Get rotation from motion (simplified)
    const rotation = getRotationAngle(motion);

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw the prop (staff style)
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(-propLength / 2, 0);
    ctx.lineTo(propLength / 2, 0);
    ctx.stroke();

    // Draw end circles
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(-propLength / 2, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(propLength / 2, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function getPositionCoordinates(
    position: string,
    centerX: number,
    centerY: number,
    gridSize: number
  ): { x: number; y: number } {
    // Map position names to coordinates on diamond grid
    const posMap: Record<string, { x: number; y: number }> = {
      n: { x: centerX, y: centerY - gridSize },
      ne: { x: centerX + gridSize * 0.7, y: centerY - gridSize * 0.7 },
      e: { x: centerX + gridSize, y: centerY },
      se: { x: centerX + gridSize * 0.7, y: centerY + gridSize * 0.7 },
      s: { x: centerX, y: centerY + gridSize },
      sw: { x: centerX - gridSize * 0.7, y: centerY + gridSize * 0.7 },
      w: { x: centerX - gridSize, y: centerY },
      nw: { x: centerX - gridSize * 0.7, y: centerY - gridSize * 0.7 },
      center: { x: centerX, y: centerY },
    };

    // Handle compound positions like "n_ne", "s_sw"
    const lowerPos = position.toLowerCase();
    if (posMap[lowerPos]) {
      return posMap[lowerPos];
    }

    // Try splitting compound position
    const parts = lowerPos.split("_");
    const part0 = parts[0];
    const part1 = parts[1];
    if (parts.length === 2 && part0 && part1 && posMap[part0] && posMap[part1]) {
      const p1 = posMap[part0];
      const p2 = posMap[part1];
      return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };
    }

    // Default to center
    return { x: centerX, y: centerY };
  }

  function getRotationAngle(motion: any): number {
    // Get rotation based on end orientation or motion type
    const orientation = motion.endOrientation ?? motion.startOrientation;

    const orientationAngles: Record<string, number> = {
      in: 45,
      out: 225,
      clock: 135,
      counter: 315,
      n: 90,
      e: 0,
      s: 270,
      w: 180,
    };

    if (orientation) {
      const angle = orientationAngles[orientation.toLowerCase()];
      if (angle !== undefined) {
        return angle;
      }
    }

    return 0;
  }

  // Handle canvas sizing
  function setupCanvas() {
    if (!canvasElement) return;

    const container = canvasElement.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    const dpr = window.devicePixelRatio || 1;

    canvasElement.width = size * dpr;
    canvasElement.height = size * dpr;
    canvasElement.style.width = `${size}px`;
    canvasElement.style.height = `${size}px`;

    drawCurrentBeat();
  }

  // Setup canvas on mount and resize
  $effect(() => {
    if (!canvasElement) return;

    setupCanvas();

    const resizeObserver = new ResizeObserver(() => {
      setupCanvas();
    });

    const container = canvasElement.parentElement;
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<div class="animation-player">
  {#if !sequenceData || totalBeats === 0}
    <div class="player-placeholder">
      <i class="fas fa-film"></i>
      <span>No sequence to animate</span>
    </div>
  {:else}
    <div class="canvas-container">
      <canvas
        bind:this={canvasElement}
        class="animation-canvas"
      ></canvas>

      {#if showControls}
        <div class="player-controls">
          <button
            class="play-button"
            onclick={togglePlayback}
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
          >
            <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}"></i>
          </button>

          <div class="beat-indicator">
            {currentBeatIndex + 1} / {totalBeats}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .animation-player {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.05) 100%);
    border-radius: 12px;
    overflow: hidden;
  }

  .canvas-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .animation-canvas {
    border-radius: 8px;
    background: white;
  }

  .player-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 24px;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
  }

  .player-placeholder i {
    font-size: 32px;
    opacity: 0.5;
  }

  .player-controls {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 10;
  }

  .play-button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
  }

  .play-button:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
  }

  .play-button:active {
    transform: scale(0.95);
  }

  .play-button i {
    margin-left: 2px;
  }

  .play-button i.fa-pause {
    margin-left: 0;
  }

  .beat-indicator {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    min-width: 50px;
    text-align: center;
  }
</style>
