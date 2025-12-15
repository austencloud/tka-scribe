<!--
SequenceCardMedia - Media display component for SequenceCard

Displays one of:
1. Dynamic beat grid (if beats data provided and useDynamicGrid enabled)
2. Image thumbnail (if coverUrl provided)
3. Letter placeholder (fallback)

Ultra-minimal design: Clean display with progressive enhancement.
-->
<script lang="ts">
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
  import type { ThumbnailRenderConfig } from "$lib/shared/components/thumbnail/thumbnail-types";
  import { DEFAULT_THUMBNAIL_CONFIG } from "$lib/shared/components/thumbnail/thumbnail-types";
  import { generateSrcset, generateSizes } from "$lib/shared/components/thumbnail/srcset-utils";
  import ThumbnailBeatGrid from "$lib/shared/components/thumbnail/ThumbnailBeatGrid.svelte";

  const {
    coverUrl = undefined,
    word,
    width = undefined,
    height = undefined,
    beats = undefined,
    startPosition = undefined,
    renderConfig = DEFAULT_THUMBNAIL_CONFIG,
    useDynamicGrid = false,
  } = $props<{
    coverUrl?: string | undefined;
    word: string;
    width?: number | undefined;
    height?: number | undefined;
    beats?: readonly BeatData[] | undefined;
    startPosition?: StartPositionData | BeatData | undefined;
    renderConfig?: ThumbnailRenderConfig;
    useDynamicGrid?: boolean;
  }>();

  // Measure actual container dimensions for dynamic grid sizing
  let gridContainer: HTMLDivElement | null = $state(null);
  let containerWidth = $state(200);
  let containerHeight = $state(150);

  // Use ResizeObserver to track container size changes
  $effect(() => {
    if (!gridContainer) return;

    const updateSize = () => {
      const rect = gridContainer!.getBoundingClientRect();
      containerWidth = Math.floor(rect.width) || 200;
      containerHeight = Math.floor(rect.height) || 150;
    };

    // Initial measurement
    updateSize();

    // Watch for size changes
    const observer = new ResizeObserver(updateSize);
    observer.observe(gridContainer);

    return () => observer.disconnect();
  });

  // Determine what to show:
  // 1. If useDynamicGrid and beats exist, show dynamic grid
  // 2. Else if coverUrl exists, show image
  // 3. Else show placeholder
  const showDynamicGrid = $derived(
    useDynamicGrid && beats && beats.length > 0
  );
  const showImage = $derived(!showDynamicGrid && !!coverUrl);

  // Generate responsive srcset for gallery images
  const imageSrcset = $derived(generateSrcset(coverUrl));
  const imageSizes = $derived(generateSizes("grid"));
</script>

<div class="media">
  <div class="media-content">
    <div class="media-wrapper">
      {#if showDynamicGrid && beats}
        <div class="dynamic-grid-container" bind:this={gridContainer}>
          <ThumbnailBeatGrid
            {beats}
            {startPosition}
            {renderConfig}
            {containerWidth}
            {containerHeight}
            maxColumns={4}
          />
        </div>
      {:else if showImage && coverUrl}
        <img
          src={coverUrl}
          srcset={imageSrcset}
          sizes={imageSizes}
          alt={`Preview of ${word}`}
          {width}
          {height}
          loading="lazy"
          decoding="async"
        />
      {:else}
        <div class="media-placeholder" aria-label="Sequence preview missing">
          <span>{word?.slice(0, 1) ?? "?"}</span>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .media {
    position: relative;
    width: 100%;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .media-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .media-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .media img {
    width: 100%;
    height: auto;
    display: block;
    max-width: 100%;
  }

  .dynamic-grid-container {
    width: 100%;
    height: 100%;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    background: white;
    border-radius: 4px;
  }

  .media-placeholder {
    width: 100%;
    aspect-ratio: 4 / 3;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--theme-card-hover-bg, #1f2937), var(--theme-panel-bg, #111827));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 4rem;
    font-weight: 700;
  }

  /* Container query responsive sizing */
  @container sequence-card (max-width: 249px) {
    .media-placeholder {
      font-size: 2.5rem;
    }
  }

  @container sequence-card (min-width: 252px) and (max-width: 299px) {
    .media-placeholder {
      font-size: 3.25rem;
    }
  }
</style>
