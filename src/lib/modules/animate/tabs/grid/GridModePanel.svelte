<!--
  GridModePanel.svelte - Grid Mode (2×2 Rotated Grid)

  Shows up to 4 sequences in a 2×2 grid with rotation offsets.
  REFACTORED VERSION - Uses extracted components for cleaner organization
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { AnimateModuleState } from "../../shared/state/animate-module-state.svelte";
  import { getGridTabState } from "./state";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { SequenceBrowserPanel } from "$lib/shared/animate/components";
  import {
    GridSelectionArea,
    GridSelectionAreaMobile,
    GridAnimationHeader,
    GridCanvas,
    GridControlsPanel,
  } from "./components";

  type GridIndex = 0 | 1 | 2 | 3;

  // Props - shared module state for browser panel coordination
  let {
    animateState,
  }: {
    animateState: AnimateModuleState;
  } = $props();

  // Tab-specific state
  const tabState = getGridTabState();

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

  // Local state for playback controls (bound to UI)
  let isPlaying = $state(false);
  let shouldLoop = $state(true);
  let bpm = $state(120); // BPM-based control (120 BPM = 1.0 speed)

  // Sync local playback state with tab state
  $effect(() => {
    if (isPlaying !== tabState.isPlaying) {
      tabState.setIsPlaying(isPlaying);
    }
  });

  $effect(() => {
    if (shouldLoop !== tabState.shouldLoop) {
      tabState.setShouldLoop(shouldLoop);
    }
  });

  // Convert BPM to speed multiplier and sync with tab state
  $effect(() => {
    const speedFromBpm = bpm / 120;
    if (speedFromBpm !== tabState.speed) {
      tabState.setSpeed(speedFromBpm);
    }
  });

  // Sync tab state changes back to local state
  $effect(() => {
    isPlaying = tabState.isPlaying;
  });

  $effect(() => {
    shouldLoop = tabState.shouldLoop;
  });

  // Convert speed from tab state to BPM
  $effect(() => {
    bpm = tabState.speed * 120;
  });

  // Use derived state from tab state
  const hasAnySequence = $derived(tabState.hasAnySequence);
  const filledCount = $derived(
    tabState.sequences.filter((seq) => seq !== null).length
  );

  function handleResetAll() {
    tabState.clearAllSequences();
  }

  function handleSelectCell(index: GridIndex) {
    animateState.openSequenceBrowser(`grid-${index}`);
  }

  function handleRemoveCell(index: GridIndex) {
    tabState.clearSequenceAt(index);
  }

  function handleSequenceSelect(seq: SequenceData) {
    const mode = animateState.browserMode;
    if (mode === "grid-0") tabState.setSequenceAt(0, seq);
    else if (mode === "grid-1") tabState.setSequenceAt(1, seq);
    else if (mode === "grid-2") tabState.setSequenceAt(2, seq);
    else if (mode === "grid-3") tabState.setSequenceAt(3, seq);
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
      <GridAnimationHeader {filledCount} onResetAll={handleResetAll} />

      <GridCanvas
        gridSequences={tabState.sequences}
        gridRotationOffsets={tabState.rotationOffsets}
        onSelectCell={handleSelectCell}
        onRemoveCell={handleRemoveCell}
      />

      <GridControlsPanel bind:isPlaying bind:shouldLoop bind:bpm />
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
