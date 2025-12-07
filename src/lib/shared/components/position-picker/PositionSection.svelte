<!--
PositionSection.svelte - Collapsible section for selecting a position (start or end)
Uses 4x4 pictograph grid with all 16 variations
50px touch targets, modern Material 2026 design
-->
<script lang="ts">
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import PositionPickerGrid from "./PositionPickerGrid.svelte";

  let { title, description, currentPosition, onPositionChange } = $props<{
    title: string;
    description: string;
    currentPosition: PictographData | null;
    onPositionChange: (position: PictographData | null) => void;
  }>();

  let isExpanded = $state(false);

  function toggleExpanded() {
    isExpanded = !isExpanded;
  }

  // Get display value from the current position
  const displayValue = $derived.by(() => {
    if (!currentPosition) return "Any";
    // Show the start position name (e.g., "Alpha1", "Beta3", "Gamma11")
    return currentPosition.startPosition || currentPosition.letter || "?";
  });

  const hasSelection = $derived(currentPosition !== null);
</script>

<section class="position-section">
  <button
    class="section-header"
    onclick={toggleExpanded}
    aria-expanded={isExpanded}
    type="button"
  >
    <div class="header-content">
      <h3 class="section-title">{title}</h3>
      <p class="section-description">{description}</p>
    </div>
    <div class="header-value">
      {#if hasSelection}
        <span class="value-badge">{displayValue}</span>
      {:else}
        <span class="value-any">Any</span>
      {/if}
      <svg
        class="chevron"
        class:expanded={isExpanded}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  </button>

  {#if isExpanded}
    <div class="section-content">
      <PositionPickerGrid {currentPosition} {onPositionChange} />
    </div>
  {/if}
</section>

<style>
  .position-section {
    background: rgba(255, 255, 255, 0.08);
  }

  .section-header {
    width: 100%;
    min-height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    transition: background 0.2s ease;
    text-align: left;
  }

  .section-header:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .section-header:active {
    background: rgba(255, 255, 255, 0.1);
  }

  .header-content {
    flex: 1;
    min-width: 0;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: white;
  }

  .section-description {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  .header-value {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .value-badge {
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
  }

  .value-any {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  .chevron {
    width: 24px;
    height: 24px;
    transition: transform 0.2s ease;
  }

  .chevron.expanded {
    transform: rotate(180deg);
  }

  .section-content {
    padding: 0 24px 20px;
  }

  /* Mobile responsiveness */
  @media (max-width: 380px) {
    .section-header {
      padding: 14px 20px;
    }

    .section-content {
      padding: 0 20px 16px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .chevron {
      transition: none;
    }
  }
</style>
