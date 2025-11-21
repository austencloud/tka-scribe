<!--
FilterChips.svelte

Displays active filters as dismissible chips.
Modern, clean UI pattern used by Airbnb, Zillow, and modern e-commerce.
Shows visual feedback of active filters with easy removal.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { ExploreFilterValue } from "../../../shared/domain";

  const {
    currentFilter = { type: "all", value: null },
    onRemoveFilter = () => {},
  } = $props<{
    currentFilter?: { type: string; value: ExploreFilterValue },
    onRemoveFilter?: () => void
  }>();

  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Check if filter is active (not "all")
  const hasActiveFilter = $derived(currentFilter.type !== "all");

  // Format filter label for display
  const filterLabel = $derived.by((): string => {
    if (!hasActiveFilter) return "";

    const { type, value } = currentFilter;

    switch (type) {
      case "favorites":
        return "Favorites";
      case "recent":
        return "Recent";
      case "difficulty":
        return `Level ${value}`;
      case "startingPosition":
        return `Position: ${value}`;
      case "startingLetter":
        return `Starts: ${value}`;
      case "containsLetters":
        if (Array.isArray(value)) {
          return `Contains: ${value.join(", ")}`;
        }
        return `Contains: ${value}`;
      case "length":
        return `${value} beats`;
      case "gridMode":
        return `${value} mode`;
      default:
        return `${type}: ${value}`;
    }
  });

  // Get chip color based on filter type
  const chipColor = $derived.by((): string => {
    const { type } = currentFilter;

    switch (type) {
      case "favorites":
        return "#ec4899"; // Pink
      case "recent":
        return "#06b6d4"; // Cyan
      case "difficulty":
        const level = currentFilter.value as number;
        if (level === 1) return "#10b981"; // Green
        if (level === 2) return "#f59e0b"; // Amber
        if (level === 3) return "#ef4444"; // Red
        return "#8b5cf6"; // Purple
      case "startingPosition":
        return "#8b5cf6"; // Purple
      case "startingLetter":
        return "#3b82f6"; // Blue
      case "containsLetters":
        return "#3b82f6"; // Blue
      case "length":
        return "#14b8a6"; // Teal
      case "gridMode":
        return "#f59e0b"; // Amber
      default:
        return "#8b5cf6"; // Purple
    }
  });

  function handleRemove() {
    hapticService?.trigger("selection");
    onRemoveFilter();
  }
</script>

{#if hasActiveFilter}
  <div
    class="filter-chip"
    style="--chip-color: {chipColor};"
    role="status"
    aria-live="polite"
  >
    <span class="chip-label">{filterLabel}</span>
    <button
      class="chip-remove"
      onclick={handleRemove}
      aria-label="Remove {filterLabel} filter"
      type="button"
    >
      <i class="fas fa-times"></i>
    </button>
  </div>
{/if}

<style>
  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px 7px 14px;
    background: color-mix(in srgb, var(--chip-color) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--chip-color) 30%, transparent);
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: -0.1px;
    white-space: nowrap;
    backdrop-filter: blur(12px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-8px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  .chip-label {
    font-size: 13px;
    line-height: 1;
  }

  .chip-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .chip-remove:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.1);
  }

  .chip-remove:active {
    transform: scale(0.95);
  }

  .chip-remove i {
    font-size: 10px;
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .filter-chip {
      padding: 6px 8px 6px 12px;
      font-size: 12px;
      gap: 6px;
    }

    .chip-label {
      font-size: 12px;
    }

    .chip-remove {
      width: 16px;
      height: 16px;
    }

    .chip-remove i {
      font-size: 9px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .filter-chip {
      animation: none;
      transition: none;
    }

    .chip-remove {
      transition: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .filter-chip {
      border-width: 2px;
      background: rgba(0, 0, 0, 0.8);
    }

    .chip-remove {
      background: rgba(255, 255, 255, 0.3);
      border: 1px solid white;
    }
  }
</style>
