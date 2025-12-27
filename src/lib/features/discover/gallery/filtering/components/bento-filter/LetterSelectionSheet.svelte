<!--
LetterSelectionSheet.svelte - Sheet content for selecting a letter filter
Displays A-Z grid with clear option
-->
<script lang="ts">
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  let {
    currentLetter = null,
    onLetterSelect,
    onClear,
  } = $props<{
    currentLetter: string | null;
    onLetterSelect: (letter: string) => void;
    onClear: () => void;
  }>();

  let hapticService: IHapticFeedback | null = null;

  onMount(() => {
    hapticService = tryResolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  });

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  function handleLetterClick(letter: string) {
    hapticService?.trigger("selection");
    onLetterSelect(letter);
  }

  function handleClear() {
    hapticService?.trigger("selection");
    onClear();
  }
</script>

<div class="letter-selection-sheet">
  <div class="sheet-header">
    <h3 class="sheet-title">Select Letter</h3>
    {#if currentLetter}
      <button class="clear-btn" onclick={handleClear}> Clear </button>
    {/if}
  </div>

  <div class="letter-grid">
    {#each letters as letter}
      <button
        class="letter-btn"
        class:selected={currentLetter === letter}
        onclick={() => handleLetterClick(letter)}
        aria-label="Filter by letter {letter}"
        aria-pressed={currentLetter === letter}
      >
        {letter}
      </button>
    {/each}
  </div>
</div>

<style>
  .letter-selection-sheet {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px 0;
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
  }

  .sheet-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .clear-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .clear-btn:active {
    transform: scale(0.97);
  }

  .letter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: 8px;
  }

  .letter-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--min-touch-target);
    min-width: var(--min-touch-target);
    padding: 0;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid transparent;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .letter-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .letter-btn.selected {
    background: #10b981;
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .letter-btn:active {
    transform: scale(0.95);
  }

  @media (prefers-reduced-motion: reduce) {
    .letter-btn,
    .clear-btn {
      transition: none;
    }
  }
</style>
