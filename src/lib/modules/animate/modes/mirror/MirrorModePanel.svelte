<!--
  MirrorModePanel.svelte - Mirror Mode (Side-by-Side Mirrored View)

  Shows one sequence alongside its mirrored version with polished UI.
  REFACTORED VERSION - Uses extracted components for cleaner organization
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { AnimateModuleState } from "../../shared/state/animate-module-state.svelte";
  import SequenceBrowserPanel from "../../shared/components/SequenceBrowserPanel.svelte";
  import {
    MirrorSelectionArea,
    MirrorSelectionAreaMobile,
    MirrorAnimationHeader,
    MirrorAxisSelector,
    MirrorSplitCanvas,
    MirrorControlsPanel,
  } from "./components";

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

  let {
    animateState,
  }: {
    animateState: AnimateModuleState;
  } = $props();

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

  const sequenceStats = $derived.by(() => {
    const seq = animateState.primarySequence;
    if (!seq) return null;

    return {
      beats: seq.beats?.length ?? 0,
      word: seq.word || seq.name || "Untitled",
      author: seq.author,
    };
  });
</script>

<div class="mirror-mode-panel">
  {#if !animateState.primarySequence}
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

      <MirrorAxisSelector bind:axis={animateState.mirrorAxis} />

      <MirrorSplitCanvas axis={animateState.mirrorAxis} />

      <MirrorControlsPanel
        bind:isPlaying
        bind:shouldLoop
        bind:speed
      />
    </div>
  {/if}

  <SequenceBrowserPanel
    mode="primary"
    show={animateState.isSequenceBrowserOpen}
    onSelect={(seq) => {
      animateState.setPrimarySequence(seq);
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
