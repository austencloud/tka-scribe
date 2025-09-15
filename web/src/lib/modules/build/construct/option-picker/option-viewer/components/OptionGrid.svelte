<!--
OptionGrid.svelte - Clean option display grid component

Renamed from OptionPickerContainer for clarity - this component's job is to display
the actual options that the header and filter logic allow you to display.

Clean, minimal component that focuses only on UI concerns:
- No business logic or reactive effects that cause infinite loops
- Simple props-based interface
- Responsive container dimensions tracking only
- Uses existing shared infrastructure for letter type operations
-->
<script lang="ts">
  import type { PictographData } from "$shared";
  import { resolveAsync, TYPES } from "$shared";
  import { onMount } from "svelte";

  import OptionPickerHeader from "../../option-picker-header/OptionPickerHeader.svelte";
  import type { IOptionPickerService, IOptionSizer } from "../services";
  import { createOptionPickerState } from "../state";
  import OptionPickerScroll from "./OptionPickerScroll.svelte";

  // Props
  let { onOptionSelected, currentSequence = [] }: {
    onOptionSelected: (option: PictographData) => void;
    currentSequence?: PictographData[];
  } = $props();

  // Services and state - initialized asynchronously
  let optionPickerService: IOptionPickerService | null = null;
  let optionPickerSizingService: IOptionSizer | null = null;
  let optionPickerState = $state<ReturnType<typeof createOptionPickerState> | null>(null);
  let servicesReady = $state(false);

  // Container dimensions for responsive layout
  let containerWidth = $state(800);
  let containerHeight = $state(600);
  let isContainerReady = $state(false);

  // Layout configuration using maximized sizing service
  const layoutConfig = $derived(() => {
    // Return fallback if services not ready
    if (!optionPickerSizingService || !optionPickerState) {
      return {
        optionsPerRow: 4,
        pictographSize: 144,
        spacing: 8,
        containerWidth,
        containerHeight,
        gridColumns: 'repeat(4, 1fr)',
        gridGap: '8px',
      };
    }

    // Get optimal columns from sizing service
    const optionsPerRow = optionPickerSizingService.getOptimalColumns(
      containerWidth,
      containerWidth < 768 // isMobileDevice
    );

    // Determine layout mode and calculate maximum pictographs per section
    const layoutMode = optionsPerRow === 8 ? '8-column' : '4-column';

    // Calculate max pictographs per section from organized data
    const maxPictographsPerSection = Math.max(
      ...organizedPictographs().map(section => section.pictographs.length),
      8 // Minimum assumption for sizing calculations
    );

    // Use maximized sizing for better space utilization
    const sizingResult = optionPickerSizingService.calculateMaximizedSize({
      containerWidth,
      containerHeight,
      layoutMode,
      maxPictographsPerSection,
      isMobileDevice: containerWidth < 768,
    });

    return {
      optionsPerRow,
      pictographSize: sizingResult.pictographSize,
      spacing: parseInt(sizingResult.gridGap.replace('px', '')),
      containerWidth,
      containerHeight,
      gridColumns: `repeat(${optionsPerRow}, 1fr)`,
      gridGap: sizingResult.gridGap,
    };
  });

  // Section expansion functionality removed - only use option picker header buttons for visibility control

  // Component state (UI concerns only)
  let containerElement: HTMLElement;



  // Organize pictographs using service (moved business logic from component)
  const organizedPictographs = $derived(() => {
    if (!optionPickerState?.filteredOptions.length || !optionPickerService) {
      return [];
    }

    const serviceResult = optionPickerService.organizePictographs(
      optionPickerState.filteredOptions,
      optionPickerState.sortMethod
    );

    // Convert service result to match expected format
    const result = serviceResult.map(section => ({
      title: section.title,
      pictographs: section.pictographs,
      type: section.type === 'grouped' ? 'grouped' as const : 'individual' as const
    }));

    return result;
  });



  // Reactive effect to load options when sequence changes
  $effect(() => {
    if (optionPickerState && servicesReady && currentSequence && currentSequence.length > 0) {
      optionPickerState.loadOptions(currentSequence);
    }
  });

  // Initialize services and component
  onMount(() => {
    // Initialize services asynchronously
    (async () => {
      try {
        optionPickerService = await resolveAsync<IOptionPickerService>(TYPES.IOptionPickerService);
        optionPickerSizingService = await resolveAsync<IOptionSizer>(TYPES.IOptionPickerSizingService);
        optionPickerState = createOptionPickerState({
          optionPickerService
        });
        servicesReady = true;

        // Load options immediately if we have a sequence
        if (currentSequence && currentSequence.length > 0) {
          optionPickerState.loadOptions(currentSequence);
        }
      } catch (error) {
        console.error("Failed to initialize option picker services:", error);
      }
    })();

    // Set up resize observer for responsive behavior
    if (containerElement) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          containerWidth = entry.contentRect.width;
          containerHeight = entry.contentRect.height;

          // Mark container as ready after first measurement
          if (!isContainerReady && containerWidth > 0 && containerHeight > 0) {
            isContainerReady = true;
          }
        }
      });
      resizeObserver.observe(containerElement);

      // Force initial measurement
      const rect = containerElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        containerWidth = rect.width;
        containerHeight = rect.height;
        isContainerReady = true;
      }

      return () => resizeObserver.disconnect();
    }
  });

  // Load options when sequence changes
  $effect(() => {
    if (isContainerReady && currentSequence && optionPickerState) {
      optionPickerState.loadOptions(currentSequence);
    }
  });

  // Handle option selection
  async function handleOptionSelected(option: PictographData) {
    if (!optionPickerState) return;

    try {
      await optionPickerState.selectOption(option);
      onOptionSelected(option);
    } catch (error) {
      console.error("Failed to select option:", error);
    }
  }
