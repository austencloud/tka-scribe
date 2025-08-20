<!--
  PictographDemo.svelte - Demo component for pictograph display
  
  Simple demo component for showcasing pictograph functionality.
  Can be enhanced with actual demo features as needed.
-->

<script lang="ts">
  import type { PictographData } from "$lib/domain/PictographData";

  interface Props {
    pictographData?: PictographData;
    title?: string;
    description?: string;
  }

  let {
    pictographData,
    title = "Pictograph Demo",
    description = "Demo pictograph component",
  }: Props = $props();
</script>

<div class="pictograph-demo">
  <h3>{title}</h3>
  {#if description}
    <p class="description">{description}</p>
  {/if}

  {#if pictographData}
    <div class="pictograph-container">
      <p>Letter: {pictographData.letter}</p>
      <p>Grid Mode: {pictographData.gridMode}</p>
      <!-- Add actual pictograph rendering here when needed -->
    </div>
  {:else}
    <div class="placeholder">
      <p>No pictograph data provided</p>
    </div>
  {/if}
</div>

<style>
  .pictograph-demo {
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin: 1rem 0;
  }

  .description {
    color: #666;
    font-style: italic;
  }

  .pictograph-container {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 4px;
  }

  .placeholder {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #f0f0f0;
    border-radius: 4px;
    text-align: center;
    color: #999;
  }
</style>
