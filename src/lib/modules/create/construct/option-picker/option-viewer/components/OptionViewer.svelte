<!--
OptionViewer.svelte - Clean option display grid orchestrator

Refactored to be a lightweight orchestrator that delegates to specialized components:
- FilterButton: Floating filter button with styling and logic
- FilterStatusDisplay: Filter status information display
- Layout components: SwipeLayout and GridLayout for different interaction patterns

Business logic moved to state management and utility services.
-->
<script lang="ts">
  import type { GridMode, IHapticFeedbackService, PictographData } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import ConstructPickerHeader from "../../../shared/components/ConstructPickerHeader.svelte";
  import type { ILayoutDetectionService } from "../../services/contracts/ILayoutDetectionService";
  import type { IOptionSizer, IOptionTransitionCoordinator } from "../services";
  import type {
    IOptionFilter,
    IOptionLoader,
    IOptionOrganizer,
    IOptionSorter
  } from "../services/contracts";
  import { createContainerDimensionTracker, createOptionPickerState } from "../state";
  import { LetterTypeTextPainter } from "../utils/letter-type-text-painter";
  import FloatingFilterButton from "./FloatingFilterButton.svelte";
  import OptionFilterPanel from "./OptionFilterPanel.svelte";
  import OptionViewerGridLayout from "./OptionViewerGridLayout.svelte";
  import OptionViewerSwipeLayout from "./OptionViewerSwipeLayout.svelte";

  // Props
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

  // Services - initialized asynchronously
  let optionPickerSizingService: IOptionSizer | null = null;
  let optionOrganizerService: IOptionOrganizer | null = null;
  let layoutDetectionService: ILayoutDetectionService | null = null;
  let transitionCoordinator: IOptionTransitionCoordinator | null = null;
  let optionPickerState = $state<ReturnType<typeof createOptionPickerState> | null>(null);
  let servicesReady = $state(false);
  let hapticService: IHapticFeedbackService;

  // Transition state (synced with coordinator)
  let isFadingOut = $state(false);
  let isTransitioning = $state(false);

  // Sync transition state with coordinator reactively
  $effect(() => {
    if (!transitionCoordinator) return;

    const state = transitionCoordinator.getState();
    isFadingOut = state.isFadingOut;
    isTransitioning = state.isTransitioning;
  });

  // Container dimension tracking
  const containerDimensions = createContainerDimensionTracker();

  // Container element reference
  let containerElement: HTMLElement;

  // Track current section for header display
  let currentSectionTitle = $state<string>("Type 1");

  // Type descriptions for colored formatting
  const typeDescriptions = {
    Type1: { description: "Dual-Shift", typeName: "Type 1" },
    Type2: { description: "Shift", typeName: "Type 2" },
    Type3: { description: "Cross-Shift", typeName: "Type 3" },
    Type4: { description: "Dash", typeName: "Type 4" },
    Type5: { description: "Dual-Dash", typeName: "Type 5" },
    Type6: { description: "Static", typeName: "Type 6" },
  };

  // Format section title with colored text
  function formatSectionTitle(rawTitle: string): string {
    // Handle grouped section - show all three types with colors
    if (rawTitle === "Types 4-6") {
      // Format as: "Types 4, 5, 6: Dash, Dual-Dash, Static"
      const dash = LetterTypeTextPainter.getColoredText("Dash");
      const dualDash = LetterTypeTextPainter.getColoredText("Dual-Dash");
      const staticText = LetterTypeTextPainter.getColoredText("Static");
      return `Types 4-6:&nbsp;${dash},&nbsp;${dualDash},&nbsp;${staticText}`;
    }

    // Handle individual types
    const typeInfo = typeDescriptions[rawTitle as keyof typeof typeDescriptions];
    if (typeInfo) {
      return LetterTypeTextPainter.formatSectionHeader(typeInfo.typeName, typeInfo.description);
    }

    return rawTitle;
  }

  // Derived formatted title for display
  const formattedSectionTitle = $derived(formatSectionTitle(currentSectionTitle));

  // Handle section change from swipe container
  function handleSectionChange(sectionIndex: number) {
    const sections = organizedPictographs();
    if (sections[sectionIndex]) {
      currentSectionTitle = sections[sectionIndex].title;
    }
  }

  // Real-time overflow monitoring (delegated to service)
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

  // Layout configuration using sizing service
  const layoutConfig = $derived(() => {

    // Return fallback if services not ready
    if (!optionPickerSizingService || !optionPickerState) {
      return {
        optionsPerRow: 4,
        pictographSize: 144,
        spacing: 8,
        containerWidth: containerDimensions.width,
        containerHeight: containerDimensions.height,
        gridColumns: 'repeat(4, 1fr)',
        gridGap: '8px',
      };
    }

    // Get optimal columns from sizing service
    const optionsPerRow = optionPickerSizingService.getOptimalColumns(
      containerDimensions.width,
      containerDimensions.width < 600 // isMobileDevice - Z Fold 6 friendly breakpoint
    );

    // Determine layout mode and calculate maximum pictographs per section
    const layoutMode: '8-column' | '4-column' = optionsPerRow === 8 ? '8-column' : '4-column';

    // Calculate max pictographs per section from organized data
    const maxPictographsPerSection = Math.max(
      ...organizedPictographs().map(section => section.pictographs.length),
      8 // Minimum assumption for sizing calculations
    );

    // Use overflow-aware sizing to prevent content from being cut off
    const sizingParams = {
      containerWidth: containerDimensions.width,
      containerHeight: containerDimensions.height,
      layoutMode,
      maxPictographsPerSection,
      isMobileDevice: containerDimensions.width < 800, // align with layout breakpoint
      headerHeight: 40, // Approximate section header height
      targetOverflowBuffer: 30, // Increased buffer for better safety margin
    };

    const sizingResult = optionPickerSizingService.calculateOverflowAwareSize(sizingParams);

    const finalConfig = {
      optionsPerRow,
      pictographSize: sizingResult.pictographSize,
      spacing: parseInt(sizingResult.gridGap.replace('px', '')),
      containerWidth: containerDimensions.width,
      containerHeight: containerDimensions.height,
      gridColumns: `repeat(${optionsPerRow}, 1fr)`,
      gridGap: sizingResult.gridGap,
    };

    return finalConfig;
  });

  // Organize pictographs using service (business logic in service)
  const organizedPictographs = $derived(() => {
    if (!optionPickerState?.filteredOptions.length || !optionOrganizerService) {
      return [];
    }

    // Always organize by type for simplicity
    const serviceResult = optionOrganizerService.organizePictographs(
      optionPickerState.filteredOptions,
      'type'
    );

    // Convert service result to match expected format
    return serviceResult.map(section => ({
      title: section.title,
      pictographs: section.pictographs,
      type: section.type === 'grouped' ? 'grouped' as const : 'individual' as const
    }));
  });

  // Handle option selection with coordinated fade-out/fade-in animation
  function handleOptionSelected(option: PictographData) {
    if (!optionPickerState || !transitionCoordinator || isTransitioning) return;

    try {
      performance.mark('option-click-start');

      // Trigger selection haptic feedback
      hapticService?.trigger("selection");

      // 🎯 INSTANT FEEDBACK: Add to workbench IMMEDIATELY
      onOptionSelected(option);
      performance.mark('option-selected-callback-complete');

      // 🎬 Start transition (coordinator manages timing, $effect syncs state)
      transitionCoordinator.beginOptionSelection({
        onMidFadeOut: () => {
          // Update state while content is faded out
          optionPickerState!.selectOption(option);
          if (optionPickerState && currentSequence && currentSequence.length > 0) {
            optionPickerState.loadOptions(currentSequence, currentGridMode);
          }
          performance.mark('option-picker-state-complete');
        },
        onComplete: () => {
          performance.mark('transition-complete');
        },
      });

    } catch (error) {
      console.error("Failed to select option:", error);
      transitionCoordinator?.getState().cancel();
    }
  }

  // Reactive effect to load options when sequence changes (but not during transitions)
  $effect(() => {
    // Don't reload options during transitions to prevent navigation flash and panel reset
    if (isTransitioning) {
      return;
    }

    if (optionPickerState && servicesReady && currentSequence && currentSequence.length > 0) {
      optionPickerState.loadOptions(currentSequence, currentGridMode);
    } else if (optionPickerState && servicesReady && (!currentSequence || currentSequence.length === 0)) {
      optionPickerState.reset();
    }
  });

  // Watch for undo option trigger and animate the transition
  $effect(() => {
    if (isUndoingOption && optionPickerState && transitionCoordinator && !isTransitioning) {
      transitionCoordinator.beginUndoTransition({
        onMidFadeOut: () => {
          if (optionPickerState && currentSequence && currentSequence.length > 0) {
            optionPickerState.loadOptions(currentSequence, currentGridMode);
          }
        },
      });
      // State is automatically synced by the reactive $effect above
    }
  });

  // Determine if we should use swipe layout
  // CRITICAL: When in stacked layout (workbench on top, option picker on bottom),
  // ALWAYS use horizontal swipe, even if container is wide. Traditional grid layout
  // should only be used in true side-by-side desktop/tablet layouts.
  const shouldUseSwipeLayout = $derived(() => {
    if (!layoutDetectionService || !layoutConfig() || organizedPictographs().length <= 1) {
      return false;
    }

    // If in stacked layout (mobile), always use swipe for multiple sections
    const isStackedLayout = !isSideBySideLayout();
    if (isStackedLayout && organizedPictographs().length > 1) {
      return true;
    }

    // Otherwise, use the layout detection service logic
    return layoutDetectionService.shouldUseHorizontalSwipe(
      layoutConfig(),
      organizedPictographs().length,
      true // enableHorizontalSwipe
    );
  });

  // Sync external continuity state with option picker state
  $effect(() => {
    if (optionPickerState && optionPickerState.isContinuousOnly !== isContinuousOnly) {
      optionPickerState.setContinuousOnly(isContinuousOnly);
    }
  });

  // Determine if we should use floating button (delegated to service)
  const shouldUseFloatingButton = $derived(() => {
    if (!optionPickerState?.filteredOptions.length || !optionPickerSizingService || containerDimensions.height === 0) {
      return false;
    }

    const config = layoutConfig();
    const maxPictographsPerSection = Math.max(
      ...organizedPictographs().map(section => section.pictographs.length),
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

  // Initialize services and setup container tracking
  onMount(() => {
    // Initialize services
    try {
      const optionLoader = resolve<IOptionLoader>(TYPES.IOptionLoader);
      const filterService = resolve<IOptionFilter>(TYPES.IOptionFilter);
      const optionSorter = resolve<IOptionSorter>(TYPES.IOptionSorter);
      optionOrganizerService = resolve<IOptionOrganizer>(TYPES.IOptionOrganizerService);
      optionPickerSizingService = resolve<IOptionSizer>(TYPES.IOptionPickerSizingService);
      layoutDetectionService = resolve<ILayoutDetectionService>(TYPES.ILayoutDetectionService);
      transitionCoordinator = resolve<IOptionTransitionCoordinator>(TYPES.IOptionTransitionCoordinator);
      hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
      optionPickerState = createOptionPickerState({
        optionLoader,
        filterService,
        optionSorter,
      });
      servicesReady = true;
    } catch (error) {
      console.error("Failed to initialize option picker services:", error);
    }

    // Setup container dimension tracking
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
    <!-- Conditional header: show full header on larger screens, floating button on small screens -->
    {#if !shouldUseFloatingButton()}
      <div transition:fade={{ duration: 200 }}>
        <ConstructPickerHeader
          variant="options"
          title="Options"
          titleHtml={formattedSectionTitle}
          {isContinuousOnly}
          {isFilterPanelOpen}
          {onOpenFilters}
        />
      </div>
    {/if}

    <!-- Main content -->
    <div class="option-picker-content">
      <!-- Floating filter button for small screens -->
      {#if shouldUseFloatingButton()}
        <div transition:fade={{ duration: 200 }}>
          <FloatingFilterButton
            {isFilterPanelOpen}
            {isContinuousOnly}
            {onOpenFilters}
            containerWidth={containerDimensions.width}
            pictographSize={layoutConfig()?.pictographSize ?? 0}
            columns={layoutConfig()?.optionsPerRow ?? 4}
            gridGap={parseInt(layoutConfig()?.gridGap?.replace('px', '') ?? '2')}
          />
        </div>
      {/if}
      <!-- State handling: loading, error, empty states -->
      {#if !containerDimensions.isReady}
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
          <button onclick={() => optionPickerState?.clearError()}>Retry</button>
        </div>
      {:else if optionPickerState.filteredOptions.length === 0 && !isTransitioning}
        <div class="empty-state">
          <p>No options available for the current sequence.</p>
          <p>Debug: Total options: {optionPickerState.options.length}, Filtered: {optionPickerState.filteredOptions.length}</p>
          <p>Continuous only: {optionPickerState.isContinuousOnly}</p>
        </div>
      {:else if optionPickerState.filteredOptions.length > 0}
        <!-- Layout selection: Swipe or Grid -->
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
            isTransitioning={isTransitioning || isUndoingOption}
            {isFadingOut}
          />
        {/if}
      {/if}
    </div>

    <!-- Filter Panel Dropdown -->
    <OptionFilterPanel
      isOpen={isFilterPanelOpen}
      {isContinuousOnly}
      onClose={onCloseFilters}
      onToggleContinuous={onToggleContinuous}
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


    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 12px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);

    overflow: visible; /* Allow edge content to be fully visible */
  }

  .option-picker-content {
    flex: 1;
    position: relative;
    overflow: visible; /* Allow edge content to be fully visible */
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