</script>

<div
  class="option-picker-container"
  bind:this={containerElement}
  data-testid="option-picker-container"
>
  {#if !optionPickerState}
    <div class="loading-state">
      <p>Initializing option picker...</p>
    </div>
  {:else}
    <!-- Header with sorting controls -->
    <OptionPickerHeader
      sortMethod={optionPickerState.sortMethod}
      onSortMethodChanged={(method) => optionPickerState!.setSortMethod(method as any)}
      optionPickerState={optionPickerState}
    />

    <!-- Main content -->
    <div class="option-picker-content">
      {#if !isContainerReady}
        <div class="loading-state">
          <p>Initializing container...</p>
        </div>
      {:else if optionPickerState.state === 'loading'}
        <div class="loading-state">
          <p>Loading options...</p>
        </div>
      {:else if optionPickerState.error}
        <div class="error-state">
          <p>Error loading options: {optionPickerState.error}</p>
          <button onclick={() => optionPickerState!.clearError()}> Retry </button>
        </div>
      {:else if optionPickerState.filteredOptions.length === 0}
        <div class="empty-state">
          <p>No options available for the current sequence.</p>
          <p>Debug: Total options: {optionPickerState.options.length}, Filtered: {optionPickerState.filteredOptions.length}</p>
          <p>Type filter: {JSON.stringify(optionPickerState.typeFilter)}</p>
        </div>
      {:else}
        <OptionPickerScroll
          organizedPictographs={organizedPictographs()}
          onPictographSelected={handleOptionSelected}
          layoutConfig={layoutConfig()}
          typeFilter={optionPickerState.typeFilter}
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  .option-picker-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  /* Beautiful glassmorphism background */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.02)
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  overflow: visible;
  }

  .option-picker-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  min-height: 0; /* Crucial for flex child to allow proper scrolling */
  }

  .loading-state,
  .error-state,
  .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--text-muted);
  }

  .error-state button {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  }

  .error-state button:hover {
  background: var(--primary-color-hover);
  }
</style>
