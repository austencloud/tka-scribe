<!--
  TransformHelpSheet.svelte

  Slide-up sheet explaining sequence transforms with interactive examples.
  Loads real pictographs from the dataframe for demonstrations.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { transformHelpContent } from "../../domain/transforms/transform-help-content";
  import { getRandomPictograph } from "../../domain/transforms/pictograph-example-loader";
  import { applyMirror, applyRotate, applySwap, applyReverse } from "../../domain/transforms/transform-functions";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import TransformHelpCard from "./TransformHelpCard.svelte";
  import TransformExample from "./TransformExample.svelte";

  interface Props {
    show: boolean;
    onClose: () => void;
  }

  let { show, onClose }: Props = $props();

  // Example pictograph state for each transform
  let examples = $state<Record<string, PictographData | null>>({
    mirror: null,
    rotate: null,
    swap: null,
    reverse: null,
  });

  let isLoading = $state(true);

  // Load initial pictographs when sheet opens
  $effect(() => {
    if (show && isLoading) {
      loadAllExamples();
    }
  });

  async function loadAllExamples() {
    isLoading = true;
    const [mirror, rotate, swap, reverse] = await Promise.all([
      getRandomPictograph(),
      getRandomPictograph(),
      getRandomPictograph(),
      getRandomPictograph(),
    ]);
    examples = { mirror, rotate, swap, reverse };
    isLoading = false;
  }

  // Transform handlers - apply in place
  function handleTransform(id: string) {
    const current = examples[id];
    if (!current) return;

    switch (id) {
      case "mirror":
        examples.mirror = applyMirror(current);
        break;
      case "swap":
        examples.swap = applySwap(current);
        break;
      case "reverse":
        examples.reverse = applyReverse(current);
        break;
    }
  }

  function handleRotate(direction: "cw" | "ccw") {
    const current = examples.rotate;
    if (!current) return;
    examples.rotate = applyRotate(current, direction);
  }

  // Shuffle handler - get new random pictograph
  async function handleShuffle(id: string) {
    const newPictograph = await getRandomPictograph();
    examples[id] = newPictograph;
  }
</script>

{#if show}
  <div class="help-overlay" onclick={onClose}>
    <div class="help-sheet" onclick={(e) => e.stopPropagation()}>
      <div class="help-header">
        <h3>Transform Actions</h3>
        <button class="help-close" onclick={onClose}>
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="help-content">
        {#each transformHelpContent as item}
          <TransformHelpCard {item}>
            <TransformExample
              pictograph={examples[item.id]}
              color={item.color}
              isRotate={item.id === "rotate"}
              {isLoading}
              onTransform={() => handleTransform(item.id)}
              onRotate={handleRotate}
              onShuffle={() => handleShuffle(item.id)}
            />
          </TransformHelpCard>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  /* ===== OVERLAY ===== */
  .help-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: flex-end; /* Mobile: bottom sheet */
    justify-content: center;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* ===== SHEET (Mobile: Bottom Sheet) ===== */
  .help-sheet {
    width: 100%;
    max-width: 500px;
    max-height: 85vh;
    background: linear-gradient(180deg, rgba(30, 34, 53, 0.98) 0%, rgba(20, 24, 40, 0.98) 100%);
    border-radius: 20px 20px 0 0; /* Mobile: rounded top only */
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
    box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.4);
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  /* ===== DESKTOP: Centered Modal ===== */
  @media (min-width: 768px) {
    .help-overlay {
      align-items: center; /* Desktop: vertically centered */
    }

    .help-sheet {
      max-width: 580px;
      max-height: 80vh;
      border-radius: 16px; /* Rounded all corners */
      animation: scaleIn 0.25s cubic-bezier(0.32, 0.72, 0, 1);
      box-shadow:
        0 24px 80px rgba(0, 0, 0, 0.5),
        0 8px 24px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  /* ===== HEADER ===== */
  .help-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .help-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .help-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-size: 16px;
    transition: all 0.15s ease;
  }

  .help-close:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  /* ===== CONTENT ===== */
  .help-content {
    padding: 16px 20px 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ===== ACCESSIBILITY ===== */
  @media (prefers-reduced-motion: reduce) {
    .help-overlay,
    .help-sheet {
      animation: none;
    }
  }
</style>
