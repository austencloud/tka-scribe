<!--
OptionPickerSection.svelte - Section component for option picker

Renders a section with:
- Section header with letter type
- Grid of pictographs for that letter type
- Expandable/collapsible functionality
-->
<script lang="ts">
  import type { PictographData } from "$shared";
  import { LETTER_TYPE_COLORS, Pictograph } from "$shared";
  import { LetterTypeTextPainter } from "../utils/letter-type-text-painter";

  // Props
  const {
    letterType,
    pictographs = [],
    onPictographSelected = () => {},
    layoutConfig
  } = $props<{
    letterType: string;
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
  }>();



  // Get type info using shared infrastructure
  const typeInfo = $derived.by(() => {
    const typeDescriptions = {
      Type1: { description: "Dual-Shift", typeName: "Type1" },
      Type2: { description: "Shift", typeName: "Type2" },
      Type3: { description: "Cross-Shift", typeName: "Type3" },
      Type4: { description: "Dash", typeName: "Type4" },
      Type5: { description: "Dual-Dash", typeName: "Type5" },
      Type6: { description: "Static", typeName: "Type6" },
    };
    const result = typeDescriptions[letterType as keyof typeof typeDescriptions] || {
      description: "Unknown",
      typeName: "Type ?",
    };
    return result;
  });

  // Get colors using shared infrastructure
  const colorPairs = $derived.by(() => {
    const letterTypeEnum = letterType as keyof typeof LETTER_TYPE_COLORS;
    const colors = LETTER_TYPE_COLORS[letterTypeEnum] || ["#666666", "#666666"];
    return {
      primary: colors[0],
      secondary: colors[1],
    };
  });

  // Generate colored button text like desktop
  const buttonText = $derived(LetterTypeTextPainter.formatSectionHeader(typeInfo.typeName, typeInfo.description));

  // Pictographs are already filtered when passed to this component
  const sectionPictographs = $derived(() => pictographs);

  // Handle pictograph selection
  function handlePictographClick(pictograph: PictographData) {
    onPictographSelected(pictograph);
  }
</script>

<div class="option-picker-section">
  <!-- Section Header (visual only - no toggle functionality) -->
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

  <!-- Section Content -->
  {#if sectionPictographs().length > 0}
  <div
    class="pictographs-grid"
    style:grid-template-columns={layoutConfig?.gridColumns || 'repeat(4, 1fr)'}
    style:gap={layoutConfig?.gridGap || '8px'}
  >
    {#each sectionPictographs() as pictograph (pictograph.id || `${pictograph.letter}-${pictograph.startPos}-${pictograph.endPos}`)}
      <button
        class="pictograph-option"
        onclick={() => handlePictographClick(pictograph)}
        style:width={layoutConfig?.pictographSize ? `${layoutConfig.pictographSize}px` : '144px'}
        style:height={layoutConfig?.pictographSize ? `${layoutConfig.pictographSize}px` : '144px'}
      >
        <Pictograph pictographData={pictograph} />
      </button>
    {/each}
  </div>
  {/if}
</div>

<style>

  /* Section Header Styles (consolidated from OptionPickerSectionHeader) */

  .header-layout {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .stretch {
    flex: 1;
  }

  .type-label {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 10px 12px;
    font-weight: 600;
    font-size: 16px;
    min-width: 160px;
    text-align: center;
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .label-text {
    display: block;
    color: var(--foreground, #000000);
  }

  .pictographs-grid {
    display: grid;
    justify-content: center;
    justify-items: center;
  }

  .pictograph-option {
    background: transparent;
    border: 2px solid transparent;
    border-radius: 8px;
    padding: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pictograph-option:hover {
    border-color: #3b82f6;
    background-color: rgba(59, 130, 246, 0.1);
  }

  .pictograph-option:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
</style>