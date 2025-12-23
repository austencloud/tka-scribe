<!--
OptionViewerGridLayout.svelte - Traditional vertical scrolling grid layout

Displays option sections stacked vertically with smooth fade transitions.
Fallback layout when horizontal swipe is not suitable.

Features:
- Vertical scrolling
- All sections visible at once
- Smooth fade transitions between content
- FitToViewport mode: sizes pictographs so all sections fit without scrolling
-->

<script lang="ts">
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import type { OrganizedSection } from "../domain/option-picker-types";
  import OptionPicker456Group from "./OptionViewer456Group.svelte";
  import OptionViewerSection from "./OptionViewerSection.svelte";

  // ===== Props =====
  const {
    organizedPictographs = [],
    onPictographSelected = () => {},
    layoutConfig,
    currentSequence = [],
    isFadingOut = false,
    fitToViewport = false,
  } = $props<{
    organizedPictographs?: OrganizedSection[];
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
    fitToViewport?: boolean;
  }>();

  const uniformPictographSize = $derived(
    () => layoutConfig?.pictographSize ?? 144
  );

  /**
   * When fitToViewport is true, calculate per-section height allocation.
   * Each section gets a proportional share of the available height.
   * With headers hidden, more space is available for pictographs.
   */
  const perSectionHeight = $derived(() => {
    if (!fitToViewport || !layoutConfig?.containerHeight) {
      return layoutConfig?.containerHeight ?? 600;
    }

    const sectionCount = organizedPictographs.length;
    if (sectionCount === 0) return layoutConfig.containerHeight;

    // Account for gaps between sections (4px gap in fitToViewport mode for tighter spacing)
    const gapSize = 4;
    const totalGaps = (sectionCount - 1) * gapSize;
    const paddingBlock = 8; // Minimal padding in fitToViewport mode
    const availableHeight =
      layoutConfig.containerHeight - totalGaps - paddingBlock;

    return Math.floor(availableHeight / sectionCount);
  });

  /**
   * Create a modified layoutConfig with per-section height for fitToViewport mode.
   */
  const sectionLayoutConfig = $derived(() => {
    if (!layoutConfig) return undefined;

    if (!fitToViewport) {
      return layoutConfig;
    }

    return {
      ...layoutConfig,
      containerHeight: perSectionHeight(),
    };
  });
</script>

<div class="grid-layout" class:fit-to-viewport={fitToViewport}>
  {#each organizedPictographs as section (section.title)}
    <div
      class="section-wrapper"
      class:grouped-section={section.title === "Types 4-6" ||
        section.type === "grouped"}
    >
      {#if section.title === "Types 4-6" || section.type === "grouped"}
        <!-- Grouped section (Types 4-6) -->
        <OptionPicker456Group
          pictographs={section.pictographs}
          {onPictographSelected}
          containerWidth={sectionLayoutConfig()?.containerWidth || 800}
          containerHeight={perSectionHeight()}
          pictographSize={sectionLayoutConfig()?.pictographSize || 144}
          gridGap={sectionLayoutConfig()?.gridGap || "8px"}
          {currentSequence}
          {isFadingOut}
          forcedPictographSize={uniformPictographSize()}
          {fitToViewport}
        />
      {:else}
        <!-- Individual section (Types 1-3) -->
        <OptionViewerSection
          letterType={section.title}
          pictographs={section.pictographs}
          {onPictographSelected}
          layoutConfig={sectionLayoutConfig()}
          {currentSequence}
          {isFadingOut}
          forcedPictographSize={uniformPictographSize()}
          contentAreaBounds={null}
          {fitToViewport}
          showHeader={!fitToViewport}
        />
      {/if}
    </div>
  {/each}
</div>

<style>
  .grid-layout {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    overflow-y: auto;
    padding-block: 24px;
  }

  /* When fitToViewport is true, disable scrolling and fit content with minimal spacing */
  .grid-layout.fit-to-viewport {
    overflow-y: visible;
    overflow: visible;
    padding-block: 4px;
    gap: 4px;
  }

  .section-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
  }
</style>
