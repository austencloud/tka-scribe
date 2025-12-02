<!--
CAPComponentGrid.svelte - Grid layout for CAP component selection buttons
Displays all available CAP transformations in a responsive 2x2 grid
-->
<script lang="ts">
  import {
    CAP_COMPONENTS,
    CAPComponent,
  } from "$lib/features/create/generate/shared/domain/constants/cap-components";
  import CAPComponentButton from "./CAPComponentButton.svelte";

  let {
    selectedComponents,
    isMultiSelectMode = false,
    onToggleComponent,
  } = $props<{
    selectedComponents: Set<CAPComponent>;
    isMultiSelectMode?: boolean;
    onToggleComponent: (component: CAPComponent) => void;
  }>();
</script>

<div class="cap-component-grid">
  {#each CAP_COMPONENTS as componentInfo}
    <CAPComponentButton
      {componentInfo}
      {isMultiSelectMode}
      isSelected={selectedComponents.has(componentInfo.component)}
      onClick={() => onToggleComponent(componentInfo.component)}
    />
  {/each}
</div>

<style>
  .cap-component-grid {
    display: grid;
    width: 100%;
    max-width: 600px; /* Prevent buttons from getting too wide */
    margin: 0 auto;
    gap: 12px;
    flex-shrink: 0;

    /* 2x2 grid layout with constrained button size */
    grid-template-columns: repeat(2, minmax(120px, 180px));
    grid-auto-rows: minmax(120px, 160px); /* Buttons stay within reasonable size */
    justify-content: center;
  }

  /* Wider screens: Allow slightly larger buttons */
  @container cap-modal (min-width: 500px) {
    .cap-component-grid {
      gap: 16px;
      grid-template-columns: repeat(2, minmax(140px, 200px));
      grid-auto-rows: minmax(140px, 180px);
    }
  }
</style>
