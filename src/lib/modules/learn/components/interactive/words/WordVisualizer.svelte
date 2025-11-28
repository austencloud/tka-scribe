<!--
WordVisualizer - Shows a TKA word as an animated letter sequence
Displays letters transitioning smoothly on the grid with motion arrows
-->
<script lang="ts">
import type { IHapticFeedbackService } from "$shared/application/services/contracts/IHapticFeedbackService";
import { resolve } from "$shared/inversify";
import { TYPES } from "$shared/inversify/types";
  import { untrack } from "svelte";

  type HandPosition = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
  type PositionType = "alpha" | "beta" | "gamma";
  type MotionType = "pro" | "anti" | "hybrid";

  // Letter definition with start/end positions and motion types
  interface LetterDefinition {
    letter: string;
    startLeft: HandPosition;
    startRight: HandPosition;
    endLeft: HandPosition;
    endRight: HandPosition;
    leftMotion: MotionType;
    rightMotion: MotionType;
    description?: string;
  }

  let {
    letters = [],
    currentBeatIndex = 0,
    isAnimating = false,
    animationSpeed = 1000,
    showLetterLabel = true,
    showBeatNumber = true,
    compact = false,
    onBeatChange,
  } = $props<{
    letters: LetterDefinition[];
    currentBeatIndex?: number;
    isAnimating?: boolean;
    animationSpeed?: number;
    showLetterLabel?: boolean;
    showBeatNumber?: boolean;
    compact?: boolean;
    onBeatChange?: (index: number) => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  // Grid point coordinates (8-point grid)
  const GRID_POINTS: Record<HandPosition, { x: number; y: number; label: string }> = {
    N: { x: 50, y: 12, label: "N" },
    NE: { x: 82, y: 22, label: "NE" },
    E: { x: 92, y: 50, label: "E" },
    SE: { x: 82, y: 78, label: "SE" },
    S: { x: 50, y: 88, label: "S" },
    SW: { x: 18, y: 78, label: "SW" },
    W: { x: 8, y: 50, label: "W" },
    NW: { x: 18, y: 22, label: "NW" },
  } as const;

  // Colors
  const LEFT_HAND_COLOR = "#4A9EFF";  // Blue
  const RIGHT_HAND_COLOR = "#FF4A9E"; // Pink/Red

  // Animation state
  let animationProgress = $state(0); // 0 to 1 for current beat transition
  let animationInterval: number | undefined;

  // Derived state for current beat display
  const currentLetter = $derived(() => {
    if (letters.length === 0) return null;
    return letters[Math.min(currentBeatIndex, letters.length - 1)] ?? null;
  });

  // Interpolate position during animation
  function interpolatePosition(start: HandPosition, end: HandPosition, progress: number) {
    const startPoint = GRID_POINTS[start];
    const endPoint = GRID_POINTS[end];
    return {
      x: startPoint.x + (endPoint.x - startPoint.x) * progress,
      y: startPoint.y + (endPoint.y - startPoint.y) * progress,
    };
  }

  // Get current hand positions (interpolated during animation)
  const leftHandPos = $derived((): { x: number; y: number; label?: string } => {
    const letter = currentLetter();
    if (!letter) return GRID_POINTS.N;
    if (animationProgress < 1 && animationProgress > 0) {
      return interpolatePosition(letter.startLeft, letter.endLeft, animationProgress);
    }
    return GRID_POINTS[letter.endLeft as HandPosition];
  });

  const rightHandPos = $derived((): { x: number; y: number; label?: string } => {
    const letter = currentLetter();
    if (!letter) return GRID_POINTS.S;
    if (animationProgress < 1 && animationProgress > 0) {
      return interpolatePosition(letter.startRight, letter.endRight, animationProgress);
    }
    return GRID_POINTS[letter.endRight as HandPosition];
  });

  // Detect position type
  function getPositionType(left: HandPosition, right: HandPosition): PositionType {
    if (left === right) return "beta";
    const opposites: Record<string, string> = {
      N: "S", S: "N", E: "W", W: "E",
      NE: "SW", SW: "NE", NW: "SE", SE: "NW",
    };
    if (opposites[left] === right) return "alpha";
    return "gamma";
  }

  const POSITION_COLORS: Record<PositionType, string> = {
    alpha: "#FF6B6B",
    beta: "#4ECDC4",
    gamma: "#FFE66D",
  };

  // Generate motion arrow path
  function getMotionArrowPath(
    startPos: HandPosition,
    endPos: HandPosition,
    motionType: MotionType,
    isLeft: boolean
  ): string {
    const start = GRID_POINTS[startPos];
    const end = GRID_POINTS[endPos];

    if (startPos === endPos) return ""; // No motion

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    // Calculate control point offset based on motion type
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const perpX = -dy * 0.3;
    const perpY = dx * 0.3;

    // Pro curves one way, anti curves the other
    const direction = motionType === "pro" ? 1 : motionType === "anti" ? -1 : 0;
    const controlX = midX + perpX * direction;
    const controlY = midY + perpY * direction;

    return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
  }

  // Animation control - use untrack to prevent infinite loops
  function startAnimation() {
    if (animationInterval) return;

    const frameInterval = 50; // Update every 50ms
    const totalFrames = animationSpeed / frameInterval;
    let frame = 0;

    // Capture current values to avoid reactive dependencies in interval
    const lettersLength = letters.length;
    const beatChangeCallback = onBeatChange;

    animationInterval = setInterval(() => {
      frame++;
      animationProgress = frame / totalFrames;

      if (frame >= totalFrames) {
        // Move to next beat
        animationProgress = 0;
        frame = 0;
        // Use untrack to read currentBeatIndex without creating dependency
        const currentIdx = untrack(() => currentBeatIndex);
        const nextIndex = (currentIdx + 1) % lettersLength;
        beatChangeCallback?.(nextIndex);
      }
    }, frameInterval) as unknown as number;
  }

  function stopAnimation() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = undefined;
    }
    animationProgress = 0;
  }

  // Track previous isAnimating value to detect changes
  let prevIsAnimating = false;

  // Watch for animation state changes
  $effect(() => {
    const shouldAnimate = isAnimating;

    // Only act on changes
    if (shouldAnimate !== prevIsAnimating) {
      prevIsAnimating = shouldAnimate;

      if (shouldAnimate) {
        startAnimation();
      } else {
        stopAnimation();
      }
    }

    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = undefined;
      }
    };
  });

  // Manual beat navigation
  function goToBeat(index: number) {
    hapticService?.trigger("selection");
    onBeatChange?.(index);
    animationProgress = 0;
  }
