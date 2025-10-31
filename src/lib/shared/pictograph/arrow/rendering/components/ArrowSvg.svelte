<!--
Simple Arrow Component - Just renders an arrow with provided data
Now with click interaction and selection visual feedback
-->
<script lang="ts">
  import type { MotionData, PictographData, IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import type { ArrowAssets, ArrowPosition } from "$shared/pictograph/arrow";
  import { selectedArrowState } from "$build/shared/state/selected-arrow-state.svelte";

  let {
    motionData,
    arrowAssets,
    arrowPosition,
    shouldMirror = false,
    showArrow = true,
    color,
    pictographData = null,
    isClickable = false,
  } = $props<{
    motionData: MotionData;
    arrowAssets: ArrowAssets;
    arrowPosition: ArrowPosition;
    shouldMirror?: boolean;
    showArrow?: boolean;
    color: string;
    pictographData?: PictographData | null;
    isClickable?: boolean;
  }>();

  // Check if this arrow is currently selected
  const isSelected = $derived(
    isClickable && pictographData
      ? selectedArrowState.isSelected(motionData, color)
      : false
  );

  let hapticService: IHapticFeedbackService | null = null;

  // Initialize haptic service on mount (lazy load)
  $effect(() => {
    if (isClickable && !hapticService) {
      try {
        hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
      } catch (error) {
        console.warn('Haptic service not available:', error);
      }
    }
  });

  // Handle arrow click
  function handleArrowClick(event: MouseEvent) {
    if (!isClickable || !pictographData) return;

    event.stopPropagation();

    // Trigger haptic feedback
    hapticService?.trigger('selection');

    // Select the arrow in global state
    selectedArrowState.selectArrow(motionData, color, pictographData);
  }
</script>

{#if showArrow}
  <g
    transform="
      translate({arrowPosition.x}, {arrowPosition.y})
      rotate({arrowPosition.rotation})
      {shouldMirror ? 'scale(-1, 1)' : ''}
    "
    class="arrow-svg {motionData.color}-arrow-svg"
    class:mirrored={shouldMirror}
    class:clickable={isClickable}
    class:selected={isSelected}
    onclick={handleArrowClick}
    role={isClickable ? "button" : null}
    tabindex={isClickable ? 0 : -1}
    aria-label={isClickable ? `${color} arrow - ${motionData.motion} ${motionData.turns}` : undefined}
  >
    <!-- Position group at calculated coordinates, let SVG handle its own centering -->
    <g transform="translate({-arrowAssets.center.x}, {-arrowAssets.center.y})">
      {@html arrowAssets.imageSrc}
    </g>

    <!-- Selection highlight overlay -->
    {#if isSelected}
      <circle
        cx="0"
        cy="0"
        r="60"
        fill="none"
        stroke="var(--color-accent, #fbbf24)"
        stroke-width="4"
        class="selection-glow"
        opacity="0.8"
      />
    {/if}
  </g>
{/if}

<style>
  .arrow-svg {
    pointer-events: none;
    transition: all 0.2s ease;
  }

  .arrow-svg.clickable {
    pointer-events: all;
    cursor: pointer;
  }

  .arrow-svg.clickable:hover {
    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
    transform: scale(1.05);
  }

  .arrow-svg.clickable:active {
    transform: scale(0.98);
  }

  .arrow-svg.selected {
    filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.9));
  }

  .selection-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% {
      opacity: 0.6;
      stroke-width: 4;
    }
    50% {
      opacity: 1;
      stroke-width: 6;
    }
  }
</style>
