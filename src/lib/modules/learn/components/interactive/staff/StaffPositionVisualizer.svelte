<!--
StaffPositionVisualizer - Interactive grid showing staff prop orientations
Shows staffs positioned on the 4-point diamond grid with thumb end markers.
Demonstrates Alpha, Beta, Gamma positions with thumb orientations (in, out, mixed).
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$shared/inversify";
  import { TYPES } from "$shared/inversify/types";

  type HandPosition = "N" | "E" | "S" | "W";
  type ThumbOrientation = "in" | "out";
  type PositionType = "alpha" | "beta" | "gamma";
  type RotationType = "prospin" | "antispin" | "none";

  let {
    leftPosition = $bindable<HandPosition>("N"),
    rightPosition = $bindable<HandPosition>("S"),
    leftThumbOrientation = $bindable<ThumbOrientation>("in"),
    rightThumbOrientation = $bindable<ThumbOrientation>("in"),
    showLabels = true,
    highlightType = null as PositionType | null,
    showRotationPath = false,
    rotationType = "none" as RotationType,
    animating = false,
    interactive = false,
    onPositionChange,
  } = $props<{
    leftPosition?: HandPosition;
    rightPosition?: HandPosition;
    leftThumbOrientation?: ThumbOrientation;
    rightThumbOrientation?: ThumbOrientation;
    showLabels?: boolean;
    highlightType?: PositionType | null;
    showRotationPath?: boolean;
    rotationType?: RotationType;
    animating?: boolean;
    interactive?: boolean;
    onPositionChange?: (
      leftPos: HandPosition,
      rightPos: HandPosition,
      leftThumb: ThumbOrientation,
      rightThumb: ThumbOrientation
    ) => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  // Grid point coordinates (4-point diamond grid)
  const GRID_POINTS: Record<
    HandPosition,
    { x: number; y: number; label: string }
  > = {
    N: { x: 50, y: 15, label: "N" },
    E: { x: 85, y: 50, label: "E" },
    S: { x: 50, y: 85, label: "S" },
    W: { x: 15, y: 50, label: "W" },
  } as const;

  // Opposite point pairs (for Alpha detection)
  const OPPOSITE_PAIRS: Record<string, string> = {
    N: "S",
    S: "N",
    E: "W",
    W: "E",
  };

  // Adjacent point pairs (for Gamma detection - 90° apart)
  function areAdjacent(p1: string, p2: string): boolean {
    const points = ["N", "E", "S", "W"];
    const i1 = points.indexOf(p1);
    const i2 = points.indexOf(p2);
    const diff = Math.abs(i1 - i2);
    return diff === 1 || diff === 3; // 90° apart
  }

  // Determine current position type
  const currentPositionType: PositionType = $derived.by(() => {
    if (leftPosition === rightPosition) return "beta";
    if (OPPOSITE_PAIRS[leftPosition] === rightPosition) return "alpha";
    if (areAdjacent(leftPosition, rightPosition)) return "gamma";
    return "gamma";
  });

  // Position type colors
  const POSITION_COLORS: Record<PositionType, string> = {
    alpha: "#FF6B6B",
    beta: "#4ECDC4",
    gamma: "#FFE66D",
  };

  // Hand colors
  const LEFT_STAFF_COLOR = "#4A9EFF"; // Blue
  const RIGHT_STAFF_COLOR = "#FF4A9E"; // Pink/Red

  // Calculate staff endpoints based on position and thumb orientation
  function getStaffEndpoints(
    position: HandPosition,
    thumbOrientation: ThumbOrientation,
    isLeft: boolean
  ): {
    thumbX: number;
    thumbY: number;
    pinkyX: number;
    pinkyY: number;
    rotation: number;
  } {
    const point = GRID_POINTS[position];
    const center = { x: 50, y: 50 };

    // Staff length (from center to outer point)
    const staffLength = 35;

    // Calculate angle from center to hand position
    const angle = Math.atan2(point.y - center.y, point.x - center.x);

    // For thumb "in", the thumb end points toward center
    // For thumb "out", the thumb end points away from center
    const thumbTowardCenter = thumbOrientation === "in";

    // Calculate rotation in degrees for the staff
    let rotation = (angle * 180) / Math.PI;
    if (thumbTowardCenter) {
      rotation += 180;
    }

    // Calculate endpoints
    // Thumb end is at the center point, pinky end extends outward
    const thumbX = thumbTowardCenter
      ? center.x
      : center.x + Math.cos(angle) * staffLength;
    const thumbY = thumbTowardCenter
      ? center.y
      : center.y + Math.sin(angle) * staffLength;
    const pinkyX = thumbTowardCenter
      ? center.x + Math.cos(angle) * staffLength
      : center.x;
    const pinkyY = thumbTowardCenter
      ? center.y + Math.sin(angle) * staffLength
      : center.y;

    return { thumbX, thumbY, pinkyX, pinkyY, rotation };
  }

  const leftStaff = $derived(
    getStaffEndpoints(leftPosition, leftThumbOrientation, true)
  );
  const rightStaff = $derived(
    getStaffEndpoints(rightPosition, rightThumbOrientation, false)
  );

  function handlePointClick(point: HandPosition) {
    if (!interactive) return;
    hapticService?.trigger("selection");
    // For now, just log - could add hand selection logic similar to PositionVisualizer
  }

  // Get rotation path arc for prospin/antispin visualization
  function getRotationArc(isLeft: boolean): string {
    if (!showRotationPath || rotationType === "none") return "";

    const position = isLeft ? leftPosition : rightPosition;
    const point = GRID_POINTS[position as HandPosition];
    const center = { x: 50, y: 50 };

    // Arc radius
    const radius = 12;

    // Start and end angles for the arc
    const baseAngle = Math.atan2(point.y - center.y, point.x - center.x);
    const arcExtent = Math.PI / 2; // 90 degrees

    // Direction based on rotation type
    const clockwise = rotationType === "prospin";

    const startAngle = baseAngle - arcExtent / 2;
    const endAngle = baseAngle + arcExtent / 2;

    const startX =
      point.x + radius * Math.cos(clockwise ? startAngle : endAngle);
    const startY =
      point.y + radius * Math.sin(clockwise ? startAngle : endAngle);
    const endX = point.x + radius * Math.cos(clockwise ? endAngle : startAngle);
    const endY = point.y + radius * Math.sin(clockwise ? endAngle : startAngle);

    return `M ${startX} ${startY} A ${radius} ${radius} 0 0 ${clockwise ? 1 : 0} ${endX} ${endY}`;
  }

  // Rotation type colors
  const ROTATION_COLORS: Record<RotationType, string> = {
    prospin: "#22D3EE", // Cyan for prospin
    antispin: "#F97316", // Orange for antispin
    none: "transparent",
  };
</script>

<div class="staff-visualizer" class:interactive class:animating>
  <!-- Position type indicator -->
  {#if highlightType || currentPositionType}
    {@const type: PositionType = highlightType || currentPositionType}
    <div class="position-badge" style="--badge-color: {POSITION_COLORS[type]}">
      <span class="badge-icon">
        {#if type === "alpha"}
          <i class="fa-solid fa-arrows-left-right"></i>
        {:else if type === "beta"}
          <i class="fa-solid fa-circle-dot"></i>
        {:else}
          <i class="fa-solid fa-rotate-right"></i>
        {/if}
      </span>
      <span class="badge-text"
        >{type.charAt(0).toUpperCase() + type.slice(1)}</span
      >
    </div>
  {/if}

  <!-- Grid SVG -->
  <svg viewBox="0 0 100 100" class="staff-grid">
    <!-- Grid lines (subtle diamond shape) -->
    <g class="grid-lines" opacity="0.2">
      <line x1="50" y1="15" x2="85" y2="50" stroke="white" stroke-width="0.5" />
      <line x1="85" y1="50" x2="50" y2="85" stroke="white" stroke-width="0.5" />
      <line x1="50" y1="85" x2="15" y2="50" stroke="white" stroke-width="0.5" />
      <line x1="15" y1="50" x2="50" y2="15" stroke="white" stroke-width="0.5" />
    </g>

    <!-- Center point -->
    <circle
      cx="50"
      cy="50"
      r="3"
      fill="rgba(255, 255, 255, 0.4)"
      class="center-point"
    />

    <!-- Grid points -->
    {#each Object.entries(GRID_POINTS) as [key, point]}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_no_noninteractive_tabindex -->
      <g
        class="grid-point"
        class:clickable={interactive}
        onclick={() => handlePointClick(key as HandPosition)}
        role={interactive ? "button" : "img"}
        tabindex={interactive ? 0 : -1}
        aria-label={`Position ${key}`}
        onkeydown={(e: KeyboardEvent) =>
          (e.key === "Enter" || e.key === " ") &&
          handlePointClick(key as HandPosition)}
      >
        <!-- Base point -->
        <circle
          cx={point.x}
          cy={point.y}
          r="4"
          fill="rgba(255, 255, 255, 0.3)"
          class="outer-point"
        />

        <!-- Point label -->
        {#if showLabels}
          <text
            x={point.x}
            y={point.y + (point.y < 50 ? -10 : 16)}
            text-anchor="middle"
            class="point-label"
            fill="rgba(255, 255, 255, 0.5)"
            font-size="6"
            font-weight="600"
          >
            {point.label}
          </text>
        {/if}
      </g>
    {/each}

    <!-- Rotation path arcs -->
    {#if showRotationPath && rotationType !== "none"}
      <path
        d={getRotationArc(true)}
        fill="none"
        stroke={LEFT_STAFF_COLOR}
        stroke-width="2"
        stroke-dasharray="3 2"
        class="rotation-arc"
        marker-end="url(#arrowBlue)"
      />
      <path
        d={getRotationArc(false)}
        fill="none"
        stroke={RIGHT_STAFF_COLOR}
        stroke-width="2"
        stroke-dasharray="3 2"
        class="rotation-arc"
        marker-end="url(#arrowRed)"
      />

      <!-- Arrow markers -->
      <defs>
        <marker
          id="arrowBlue"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill={LEFT_STAFF_COLOR} />
        </marker>
        <marker
          id="arrowRed"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill={RIGHT_STAFF_COLOR} />
        </marker>
      </defs>
    {/if}

    <!-- Left Staff -->
    <g class="staff left-staff" class:animating>
      <!-- Staff body -->
      <line
        x1={leftStaff.thumbX}
        y1={leftStaff.thumbY}
        x2={leftStaff.pinkyX}
        y2={leftStaff.pinkyY}
        stroke={LEFT_STAFF_COLOR}
        stroke-width="4"
        stroke-linecap="round"
      />
      <!-- Thumb end marker (perpendicular line) -->
      {#if true}
        {@const thumbAngle = Math.atan2(
          leftStaff.pinkyY - leftStaff.thumbY,
          leftStaff.pinkyX - leftStaff.thumbX
        )}
        {@const perpAngle = thumbAngle + Math.PI / 2}
        {@const markerLen = 6}
        <line
          x1={leftStaff.thumbX - markerLen * Math.cos(perpAngle)}
          y1={leftStaff.thumbY - markerLen * Math.sin(perpAngle)}
          x2={leftStaff.thumbX + markerLen * Math.cos(perpAngle)}
          y2={leftStaff.thumbY + markerLen * Math.sin(perpAngle)}
          stroke={LEFT_STAFF_COLOR}
          stroke-width="3"
          stroke-linecap="round"
        />
        <!-- Thumb indicator label -->
        <text
          x={leftStaff.thumbX + 8 * Math.cos(perpAngle + Math.PI / 4)}
          y={leftStaff.thumbY + 8 * Math.sin(perpAngle + Math.PI / 4)}
          font-size="4"
          fill={LEFT_STAFF_COLOR}
          opacity="0.8"
        >
          T
        </text>
      {/if}
    </g>

    <!-- Right Staff -->
    <g class="staff right-staff" class:animating>
      <!-- Staff body -->
      <line
        x1={rightStaff.thumbX}
        y1={rightStaff.thumbY}
        x2={rightStaff.pinkyX}
        y2={rightStaff.pinkyY}
        stroke={RIGHT_STAFF_COLOR}
        stroke-width="4"
        stroke-linecap="round"
      />
      <!-- Thumb end marker (perpendicular line) -->
      {#if true}
        {@const thumbAngle = Math.atan2(
          rightStaff.pinkyY - rightStaff.thumbY,
          rightStaff.pinkyX - rightStaff.thumbX
        )}
        {@const perpAngle = thumbAngle + Math.PI / 2}
        {@const markerLen = 6}
        <line
          x1={rightStaff.thumbX - markerLen * Math.cos(perpAngle)}
          y1={rightStaff.thumbY - markerLen * Math.sin(perpAngle)}
          x2={rightStaff.thumbX + markerLen * Math.cos(perpAngle)}
          y2={rightStaff.thumbY + markerLen * Math.sin(perpAngle)}
          stroke={RIGHT_STAFF_COLOR}
          stroke-width="3"
          stroke-linecap="round"
        />
        <!-- Thumb indicator label -->
        <text
          x={rightStaff.thumbX + 8 * Math.cos(perpAngle + Math.PI / 4)}
          y={rightStaff.thumbY + 8 * Math.sin(perpAngle + Math.PI / 4)}
          font-size="4"
          fill={RIGHT_STAFF_COLOR}
          opacity="0.8"
        >
          T
        </text>
      {/if}
    </g>
  </svg>

  <!-- Thumb orientation legend -->
  <div class="thumb-legend">
    <div class="legend-item left">
      <div class="legend-color" style="background: {LEFT_STAFF_COLOR}"></div>
      <span>Left: {leftPosition}</span>
      <span class="thumb-label">Thumb {leftThumbOrientation}</span>
    </div>
    <div class="legend-item right">
      <div class="legend-color" style="background: {RIGHT_STAFF_COLOR}"></div>
      <span>Right: {rightPosition}</span>
      <span class="thumb-label">Thumb {rightThumbOrientation}</span>
    </div>
  </div>

  <!-- Rotation type indicator -->
  {#if showRotationPath && rotationType !== "none"}
    {@const activeRotation = rotationType as "prospin" | "antispin"}
    <div
      class="rotation-indicator"
      style="--rotation-color: {ROTATION_COLORS[activeRotation]}"
    >
      <i
        class="fa-solid {activeRotation === 'prospin'
          ? 'fa-sync-alt'
          : 'fa-retweet'}"
      ></i>
      <span>{activeRotation === "prospin" ? "Prospin" : "Antispin"}</span>
    </div>
  {/if}
</div>

<style>
  .staff-visualizer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
  }

  .staff-visualizer.interactive {
    border-color: rgba(74, 158, 255, 0.3);
  }

  /* Position badge */
  .position-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: color-mix(in srgb, var(--badge-color) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--badge-color) 40%, transparent);
    border-radius: 20px;
  }

  .badge-icon {
    color: var(--badge-color);
    font-size: 0.875rem;
  }

  .badge-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--badge-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Grid */
  .staff-grid {
    width: 100%;
    max-width: 280px;
    height: auto;
    aspect-ratio: 1;
  }

  .grid-point {
    cursor: default;
  }

  .grid-point.clickable {
    cursor: pointer;
  }

  .grid-point.clickable:hover .outer-point {
    fill: rgba(255, 255, 255, 0.6);
    transform: scale(1.2);
    transform-origin: center;
  }

  .outer-point {
    transition: all 0.2s ease;
  }

  .center-point {
    animation: centerPulse 2s ease-in-out infinite;
  }

  @keyframes centerPulse {
    0%,
    100% {
      opacity: 0.4;
      r: 3;
    }
    50% {
      opacity: 0.6;
      r: 4;
    }
  }

  .point-label {
    pointer-events: none;
    user-select: none;
  }

  /* Staff styling */
  .staff {
    transition: all 0.3s ease;
  }

  .staff.animating line {
    transition: all 0.5s ease;
  }

  .left-staff line {
    filter: drop-shadow(0 0 4px rgba(74, 158, 255, 0.5));
  }

  .right-staff line {
    filter: drop-shadow(0 0 4px rgba(255, 74, 158, 0.5));
  }

  /* Rotation arc */
  .rotation-arc {
    animation: dashMove 1s linear infinite;
  }

  @keyframes dashMove {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: 10;
    }
  }

  /* Legend */
  .thumb-legend {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }

  .thumb-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    padding: 0.125rem 0.5rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
  }

  /* Rotation indicator */
  .rotation-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: color-mix(in srgb, var(--rotation-color) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--rotation-color) 40%, transparent);
    border-radius: 8px;
    color: var(--rotation-color);
    font-size: 0.875rem;
    font-weight: 600;
  }

  @media (max-width: 400px) {
    .staff-visualizer {
      padding: 0.75rem;
    }

    .thumb-legend {
      flex-direction: column;
      gap: 0.5rem;
    }

    .legend-item {
      width: 100%;
      justify-content: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .center-point,
    .rotation-arc {
      animation: none;
    }

    .staff.animating line {
      transition: none;
    }
  }
</style>
