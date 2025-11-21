<!--
View Presets Sheet - Mobile Bottom Sheet Version

Modern, touch-friendly interface for selecting view presets
-->
<script lang="ts">
  import type { FilterPreset } from "../../../shared/domain/types/explore-types";

  let { currentFilter, onFilterChange } = $props<{
    currentFilter: FilterPreset,
    onFilterChange: (value: FilterPreset) => void
  }>();

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
        onclick={() => onFilterChange(preset.id)}
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
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .preset-option:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .preset-option.active {
    background: rgba(103, 126, 234, 0.15);
    border-color: rgba(103, 126, 234, 0.4);
  }

  .preset-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    font-size: 20px;
    color: rgba(255, 255, 255, 0.8);
    flex-shrink: 0;
  }

  .preset-option.active .preset-icon {
    background: rgba(103, 126, 234, 0.3);
    color: #667eea;
  }

  .preset-content {
    flex: 1;
    min-width: 0;
  }

  .preset-label {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 4px;
  }

  .preset-description {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.4;
  }

  .check-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: #667eea;
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
