<!--
View Presets Sheet - Mobile Bottom Sheet Version

Modern, touch-friendly interface for selecting view presets
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import type { FilterPreset } from "$lib/features/discover/shared/domain/types/discover-types";

  let { currentFilter, onFilterChange } = $props<{
    currentFilter: FilterPreset;
    onFilterChange: (preset: FilterPreset) => void;
  }>();

  let hapticService: IHapticFeedback | undefined;

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  });

  function handlePresetChange(preset: FilterPreset) {
    hapticService?.trigger("selection");
    onFilterChange(preset);
  }

  const presets: Array<{
    id: FilterPreset;
    label: string;
    icon: string;
    description: string;
  }> = [
    {
      id: "all",
      label: "All Sequences",
      icon: "fa-layer-group",
      description: "Browse the entire gallery",
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: "fa-heart",
      description: "Your favorited sequences",
    },
    {
      id: "easy",
      label: "Easy",
      icon: "fa-smile",
      description: "Simple patterns, great for beginners",
    },
    {
      id: "medium",
      label: "Medium",
      icon: "fa-meh",
      description: "Moderate complexity",
    },
    {
      id: "hard",
      label: "Hard",
      icon: "fa-fire",
      description: "Advanced patterns",
    },
    {
      id: "recent",
      label: "Recently Added",
      icon: "fa-clock",
      description: "Latest additions to the gallery",
    },
  ];
</script>

<div class="view-presets-sheet">
  <div class="presets-list">
    {#each presets as preset}
      <button
        class="preset-option"
        class:active={currentFilter === preset.id}
        onclick={() => handlePresetChange(preset.id)}
        type="button"
      >
        <div class="preset-icon">
          <i class="fas {preset.icon}"></i>
        </div>
        <div class="preset-content">
          <div class="preset-label">{preset.label}</div>
          <div class="preset-description">{preset.description}</div>
        </div>
        {#if currentFilter === preset.id}
          <div class="check-icon">
            <i class="fas fa-check"></i>
          </div>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .view-presets-sheet {
    padding: 8px 0;
  }

  .presets-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .preset-option {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .preset-option:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
  }

  .preset-option.active {
    background: color-mix(
      in srgb,
      var(--theme-accent, #667eea) 15%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #667eea) 40%,
      transparent
    );
  }

  .preset-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    background: color-mix(in srgb, var(--theme-text, white) 10%, transparent);
    border-radius: 12px;
    font-size: 20px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.8));
    flex-shrink: 0;
  }

  .preset-option.active .preset-icon {
    background: color-mix(
      in srgb,
      var(--theme-accent, #667eea) 30%,
      transparent
    );
    color: var(--theme-accent, #667eea);
  }

  .preset-content {
    flex: 1;
    min-width: 0;
  }

  .preset-label {
    font-size: 16px;
    font-weight: 600;
    color: color-mix(in srgb, var(--theme-text, white) 95%, transparent);
    margin-bottom: 4px;
  }

  .preset-description {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    line-height: 1.4;
  }

  .check-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: var(--theme-accent, #667eea);
    font-size: 16px;
    flex-shrink: 0;
  }

  /* Touch feedback */
  .preset-option:active {
    transform: scale(0.98);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .preset-option {
      transition: none;
    }
  }
</style>
