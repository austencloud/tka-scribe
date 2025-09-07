<!--
TransformTools.svelte - Sequence Transformation Tools

Handles sequence-level transformations like mirror, rotate, and swap colors.
Pure presentation component that delegates to sequence transform services.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    disabled?: boolean;
    hasSequence?: boolean;
    onMirror?: () => void;
    onSwapColors?: () => void;
    onRotate?: () => void;
    renderExtra?: Snippet;
  }

  let {
    disabled = false,
    hasSequence = false,
    onMirror,
    onSwapColors,
    onRotate,
    renderExtra,
  }: Props = $props();

  function handle(fn?: () => void) {
    if (disabled || !hasSequence) return;
    fn?.();
  }
</script>

<div class="transform-tools">
  <button
    type="button"
    class="tool-btn"
    title="Mirror Sequence"
    disabled={!hasSequence || disabled}
    onclick={() => handle(onMirror)}
  >
    🪞
  </button>
  
  <button
    type="button"
    class="tool-btn"
    title="Swap Colors"
    disabled={!hasSequence || disabled}
    onclick={() => handle(onSwapColors)}
  >
    🎨
  </button>
  
  <button
    type="button"
    class="tool-btn"
    title="Rotate Sequence"
    disabled={!hasSequence || disabled}
    onclick={() => handle(onRotate)}
  >
    🔄
  </button>

  {#if renderExtra}
    {@render renderExtra()}
  {/if}
</div>

<style>
  .transform-tools {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .tool-btn {
    width: 52px;
    height: 52px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-normal);
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;

    /* Subtle inner shadow for depth */
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .tool-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .tool-btn:active:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(0);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .tool-btn:disabled {
    background: rgba(200, 200, 200, 0.05);
    border-color: rgba(200, 200, 200, 0.1);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
    transform: none;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  /* Focus styles for accessibility */
  .tool-btn:focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: 2px;
  }
</style>
