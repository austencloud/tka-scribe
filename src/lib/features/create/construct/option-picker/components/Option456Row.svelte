<!--
Option456Row.svelte - Horizontal row for Types 4, 5, 6

Displays Types 4, 5, 6 (Dash, Dual-Dash, Static) in a horizontal row layout
with individual headers for each type.
-->
<script lang="ts">
  import type { PreparedPictographData } from "../services/PictographPreparer";
  import OptionSectionHeader from "./OptionSectionHeader.svelte";
  import OptionGrid from "./OptionGrid.svelte";

  interface TypeSection {
    title: string;
    pictographs: PreparedPictographData[];
  }

  interface Props {
    sections: TypeSection[];
    cardSize: number;
    columns: number;
    gap?: string;
    isFading?: boolean;
    onSelect: (option: PreparedPictographData) => void;
  }

  const {
    sections,
    cardSize,
    columns,
    gap = "8px",
    isFading = false,
    onSelect,
  }: Props = $props();
</script>

<div class="option-456-row">
  {#each sections as section (section.title)}
    {#if section.pictographs.length > 0}
      <div class="type-column">
        <OptionSectionHeader letterType={section.title} />
        <OptionGrid
          options={section.pictographs}
          {cardSize}
          {columns}
          {gap}
          {isFading}
          {onSelect}
        />
      </div>
    {/if}
  {/each}
</div>

<style>
  .option-456-row {
    display: flex;
    justify-content: center;
    gap: 16px;
    width: 100%;
    flex-wrap: wrap;
  }

  .type-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    min-width: 120px;
    max-width: 300px;
  }
</style>
