<!--
LOOPComponentGrid.svelte - Grid layout for LOOP component selection buttons
Displays all available LOOP transformations in a responsive 2x2 grid
-->
<script lang="ts">
  import {
    LOOP_COMPONENTS,
    LOOPComponent,
  } from "$lib/features/create/generate/shared/domain/constants/loop-components";
  import LOOPComponentButton from "./LOOPComponentButton.svelte";

  let {
    selectedComponents,
    isMultiSelectMode = false,
    onToggleComponent,
  } = $props<{
    selectedComponents: Set<LOOPComponent>;
    isMultiSelectMode?: boolean;
    onToggleComponent: (component: LOOPComponent) => void;
  }>();
</script>

<div class="loop-component-grid">
  {#each LOOP_COMPONENTS as componentInfo}
    <LOOPComponentButton
      {componentInfo}
      {isMultiSelectMode}
      isSelected={selectedComponents.has(componentInfo.component)}
      onClick={() => onToggleComponent(componentInfo.component)}
    />
  {/each}
</div>

<style>
  .loop-component-grid {
    display: grid;
    width: 100%;
    max-width: 600px; /* Prevent buttons from getting too wide */
    margin: 0 auto;
    gap: 12px;
    flex-shrink: 0;

    /* 2x2 grid layout with constrained button size */
    grid-template-columns: repeat(2, minmax(120px, 180px));
    grid-auto-rows: minmax(
      120px,
      160px
    ); /* Buttons stay within reasonable size */
    justify-content: center;
  }

  /* Wider screens: Allow slightly larger buttons */
  @container loop-modal (min-width: 500px) {
    .loop-component-grid {
      gap: 16px;
      grid-template-columns: repeat(2, minmax(140px, 200px));
      grid-auto-rows: minmax(140px, 180px);
    }
  }
</style>
