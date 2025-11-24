<!--
  TunnelModePanel.svelte - Tunnel Mode (Overlay Animation)

  Overlays two sequences with different colors to create "tunneling" effect.
  Primary performer: Red/Blue
  Secondary performer: Green/Purple

  REFACTORED VERSION - Uses services and extracted components
-->
<script lang="ts">
  import type { AnimateModuleState } from "../shared/state/animate-module-state.svelte";
  import SequenceBrowserPanel from "../shared/components/SequenceBrowserPanel.svelte";
  import TunnelModeCanvas from "./components/TunnelModeCanvas.svelte";
  import BeatGrid from "$create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";
  import {
    AnimationControlsPanel,
    SequencePanelHeader,
    SequenceSelector,
  } from "./components";
  import { resolve, TYPES, type SequenceData } from "$shared";
  import type {
    ITunnelModeSequenceManager,
    ISequenceNormalizationService,
  } from "../services/contracts";
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

  // Initialize services
  onMount(() => {
    sequenceManager = resolve(
      TYPES.ITunnelModeSequenceManager
    ) as ITunnelModeSequenceManager;
    normalizationService = resolve(
      TYPES.ISequenceNormalizationService
    ) as ISequenceNormalizationService;
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
</script>

<div class="tunnel-mode-panel">
  <!-- Sequence Selection Area (when sequences not selected) -->
  {#if !bothSequencesSelected}
    <div class="selection-area">
      <div class="selection-header">
        <h2>Tunnel Mode Setup</h2>
        <p>Select two sequences to overlay with different colors</p>
      </div>

      <div class="sequence-selectors">
        <!-- Primary Sequence Selector -->
        <SequenceSelector
          sequence={animateState.primarySequence}
          title="Primary Performer"
          colors={[
            { color: animateState.tunnelColors.primary.blue, label: "Blue" },
            { color: animateState.tunnelColors.primary.red, label: "Red" },
          ]}
          selected={!!animateState.primarySequence}
          onclick={() => animateState.openSequenceBrowser("primary")}
        />

        <!-- Plus Icon -->
        <div class="plus-icon">
          <i class="fas fa-plus"></i>
        </div>

        <!-- Secondary Sequence Selector -->
        <SequenceSelector
          sequence={animateState.secondarySequence}
          title="Secondary Performer"
          colors={[
            { color: animateState.tunnelColors.secondary.blue, label: "Green" },
            { color: animateState.tunnelColors.secondary.red, label: "Purple" },
          ]}
          selected={!!animateState.secondarySequence}
          onclick={() => animateState.openSequenceBrowser("secondary")}
        />
      </div>

      <!-- Help Text -->
      <div class="help-text">
        <i class="fas fa-info-circle"></i>
        <p>
          Tunneling overlays two performers on the same canvas with different
          colors, allowing you to see how they interact in the same space.
        </p>
      </div>
    </div>
  {:else}
    <!-- Tunnel Animation View - Three Panel Layout -->
    <div class="animation-area">
      <!-- Header with Change Sequences Button -->
      <div class="animation-header">
        <h2>Tunnel Mode</h2>
        <button
          class="change-button"
          onclick={() => {
            animateState.setPrimarySequence(null);
            animateState.setSecondarySequence(null);
          }}
        >
          <i class="fas fa-exchange-alt"></i>
          Change Sequences
        </button>
      </div>

      <!-- Three Panel Layout: Primary + Secondary = Animation -->
      <div class="three-panel-container">
        <!-- Primary Sequence Panel -->
        <div class="sequence-panel primary-panel">
          <SequencePanelHeader
            sequenceName={animateState.primarySequence!.word}
            colors={[
              { color: animateState.tunnelColors.primary.blue, label: "Blue" },
              { color: animateState.tunnelColors.primary.red, label: "Red" },
            ]}
            bind:visible={primaryVisible}
            bind:blueVisible={primaryBlueVisible}
            bind:redVisible={primaryRedVisible}
            onMirror={() => handleTransform("primary", "mirror")}
            onRotate={() => handleTransform("primary", "rotate")}
            onColorSwap={() => handleTransform("primary", "colorSwap")}
            onReverse={() => handleTransform("primary", "reverse")}
          />
          <div class="panel-content">
            {#if loadedPrimarySequence}
              <BeatGrid
                beats={primaryNormalized.beats}
                startPosition={primaryNormalized.startPosition}
                selectedBeatNumber={animatingBeatNumber}
              />
            {:else}
              <div class="loading-beats">
                <div class="spinner"></div>
                <p>Loading beats...</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Plus Icon -->
        <div class="operator-icon">
          <i class="fas fa-plus"></i>
        </div>

        <!-- Secondary Sequence Panel -->
        <div class="sequence-panel secondary-panel">
          <SequencePanelHeader
            sequenceName={animateState.secondarySequence!.word}
            colors={[
              {
                color: animateState.tunnelColors.secondary.blue,
                label: "Green",
              },
              {
                color: animateState.tunnelColors.secondary.red,
                label: "Purple",
              },
            ]}
            bind:visible={secondaryVisible}
            bind:blueVisible={secondaryBlueVisible}
            bind:redVisible={secondaryRedVisible}
            onMirror={() => handleTransform("secondary", "mirror")}
            onRotate={() => handleTransform("secondary", "rotate")}
            onColorSwap={() => handleTransform("secondary", "colorSwap")}
            onReverse={() => handleTransform("secondary", "reverse")}
          />
          <div class="panel-content">
            {#if loadedSecondarySequence}
              <BeatGrid
                beats={secondaryNormalized.beats}
                startPosition={secondaryNormalized.startPosition}
                selectedBeatNumber={animatingBeatNumber}
              />
            {:else}
              <div class="loading-beats">
                <div class="spinner"></div>
                <p>Loading beats...</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Equals Icon -->
        <div class="operator-icon">
          <i class="fas fa-equals"></i>
        </div>

        <!-- Animation Result Panel -->
        <div class="animation-panel">
          <div class="panel-header">
            <div class="panel-title">
              <i class="fas fa-layer-group"></i>
              <span>Tunnel Animation</span>
            </div>
          </div>
          <div class="panel-content animation-content">
            {#if loadedPrimarySequence && loadedSecondarySequence}
              <TunnelModeCanvas
                primarySequence={loadedPrimarySequence}
                secondarySequence={loadedSecondarySequence}
                tunnelColors={animateState.tunnelColors}
                {primaryVisible}
                {primaryBlueVisible}
                {primaryRedVisible}
                {secondaryVisible}
                {secondaryBlueVisible}
                {secondaryRedVisible}
                bind:isPlaying
                bind:animatingBeatNumber
                speed={animateState.speed}
              />
            {:else}
              <div class="loading-animation">
                <div class="spinner"></div>
                <p>Loading sequences...</p>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Controls Panel -->
      <AnimationControlsPanel
        bind:isPlaying
        bind:speed
        showExport={true}
        onExport={() => console.log("Export not yet implemented")}
      />
    </div>
  {/if}

  <!-- Sequence Browser Panel -->
  {#key animateState.browserMode}
    <SequenceBrowserPanel
      mode={animateState.browserMode}
      show={animateState.isSequenceBrowserOpen}
      {requiredBeatCount}
      onSelect={(sequence) => {
        if (animateState.browserMode === "primary") {
          animateState.setPrimarySequence(sequence);
        } else if (animateState.browserMode === "secondary") {
          animateState.setSecondarySequence(sequence);
        }
        animateState.closeSequenceBrowser();
      }}
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
  }

  /* Selection Area */
  .selection-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: var(--spacing-xl);
    gap: var(--spacing-xl);
  }

  .selection-header {
    text-align: center;
  }

  .selection-header h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 var(--spacing-sm) 0;
  }

  .selection-header p {
    font-size: 1.125rem;
    opacity: 0.7;
    margin: 0;
  }

  /* Sequence Selectors */
  .sequence-selectors {
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
    max-width: 800px;
    width: 100%;
  }

  .plus-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    opacity: 0.3;
    flex-shrink: 0;
  }

  /* Help Text */
  .help-text {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: var(--border-radius-md);
    max-width: 600px;
  }

  .help-text i {
    font-size: 1.5rem;
    color: #60a5fa;
    flex-shrink: 0;
  }

  .help-text p {
    margin: 0;
    opacity: 0.8;
    line-height: 1.6;
  }

  /* Animation Area */
  .animation-area {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .animation-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md) var(--spacing-lg);
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .animation-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .change-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-md);
    color: white;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .change-button:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  /* Three Panel Layout */
  .three-panel-container {
    flex: 1;
    display: flex;
    align-items: stretch;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    overflow: hidden;
  }

  .sequence-panel,
  .animation-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
  }

  .operator-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    opacity: 0.3;
    flex-shrink: 0;
    padding: 0 var(--spacing-sm);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 0.875rem;
    font-weight: 600;
  }

  .panel-content {
    flex: 1;
    overflow: hidden;
  }

  .animation-content {
    background: linear-gradient(
      135deg,
      rgba(20, 25, 35, 0.5) 0%,
      rgba(15, 20, 30, 0.5) 100%
    );
  }

  .loading-beats,
  .loading-animation {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: var(--spacing-md);
    color: rgba(255, 255, 255, 0.7);
  }

  .loading-beats .spinner,
  .loading-animation .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #ec4899;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-beats p,
  .loading-animation p {
    margin: 0;
    font-size: 0.875rem;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .sequence-selectors {
      flex-direction: column;
    }

    .plus-icon {
      transform: rotate(90deg);
    }

    .three-panel-container {
      flex-direction: column;
      overflow-y: auto;
    }

    .operator-icon {
      transform: rotate(90deg);
    }

    .sequence-panel,
    .animation-panel {
      min-height: 400px;
    }
  }
</style>
