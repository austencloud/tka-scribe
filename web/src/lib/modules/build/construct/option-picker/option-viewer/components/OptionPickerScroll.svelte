<!--
OptionPickerScroll.svelte - Clean scroll component with pure UI concerns

Refactored to remove business logic:
- Takes pre-organized pictographs from state
- No data transformation or grouping logic
- Pure UI rendering based on provided data
- Layout configuration from state layer
- Automatic spacing distribution between sections
-->
<script lang="ts">
  import type { PictographData } from "$shared";
  import { SimpleGlassScroll } from "$shared";
  import type { TypeFilter } from "../domain";
  import OptionPickerGroupWidget from "./OptionPicker456Group.svelte";
  import OptionPickerSection from "./OptionPickerSection.svelte";

  // Simple, reliable fade animations - no complex transforms or layout changes
  const simpleFadeIn = (_node: Element) => {
    return {
      duration: 250,
      css: (t: number) => `opacity: ${t}`
    };
  };

  const simpleFadeOut = (_node: Element) => {
    return {
      duration: 200,
      css: (t: number) => `opacity: ${t}`
    };
  };

  // ===== Props =====
  const {
    organizedPictographs = [],
    onPictographSelected = () => {},
    layoutConfig,
    typeFilter,
    currentSequence = [],
  } = $props<{
    organizedPictographs?: {
      title: string;
      pictographs: PictographData[];
      type: 'individual' | 'grouped';
    }[];
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
    typeFilter?: TypeFilter;
    currentSequence?: PictographData[];
  }>();

  // Helper function to check if a type is enabled in the filter
  function isTypeEnabled(sectionTitle: string): boolean {
    if (!typeFilter) return true; // If no filter provided, show all types

    switch (sectionTitle) {
      case 'Type1': return typeFilter.type1;
      case 'Type2': return typeFilter.type2;
      case 'Type3': return typeFilter.type3;
      case 'Type4': return typeFilter.type4;
      case 'Type5': return typeFilter.type5;
      case 'Type6': return typeFilter.type6;
      default: return true;
    }
  }

  // ===== Overflow Detection =====
  let sectionsContainer: HTMLElement;
  let hasOverflow = $state(false);

  // Check for overflow when content or container size changes
  $effect(() => {
    if (sectionsContainer && organizedPictographs.length > 0) {
      const checkOverflow = () => {
        // Wait for next tick to ensure DOM is updated
        setTimeout(() => {
          if (sectionsContainer) {
            // Find the actual scroll container (SimpleGlassScroll element)
            const glassScrollContainer = sectionsContainer.closest('.glass-scrollable');

            if (glassScrollContainer) {
              const containerHeight = glassScrollContainer.clientHeight;
              const contentHeight = sectionsContainer.scrollHeight;
              const newHasOverflow = contentHeight > containerHeight;

              // Only update if changed to prevent infinite loops
              if (newHasOverflow !== hasOverflow) {
                hasOverflow = newHasOverflow;
              }
            }
          }
        }, 0);
      };

      // Initial check
      checkOverflow();

      // Create ResizeObserver to monitor size changes
      const resizeObserver = new ResizeObserver(checkOverflow);

      // Find the glass scroll container for observation
      const glassScrollContainer = sectionsContainer.closest('.glass-scrollable');
      if (glassScrollContainer) {
        resizeObserver.observe(glassScrollContainer);
      }
      resizeObserver.observe(sectionsContainer);

      // Cleanup
      return () => {
        resizeObserver.disconnect();
      };
    }
  });

  // ===== Style Properties =====
  let scrollStyle = $derived(() => {
    if (!layoutConfig) return {};

    return {
      "--grid-columns": layoutConfig.gridColumns,
      "--option-size": layoutConfig.pictographSize + "px",
      "--grid-gap": layoutConfig.gridGap,
    };
  });
</script>

<div
  class="option-picker-scroll"
  style={Object.entries(scrollStyle)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ")}
>
  <SimpleGlassScroll>
    <div
      class="sections-container"
      class:overflow-mode={hasOverflow}
      class:space-evenly-mode={!hasOverflow}
      bind:this={sectionsContainer}
    >
      {#each organizedPictographs as section (section.title)}
        {#if section.type === 'grouped'}
          <!-- Always render grouped section (Types 4-6) - let OptionPickerGroupWidget handle filtering -->
          <div
            class="section-wrapper grouped-section"
            in:simpleFadeIn
            out:simpleFadeOut
          >
            <OptionPickerGroupWidget
              pictographs={section.pictographs}
              {onPictographSelected}
              containerWidth={layoutConfig?.containerWidth || 800}
              pictographSize={layoutConfig?.pictographSize || 144}
              gridGap={layoutConfig?.gridGap || '8px'}
              layoutMode={layoutConfig?.optionsPerRow === 8 ? '8-column' : '4-column'}
              {typeFilter}
              {currentSequence}
            />
          </div>
        {:else if isTypeEnabled(section.title)}
          <!-- Render individual sections (Types 1-3) based on typeFilter, not pictograph count -->
          <div
            class="section-wrapper individual-section"
            in:simpleFadeIn
            out:simpleFadeOut
          >
            <OptionPickerSection
              letterType={section.title}
              pictographs={section.pictographs}
              {onPictographSelected}
              {layoutConfig}
              {currentSequence}
            />
          </div>
        {/if}
      {/each}
    </div>
  </SimpleGlassScroll>
</div>

<style>
  .option-picker-scroll {
    width: 100%;
    height: 100%;
  }

  .sections-container {
    display: flex;
    flex-direction: column;
    padding: 16px 0;
    min-height: 100%; /* Ensure container takes full height for space-evenly mode */
  }

  /* Overflow mode: Content exceeds container height - use consistent gaps */
  .sections-container.overflow-mode {
    gap: 24px; /* Consistent spacing between sections */
    justify-content: flex-start; /* Push content to top */
  }

  /* Space-evenly mode: Content fits in container - distribute space evenly */
  .sections-container.space-evenly-mode {
    gap: 0; /* Remove gaps to let justify-content handle spacing */
    justify-content: space-evenly; /* Distribute sections evenly */
    height: 100%; /* Take full height to enable space distribution */
  }

  .section-wrapper {
    /* This wrapper allows each section to maintain its internal layout */
    flex-shrink: 0;
  }
</style>
