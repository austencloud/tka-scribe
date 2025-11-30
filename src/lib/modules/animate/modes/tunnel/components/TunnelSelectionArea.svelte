<!--
  TunnelSelectionArea.svelte

  Empty state UI for tunnel mode when sequences are not yet selected.
  Shows visual preview of tunnel effect and sequence selector cards.
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { resolve } from "$lib/shared/inversify";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { ISequenceNormalizationService } from "../../../services/contracts";

  // Services
  const normalizationService = resolve(
    TYPES.ISequenceNormalizationService
  ) as ISequenceNormalizationService;

  // Props
  let {
    primarySequence,
    secondarySequence,
    onSelectPrimary,
    onSelectSecondary,
  }: {
    primarySequence: SequenceData | null;
    secondarySequence: SequenceData | null;
    onSelectPrimary: () => void;
    onSelectSecondary: () => void;
  } = $props();

  // Get normalized beat counts (excluding start position)
  const primaryBeatCount = $derived.by(() => {
    if (!primarySequence) return 0;
    const normalized = normalizationService.separateBeatsFromStartPosition(primarySequence);
    return normalized.beats.length;
  });

  const secondaryBeatCount = $derived.by(() => {
    if (!secondarySequence) return 0;
    const normalized = normalizationService.separateBeatsFromStartPosition(secondarySequence);
    return normalized.beats.length;
  });
</script>

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
      class:selected={!!primarySequence}
      onclick={onSelectPrimary}
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
        {#if primarySequence}
          <span class="sequence-name">{primarySequence.word}</span>
          <span class="sequence-beats">{primaryBeatCount} beats</span>
        {:else}
          <span class="placeholder">Tap to select sequence</span>
        {/if}
      </div>
      <div class="card-action">
        <i class="fas fa-{primarySequence ? 'check-circle' : 'plus-circle'}"></i>
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
      class:selected={!!secondarySequence}
      onclick={onSelectSecondary}
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
        {#if secondarySequence}
          <span class="sequence-name">{secondarySequence.word}</span>
          <span class="sequence-beats">{secondaryBeatCount} beats</span>
        {:else}
          <span class="placeholder">Tap to select sequence</span>
        {/if}
      </div>
      <div class="card-action">
        <i class="fas fa-{secondarySequence ? 'check-circle' : 'plus-circle'}"></i>
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

<style>
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

  /* Responsive */
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
  }
</style>
