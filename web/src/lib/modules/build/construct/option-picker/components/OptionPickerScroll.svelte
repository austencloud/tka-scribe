<!--
OptionPickerScroll.svelte - Clean scroll component using service architecture

Migrated to use OptionPickerServiceAdapter directly:
- Pure service-based architecture
- Minimal state for UI concerns only
- Clean separation of concerns
-->
<script lang="ts">
  import type { PictographData } from "$shared";
  import { getLetterType, Letter, SimpleGlassScroll } from "$shared";
  import type { OptionPickerLayoutCalculationResult } from "../domain";
  import OptionPickerSection from "./OptionPickerSection.svelte";

  // ===== Props =====
  const {
    pictographs = [],
    onPictographSelected = () => {},
    containerWidth = 800,
    containerHeight = 600,
    layout = null,
  } = $props<{
    pictographs?: PictographData[];
    onPictographSelected?: (pictograph: PictographData) => void;
    containerWidth?: number;
    containerHeight?: number;
    layout?: OptionPickerLayoutCalculationResult | null;
  }>();

  // ===== Organized Pictographs =====
  // Group pictographs by letter type for clean section rendering
  let organizedPictographs = $derived.by(() => {
    if (!pictographs?.length) {
      console.log(`🔍 OptionPickerScroll: No pictographs to organize`);
      return [];
    }

    console.log(`🔍 OptionPickerScroll: Organizing ${pictographs.length} pictographs`);
    console.log(`🔍 OptionPickerScroll: First pictograph:`, pictographs[0]);

    // Group by letter type using proper letter type detection
    const groups = new Map<string, PictographData[]>();

    for (const pictograph of pictographs) {
      let letterType = "Type?";

      try {
        if (pictograph.letter) {
          // Convert string letter to Letter enum and get its type
          console.log(`🔍 OptionPickerScroll: Processing letter "${pictograph.letter}" (type: ${typeof pictograph.letter})`);
          const letterEnum = pictograph.letter as Letter;
          console.log(`🔍 OptionPickerScroll: Letter enum:`, letterEnum);
          const type = getLetterType(letterEnum);
          console.log(`🔍 OptionPickerScroll: Raw type result:`, type);
          letterType = type; // getLetterType already returns "Type1", "Type2", etc.
          console.log(`🔍 OptionPickerScroll: Final letterType: "${letterType}"`);
        } else {
          console.warn(`⚠️ OptionPickerScroll: Pictograph missing letter:`, pictograph);
        }
      } catch (error) {
        console.warn(`⚠️ OptionPickerScroll: Failed to get letter type for "${pictograph.letter}":`, error);
      }

      if (!groups.has(letterType)) {
        groups.set(letterType, []);
      }
      groups.get(letterType)!.push(pictograph);
    }

    const result = Array.from(groups.entries()).map(([category, items]) => ({
      title: category,
      pictographs: items,
    }));

    console.log(`🔍 OptionPickerScroll: Organized into ${result.length} sections:`, result.map(r => `${r.title} (${r.pictographs.length})`));
    return result;
  });

  // ===== Style Properties =====
  let scrollStyle = $derived(() => {
    if (!layout) return {};

    return {
      "--grid-columns": layout.gridConfig.columns,
      "--option-size": layout.gridConfig.itemSize + "px",
      "--grid-gap": layout.gridConfig.gap + "px",
    };
  });
</script>

<div
  class="option-picker-scroll"
  class:mobile={layout?.deviceType === "mobile"}
  class:tablet={layout?.deviceType === "tablet"}
  style={Object.entries(scrollStyle)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ")}
>
  <SimpleGlassScroll>
    {#each organizedPictographs as section (section.title)}
      <OptionPickerSection
        letterType={section.title}
        pictographs={section.pictographs}
        {onPictographSelected}
        {containerWidth}
      />
    {/each}
  </SimpleGlassScroll>
</div>

<style>
  .option-picker-scroll {
    width: 100%;
    height: 100%;
  }

  .option-picker-scroll.mobile {
    --grid-columns: 2;
    --option-size: 80px;
    --grid-gap: 6px;
  }

  .option-picker-scroll.tablet {
    --grid-columns: 3;
    --option-size: 100px;
    --grid-gap: 8px;
  }
</style>
