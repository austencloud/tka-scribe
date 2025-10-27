<!--
  BackgroundCategorySelector.svelte - Filter chips for background category selection

  Material Design 3 filter chips pattern for selecting between Animated and Simple backgrounds.
  Mobile-first, touch-friendly, with haptic feedback.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";

  const { selectedCategory, onCategorySelect } = $props<{
    selectedCategory: "animated" | "simple";
    onCategorySelect: (category: "animated" | "simple") => void;
  }>();

  // Services
  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  function handleCategorySelect(category: "animated" | "simple") {
    if (category !== selectedCategory) {
      hapticService?.trigger("selection");
      onCategorySelect(category);
    }
  }
</script>

<div class="category-selector">
  <div class="chip-container">
    <button
      class="filter-chip"
      class:selected={selectedCategory === "animated"}
      onclick={() => handleCategorySelect("animated")}
      aria-pressed={selectedCategory === "animated"}
      aria-label="Select animated backgrounds"
    >
      <span class="chip-icon">🎬</span>
      <span class="chip-label">Animated</span>
      {#if selectedCategory === "animated"}
        <span class="chip-checkmark">✓</span>
      {/if}
    </button>

    <button
      class="filter-chip"
      class:selected={selectedCategory === "simple"}
      onclick={() => handleCategorySelect("simple")}
      aria-pressed={selectedCategory === "simple"}
      aria-label="Select simple backgrounds"
    >
      <span class="chip-icon">🎨</span>
      <span class="chip-label">Simple</span>
      {#if selectedCategory === "simple"}
        <span class="chip-checkmark">✓</span>
      {/if}
    </button>
  </div>
</div>

<style>
  .category-selector {
    width: 100%;
    padding: clamp(12px, 2cqh, 20px) clamp(16px, 3cqw, 24px);
    display: flex;
    justify-content: center;
    container-type: inline-size;
    container-name: category-selector;
  }

  .chip-container {
    display: flex;
    gap: clamp(8px, 1.5cqw, 12px);
    flex-wrap: wrap;
    justify-content: center;
  }

  .filter-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 8px;
    border: 1.5px solid rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.06);
    color: #ffffff;
    font-size: clamp(14px, 1.5cqw, 16px);
    font-weight: 500;
    line-height: 1.5;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    min-height: 44px; /* Touch target size */
    min-width: 120px;
  }

  .filter-chip:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(99, 102, 241, 0.6);
  }

  .filter-chip:active {
    background: rgba(255, 255, 255, 0.16);
    transform: scale(0.98);
  }

  .filter-chip.selected {
    background: rgba(99, 102, 241, 0.2);
    border-color: #6366f1;
    color: #ffffff;
    font-weight: 600;
  }

  .filter-chip.selected:hover {
    background: rgba(99, 102, 241, 0.3);
  }

  .chip-icon {
    font-size: 18px;
    line-height: 1;
  }

  .chip-label {
    font-size: 14px;
    font-weight: inherit;
  }

  .chip-checkmark {
    font-size: 16px;
    color: var(--mio-theme-color-primary, #6442d6);
    font-weight: bold;
  }

  /* Focus styles for accessibility */
  .filter-chip:focus-visible {
    outline: 2px solid var(--mio-theme-color-primary, #6442d6);
    outline-offset: 2px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .filter-chip {
      transition: none;
    }

    .filter-chip:active {
      transform: none;
    }
  }

  /* Container query for smaller spaces */
  @container category-selector (max-width: 300px) {
    .chip-container {
      flex-direction: column;
      width: 100%;
    }

    .filter-chip {
      width: 100%;
      justify-content: center;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .filter-chip {
      border-width: 2px;
    }

    .filter-chip.selected {
      border-width: 3px;
    }
  }
</style>
