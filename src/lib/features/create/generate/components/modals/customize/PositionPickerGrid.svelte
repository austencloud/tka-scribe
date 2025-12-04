<!--
PositionPickerGrid.svelte - Compact 4x4 grid of all 16 start position variations
Uses IStartPositionService to load variations and displays actual pictographs
48px minimum touch targets for accessibility
-->
<script lang="ts">
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { IStartPositionService } from "$lib/features/create/construct/start-position-picker/services/contracts/IStartPositionService";
  import type { ISettingsState } from "$lib/shared/settings/services/contracts/ISettingsState";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";
  import { getLetterBorderColorSafe } from "$lib/shared/pictograph/shared/utils/letter-border-utils";

  let {
    currentPosition = null,
    onPositionChange,
  } = $props<{
    currentPosition: PictographData | null;
    onPositionChange: (position: PictographData | null) => void;
  }>();

  // State
  let variations = $state<PictographData[]>([]);
  let gridMode = $state<GridMode>(GridMode.DIAMOND);
  let hapticService: IHapticFeedbackService | null = $state(null);
  let isLoading = $state(true);

  onMount(async () => {
    try {
      // Load services
      hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
      const startPositionService = resolve<IStartPositionService>(TYPES.IStartPositionService);
      const settingsState = resolve<ISettingsState>(TYPES.ISettingsState);

      // Get current grid mode from settings
      gridMode = settingsState.currentSettings.gridMode || GridMode.DIAMOND;

      // Load all 16 variations
      variations = startPositionService.getAllStartPositionVariations(gridMode);
    } catch (error) {
      console.warn("PositionPickerGrid: Failed to load variations:", error);
    } finally {
      isLoading = false;
    }
  });

  // Group variations by position type for organized display
  const groupedVariations = $derived.by(() => {
    const groups = {
      alpha: [] as PictographData[],
      beta: [] as PictographData[],
      gamma: [] as PictographData[],
    };

    variations.forEach((v) => {
      const pos = v.startPosition?.toLowerCase() || "";
      if (pos.startsWith("alpha")) groups.alpha.push(v);
      else if (pos.startsWith("beta")) groups.beta.push(v);
      else if (pos.startsWith("gamma")) groups.gamma.push(v);
    });

    return groups;
  });

  function handleSelect(position: PictographData | null) {
    hapticService?.trigger("selection");
    onPositionChange(position);
  }

  function handleKeydown(e: KeyboardEvent, position: PictographData | null) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(position);
    }
  }

  // Check if a position is currently selected
  function isSelected(position: PictographData | null): boolean {
    if (!position && !currentPosition) return true; // "Any" selected
    if (!position || !currentPosition) return false;
    return position.id === currentPosition.id;
  }
</script>

<div class="position-picker-grid">
  <!-- "Any" option - clear selection -->
  <button
    class="any-button"
    class:selected={!currentPosition}
    onclick={() => handleSelect(null)}
    onkeydown={(e) => handleKeydown(e, null)}
    type="button"
    aria-label="Any position (no constraint)"
  >
    <span class="any-text">Any</span>
  </button>

  {#if isLoading}
    <div class="loading-placeholder">
      <span>Loading...</span>
    </div>
  {:else}
    <!-- All variations in a responsive grid -->
    <div class="variations-grid">
      {#each variations as position (position.id)}
        <button
          class="position-cell"
          class:selected={isSelected(position)}
          onclick={() => handleSelect(position)}
          onkeydown={(e) => handleKeydown(e, position)}
          type="button"
          style:--letter-border-color={getLetterBorderColorSafe(position.letter)}
          aria-label="Select position {position.startPosition}"
        >
          <div class="pictograph-wrapper">
            <Pictograph pictographData={position} />
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .position-picker-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 8px 0;
  }

  .any-button {
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .any-button:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .any-button:active {
    transform: scale(0.98);
  }

  .any-button.selected {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
  }

  .loading-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }

  .variations-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 4px;
  }

  .position-cell {
    aspect-ratio: 1 / 1;
    min-width: 48px;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.06);
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    padding: 4px;
    transition: all 0.2s ease;
    overflow: hidden;
  }

  .position-cell:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.02);
  }

  .position-cell:active {
    transform: scale(0.96);
  }

  .position-cell.selected {
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--letter-border-color, rgba(100, 200, 255, 0.8));
    box-shadow: 0 0 12px rgba(100, 200, 255, 0.25);
  }

  .pictograph-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pictograph-wrapper :global(.pictograph) {
    width: 100%;
    height: 100%;
  }

  .pictograph-wrapper :global(.pictograph svg) {
    width: 100%;
    height: 100%;
  }

  /* Smaller gap on mobile */
  @media (max-width: 380px) {
    .variations-grid {
      gap: 6px;
    }

    .position-cell {
      padding: 2px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .any-button,
    .position-cell {
      transition: none;
    }
  }
</style>
