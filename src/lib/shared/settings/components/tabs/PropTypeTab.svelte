<!-- PropTypeTab.svelte - Prop type selection with CatDog Mode -->
<script lang="ts">
  import type { AppSettings, IHapticFeedbackService } from "$shared";
  import { resolve, TYPES, PropType } from "$shared";
  import { onMount } from "svelte";
  import { PropTypeButton, getAllPropTypes } from "./prop-type";

  let { settings, onUpdate } = $props<{
    settings: AppSettings;
    onUpdate?: (event: { key: string; value: unknown }) => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Get all available prop types from the registry
  const propTypes = getAllPropTypes();

  // Current selections - default to STAFF if not set
  let selectedBluePropType = $state(settings.bluePropType || settings.propType || PropType.STAFF);
  let selectedRedPropType = $state(settings.redPropType || settings.propType || PropType.STAFF);

  // CatDog Mode: false = both hands same, true = separate blue/red selection
  // Load from settings to persist between sessions
  let catDogMode = $state(settings.catDogMode ?? false);

  // Watch for settings changes and update local state
  $effect(() => {
    const newCatDogMode = settings.catDogMode ?? false;
    if (newCatDogMode !== catDogMode) {
      catDogMode = newCatDogMode;
    }
  });

  function toggleCatDogMode() {
    hapticService?.trigger("selection");
    catDogMode = !catDogMode;
    // Persist CatDog Mode state to settings
    onUpdate?.({ key: "catDogMode", value: catDogMode });
  }

  function handlePropTypeSelect(propType: PropType, hand?: "blue" | "red") {
    hapticService?.trigger("selection");

    if (!catDogMode || !hand) {
      // Not in CatDog mode, or no specific hand specified - update both
      selectedBluePropType = propType;
      selectedRedPropType = propType;
      onUpdate?.({ key: "bluePropType", value: propType });
      onUpdate?.({ key: "redPropType", value: propType });
    } else if (hand === "blue") {
      selectedBluePropType = propType;
      onUpdate?.({ key: "bluePropType", value: propType });
    } else if (hand === "red") {
      selectedRedPropType = propType;
      onUpdate?.({ key: "redPropType", value: propType });
    }
  }

  // Grid container tracking for responsive sizing
  let gridContainerElement: HTMLDivElement | null = null;
  let containerWidth = $state(0);

  // Track image dimensions
  let imageDimensions = $state(
    new Map<PropType, { width: number; height: number }>()
  );

  onMount(() => {
    if (!gridContainerElement) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth = entry.contentRect.width;
      }
    });
    observer.observe(gridContainerElement);

    return () => {
      observer.disconnect();
    };
  });

  // Calculate columns based on container width
  function calculateColumns(width: number): number {
    if (!catDogMode) {
      // Single grid mode
      if (width >= 900) return 6;
      if (width >= 650) return 4;
      if (width >= 450) return 4;
      if (width >= 300) return 3;
      return 3;
    } else {
      // CatDog mode - split width between two grids
      const halfWidth = width / 2;
      if (halfWidth >= 450) return 4;
      if (halfWidth >= 300) return 3;
      return 2;
    }
  }

  const gridLayout = $derived.by(() => {
    const columns = calculateColumns(containerWidth);
    const rows = Math.ceil(propTypes.length / columns);
    return { columns, rows };
  });

  function handleImageLoad(propType: PropType, width: number, height: number) {
    imageDimensions.set(propType, { width, height });
    imageDimensions = new Map(imageDimensions);
  }

  function shouldRotate(propType: PropType): boolean {
    const dimensions = imageDimensions.get(propType);
    if (!dimensions) return false;

    const imageAspectRatio = dimensions.width / dimensions.height;
    return imageAspectRatio > 1.5;
  }
</script>

