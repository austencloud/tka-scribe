<!--
  GridModePanel.svelte - Grid Mode (2×2 Rotated Grid)

  Shows up to 4 sequences in a 2×2 grid with rotation offsets.
  REFACTORED VERSION - Uses extracted components for cleaner organization
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { AnimateModuleState } from "../../shared/state/animate-module-state.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import SequenceBrowserPanel from "../../shared/components/SequenceBrowserPanel.svelte";
  import {
    GridSelectionArea,
    GridSelectionAreaMobile,
    GridAnimationHeader,
    GridCanvas,
    GridControlsPanel,
  } from "./components";

  type GridIndex = 0 | 1 | 2 | 3;

  let {
    animateState,
  }: {
    animateState: AnimateModuleState;
  } = $props();

  // Mobile detection
  let isMobile = $state(false);

  onMount(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    isMobile = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  // Local state for playback controls
  let isPlaying = $state(false);
  let shouldLoop = $state(true);
  let speed = $state(1.0);

  // Sync local state with animateState
  $effect(() => {
    if (isPlaying !== animateState.isPlaying) {
      animateState.setIsPlaying(isPlaying);
    }
  });

  $effect(() => {
    if (shouldLoop !== animateState.shouldLoop) {
      animateState.setShouldLoop(shouldLoop);
    }
  });

  $effect(() => {
    if (speed !== animateState.speed) {
      animateState.setSpeed(speed);
    }
  });

  // Sync animateState changes back to local state
  $effect(() => {
    isPlaying = animateState.isPlaying;
  });

  $effect(() => {
    shouldLoop = animateState.shouldLoop;
  });

  $effect(() => {
    speed = animateState.speed;
  });

  const hasAnySequence = $derived(
    animateState.gridSequences.some((seq: unknown) => seq !== null)
  );

  const filledCount = $derived(
    animateState.gridSequences.filter((seq: unknown) => seq !== null).length
  );

  function handleResetAll() {
    animateState.setGridSequence(0, null);
    animateState.setGridSequence(1, null);
    animateState.setGridSequence(2, null);
    animateState.setGridSequence(3, null);
  }

  function handleSelectCell(index: GridIndex) {
    animateState.openSequenceBrowser(`grid-${index}`);
  }

  function handleRemoveCell(index: GridIndex) {
    animateState.setGridSequence(index, null);
  }

  function handleSequenceSelect(seq: SequenceData) {
    const mode = animateState.browserMode;
    if (mode === "grid-0") animateState.setGridSequence(0, seq);
    else if (mode === "grid-1") animateState.setGridSequence(1, seq);
    else if (mode === "grid-2") animateState.setGridSequence(2, seq);
    else if (mode === "grid-3") animateState.setGridSequence(3, seq);
    animateState.closeSequenceBrowser();
  }
</script>

<div class="grid-mode-panel">
  {#if !hasAnySequence}
    {#if isMobile}
      <GridSelectionAreaMobile
        onStartBuilding={() => animateState.openSequenceBrowser("grid-0")}
      />
    {:else}
      <GridSelectionArea
        onStartBuilding={() => animateState.openSequenceBrowser("grid-0")}
      />
    {/if}
  {:else}
    <div class="grid-view">
      <GridAnimationHeader
        {filledCount}
        onResetAll={handleResetAll}
      />

      <GridCanvas
        gridSequences={animateState.gridSequences}
        gridRotationOffsets={animateState.gridRotationOffsets}
        onSelectCell={handleSelectCell}
        onRemoveCell={handleRemoveCell}
      />

      <GridControlsPanel
        bind:isPlaying
        bind:shouldLoop
        bind:speed
      />
    </div>
  {/if}

  <SequenceBrowserPanel
    mode={animateState.browserMode}
    show={animateState.isSequenceBrowserOpen}
    onSelect={handleSequenceSelect}
    onClose={animateState.closeSequenceBrowser}
  />
</div>

<style>
  .grid-mode-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .grid-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
</style>
