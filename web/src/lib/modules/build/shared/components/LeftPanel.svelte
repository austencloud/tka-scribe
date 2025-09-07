<!--
	LeftPanel.svelte

	Left panel component extracted from ConstructTab.
	Contains the workbench with header showing sequence information.
-->
<script lang="ts">
  import Workbench from "../../workbench/components/Workbench.svelte";

  // Props
  let { sequenceState } = $props<{
    sequenceState?: any; // TODO: Type this properly
  }>();
</script>

<div class="left-panel" data-testid="left-panel">
  <Workbench {sequenceState} />
</div>

<style>
  .left-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    /* Transparent background to show beautiful background without blur */
    background: transparent;
    border: none;
    border-radius: var(--border-radius);
    overflow: hidden;
  }
</style>
