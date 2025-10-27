<!--
SimplifiedOrientationControl.svelte - Always-visible orientation control for narrow screens

Research-backed design for 344px portrait (Z Fold):
- Zero interaction cost - all controls visible
- 44x44px touch targets
- 2x2 orientation grid always shown
- Current orientation prominently displayed
-->
<script lang="ts">
  import type { BeatData, IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  // Props
  const {
    color,
    currentBeatData,
    onOrientationChanged,
  } = $props<{
    color: "blue" | "red";
    currentBeatData: BeatData | null;
    onOrientationChanged: (color: string, orientation: string) => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  // Constants
  const orientations = ["in", "out", "clock", "counter"];

  // Derived values - Fixed: removed arrow functions to get actual values
  const displayLabel = $derived(color === "blue" ? "Left" : "Right");

  const currentOrientation = $derived.by(() => {
    if (!currentBeatData) return "";
    // Fixed: access motions.blue.startOrientation instead of .blueOrientation
    const motion = color === "blue"
      ? currentBeatData.motions?.blue
      : currentBeatData.motions?.red;
    return motion?.startOrientation ?? "";
  });

  // Handler
  function handleOrientationClick(orientation: string) {
    hapticService?.trigger("selection");
    onOrientationChanged(color, orientation);
  }

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });
</script>

<div
  class="simplified-orientation-control"
  class:blue={color === "blue"}
  class:red={color === "red"}
  data-testid={`simplified-orientation-control-${color}`}
>
  <!-- Header: Color label + Current orientation badge -->
  <div class="control-header">
    <div class="color-label">
      {displayLabel}
    </div>
    <div class="current-badge">
      {currentOrientation.toUpperCase()}
    </div>
  </div>

  <!-- Orientation grid - 2x2 layout, always visible -->
  <div class="orientation-grid">
    {#each orientations as orientation}
      <button
        class="orientation-btn"
        class:active={currentOrientation === orientation}
        onclick={() => handleOrientationClick(orientation)}
        aria-label={`Set ${displayLabel} orientation to ${orientation}`}
        type="button"
      >
        {orientation.toUpperCase()}
      </button>
    {/each}
  </div>
</div>

<style>
  .simplified-orientation-control {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    border: 3px solid;
    background: white;
    container-type: inline-size;
  }

  /* Color theming */
  .simplified-orientation-control.blue {
    border-color: #3b82f6;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, white 100%);
  }

  .simplified-orientation-control.red {
    border-color: #ef4444;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, white 100%);
  }

  /* Header */
  .control-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  /* Color label */
  .color-label {
    font-weight: 700;
    font-size: 16px;
    letter-spacing: 0.5px;
  }

  .simplified-orientation-control.blue .color-label {
    color: #3b82f6;
  }

  .simplified-orientation-control.red .color-label {
    color: #ef4444;
  }

  /* Current orientation badge */
  .current-badge {
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.08);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #333;
    white-space: nowrap;
  }

  /* Orientation grid - 2x2 layout */
  .orientation-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  /* Orientation buttons - 44x44px minimum touch target */
  .orientation-btn {
    min-height: 44px;
    padding: 12px;
    border-radius: 8px;
    border: 2px solid;
    background: white;
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .simplified-orientation-control.blue .orientation-btn {
    border-color: rgba(59, 130, 246, 0.3);
    color: #3b82f6;
  }

  .simplified-orientation-control.red .orientation-btn {
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .orientation-btn:hover {
    transform: scale(1.02);
  }

  .orientation-btn:active {
    transform: scale(0.98);
  }

  /* Active state */
  .simplified-orientation-control.blue .orientation-btn.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  .simplified-orientation-control.red .orientation-btn.active {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }

  /* Responsive adjustments for very narrow containers */
  @container (max-width: 300px) {
    .simplified-orientation-control {
      gap: 10px;
      padding: 10px 12px;
    }

    .color-label {
      font-size: 14px;
    }

    .current-badge {
      font-size: 11px;
      padding: 4px 8px;
    }

    .orientation-btn {
      font-size: 11px;
      padding: 10px;
    }
  }
</style>
