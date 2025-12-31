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
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount, untrack } from "svelte";
  import { fade } from "svelte/transition";
  import { getSettings } from "$lib/shared/application/state/app-state.svelte";

  import ConstructPickerHeader from "$lib/features/create/construct/shared/components/ConstructPickerHeader.svelte";
  import type { ILayoutDetector } from "../../services/contracts/ILayoutDetector";
  import type { IOptionFilter } from "../services/contracts/IOptionFilter";
  import type { IOptionLoader } from "../services/contracts/IOptionLoader";
  import type { IOptionOrganizer } from "../services/contracts/IOptionOrganizer";
  import type { IOptionSizer } from "../services/contracts/IOptionSizer";
  import type { IOptionSorter } from "../services/contracts/IOptionSorter";
  import type { ISectionTitleFormatter } from "../services/contracts/ISectionTitleFormatter";
  import type { IPictographPreparer } from "$lib/features/create/construct/option-picker/services/contracts/IPictographPreparer";
  import { createContainerDimensionTracker } from "../state/container-dimension-tracker.svelte";
  import { createOptionPickerState } from "../state/option-picker-state.svelte";
  import type { PreparedPictographData } from "$lib/shared/pictograph/option/PreparedPictographData";
  import { stabilizePreparedOptions } from "../utils/prepared-pictograph-cache";
  import { buildOptionViewerDebugText } from "../utils/option-viewer-debug";
  import OptionFilterPanel from "./OptionFilterPanel.svelte";
  import OptionViewerGridLayout from "./OptionViewerGridLayout.svelte";
  import OptionViewerSwipeLayout from "./OptionViewerSwipeLayout.svelte";
  import { getAnimationVisibilityManager } from "$lib/shared/animation-engine/state/animation-visibility-state.svelte";

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
  let LayoutDetector: ILayoutDetector | null = null;
  let sectionTitleFormatter: ISectionTitleFormatter | null = null;
  let hapticService: IHapticFeedback | null = null;

  // Service for batch preparation
  let pictographPreparer: IPictographPreparer | null = null;

  // ===== STATE =====
  let optionPickerState = $state<ReturnType<
    typeof createOptionPickerState
  > | null>(null);
  let servicesReady = $state(false);
  let currentSectionTitle = $state<string>("Type 1");
  let isFadingOut = $state(false);
  let debugCopied = $state(false);

  // Prepared pictograph data (with pre-calculated positions)
  let preparedOptions = $state<PreparedPictographData[]>([]);
  let isPreparingOptions = $state(false);

  // Fade coordination: prevents premature fade-in during option loading
  let pendingFadeIn = $state(false);

  // Global Lights Off state
  const animationVisibilityManager = getAnimationVisibilityManager();
  let lightsOff = $state(animationVisibilityManager.isLightsOff());
  let lastCheckedLightsOff = animationVisibilityManager.isLightsOff();

  // Cache for stable object references - prevents component recreation
  let preparedCache = new Map<string, PreparedPictographData>();

  const containerDimensions = createContainerDimensionTracker();
  const contentAreaDimensions = createContainerDimensionTracker();
  let containerElement: HTMLElement;
  let contentAreaElement: HTMLElement;

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
    if (!preparedOptions.length || !optionOrganizerService) {
      return [];
    }

    const serviceResult = optionOrganizerService.organizePictographs(
      preparedOptions,
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
    // When fitToViewport is true (continuous mode on mobile), use content area dimensions
    // This ensures the grid sizes correctly between the header and bottom nav
    const isFitToViewport = shouldFitToViewport();
    const effectiveWidth = containerDimensions.width;
    const effectiveHeight = isFitToViewport && contentAreaDimensions.isReady
      ? contentAreaDimensions.height
      : containerDimensions.height;

    if (!optionPickerSizingService || !optionPickerState) {
      return {
        optionsPerRow: 4,
        pictographSize: 144,
        spacing: 8,
        containerWidth: effectiveWidth,
        containerHeight: effectiveHeight,
        gridColumns: "repeat(4, 1fr)",
        gridGap: "8px",
      };
    }

    const optionsPerRow = optionPickerSizingService.getOptimalColumns(
      effectiveWidth,
      effectiveWidth < 600
    );

    const layoutMode: "8-column" | "4-column" =
      optionsPerRow === 8 ? "8-column" : "4-column";

    const maxPictographsPerSection = Math.max(
      ...organizedPictographs().map((section) => section.pictographs.length),
      8
    );

    const sizingResult = optionPickerSizingService.calculateOverflowAwareSize({
      containerWidth: effectiveWidth,
      containerHeight: effectiveHeight,
      layoutMode,
      maxPictographsPerSection,
      isMobileDevice: effectiveWidth < 800,
      headerHeight: 40,
      targetOverflowBuffer: 30,
    });

    return {
      optionsPerRow,
      pictographSize: sizingResult.pictographSize,
      spacing: parseInt(sizingResult.gridGap.replace("px", "")),
      containerWidth: effectiveWidth,
      containerHeight: effectiveHeight,
      gridColumns: `repeat(${optionsPerRow}, 1fr)`,
      gridGap: sizingResult.gridGap,
    };
  });

  // ===== DERIVED - Layout mode decisions =====
  const shouldUseSwipeLayout = $derived(() => {
    if (!LayoutDetector || organizedPictographs().length <= 1) {
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

    return LayoutDetector.shouldUseHorizontalSwipe(
      layoutConfig(),
      organizedPictographs().length,
      true
    );
  });

  /**
   * On mobile with continuous filter, fit all options in viewport without scrolling.
   * This applies when:
   * - On mobile (width < 800px)
   * - Continuous filter is active
   * - We have 2+ beats (meaningful filtering)
   */
  const shouldFitToViewport = $derived(() => {
    const isMobile = containerDimensions.width < 800;
    return isMobile && isContinuousOnly && currentSequence.length >= 2;
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
      !optionPickerState?.filteredOptions?.length ||
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
    // Load options even during fade - the preparation effect handles fade-in timing
    // Loading during fade ensures new options are ready when fade completes
    if (
      optionPickerState &&
      servicesReady &&
      currentSequence &&
      currentSequence.length > 0
    ) {
      console.log("🔄 [OptionViewer $effect] Triggering loadOptions", {
        sequenceLength: currentSequence.length,
        gridMode: currentGridMode,
        timestamp: Date.now(),
      });
      optionPickerState.loadOptions(currentSequence, currentGridMode);
    } else if (
      optionPickerState &&
      servicesReady &&
      (!currentSequence || currentSequence.length === 0)
    ) {
      console.log("🔄 [OptionViewer $effect] Resetting state - empty sequence");
      optionPickerState.reset();
    }
  });

  // ===== EFFECTS - Undo transitions =====
  $effect(() => {
    if (isUndoingOption && optionPickerState) {
      // Start fade-out
      isFadingOut = true;

      // After fade-out completes, fade back in
      // The $effect above will automatically reload options when isFadingOut becomes false
      setTimeout(() => {
        isFadingOut = false;
      }, FADE_OUT_DURATION);
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

  // ===== EFFECTS - Prepare pictographs with positions =====
  $effect(() => {
    // ONLY track filteredOptions and state - use untrack for fade state to prevent
    // premature re-runs when pendingFadeIn/isFadingOut change
    const filtered = optionPickerState?.filteredOptions || [];
    const pickerState = optionPickerState?.state;
    // Include prop type settings as dependencies - re-prepare when prop type changes (P button)
    const settings = getSettings();
    const _bluePropType = settings.bluePropType;
    const _redPropType = settings.redPropType;

    // Read fade state without tracking (prevents effect re-run on fade state changes)
    const currentPendingFadeIn = untrack(() => pendingFadeIn);
    const currentIsFadingOut = untrack(() => isFadingOut);

    console.log("🔄 [Preparation Effect] Triggered", {
      filteredCount: filtered.length,
      firstOption: filtered[0]?.letter,
      pickerState,
      isFadingOut: currentIsFadingOut,
      pendingFadeIn: currentPendingFadeIn,
    });

    // Skip while loading - prevents preparing intermediate states when
    // currentSequence updates before options finish loading
    if (pickerState === "loading") {
      console.log("⏳ [Preparation Effect] Skipped - picker is loading");
      return;
    }

    if (filtered.length === 0) {
      preparedOptions = [];
      isPreparingOptions = false;
      // Only reset fade state if NOT waiting for new options (prevents premature fade-in)
      if (!currentPendingFadeIn) {
        isFadingOut = false;
      }
      return;
    }

    // Skip if services not ready
    if (!servicesReady) {
      return;
    }

    // Skip if preparer not initialized
    if (!pictographPreparer) {
      return;
    }

    // Prepare all pictographs in batch
    isPreparingOptions = true;

    pictographPreparer.prepareBatch(filtered)
      .then((prepared) => {
        console.log("✅ [Preparation Effect] Complete", {
          preparedCount: prepared.length,
          firstPrepared: prepared[0]?.letter,
          hasPositions: !!prepared[0]?._prepared,
          pendingFadeIn,
        });

        // Memoize: reuse existing objects if ID matches (prevents component recreation)
        const stabilized = stabilizePreparedOptions(
          prepared,
          preparedCache
        );

        preparedOptions = stabilized;
        isPreparingOptions = false;

        // Fade in after new options are ready (coordinated with pendingFadeIn)
        if (pendingFadeIn) {
          console.log(
            "✨ [Preparation Effect] pendingFadeIn=true, triggering fade-in"
          );
          pendingFadeIn = false;
          isFadingOut = false;
        } else {
          // Not waiting for fade-in, just ensure visible
          isFadingOut = false;
        }
      })
      .catch((error) => {
        console.error("Failed to prepare pictographs:", error);
        // Fallback: use unprepared options
        preparedOptions = filtered as PreparedPictographData[];
        isPreparingOptions = false;
        pendingFadeIn = false;
        isFadingOut = false;
      });
  });

  // ===== HANDLERS =====
  async function handleOptionSelected(option: PictographData) {
    if (!optionPickerState || isFadingOut) {
      console.log(
        "⛔ [handleOptionSelected] Blocked - already fading or no state"
      );
      return;
    }

    console.log("🖱️ [handleOptionSelected] Starting fade-out");
    hapticService?.trigger("selection");

    // Step 1: Mark that we need to fade in after new options load
    pendingFadeIn = true;

    // Step 2: Start fade-out, disable buttons
    isFadingOut = true;
    console.log(
      "🌫️ [handleOptionSelected] isFadingOut = true, pendingFadeIn = true, waiting for fade..."
    );

    // Step 3: Wait for fade-out to complete BEFORE updating data
    // This ensures the user sees the current content fade out
    await new Promise((resolve) => setTimeout(resolve, FADE_OUT_DURATION));

    console.log("⏱️ [handleOptionSelected] Fade complete, updating data...");

    // Step 4: Now update the data (while content is invisible)
    onOptionSelected(option);
    optionPickerState.selectOption(option);

    console.log(
      "📦 [handleOptionSelected] Data updated, waiting for preparation..."
    );
    // Note: isFadingOut will be set to false by the preparation effect
    // when new content is ready AND pendingFadeIn is true, triggering fade-in
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

    const debugText = buildOptionViewerDebugText(
      optionPickerState.getDebugInfo(),
      {
        currentSequence,
        currentGridMode,
        isUndoingOption,
        isFadingOut,
        servicesReady,
        containerDimensions: {
          width: containerDimensions.width,
          height: containerDimensions.height,
          isReady: containerDimensions.isReady,
        },
        organizedPictographsCount: organizedPictographs().length,
      }
    );

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
    // Poll for Lights Off changes using requestAnimationFrame
    // This bypasses the observer pattern which has closure issues in Svelte 5
    let rafId: number | null = null;
    let isPolling = true;

    const pollLightsOff = () => {
      if (!isPolling) return;

      const currentValue = animationVisibilityManager.isLightsOff();
      if (currentValue !== lastCheckedLightsOff) {
        lastCheckedLightsOff = currentValue;
        lightsOff = currentValue;
      }

      rafId = requestAnimationFrame(pollLightsOff);
    };

    // Start polling
    rafId = requestAnimationFrame(pollLightsOff);

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
      LayoutDetector = resolve<ILayoutDetector>(
        TYPES.ILayoutDetector
      );
      sectionTitleFormatter = resolve<ISectionTitleFormatter>(
        TYPES.ISectionTitleFormatter
      );
      hapticService = resolve<IHapticFeedback>(
        TYPES.IHapticFeedback
      );

      // Resolve batch preparer
      pictographPreparer = resolve<IPictographPreparer>(TYPES.IPictographPreparer);

      // Create state
      optionPickerState = createOptionPickerState({
        optionLoader,
        filterService,
        optionSorter,
      });

      // Initialize with the prop value BEFORE marking services ready
      // This ensures filtering is applied when options first load
      if (isContinuousOnly) {
        optionPickerState.setContinuousOnly(isContinuousOnly);
      }

      servicesReady = true;
    } catch (error) {
      console.error("Failed to initialize option picker services:", error);
    }

    // Setup container tracking
    let containerCleanup: (() => void) | undefined;
    if (containerElement) {
      containerCleanup = containerDimensions.attachToElement(containerElement);
    }

    // Return cleanup function
    return () => {
      // Stop polling
      isPolling = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      containerCleanup?.();
    };
  });

  // Setup content area tracking when element becomes available
  // (it's inside a conditional block so can't be done in onMount)
  $effect(() => {
    if (contentAreaElement) {
      const cleanup = contentAreaDimensions.attachToElement(contentAreaElement);
      return cleanup;
    }
  });
</script>

<div
  class="option-picker-container"
  bind:this={containerElement}
  data-testid="option-picker"
  data-grid-mode={currentGridMode}
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
    <div class="option-picker-content" bind:this={contentAreaElement}>
      {#if !containerDimensions.isReady || (shouldFitToViewport() && !contentAreaDimensions.isReady)}
        <div class="loading-state">
          <p>Initializing container...</p>
        </div>
      {:else if optionPickerState.state === "loading" && preparedOptions.length === 0}
        <!-- Only show loading message on initial load, not during updates -->
        <div class="loading-state">
          <p>Loading options...</p>
        </div>
      {:else if optionPickerState.error}
        <div class="error-state">
          <p>Error loading options: {optionPickerState.error}</p>
          <button onclick={() => optionPickerState?.clearError()}>Retry</button>
        </div>
      {:else if preparedOptions.length === 0 && !isFadingOut}
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
      {:else if preparedOptions.length > 0}
        <!-- Fade wrapper - inline style for reliable opacity transition -->
        <div
          class="fade-wrapper"
          style="opacity: {isFadingOut
            ? 0
            : 1}; transition: opacity {isFadingOut
            ? FADE_OUT_DURATION
            : FADE_IN_DURATION}ms ease;"
        >
          {#if shouldUseSwipeLayout()}
            <OptionViewerSwipeLayout
              organizedPictographs={organizedPictographs()}
              onPictographSelected={handleOptionSelected}
              onSectionChange={handleSectionChange}
              layoutConfig={layoutConfig()}
              {currentSequence}
              {isFadingOut}
              {lightsOff}
            />
          {:else}
            <OptionViewerGridLayout
              organizedPictographs={organizedPictographs()}
              onPictographSelected={handleOptionSelected}
              layoutConfig={layoutConfig()}
              {currentSequence}
              {isFadingOut}
              fitToViewport={shouldFitToViewport()}
              {lightsOff}
            />
          {/if}
        </div>
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
    overflow: hidden; /* Prevent content from spilling outside bounds */
    min-height: 0;
    box-sizing: border-box;
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

  /* Fade wrapper for smooth transitions between option sets */
  .fade-wrapper {
    width: 100%;
    height: 100%;
    opacity: 1;
    transition: opacity var(--fade-in-duration, 250ms) ease-in;
  }
</style>
