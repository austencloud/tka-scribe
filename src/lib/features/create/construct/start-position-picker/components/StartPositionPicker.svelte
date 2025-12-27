<!--
StartPositionPicker.svelte - Simplified version with advanced variations
Shows 3 start positions (Alpha, Beta, Gamma) with toggle to view all 16 variations
-->
<script lang="ts">
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import {
    createSimplifiedStartPositionState,
    type SimplifiedStartPositionState,
  } from "../state/start-position-state.svelte";
  import AdvancedStartPositionPicker from "./AdvancedStartPositionPicker.svelte";
  import PictographGrid from "./PictographGrid.svelte";
  import ConstructPickerHeader from "$lib/features/create/construct/shared/components/ConstructPickerHeader.svelte";

  // Props - receive navigation callbacks and layout detection
  const {
    startPositionState,
    onNavigateToAdvanced,
    onNavigateToDefault,
    isSideBySideLayout = () => false,
  } = $props<{
    startPositionState?: SimplifiedStartPositionState | null;
    onNavigateToAdvanced?: () => void;
    onNavigateToDefault?: () => void;
    isSideBySideLayout?: () => boolean;
  }>();

  // Create simplified state
  // svelte-ignore state_referenced_locally - intentional: one-time initialization with fallback
  const pickerState =
    startPositionState ?? createSimplifiedStartPositionState();

  // State for showing advanced picker
  let showAdvancedPicker = $state(false);

  // Track if animation is in progress
  let isAnimating = $state(false);

  // Services
  let hapticService: IHapticFeedback;

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  });

  // Expose state for parent components
  export function isShowingAdvanced() {
    return showAdvancedPicker;
  }

  export function goBackToDefault() {
    handleBackToDefault();
  }

  // Handle position selection
  async function handlePositionSelect(position: PictographData) {
    // Trigger selection haptic feedback for start position selection
    hapticService?.trigger("selection");

    await pickerState.selectPosition(position);
  }

  // Handle toggle between simple and advanced
  function handleToggleView(isAdvanced: boolean) {
    // Trigger haptic feedback
    hapticService?.trigger("selection");

    // Start animation
    isAnimating = true;

    if (isAdvanced) {
      showAdvancedPicker = true;
      pickerState.loadAllVariations(pickerState.currentGridMode);
      onNavigateToAdvanced?.();
    } else {
      showAdvancedPicker = false;
      onNavigateToDefault?.();
    }

    // End animation after transition completes
    setTimeout(() => {
      isAnimating = false;
    }, 600);
  }

  // Handle return to the default picker (exposed for external triggers)
  function handleBackToDefault() {
    // Trigger navigation haptic feedback for returning to default
    hapticService?.trigger("selection");
    handleToggleView(false);
  }

  // Handle grid mode change in advanced picker
  async function handleGridModeChange(gridMode: GridMode) {
    await pickerState.loadPositions(gridMode);
    await pickerState.loadAllVariations(gridMode);
  }
</script>

<div class="start-pos-picker" data-testid="start-position-picker">
  <ConstructPickerHeader
    variant="start"
    currentGridMode={pickerState.currentGridMode}
    isAdvanced={showAdvancedPicker}
    isSideBySideLayout={isSideBySideLayout()}
    onToggleAdvanced={handleToggleView}
    onGridModeChange={handleGridModeChange}
  />

  <!-- Use {#key} to ensure only one view exists at a time during transitions -->
  {#key showAdvancedPicker}
    <div
      class="picker-view"
      in:fade={{ duration: 250, delay: 250 }}
      out:fade={{ duration: 250 }}
    >
      {#if showAdvancedPicker}
        <!-- Advanced picker with all 16 variations -->
        <AdvancedStartPositionPicker
          pictographDataSet={pickerState.allVariations}
          selectedPictograph={pickerState.selectedPosition}
          currentGridMode={pickerState.currentGridMode}
          onPictographSelect={handlePositionSelect}
          {isSideBySideLayout}
        />
      {:else}
        <!-- Always show the pictograph grid - no loading/error states needed -->
        <div class="grid-container">
          <h2 class="start-position-title">Choose your start position</h2>
          <div class="grid-wrapper">
            <PictographGrid
              pictographDataSet={pickerState.positions}
              selectedPictograph={pickerState.selectedPosition}
              onPictographSelect={handlePositionSelect}
            />
          </div>
        </div>
      {/if}
    </div>
  {/key}
</div>

<style>
  .start-pos-picker {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    min-height: 300px;
    position: relative;
    container-type: inline-size;
  }

  .picker-view {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    position: relative;
  }

  .grid-container {
    width: 100%;
    flex: 1; /* Take full available space */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* Container for aspect-ratio detection */
    container-type: size;
    /* Add generous padding around the content */
    padding: clamp(24px, 5vmin, 48px);
    box-sizing: border-box;
    gap: clamp(16px, 3vmin, 32px);
  }

  .start-position-title {
    font-size: clamp(1.25rem, 3vmin, 1.75rem);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
    margin: 0;
    letter-spacing: 0.02em;
  }

  .grid-wrapper {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    container-type: size;
  }

  /* Traditional media queries as fallback */
  @media (max-width: 768px) {
    .start-pos-picker {
      padding: 16px 0;
    }
  }

  @media (max-width: 480px) {
    .start-pos-picker {
      padding: 12px 0;
    }
  }
</style>
