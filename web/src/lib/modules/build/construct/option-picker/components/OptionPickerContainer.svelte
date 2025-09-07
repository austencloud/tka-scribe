<!--
OptionPickerContainer.svelte - Simplified UI-only component

Clean, minimal component that focuses only on UI concerns:
- No business logic or reactive effects that cause infinite loops
- Simple props-based interface
- Responsive container dimensions tracking only
-->
<script lang="ts">
  import type { PictographData } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import ErrorBanner from '../../../shared/components/ErrorBanner.svelte';
  import LoadingOverlay from '../../../shared/components/LoadingOverlay.svelte';
  import type { IOptionPickerServiceAdapter } from "../services/contracts";
  import { createOptionPickerState } from "../state/option-picker-state.svelte";
  import OptionPickerHeader from "./OptionPickerHeader.svelte";
  import OptionPickerScroll from "./OptionPickerScroll.svelte";

  // Props - simplified with proper DI architecture
  const {
  onOptionSelected = () => {},
  initialSequence = [],
  } = $props<{
  onOptionSelected?: (option: PictographData) => void;
  initialSequence?: PictographData[];
  }>();

  // Track sequence ID to prevent unnecessary reloads
  let lastSequenceId = $state<string | null>(null);

  // React to changes in initialSequence and reload options
  $effect(() => {
  const currentSequenceId = initialSequence[0]?.id || null;

  if (initialSequence.length > 0 && containerWidth > 0 && containerHeight > 0 && currentSequenceId !== lastSequenceId) {
    lastSequenceId = currentSequenceId;
    optionPickerState.loadOptionsForSequence(
    initialSequence,
    containerWidth,
    containerHeight
    );
  }
  });

  // Proper TKA architecture: Service → State → Component
  const optionPickerService = resolve(
  TYPES.IOptionPickerServiceAdapter
  ) as IOptionPickerServiceAdapter;
  const optionPickerState = createOptionPickerState(optionPickerService);

  // Component state (UI concerns only)
  let containerElement: HTMLElement;
  let containerWidth = $state(800);
  let containerHeight = $state(600);

  // Initialize component and load options
  onMount(() => {
  // Set up resize observer for responsive behavior
  if (containerElement) {
    const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      containerWidth = entry.contentRect.width;
      containerHeight = entry.contentRect.height;
      // Recalculate layout when container size changes
      optionPickerState.recalculateLayout(containerWidth, containerHeight);
    }
    });
    resizeObserver.observe(containerElement);

    return () => resizeObserver.disconnect();
  }
  });

  // Handle option selection
  async function handleOptionSelected(option: PictographData) {
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
  <!-- Header with sorting controls -->
  <OptionPickerHeader
  sortMethod={optionPickerState.sortMethod}
  reversalFilter={optionPickerState.reversalFilter}
  onSortMethodChanged={optionPickerState.setSortMethod}
  onReversalFilterChanged={optionPickerState.setReversalFilter}
  />

  <!-- Error banner -->
  {#if optionPickerState.error}
  <ErrorBanner message={optionPickerState.error} onDismiss={optionPickerState.clearError} />
  {/if}

  <!-- Main content -->
  <div class="option-picker-content">
  {#if optionPickerState.isLoading}
    <LoadingOverlay message="Loading options..." />
  {:else if optionPickerState.error}
    <div class="error-state">
    <p>Error loading options: {optionPickerState.error}</p>
    <button onclick={() => optionPickerState.retryLoading(containerWidth, containerHeight)}> Retry </button>
    </div>
  {:else if optionPickerState.filteredOptions.length === 0}
    <div class="empty-state">
    <p>No options available for the current sequence.</p>
    </div>
  {:else}
    <OptionPickerScroll
    pictographs={optionPickerState.filteredOptions}
    onPictographSelected={handleOptionSelected}
    {containerWidth}
    {containerHeight}
    layout={optionPickerState.layout}
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

  overflow: hidden;
  }

  .option-picker-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  }

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
