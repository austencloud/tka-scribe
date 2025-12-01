<!--
  MirrorModePanel.svelte - Mirror Mode (Side-by-Side Mirrored View)

  Shows one sequence alongside its mirrored version with polished UI.
  REFACTORED VERSION - Uses extracted components and tab-specific state
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { AnimateModuleState } from "../../shared/state/animate-module-state.svelte";
  import { getMirrorTabState, type MirrorAxis } from "./state";
  import { SequenceBrowserPanel } from "$lib/shared/animate/components";
  import {
    MirrorSelectionArea,
    MirrorSelectionAreaMobile,
    MirrorAnimationHeader,
    MirrorAxisSelector,
    MirrorSplitCanvas,
    MirrorControlsPanel,
  } from "./components";

  // Props - shared module state for browser panel coordination
  let {
    animateState,
  }: {
    animateState: AnimateModuleState;
  } = $props();

  // Tab-specific state
  const tabState = getMirrorTabState();

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
  let speed = $state(1.0);
  let mirrorAxis = $state<MirrorAxis>("vertical");

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

  $effect(() => {
    if (speed !== tabState.speed) {
      tabState.setSpeed(speed);
    }
  });

  $effect(() => {
    if (mirrorAxis !== tabState.mirrorAxis) {
      tabState.setMirrorAxis(mirrorAxis);
    }
  });

  // Sync tab state changes back to local state
  $effect(() => {
    isPlaying = tabState.isPlaying;
  });

  $effect(() => {
    shouldLoop = tabState.shouldLoop;
  });

  $effect(() => {
    speed = tabState.speed;
  });

  $effect(() => {
    mirrorAxis = tabState.mirrorAxis;
  });

  const sequenceStats = $derived.by(() => {
    const seq = tabState.sequence;
    if (!seq) return null;

    return {
      beats: seq.beats?.length ?? 0,
      word: seq.word || seq.name || "Untitled",
      author: seq.author,
    };
  });
</script>

<div class="mirror-mode-panel">
  {#if !tabState.sequence}
    {#if isMobile}
      <MirrorSelectionAreaMobile
        onSelectSequence={() => animateState.openSequenceBrowser("primary")}
      />
    {:else}
      <MirrorSelectionArea
        onSelectSequence={() => animateState.openSequenceBrowser("primary")}
      />
    {/if}
  {:else}
    <div class="mirror-view">
      <MirrorAnimationHeader
        sequenceName={sequenceStats?.word ?? ""}
        author={sequenceStats?.author}
        onChangeSequence={() => animateState.openSequenceBrowser("primary")}
      />

      <MirrorAxisSelector bind:axis={mirrorAxis} />

      <MirrorSplitCanvas axis={mirrorAxis} />

      <MirrorControlsPanel bind:isPlaying bind:shouldLoop bind:speed />
    </div>
  {/if}

  <SequenceBrowserPanel
    mode="primary"
    show={animateState.isSequenceBrowserOpen}
    onSelect={(seq) => {
      tabState.setSequence(seq);
      animateState.closeSequenceBrowser();
    }}
    onClose={animateState.closeSequenceBrowser}
  />
</div>

<style>
  .mirror-mode-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .mirror-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
</style>
