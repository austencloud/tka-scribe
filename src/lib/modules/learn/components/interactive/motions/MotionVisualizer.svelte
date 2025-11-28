<!--
MotionVisualizer - Animated visualization of hand motions on 4-point diamond grid
Shows shift (adjacent), dash (opposite), and static (stay) motions with animated arrows
-->
<script lang="ts">
import type { IHapticFeedbackService } from "$shared/application/services/contracts/IHapticFeedbackService";
  import { onMount } from "svelte";
import { resolve } from "$shared/inversify";
import { TYPES } from "$shared/inversify/types";

  type HandPosition = "N" | "E" | "S" | "W";
  type MotionType = "shift" | "dash" | "static";
  type MotionTypeNumber = 1 | 2 | 3 | 4 | 5 | 6;

  let {
    leftStart = "N" as HandPosition,
    leftEnd = "E" as HandPosition,
    rightStart = "S" as HandPosition,
    rightEnd = "W" as HandPosition,
    leftMotion = "shift" as MotionType,
    rightMotion = "shift" as MotionType,
    motionType = 1 as MotionTypeNumber,
    autoPlay = false,
    showLabels = true,
    showMotionType = true,
  } = $props<{
    leftStart?: HandPosition;
    leftEnd?: HandPosition;
    rightStart?: HandPosition;
    rightEnd?: HandPosition;
    leftMotion?: MotionType;
    rightMotion?: MotionType;
    motionType?: MotionTypeNumber;
    autoPlay?: boolean;
    showLabels?: boolean;
    showMotionType?: boolean;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  // 4-point diamond grid coordinates
  const GRID_POINTS: Record<HandPosition, { x: number; y: number }> = {
    N: { x: 50, y: 15 },
    E: { x: 85, y: 50 },
    S: { x: 50, y: 85 },
    W: { x: 15, y: 50 },
  };

  // Motion type names and colors
  const MOTION_TYPE_INFO: Record<MotionTypeNumber, { name: string; color: string; description: string }> = {
    1: { name: "Dual-Shift", color: "#22D3EE", description: "Both hands shift to adjacent points" },
    2: { name: "Shift", color: "#4ADE80", description: "One hand shifts, one stays still" },
    3: { name: "Cross-Shift", color: "#F472B6", description: "One hand shifts, one dashes" },
    4: { name: "Dash", color: "#FB923C", description: "One hand dashes, one stays still" },
    5: { name: "Dual-Dash", color: "#A78BFA", description: "Both hands dash to opposite points" },
    6: { name: "Static", color: "#94A3B8", description: "Both hands remain still" },
  };

  // Motion colors
  const MOTION_COLORS: Record<MotionType, string> = {
    shift: "#4ADE80",
    dash: "#FB923C",
    static: "#94A3B8",
  };

  const LEFT_HAND_COLOR = "#4A9EFF";
  const RIGHT_HAND_COLOR = "#FF4A9E";

  // Animation state
  let animating = $state(false);
  let animationProgress = $state(0);
  let hasPlayed = $state(false);

  // Interpolate position during animation
  function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  // Get current position based on animation progress
  const leftCurrentPos = $derived.by(() => {
    const lStart = leftStart as HandPosition;
    const lEnd = leftEnd as HandPosition;
    if (!animating || animationProgress === 0) {
      return GRID_POINTS[lStart];
    }
    if (animationProgress >= 1) {
      return GRID_POINTS[lEnd];
    }
    const start = GRID_POINTS[lStart];
    const end = GRID_POINTS[lEnd];
    return {
      x: lerp(start.x, end.x, animationProgress),
      y: lerp(start.y, end.y, animationProgress),
    };
  });

  const rightCurrentPos = $derived.by(() => {
    const rStart = rightStart as HandPosition;
    const rEnd = rightEnd as HandPosition;
    if (!animating || animationProgress === 0) {
      return GRID_POINTS[rStart];
    }
    if (animationProgress >= 1) {
      return GRID_POINTS[rEnd];
    }
    const start = GRID_POINTS[rStart];
    const end = GRID_POINTS[rEnd];
    return {
      x: lerp(start.x, end.x, animationProgress),
      y: lerp(start.y, end.y, animationProgress),
    };
  });

  // Animation function
  function playAnimation() {
    if (animating) return;

    animating = true;
    animationProgress = 0;
    hasPlayed = true;
    hapticService?.trigger("selection");

    const duration = 800;
    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-in-out curve
      animationProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        animationProgress = 1;
        animating = false;
      }
    }

    requestAnimationFrame(animate);
  }

  // Auto-play on mount if enabled - use onMount pattern to avoid reactive loops
  onMount(() => {
    if (autoPlay) {
      const timer = setTimeout(playAnimation, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  });

  // Calculate arrow path for motion indicator
  function getArrowPath(startPos: HandPosition, endPos: HandPosition): string {
    const start = GRID_POINTS[startPos];
    const end = GRID_POINTS[endPos];

    if (startPos === endPos) return "";

    // Calculate direction
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len;
    const ny = dy / len;

    // Offset start/end to not overlap with hand circles
    const offsetStart = { x: start.x + nx * 8, y: start.y + ny * 8 };
    const offsetEnd = { x: end.x - nx * 8, y: end.y - ny * 8 };

    return `M${offsetStart.x},${offsetStart.y} L${offsetEnd.x},${offsetEnd.y}`;
  }

  // Get label offset based on position
  function getLabelOffset(key: string): { x: number; y: number } {
    if (key === "N") return { x: 0, y: -8 };
    if (key === "S") return { x: 0, y: 12 };
    if (key === "E") return { x: 10, y: 0 };
    if (key === "W") return { x: -10, y: 0 };
    return { x: 0, y: 0 };
  }
</script>

<div class="motion-visualizer">
  <!-- Motion type badge -->
  {#if showMotionType}
    {@const typeNum = motionType as MotionTypeNumber}
    <div class="motion-badge" style="--badge-color: {MOTION_TYPE_INFO[typeNum].color}">
      <span class="badge-number">Type {typeNum}</span>
      <span class="badge-name">{MOTION_TYPE_INFO[typeNum].name}</span>
    </div>
  {/if}

  <!-- Grid SVG -->
  <svg viewBox="0 0 100 100" class="motion-grid">
    <!-- Grid diamond -->
    <polygon
      points="50,15 85,50 50,85 15,50"
      fill="none"
      stroke="rgba(255, 255, 255, 0.15)"
      stroke-width="0.5"
    />

    <!-- Grid lines -->
    <line x1="50" y1="15" x2="50" y2="85" stroke="rgba(255, 255, 255, 0.1)" stroke-width="0.5" />
    <line x1="15" y1="50" x2="85" y2="50" stroke="rgba(255, 255, 255, 0.1)" stroke-width="0.5" />

    <!-- Arrow markers -->
    <defs>
      <marker id="arrow-left" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <polygon points="0,0 6,3 0,6" fill={LEFT_HAND_COLOR} opacity="0.7" />
      </marker>
      <marker id="arrow-right" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <polygon points="0,0 6,3 0,6" fill={RIGHT_HAND_COLOR} opacity="0.7" />
      </marker>
    </defs>

    <!-- Motion arrows (show before animation or during) -->
    {#if !animating || animationProgress < 1}
      <!-- Left hand arrow -->
      {#if leftMotion !== "static"}
        <path
          d={getArrowPath(leftStart as HandPosition, leftEnd as HandPosition)}
          stroke={LEFT_HAND_COLOR}
          stroke-width="1.5"
          fill="none"
          opacity="0.5"
          stroke-dasharray="3 2"
          marker-end="url(#arrow-left)"
        />
      {/if}

      <!-- Right hand arrow -->
      {#if rightMotion !== "static"}
        <path
          d={getArrowPath(rightStart as HandPosition, rightEnd as HandPosition)}
          stroke={RIGHT_HAND_COLOR}
          stroke-width="1.5"
          fill="none"
          opacity="0.5"
          stroke-dasharray="3 2"
          marker-end="url(#arrow-right)"
        />
      {/if}
    {/if}

    <!-- Grid points -->
    {#each Object.entries(GRID_POINTS) as [key, point]}
      {@const labelOffset = getLabelOffset(key)}
      <g class="grid-point">
        <circle
          cx={point.x}
          cy={point.y}
          r="3"
          fill="rgba(255, 255, 255, 0.25)"
        />
        {#if showLabels}
          <text
            x={point.x + labelOffset.x}
            y={point.y + labelOffset.y}
            text-anchor="middle"
            fill="rgba(255, 255, 255, 0.4)"
            font-size="5"
            font-weight="600"
          >
            {key}
          </text>
        {/if}
      </g>
    {/each}

    <!-- Center point -->
    <circle cx="50" cy="50" r="2" fill="rgba(255, 255, 255, 0.15)" />

    <!-- Hand positions -->
    {#if true}
      {@const leftPos = leftCurrentPos}
      {@const rightPos = rightCurrentPos}

      <!-- Left hand glow and point -->
      <circle
        cx={leftPos.x}
        cy={leftPos.y}
        r="10"
        fill={LEFT_HAND_COLOR}
        opacity="0.2"
        class="hand-glow"
      />
      <circle
        cx={leftPos.x}
        cy={leftPos.y}
        r="6"
        fill={LEFT_HAND_COLOR}
        class="hand-point"
      />

      <!-- Right hand glow and point -->
      <circle
        cx={rightPos.x}
        cy={rightPos.y}
        r="10"
        fill={RIGHT_HAND_COLOR}
        opacity="0.2"
        class="hand-glow"
      />
      <circle
        cx={rightPos.x}
        cy={rightPos.y}
        r="6"
        fill={RIGHT_HAND_COLOR}
        class="hand-point"
      />
    {/if}
  </svg>

  <!-- Motion legend -->
  {#if true}
    {@const leftMotionType = leftMotion as MotionType}
    {@const rightMotionType = rightMotion as MotionType}
    <div class="motion-legend">
      <div class="legend-item" style="--motion-color: {MOTION_COLORS[leftMotionType]}">
        <div class="legend-dot" style="background: {LEFT_HAND_COLOR}"></div>
        <span class="legend-label">Left:</span>
        <span class="legend-motion">{leftMotionType}</span>
      </div>
      <div class="legend-item" style="--motion-color: {MOTION_COLORS[rightMotionType]}">
        <div class="legend-dot" style="background: {RIGHT_HAND_COLOR}"></div>
        <span class="legend-label">Right:</span>
        <span class="legend-motion">{rightMotionType}</span>
      </div>
    </div>
  {/if}

  <!-- Play button -->
  <button class="play-button" onclick={playAnimation} disabled={animating}>
    {#if animating}
      <i class="fa-solid fa-spinner fa-spin"></i>
      Playing...
    {:else if animationProgress >= 1}
      <i class="fa-solid fa-redo"></i>
      Replay
    {:else}
      <i class="fa-solid fa-play"></i>
      Play Motion
    {/if}
  </button>
</div>

<style>
  .motion-visualizer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
  }

  /* Motion badge */
  .motion-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: color-mix(in srgb, var(--badge-color) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--badge-color) 40%, transparent);
    border-radius: 20px;
  }

  .badge-number {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--badge-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--badge-color);
  }

  /* Grid */
  .motion-grid {
    width: 100%;
    max-width: 260px;
    height: auto;
    aspect-ratio: 1;
  }

  .hand-glow {
    animation: pulseGlow 2s ease-in-out infinite;
  }

  @keyframes pulseGlow {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.35; }
  }

  .hand-point {
    filter: drop-shadow(0 0 4px currentColor);
    transition: all 0.05s linear;
  }

  /* Motion legend */
  .motion-legend {
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .legend-label {
    color: rgba(255, 255, 255, 0.5);
  }

  .legend-motion {
    font-weight: 600;
    color: var(--motion-color);
    text-transform: capitalize;
  }

  /* Play button */
  .play-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
    border: 1px solid rgba(34, 211, 238, 0.4);
    border-radius: 10px;
    color: #22D3EE;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;
  }

  .play-button:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%);
    border-color: rgba(34, 211, 238, 0.6);
  }

  .play-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 400px) {
    .motion-visualizer {
      padding: 1rem;
    }

    .motion-legend {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hand-glow {
      animation: none;
    }
  }
</style>
