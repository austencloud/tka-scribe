<!--
  TunnelModePanel.svelte - Tunnel Mode (Overlay Animation)

  Overlays two sequences with different colors to create "tunneling" effect.
  Primary performer: Blue/Red
  Secondary performer: Green/Purple

  REFACTORED VERSION - Uses services and extracted components with modern UI
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

  // Computed stats
  const totalBeats = $derived(
    loadedPrimarySequence?.beats.length ?? 0
  );

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
      <!-- Visual Header with Icon -->
      <div class="selection-header">
        <div class="header-icon">
          <i class="fas fa-layer-group"></i>
        </div>
        <h2>Tunnel Mode</h2>
        <p>Overlay two sequences to compare movement patterns</p>
      </div>

      <!-- Visual Preview of Tunnel Effect -->
      <div class="tunnel-preview">
        <div class="preview-layer primary-layer">
          <div class="layer-colors">
            <span class="color-dot blue"></span>
            <span class="color-dot red"></span>
          </div>
          <span class="layer-label">Primary</span>
        </div>
        <div class="preview-plus">
          <i class="fas fa-plus"></i>
        </div>
        <div class="preview-layer secondary-layer">
          <div class="layer-colors">
            <span class="color-dot green"></span>
            <span class="color-dot purple"></span>
          </div>
          <span class="layer-label">Secondary</span>
        </div>
        <div class="preview-equals">
          <i class="fas fa-equals"></i>
        </div>
        <div class="preview-result">
          <div class="result-layers">
            <div class="result-layer layer-1"></div>
            <div class="result-layer layer-2"></div>
          </div>
          <span class="layer-label">Tunnel</span>
        </div>
      </div>

      <!-- Sequence Selector Cards -->
      <div class="sequence-selectors">
        <!-- Primary Sequence Selector -->
        <button
          class="selector-card primary-card"
          class:selected={!!animateState.primarySequence}
          onclick={() => animateState.openSequenceBrowser("primary")}
        >
          <div class="card-header">
            <div class="card-icon">
              <i class="fas fa-user"></i>
            </div>
            <div class="card-colors">
              <span class="color-indicator blue"></span>
              <span class="color-indicator red"></span>
            </div>
          </div>
          <div class="card-content">
            <h3>Primary Performer</h3>
            {#if animateState.primarySequence}
              <span class="sequence-name">{animateState.primarySequence.word}</span>
              <span class="sequence-beats">{animateState.primarySequence.beats.length} beats</span>
            {:else}
              <span class="placeholder">Tap to select sequence</span>
            {/if}
          </div>
          <div class="card-action">
            <i class="fas fa-{animateState.primarySequence ? 'check-circle' : 'plus-circle'}"></i>
          </div>
        </button>

        <!-- Plus Connector -->
        <div class="connector">
          <div class="connector-line"></div>
          <div class="connector-icon">
            <i class="fas fa-plus"></i>
          </div>
          <div class="connector-line"></div>
        </div>

        <!-- Secondary Sequence Selector -->
        <button
          class="selector-card secondary-card"
          class:selected={!!animateState.secondarySequence}
          onclick={() => animateState.openSequenceBrowser("secondary")}
        >
          <div class="card-header">
            <div class="card-icon">
              <i class="fas fa-user-friends"></i>
            </div>
            <div class="card-colors">
              <span class="color-indicator green"></span>
              <span class="color-indicator purple"></span>
            </div>
          </div>
          <div class="card-content">
            <h3>Secondary Performer</h3>
            {#if animateState.secondarySequence}
              <span class="sequence-name">{animateState.secondarySequence.word}</span>
              <span class="sequence-beats">{animateState.secondarySequence.beats.length} beats</span>
            {:else}
              <span class="placeholder">Tap to select sequence</span>
            {/if}
          </div>
          <div class="card-action">
            <i class="fas fa-{animateState.secondarySequence ? 'check-circle' : 'plus-circle'}"></i>
          </div>
        </button>
      </div>

      <!-- Feature Highlights -->
      <div class="feature-highlights">
        <div class="feature-card">
          <i class="fas fa-eye"></i>
          <span>Compare Patterns</span>
        </div>
        <div class="feature-card">
          <i class="fas fa-palette"></i>
          <span>Color Coded</span>
        </div>
        <div class="feature-card">
          <i class="fas fa-sync-alt"></i>
          <span>Synchronized</span>
        </div>
        <div class="feature-card">
          <i class="fas fa-sliders-h"></i>
          <span>Toggle Layers</span>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="info-banner">
        <i class="fas fa-lightbulb"></i>
        <p>
          Select two sequences with the same beat count to overlay them.
          Perfect for comparing similar movements or analyzing timing differences.
        </p>
      </div>
    </div>
  {:else}
    <!-- Tunnel Animation View - Modern Layout -->
    <div class="animation-area">
      <!-- Modern Header Bar -->
      <div class="animation-header">
        <div class="header-left">
          <div class="header-icon-badge">
            <i class="fas fa-layer-group"></i>
          </div>
          <div class="header-info">
            <h2>Tunnel Mode</h2>
            <div class="sequence-badges">
              <span class="badge primary-badge">
                <span class="badge-dot blue"></span>
                <span class="badge-dot red"></span>
                {animateState.primarySequence!.word}
              </span>
              <span class="badge-plus">+</span>
              <span class="badge secondary-badge">
                <span class="badge-dot green"></span>
                <span class="badge-dot purple"></span>
                {animateState.secondarySequence!.word}
              </span>
            </div>
          </div>
        </div>
        <button
          class="change-button"
          onclick={() => {
            animateState.setPrimarySequence(null);
            animateState.setSecondarySequence(null);
          }}
        >
          <i class="fas fa-exchange-alt"></i>
          <span>Change</span>
        </button>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat-item">
          <i class="fas fa-music"></i>
          <span class="stat-value">{totalBeats}</span>
          <span class="stat-label">Beats</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <i class="fas fa-tachometer-alt"></i>
          <span class="stat-value">{speed.toFixed(1)}x</span>
          <span class="stat-label">Speed</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <i class="fas fa-eye"></i>
          <span class="stat-value">{(primaryVisible ? 1 : 0) + (secondaryVisible ? 1 : 0)}/2</span>
          <span class="stat-label">Visible</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item playback-status" class:playing={isPlaying}>
          <i class="fas fa-{isPlaying ? 'pause' : 'play'}"></i>
          <span class="stat-value">{isPlaying ? 'Playing' : 'Paused'}</span>
        </div>
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

        <!-- Plus Operator -->
        <div class="operator-icon">
          <div class="operator-badge">
            <i class="fas fa-plus"></i>
          </div>
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

        <!-- Equals Operator -->
        <div class="operator-icon">
          <div class="operator-badge result-badge">
            <i class="fas fa-equals"></i>
          </div>
        </div>

        <!-- Animation Result Panel -->
        <div class="tunnel-animation-panel">
          <div class="result-panel-header">
            <div class="result-title">
              <i class="fas fa-layer-group"></i>
              <span>Tunnel View</span>
            </div>
            <div class="layer-toggles">
              <button
                class="layer-toggle"
                class:active={primaryVisible}
                onclick={() => primaryVisible = !primaryVisible}
                title="Toggle Primary"
                aria-label="Toggle primary performer visibility"
                aria-pressed={primaryVisible}
              >
                <span class="toggle-dot blue"></span>
                <span class="toggle-dot red"></span>
              </button>
              <button
                class="layer-toggle"
                class:active={secondaryVisible}
                onclick={() => secondaryVisible = !secondaryVisible}
                title="Toggle Secondary"
                aria-label="Toggle secondary performer visibility"
                aria-pressed={secondaryVisible}
              >
                <span class="toggle-dot green"></span>
                <span class="toggle-dot purple"></span>
              </button>
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

      <!-- Modern Controls Panel -->
      <div class="controls-footer">
        <div class="playback-controls">
          <button
            class="control-btn play-btn"
            class:playing={isPlaying}
            onclick={() => isPlaying = !isPlaying}
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            <i class="fas fa-{isPlaying ? 'pause' : 'play'}"></i>
          </button>
          <div class="speed-control">
            <button
              class="speed-btn"
              disabled={speed <= 0.25}
              onclick={() => speed = Math.max(0.25, speed - 0.25)}
              aria-label="Decrease speed"
            >
              <i class="fas fa-minus"></i>
            </button>
            <span class="speed-display">{speed.toFixed(2)}x</span>
            <button
              class="speed-btn"
              disabled={speed >= 3}
              onclick={() => speed = Math.min(3, speed + 0.25)}
              aria-label="Increase speed"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        <div class="beat-indicator">
          <span class="beat-label">Beat</span>
          <span class="beat-number">{animatingBeatNumber ?? '-'}</span>
          <span class="beat-total">/ {totalBeats}</span>
        </div>
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
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.1) 100%);
  }

  /* ===========================
     SELECTION AREA (Empty State)
     =========================== */

  .selection-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 24px;
    gap: 24px;
    overflow-y: auto;
  }

  .selection-header {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .header-icon {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
    border: 1px solid rgba(20, 184, 166, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #14b8a6;
    animation: pulse-glow 3s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(20, 184, 166, 0.2); }
    50% { box-shadow: 0 0 30px rgba(20, 184, 166, 0.4); }
  }

  .selection-header h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .selection-header p {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    max-width: 320px;
  }

  /* Tunnel Preview Visual */
  .tunnel-preview {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 28px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .preview-layer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .primary-layer {
    border-color: rgba(59, 130, 246, 0.3);
    background: rgba(59, 130, 246, 0.05);
  }

  .secondary-layer {
    border-color: rgba(34, 197, 94, 0.3);
    background: rgba(34, 197, 94, 0.05);
  }

  .layer-colors {
    display: flex;
    gap: 6px;
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .color-dot.blue { background: #3b82f6; }
  .color-dot.red { background: #ef4444; }
  .color-dot.green { background: #22c55e; }
  .color-dot.purple { background: #a855f7; }

  .layer-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .preview-plus,
  .preview-equals {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.25);
  }

  .preview-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
    border: 1px solid rgba(20, 184, 166, 0.3);
  }

  .result-layers {
    position: relative;
    width: 24px;
    height: 24px;
  }

  .result-layer {
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    opacity: 0.8;
  }

  .result-layer.layer-1 {
    top: 0;
    left: 0;
    background: linear-gradient(135deg, #3b82f6 0%, #ef4444 100%);
  }

  .result-layer.layer-2 {
    bottom: 0;
    right: 0;
    background: linear-gradient(135deg, #22c55e 0%, #a855f7 100%);
  }

  /* Sequence Selector Cards */
  .sequence-selectors {
    display: flex;
    align-items: stretch;
    gap: 16px;
    max-width: 700px;
    width: 100%;
  }

  .selector-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.25s ease;
    text-align: left;
    color: inherit;
    font-family: inherit;
  }

  .selector-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  .selector-card.selected {
    border-color: rgba(20, 184, 166, 0.5);
    background: rgba(20, 184, 166, 0.08);
  }

  .primary-card:hover,
  .primary-card.selected {
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(59, 130, 246, 0.08);
  }

  .secondary-card:hover,
  .secondary-card.selected {
    border-color: rgba(34, 197, 94, 0.5);
    background: rgba(34, 197, 94, 0.08);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .primary-card .card-icon {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }

  .secondary-card .card-icon {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }

  .card-colors {
    display: flex;
    gap: 4px;
  }

  .color-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    box-shadow: 0 0 6px currentColor;
  }

  .color-indicator.blue { background: #3b82f6; color: #3b82f6; }
  .color-indicator.red { background: #ef4444; color: #ef4444; }
  .color-indicator.green { background: #22c55e; color: #22c55e; }
  .color-indicator.purple { background: #a855f7; color: #a855f7; }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .card-content h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .sequence-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: #14b8a6;
  }

  .sequence-beats {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .placeholder {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
  }

  .card-action {
    display: flex;
    justify-content: flex-end;
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.3);
    transition: color 0.2s ease;
  }

  .selector-card.selected .card-action {
    color: #14b8a6;
  }

  .primary-card.selected .card-action {
    color: #3b82f6;
  }

  .secondary-card.selected .card-action {
    color: #22c55e;
  }

  /* Connector */
  .connector {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .connector-line {
    width: 2px;
    height: 16px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%);
    border-radius: 1px;
  }

  .connector-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Feature Highlights */
  .feature-highlights {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .feature-card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.2s ease;
  }

  .feature-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(20, 184, 166, 0.3);
  }

  .feature-card i {
    font-size: 0.9rem;
    color: #14b8a6;
  }

  /* Info Banner */
  .info-banner {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%);
    border: 1px solid rgba(20, 184, 166, 0.2);
    border-radius: 12px;
    max-width: 500px;
  }

  .info-banner i {
    font-size: 1.25rem;
    color: #14b8a6;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .info-banner p {
    margin: 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
  }

  /* ===========================
     ANIMATION AREA (Active State)
     =========================== */

  .animation-area {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  /* Modern Header */
  .animation-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%);
    border-bottom: 1px solid rgba(20, 184, 166, 0.15);
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-icon-badge {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #14b8a6;
  }

  .header-info h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .sequence-badges {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
  }

  .badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .primary-badge {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
  }

  .secondary-badge {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .badge-dot.blue { background: #3b82f6; }
  .badge-dot.red { background: #ef4444; }
  .badge-dot.green { background: #22c55e; }
  .badge-dot.purple { background: #a855f7; }

  .badge-plus {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.3);
  }

  .change-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .change-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .change-button i {
    font-size: 0.75rem;
  }

  /* Stats Bar */
  .stats-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
  }

  .stat-item i {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .stat-value {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .stat-label {
    color: rgba(255, 255, 255, 0.4);
  }

  .stat-divider {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
  }

  .playback-status {
    padding: 4px 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.2s ease;
  }

  .playback-status.playing {
    background: rgba(34, 197, 94, 0.15);
  }

  .playback-status.playing i,
  .playback-status.playing .stat-value {
    color: #4ade80;
  }

  /* Three Panel Container */
  .three-panel-container {
    flex: 1;
    display: flex;
    align-items: stretch;
    gap: 8px;
    padding: 12px;
    overflow: hidden;
    min-height: 0;
  }

  .sequence-panel,
  .tunnel-animation-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
    min-width: 0;
  }

  .primary-panel {
    border-color: rgba(59, 130, 246, 0.2);
  }

  .secondary-panel {
    border-color: rgba(34, 197, 94, 0.2);
  }

  .tunnel-animation-panel {
    border-color: rgba(20, 184, 166, 0.3);
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.03) 0%, rgba(6, 182, 212, 0.03) 100%);
  }

  /* Operator Icons */
  .operator-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0 4px;
  }

  .operator-badge {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .result-badge {
    background: rgba(20, 184, 166, 0.1);
    border-color: rgba(20, 184, 166, 0.3);
    color: #14b8a6;
  }

  /* Result Panel Header */
  .result-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%);
    border-bottom: 1px solid rgba(20, 184, 166, 0.15);
    flex-shrink: 0;
  }

  .result-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #14b8a6;
  }

  .layer-toggles {
    display: flex;
    gap: 6px;
  }

  .layer-toggle {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0.4;
  }

  .layer-toggle:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .layer-toggle.active {
    opacity: 1;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .toggle-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .toggle-dot.blue { background: #3b82f6; }
  .toggle-dot.red { background: #ef4444; }
  .toggle-dot.green { background: #22c55e; }
  .toggle-dot.purple { background: #a855f7; }

  .panel-content {
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .animation-content {
    background: linear-gradient(135deg, rgba(15, 20, 30, 0.5) 0%, rgba(10, 15, 25, 0.5) 100%);
  }

  /* Loading States */
  .loading-beats,
  .loading-animation {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #14b8a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-beats p,
  .loading-animation p {
    margin: 0;
    font-size: 0.8rem;
  }

  /* Controls Footer */
  .controls-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(6, 182, 212, 0.03) 100%);
    border-top: 1px solid rgba(20, 184, 166, 0.1);
    flex-shrink: 0;
  }

  .playback-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .play-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);
  }

  .play-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
  }

  .play-btn.playing {
    background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  }

  .speed-control {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .speed-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .speed-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .speed-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .speed-display {
    min-width: 50px;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    font-family: 'SF Mono', 'Monaco', monospace;
  }

  .beat-indicator {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .beat-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .beat-number {
    font-size: 1.1rem;
    font-weight: 700;
    color: #14b8a6;
    font-family: 'SF Mono', 'Monaco', monospace;
  }

  .beat-total {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.4);
    font-family: 'SF Mono', 'Monaco', monospace;
  }

  /* ===========================
     RESPONSIVE
     =========================== */

  @media (max-width: 1024px) {
    .sequence-selectors {
      flex-direction: column;
    }

    .connector {
      flex-direction: row;
    }

    .connector-line {
      width: 16px;
      height: 2px;
    }

    .tunnel-preview {
      flex-wrap: wrap;
      justify-content: center;
    }

    .three-panel-container {
      flex-direction: column;
      overflow-y: auto;
      gap: 12px;
    }

    .operator-icon {
      padding: 4px 0;
    }

    .operator-badge {
      transform: rotate(90deg);
    }

    .sequence-panel,
    .tunnel-animation-panel {
      min-height: 280px;
    }

    .animation-header {
      flex-wrap: wrap;
      gap: 10px;
    }

    .sequence-badges {
      flex-wrap: wrap;
    }
  }

  @media (max-width: 600px) {
    .selection-area {
      padding: 16px;
      gap: 20px;
    }

    .selection-header h2 {
      font-size: 1.5rem;
    }

    .feature-highlights {
      gap: 8px;
    }

    .feature-card {
      padding: 8px 12px;
      font-size: 0.75rem;
    }

    .stats-bar {
      flex-wrap: wrap;
      gap: 12px;
    }

    .stat-divider {
      display: none;
    }

    .controls-footer {
      flex-direction: column;
      gap: 12px;
    }

    .playback-controls {
      width: 100%;
      justify-content: center;
    }
  }
</style>
