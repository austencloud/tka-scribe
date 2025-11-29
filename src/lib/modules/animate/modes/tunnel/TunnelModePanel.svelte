<!--
  TunnelModePanel.svelte - Tunnel Mode (Overlay Animation)

  Overlays two sequences with different colors to create "tunneling" effect.
  Primary performer: Blue/Red
  Secondary performer: Green/Purple

  REFACTORED VERSION - Uses extracted components for cleaner organization
-->
<script lang="ts">
  import type { AnimateModuleState } from "../../shared/state/animate-module-state.svelte";
  import SequenceBrowserPanel from "../../shared/components/SequenceBrowserPanel.svelte";
  import {
    TunnelSelectionArea,
    TunnelSelectionAreaMobile,
    TunnelAnimationHeader,
    TunnelStatsBar,
    TunnelControlsFooter,
    TunnelThreePanelLayout,
  } from "./components";
  import { resolve } from "$shared/inversify";
  import { TYPES } from "$shared/inversify/types";
  import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";
  import type {
    ITunnelModeSequenceManager,
    ISequenceNormalizationService,
  } from "../../services/contracts";
  import { onMount } from "svelte";

  // Props
  let {
    animateState,
  }: {
    animateState: AnimateModuleState;
  } = $props();

  // Services
  let sequenceManager: ITunnelModeSequenceManager | null = null;
  let normalizationService: ISequenceNormalizationService | null = null;

  // Mobile detection
  let isMobile = $state(false);

  // Derived: Check if both sequences are selected
  const bothSequencesSelected = $derived(
    animateState.primarySequence && animateState.secondarySequence
  );

  // Bindable state for animation controls
  let animatingBeatNumber = $state<number | null>(null);

  // Loaded sequences with full beat data
  let loadedPrimarySequence = $state<SequenceData | null>(null);
  let loadedSecondarySequence = $state<SequenceData | null>(null);

  // Normalized sequence data (beats separated from startPosition)
  const primaryNormalized = $derived.by(() => {
    if (!loadedPrimarySequence || !normalizationService) {
      return { beats: [], startPosition: null };
    }
    return normalizationService.separateBeatsFromStartPosition(
      loadedPrimarySequence
    );
  });

  const secondaryNormalized = $derived.by(() => {
    if (!loadedSecondarySequence || !normalizationService) {
      return { beats: [], startPosition: null };
    }
    return normalizationService.separateBeatsFromStartPosition(
      loadedSecondarySequence
    );
  });

  // Computed stats
  const totalBeats = $derived(loadedPrimarySequence?.beats.length ?? 0);

  // Visibility toggles
  let primaryVisible = $state(true);
  let primaryBlueVisible = $state(true);
  let primaryRedVisible = $state(true);
  let secondaryVisible = $state(true);
  let secondaryBlueVisible = $state(true);
  let secondaryRedVisible = $state(true);

  // Local playback state that syncs with animateState
  let isPlaying = $state(false);
  let speed = $state(1.0);

  // Sync local state with animateState
  $effect(() => {
    if (isPlaying !== animateState.isPlaying) {
      animateState.setIsPlaying(isPlaying);
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
    speed = animateState.speed;
  });

  // Required beat count for filtering
  const requiredBeatCount = $derived.by(() => {
    if (animateState.browserMode === "primary") {
      return animateState.secondarySequence?.beats.length;
    } else if (animateState.browserMode === "secondary") {
      return animateState.primarySequence?.beats.length;
    }
    return undefined;
  });

  // Color configurations
  const primaryColors = $derived([
    { color: animateState.tunnelColors.primary.blue, label: "Blue" },
    { color: animateState.tunnelColors.primary.red, label: "Red" },
  ]);

  const secondaryColors = $derived([
    { color: animateState.tunnelColors.secondary.blue, label: "Green" },
    { color: animateState.tunnelColors.secondary.red, label: "Purple" },
  ]);

  // Initialize services and mobile detection
  onMount(() => {
    sequenceManager = resolve(
      TYPES.ITunnelModeSequenceManager
    ) as ITunnelModeSequenceManager;
    normalizationService = resolve(
      TYPES.ISequenceNormalizationService
    ) as ISequenceNormalizationService;

    // Mobile detection
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    isMobile = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  // Load full sequences when selected sequences change
  $effect(() => {
    if (animateState.primarySequence && sequenceManager) {
      loadSequence(animateState.primarySequence, "primary");
    }
  });

  $effect(() => {
    if (animateState.secondarySequence && sequenceManager) {
      loadSequence(animateState.secondarySequence, "secondary");
    }
  });

  async function loadSequence(
    sequence: SequenceData,
    type: "primary" | "secondary"
  ) {
    if (!sequenceManager) return;

    const loaded = await sequenceManager.loadSequence(sequence, type);
    if (loaded) {
      if (type === "primary") {
        loadedPrimarySequence = loaded;
      } else {
        loadedSecondarySequence = loaded;
      }
    }
  }

  // Unified transformation handler
  async function handleTransform(
    type: "primary" | "secondary",
    operation: "mirror" | "rotate" | "colorSwap" | "reverse"
  ) {
    const sequence =
      type === "primary" ? loadedPrimarySequence : loadedSecondarySequence;
    if (!sequence || !sequenceManager) return;

    await sequenceManager.transformAndUpdate(
      sequence,
      type,
      operation,
      (transformed) => {
        if (type === "primary") {
          loadedPrimarySequence = transformed;
          animateState.setPrimarySequence(transformed);
        } else {
          loadedSecondarySequence = transformed;
          animateState.setSecondarySequence(transformed);
        }
      }
    );
  }

  function handleChangeSequences() {
    animateState.setPrimarySequence(null);
    animateState.setSecondarySequence(null);
  }

  function handleSequenceSelect(sequence: SequenceData) {
    if (animateState.browserMode === "primary") {
      animateState.setPrimarySequence(sequence);
    } else if (animateState.browserMode === "secondary") {
      animateState.setSecondarySequence(sequence);
    }
    animateState.closeSequenceBrowser();
  }
</script>

<div class="tunnel-mode-panel">
  {#if !bothSequencesSelected}
    {#if isMobile}
      <TunnelSelectionAreaMobile
        primarySequence={animateState.primarySequence}
        secondarySequence={animateState.secondarySequence}
        onSelectPrimary={() => animateState.openSequenceBrowser("primary")}
        onSelectSecondary={() => animateState.openSequenceBrowser("secondary")}
      />
    {:else}
      <TunnelSelectionArea
        primarySequence={animateState.primarySequence}
        secondarySequence={animateState.secondarySequence}
        onSelectPrimary={() => animateState.openSequenceBrowser("primary")}
        onSelectSecondary={() => animateState.openSequenceBrowser("secondary")}
      />
    {/if}
  {:else}
    <div class="animation-area">
      <TunnelAnimationHeader
        primaryWord={animateState.primarySequence!.word}
        secondaryWord={animateState.secondarySequence!.word}
        onChangeSequences={handleChangeSequences}
      />

      <TunnelStatsBar
        {totalBeats}
        {speed}
        {primaryVisible}
        {secondaryVisible}
        {isPlaying}
      />

      <TunnelThreePanelLayout
        primarySequence={animateState.primarySequence}
        {loadedPrimarySequence}
        {primaryNormalized}
        primaryWord={animateState.primarySequence!.word}
        {primaryColors}
        secondarySequence={animateState.secondarySequence}
        {loadedSecondarySequence}
        {secondaryNormalized}
        secondaryWord={animateState.secondarySequence!.word}
        {secondaryColors}
        tunnelColors={animateState.tunnelColors}
        bind:primaryVisible
        bind:primaryBlueVisible
        bind:primaryRedVisible
        bind:secondaryVisible
        bind:secondaryBlueVisible
        bind:secondaryRedVisible
        bind:isPlaying
        bind:animatingBeatNumber
        {speed}
        onTransformPrimary={(op) => handleTransform("primary", op)}
        onTransformSecondary={(op) => handleTransform("secondary", op)}
      />

      <TunnelControlsFooter
        bind:isPlaying
        bind:speed
        {animatingBeatNumber}
        {totalBeats}
      />
    </div>
  {/if}

  {#key animateState.browserMode}
    <SequenceBrowserPanel
      mode={animateState.browserMode}
      show={animateState.isSequenceBrowserOpen}
      {requiredBeatCount}
      onSelect={handleSequenceSelect}
      onClose={animateState.closeSequenceBrowser}
    />
  {/key}
</div>

<style>
  .tunnel-mode-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(
      180deg,
      rgba(15, 23, 42, 0.3) 0%,
      rgba(15, 23, 42, 0.1) 100%
    );
  }

  .animation-area {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }
</style>
