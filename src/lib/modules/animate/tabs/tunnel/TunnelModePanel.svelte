<!--
  TunnelModePanel.svelte - Tunnel Mode (Overlay Animation)

  Overlays two sequences with different colors to create "tunneling" effect.
  Primary performer: Blue/Red
  Secondary performer: Green/Purple

  REFACTORED VERSION - Uses extracted components and tab-specific state
-->
<script lang="ts">
  import type { AnimateModuleState } from "../../shared/state/animate-module-state.svelte";
  import { getTunnelTabState, type TunnelColors } from "./state";
  import { SequenceBrowserPanel } from "$lib/shared/animate/components";
  import {
    TunnelSelectionArea,
    TunnelSelectionAreaMobile,
    TunnelAnimationHeader,
    TunnelControlsFooter,
    TunnelThreePanelLayout,
  } from "./components";
  import { resolve } from "$lib/shared/inversify";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type {
    ITunnelModeSequenceManager,
    ISequenceNormalizationService,
  } from "../../services/contracts";
  import { onMount } from "svelte";

  // Props - shared module state for browser panel coordination
  let {
    animateState,
  }: {
    animateState: AnimateModuleState;
  } = $props();

  // Tab-specific state
  const tabState = getTunnelTabState();

  // Services
  let sequenceManager: ITunnelModeSequenceManager | null = null;
  let normalizationService: ISequenceNormalizationService | null = null;

  // Mobile detection
  let isMobile = $state(false);

  // Derived: Check if both sequences are selected
  const bothSequencesSelected = $derived(
    tabState.primarySequence && tabState.secondarySequence
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

  // Computed stats (use normalized beats, excluding start position)
  const totalBeats = $derived(primaryNormalized.beats.length);

  // Visibility toggles
  let primaryVisible = $state(true);
  let primaryBlueVisible = $state(true);
  let primaryRedVisible = $state(true);
  let secondaryVisible = $state(true);
  let secondaryBlueVisible = $state(true);
  let secondaryRedVisible = $state(true);

  // Local playback state that syncs with tab state
  let isPlaying = $state(false);
  let bpm = $state(120); // BPM-based control (120 BPM = 1.0 speed)

  // Derived speed multiplier for animation components
  const speed = $derived(bpm / 120);

  // Sync local playback state with tab state
  $effect(() => {
    if (isPlaying !== tabState.isPlaying) {
      tabState.setIsPlaying(isPlaying);
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

  // Convert speed from tab state to BPM
  $effect(() => {
    bpm = tabState.speed * 120;
  });

  // Required beat count for filtering (use normalized beats, excluding start position)
  const requiredBeatCount = $derived.by(() => {
    if (animateState.browserMode === "primary") {
      // Need secondary's beat count (excluding start position)
      if (!tabState.secondarySequence || !normalizationService)
        return undefined;
      const normalized = normalizationService.separateBeatsFromStartPosition(
        tabState.secondarySequence
      );
      return normalized.beats.length;
    } else if (animateState.browserMode === "secondary") {
      // Need primary's beat count (excluding start position)
      if (!tabState.primarySequence || !normalizationService) return undefined;
      const normalized = normalizationService.separateBeatsFromStartPosition(
        tabState.primarySequence
      );
      return normalized.beats.length;
    }
    return undefined;
  });

  // Derive color configurations from tab state
  // Note: TunnelColors type uses left/right, but display uses primary.blue/red format
  // We'll create compatible color configs for the components
  const primaryColors = $derived([
    { color: tabState.tunnelColors.left, label: "Blue" },
    { color: tabState.tunnelColors.right, label: "Red" },
  ]);

  const secondaryColors = $derived([
    { color: "#10b981", label: "Green" }, // Secondary left (derived from default)
    { color: "#a855f7", label: "Purple" }, // Secondary right (derived from default)
  ]);

  // Compatible tunnelColors object for components expecting the old format
  const tunnelColorsCompat = $derived({
    primary: {
      blue: tabState.tunnelColors.left,
      red: tabState.tunnelColors.right,
    },
    secondary: {
      blue: "#10b981",
      red: "#a855f7",
    },
  });

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
    if (tabState.primarySequence && sequenceManager) {
      loadSequence(tabState.primarySequence, "primary");
    }
  });

  $effect(() => {
    if (tabState.secondarySequence && sequenceManager) {
      loadSequence(tabState.secondarySequence, "secondary");
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
          tabState.setPrimarySequence(transformed);
        } else {
          loadedSecondarySequence = transformed;
          tabState.setSecondarySequence(transformed);
        }
      }
    );
  }

  function handleChangeSequences() {
    tabState.setPrimarySequence(null);
    tabState.setSecondarySequence(null);
  }

  function handleSequenceSelect(sequence: SequenceData) {
    if (animateState.browserMode === "primary") {
      tabState.setPrimarySequence(sequence);
    } else if (animateState.browserMode === "secondary") {
      tabState.setSecondarySequence(sequence);
    }
    animateState.closeSequenceBrowser();
  }
</script>

<div class="tunnel-mode-panel">
  {#if !bothSequencesSelected}
    {#if isMobile}
      <TunnelSelectionAreaMobile
        primarySequence={loadedPrimarySequence}
        secondarySequence={loadedSecondarySequence}
        onSelectPrimary={() => animateState.openSequenceBrowser("primary")}
        onSelectSecondary={() => animateState.openSequenceBrowser("secondary")}
      />
    {:else}
      <TunnelSelectionArea
        primarySequence={loadedPrimarySequence}
        secondarySequence={loadedSecondarySequence}
        onSelectPrimary={() => animateState.openSequenceBrowser("primary")}
        onSelectSecondary={() => animateState.openSequenceBrowser("secondary")}
      />
    {/if}
  {:else}
    <div class="animation-area">
      <TunnelAnimationHeader
        primaryWord={tabState.primarySequence!.word}
        secondaryWord={tabState.secondarySequence!.word}
        onChangeSequences={handleChangeSequences}
      />

      <TunnelThreePanelLayout
        primarySequence={tabState.primarySequence}
        {loadedPrimarySequence}
        {primaryNormalized}
        primaryWord={tabState.primarySequence!.word}
        {primaryColors}
        secondarySequence={tabState.secondarySequence}
        {loadedSecondarySequence}
        {secondaryNormalized}
        secondaryWord={tabState.secondarySequence!.word}
        {secondaryColors}
        tunnelColors={tunnelColorsCompat}
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
        bind:bpm
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
