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
  import OptionViewerSwipeLayout from '../option-viewer/components/OptionViewerSwipeLayout.svelte';

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
  let containerWidth = $state(400);
  let containerHeight = $state(600);
  let sizingStable = $state(false);

  // Mobile detection based on width
  const isMobile = $derived(containerWidth < 768);
  const columns = $derived(isMobile ? 4 : 8);

  // Continuous mode on mobile: use compact 4x4 grid (16 options fit perfectly)
  const shouldUseCompact4x4 = $derived(() => {
    return isMobile && isContinuousOnly && options.length <= 16 && options.length > 0;
  });

  // Calculate optimal card size for 4x4 grid
  const compact4x4Sizing = $derived(() => {
    if (!shouldUseCompact4x4()) return null;

    const gap = 6;
    const padding = 8;
    const headerHeight = 28; // filter toggle

    // Available dimensions
    const availableWidth = containerWidth - (padding * 2);
    const availableHeight = containerHeight - headerHeight - (padding * 2);

    // Calculate card size to fit 4x4 with gaps
    const cardWidth = (availableWidth - (gap * 3)) / 4;
    const cardHeight = (availableHeight - (gap * 3)) / 4;

    // Use the smaller dimension to keep cards square, with min/max bounds
    const cardSize = Math.max(60, Math.min(100, Math.floor(Math.min(cardWidth, cardHeight))));

    return {
      cardSize,
      gap: `${gap}px`,
      columns: 4
    };
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

  // Use swipe layout on mobile when NOT in side-by-side mode
  const shouldUseSwipeLayout = $derived(() => {
    const sections = organizedSections();
    // Only use swipe when:
    // - On mobile (stacked layout)
    // - Not in side-by-side layout
    // - Have multiple sections to swipe between
    return isMobile && !isSideBySideLayout() && sections.length > 1;
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

  // Calculate sizing - use stable values
  const sizing = $derived(() => {
    // Use reasonable defaults until stable
    if (!sizingStable || !sizerService) {
      return { cardSize: 80, columns: columns, gap: '8px' };
    }

    try {
      const result = sizerService.calculatePictographSize({
        count: options.length,
        containerWidth: containerWidth,
        containerHeight: containerHeight,
        columns: columns,
        isMobileDevice: isMobile
      });

      return {
        cardSize: Math.max(60, Math.min(120, result.pictographSize)),
        columns: columns,
        gap: result.gridGap
      };
    } catch {
      return { cardSize: 80, columns: columns, gap: '8px' };
    }
  });

  // Layout config for swipe layout component
  const layoutConfig = $derived(() => ({
    optionsPerRow: columns,
    pictographSize: sizing().cardSize,
    spacing: parseInt(sizing().gap) || 8,
    containerWidth: containerWidth,
    containerHeight: containerHeight,
    gridColumns: `repeat(${columns}, ${sizing().cardSize}px)`,
    gridGap: sizing().gap,
  }));

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
  <!-- Filter toggle chip -->
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

  {#if options.length === 0}
    <div class="empty-state">
      <p>No options available</p>
    </div>
  {:else if shouldUseCompact4x4()}
    <!-- Mobile Continuous: Compact 4x4 grid showing all 16 options -->
    {@const sizing4x4 = compact4x4Sizing()}
    <div
      class="compact-4x4-grid"
      style:opacity={isFading ? 0 : 1}
      style:--card-size="{sizing4x4?.cardSize ?? 75}px"
      style:--grid-gap={sizing4x4?.gap ?? '6px'}
    >
      {#each options as option (option.id || `${option.letter}-${option.startPosition}-${option.endPosition}`)}
        <button
          class="compact-option-card"
          class:disabled={isFading}
          onclick={() => !isFading && onSelect(option)}
          disabled={isFading}
        >
          <img
            src={option.thumbnailUrl || option.imageUrl}
            alt={option.letter || 'Option'}
            loading="eager"
          />
        </button>
      {/each}
    </div>
  {:else if shouldUseSwipeLayout()}
    <!-- Mobile: Swipe between sections (Types 4-6 combined into one panel) -->
    <div class="swipe-container" style:opacity={isFading ? 0 : 1}>
      <OptionViewerSwipeLayout
        organizedPictographs={swipeSections()}
        onPictographSelected={(p) => onSelect(p as PreparedPictographData)}
        layoutConfig={layoutConfig()}
        isFadingOut={isFading}
      />
    </div>
  {:else}
    <!-- Desktop: Grid layout with Types 4-6 in horizontal row -->
    <div class="sections-container">
      <!-- Types 1-3: Individual vertical sections -->
      {#each types123Sections() as section (section.title)}
        <OptionSection
          letterType={section.title}
          options={section.pictographs}
          cardSize={sizing().cardSize}
          columns={sizing().columns}
          gap={sizing().gap}
          showHeader={organizedSections().length > 1}
          {isFading}
          {onSelect}
        />
      {/each}

      <!-- Types 4-6: Horizontal row -->
      {#if types456Sections().length > 0}
        <Option456Row
          sections={types456Sections()}
          cardSize={sizing().cardSize}
          columns={sizing().columns}
          gap={sizing().gap}
          {isFading}
          {onSelect}
        />
      {/if}
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
    transition: opacity 250ms ease-out;
  }

  /* Compact 4x4 grid for continuous mode on mobile */
  .compact-4x4-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(4, var(--card-size));
    grid-template-rows: repeat(4, var(--card-size));
    gap: var(--grid-gap);
    justify-content: center;
    align-content: center;
    padding: 8px;
    transition: opacity 250ms ease-out;
  }

  .compact-option-card {
    width: var(--card-size);
    height: var(--card-size);
    padding: 0;
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    cursor: pointer;
    overflow: hidden;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .compact-option-card:hover {
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.02);
  }

  .compact-option-card:active {
    transform: scale(0.96);
    border-color: rgba(59, 130, 246, 0.6);
  }

  .compact-option-card.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .compact-option-card img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
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
