<!--
OptionViewerSection.svelte - Section component for option picker

Renders a section with:
- Section header with letter type
- Grid of pictographs for that letter type
- Beautiful fade animations when options change
-->
<script lang="ts">
  import type {
    IReversalDetector,
    PictographWithReversals,
  } from "$lib/features/create/shared/services/contracts/IReversalDetector";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import { LetterTypeTextPainter } from "../utils/letter-type-text-painter";
  import { getLetterBorderColors } from "$lib/shared/pictograph/shared/utils/letter-border-utils";
  import OptionPictographCell from "./OptionPictographCell.svelte";
  import type { PreparedPictographData } from "$lib/shared/pictograph/option/PreparedPictographData";

  // Props - lightsOff is passed down from OptionViewer which manages the subscription
  const {
    letterType = "mixed",
    pictographs = [],
    onPictographSelected = () => {},
    layoutConfig,
    currentSequence = [],
    isFadingOut = false,
    contentAreaBounds = null,
    forcedPictographSize,
    showHeader = true,
    fitToViewport = false,
    lightsOff = false,
  } = $props<{
    letterType?: string;
    pictographs?: PictographData[];
    onPictographSelected?: (pictograph: PictographData) => void;
    layoutConfig?: {
      optionsPerRow: number;
      pictographSize: number;
      spacing: number;
      containerWidth: number;
      containerHeight: number;
      gridColumns: string;
      gridGap: string;
    };
    currentSequence?: PictographData[];
    isFadingOut?: boolean;
    contentAreaBounds?: { left: number; right: number; width: number } | null;
    forcedPictographSize?: number;
    showHeader?: boolean;
    fitToViewport?: boolean;
    lightsOff?: boolean;
  }>();

  // Services
  let hapticService: IHapticFeedback | null = null;
  let reversalDetector: IReversalDetector | null = null;

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(TYPES.IHapticFeedback);
    reversalDetector = resolve<IReversalDetector>(TYPES.IReversalDetector);
  });

  // Get type info using shared infrastructure
  const typeInfo = $derived.by(() => {
    const typeDescriptions = {
      Type1: { description: "Dual-Shift", typeName: "Type 1" },
      Type2: { description: "Shift", typeName: "Type 2" },
      Type3: { description: "Cross-Shift", typeName: "Type 3" },
      Type4: { description: "Dash", typeName: "Type 4" },
      Type5: { description: "Dual-Dash", typeName: "Type 5" },
      Type6: { description: "Static", typeName: "Type 6" },
      mixed: { description: "All Types", typeName: "Options" },
      "Types 4-6": { description: "Dash Types", typeName: "Types 4-6" },
    };
    const result = typeDescriptions[
      letterType as keyof typeof typeDescriptions
    ] || {
      description: "All Types",
      typeName: "Options",
    };
    return result;
  });

  // Generate colored button text like desktop
  const buttonText = $derived(
    LetterTypeTextPainter.formatSectionHeader(
      typeInfo.typeName,
      typeInfo.description
    )
  );

  // Pictographs are already filtered when passed to this component
  const sectionPictographs = $derived(() => pictographs);

  // Get pictographs with reversal information from service
  // Returns the pictographs with reversal flags attached when service is ready
  const pictographsWithReversals = $derived(() => {
    if (!reversalDetector) {
      // Service not ready yet, return pictographs without reversal info
      return sectionPictographs().map(p => ({
        ...p,
        blueReversal: false,
        redReversal: false,
      })) as PictographWithReversals[];
    }
    return reversalDetector.detectReversalsForOptions(
      currentSequence,
      sectionPictographs()
    );
  });

  // Reactive container element for measuring available space
  let sectionContainer = $state<HTMLDivElement>();
  let availableWidth = $state(0);
  let availableHeight = $state(0);
  let actualHeaderHeight = $state(0);

  // Effect 1: Width measurement from contentAreaBounds or container
  $effect(() => {
    // Use contentAreaBounds if available (from HorizontalSwipeContainer)
    if (contentAreaBounds && contentAreaBounds.width > 0) {
      availableWidth = contentAreaBounds.width;
      return;
    }

    // Otherwise measure container width
    if (!sectionContainer) return;

    // Capture reference for closure (TypeScript flow analysis)
    const container = sectionContainer;

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      availableWidth = rect.width;
    });

    resizeObserver.observe(container);

    // Initial measurement
    const rect = container.getBoundingClientRect();
    availableWidth = rect.width;

    return () => {
      resizeObserver.disconnect();
    };
  });

  // Effect 2: Height measurement from viewport
  // The section container can overflow the viewport, so we need the viewport's actual height
  $effect(() => {
    if (!sectionContainer) return;

    const viewport = sectionContainer.closest(
      ".embla__viewport"
    ) as HTMLElement;
    if (!viewport) return;

    const measureViewportHeight = () => {
      const viewportRect = viewport.getBoundingClientRect();
      const viewportStyles = window.getComputedStyle(viewport);
      const paddingTop = parseFloat(viewportStyles.paddingTop) || 0;
      const paddingBottom = parseFloat(viewportStyles.paddingBottom) || 0;

      // Available height = viewport height minus padding
      availableHeight = viewportRect.height - paddingTop - paddingBottom;
    };

    const resizeObserver = new ResizeObserver(() => {
      measureViewportHeight();
    });

    resizeObserver.observe(viewport);

    // Initial measurement
    measureViewportHeight();

    return () => {
      resizeObserver.disconnect();
    };
  });

  // Effect 3: Header height measurement
  $effect(() => {
    if (!showHeader) {
      actualHeaderHeight = 0;
      return;
    }

    if (!sectionContainer) return;

    const header = sectionContainer.querySelector(
      ".section-header"
    ) as HTMLElement;
    if (!header) return;

    const measureHeaderHeight = () => {
      const headerRect = header.getBoundingClientRect();
      actualHeaderHeight = headerRect.height;
    };

    const resizeObserver = new ResizeObserver(() => {
      measureHeaderHeight();
    });

    resizeObserver.observe(header);

    // Initial measurement
    measureHeaderHeight();

    return () => {
      resizeObserver.disconnect();
    };
  });

  /**
   * Calculate the max pictograph size for a given column count.
   * Returns the size that fits all items within the available space.
   */
  function calculateFitSize(
    itemCount: number,
    columnCount: number,
    effectiveWidth: number,
    effectiveHeight: number,
    gridGapValue: number,
    maxSize: number
  ): number {
    const columns = Math.min(columnCount, itemCount);
    const rows = Math.ceil(itemCount / columns) || 1;
    const totalWidthGapSpace = (columns - 1) * gridGapValue;
    const totalHeightGapSpace = (rows - 1) * gridGapValue;

    const maxWidthBasedSize = Math.floor(
      (effectiveWidth - totalWidthGapSpace) / columns
    );
    const maxHeightBasedSize = Math.floor(
      (effectiveHeight - totalHeightGapSpace) / rows
    );

    // Use the smaller of width/height constraints to ensure fit
    const fitSize = Math.min(maxWidthBasedSize, maxHeightBasedSize, maxSize);
    return Math.max(fitSize, 40);
  }

  // Calculate optimal pictograph size and grid columns based on available space
  // CRITICAL: Considers BOTH width AND height constraints to prevent overflow
  const optimalLayout = $derived(() => {
    const rawItemCount = pictographsWithReversals().length;
    const safeItemCount = Math.max(rawItemCount, 1);
    const maxColumns = layoutConfig?.optionsPerRow || 4;
    const columns = Math.min(maxColumns, safeItemCount);
    const basePictographSize = layoutConfig?.pictographSize || 144;
    const gridGapValue = parseInt(layoutConfig?.gridGap || "8px");
    const targetSize = forcedPictographSize ?? basePictographSize;


    // When fitToViewport is true (mobile + continuous filter), calculate size
    // to ensure all options fit within the container without scrolling
    // CRITICAL: Compare 4-column vs 8-column layouts and pick whichever
    // produces LARGER pictographs (the user's key requirement)
    if (
      fitToViewport &&
      layoutConfig?.containerHeight &&
      layoutConfig?.containerWidth
    ) {
      const containerWidth = layoutConfig.containerWidth;
      const containerHeight = layoutConfig.containerHeight;

      // Account for:
      // - Section header (~50px) if shown
      // - Floating filter button (~44px) in fitToViewport mode
      // - Grid layout padding (8px on each side = 16px total horizontal)
      // - Additional vertical safety margin
      const headerSpace = showHeader ? 50 : 0;
      const filterButtonSpace = 44; // The "Continuous" floating filter button
      const horizontalPadding = 24; // 8px padding on each side + 8px safety margin
      const verticalPadding = 24; // More padding to account for gaps and button
      const effectiveHeight = containerHeight - headerSpace - filterButtonSpace - verticalPadding;
      const effectiveWidth = containerWidth - horizontalPadding;

      // Calculate optimal size for both 4-column and 8-column layouts
      const size4Col = calculateFitSize(
        rawItemCount,
        4,
        effectiveWidth,
        effectiveHeight,
        gridGapValue,
        basePictographSize
      );
      const size8Col = calculateFitSize(
        rawItemCount,
        8,
        effectiveWidth,
        effectiveHeight,
        gridGapValue,
        basePictographSize
      );

      // Pick whichever column count produces larger pictographs
      const use8Columns = size8Col > size4Col;
      const optimalColumns = use8Columns
        ? Math.min(8, rawItemCount)
        : Math.min(4, rawItemCount);
      const finalSize = use8Columns ? size8Col : size4Col;

      return {
        columns: optimalColumns,
        pictographSize: finalSize,
        gridColumns: `repeat(${optimalColumns}, ${finalSize}px)`,
      };
    }

    if (forcedPictographSize !== undefined) {
      return {
        columns,
        pictographSize: targetSize,
        gridColumns: `repeat(${columns}, ${targetSize}px)`,
      };
    }

    // Use layoutConfig.containerWidth if provided (accurate for Types 4-6 sections)
    // Fall back to contentAreaBounds or availableWidth for other cases
    const effectiveWidth = layoutConfig?.containerWidth || contentAreaBounds?.width || availableWidth;
    // For height, use availableHeight if measured, otherwise fall back to layoutConfig
    const effectiveHeight = availableHeight || layoutConfig?.containerHeight || 0;

    // If no available dimensions yet, use conservative fallback
    if (!effectiveWidth || !effectiveHeight) {
      // Use a conservative fallback size that accounts for potential arrow space
      const containerWidth = layoutConfig?.containerWidth || 800;
      const estimatedAvailableWidth = Math.max(containerWidth - 80, 300);

      // Even for fallback, compare 4 vs 8 columns
      const size4Col = calculateFitSize(
        rawItemCount,
        4,
        estimatedAvailableWidth,
        effectiveHeight || 400,
        gridGapValue,
        basePictographSize
      );
      const size8Col = calculateFitSize(
        rawItemCount,
        8,
        estimatedAvailableWidth,
        effectiveHeight || 400,
        gridGapValue,
        basePictographSize
      );

      const use8Columns = size8Col > size4Col;
      const optimalColumns = use8Columns
        ? Math.min(8, rawItemCount)
        : Math.min(4, rawItemCount);
      const fallbackSize = use8Columns ? size8Col : size4Col;

      return {
        columns: optimalColumns,
        pictographSize: fallbackSize,
        gridColumns: `repeat(${optimalColumns}, ${fallbackSize}px)`,
      };
    }

    // Compare 4-column vs 8-column layouts and pick whichever produces larger pictographs
    const adjustedHeight = effectiveHeight - actualHeaderHeight;
    const size4Col = calculateFitSize(
      rawItemCount,
      4,
      effectiveWidth,
      adjustedHeight,
      gridGapValue,
      basePictographSize
    );
    const size8Col = calculateFitSize(
      rawItemCount,
      8,
      effectiveWidth,
      adjustedHeight,
      gridGapValue,
      basePictographSize
    );

    const use8Columns = size8Col > size4Col;
    const optimalColumns = use8Columns
      ? Math.min(8, rawItemCount)
      : Math.min(4, rawItemCount);
    const finalSize = use8Columns ? size8Col : size4Col;

    return {
      columns: optimalColumns,
      pictographSize: finalSize,
      gridColumns: `repeat(${optimalColumns}, ${finalSize}px)`,
    };
  });

  // Handle pictograph selection
  function handlePictographClick(
    pictographWithReversals: PictographWithReversals
  ) {
    // Trigger haptic feedback for pictograph selection
    hapticService?.trigger("selection");

    // Extract the original PictographData for selection (remove reversal flags)
    const { blueReversal, redReversal, ...pictographData } =
      pictographWithReversals;
    onPictographSelected(pictographData as PictographData);
  }
