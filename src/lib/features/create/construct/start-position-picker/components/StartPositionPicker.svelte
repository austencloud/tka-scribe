<!--
StartPositionPicker.svelte - Simplified version with advanced variations
Shows 3 start positions (Alpha, Beta, Gamma) with toggle to view all 16 variations
Controls moved below the grid for better UX
-->
<script lang="ts">
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import { scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import {
    createSimplifiedStartPositionState,
    type SimplifiedStartPositionState,
  } from "../state/start-position-state.svelte";
  import AdvancedStartPositionPicker from "./AdvancedStartPositionPicker.svelte";
  import PictographGrid from "./PictographGrid.svelte";

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

  // Create simplified state - use $derived to handle prop changes
  const pickerState = $derived(
    startPositionState ?? createSimplifiedStartPositionState()
  );

  // State for showing advanced picker
  let showAdvancedPicker = $state(false);

  // Services
  let hapticService: IHapticFeedback;

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(TYPES.IHapticFeedback);
  });

  // Derived labels for action-oriented toggles
  const viewModeLabel = $derived(showAdvancedPicker ? "Simple" : "All Variations");
  const gridModeLabel = $derived(
    pickerState.currentGridMode === GridMode.DIAMOND ? "Box" : "Diamond"
  );

  // Expose state for parent components
  export function isShowingAdvanced() {
    return showAdvancedPicker;
  }

  export function goBackToDefault() {
    handleBackToDefault();
  }

  // Handle position selection
  async function handlePositionSelect(position: PictographData) {
    hapticService?.trigger("selection");
    await pickerState.selectPosition(position);
  }

  // Handle toggle between simple and advanced
  function handleToggleView() {
    hapticService?.trigger("selection");

    if (!showAdvancedPicker) {
      showAdvancedPicker = true;
      pickerState.loadAllVariations(pickerState.currentGridMode);
      onNavigateToAdvanced?.();
    } else {
      showAdvancedPicker = false;
      onNavigateToDefault?.();
    }
  }

  // Handle return to the default picker (exposed for external triggers)
  function handleBackToDefault() {
    hapticService?.trigger("selection");
    if (showAdvancedPicker) {
      handleToggleView();
    }
  }

  // Handle grid mode change
  async function handleGridModeToggle() {
    hapticService?.trigger("selection");
    const newMode =
      pickerState.currentGridMode === GridMode.DIAMOND
        ? GridMode.BOX
        : GridMode.DIAMOND;
    await pickerState.loadPositions(newMode);
    await pickerState.loadAllVariations(newMode);
  }
</script>

<div class="start-pos-picker" data-testid="start-position-picker">
  <!-- Shared header - outside animated content for consistent positioning -->
  <header class="picker-header">
    <!-- Undo button slot (positioned by parent via floating-undo-wrapper) -->
    <div class="header-left"></div>
    <h2 class="start-position-title">Choose your start position</h2>
    <div class="header-right"></div>
  </header>

  <!-- Animated transition container - keyed on view mode AND grid mode -->
  <div class="picker-view">
    {#key `${showAdvancedPicker}-${pickerState.currentGridMode}`}
      <div
        class="picker-content"
        in:scale={{ start: 0.92, duration: 300, delay: 150, easing: cubicOut }}
        out:scale={{ start: 0.92, duration: 200, easing: cubicOut }}
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
          <!-- Simple 3-position grid -->
          <div class="grid-container">
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

  <!-- Controls Footer - below grid -->
  <div class="controls-footer">
    <button
      class="control-button"
      onclick={handleToggleView}
      aria-label={`Show ${viewModeLabel}`}
    >
      <svg
        class="control-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        {#if showAdvancedPicker}
          <!-- Minimize icon -->
          <polyline points="4 14 10 14 10 20" />
          <polyline points="20 10 14 10 14 4" />
          <line x1="14" y1="10" x2="21" y2="3" />
          <line x1="3" y1="21" x2="10" y2="14" />
        {:else}
          <!-- Grid/expand icon -->
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        {/if}
      </svg>
      <span class="control-label">{viewModeLabel}</span>
    </button>

    <button
      class="control-button"
      onclick={handleGridModeToggle}
      aria-label={`Switch to ${gridModeLabel} grid`}
    >
      <svg
        class="control-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        {#if pickerState.currentGridMode === GridMode.DIAMOND}
          <!-- Box icon -->
          <rect x="3" y="3" width="18" height="18" rx="2" />
        {:else}
          <!-- Diamond icon -->
          <polygon points="12 2 22 12 12 22 2 12" />
        {/if}
      </svg>
      <span class="control-label">{gridModeLabel}</span>
    </button>
  </div>
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

  /* ============================================
     Header - Title with space for undo button
     ============================================ */
  .picker-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(12px, 2.5vmin, 20px) clamp(16px, 3vmin, 24px);
    flex-shrink: 0;
  }

  .header-left,
  .header-right {
    /* Reserve space for undo button (48px touch target + padding) */
    width: 56px;
    flex-shrink: 0;
  }

  .start-position-title {
    flex: 1;
    font-size: clamp(1.25rem, 3vmin, 1.75rem);
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    text-align: center;
    margin: 0;
    letter-spacing: 0.02em;
  }

  /* ============================================
     Picker View - Animated content area
     ============================================ */
  .picker-view {
    flex: 1;
    width: 100%;
    position: relative;
    min-height: 0;
    overflow: hidden;
  }

  /* Absolute positioning allows smooth crossfade without layout overlap */
  .picker-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
  }

  .grid-container {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    container-type: size;
    padding: clamp(8px, 2vmin, 16px) clamp(16px, 4vmin, 40px);
    box-sizing: border-box;
  }

  .grid-wrapper {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    container-type: size;
    min-height: 0;
  }

  /* ============================================
     Controls Footer - in layout flow
     ============================================ */
  .controls-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: clamp(12px, 3vmin, 24px);
    padding: clamp(12px, 2vmin, 16px) clamp(16px, 3vmin, 32px);
    background: transparent;
    flex-shrink: 0;
  }

  .control-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    /* Touch target */
    min-height: var(--min-touch-target, 48px);
    padding: 10px 20px;

    /* Theme-aware styling */
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;

    /* Typography */
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    letter-spacing: 0.3px;

    /* Interaction */
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    /* Smooth transitions */
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.15s ease,
      box-shadow 0.2s ease;
  }

  .control-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    opacity: 0.8;
  }

  .control-label {
    white-space: nowrap;
  }

  /* Hover state */
  @media (hover: hover) {
    .control-button:hover {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
      border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
      transform: translateY(-1px);
      box-shadow: 0 4px 12px var(--theme-shadow, rgba(0, 0, 0, 0.2));
    }

    .control-button:hover .control-icon {
      opacity: 1;
    }
  }

  /* Active/pressed state */
  .control-button:active {
    transform: translateY(0) scale(0.98);
    transition: transform 0.1s ease;
  }

  /* Focus state */
  .control-button:focus-visible {
    outline: 2px solid var(--theme-accent, #818cf8);
    outline-offset: 2px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .control-button {
      transition: none;
    }

    .control-button:hover {
      transform: none;
    }
  }

  /* Mobile responsive */
  @media (max-width: 480px) {
    .controls-footer {
      gap: 8px;
      padding: 10px 12px;
    }

    .control-button {
      padding: 8px 14px;
      font-size: var(--font-size-compact, 13px);
    }

    .control-icon {
      width: 16px;
      height: 16px;
    }
  }
</style>