<div class="prop-type-content">
  <!-- CatDog Mode Toggle -->
  <div class="catdog-toggle">
    <button
      class="toggle-button"
      class:active={catDogMode}
      onclick={toggleCatDogMode}
      aria-label="Toggle CatDog Mode"
      title={catDogMode
        ? "CatDog Mode: ON - Select blue and red props separately"
        : "CatDog Mode: OFF - Both hands use the same prop"}
    >
      <span class="toggle-icon">
        {#if catDogMode}
          <span class="catdog-icon active">
            <span class="color-indicator blue mini"></span>
            <span class="separator">|</span>
            <span class="color-indicator red mini"></span>
          </span>
        {:else}
          <span class="catdog-icon">
            <span class="color-indicator blue mini"></span>
            <span class="color-indicator red mini overlap"></span>
          </span>
        {/if}
      </span>
      <span class="toggle-label">CatDog Mode</span>
      <span class="toggle-status">{catDogMode ? "ON" : "OFF"}</span>
    </button>
  </div>

  <!-- Selection Status -->
  <div class="selection-status">
    <div class="status-item">
      <span class="color-indicator blue small"></span>
      <span class="status-label">Blue: {selectedBluePropType}</span>
    </div>
    <div class="status-item">
      <span class="color-indicator red small"></span>
      <span class="status-label">Red: {selectedRedPropType}</span>
    </div>
  </div>

  <!-- Prop Grid(s) -->
  <div class="prop-container" class:catdog-mode={catDogMode} bind:this={gridContainerElement}>
    {#if !catDogMode}
      <!-- Single Grid Mode -->
      <div
        class="prop-grid"
        style:--grid-columns={`repeat(${gridLayout.columns}, 1fr)`}
      >
        {#each propTypes as propType}
          <PropTypeButton
            {propType}
            selected={selectedBluePropType === propType || selectedRedPropType === propType}
            shouldRotate={shouldRotate(propType)}
            color="blue"
            onSelect={(pt) => handlePropTypeSelect(pt)}
            onImageLoad={handleImageLoad}
          />
        {/each}
      </div>
    {:else}
      <!-- Dual Grid Mode (CatDog Mode) -->
      <div class="dual-grid-container">
        <!-- Blue Props (Left Hand) -->
        <div class="grid-section">
          <div class="grid-header">
            <span class="color-indicator blue small"></span>
            <h3>Blue (Left Hand)</h3>
          </div>
          <div
            class="prop-grid"
            style:--grid-columns={`repeat(${gridLayout.columns}, 1fr)`}
          >
            {#each propTypes as propType}
              <PropTypeButton
                {propType}
                selected={selectedBluePropType === propType}
                shouldRotate={shouldRotate(propType)}
                color="blue"
                onSelect={(pt) => handlePropTypeSelect(pt, "blue")}
                onImageLoad={handleImageLoad}
              />
            {/each}
          </div>
        </div>

        <!-- Red Props (Right Hand) -->
        <div class="grid-section">
          <div class="grid-header">
            <span class="color-indicator red small"></span>
            <h3>Red (Right Hand)</h3>
          </div>
          <div
            class="prop-grid"
            style:--grid-columns={`repeat(${gridLayout.columns}, 1fr)`}
          >
            {#each propTypes as propType}
              <PropTypeButton
                {propType}
                selected={selectedRedPropType === propType}
                shouldRotate={shouldRotate(propType)}
                color="red"
                onSelect={(pt) => handlePropTypeSelect(pt, "red")}
                onImageLoad={handleImageLoad}
              />
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .prop-type-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md, 16px);
    overflow-y: auto;
    padding: var(--spacing-md, 16px);
  }

  /* CatDog Mode Toggle */
  .catdog-toggle {
    display: flex;
    gap: var(--spacing-xs, 8px);
    padding: var(--spacing-xs, 8px);
    background: var(--surface-secondary, rgba(255, 255, 255, 0.05));
    border-radius: var(--radius-md, 8px);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  }

  .toggle-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm, 10px);
    padding: var(--spacing-sm, 10px) var(--spacing-md, 12px);
    background: transparent;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
    border-radius: var(--radius-sm, 6px);
    color: var(--text-secondary, rgba(255, 255, 255, 0.6));
    font-size: var(--font-size-sm, 13px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-button:hover {
    background: var(--surface-tertiary, rgba(255, 255, 255, 0.08));
    color: var(--text-primary, #fff);
    border-color: var(--border-color, rgba(255, 255, 255, 0.3));
  }

  .toggle-button.active {
    background: var(--accent-primary, #6366f1);
    border-color: var(--accent-primary, #6366f1);
    color: #fff;
  }

  .catdog-icon {
    display: flex;
    align-items: center;
    gap: 4px;
    position: relative;
  }

  .catdog-icon.active {
    gap: 6px;
  }

  .separator {
    font-size: 12px;
    color: currentColor;
    opacity: 0.6;
  }

  .toggle-icon {
    display: flex;
    align-items: center;
  }

  .toggle-label {
    font-weight: 600;
  }

  .toggle-status {
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }

  .toggle-button.active .toggle-status {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Selection Status */
  .selection-status {
    display: flex;
    gap: var(--spacing-md, 16px);
    padding: var(--spacing-sm, 10px);
    background: var(--surface-secondary, rgba(255, 255, 255, 0.03));
    border-radius: var(--radius-sm, 6px);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 6px);
  }

  .status-label {
    font-size: var(--font-size-sm, 13px);
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    text-transform: capitalize;
  }

  /* Color Indicators */
  .color-indicator {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid var(--border-color, rgba(255, 255, 255, 0.2));
    flex-shrink: 0;
  }

  .color-indicator.small {
    width: 12px;
    height: 12px;
  }

  .color-indicator.mini {
    width: 10px;
    height: 10px;
    border-width: 1.5px;
  }

  .color-indicator.overlap {
    margin-left: -6px;
  }

  .color-indicator.blue {
    background-color: #2e3192;
  }

  .color-indicator.red {
    background-color: #ed1c24;
  }

  /* Prop Grid Container */
  .prop-container {
    width: 100%;
    container-type: inline-size;
    flex: 1;
  }

  /* Dual Grid Layout */
  .dual-grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg, 24px);
    width: 100%;
  }

  .grid-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 10px);
  }

  .grid-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 8px);
    padding: var(--spacing-xs, 8px);
    background: var(--surface-secondary, rgba(255, 255, 255, 0.05));
    border-radius: var(--radius-sm, 6px);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  }

  .grid-header h3 {
    margin: 0;
    font-size: var(--font-size-sm, 13px);
    font-weight: 600;
    color: var(--text-primary, #fff);
  }

  /* Prop Grid */
  .prop-grid {
    display: grid;
    grid-template-columns: var(--grid-columns);
    gap: var(--spacing-xs, 8px);
    width: 100%;
  }

  /* Responsive: Stack grids vertically on smaller screens */
  @media (max-width: 768px) {
    .dual-grid-container {
      grid-template-columns: 1fr;
    }
  }
</style>
