<!--
AssemblerTab.svelte - Wrapper for simplified hand path assembly

Integrates HandPathOrchestrator with the Create module's workspace.
Handles real-time workspace updates and sequence completion.
-->
<script lang="ts">
  import type { PictographData, GridMode } from "$shared";
  import HandPathOrchestrator from "./HandPathOrchestrator.svelte";

  const {
    onSequenceUpdate,
    onSequenceComplete,
    onHeaderTextChange,
    initialGridMode,
  } = $props<{
    onSequenceUpdate?: (sequence: PictographData[]) => void;
    onSequenceComplete?: (sequence: PictographData[]) => void;
    onHeaderTextChange?: (text: string) => void;
    initialGridMode?: GridMode;
  }>();

  // Handle sequence updates (during building)
  function handleSequenceUpdate(sequence: PictographData[]) {
    onSequenceUpdate?.(sequence);
  }

  // Handle sequence completion
  function handleSequenceComplete(sequence: PictographData[]) {
    onSequenceComplete?.(sequence);
  }
</script>

<div class="assembler-tab">
  <HandPathOrchestrator
    {initialGridMode}
    onSequenceUpdate={handleSequenceUpdate}
    onSequenceComplete={handleSequenceComplete}
    {onHeaderTextChange}
  />
</div>

<style>
  .assembler-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
    width: 100%;
  }
</style>
