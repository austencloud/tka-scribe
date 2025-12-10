<!--
  TransformExample.svelte

  Interactive pictograph example for a transform.
  Shows ONE pictograph that transforms in-place when button is clicked.
-->
<script lang="ts">
  import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";

  interface Props {
    pictograph: PictographData | null;
    color: string;
    isRotate?: boolean;
    isLoading?: boolean;
    onTransform: () => void;
    onRotate?: (direction: "cw" | "ccw") => void;
    onShuffle: () => void;
  }

  let { pictograph, color, isRotate = false, isLoading = false, onTransform, onRotate, onShuffle }: Props = $props();
</script>

<div class="example-section" style="--help-color: {color}">
  <div class="example-label">Try it:</div>
  <div class="example-content">
    <div class="pictograph-box">
      {#if isLoading}
        <div class="pictograph-loading">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
      {:else if pictograph}
        <div class="pictograph-wrapper">
          <Pictograph pictographData={pictograph} />
        </div>
      {:else}
        <div class="pictograph-empty">
          <i class="fas fa-image"></i>
        </div>
      {/if}
    </div>

    <div class="action-buttons">
      {#if isRotate && onRotate}
        <button class="transform-btn" onclick={() => onRotate("ccw")} disabled={!pictograph || isLoading} title="Rotate left">
          <i class="fas fa-rotate-left"></i>
        </button>
        <button class="transform-btn" onclick={() => onRotate("cw")} disabled={!pictograph || isLoading} title="Rotate right">
          <i class="fas fa-rotate-right"></i>
        </button>
      {:else}
        <button class="transform-btn" onclick={onTransform} disabled={!pictograph || isLoading} title="Apply transform">
          <i class="fas fa-play"></i>
        </button>
      {/if}
      <button class="shuffle-btn" onclick={onShuffle} disabled={isLoading} title="New pictograph">
        <i class="fas fa-shuffle"></i>
      </button>
    </div>
  </div>
  <p class="example-hint">Tap to see the effect. Shuffle for a new example.</p>
</div>

<style>
  .example-section {
    margin-top: 8px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .example-label {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .example-content {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
  }

  .pictograph-box {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pictograph-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.3);
    overflow: hidden;
    transition: transform 0.2s ease;
  }

  .pictograph-wrapper:active {
    transform: scale(0.95);
  }

  .pictograph-wrapper :global(svg) {
    width: 100%;
    height: 100%;
  }

  .pictograph-loading,
  .pictograph-empty {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.3);
    font-size: 20px;
  }

  .pictograph-loading {
    color: var(--help-color);
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .transform-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--help-color);
    border: none;
    color: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.15s ease;
  }

  .transform-btn:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 2px 12px color-mix(in srgb, var(--help-color) 50%, transparent);
  }

  .transform-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .transform-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .shuffle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.15s ease;
  }

  .shuffle-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
  }

  .shuffle-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .example-hint {
    margin: 8px 0 0;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.35);
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .transform-btn:hover:not(:disabled),
    .transform-btn:active:not(:disabled),
    .pictograph-wrapper:active {
      transform: none;
    }
  }
</style>