</script>

<div
  class="option-viewer-section"
  bind:this={sectionContainer}
  style:--section-width={contentAreaBounds
    ? `${contentAreaBounds.width}px`
    : "100%"}
  data-letter-type={letterType}
>
  <!-- Section Header (visual only - no toggle functionality) -->
  {#if showHeader}
    <div class="section-header">
      <div class="header-layout">
        <!-- Stretch before button -->
        <div class="stretch"></div>

        <!-- Type label (visual only - no click functionality) -->
        <div class="type-label">
          <span class="label-text">
            {@html buttonText}
          </span>
        </div>

        <!-- Stretch after button -->
        <div class="stretch"></div>
      </div>
    </div>
  {/if}

  <!-- Section Content - Simple keyed each for component reuse -->
  <div
    class="pictographs-grid"
    style:grid-template-columns={optimalLayout().gridColumns}
    style:gap={layoutConfig?.gridGap || "16px"}
    style:opacity={isFadingOut ? 0 : 1}
    style:transition="opacity 250ms ease-out"
  >
    {#each pictographsWithReversals() as pictograph (pictograph.id || `${pictograph.letter}-${pictograph.startPosition}-${pictograph.endPosition}`)}
      {@const borderColors = getLetterBorderColors(pictograph.letter)}
      <button
        class="pictograph-option"
        onclick={() => handlePictographClick(pictograph)}
        disabled={isFadingOut}
        style:width="{optimalLayout().pictographSize}px"
        style:height="{optimalLayout().pictographSize}px"
        style:--border-primary={borderColors.primary}
        style:--border-secondary={borderColors.secondary}
        style:--pictograph-size="{optimalLayout().pictographSize}px"
        data-testid="option-item"
        data-letter={pictograph.letter}
      >
        <OptionPictographCell
          pictographData={pictograph as PreparedPictographData}
          blueReversal={pictograph.blueReversal || false}
          redReversal={pictograph.redReversal || false}
          {lightsOff}
        />
      </button>
    {/each}
  </div>
</div>

<style>
  .option-viewer-section {
    /* Use the content area bounds width when available */
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 100%; /* Prevent section from exceeding container width */
    max-height: 100%; /* Prevent section from exceeding container height */
    height: 100%; /* Fill available height in parent */
    box-sizing: border-box;
    overflow: hidden; /* Clip any overflow rather than letting it spill */
  }

  /* Section Header Styles (consolidated from OptionViewerSectionHeader) */

  .header-layout {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    margin-top: 8px;
    width: 100%;
  }

  .stretch {
    flex: 1;
  }

  .type-label {
    background: var(--header-bg-current, rgba(255, 255, 255, 0.15));
    border: var(--header-border-current, 1px solid rgba(255, 255, 255, 0.2));
    border-radius: 8px;
    padding: 6px 6px;
    font-weight: 600;
    font-size: var(--font-size-base);
    min-width: 160px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* Responsive header sizing for constrained screens */
  @media (max-height: 800px) {
    .type-label {
      font-size: var(--font-size-sm);
      padding: 4px 4px;
      min-width: 140px;
    }
  }

  @media (max-height: 700px) {
    .type-label {
      font-size: var(--font-size-compact);
      padding: 3px 3px;
      min-width: 120px;
    }
  }

  @media (max-height: 600px) {
    .type-label {
      font-size: var(--font-size-compact);
      padding: 2px 2px;
      min-width: 100px;
    }
  }

  .label-text {
    display: block;
    color: var(--header-text-current, var(--foreground, #000000));
  }

  .pictographs-grid {
    display: grid;
    justify-content: center;
    justify-items: center;
    align-content: center; /* Center rows vertically within available space */
    width: 100%;
    max-width: 100%; /* Prevent grid from exceeding container width */
    flex: 1; /* Fill remaining height after header */
    gap: 8px;
    padding: 0 4px; /* Prevent edge clipping when grid is centered */
    box-sizing: border-box;
    overflow: hidden; /* Clip any overflow */
  }

  .pictograph-option {
    background: transparent;
    border: none;
    border-radius: 0px;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-sizing: border-box;
    will-change: opacity;
    transform: translateZ(0);
    /* Only transition specific properties to prevent unwanted scale/size animations during content changes */
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      filter 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.1),
      0 2px 4px rgba(0, 0, 0, 0.06);
  }

  .pictograph-option:disabled {
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Reduce cascade pop-in effect by optimizing SVG rendering */
  .pictograph-option :global(.pictograph) {
    /* Force GPU acceleration for smoother rendering */
    transform: translateZ(0);
    will-change: transform;
    /* Contain layout and paint to isolate rendering */
    contain: layout paint;
  }

  .pictograph-option :global(.pictograph svg) {
    /* Ensure SVG renders as a single unit */
    will-change: contents;
  }

  /* Desktop hover - only on hover-capable devices */
  @media (hover: hover) {
    .pictograph-option:hover {
      transform: scale(1.05);
      filter: brightness(1.05);
      box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.12),
        0 4px 8px rgba(0, 0, 0, 0.08),
        0 8px 16px rgba(0, 0, 0, 0.06);
    }
  }

  /* Mobile/universal active state */
  .pictograph-option:active {
    transform: scale(0.97);
    transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .pictograph-option:focus {
    outline: none;
    filter: brightness(1.05);
  }
</style>
