<script lang="ts">
  /**
   * SpeedCurveEditor - Visual editor for speed ramping curves
   *
   * Allows creating custom speed curves for clips with:
   * - Preset curves (ease-in, ease-out, bounce, etc.)
   * - Visual curve preview
   * - Speed value at any point
   *
   * Note: This is a simplified implementation for the stretch goal.
   * Full bezier curve editing would require additional work.
   */

  import { getTimelineState } from "../state/timeline-state.svelte";
  import type {
    SpeedCurvePreset,
    TimelineClip,
  } from "../domain/timeline-types";

  interface Props {
    clipId: string;
    onClose: () => void;
  }

  let { clipId, onClose }: Props = $props();

  function getState() {
    return getTimelineState();
  }

  // Local reactive state
  let clip = $state<
    ReturnType<typeof getState>["allClips"][number] | undefined
  >(undefined);

  // Sync from timeline state
  $effect(() => {
    clip = getState().allClips.find((c) => c.id === clipId);
  });

  // Available presets
  const PRESETS: {
    id: SpeedCurvePreset;
    name: string;
    icon: string;
    description: string;
  }[] = [
    {
      id: "linear",
      name: "Linear",
      icon: "fa-arrow-right",
      description: "Constant speed",
    },
    {
      id: "ease-in",
      name: "Ease In",
      icon: "fa-arrow-right-to-arc",
      description: "Slow start, fast finish",
    },
    {
      id: "ease-out",
      name: "Ease Out",
      icon: "fa-arrow-left-from-arc",
      description: "Fast start, slow finish",
    },
    {
      id: "ease-in-out",
      name: "Ease In/Out",
      icon: "fa-arrows-left-right",
      description: "Smooth acceleration and deceleration",
    },
    {
      id: "bounce",
      name: "Bounce",
      icon: "fa-basketball",
      description: "Bouncy effect at end",
    },
    {
      id: "elastic",
      name: "Elastic",
      icon: "fa-wave-square",
      description: "Springy overshoot",
    },
  ];

  // Current selection
  let selectedPreset = $state<SpeedCurvePreset | null>(null);
  let previewSpeed = $state<number>(1);
  let hoverPosition = $state<number | null>(null);

  // Canvas for curve preview
  let canvasEl: HTMLCanvasElement;

  // Calculate speed at a position using selected preset
  function calculateSpeed(position: number, preset: SpeedCurvePreset): number {
    const baseSpeed = clip?.playbackRate ?? 1;

    switch (preset) {
      case "linear":
        return baseSpeed;

      case "ease-in":
        // Quadratic ease in
        return baseSpeed * position * position;

      case "ease-out":
        // Quadratic ease out
        return baseSpeed * (1 - (1 - position) * (1 - position));

      case "ease-in-out":
        // Smooth S-curve
        return position < 0.5
          ? baseSpeed * 2 * position * position
          : baseSpeed * (1 - Math.pow(-2 * position + 2, 2) / 2);

      case "bounce":
        // Bounce effect
        const n1 = 7.5625;
        const d1 = 2.75;
        let t = position;
        if (t < 1 / d1) {
          return baseSpeed * n1 * t * t;
        } else if (t < 2 / d1) {
          return baseSpeed * (n1 * (t -= 1.5 / d1) * t + 0.75);
        } else if (t < 2.5 / d1) {
          return baseSpeed * (n1 * (t -= 2.25 / d1) * t + 0.9375);
        } else {
          return baseSpeed * (n1 * (t -= 2.625 / d1) * t + 0.984375);
        }

      case "elastic":
        // Elastic overshoot
        const c4 = (2 * Math.PI) / 3;
        return position === 0
          ? 0
          : position === 1
            ? baseSpeed
            : baseSpeed *
                Math.pow(2, -10 * position) *
                Math.sin((position * 10 - 0.75) * c4) +
              baseSpeed;

      default:
        return baseSpeed;
    }
  }

  // Draw curve preview
  function drawCurve() {
    if (!canvasEl || !selectedPreset) return;

    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const width = canvasEl.width;
    const height = canvasEl.height;
    const baseSpeed = clip?.playbackRate ?? 1;
    const maxSpeed = baseSpeed * 2;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    // Horizontal grid (speed levels)
    for (let i = 0; i <= 4; i++) {
      const y = (i / 4) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical grid (time positions)
    for (let i = 0; i <= 4; i++) {
      const x = (i / 4) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw baseline (1x speed)
    const baselineY = height - (baseSpeed / maxSpeed) * height;
    ctx.strokeStyle = "rgba(74, 158, 255, 0.3)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, baselineY);
    ctx.lineTo(width, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw curve
    ctx.strokeStyle = "#4a9eff";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x <= width; x++) {
      const position = x / width;
      const speed = calculateSpeed(position, selectedPreset);
      const y = height - (speed / maxSpeed) * height;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw hover position
    if (hoverPosition !== null) {
      const hoverX = hoverPosition * width;
      const hoverSpeed = calculateSpeed(hoverPosition, selectedPreset);
      const hoverY = height - (hoverSpeed / maxSpeed) * height;

      // Vertical line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, height);
      ctx.stroke();

      // Point
      ctx.fillStyle = "#4a9eff";
      ctx.beginPath();
      ctx.arc(hoverX, hoverY, 5, 0, Math.PI * 2);
      ctx.fill();

      previewSpeed = hoverSpeed;
    }
  }

  // Redraw on changes
  $effect(() => {
    if (selectedPreset) {
      drawCurve();
    }
  });

  // Handle canvas mouse move
  function handleCanvasMouseMove(e: MouseEvent) {
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    hoverPosition = (e.clientX - rect.left) / rect.width;
    drawCurve();
  }

  function handleCanvasMouseLeave() {
    hoverPosition = null;
    drawCurve();
  }

  // Apply curve to clip (simplified: just stores preset name)
  function applyPreset(preset: SpeedCurvePreset) {
    selectedPreset = preset;
    // In a full implementation, this would update the clip's speedCurve property
    console.log(
      `🎢 Speed curve preset "${preset}" selected for clip ${clipId}`
    );
  }
</script>

<div class="speed-curve-editor">
  <div class="editor-header">
    <div class="header-title">
      <i class="fa-solid fa-bezier-curve"></i>
      <span>Speed Curves</span>
    </div>
    <button class="close-btn" onclick={onClose}>
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>

  <div class="editor-content">
    <!-- Preset selection -->
    <div class="presets-section">
      <h4>Curve Presets</h4>
      <div class="presets-grid">
        {#each PRESETS as preset}
          <button
            class="preset-card"
            class:selected={selectedPreset === preset.id}
            onclick={() => applyPreset(preset.id)}
          >
            <i class="fa-solid {preset.icon}"></i>
            <span class="preset-name">{preset.name}</span>
            <span class="preset-desc">{preset.description}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Curve preview -->
    {#if selectedPreset}
      <div class="preview-section">
        <h4>Curve Preview</h4>
        <div class="canvas-wrapper">
          <canvas
            bind:this={canvasEl}
            width="260"
            height="120"
            onmousemove={handleCanvasMouseMove}
            onmouseleave={handleCanvasMouseLeave}
          ></canvas>
          <div class="axis-labels">
            <span class="label y-max"
              >{((clip?.playbackRate ?? 1) * 2).toFixed(1)}x</span
            >
            <span class="label y-min">0x</span>
            <span class="label x-min">Start</span>
            <span class="label x-max">End</span>
          </div>
        </div>

        {#if hoverPosition !== null}
          <div class="hover-info">
            <span>Position: {Math.round(hoverPosition * 100)}%</span>
            <span>Speed: {previewSpeed.toFixed(2)}x</span>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Info -->
    <div class="info-box">
      <i class="fa-solid fa-info-circle"></i>
      <p>
        Speed curves allow the playback speed to change over the clip duration.
        Select a preset above to see how speed varies from start to end.
      </p>
    </div>
  </div>
</div>

<style>
  .speed-curve-editor {
    width: 300px;
    background: var(--theme-panel-bg, rgba(20, 20, 20, 0.98));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }

  .editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .header-title i {
    opacity: 0.7;
  }

  .close-btn {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .close-btn:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .editor-content {
    padding: 14px;
  }

  .presets-section h4,
  .preview-section h4 {
    margin: 0 0 10px 0;
    font-size: var(--font-size-compact, 12px);
    font-weight: 600;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.7));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .presets-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }

  .preset-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 8px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .preset-card:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.2));
  }

  .preset-card.selected {
    background: rgba(74, 158, 255, 0.15);
    border-color: var(--theme-accent, #4a9eff);
  }

  .preset-card i {
    font-size: 16px;
    color: var(--theme-accent, #4a9eff);
    margin-bottom: 6px;
  }

  .preset-name {
    font-size: 11px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    margin-bottom: 2px;
  }

  .preset-desc {
    font-size: 9px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    text-align: center;
    line-height: 1.3;
  }

  .preview-section {
    margin-bottom: 14px;
  }

  .canvas-wrapper {
    position: relative;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100%;
    cursor: crosshair;
  }

  .axis-labels {
    position: absolute;
    inset: 0;
    pointer-events: none;
    font-size: 9px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.4));
  }

  .axis-labels .label {
    position: absolute;
  }

  .y-max {
    top: 4px;
    left: 4px;
  }
  .y-min {
    bottom: 4px;
    left: 4px;
  }
  .x-min {
    bottom: 4px;
    left: 4px;
  }
  .x-max {
    bottom: 4px;
    right: 4px;
  }

  .hover-info {
    display: flex;
    justify-content: space-between;
    padding: 6px 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    margin-top: 6px;
    font-size: 10px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.7));
  }

  .info-box {
    display: flex;
    gap: 8px;
    padding: 10px;
    background: rgba(74, 158, 255, 0.1);
    border: 1px solid rgba(74, 158, 255, 0.2);
    border-radius: 6px;
    font-size: 11px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.7));
    line-height: 1.4;
  }

  .info-box i {
    color: var(--theme-accent, #4a9eff);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .info-box p {
    margin: 0;
  }
</style>
