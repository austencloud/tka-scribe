<!--
  SequenceEditPanel.svelte

  Panel for applying transformations to entire sequences.
  Provides mirror, rotate, swap colors, and reverse operations.
-->
<script lang="ts">
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  interface Props {
    sequence: SequenceData | null;
    onTransform: (newSequence: SequenceData) => void;
    handleMirror: () => SequenceData | null;
    handleRotate: (direction: "cw" | "ccw") => SequenceData | null;
    handleSwapColors: () => SequenceData | null;
    handleReverse: () => Promise<SequenceData | null>;
  }

  let { sequence, onTransform, handleMirror, handleRotate, handleSwapColors, handleReverse }: Props = $props();

  // Track which transformations are in progress
  let isTransforming = $state(false);

  /**
   * Mirror the sequence vertically
   */
  async function onMirrorClick() {
    if (!sequence || isTransforming) return;
    isTransforming = true;

    try {
      const result = handleMirror();
      if (result) {
        onTransform(result);
        console.log("Mirror transformation applied");
      }
    } finally {
      isTransforming = false;
    }
  }

  /**
   * Rotate the sequence 45 degrees
   */
  async function onRotateClick(direction: "cw" | "ccw") {
    if (!sequence || isTransforming) return;
    isTransforming = true;

    try {
      const result = handleRotate(direction);
      if (result) {
        onTransform(result);
        console.log(`Rotate ${direction} transformation applied`);
      }
    } finally {
      isTransforming = false;
    }
  }

  /**
   * Swap blue and red colors
   */
  async function onSwapColorsClick() {
    if (!sequence || isTransforming) return;
    isTransforming = true;

    try {
      const result = handleSwapColors();
      if (result) {
        onTransform(result);
        console.log("Swap colors transformation applied");
      }
    } finally {
      isTransforming = false;
    }
  }

  /**
   * Reverse the sequence order
   */
  async function onReverseClick() {
    if (!sequence || isTransforming) return;
    isTransforming = true;

    try {
      const result = await handleReverse();
      if (result) {
        onTransform(result);
        console.log("Reverse transformation applied");
      }
    } finally {
      isTransforming = false;
    }
  }
</script>

<div class="sequence-edit-panel">
  <h3 class="panel-title">Sequence Transformations</h3>

  {#if !sequence}
    <div class="no-sequence">
      <p>No sequence loaded</p>
    </div>
  {:else}
    <div class="transform-grid">
      <!-- Mirror -->
      <button
        class="transform-btn"
        onclick={onMirrorClick}
        disabled={isTransforming}
      >
        <div class="btn-icon">
          <i class="fas fa-left-right"></i>
        </div>
        <span class="btn-label">Mirror</span>
        <span class="btn-description">Flip vertically</span>
      </button>

      <!-- Rotate Clockwise -->
      <button
        class="transform-btn"
        onclick={() => onRotateClick("cw")}
        disabled={isTransforming}
      >
        <div class="btn-icon">
          <i class="fas fa-rotate-right"></i>
        </div>
        <span class="btn-label">Rotate CW</span>
        <span class="btn-description">45° clockwise</span>
      </button>

      <!-- Rotate Counter-Clockwise -->
      <button
        class="transform-btn"
        onclick={() => onRotateClick("ccw")}
        disabled={isTransforming}
      >
        <div class="btn-icon">
          <i class="fas fa-rotate-left"></i>
        </div>
        <span class="btn-label">Rotate CCW</span>
        <span class="btn-description">45° counter-clockwise</span>
      </button>

      <!-- Swap Colors -->
      <button
        class="transform-btn"
        onclick={onSwapColorsClick}
        disabled={isTransforming}
      >
        <div class="btn-icon swap-icon">
          <span class="color-dot blue"></span>
          <i class="fas fa-arrows-rotate"></i>
          <span class="color-dot red"></span>
        </div>
        <span class="btn-label">Swap Colors</span>
        <span class="btn-description">Exchange blue & red</span>
      </button>

      <!-- Reverse -->
      <button
        class="transform-btn"
        onclick={onReverseClick}
        disabled={isTransforming}
      >
        <div class="btn-icon">
          <i class="fas fa-backward"></i>
        </div>
        <span class="btn-label">Reverse</span>
        <span class="btn-description">Play backwards</span>
      </button>
    </div>

    {#if isTransforming}
      <div class="transforming-indicator">
        <div class="spinner"></div>
        <span>Applying transformation...</span>
      </div>
    {/if}
  {/if}
</div>

<style>
  .sequence-edit-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
  }

  .panel-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .no-sequence {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.5);
  }

  .transform-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    flex: 1;
  }

  .transform-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .transform-btn:hover:not(:disabled) {
    background: rgba(6, 182, 212, 0.1);
    border-color: rgba(6, 182, 212, 0.3);
    transform: translateY(-2px);
  }

  .transform-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .transform-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #06b6d4;
    height: 40px;
  }

  .swap-icon {
    gap: 8px;
  }

  .swap-icon i {
    font-size: 16px;
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .color-dot.blue {
    background: #3b82f6;
  }

  .color-dot.red {
    background: #ef4444;
  }

  .btn-label {
    font-size: 0.95rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .btn-description {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .transforming-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    padding: 12px;
    background: rgba(6, 182, 212, 0.1);
    border-radius: 8px;
    color: #06b6d4;
    font-size: 0.9rem;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: #06b6d4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 400px) {
    .transform-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
