<!--
GridPositionButton.svelte - Individual position button in the 3x3 grid

Displays a position label (N, E, S, W, NE, SE, SW, NW, or C for center)
Supports enabled/disabled states and highlights current position.
-->
<script lang="ts">
  import { GridLocation } from "$shared/pictograph/grid/domain/enums/grid-enums";

  const { position, enabled, isCurrent, onSelect } = $props<{
    position: GridLocation,
    enabled: boolean,
    isCurrent: boolean,
    onSelect: (_: GridLocation) => void
  }>();

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
    min-width: 48px;
    min-height: 48px;

    /* Typography */
    font-size: 16px;
    font-weight: 600;

    /* Base styling */
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Enabled state */
  .grid-position-button.enabled {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.4);
    color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
  }

  /* Disabled state */
  .grid-position-button.disabled {
    background: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.2);
    cursor: not-allowed;
    opacity: 0.4;
  }

  /* Current position highlight */
  .grid-position-button.current {
    box-shadow:
      0 0 0 3px rgba(6, 182, 212, 0.4),
      0 0 20px rgba(6, 182, 212, 0.3);
    border-color: rgba(6, 182, 212, 0.8);
    transform: scale(1.05);
  }

  /* Hover effects */
  @media (hover: hover) {
    .grid-position-button.enabled:hover:not(.current) {
      transform: scale(1.08);
      background: rgba(59, 130, 246, 0.25);
      border-color: rgba(59, 130, 246, 0.6);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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

  /* Current indicator (pulsing ring) */
  .current-indicator {
    position: absolute;
    inset: -6px;
    border: 2px solid rgba(6, 182, 212, 0.6);
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
