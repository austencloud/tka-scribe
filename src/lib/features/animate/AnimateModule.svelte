<!--
  AnimateModule.svelte - Advanced Animation Visualization Module

  Modes:
  - Single: Animate one sequence (full-screen canvas)
  - Tunnel: Overlay two sequences with different colors
  - Mirror: Side-by-side view with one mirrored
  - Grid: 2×2 grid with rotation offsets

  Navigation via tabs controlled by bottom navigation
-->
<script lang="ts">
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import { getAnimateModuleState } from "./shared/state/animate-module-state.svelte.ts";
  import type { AnimateMode } from "./shared/state/animate-module-state.svelte.ts";
  // Import tab states for deep linking
  import { getSingleTabState } from "./tabs/single/state/single-tab-state.svelte";
  import type { IURLSyncService } from "$lib/shared/navigation/services/contracts/IURLSyncService";
  import type { ILetterDeriverService } from "$lib/shared/navigation/services/contracts/ILetterDeriverService";
  import type { IPositionDeriverService } from "$lib/shared/navigation/services/contracts/IPositionDeriverService";
  import type { IDeepLinkService } from "$lib/shared/navigation/services/contracts/IDeepLinkService";

  // Import tab panels
  import SingleModePanel from "./tabs/single/SingleModePanel.svelte";
  import TunnelModePanel from "./tabs/tunnel/TunnelModePanel.svelte";
  import MirrorModePanel from "./tabs/mirror/MirrorModePanel.svelte";
  import GridModePanel from "./tabs/grid/GridModePanel.svelte";

  // Get module state (singleton)
  const animateState = getAnimateModuleState();

  // Get tab states for deep linking
  const singleTabState = getSingleTabState();

  // Services
  let urlSyncService: IURLSyncService | null = $state(null);
  let letterDeriverService: ILetterDeriverService | null = $state(null);
  let positionDeriverService: IPositionDeriverService | null = $state(null);
  let deepLinkService: IDeepLinkService | null = $state(null);

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

  // Sync primary sequence to URL for easy sharing (uses single tab's sequence)
  $effect(() => {
    // Only sync URL if we're in the animate module and service is available
    if (!urlSyncService) return;
    const currentModule = navigationState.currentModule;
    if (currentModule !== "animate") return;

    const currentSequence = singleTabState.sequence;
    const currentMode = animateState.currentMode;

    // Use current mode as module shorthand (single, tunnel, mirror, grid)
    // Don't allow clearing URL until deep link is processed
    urlSyncService.syncURLWithSequence(currentSequence, currentMode, {
      debounce: 500,
      allowClear: deepLinkProcessed,
    });
  });

  // Initialize on mount
  onMount(() => {
    // Resolve services
    try {
      urlSyncService = resolve<IURLSyncService>(TYPES.IURLSyncService);
      letterDeriverService = resolve<ILetterDeriverService>(
        TYPES.ILetterDeriverService
      );
      positionDeriverService = resolve<IPositionDeriverService>(
        TYPES.IPositionDeriverService
      );
      deepLinkService = resolve<IDeepLinkService>(TYPES.IDeepLinkService);
    } catch (error) {
      console.warn("Failed to resolve navigation services:", error);
    }

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
    const deepLinkData = deepLinkService?.consumeData("animate");
    if (deepLinkData) {
      try {
        console.log("🔗 Loading sequence from deep link into Animate module");

        // Load the sequence immediately into the single tab state
        singleTabState.setSequence(deepLinkData.sequence);

        // Derive positions and letters from motion data (async but non-blocking)
        if (positionDeriverService && letterDeriverService) {
          Promise.all([
            positionDeriverService.derivePositionsForSequence(
              deepLinkData.sequence
            ),
            letterDeriverService.deriveLettersForSequence(
              deepLinkData.sequence
            ),
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
                        sequenceWithLetters.startingPositionBeat
                          .startPosition ??
                        sequenceWithPositions.startingPositionBeat
                          ?.startPosition,
                      endPosition:
                        sequenceWithLetters.startingPositionBeat.endPosition ??
                        sequenceWithPositions.startingPositionBeat?.endPosition,
                    }
                  : sequenceWithPositions.startingPositionBeat,
                _updatedAt: Date.now(),
              };
              singleTabState.setSequence(enrichedSequence);
            })
            .catch((err) => {
              console.warn("Position/letter derivation failed:", err);
              // Still load the sequence even if derivation fails
            });
        } else {
          console.warn(
            "Deriver services not available - sequence will not be enriched"
          );
        }

        // Navigate to the specified tab if provided
        if (deepLinkData.tabId) {
          navigationState.setActiveTab(deepLinkData.tabId);
          animateState.setCurrentMode(deepLinkData.tabId as AnimateMode);
        }
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
  <!-- Mode-specific panels - View Transitions API handles animation at page level -->
  <div class="content-container">
    {#key animateState.currentMode}
      <div class="mode-panel">
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
