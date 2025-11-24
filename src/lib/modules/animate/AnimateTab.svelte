<!--
  AnimateTab.svelte - Advanced Animation Visualization Module

  Modes:
  - Single: Animate one sequence (full-screen canvas)
  - Tunnel: Overlay two sequences with different colors
  - Mirror: Side-by-side view with one mirrored
  - Grid: 2×2 grid with rotation offsets

  Navigation via tabs controlled by bottom navigation
-->
<script lang="ts">
  import { navigationState } from "$shared";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { createAnimateModuleState } from "./shared/state/animate-module-state.svelte.ts";
  import type { AnimateMode } from "./shared/state/animate-module-state.svelte.ts";
  import { deepLinkStore } from "$shared/navigation/utils/deep-link-store.svelte";
  import { syncURLWithSequence } from "$shared/navigation/utils/live-url-sync";
  import { deriveLettersForSequence } from "$shared/navigation/utils/letter-deriver-helper";
  import { derivePositionsForSequence } from "$shared/navigation/utils/position-deriver-helper";

  // Import mode panels
  import SingleModePanel from "./modes/SingleModePanel.svelte";
  import TunnelModePanel from "./modes/TunnelModePanel.svelte";
  import MirrorModePanel from "./modes/MirrorModePanel.svelte";
  import GridModePanel from "./modes/GridModePanel.svelte";

  // Create module state
  const animateState = createAnimateModuleState();

  // Track if deep link has been processed
  let deepLinkProcessed = $state(false);

  // Sync current mode with navigation state
  $effect(() => {
    const section = navigationState.activeTab;
    if (
      section === "single" ||
      section === "tunnel" ||
      section === "mirror" ||
      section === "grid"
    ) {
      animateState.setCurrentMode(section as AnimateMode);
    }
  });

  // Sync primary sequence to URL for easy sharing
  $effect(() => {
    // Only sync URL if we're in the animate module
    const currentModule = navigationState.currentModule;
    if (currentModule !== "animate") return;

    const currentSequence = animateState.primarySequence;
    const currentMode = animateState.currentMode;

    // Use current mode as module shorthand (single, tunnel, mirror, grid)
    // Don't allow clearing URL until deep link is processed
    syncURLWithSequence(currentSequence, currentMode, {
      debounce: 500,
      allowClear: deepLinkProcessed,
    });
  });

  // Initialize on mount
  onMount(() => {
    console.log("✅ AnimateTab: Mounted");

    // Set default mode if none persisted
    const section = navigationState.activeTab;
    if (
      !section ||
      (section !== "single" &&
        section !== "tunnel" &&
        section !== "mirror" &&
        section !== "grid")
    ) {
      navigationState.setActiveTab("single");
    }

    // Check for deep link sequence (shareable URL)
    const deepLinkData = deepLinkStore.consume("animate");
    if (deepLinkData) {
      try {
        console.log("🔗 Loading sequence from deep link into Animate module");

        // Load the sequence immediately (letters and positions will be filled in later)
        animateState.setPrimarySequence(deepLinkData.sequence);

        // Derive positions and letters from motion data (async but non-blocking)
        Promise.all([
          derivePositionsForSequence(deepLinkData.sequence),
          deriveLettersForSequence(deepLinkData.sequence),
        ])
          .then(([sequenceWithPositions, sequenceWithLetters]) => {
            // Merge both results - letters take precedence but preserve positions
            const enrichedSequence = {
              ...sequenceWithLetters,
              beats: sequenceWithLetters.beats.map((beat, index) => ({
                ...beat,
                startPosition:
                  beat.startPosition ??
                  sequenceWithPositions.beats[index]?.startPosition,
                endPosition:
                  beat.endPosition ??
                  sequenceWithPositions.beats[index]?.endPosition,
              })),
              startPosition: sequenceWithLetters.startPosition
                ? {
                    ...sequenceWithLetters.startPosition,
                    startPosition:
                      sequenceWithLetters.startPosition.startPosition ??
                      sequenceWithPositions.startPosition?.startPosition,
                    endPosition:
                      sequenceWithLetters.startPosition.endPosition ??
                      sequenceWithPositions.startPosition?.endPosition,
                  }
                : sequenceWithPositions.startPosition,
              startingPositionBeat: sequenceWithLetters.startingPositionBeat
                ? {
                    ...sequenceWithLetters.startingPositionBeat,
                    startPosition:
                      sequenceWithLetters.startingPositionBeat.startPosition ??
                      sequenceWithPositions.startingPositionBeat?.startPosition,
                    endPosition:
                      sequenceWithLetters.startingPositionBeat.endPosition ??
                      sequenceWithPositions.startingPositionBeat?.endPosition,
                  }
                : sequenceWithPositions.startingPositionBeat,
              _updatedAt: Date.now(),
            };
            animateState.setPrimarySequence(enrichedSequence);
          })
          .catch((err) => {
            console.warn("Position/letter derivation failed:", err);
            // Still load the sequence even if derivation fails
          });

        // Navigate to the specified tab if provided
        if (deepLinkData.tabId) {
          navigationState.setActiveTab(deepLinkData.tabId);
          animateState.setCurrentMode(deepLinkData.tabId as AnimateMode);
        }

        console.log(
          "✅ Loaded sequence from deep link:",
          deepLinkData.sequence.word || deepLinkData.sequence.id
        );
      } catch (err) {
        console.error("❌ Failed to load deep link sequence in Animate:", err);
      }
    }

    // Mark deep link as processed (allow URL syncing/clearing now)
    deepLinkProcessed = true;
  });

  // Check if mode is active
  function isModeActive(mode: AnimateMode): boolean {
    return animateState.currentMode === mode;
  }
</script>

<div class="animate-tab">
  <!-- Mode-specific panels with smooth transitions -->
  <div class="content-container">
    {#key animateState.currentMode}
      <div class="mode-panel" transition:fade={{ duration: 200 }}>
        {#if isModeActive("single")}
          <SingleModePanel {animateState} />
        {:else if isModeActive("tunnel")}
          <TunnelModePanel {animateState} />
        {:else if isModeActive("mirror")}
          <MirrorModePanel {animateState} />
        {:else if isModeActive("grid")}
          <GridModePanel {animateState} />
        {/if}
      </div>
    {/key}
  </div>
</div>

<style>
  .animate-tab {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      rgba(20, 25, 35, 1) 0%,
      rgba(15, 20, 30, 1) 100%
    );
    color: var(--foreground, #ffffff);
  }

  /* Content container */
  .content-container {
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Mode panels */
  .mode-panel {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
