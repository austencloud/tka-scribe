<!--
  TunnelSelectionAreaMobile.svelte

  Mobile-optimized empty state UI for tunnel mode.
  Stacked sequence selectors with condensed visual elements.
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

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
</script>

<div class="mobile-empty-state">
  <!-- Compact Header -->
  <div class="header">
    <div class="header-icon">
      <i class="fas fa-layer-group"></i>
    </div>
    <h1>Tunnel Mode</h1>
    <p>Overlay two sequences to compare patterns</p>
  </div>

  <!-- Compact Visual Preview -->
  <div class="tunnel-preview">
    <div class="preview-layer primary">
      <span class="color-dot blue"></span>
      <span class="color-dot red"></span>
    </div>
    <i class="fas fa-plus op"></i>
    <div class="preview-layer secondary">
      <span class="color-dot green"></span>
      <span class="color-dot purple"></span>
    </div>
    <i class="fas fa-equals op"></i>
    <div class="preview-result">
      <div class="layer l1"></div>
      <div class="layer l2"></div>
    </div>
  </div>

  <!-- Stacked Sequence Selectors -->
  <div class="selectors">
    <!-- Primary Selector -->
    <button
      class="selector primary"
      class:selected={!!primarySequence}
      onclick={onSelectPrimary}
    >
      <div class="selector-left">
        <div class="selector-icon">
          <i class="fas fa-user"></i>
        </div>
        <div class="selector-info">
          <span class="selector-title">Primary</span>
          {#if primarySequence}
            <span class="selector-value">{primarySequence.word}</span>
          {:else}
            <span class="selector-placeholder">Tap to select</span>
          {/if}
        </div>
      </div>
      <div class="selector-right">
        <div class="color-dots">
          <span class="dot blue"></span>
          <span class="dot red"></span>
        </div>
        <i class="fas fa-{primarySequence ? 'check-circle' : 'chevron-right'}"></i>
      </div>
    </button>

    <!-- Connector -->
    <div class="connector">
      <div class="line"></div>
      <div class="plus"><i class="fas fa-plus"></i></div>
      <div class="line"></div>
    </div>

    <!-- Secondary Selector -->
    <button
      class="selector secondary"
      class:selected={!!secondarySequence}
      onclick={onSelectSecondary}
    >
      <div class="selector-left">
        <div class="selector-icon">
          <i class="fas fa-user-friends"></i>
        </div>
        <div class="selector-info">
          <span class="selector-title">Secondary</span>
          {#if secondarySequence}
            <span class="selector-value">{secondarySequence.word}</span>
          {:else}
            <span class="selector-placeholder">Tap to select</span>
          {/if}
        </div>
      </div>
      <div class="selector-right">
        <div class="color-dots">
          <span class="dot green"></span>
          <span class="dot purple"></span>
        </div>
        <i class="fas fa-{secondarySequence ? 'check-circle' : 'chevron-right'}"></i>
      </div>
    </button>
  </div>

  <!-- Compact Features -->
  <div class="features">
    <span class="feature"><i class="fas fa-eye"></i> Compare</span>
    <span class="feature"><i class="fas fa-palette"></i> Color Coded</span>
    <span class="feature"><i class="fas fa-sync-alt"></i> Synced</span>
  </div>

  <!-- Minimal Tip -->
  <div class="tip">
    <i class="fas fa-lightbulb"></i>
    <span>Select sequences with the same beat count</span>
  </div>
</div>

<style>
  .mobile-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
    height: 100%;
    padding: 1rem;
    padding-bottom: env(safe-area-inset-bottom, 1rem);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* Compact Header */
  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.4rem;
  }

  .header-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%);
    border: 1px solid rgba(20, 184, 166, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    color: #14b8a6;
  }

  .header h1 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header p {
    margin: 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Compact Tunnel Preview */
  .tunnel-preview {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
  }

  .preview-layer {
    display: flex;
    gap: 4px;
    padding: 6px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.03);
  }

  .preview-layer.primary {
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .preview-layer.secondary {
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .color-dot.blue { background: #3b82f6; }
  .color-dot.red { background: #ef4444; }
  .color-dot.green { background: #22c55e; }
  .color-dot.purple { background: #a855f7; }

  .op {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.25);
  }

  .preview-result {
    position: relative;
    width: 20px;
    height: 20px;
    padding: 4px;
    background: rgba(20, 184, 166, 0.1);
    border: 1px solid rgba(20, 184, 166, 0.3);
    border-radius: 6px;
  }

  .preview-result .layer {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 3px;
    opacity: 0.7;
  }

  .preview-result .l1 {
    top: 2px;
    left: 2px;
    background: linear-gradient(135deg, #3b82f6, #ef4444);
  }

  .preview-result .l2 {
    bottom: 2px;
    right: 2px;
    background: linear-gradient(135deg, #22c55e, #a855f7);
  }

  /* Stacked Selectors */
  .selectors {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    width: 100%;
    max-width: 340px;
  }

  .selector {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 64px;
    padding: 0.85rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: inherit;
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  .selector:active {
    transform: scale(0.98);
  }

  .selector.primary:not(.selected) {
    border-color: rgba(59, 130, 246, 0.25);
  }

  .selector.primary.selected {
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(59, 130, 246, 0.08);
  }

  .selector.secondary:not(.selected) {
    border-color: rgba(34, 197, 94, 0.25);
  }

  .selector.secondary.selected {
    border-color: rgba(34, 197, 94, 0.5);
    background: rgba(34, 197, 94, 0.08);
  }

  .selector-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .selector-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }

  .selector.primary .selector-icon {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }

  .selector.secondary .selector-icon {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }

  .selector-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    text-align: left;
  }

  .selector-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .selector-value {
    font-size: 0.8rem;
    color: #14b8a6;
    font-weight: 500;
  }

  .selector-placeholder {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
  }

  .selector-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .color-dots {
    display: flex;
    gap: 3px;
  }

  .color-dots .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .color-dots .dot.blue { background: #3b82f6; }
  .color-dots .dot.red { background: #ef4444; }
  .color-dots .dot.green { background: #22c55e; }
  .color-dots .dot.purple { background: #a855f7; }

  .selector-right i {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.3);
  }

  .selector.selected .selector-right i {
    color: #14b8a6;
  }

  .selector.primary.selected .selector-right i {
    color: #3b82f6;
  }

  .selector.secondary.selected .selector-right i {
    color: #22c55e;
  }

  /* Connector */
  .connector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .connector .line {
    width: 20px;
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 1px;
  }

  .connector .plus {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Compact Features */
  .features {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.4rem 0.65rem;
    background: rgba(20, 184, 166, 0.08);
    border: 1px solid rgba(20, 184, 166, 0.15);
    border-radius: 16px;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .feature i {
    font-size: 0.65rem;
    color: #14b8a6;
  }

  /* Minimal Tip */
  .tip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.85rem;
    background: rgba(251, 191, 36, 0.08);
    border: 1px solid rgba(251, 191, 36, 0.15);
    border-radius: 8px;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.65);
  }

  .tip i {
    color: #fbbf24;
    font-size: 0.8rem;
    flex-shrink: 0;
  }

  /* Extra small screens */
  @media (max-height: 600px) {
    .mobile-empty-state {
      gap: 0.75rem;
      justify-content: flex-start;
    }

    .header-icon {
      width: 44px;
      height: 44px;
      font-size: 1.2rem;
    }

    .header h1 {
      font-size: 1.2rem;
    }

    .tunnel-preview {
      display: none;
    }

    .features {
      display: none;
    }
  }
</style>
