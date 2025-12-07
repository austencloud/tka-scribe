<!--
OrientationPickerGrid.svelte - 2x2 grid for selecting prop orientation
Shows all 4 orientations: in, out, clock, counter
50px touch targets for accessibility
-->
<script lang="ts">
  import { Orientation } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  let { currentOrientation = null, onOrientationChange } = $props<{
    currentOrientation: Orientation | null;
    onOrientationChange: (orientation: Orientation | null) => void;
  }>();

  let hapticService: IHapticFeedbackService | null = null;

  onMount(() => {
    hapticService = tryResolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Orientation options with display info
  const orientationOptions: Array<{
    value: Orientation;
    label: string;
    icon: string;
    description: string;
  }> = [
    {
      value: Orientation.IN,
      label: "In",
      icon: "↓",
      description: "Facing inward",
    },
    {
      value: Orientation.OUT,
      label: "Out",
      icon: "↑",
      description: "Facing outward",
    },
    {
      value: Orientation.CLOCK,
      label: "Clock",
      icon: "↻",
      description: "Clockwise",
    },
    {
      value: Orientation.COUNTER,
      label: "Counter",
      icon: "↺",
      description: "Counter-clockwise",
    },
  ];

  function handleSelect(orientation: Orientation) {
    hapticService?.trigger("selection");
    // Toggle off if already selected
    if (currentOrientation === orientation) {
      onOrientationChange(null);
    } else {
      onOrientationChange(orientation);
    }
  }

  function handleClear() {
    hapticService?.trigger("selection");
    onOrientationChange(null);
  }
</script>

<div class="orientation-picker-grid">
  <div class="grid">
    {#each orientationOptions as option (option.value)}
      <button
        class="orientation-cell"
        class:selected={currentOrientation === option.value}
        onclick={() => handleSelect(option.value)}
        aria-label="{option.label}: {option.description}"
        title={option.description}
        type="button"
      >
        <span class="orientation-icon">{option.icon}</span>
        <span class="orientation-label">{option.label}</span>
      </button>
    {/each}
  </div>

  {#if currentOrientation !== null}
    <button class="clear-button" onclick={handleClear} type="button">
      Clear Selection
    </button>
  {/if}
</div>

<style>
  .orientation-picker-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .orientation-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 80px;
    padding: 16px 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .orientation-cell:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  .orientation-cell:active {
    transform: translateY(0);
    background: rgba(255, 255, 255, 0.15);
  }

  .orientation-cell.selected {
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.25),
      rgba(139, 92, 246, 0.25)
    );
    border-color: rgba(139, 92, 246, 0.6);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.25);
  }

  .orientation-cell:focus-visible {
    outline: 2px solid rgba(139, 92, 246, 0.8);
    outline-offset: 2px;
  }

  .orientation-icon {
    font-size: 28px;
    line-height: 1;
  }

  .orientation-label {
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .clear-button {
    min-height: 52px;
    padding: 12px 24px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 12px;
    color: rgba(239, 68, 68, 0.9);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-button:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .clear-button:active {
    transform: scale(0.98);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .orientation-cell,
    .clear-button {
      transition: none;
    }

    .orientation-cell:hover {
      transform: none;
    }
  }
</style>
