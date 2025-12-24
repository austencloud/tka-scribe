<!--
OptionPickerContent.svelte - Content layout for option picker

Single responsibility: Organize prepared options into sections and layout.
Uses organizer and sizer services for section grouping and sizing.
-->
<script lang="ts">
  import type { PreparedPictographData } from '../services/PictographPreparer';
  import type { IOptionOrganizer } from '../services/contracts/IOptionOrganizer';
  import type { IOptionSizer } from '../services/contracts/IOptionSizer';
  import OptionSection from './OptionSection.svelte';
  import Option456Row from './Option456Row.svelte';
  import OptionGrid from './OptionGrid.svelte';
  import OptionCard from './OptionCard.svelte';
  import OptionViewerSwipeLayout from '../option-viewer/components/OptionViewerSwipeLayout.svelte';
  import OptionViewerSection from '../option-viewer/components/OptionViewerSection.svelte';

  interface Props {
    options: PreparedPictographData[];
    organizerService: IOptionOrganizer | null;
    sizerService: IOptionSizer | null;
    isFading?: boolean;
    onSelect: (option: PreparedPictographData) => void;
    // Filter props
    isContinuousOnly?: boolean;
    onToggleContinuous?: (value: boolean) => void;
    isSideBySideLayout?: () => boolean;
  }

  const {
    options,
    organizerService,
    sizerService,
    isFading = false,
    onSelect,
    isContinuousOnly = false,
    onToggleContinuous,
    isSideBySideLayout = () => false,
  }: Props = $props();

  // Track container dimensions with simple resize observer
  let containerElement: HTMLDivElement | null = $state(null);
  let containerWidth = $state(800); // Default to desktop-size to avoid mobile flash
  let containerHeight = $state(600);
  let sizingStable = $state(false);

  // Layout thresholds
  // Wide layout (>= 900px): 8-column grouped vertical layout
  // Narrow layout (< 900px): Horizontal swipe layout between type sections
  const WIDE_LAYOUT_THRESHOLD = 900;
  const shouldUseWideLayout = $derived(containerWidth >= WIDE_LAYOUT_THRESHOLD);

  // Column count: 8 for wide, 4 for narrow/swipe
  const columns = $derived(() => {
    return shouldUseWideLayout ? 8 : 4;
  });

  // Only show filter toggle when we have at least one actual beat (not just start position)
  // Without a beat, there's no rotation context to filter against
  const shouldShowFilterToggle = $derived(() => {
    // Options only exist when we have rotation context (at least 1 beat after start position)
    // The filter service requires currentSequence.length >= 2 to apply filtering
    return options.length > 0;
  });

  // Organize options into sections
  const organizedSections = $derived(() => {
    if (!organizerService || options.length === 0) {
      return [];
    }
    return organizerService.organizePictographs(options, 'type');
  });

  // Separate Types 1-3 (individual sections) from Types 4-6 (horizontal row)
  const types123Sections = $derived(() => {
    return organizedSections().filter(s =>
      s.title === 'Type1' || s.title === 'Type2' || s.title === 'Type3'
    );
  });

  const types456Sections = $derived(() => {
    return organizedSections().filter(s =>
      s.title === 'Type4' || s.title === 'Type5' || s.title === 'Type6'
    );
  });

  // ==================== LAYOUT MODE DETECTION ====================
  // Mobile stacked layout (workspace on top, tool panel on bottom) vs side-by-side desktop
  const isMobileStackedLayout = $derived(() => !isSideBySideLayout());

  // ==================== NARROW LAYOUT DECISIONS ====================
  // These are evaluated when container is narrow (< 900px) OR in mobile stacked layout

  // Use compact 4x4 grid for continuous mode when in mobile/narrow layout
  // Continuous options are typically 16 or fewer, fits nicely in 4x4
  const shouldUseCompact4x4 = $derived(() => {
    const isNarrowOrMobile = !shouldUseWideLayout || isMobileStackedLayout();
    return isNarrowOrMobile && isContinuousOnly && options.length <= 16;
  });

  // Use swipe layout when in mobile stacked layout OR narrow container
  const shouldUseSwipeLayout = $derived(() => {
    const sections = organizedSections();
    // Use swipe when:
    // - In mobile stacked layout (always use swipe for mobile)
    // - OR not using wide layout (container < 900px)
    // - AND not using compact 4x4 (continuous mode)
    // - AND have multiple sections to swipe between
    const shouldSwipe = isMobileStackedLayout() || !shouldUseWideLayout;
    return shouldSwipe && !shouldUseCompact4x4() && sections.length > 1;
  });

  // For swipe layout: combine Types 4-6 into a single grouped panel
  const swipeSections = $derived(() => {
    const sections123 = types123Sections();
    const sections456 = types456Sections();

    // Combine all Types 4-6 pictographs into one grouped section
    const grouped456Pictographs = sections456.flatMap(s => s.pictographs);

    if (grouped456Pictographs.length === 0) {
      return sections123;
    }

    return [
      ...sections123,
      {
        title: 'Types 4-6',
        pictographs: grouped456Pictographs,
        type: 'grouped' as const
      }
    ];
  });

  // ==================== DESKTOP SIZING ====================
  // Desktop uses the sizer service to calculate appropriate card sizes

  const desktopSizing = $derived(() => {
    const cols = columns();
    // Use reasonable defaults until stable
    if (!sizingStable || !sizerService) {
      return { cardSize: 80, columns: cols, gap: '8px' };
    }

    try {
      const result = sizerService.calculatePictographSize({
        count: options.length,
        containerWidth: containerWidth,
        containerHeight: containerHeight,
        columns: cols,
        isMobileDevice: false
      });

      return {
        cardSize: Math.max(60, Math.min(120, result.pictographSize)),
        columns: cols,
        gap: result.gridGap
      };
    } catch {
      return { cardSize: 80, columns: cols, gap: '8px' };
    }
  });

  // ==================== MOBILE LAYOUT CONFIGS ====================

  // Layout config for mobile swipe layout - allows OptionViewerSection to calculate optimal size
  const layoutConfig = $derived(() => {
    const cols = columns();
    return {
      optionsPerRow: cols,
      // Pass a generous max size - OptionViewerSection will calculate actual optimal size
      // based on available container space
      pictographSize: 200,  // Large max to allow filling available space
      spacing: 8,
      containerWidth: containerWidth,
      containerHeight: containerHeight,
      gridColumns: `repeat(${cols}, 1fr)`,  // Use fr units for flexible sizing
      gridGap: '8px',
    };
  });

  // Layout config for compact 4x4 continuous mode
  const compact4x4Config = $derived(() => {
    const gap = 4;
    // Calculate size to fit 4x4 grid in available space
    // Use viewport-based calculation for reliable sizing
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 600;
    const bottomNavHeight = 80;
    const filterToggleHeight = 40;
    const topUIHeight = 280; // Sequence display + action buttons
    const availableHeight = viewportHeight - topUIHeight - bottomNavHeight - filterToggleHeight;
    const availableWidth = containerWidth - 16; // padding

    // Size to fit 4 columns with gaps
    const maxByWidth = Math.floor((availableWidth - (gap * 3)) / 4);
    const maxByHeight = Math.floor((availableHeight - (gap * 3)) / 4);
    const pictographSize = Math.min(maxByWidth, maxByHeight, 100); // Cap at 100px

    return {
      optionsPerRow: 4,
      pictographSize: Math.max(60, pictographSize),
      spacing: gap,
      containerWidth: availableWidth,
      containerHeight: availableHeight,
      gridColumns: `repeat(4, 1fr)`,
      gridGap: `${gap}px`,
    };
  });

  // Simple resize observer - only update after stable
  $effect(() => {
    if (!containerElement) return;

    let timeoutId: number;
    const observer = new ResizeObserver((entries) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const entry = entries[0];
        if (entry) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 100 && h > 100) {
            containerWidth = w;
            containerHeight = h;
            sizingStable = true;
          }
        }
      }, 100); // Debounce 100ms
    });

    observer.observe(containerElement);

    // Initial measurement
    const rect = containerElement.getBoundingClientRect();
    if (rect.width > 100 && rect.height > 100) {
      containerWidth = rect.width;
      containerHeight = rect.height;
      sizingStable = true;
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  });
</script>

