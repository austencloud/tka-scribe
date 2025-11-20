<!--
  TunnelModePanel.svelte - Tunnel Mode (Overlay Animation)

  Overlays two sequences with different colors to create "tunneling" effect.
  Primary performer: Red/Blue
  Secondary performer: Green/Purple
-->
<script lang="ts">
  import type { AnimateModuleState } from "../shared/state/animate-module-state.svelte";
  import SequenceBrowserPanel from "../shared/components/SequenceBrowserPanel.svelte";
  import TunnelModeCanvas from "./components/TunnelModeCanvas.svelte";
  import BeatGrid from "$create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";
  import { loadSequenceForAnimation } from "../utils/sequence-loader";
  import type {
    ISequenceService,
    ISequenceTransformationService,
  } from "$create/shared";
  import { resolve, TYPES, type SequenceData } from "$shared";
  import { onMount } from "svelte";

  // Props
  let {
    animateState,
  }: {
    animateState: AnimateModuleState;
  } = $props();

  // Derived: Check if both sequences are selected
  const bothSequencesSelected = $derived(
    animateState.primarySequence && animateState.secondarySequence
  );

  // Derived: Check which sequences are missing
  const needsPrimary = $derived(!animateState.primarySequence);
  const needsSecondary = $derived(!animateState.secondarySequence);

  // Bindable state for animation controls
  let animatingBeatNumber = $state<number | null>(null);

  // Loaded sequences with full beat data
  let loadedPrimarySequence = $state<SequenceData | null>(null);
  let loadedSecondarySequence = $state<SequenceData | null>(null);
  let sequenceService: ISequenceService | null = null;

  // Separate beats from start position for BeatGrid
  // BeatGrid expects: beats = actual beats only (1, 2, 3...), startPosition = beat 0
  const primaryBeats = $derived(() => {
    if (!loadedPrimarySequence) return [];
    const allBeats = loadedPrimarySequence.beats || [];

    console.log("🔍 PRIMARY - Raw beats array:", {
      total: allBeats.length,
      beatNumbers: allBeats.map((b) => b.beatNumber),
      hasStartPosition: !!loadedPrimarySequence.startPosition,
      hasStartingPositionBeat: !!(loadedPrimarySequence as any)
        .startingPositionBeat,
    });

    // If sequence has separate startPosition, beats array is already correct
    if (loadedPrimarySequence.startPosition) {
      console.log(
        "✅ PRIMARY - Using existing startPosition, beats array unchanged"
      );
      return allBeats;
    }

    // Otherwise, beat 0 is mixed in - filter it out
    // Return only beats with beatNumber >= 1
    const filteredBeats = allBeats.filter((beat) => beat.beatNumber > 0);
    console.log("✅ PRIMARY - Filtered out beat 0:", {
      original: allBeats.length,
      filtered: filteredBeats.length,
      removedCount: allBeats.length - filteredBeats.length,
    });
    return filteredBeats;
  });

  const primaryStartPosition = $derived(() => {
    if (!loadedPrimarySequence) return null;

    // If sequence has separate startPosition, use it
    if (loadedPrimarySequence.startPosition) {
      console.log("✅ PRIMARY - Using existing startPosition field");
      return loadedPrimarySequence.startPosition;
    }

    // Otherwise, extract beat 0 from beats array
    const allBeats = loadedPrimarySequence.beats || [];
    const beat0 = allBeats.find((beat) => beat.beatNumber === 0) || null;
    console.log("✅ PRIMARY - Extracted beat 0 from beats array:", {
      found: !!beat0,
      beatNumber: beat0?.beatNumber,
      letter: beat0?.letter,
    });
    return beat0;
  });

  const secondaryBeats = $derived(() => {
    if (!loadedSecondarySequence) return [];
    const allBeats = loadedSecondarySequence.beats || [];

    console.log("🔍 SECONDARY - Raw beats array:", {
      total: allBeats.length,
      beatNumbers: allBeats.map((b) => b.beatNumber),
      hasStartPosition: !!loadedSecondarySequence.startPosition,
      hasStartingPositionBeat: !!(loadedSecondarySequence as any)
        .startingPositionBeat,
    });

    // If sequence has separate startPosition, beats array is already correct
    if (loadedSecondarySequence.startPosition) {
      console.log(
        "✅ SECONDARY - Using existing startPosition, beats array unchanged"
      );
      return allBeats;
    }

    // Otherwise, beat 0 is mixed in - filter it out
    // Return only beats with beatNumber >= 1
    const filteredBeats = allBeats.filter((beat) => beat.beatNumber > 0);
    console.log("✅ SECONDARY - Filtered out beat 0:", {
      original: allBeats.length,
      filtered: filteredBeats.length,
      removedCount: allBeats.length - filteredBeats.length,
    });
    return filteredBeats;
  });

  const secondaryStartPosition = $derived(() => {
    if (!loadedSecondarySequence) return null;

    // If sequence has separate startPosition, use it
    if (loadedSecondarySequence.startPosition) {
      console.log("✅ SECONDARY - Using existing startPosition field");
      return loadedSecondarySequence.startPosition;
    }

    // Otherwise, extract beat 0 from beats array
    const allBeats = loadedSecondarySequence.beats || [];
    const beat0 = allBeats.find((beat) => beat.beatNumber === 0) || null;
    console.log("✅ SECONDARY - Extracted beat 0 from beats array:", {
      found: !!beat0,
      beatNumber: beat0?.beatNumber,
      letter: beat0?.letter,
    });
    return beat0;
  });

  // Initialize services
  onMount(() => {
    sequenceService = resolve(TYPES.ISequenceService) as ISequenceService;
  });

  // Load full sequences when selected sequences change
  $effect(() => {
    if (animateState.primarySequence && sequenceService) {
      loadFullSequence(animateState.primarySequence, "primary");
    }
  });

  $effect(() => {
    if (animateState.secondarySequence && sequenceService) {
      loadFullSequence(animateState.secondarySequence, "secondary");
    }
  });

  async function loadFullSequence(
    sequence: SequenceData,
    type: "primary" | "secondary"
  ) {
    if (!sequenceService) return;

    try {
      console.log(`🎬 TunnelModePanel: Loading ${type} sequence:`, sequence.id);
      const result = await loadSequenceForAnimation(sequence, sequenceService);

      if (result.success && result.sequence) {
        if (type === "primary") {
          loadedPrimarySequence = result.sequence;
        } else {
          loadedSecondarySequence = result.sequence;
        }
        console.log(
          `✅ TunnelModePanel: ${type} sequence loaded with ${result.sequence.beats.length} beats`
        );
      }
    } catch (err) {
      console.error(
        `❌ TunnelModePanel: Failed to load ${type} sequence:`,
        err
      );
    }
  }

  // Transformation handlers
  async function handleMirror(type: "primary" | "secondary") {
    const sequence =
      type === "primary" ? loadedPrimarySequence : loadedSecondarySequence;
    if (!sequence) return;

    try {
      console.log(`🪞 Mirroring ${type} sequence...`);
      // Lazily resolve service when needed
      const transformationService = resolve(
        TYPES.ISequenceTransformationService
      ) as ISequenceTransformationService;
      const transformed = transformationService.mirrorSequence(sequence);

      if (type === "primary") {
        loadedPrimarySequence = transformed;
        animateState.setPrimarySequence(transformed);
      } else {
        loadedSecondarySequence = transformed;
        animateState.setSecondarySequence(transformed);
      }

      console.log(`✅ ${type} sequence mirrored successfully`);
    } catch (err) {
      console.error(`❌ Failed to mirror ${type} sequence:`, err);
    }
  }

  async function handleRotate(type: "primary" | "secondary") {
    const sequence =
      type === "primary" ? loadedPrimarySequence : loadedSecondarySequence;
    if (!sequence) return;

    try {
      console.log(`🔄 Rotating ${type} sequence...`);
      // Lazily resolve service when needed
      const transformationService = resolve(
        TYPES.ISequenceTransformationService
      ) as ISequenceTransformationService;
      const transformed = transformationService.rotateSequence(sequence, 1);

      if (type === "primary") {
        loadedPrimarySequence = transformed;
        animateState.setPrimarySequence(transformed);
      } else {
        loadedSecondarySequence = transformed;
        animateState.setSecondarySequence(transformed);
      }

      console.log(`✅ ${type} sequence rotated successfully`);
    } catch (err) {
      console.error(`❌ Failed to rotate ${type} sequence:`, err);
    }
  }

  async function handleColorSwap(type: "primary" | "secondary") {
    const sequence =
      type === "primary" ? loadedPrimarySequence : loadedSecondarySequence;
    if (!sequence) return;

    try {
      console.log(`🎨 Swapping colors for ${type} sequence...`);
      // Lazily resolve service when needed
      const transformationService = resolve(
        TYPES.ISequenceTransformationService
      ) as ISequenceTransformationService;
      const transformed = transformationService.swapColors(sequence);

      if (type === "primary") {
        loadedPrimarySequence = transformed;
        animateState.setPrimarySequence(transformed);
      } else {
        loadedSecondarySequence = transformed;
        animateState.setSecondarySequence(transformed);
      }

      console.log(`✅ ${type} sequence colors swapped successfully`);
    } catch (err) {
      console.error(`❌ Failed to swap colors for ${type} sequence:`, err);
    }
  }

  async function handleReverse(type: "primary" | "secondary") {
    const sequence =
      type === "primary" ? loadedPrimarySequence : loadedSecondarySequence;
    if (!sequence) return;

    try {
      console.log(`⏮️ Reversing ${type} sequence...`);
      // Lazily resolve service when needed
      const transformationService = resolve(
        TYPES.ISequenceTransformationService
      ) as ISequenceTransformationService;
      const transformed = await transformationService.reverseSequence(sequence);

      if (type === "primary") {
        loadedPrimarySequence = transformed;
        animateState.setPrimarySequence(transformed);
      } else {
        loadedSecondarySequence = transformed;
        animateState.setSecondarySequence(transformed);
      }

      console.log(`✅ ${type} sequence reversed successfully`);
    } catch (err) {
      console.error(`❌ Failed to reverse ${type} sequence:`, err);
    }
  }

  // Visibility toggles
  let primaryVisible = $state(true);
  let primaryBlueVisible = $state(true);
  let primaryRedVisible = $state(true);
  let secondaryVisible = $state(true);
  let secondaryBlueVisible = $state(true);
  let secondaryRedVisible = $state(true);

  // Required beat count for filtering
  const requiredBeatCount = $derived.by(() => {
    if (animateState.browserMode === "primary") {
      return animateState.secondarySequence?.beats.length;
    } else if (animateState.browserMode === "secondary") {
      return animateState.primarySequence?.beats.length;
    }
    return undefined;
  });
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
        <button
          class="sequence-selector"
          class:selected={!needsPrimary}
          onclick={() => animateState.openSequenceBrowser("primary")}
        >
          <div
            class="selector-header"
            style="background: linear-gradient(135deg, #3b82f6, #ef4444);"
          >
            <i class="fas fa-user"></i>
            <span>Primary Performer</span>
          </div>
          <div class="selector-content">
            {#if animateState.primarySequence}
              <div class="selected-sequence">
                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                <div class="sequence-name">
                  {animateState.primarySequence.word || "Untitled"}
                </div>
              </div>
            {:else}
              <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <span>Click to select sequence</span>
              </div>
            {/if}
          </div>
          <div class="color-indicators">
            <div
              class="color-dot"
              style="background: #3b82f6;"
              title="Blue"
            ></div>
            <div
              class="color-dot"
              style="background: #ef4444;"
              title="Red"
            ></div>
          </div>
        </button>

        <!-- Plus Icon -->
        <div class="plus-icon">
          <i class="fas fa-plus"></i>
        </div>

        <!-- Secondary Sequence Selector -->
        <button
          class="sequence-selector"
          class:selected={!needsSecondary}
          onclick={() => animateState.openSequenceBrowser("secondary")}
        >
          <div
            class="selector-header"
            style="background: linear-gradient(135deg, #10b981, #a855f7);"
          >
            <i class="fas fa-user"></i>
            <span>Secondary Performer</span>
          </div>
          <div class="selector-content">
            {#if animateState.secondarySequence}
              <div class="selected-sequence">
                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                <div class="sequence-name">
                  {animateState.secondarySequence.word || "Untitled"}
                </div>
              </div>
            {:else}
              <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <span>Click to select sequence</span>
              </div>
            {/if}
          </div>
          <div class="color-indicators">
            <div
              class="color-dot"
              style="background: #10b981;"
              title="Green"
            ></div>
            <div
              class="color-dot"
              style="background: #a855f7;"
              title="Purple"
            ></div>
          </div>
        </button>
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
          <div class="panel-header">
            <div class="panel-title">
              <span class="sequence-name"
                >{animateState.primarySequence!.word}</span
              >
              <div class="color-dots">
                <div
                  class="mini-dot"
                  style="background: {animateState.tunnelColors.primary.blue};"
                ></div>
                <div
                  class="mini-dot"
                  style="background: {animateState.tunnelColors.primary.red};"
                ></div>
              </div>
            </div>
            <div class="action-controls">
              <button
                class="action-btn mirror"
                onclick={() => handleMirror("primary")}
                aria-label="Mirror primary sequence"
                title="Mirror"
              >
                <i class="fas fa-left-right"></i>
              </button>
              <button
                class="action-btn rotate"
                onclick={() => handleRotate("primary")}
                aria-label="Rotate primary sequence"
                title="Rotate 45°"
              >
                <i class="fas fa-redo"></i>
              </button>
              <button
                class="action-btn color-swap"
                onclick={() => handleColorSwap("primary")}
                aria-label="Swap colors in primary sequence"
                title="Color Swap"
              >
                <i class="fas fa-palette"></i>
              </button>
              <button
                class="action-btn reverse"
                onclick={() => handleReverse("primary")}
                aria-label="Reverse primary sequence"
                title="Reverse"
              >
                <i class="fas fa-backward"></i>
              </button>
            </div>
            <div class="toggle-controls">
              <button
                class="toggle-btn"
                class:active={primaryVisible}
                onclick={() => (primaryVisible = !primaryVisible)}
                aria-label="Toggle primary sequence visibility"
              >
                <i class="fas fa-eye{primaryVisible ? '' : '-slash'}"></i>
              </button>
              <button
                class="toggle-btn blue"
                class:active={primaryBlueVisible}
                onclick={() => (primaryBlueVisible = !primaryBlueVisible)}
                aria-label="Toggle primary blue prop"
                style="--toggle-color: {animateState.tunnelColors.primary.blue}"
              >
                B
              </button>
              <button
                class="toggle-btn red"
                class:active={primaryRedVisible}
                onclick={() => (primaryRedVisible = !primaryRedVisible)}
                aria-label="Toggle primary red prop"
                style="--toggle-color: {animateState.tunnelColors.primary.red}"
              >
                R
              </button>
            </div>
          </div>
          <div class="panel-content">
            {#if loadedPrimarySequence}
              <BeatGrid
                beats={primaryBeats()}
                startPosition={primaryStartPosition()}
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
          <div class="panel-header">
            <div class="panel-title">
              <span class="sequence-name"
                >{animateState.secondarySequence!.word}</span
              >
              <div class="color-dots">
                <div
                  class="mini-dot"
                  style="background: {animateState.tunnelColors.secondary
                    .blue};"
                ></div>
                <div
                  class="mini-dot"
                  style="background: {animateState.tunnelColors.secondary.red};"
                ></div>
              </div>
            </div>
            <div class="action-controls">
              <button
                class="action-btn mirror"
                onclick={() => handleMirror("secondary")}
                aria-label="Mirror secondary sequence"
                title="Mirror"
              >
                <i class="fas fa-left-right"></i>
              </button>
              <button
                class="action-btn rotate"
                onclick={() => handleRotate("secondary")}
                aria-label="Rotate secondary sequence"
                title="Rotate 45°"
              >
                <i class="fas fa-redo"></i>
              </button>
              <button
                class="action-btn color-swap"
                onclick={() => handleColorSwap("secondary")}
                aria-label="Swap colors in secondary sequence"
                title="Color Swap"
              >
                <i class="fas fa-palette"></i>
              </button>
              <button
                class="action-btn reverse"
                onclick={() => handleReverse("secondary")}
                aria-label="Reverse secondary sequence"
                title="Reverse"
              >
                <i class="fas fa-backward"></i>
              </button>
            </div>
            <div class="toggle-controls">
              <button
                class="toggle-btn"
                class:active={secondaryVisible}
                onclick={() => (secondaryVisible = !secondaryVisible)}
                aria-label="Toggle secondary sequence visibility"
              >
                <i class="fas fa-eye{secondaryVisible ? '' : '-slash'}"></i>
              </button>
              <button
                class="toggle-btn blue"
                class:active={secondaryBlueVisible}
                onclick={() => (secondaryBlueVisible = !secondaryBlueVisible)}
                aria-label="Toggle secondary blue prop"
                style="--toggle-color: {animateState.tunnelColors.secondary
                  .blue}"
              >
                B
              </button>
              <button
                class="toggle-btn red"
                class:active={secondaryRedVisible}
                onclick={() => (secondaryRedVisible = !secondaryRedVisible)}
                aria-label="Toggle secondary red prop"
                style="--toggle-color: {animateState.tunnelColors.secondary
                  .red}"
              >
                R
              </button>
            </div>
          </div>
          <div class="panel-content">
            {#if loadedSecondarySequence}
              <BeatGrid
                beats={secondaryBeats()}
                startPosition={secondaryStartPosition()}
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
                bind:isPlaying={animateState.isPlaying}
                bind:animatingBeatNumber
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
      <div class="controls-panel">
        <div class="playback-controls">
          <button
            class="control-button"
            class:active={animateState.isPlaying}
            onclick={() => animateState.setIsPlaying(!animateState.isPlaying)}
            aria-label={animateState.isPlaying
              ? "Pause animation"
              : "Play animation"}
          >
            <i class={animateState.isPlaying ? "fas fa-pause" : "fas fa-play"}
            ></i>
          </button>
          <button
            class="control-button"
            onclick={() => animateState.setIsPlaying(false)}
            aria-label="Stop animation"
          >
            <i class="fas fa-stop"></i>
          </button>
        </div>

        <div class="setting-group">
          <label for="tunnel-speed">
            <i class="fas fa-gauge"></i>
            Speed
          </label>
          <input
            id="tunnel-speed"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={animateState.speed}
            oninput={(e) =>
              animateState.setSpeed(parseFloat(e.currentTarget.value))}
          />
          <span class="setting-value">{animateState.speed.toFixed(1)}x</span>
        </div>

        <button class="export-button">
          <i class="fas fa-download"></i>
          Export Tunnel GIF
        </button>
      </div>
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

  .sequence-selector {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 200px;
  }

  .sequence-selector:hover {
    border-color: rgba(236, 72, 153, 0.5);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(236, 72, 153, 0.3);
  }

  .sequence-selector.selected {
    border-color: rgba(16, 185, 129, 0.5);
  }

  .selector-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    color: white;
    font-weight: 600;
  }

  .selector-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
  }

  .selected-sequence {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .selected-sequence i {
    font-size: 2rem;
  }

  .sequence-name {
    font-size: 1.125rem;
    font-weight: 600;
    text-align: center;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    opacity: 0.5;
  }

  .empty-state i {
    font-size: 2.5rem;
  }

  .color-indicators {
    display: flex;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
  }

  .color-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid white;
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

  .sequence-name {
    opacity: 0.9;
  }

  .color-dots {
    display: flex;
    gap: 4px;
  }

  .mini-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.5);
  }

  .action-controls {
    display: flex;
    gap: 4px;
    margin: 0 var(--spacing-sm);
  }

  .action-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-sm);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .action-btn:active {
    transform: translateY(0);
  }

  .action-btn.mirror:hover {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.5);
    color: #a78bfa;
  }

  .action-btn.rotate:hover {
    background: rgba(236, 72, 153, 0.2);
    border-color: rgba(236, 72, 153, 0.5);
    color: #ec4899;
  }

  .action-btn.color-swap:hover {
    background: rgba(245, 158, 11, 0.2);
    border-color: rgba(245, 158, 11, 0.5);
    color: #fbbf24;
  }

  .action-btn.reverse:hover {
    background: rgba(16, 185, 129, 0.2);
    border-color: rgba(16, 185, 129, 0.5);
    color: #34d399;
  }

  .toggle-controls {
    display: flex;
    gap: 4px;
  }

  .toggle-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-sm);
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .toggle-btn.active {
    background: var(--toggle-color, rgba(236, 72, 153, 0.3));
    border-color: var(--toggle-color, rgba(236, 72, 153, 0.5));
    color: white;
  }

  .toggle-btn i {
    font-size: 0.75rem;
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

  /* Controls */
  .controls-panel {
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: rgba(255, 255, 255, 0.05);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .playback-controls {
    display: flex;
    gap: var(--spacing-sm);
  }

  .control-button {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-button:hover {
    background: rgba(236, 72, 153, 0.3);
    border-color: rgba(236, 72, 153, 0.5);
  }

  .control-button.active {
    background: rgba(236, 72, 153, 0.4);
    border-color: rgba(236, 72, 153, 0.6);
  }

  .setting-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .setting-group label {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .setting-group input[type="range"] {
    width: 120px;
  }

  .setting-value {
    font-size: 0.875rem;
    font-weight: 600;
    min-width: 45px;
    text-align: right;
  }

  .export-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: var(--border-radius-md);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .export-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
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

    .controls-panel {
      flex-wrap: wrap;
    }
  }
</style>
