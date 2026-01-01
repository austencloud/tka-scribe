<!--
  WordCard.svelte - Sequence card for print preview

  Displays a sequence image. In print mode, uses light styling for paper.
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  interface Props {
    sequence: SequenceData;
    printMode?: boolean;
  }

  let { sequence, printMode = false }: Props = $props();

  let hapticService: IHapticFeedback;
  let imageVersion = $state(1);
  let imageLoadFailed = $state(false);

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(TYPES.IHapticFeedback);
  });

  // Generate image path - try multiple versions
  let imagePath = $derived.by(() => {
    const word = sequence.name.replace(" Sequence", "");
    return `/gallery/${word}/${word}_ver${imageVersion}.webp`;
  });

  function handleClick() {
    hapticService?.trigger("selection");
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  }

  function handleImageError() {
    if (imageVersion < 6) {
      imageVersion++;
      imageLoadFailed = false;
    } else {
      imageLoadFailed = true;
    }
  }
</script>

<button
  class="word-card"
  class:print-mode={printMode}
  onclick={handleClick}
  onkeydown={handleKeyDown}
  aria-label="View sequence {sequence.name}"
  type="button"
>
  {#if !imageLoadFailed}
    <img
      src={imagePath}
      alt={sequence.name}
      class="card-image"
      loading="lazy"
      onerror={handleImageError}
    />
  {:else}
    <!-- Fallback for missing images -->
    <div class="card-fallback">
      <div class="fallback-icon">
        <i class="fas fa-image" aria-hidden="true"></i>
      </div>
      <span class="fallback-name">{sequence.name.replace(" Sequence", "")}</span>
      <span class="fallback-beats">{sequence.beats.length} beats</span>
    </div>
  {/if}
</button>

<style>
  .word-card {
    display: block;
    width: 100%;
    padding: 0;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: var(--border-radius-md, 8px);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  /* Print mode - exact print preview (no decorations) */
  .word-card.print-mode {
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }

  .word-card:hover:not(.print-mode) {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .word-card:focus-visible {
    outline: 2px solid var(--theme-accent, #6366f1);
    outline-offset: 2px;
  }

  .card-image {
    width: 100%;
    height: auto;
    display: block;
  }

  /* Fallback - dark mode */
  .card-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-md);
    min-height: 80px;
    aspect-ratio: 2 / 1; /* Approximate sequence aspect ratio */
  }

  .fallback-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 50%;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.3));
    font-size: 0.9rem;
  }

  .fallback-name {
    font-size: var(--font-size-sm, 14px);
    font-weight: 500;
    color: var(--theme-text, #ffffff);
    text-align: center;
  }

  .fallback-beats {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  /* Print mode fallback - simple black text for print */
  .print-mode .fallback-icon {
    background: transparent;
    color: #666666;
  }

  .print-mode .fallback-name {
    color: #000000;
  }

  .print-mode .fallback-beats {
    color: #666666;
  }

  @media (prefers-reduced-motion: reduce) {
    .word-card {
      transition: none;
    }
  }
</style>
