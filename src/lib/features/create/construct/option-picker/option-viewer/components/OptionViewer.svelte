<!--
OptionViewer.svelte - Clean option display orchestrator

Orchestrates specialized components and services:
- Services handle business logic (sizing, organizing, filtering, formatting)
- State files handle domain state (option-picker-state, container-dimension-tracker)
- This component coordinates them with reactive Svelte 5 runes
-->
<script lang="ts">
  import type { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import ConstructPickerHeader from "$lib/features/create/construct/shared/components/ConstructPickerHeader.svelte";
  import type { ILayoutDetectionService } from "../../services/contracts/ILayoutDetectionService";
  import type { IOptionFilter } from "../services/contracts/IOptionFilter";
  import type { IOptionLoader } from "../services/contracts/IOptionLoader";
  import type { IOptionOrganizer } from "../services/contracts/IOptionOrganizer";
  import type { IOptionSizer } from "../services/contracts/IOptionSizer";
  import type { IOptionSorter } from "../services/contracts/IOptionSorter";
  import type { ISectionTitleFormatter } from "../services/contracts/ISectionTitleFormatter";
  import { createContainerDimensionTracker } from "../state/container-dimension-tracker.svelte";
  import { createOptionPickerState } from "../state/option-picker-state.svelte";
  import OptionFilterPanel from "./OptionFilterPanel.svelte";
  import OptionViewerGridLayout from "./OptionViewerGridLayout.svelte";
  import OptionViewerSwipeLayout from "./OptionViewerSwipeLayout.svelte";

  // ===== PROPS =====
  let {
    onOptionSelected,
    currentSequence = [],
    currentGridMode,
    isUndoingOption = false,
    isSideBySideLayout = () => false,
    onOpenFilters = () => {},
    onCloseFilters = () => {},
    isContinuousOnly = false,
    isFilterPanelOpen = false,
    onToggleContinuous = () => {},
  }: {
    onOptionSelected: (option: PictographData) => void;
    currentSequence?: PictographData[];
    currentGridMode: GridMode;
    isUndoingOption?: boolean;
    isSideBySideLayout?: () => boolean;
    onOpenFilters?: () => void;
    onCloseFilters?: () => void;
    isContinuousOnly?: boolean;
    isFilterPanelOpen?: boolean;
    onToggleContinuous?: (value: boolean) => void;
  } = $props();

  // ===== SERVICES =====
  let optionPickerSizingService: IOptionSizer | null = null;
  let optionOrganizerService: IOptionOrganizer | null = null;
  let layoutDetectionService: ILayoutDetectionService | null = null;
  let sectionTitleFormatter: ISectionTitleFormatter | null = null;
  let hapticService: IHapticFeedbackService | null = null;

  // ===== STATE =====
  let optionPickerState = $state<ReturnType<
    typeof createOptionPickerState
  > | null>(null);
  let servicesReady = $state(false);
  let currentSectionTitle = $state<string>("Type 1");
  let isFadingOut = $state(false);
  let isTransitioning = $state(false);
  let debugCopied = $state(false);

  const containerDimensions = createContainerDimensionTracker();
  let containerElement: HTMLElement;

  // Transition timing constants
  const FADE_OUT_DURATION = 250;
  const FADE_IN_DURATION = 250;

  // Header title constants
  const GRID_LAYOUT_TITLE = "Choose your next option!";

  // ===== DERIVED - Formatted title =====
  const formattedSectionTitle = $derived(() => {
    // When using grid layout (not swipe), show generic message
    // because all sections are visible at once
    if (!shouldUseSwipeLayout()) {
      return GRID_LAYOUT_TITLE;
    }

    // When using swipe layout, show section-specific title
    if (!sectionTitleFormatter) return currentSectionTitle;
    return sectionTitleFormatter.formatSectionTitle(currentSectionTitle);
  });

  // ===== DERIVED - Organized pictographs =====
  const organizedPictographs = $derived(() => {
    if (!optionPickerState?.filteredOptions.length || !optionOrganizerService) {
      return [];
    }

    const serviceResult = optionOrganizerService.organizePictographs(
      optionPickerState.filteredOptions,
      "type"
    );

    return serviceResult.map((section) => ({
      title: section.title,
      pictographs: section.pictographs,
      type:
        section.type === "grouped"
          ? ("grouped" as const)
          : ("section" as const),
    }));
  });

  // ===== DERIVED - Layout configuration =====
  const layoutConfig = $derived(() => {
    if (!optionPickerSizingService || !optionPickerState) {
      return {
        optionsPerRow: 4,
        pictographSize: 144,
        spacing: 8,
        containerWidth: containerDimensions.width,
        containerHeight: containerDimensions.height,
        gridColumns: "repeat(4, 1fr)",
        gridGap: "8px",
      };
    }

    const optionsPerRow = optionPickerSizingService.getOptimalColumns(
      containerDimensions.width,
      containerDimensions.width < 600
    );

    const layoutMode: "8-column" | "4-column" =
      optionsPerRow === 8 ? "8-column" : "4-column";

    const maxPictographsPerSection = Math.max(
      ...organizedPictographs().map((section) => section.pictographs.length),
      8
    );

    const sizingResult = optionPickerSizingService.calculateOverflowAwareSize({
      containerWidth: containerDimensions.width,
      containerHeight: containerDimensions.height,
      layoutMode,
      maxPictographsPerSection,
      isMobileDevice: containerDimensions.width < 800,
      headerHeight: 40,
      targetOverflowBuffer: 30,
    });

    return {
      optionsPerRow,
      pictographSize: sizingResult.pictographSize,
      spacing: parseInt(sizingResult.gridGap.replace("px", "")),
      containerWidth: containerDimensions.width,
      containerHeight: containerDimensions.height,
      gridColumns: `repeat(${optionsPerRow}, 1fr)`,
      gridGap: sizingResult.gridGap,
    };
  });

  // ===== DERIVED - Layout mode decisions =====
  const shouldUseSwipeLayout = $derived(() => {
    if (!layoutDetectionService || organizedPictographs().length <= 1) {
      return false;
    }

    // When filtering by continuous, there are only ~16 options max
    // Show everything in one container (no swipe) even on mobile
    // BUT: Only if we have enough beats for meaningful filtering (2+ beats)
    // With just a start position, use normal swipe behavior
    if (isContinuousOnly && currentSequence.length >= 2) {
      return false;
    }

    // Stacked layout always uses swipe for multiple sections
    if (!isSideBySideLayout() && organizedPictographs().length > 1) {
      return true;
    }

    return layoutDetectionService.shouldUseHorizontalSwipe(
      layoutConfig(),
      organizedPictographs().length,
      true
    );
  });

  /**
   * Determine if header should be compact (when space is tight)
   *
   * Uses the same conditions that previously triggered the floating button:
   * - Pictographs are small (< 80px)
   * - Height is the constraining factor
   *
   * Instead of replacing the header with a floating button, we now just
   * make the header more compact (reduced padding, smaller font) to
   * preserve vertical space while maintaining UI symmetry.
   */
  const shouldUseCompactHeader = $derived(() => {
    if (
      !optionPickerState?.filteredOptions.length ||
      !optionPickerSizingService ||
      containerDimensions.height === 0
    ) {
      return false;
    }

    const config = layoutConfig();
    const maxPictographsPerSection = Math.max(
      ...organizedPictographs().map((section) => section.pictographs.length),
      8
    );

    return optionPickerSizingService.shouldUseFloatingButton({
      containerWidth: containerDimensions.width,
      containerHeight: containerDimensions.height,
      pictographSize: config.pictographSize,
      columns: config.optionsPerRow,
      maxPictographsPerSection,
    });
  });

  // Active transition timeouts for cleanup
  let transitionTimeouts: Array<ReturnType<typeof setTimeout>> = [];

  // ===== EFFECTS - Overflow monitoring =====
  $effect(() => {
    if (!optionPickerSizingService) return;

    const unsubscribe = optionPickerSizingService.subscribeToOverflowChanges(
      (hasOverflow, overflowAmount) => {
        if (hasOverflow) {
          console.log(`⚠️ Overflow detected: ${overflowAmount}px`);
          containerDimensions.forceUpdate();
        }
      }
    );

    return unsubscribe;
  });

  // ===== EFFECTS - Load options =====
  $effect(() => {
    if (isTransitioning) return;

    if (
      optionPickerState &&
      servicesReady &&
      currentSequence &&
      currentSequence.length > 0
    ) {
      optionPickerState.loadOptions(currentSequence, currentGridMode);
    } else if (
      optionPickerState &&
      servicesReady &&
      (!currentSequence || currentSequence.length === 0)
    ) {
      optionPickerState.reset();
    }
  });

  // ===== EFFECTS - Undo transitions =====
  $effect(() => {
    if (isUndoingOption && optionPickerState && !isTransitioning) {
      // Clear any existing timeouts
      transitionTimeouts.forEach((timeout) => clearTimeout(timeout));
      transitionTimeouts = [];

      // Start fade-out
      isFadingOut = true;
      isTransitioning = true;

      // Start preloading options asynchronously IN PARALLEL with fade-out animation
      const preloadPromise = (async () => {
        if (
          optionPickerState &&
          currentSequence &&
          currentSequence.length > 0
        ) {
          await optionPickerState.preloadOptions(
            currentSequence,
            currentGridMode
          );
        }
      })();

      // After fade-out completes: apply preloaded options and start fade-in
      const fadeInTimeout = setTimeout(async () => {
        // Ensure preload is complete before applying
        await preloadPromise;

        // Apply the preloaded options (UI updates with new options)
        optionPickerState?.applyPreloadedOptions();

        // Start fade-in with new options
        isFadingOut = false;
      }, FADE_OUT_DURATION);
      transitionTimeouts.push(fadeInTimeout);

      // Complete transition
      const completeTimeout = setTimeout(() => {
        isTransitioning = false;
        transitionTimeouts = [];
      }, FADE_OUT_DURATION + FADE_IN_DURATION);
      transitionTimeouts.push(completeTimeout);
    }
  });

  // ===== EFFECTS - Sync continuity state =====
  $effect(() => {
    if (
      optionPickerState &&
      optionPickerState.isContinuousOnly !== isContinuousOnly
    ) {
      optionPickerState.setContinuousOnly(isContinuousOnly);
    }
  });

  // ===== HANDLERS =====
  async function handleOptionSelected(option: PictographData) {
    if (!optionPickerState || isTransitioning) return;

    try {
      performance.mark("option-click-start");
      hapticService?.trigger("selection");

      // Instant feedback
      onOptionSelected(option);
      performance.mark("option-selected-callback-complete");

      // Clear any existing timeouts
      transitionTimeouts.forEach((timeout) => clearTimeout(timeout));
      transitionTimeouts = [];

      // Start fade-out
      isFadingOut = true;
      isTransitioning = true;

      // Update state immediately (non-blocking)
      optionPickerState.selectOption(option);

      // Start preloading options asynchronously IN PARALLEL with fade-out animation
      // This loads options without updating the UI (old options remain visible during fade-out)
      const preloadPromise = (async () => {
        if (
          optionPickerState &&
          currentSequence &&
          currentSequence.length > 0
        ) {
          await optionPickerState.preloadOptions(
            currentSequence,
            currentGridMode
          );
          performance.mark("option-picker-preload-complete");
        }
      })();

      // After fade-out completes: apply preloaded options and start fade-in
      const fadeInTimeout = setTimeout(async () => {
        // Ensure preload is complete before applying
        await preloadPromise;

        // Apply the preloaded options (UI updates with new options)
        optionPickerState?.applyPreloadedOptions();
        performance.mark("option-picker-state-complete");

        // Start fade-in with new options
        isFadingOut = false;
      }, FADE_OUT_DURATION);
      transitionTimeouts.push(fadeInTimeout);

      // Complete transition after both animations complete
      const completeTimeout = setTimeout(() => {
        isTransitioning = false;
        transitionTimeouts = [];
        performance.mark("transition-complete");
      }, FADE_OUT_DURATION + FADE_IN_DURATION);
      transitionTimeouts.push(completeTimeout);
    } catch (error) {
      console.error("Failed to select option:", error);
      isFadingOut = false;
      isTransitioning = false;
      transitionTimeouts.forEach((timeout) => clearTimeout(timeout));
      transitionTimeouts = [];
    }
  }

  function handleSectionChange(sectionIndex: number) {
    const sections = organizedPictographs();
    if (sections[sectionIndex]) {
      currentSectionTitle = sections[sectionIndex].title;
    }
  }

  /**
   * Copy debug info to clipboard for troubleshooting empty options state
   */
  async function copyDebugInfo() {
    if (!optionPickerState) return;

    const debugInfo = {
      ...optionPickerState.getDebugInfo(),
      // Additional context from component
      componentContext: {
        currentSequenceProp: currentSequence.map((p, i) => ({
          index: i,
          id: p.id,
          letter: p.letter,
          startPosition: p.startPosition,
          endPosition: p.endPosition,
        })),
        currentSequencePropLength: currentSequence.length,
        currentGridMode,
        isUndoingOption,
        isTransitioning,
        isFadingOut,
        servicesReady,
        containerDimensions: {
          width: containerDimensions.width,
          height: containerDimensions.height,
          isReady: containerDimensions.isReady,
        },
        organizedPictographsCount: organizedPictographs().length,
      },
    };

    const debugText = `=== OPTION VIEWER DEBUG INFO ===
Timestamp: ${debugInfo.timestamp}
Issue: "No options available" shown when sequence should have options

--- State ---
State: ${debugInfo.state}
Options loaded: ${debugInfo.optionsCount}
Filtered options: ${debugInfo.filteredOptionsCount}
Last sequence ID: ${debugInfo.lastSequenceId}
Error: ${debugInfo.error || "none"}

--- Sequence Info ---
Current sequence length (state): ${debugInfo.currentSequenceLength}
Current sequence length (prop): ${debugInfo.componentContext.currentSequencePropLength}
Grid mode: ${debugInfo.componentContext.currentGridMode}

--- Sequence Details (state) ---
${JSON.stringify(debugInfo.currentSequence, null, 2)}

--- Sequence Details (prop) ---
${JSON.stringify(debugInfo.componentContext.currentSequenceProp, null, 2)}

--- Filter Settings ---
Continuous only: ${debugInfo.isContinuousOnly}
Sort method: ${debugInfo.sortMethod}

--- Component Context ---
Services ready: ${debugInfo.componentContext.servicesReady}
Is undoing: ${debugInfo.componentContext.isUndoingOption}
Is transitioning: ${debugInfo.componentContext.isTransitioning}
Is fading out: ${debugInfo.componentContext.isFadingOut}
Container dimensions: ${debugInfo.componentContext.containerDimensions.width}x${debugInfo.componentContext.containerDimensions.height}
Container ready: ${debugInfo.componentContext.containerDimensions.isReady}
Organized sections: ${debugInfo.componentContext.organizedPictographsCount}

--- Full JSON ---
${JSON.stringify(debugInfo, null, 2)}
`;

    try {
      await navigator.clipboard.writeText(debugText);
      debugCopied = true;
      setTimeout(() => {
        debugCopied = false;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy debug info:", err);
    }
  }

  // ===== LIFECYCLE =====
  onMount(() => {
    try {
      // Resolve services
      const optionLoader = resolve<IOptionLoader>(TYPES.IOptionLoader);
      const filterService = resolve<IOptionFilter>(TYPES.IOptionFilter);
      const optionSorter = resolve<IOptionSorter>(TYPES.IOptionSorter);
      optionOrganizerService = resolve<IOptionOrganizer>(
        TYPES.IOptionOrganizerService
      );
      optionPickerSizingService = resolve<IOptionSizer>(
        TYPES.IOptionPickerSizingService
      );
      layoutDetectionService = resolve<ILayoutDetectionService>(
        TYPES.ILayoutDetectionService
      );
      sectionTitleFormatter = resolve<ISectionTitleFormatter>(
        TYPES.ISectionTitleFormatter
      );
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );

      // Create state
      optionPickerState = createOptionPickerState({
        optionLoader,
        filterService,
        optionSorter,
      });

      servicesReady = true;
    } catch (error) {
      console.error("Failed to initialize option picker services:", error);
    }

    // Setup container tracking
    if (containerElement) {
      return containerDimensions.attachToElement(containerElement);
    }
    return undefined;
  });
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
    <!-- Header - always shown, compact when space is tight -->
    <div transition:fade={{ duration: 200 }}>
      <ConstructPickerHeader
        variant="options"
        title="Options"
        titleHtml={formattedSectionTitle()}
        {isFilterPanelOpen}
        {onOpenFilters}
        isSideBySideLayout={isSideBySideLayout()}
        compact={shouldUseCompactHeader()}
      />
    </div>

    <!-- Main content -->
    <div class="option-picker-content">
      {#if !containerDimensions.isReady}
        <div class="loading-state">
          <p>Initializing container...</p>
        </div>
      {:else if optionPickerState.state === "loading"}
        <div class="loading-state">
          <p>Loading options...</p>
        </div>
      {:else if optionPickerState.error}
        <div class="error-state">
          <p>Error loading options: {optionPickerState.error}</p>
          <button onclick={() => optionPickerState?.clearError()}>Retry</button>
        </div>
      {:else if optionPickerState.filteredOptions.length === 0 && !isTransitioning}
        <div class="empty-state">
          <p>No options available for the current sequence.</p>
          <button class="debug-copy-btn" onclick={copyDebugInfo}>
            📋 Copy Debug Info
          </button>
          {#if debugCopied}
            <span class="copy-feedback" transition:fade={{ duration: 200 }}
              >Copied!</span
            >
          {/if}
        </div>
      {:else if optionPickerState.filteredOptions.length > 0}
        {#if shouldUseSwipeLayout()}
          <OptionViewerSwipeLayout
            organizedPictographs={organizedPictographs()}
            onPictographSelected={handleOptionSelected}
            onSectionChange={handleSectionChange}
            layoutConfig={layoutConfig()}
            {currentSequence}
            isTransitioning={isTransitioning || isUndoingOption}
            {isFadingOut}
          />
        {:else}
          <OptionViewerGridLayout
            organizedPictographs={organizedPictographs()}
            onPictographSelected={handleOptionSelected}
            layoutConfig={layoutConfig()}
            {currentSequence}
            {isFadingOut}
          />
        {/if}
      {/if}
    </div>

    <!-- Filter Panel -->
    <OptionFilterPanel
      isOpen={isFilterPanelOpen}
      {isContinuousOnly}
      onClose={onCloseFilters}
      {onToggleContinuous}
    />
  {/if}
</div>

<style>
  .option-picker-container {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: visible;
  }

  .option-picker-content {
    flex: 1;
    position: relative;
    overflow: visible;
    min-height: 0;
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

  .debug-copy-btn {
    margin-top: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
    border: 1px solid rgba(255, 193, 7, 0.4);
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s ease;
  }

  .debug-copy-btn:hover {
    background: rgba(255, 193, 7, 0.3);
    border-color: rgba(255, 193, 7, 0.6);
  }

  .copy-feedback {
    display: block;
    margin-top: var(--spacing-sm);
    color: #4caf50;
    font-size: 0.8rem;
  }
</style>
