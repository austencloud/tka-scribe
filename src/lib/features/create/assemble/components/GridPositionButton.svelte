<!--
GridPositionButton.svelte - Individual position button in the 3x3 grid

Displays a position label (N, E, S, W, NE, SE, SW, NW, or C for center)
Supports enabled/disabled states and highlights current position.
-->
<script lang="ts">
  import { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";

  const { position, enabled, isCurrent, onSelect } = $props<{
    position: GridLocation;
    enabled: boolean;
    isCurrent: boolean;
    onSelect: (position: GridLocation) => void;
  }>();

  // Resolve haptic feedback service
  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  // Map GridLocation to display label
  const positionLabels: Record<GridLocation, string> = {
    [GridLocation.NORTH]: "N",
    [GridLocation.EAST]: "E",
    [GridLocation.SOUTH]: "S",
    [GridLocation.WEST]: "W",
    [GridLocation.NORTHEAST]: "NE",
    [GridLocation.SOUTHEAST]: "SE",
    [GridLocation.SOUTHWEST]: "SW",
    [GridLocation.NORTHWEST]: "NW",
  };

  const label = positionLabels[position as GridLocation] ?? "?";

  function handleClick() {
    if (enabled) {
      hapticService?.trigger("selection");
      onSelect(position);
    }
  }
</script>

<button
  class="grid-position-button"
  class:enabled
  class:disabled={!enabled}
  class:current={isCurrent}
  disabled={!enabled}
  onclick={handleClick}
  aria-label={`Position ${label}`}
  aria-pressed={isCurrent}
>
  <span class="label">{label}</span>
  {#if isCurrent}
    <div class="current-indicator"></div>
  {/if}
</button>

<style>
  .grid-position-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    /* Size */
    width: 100%;
    height: 100%;
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);

    /* Typography */
    font-size: 16px;
    font-weight: 600;

    /* Base styling - themed */
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  /* Enabled state - themed accent with subtle blue tint */
  .grid-position-button.enabled {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border-color: var(--theme-accent, rgba(99, 102, 241, 0.5));
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    box-shadow: 0 0 12px var(--theme-shadow, rgba(99, 102, 241, 0.15));
  }

  /* Disabled state - themed */
  .grid-position-button.disabled {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.05));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.2));
    cursor: not-allowed;
    opacity: 0.4;
  }

  /* Current position highlight - themed accent */
  .grid-position-button.current {
    box-shadow:
      0 0 0 3px var(--theme-accent, rgba(99, 102, 241, 0.4)),
      0 0 20px var(--theme-shadow, rgba(99, 102, 241, 0.25));
    border-color: var(--theme-accent-strong, rgba(99, 102, 241, 0.8));
    transform: scale(1.05);
  }

  /* Hover effects */
  @media (hover: hover) {
    .grid-position-button.enabled:hover:not(.current) {
      transform: scale(1.08);
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
      border-color: var(--theme-accent-strong, rgba(99, 102, 241, 0.7));
      box-shadow: 0 4px 12px var(--theme-shadow, rgba(99, 102, 241, 0.25));
    }
  }

  .grid-position-button.enabled:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }

  /* Label */
  .label {
    position: relative;
    z-index: 1;
  }

  /* Current indicator (pulsing ring) - themed */
  .current-indicator {
    position: absolute;
    inset: -6px;
    border: 2px solid var(--theme-accent, rgba(99, 102, 241, 0.6));
    border-radius: 12px;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    pointer-events: none;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .grid-position-button,
    .current-indicator {
      transition: none;
      animation: none;
    }
  }
</style>
