<!--
OptionPickerGroupWidget.svelte - Horizontal group for Types 4, 5, 6

Matches the desktop version exactly:
- Horizontal layout for Types 4, 5, 6 (Dash, Dual-Dash, Static)
- Fixed size policy to prevent stretching
- Minimal spacing to prevent overflow
- Centered alignment
-->
<script lang="ts">
  import type { PictographData } from "$shared";
  import { getLetterType, Letter } from "$shared";
  import type { TypeFilter } from "../domain";
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

  // Props
  const {
    pictographs = [],
    onPictographSelected = () => {},
    containerWidth = 800,
    pictographSize = 144,
    gridGap = '8px',
    layoutMode = '8-column',
    typeFilter,
    currentSequence = [],
  } = $props<{
    pictographs?: PictographData[];
    onPictographSelected?: (pictograph: PictographData) => void;
    containerWidth?: number;
    pictographSize?: number;
    gridGap?: string;
    layoutMode?: '4-column' | '8-column';
    typeFilter?: TypeFilter;
    currentSequence?: PictographData[];
  }>();

  // Groupable types (Types 4, 5, 6) - matches desktop exactly
  const groupableTypes = ["Type4", "Type5", "Type6"];

  // Helper function to get letter type from pictograph letter using existing utilities
  function getLetterTypeFromString(letter: string): string {
    try {
      // Convert string to Letter enum
      const letterEnum = Object.values(Letter).find(l => l === letter);
      if (!letterEnum) {
        return 'Unknown';
      }
      
      // Use the existing getLetterType function
      const letterType = getLetterType(letterEnum as Letter);
      return letterType;
    } catch (error) {
      return 'Unknown';
    }
  }

  // No longer need toggle states - sections are always visible when type is enabled

  // Filter pictographs by type for each section using local logic
  const pictographsByType = $derived(() => {
    const result: Record<string, PictographData[]> = {};

    // Initialize empty arrays for each type
    groupableTypes.forEach(type => {
      result[type] = [];
    });

    // Filter pictographs by type using existing utilities
    if (pictographs.length > 0) {
      groupableTypes.forEach(type => {
        const filtered = pictographs.filter((p: PictographData) => p.letter && getLetterTypeFromString(p.letter) === type);
        result[type] = filtered;
      });
    }

    return result;
  });

  // Store the result to avoid multiple function calls in template
  const currentPictographsByType = $derived(() => pictographsByType());


  // Helper function to check if a type is enabled in the filter
  function isTypeEnabled(letterType: string): boolean {
    if (!typeFilter) return true; // If no filter provided, show all types

    switch (letterType) {
      case 'Type4': return typeFilter.type4;
      case 'Type5': return typeFilter.type5;
      case 'Type6': return typeFilter.type6;
      default: return true;
    }
  }

  // Layout organization based on mode and filter state
  const layoutSections = $derived(() => {
    // Filter types based on typeFilter state
    const enabledTypes = groupableTypes.filter(type => isTypeEnabled(type));

    // If no types are enabled, return empty layout
    if (enabledTypes.length === 0) {
      return [];
    }

    if (layoutMode === '8-column') {
      // 8-column: All enabled types in one horizontal row
      return [{
        types: enabledTypes,
        containerWidth: containerWidth,
      }];
    } else {
      // 4-column: Organize enabled types into rows
      if (enabledTypes.includes('Type4') && (enabledTypes.includes('Type5') || enabledTypes.includes('Type6'))) {
        // Type4 on first row, Types 5-6 on second row (if they exist)
        const firstRow = ['Type4'];
        const secondRowTypes = enabledTypes.filter(type => type === 'Type5' || type === 'Type6');

        const rows = [
          {
            types: firstRow,
            containerWidth: containerWidth,
          }
        ];

        if (secondRowTypes.length > 0) {
          rows.push({
            types: secondRowTypes,
            containerWidth: containerWidth,
          });
        }

        return rows;
      } else {
        // All enabled types in one row
        return [{
          types: enabledTypes,
          containerWidth: containerWidth,
        }];
      }
    }
  });

  // Calculate section width for each layout row
  const getSectionWidth = (types: string[], rowContainerWidth: number) => {
    const spacing = 2; // Minimal spacing like desktop
    const totalSpacing = spacing * (types.length - 1);
    const availableWidth = rowContainerWidth - totalSpacing;
    return Math.floor(availableWidth / types.length);
  };

  // Create layout config for a specific section
  const createSectionLayoutConfig = (sectionWidth: number, letterType: string, numPictographs: number) => {
    // For Types 4, 5, 6 which typically have fewer items, optimize for centering
    let gridColumns = `repeat(auto-fit, minmax(${pictographSize}px, 1fr))`;
    
    if (groupableTypes.includes(letterType) && numPictographs > 0) {
      // Use exact column count for better centering in grouped types
      gridColumns = `repeat(${numPictographs}, ${pictographSize}px)`;
    }
    
    return {
      optionsPerRow: Math.max(1, Math.floor(sectionWidth / (pictographSize + parseInt(gridGap.replace('px', ''))))),
      pictographSize,
      spacing: parseInt(gridGap.replace('px', '')),
      containerWidth: sectionWidth,
      containerHeight: 600, // Default height
      gridColumns,
      gridGap,
    };
  };
</script>

<div class="group-widget">
  {#each layoutSections() as row, rowIndex (rowIndex)}
    <div class="layout-row">
      {#each row.types as letterType (letterType)}
        {@const sectionWidth = getSectionWidth(row.types, row.containerWidth)}
        {@const sectionPictographs = currentPictographsByType()[letterType]}
        {@const sectionLayoutConfig = createSectionLayoutConfig(sectionWidth, letterType, sectionPictographs.length)}
        <div
          class="section-container"
          style:width="{sectionWidth}px"
          in:simpleFadeIn
          out:simpleFadeOut
        >
          <OptionPickerSection
            {letterType}
            pictographs={sectionPictographs}
            {onPictographSelected}
            layoutConfig={sectionLayoutConfig}
            {currentSequence}
          />
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .group-widget {
    width: 100%;
    /* Fixed size policy like desktop to prevent stretching */
    flex-shrink: 0;
    flex-grow: 0;
  }

  .layout-row {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    /* Minimal spacing to prevent overflow (matches desktop) */
    gap: 2px;
    width: 100%;
    /* Prevent content from overflowing */
    overflow: hidden;
    margin-bottom: 8px; /* Space between rows in 4-column mode */
    /* FLIP-inspired smooth layout transitions */
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .layout-row:last-child {
    margin-bottom: 0;
  }

  .section-container {
    /* Fixed size policy to prevent stretching */
    flex-shrink: 0;
    flex-grow: 0;
    /* Ensure sections don't exceed their allocated width */
    min-width: 0;
    overflow: hidden;
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    /* Stack vertically on very small screens */
    .layout-row {
      flex-direction: column;
      gap: 8px;
    }

    .section-container {
      width: 100% !important;
    }
  }
</style>