</script>

<div class="word-visualizer" class:compact>
  <!-- Letter label -->
  {#if showLetterLabel && currentLetter()}
    {@const letter = currentLetter()!}
    <div class="letter-label">
      <span class="letter-name">{letter.letter}</span>
      {#if letter.description}
        <span class="letter-desc">{letter.description}</span>
      {/if}
    </div>
  {/if}

  <!-- Grid SVG -->
  <svg viewBox="0 0 100 100" class="word-grid">
    <!-- Grid lines (subtle) -->
    <g class="grid-lines" opacity="0.12">
      <line x1="50" y1="12" x2="50" y2="88" stroke="white" stroke-width="0.5" />
      <line x1="8" y1="50" x2="92" y2="50" stroke="white" stroke-width="0.5" />
      <line x1="18" y1="22" x2="82" y2="78" stroke="white" stroke-width="0.5" />
      <line x1="82" y1="22" x2="18" y2="78" stroke="white" stroke-width="0.5" />
    </g>

    <!-- Grid points (empty markers) -->
    {#each Object.entries(GRID_POINTS) as [key, point]}
      <circle
        cx={point.x}
        cy={point.y}
        r="2.5"
        fill="rgba(255, 255, 255, 0.2)"
        class="grid-marker"
      />
    {/each}

    <!-- Motion arrows -->
    {#if currentLetter()}
      {@const letter = currentLetter()!}

      <!-- Left hand motion arrow -->
      {#if letter.startLeft !== letter.endLeft}
        <path
          d={getMotionArrowPath(letter.startLeft, letter.endLeft, letter.leftMotion, true)}
          stroke={LEFT_HAND_COLOR}
          stroke-width="2"
          fill="none"
          opacity="0.6"
          stroke-linecap="round"
          class="motion-arrow"
        />
      {/if}

      <!-- Right hand motion arrow -->
      {#if letter.startRight !== letter.endRight}
        <path
          d={getMotionArrowPath(letter.startRight, letter.endRight, letter.rightMotion, false)}
          stroke={RIGHT_HAND_COLOR}
          stroke-width="2"
          fill="none"
          opacity="0.6"
          stroke-linecap="round"
          class="motion-arrow"
        />
      {/if}
    {/if}

    <!-- Hand positions -->
    {#if true}
      {@const leftPos = leftHandPos()}
      {@const rightPos = rightHandPos()}
      {@const areSamePos = Math.abs(leftPos.x - rightPos.x) < 5 && Math.abs(leftPos.y - rightPos.y) < 5}

      {#if areSamePos}
      <!-- Both hands at same position (Beta) -->
      <circle
        cx={leftPos.x}
        cy={leftPos.y}
        r="10"
        fill={POSITION_COLORS.beta}
        opacity="0.25"
        class="hand-glow"
      />
      <circle cx={leftPos.x - 3} cy={leftPos.y} r="5" fill={LEFT_HAND_COLOR} class="hand-point" />
      <circle cx={leftPos.x + 3} cy={leftPos.y} r="5" fill={RIGHT_HAND_COLOR} class="hand-point" />
    {:else}
      <!-- Left hand -->
      <circle
        cx={leftPos.x}
        cy={leftPos.y}
        r="8"
        fill={LEFT_HAND_COLOR}
        opacity="0.25"
        class="hand-glow"
      />
      <circle cx={leftPos.x} cy={leftPos.y} r="5" fill={LEFT_HAND_COLOR} class="hand-point" />

      <!-- Right hand -->
      <circle
        cx={rightPos.x}
        cy={rightPos.y}
        r="8"
        fill={RIGHT_HAND_COLOR}
        opacity="0.25"
        class="hand-glow"
      />
      <circle cx={rightPos.x} cy={rightPos.y} r="5" fill={RIGHT_HAND_COLOR} class="hand-point" />

      <!-- Connection line -->
      <line
        x1={leftPos.x}
        y1={leftPos.y}
        x2={rightPos.x}
        y2={rightPos.y}
        stroke="rgba(255, 255, 255, 0.2)"
        stroke-width="1"
        stroke-dasharray="3 2"
        class="connection-line"
      />
      {/if}
    {/if}

    <!-- Center point -->
    <circle cx="50" cy="50" r="2" fill="rgba(255, 255, 255, 0.15)" />
  </svg>

  <!-- Beat navigation dots -->
  {#if letters.length > 1}
    <div class="beat-navigation">
      {#each letters as letter, i}
        <button
          class="beat-dot"
          class:active={i === currentBeatIndex}
          onclick={() => goToBeat(i)}
          aria-label="Beat {i + 1}: {letter.letter}"
        >
          {#if showBeatNumber}
            <span class="beat-number">{i + 1}</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .word-visualizer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
  }

  .word-visualizer.compact {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  /* Letter label */
  .letter-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .letter-name {
    font-size: 1.75rem;
    font-weight: 800;
    color: white;
    line-height: 1;
  }

  .compact .letter-name {
    font-size: 1.25rem;
  }

  .letter-desc {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Grid */
  .word-grid {
    width: 100%;
    max-width: 240px;
    height: auto;
    aspect-ratio: 1;
  }

  .compact .word-grid {
    max-width: 160px;
  }

  .hand-point {
    filter: drop-shadow(0 0 4px currentColor);
    transition: all 0.1s ease-out;
  }

  .hand-glow {
    animation: handPulse 2s ease-in-out infinite;
  }

  @keyframes handPulse {
    0%, 100% { opacity: 0.25; }
    50% { opacity: 0.4; }
  }

  .motion-arrow {
    animation: arrowDraw 1s ease-out;
  }

  @keyframes arrowDraw {
    from {
      stroke-dasharray: 100;
      stroke-dashoffset: 100;
    }
    to {
      stroke-dasharray: 100;
      stroke-dashoffset: 0;
    }
  }

  .connection-line {
    animation: dashMove 1.5s linear infinite;
  }

  @keyframes dashMove {
    from { stroke-dashoffset: 0; }
    to { stroke-dashoffset: 10; }
  }

  /* Beat navigation */
  .beat-navigation {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .beat-dot {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .compact .beat-dot {
    width: 24px;
    height: 24px;
    font-size: 0.625rem;
  }

  .beat-dot:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: scale(1.1);
  }

  .beat-dot.active {
    background: rgba(34, 211, 238, 0.25);
    border-color: rgba(34, 211, 238, 0.6);
    color: #22D3EE;
  }

  .beat-number {
    line-height: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .hand-glow,
    .motion-arrow,
    .connection-line {
      animation: none;
    }
  }
</style>
