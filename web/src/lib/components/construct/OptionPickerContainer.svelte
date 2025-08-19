<!--
  OptionPickerContainer.svelte

  Main orchestrator component that leverages existing sophisticated systems:
  - Uses optionPickerRunes.svelte.ts for state management
  - Uses OptionPickerLayoutManager.ts for layout calculations
  - Delegates rendering to existing well-designed sub-components

  This replaces the 562-line monolithic OptionPicker.svelte
-->
<script lang="ts">
  import type { PictographData } from "$lib/domain/PictographData";
  import type { SequenceData } from "$lib/domain/SequenceData";
  import { onMount } from "svelte";
  // Import sophisticated existing systems
  import { OptionPickerLayoutManager } from "./option-picker/OptionPickerLayoutManager";
  import { createOptionPickerRunes } from "./option-picker/optionPickerRunes.svelte";
  import { detectFoldableDevice } from "./option-picker/utils/deviceDetection";
  import { getEnhancedDeviceType } from "./option-picker/utils/layoutUtils";
  // Import well-designed sub-components
  import OptionPickerHeader from "./option-picker/OptionPickerHeader.svelte";
  import OptionPickerScroll from "./option-picker/OptionPickerScroll.svelte";
  import { resize } from "./option-picker/actions/resize";

  // Props
  interface Props {
    currentSequence?: SequenceData | null;
    onOptionSelected?: (option: PictographData) => void;
  }

  let { currentSequence = null, onOptionSelected }: Props = $props();

  // Container dimensions for layout calculations
  let containerWidth = $state(800);
  let containerHeight = $state(600);

  // Use sophisticated state management system
  const optionPickerState = createOptionPickerRunes();

  // Simplified loading check - no preloaded data complexity
  const shouldShowLoading = $derived(() => {
    return (
      optionPickerState.isLoading &&
      optionPickerState.optionsData.length === 0 &&
      !isCurrentlyLoading // Don't show loading if we're preventing duplicates
    );
  });

  // Derived device and layout information
  const foldableInfo = $derived(() => detectFoldableDevice());
  const deviceInfo = $derived(() =>
    getEnhancedDeviceType(containerWidth, containerWidth < 768)
  );

  // Calculate layout using sophisticated system
  const layoutConfig = $derived(() => {
    return OptionPickerLayoutManager.calculateLayout({
      count: optionPickerState.optionsData.length,
      containerWidth,
      containerHeight,
      windowWidth: containerWidth,
      windowHeight: containerHeight,
      isMobileUserAgent: containerWidth < 768,
    });
  });

  // Reactive access to options data
  const optionsData = $derived(() => optionPickerState.optionsData);
  const error = $derived(() => optionPickerState.error);

  // Handle container resize with protection against infinite loops
  function handleResize(width: number, height: number) {
    // Only update if dimensions actually changed significantly
    const threshold = 5; // 5px threshold to prevent micro-adjustments
    if (
      Math.abs(width - containerWidth) > threshold ||
      Math.abs(height - containerHeight) > threshold
    ) {
      containerWidth = width;
      containerHeight = height;
    }
  }

  // Handle option selection
  function handleOptionSelected(option: PictographData) {
    optionPickerState.selectOption(option);
    onOptionSelected?.(option);
  }

  // Enhanced debouncing to prevent cascades
  let isCurrentlyLoading = $state(false);
  let lastLoadTrigger = $state<string | null>(null);
  let loadTimeout: ReturnType<typeof setTimeout> | null = null;

  // Unified loading function with proper debouncing
  async function loadOptionsOnce(trigger: string) {
    // Clear any pending loads
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      loadTimeout = null;
    }

    // Prevent duplicate loading from the same trigger
    if (isCurrentlyLoading && lastLoadTrigger === trigger) {
      console.log(
        `⏭️ OptionPickerContainer: Skipping duplicate load from ${trigger}`
      );
      return;
    }

    // Debounce rapid calls
    loadTimeout = setTimeout(async () => {
      isCurrentlyLoading = true;
      lastLoadTrigger = trigger;

      try {
        console.log(
          `🔄 OptionPickerContainer: Loading options from ${trigger}`
        );
        await optionPickerState.loadOptions([]);
      } catch (error) {
        console.error(
          `❌ OptionPickerContainer: Failed to load options from ${trigger}:`,
          error
        );
      } finally {
        // Reset loading state
        setTimeout(() => {
          isCurrentlyLoading = false;
          lastLoadTrigger = null;
        }, 200);
      }
    }, 100); // 100ms debounce
  }

  // Handle start position selection events
  function handleStartPositionSelected() {
    loadOptionsOnce("start-position-event");
  }

  // Initialize on mount
  onMount(() => {
    // Don't auto-load on mount to prevent cascade
    // loadOptionsOnce("mount");

    // Listen for start position selection events
    document.addEventListener(
      "start-position-selected",
      handleStartPositionSelected
    );

    // Cleanup on unmount
    return () => {
      document.removeEventListener(
        "start-position-selected",
        handleStartPositionSelected
      );
    };
  });

  // Remove reactive effect to prevent cascade - only load on explicit events
  // $effect(() => {
  //   if (currentSequence) {
  //     loadOptionsOnce("sequence-change");
  //   }
  // });
