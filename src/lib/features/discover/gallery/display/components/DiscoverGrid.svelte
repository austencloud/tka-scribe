<script lang="ts">
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { slide } from "svelte/transition";
  import { onMount } from "svelte";
  import { wrapGrid } from "animate-css-grid";
  import type { IDiscoverThumbnailService } from "../services/contracts/IDiscoverThumbnailService";
  import SequenceCard from "./SequenceCard/SequenceCard.svelte";
  import SectionHeader from "./SectionHeader.svelte";

  // ✅ PURE RUNES: Props using modern Svelte 5 runes
  const {
    sequences = [],
    sections = [],
    viewMode = "grid",
    thumbnailService,
    showSections = false,
    onAction = () => {},
  } = $props<{
    sequences?: SequenceData[];
    sections?: SequenceData[];
    viewMode?: "grid" | "list";
    thumbnailService: IDiscoverThumbnailService | null;
    showSections?: boolean;
    onAction?: (action: string, sequence: SequenceData) => void;
  }>();

  // Grid element refs for animate-css-grid
  let sectionGridRefs = $state<HTMLElement[]>([]);
  let flatGridRef = $state<HTMLElement | undefined>(undefined);

  // Track container width to control column count
  let containerWidth = $state(0);

  const columnCount = $derived.by(() => {
    if (containerWidth === 0) return 2; // Default
    if (containerWidth >= 1600) return 6;
    if (containerWidth >= 1200) return 5;
    if (containerWidth >= 800) return 4;
    if (containerWidth >= 481) return 3;
    return 2;
  });

  // Initialize animate-css-grid and ResizeObserver
  onMount(() => {
    // Configure FLIP animation for smooth grid transitions
    const animationConfig = {
      duration: 300,
      stagger: 0, // No stagger for cohesive movement
      easing: "easeInOut" as const, // Popmotion easing function
    };

    // Wrap section grids
    const unwrapFunctions = sectionGridRefs
      .filter(Boolean)
      .map((gridElement) => wrapGrid(gridElement, animationConfig));

    // Wrap flat grid
    if (flatGridRef) {
      unwrapFunctions.push(wrapGrid(flatGridRef, animationConfig));
    }

    // ResizeObserver to track container width changes
    const targetElement = flatGridRef || sectionGridRefs[0];
    const resizeObserver = targetElement
      ? new ResizeObserver((entries) => {
          for (const entry of entries) {
            const newWidth = entry.contentRect.width;
            // Only update if we have a valid width
            if (newWidth > 0) {
              containerWidth = newWidth;
            }
          }
        })
      : null;

    if (targetElement && resizeObserver) {
      resizeObserver.observe(targetElement);

      // Initial width measurement - prevents stuck at 2 columns
      requestAnimationFrame(() => {
        const width = targetElement.getBoundingClientRect().width;
        if (width > 0) {
          containerWidth = width;
        }
      });
    }

    // Additional safeguard: Re-measure on window resize
    const handleResize = () => {
      if (targetElement) {
        const width = targetElement.getBoundingClientRect().width;
        if (width > 0) {
          containerWidth = width;
        }
      }
    };
    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
      unwrapFunctions.forEach((unwrap) => unwrap?.unwrapGrid());
    };
  });

  // Handle sequence actions
  function handleSequenceAction(action: string, sequence: SequenceData) {
    onAction(action, sequence);
  }

  function getCoverUrl(sequence: SequenceData) {
    const firstThumbnail = sequence?.thumbnails?.[0];
    if (!firstThumbnail) return undefined;
    try {
      return thumbnailService.getThumbnailUrl(sequence.id, firstThumbnail);
    } catch (error) {
      console.warn(
        "DiscoverGrid: Failed to resolve thumbnail for sequence",
        sequence.id,
        error
      );
      return undefined;
    }
  }
</script>

{#if showSections && sections.length > 0}
  <!-- Section-based organization (desktop app style) -->
  <div class="sections-container">
    {#each sections as section, sectionIndex (section.id)}
      <div class="sequence-section" data-section={section.title}>
        <SectionHeader title={section.title} />

        {#if section.sequences.length > 0}
          <div
            bind:this={sectionGridRefs[sectionIndex]}
            class="sequences-grid"
            class:list-view={viewMode === "list"}
            class:grid-view={viewMode === "grid"}
            style:grid-template-columns={viewMode === "grid"
              ? `repeat(${columnCount}, 1fr)`
              : undefined}
          >
            {#each section.sequences as sequence}
              <SequenceCard
                {sequence}
                coverUrl={getCoverUrl(sequence)}
                onPrimaryAction={(sequence) =>
                  handleSequenceAction("view-detail", sequence)}
              />
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{:else if sequences.length > 0}
  <!-- Flat organization (fallback) -->
  <div
    bind:this={flatGridRef}
    class="sequences-grid"
    class:list-view={viewMode === "list"}
    class:grid-view={viewMode === "grid"}
    style:grid-template-columns={viewMode === "grid"
      ? `repeat(${columnCount}, 1fr)`
      : undefined}
    transition:slide={{ duration: 300 }}
  >
    {#each sequences as sequence}
      <SequenceCard
        {sequence}
        coverUrl={getCoverUrl(sequence)}
        onPrimaryAction={(sequence) =>
          handleSequenceAction("view-detail", sequence)}
      />
    {/each}
  </div>
{/if}

<style>
  /* Sections container for organized display */
  .sections-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .sequence-section {
    display: flex;
    flex-direction: column;
  }

  /* Responsive grid that adapts to container width */
  /* animate-css-grid handles smooth FLIP transitions when columns change */
  /* Column count is controlled via JavaScript with debounced ResizeObserver */
  .sequences-grid.grid-view {
    display: grid;
    /* grid-template-columns set via inline style based on debounced container width */
    gap: var(--spacing-lg);
    grid-auto-rows: max-content;
  }

  .sequences-grid.list-view {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  /* Responsive gap adjustments */
  @container (max-width: 480px) {
    .sequences-grid.grid-view {
      gap: 8px;
    }
  }

  @container (min-width: 481px) and (max-width: 1199px) {
    .sequences-grid.grid-view {
      gap: var(--spacing-md);
    }
  }
</style>