<div class="option-picker-content" bind:this={containerElement}>
  <!-- Filter toggle chip - only show when we have rotation context -->
  {#if shouldShowFilterToggle()}
    <div class="filter-header" class:mobile={shouldUseSwipeLayout()}>
      <button
        class="filter-toggle"
        class:mobile={shouldUseSwipeLayout()}
        class:continuous={isContinuousOnly}
        onclick={() => onToggleContinuous?.(!isContinuousOnly)}
        aria-label={isContinuousOnly ? "Showing continuous only - click for all" : "Showing all - click for continuous only"}
        aria-pressed={isContinuousOnly}
      >
        <i class="fas" class:fa-link={isContinuousOnly} class:fa-th={!isContinuousOnly}></i>
        <span class="filter-label">{isContinuousOnly ? "Continuous" : "All"}</span>
      </button>
    </div>
  {/if}

  {#if options.length === 0}
    <div class="empty-state">
      <p>No options available</p>
    </div>
  {:else if shouldUseCompact4x4()}
    <!-- ==================== COMPACT 4x4 LAYOUT ==================== -->
    <!-- Narrow container + continuous mode: Compact 4x4 grid -->
    <div class="compact-4x4-container">
      <OptionViewerSection
        pictographs={options}
        onPictographSelected={(p) => onSelect(p as PreparedPictographData)}
        layoutConfig={compact4x4Config()}
        fitToViewport={true}
        showHeader={false}
        isFadingOut={isFading}
      />
    </div>
  {:else if shouldUseSwipeLayout()}
    <!-- ==================== SWIPE LAYOUT ==================== -->
    <!-- Mobile stacked layout OR narrow container: Horizontal swipe between type sections -->
    <div class="swipe-container">
      <OptionViewerSwipeLayout
        organizedPictographs={swipeSections()}
        onPictographSelected={(p) => onSelect(p as PreparedPictographData)}
        layoutConfig={layoutConfig()}
        isFadingOut={isFading}
      />
    </div>
  {:else if shouldUseWideLayout && !isMobileStackedLayout()}
    <!-- ==================== WIDE DESKTOP LAYOUT ==================== -->
    <!-- Wide container (>= 900px): 8-column grouped vertical layout -->
    <div class="sections-container">
      <!-- Types 1-3: Individual vertical sections -->
      {#each types123Sections() as section (section.title)}
        <OptionSection
          letterType={section.title}
          options={section.pictographs}
          cardSize={desktopSizing().cardSize}
          columns={desktopSizing().columns}
          gap={desktopSizing().gap}
          showHeader={organizedSections().length > 1}
          {isFading}
          {onSelect}
        />
      {/each}

      <!-- Types 4-6: Horizontal row -->
      {#if types456Sections().length > 0}
        <Option456Row
          sections={types456Sections()}
          cardSize={desktopSizing().cardSize}
          columns={desktopSizing().columns}
          gap={desktopSizing().gap}
          {isFading}
          {onSelect}
        />
      {/if}
    </div>
  {:else}
    <!-- ==================== FALLBACK: SINGLE SECTION ==================== -->
    <!-- Narrow container with single type section -->
    <div class="swipe-container">
      <OptionViewerSection
        pictographs={options}
        onPictographSelected={(p) => onSelect(p as PreparedPictographData)}
        layoutConfig={layoutConfig()}
        fitToViewport={true}
        showHeader={false}
        isFadingOut={isFading}
      />
    </div>
  {/if}
</div>

<style>
  .option-picker-content {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    container-type: size;
  }

  /* Filter header - inline, minimal */
  .filter-header {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    position: relative;
  }

  .filter-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 14px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    margin: 4px 0;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .filter-toggle:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .filter-toggle:active {
    transform: scale(0.97);
  }

  /* Continuous state - highlighted */
  .filter-toggle.continuous {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
    color: rgba(147, 197, 253, 1);
  }

  .filter-toggle.continuous:hover {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.5);
  }

  .filter-toggle i {
    font-size: 11px;
  }

  /* Mobile: More compact */
  .filter-toggle.mobile {
    padding: 4px 10px;
    font-size: 11px;
    margin: 2px 0;
    border-radius: 12px;
  }

  .filter-toggle.mobile i {
    font-size: 9px;
  }

  .sections-container {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 8px;
    overflow-y: auto;
    min-height: 0;
  }

  .swipe-container {
    flex: 1;
    width: 100%;
    min-height: 0;
  }

  /* Compact 4x4 grid for continuous mode on mobile */
  .compact-4x4-container {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 0;
    overflow: hidden;
    padding: 8px;
  }

  /* Ensure the grid section inside fits and centers properly */
  .compact-4x4-container :global(.option-picker-section) {
    max-width: 100%;
    max-height: 100%;
  }

  .compact-4x4-container :global(.pictographs-grid) {
    justify-content: center;
    align-content: center;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted, #888);
    font-size: var(--font-size-min, 14px);
  }
</style>