</script>

<!-- Container with resize detection -->
<div
  class="option-picker-container"
  class:mobile={deviceInfo().deviceType === "mobile" ||
    deviceInfo().deviceType === "smallMobile"}
  class:tablet={deviceInfo().deviceType === "tablet"}
  class:foldable={foldableInfo().isFoldable}
  use:resize={handleResize}
  style="--layout-scale-factor: {layoutConfig()
    .scaleFactor}; --option-size: {layoutConfig()
    .optionSize}px; --grid-gap: {layoutConfig().gridGap}px"
>
  <!-- Header -->
  <OptionPickerHeader />

  <!-- Main content area -->
  <div class="content-area">
    {#if shouldShowLoading()}
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading options...</p>
        <small>
          Layout: {deviceInfo().deviceType} |
          {foldableInfo().isFoldable ? "Foldable" : "Standard"} | Scale: {layoutConfig()
            .scaleFactor}
        </small>
      </div>
    {:else if error()}
      <div class="error-container">
        <p>❌ Error loading options</p>
        <p>{error()}</p>
        <button
          class="retry-button"
          onclick={() => optionPickerState.loadOptions([])}
        >
          Retry
        </button>
      </div>
    {:else if optionsData().length === 0}
      <div class="empty-container">
        <p>No options available</p>
        <p>Please select a start position first</p>
        <small>
          Layout: {layoutConfig().gridColumns} | Device: {deviceInfo()
            .deviceType}
        </small>
      </div>
    {:else}
      <!-- Use existing well-designed scroll component -->
      <OptionPickerScroll
        pictographs={optionsData()}
        onPictographSelected={handleOptionSelected}
        {containerWidth}
        {containerHeight}
        layoutConfig={layoutConfig().layoutConfig}
        deviceInfo={deviceInfo()}
        foldableInfo={foldableInfo()}
      />
    {/if}
  </div>
</div>

<style>
  .option-picker-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
  }

  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .loading-container,
  .error-container,
  .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 2rem;
    text-align: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .retry-button {
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }

  .retry-button:hover {
    background: #0056b3;
  }

  /* Responsive adjustments */
  .option-picker-container.mobile {
    /* Mobile-specific styles can be added here */
    font-size: 14px;
  }

  .option-picker-container.tablet {
    /* Tablet-specific styles can be added here */
    font-size: 16px;
  }

  .option-picker-container.foldable {
    /* Foldable device styles can be added here */
    transition: all 0.3s ease;
  }
</style>
