<!-- PropTypeTab.svelte - Prop type selection tab (coordinator) -->
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

  // Current selection - default to STAFF if not set
  let selectedPropType = $state(settings.propType || PropType.STAFF);

  function handlePropTypeSelect(propType: PropType) {
    // Trigger selection haptic feedback
    hapticService?.trigger("selection");

    selectedPropType = propType;
    onUpdate?.({ key: "propType", value: propType });
  }

  // Grid container tracking for responsive sizing
  let gridContainerElement: HTMLDivElement | null = null;
  let containerWidth = $state(0);
  let containerHeight = $state(0);

  // Track image dimensions for smart rotation
  let imageDimensions = $state(
    new Map<PropType, { width: number; height: number }>()
  );

  onMount(() => {
    // Setup ResizeObserver to track container dimensions
    if (!gridContainerElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.borderBoxSize?.[0]) {
          containerWidth = entry.borderBoxSize[0].inlineSize;
          containerHeight = entry.borderBoxSize[0].blockSize;
        } else {
          containerWidth = entry.contentRect.width;
          containerHeight = entry.contentRect.height;
        }
      }
    });

    resizeObserver.observe(gridContainerElement);

    return () => {
      resizeObserver.disconnect();
    };
  });

  // Calculate optimal grid layout based on container size
  const gridLayout = $derived(() => {
    const totalItems = propTypes.length;

    // Determine columns based on container width - optimized for all screen sizes
    let columns = 3; // Default to 3 columns
    if (containerWidth >= 1200) columns = 6; // 5 rows for very large screens
    else if (containerWidth >= 900) columns = 6; // 5 rows for large screens
    else if (containerWidth >= 650) columns = 4; // 7 rows for medium screens
    else if (containerWidth >= 450) columns = 4; // 7 rows for tablets
    else if (containerWidth >= 300) columns = 3; // 9 rows for phones

    const rows = Math.ceil(totalItems / columns);

    return { columns, rows };
  });

  // Handle image load to track dimensions
  function handleImageLoad(propType: PropType, width: number, height: number) {
    imageDimensions.set(propType, { width, height });
    // Force reactivity update
    imageDimensions = new Map(imageDimensions);
  }

  // Calculate if an image should be rotated based on aspect ratio mismatch
  function shouldRotate(propType: PropType): boolean {
    const dimensions = imageDimensions.get(propType);
    if (!dimensions || !gridLayout().columns) return false;

    // Calculate image aspect ratio
    const imageAspectRatio = dimensions.width / dimensions.height;
    const imageIsLandscape = imageAspectRatio > 1;

    // Estimate button aspect ratio from grid
    const columns = gridLayout().columns;
    const rows = gridLayout().rows;

    // If container width and height are available, use actual measurements
    if (containerWidth && containerHeight) {
      // Rough estimate of single button dimensions
      const buttonWidth = containerWidth / columns;
      const buttonHeight = containerHeight / rows;
      const buttonAspectRatio = buttonWidth / buttonHeight;
      const buttonIsLandscape = buttonAspectRatio > 1;

      // Rotate if orientations don't match
      return imageIsLandscape !== buttonIsLandscape;
    }

    return false;
  }
</script>

<div class="prop-type-content">
  <div class="prop-container" bind:this={gridContainerElement}>
    <div
      class="prop-grid"
      style:--grid-columns={`repeat(${gridLayout().columns}, 1fr)`}
      style:--grid-rows={`repeat(${gridLayout().rows}, 1fr)`}
    >
      {#each propTypes as propType}
        <PropTypeButton
          {propType}
          selected={selectedPropType === propType}
          shouldRotate={shouldRotate(propType)}
          onSelect={handlePropTypeSelect}
          onImageLoad={handleImageLoad}
        />
      {/each}
    </div>
  </div>
</div>

<style>
  .prop-type-content {
    width: 100%;
    height: 100%;
    margin: 0 auto;
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Prevent overflow */
  }

  .prop-container {
    width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: clamp(12px, 2vw, 20px);
    overflow-y: auto; /* Enable scrolling when content overflows */
    overflow-x: hidden;
  }

  .prop-grid {
    display: grid;
    width: 100%;

    /* Use CSS variables calculated from JavaScript */
    grid-template-columns: var(--grid-columns, repeat(3, 1fr));
    /* Use auto rows with consistent sizing */
    grid-auto-rows: auto;

    /* Fluid gap using container query units - scales smoothly with container size */
    gap: clamp(12px, 2cqi, 20px);

    /* Let items fill their cells */
    align-items: stretch;
    justify-items: stretch;
    /* Remove align-content: center to prevent overflow */
    align-content: start;
  }

  /* Grid items: fill cells but with reasonable max sizes */
  .prop-grid > :global(.prop-button) {
    min-height: 0;
    min-width: 0;
    width: 100%;
    height: 100%;
  }

  /* Desktop: Better spacing and sizing */
  @media (min-width: 769px) {
    .prop-type-content {
      padding: 0;
    }

    .prop-container {
      padding: clamp(16px, 2vw, 24px);
    }

    .prop-grid {
      grid-auto-rows: minmax(160px, auto);
    }
  }

  /* Large screens: constrain individual buttons to prevent gigantic sizes */
  @media (min-width: 1200px) {
    .prop-grid > :global(.prop-button) {
      max-width: min(100%, 240px);
      max-height: min(100%, 280px);
    }
  }

  /* Very large screens: tighter constraints to prevent absurd button sizes */
  @media (min-width: 1600px) {
    .prop-grid > :global(.prop-button) {
      max-width: min(100%, 220px);
      max-height: min(100%, 260px);
    }
  }

  /* Hide scrollbar on WebKit browsers for a cleaner look */
  .prop-container::-webkit-scrollbar {
    width: 8px;
  }

  .prop-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .prop-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .prop-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }
</style>
