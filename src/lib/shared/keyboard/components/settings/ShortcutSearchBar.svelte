<!--
  ShortcutSearchBar.svelte

  Search and filter bar for keyboard shortcuts settings.
  Includes search input and context filter chips with module colors.
-->
<script lang="ts">
  import type { ShortcutContext } from "../../domain/types/keyboard-types";

  let {
    query = $bindable(""),
    contextFilter = $bindable<ShortcutContext | "all">("all"),
    customizedCount = 0,
    onResetAll = () => {},
  }: {
    query?: string;
    contextFilter?: ShortcutContext | "all";
    customizedCount?: number;
    onResetAll?: () => void;
  } = $props();

  // Available context filters with module colors
  // Colors match MODULE_DEFINITIONS from navigation-state
  const contexts: Array<{
    id: ShortcutContext | "all";
    label: string;
    icon: string;
    color: string;
  }> = [
    { id: "all", label: "All", icon: "fa-layer-group", color: "#8b5cf6" },
    { id: "global", label: "Global", icon: "fa-globe", color: "#6366f1" },
    { id: "create", label: "Create", icon: "fa-tools", color: "#f59e0b" },
    { id: "compose", label: "Compose", icon: "fa-layer-group", color: "#ec4899" },
    { id: "discover", label: "Discover", icon: "fa-compass", color: "#a855f7" },
    { id: "edit-panel", label: "Edit", icon: "fa-pen", color: "#10b981" },
    { id: "animation-panel", label: "Animation", icon: "fa-film", color: "#3b82f6" },
  ];

  function clearSearch() {
    query = "";
  }
</script>

<div class="search-bar">
  <!-- Search Input -->
  <div class="search-input-wrapper">
    <i class="fas fa-search search-icon"></i>
    <input
      type="text"
      class="search-input"
      placeholder="Search shortcuts..."
      bind:value={query}
    />
    {#if query}
      <button class="clear-btn" onclick={clearSearch} type="button" aria-label="Clear search">
        <i class="fas fa-times"></i>
      </button>
    {/if}
  </div>

  <!-- Context Chips -->
  <div class="context-chips">
    {#each contexts as ctx}
      <button
        class="context-chip"
        class:active={contextFilter === ctx.id}
        style="--chip-color: {ctx.color}"
        onclick={() => (contextFilter = ctx.id)}
        type="button"
        aria-pressed={contextFilter === ctx.id}
      >
        <i class="fas {ctx.icon} chip-icon"></i>
        <span>{ctx.label}</span>
      </button>
    {/each}
  </div>

  <!-- Reset Button (shown when there are custom bindings) -->
  {#if customizedCount > 0}
    <button class="reset-all-btn" onclick={onResetAll} type="button">
      <i class="fas fa-undo"></i>
      Reset All ({customizedCount})
    </button>
  {/if}
</div>

<style>
  .search-bar {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    background: linear-gradient(
      180deg,
      rgba(139, 92, 246, 0.04) 0%,
      var(--theme-card-bg, rgba(255, 255, 255, 0.02)) 100%
    );
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(16px);
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 16px;
    color: rgba(139, 92, 246, 0.6);
    font-size: 14px;
    pointer-events: none;
    transition: color 0.2s ease;
  }

  .search-input-wrapper:focus-within .search-icon {
    color: rgba(139, 92, 246, 1);
  }

  .search-input {
    width: 100%;
    padding: 14px 44px 14px 44px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 14px;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    font-size: 14px;
    font-weight: 500;
    outline: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .search-input::placeholder {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.35));
    font-weight: 400;
  }

  .search-input:focus {
    background: rgba(139, 92, 246, 0.08);
    border-color: rgba(139, 92, 246, 0.4);
    box-shadow:
      0 0 0 3px rgba(139, 92, 246, 0.12),
      0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .clear-btn {
    position: absolute;
    right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .clear-btn:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: rgba(248, 113, 113, 1);
  }

  .clear-btn:active {
    transform: scale(0.95);
  }

  .context-chips {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding: 4px 0;
  }

  .context-chips::-webkit-scrollbar {
    display: none;
  }

  .context-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .context-chip .chip-icon {
    font-size: 11px;
    color: var(--chip-color, var(--theme-text-dim, rgba(255, 255, 255, 0.4)));
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  .context-chip:hover {
    background: color-mix(in srgb, var(--chip-color) 10%, transparent);
    border-color: color-mix(in srgb, var(--chip-color) 30%, transparent);
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    transform: translateY(-1px);
  }

  .context-chip:hover .chip-icon {
    opacity: 1;
  }

  .context-chip:active {
    transform: translateY(0) scale(0.97);
  }

  .context-chip.active {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--chip-color) 25%, transparent) 0%,
      color-mix(in srgb, var(--chip-color) 18%, transparent) 100%
    );
    border-color: color-mix(in srgb, var(--chip-color) 50%, transparent);
    color: white;
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--chip-color) 20%, transparent),
      0 4px 12px color-mix(in srgb, var(--chip-color) 25%, transparent);
  }

  .context-chip.active .chip-icon {
    color: white;
    opacity: 1;
    filter: drop-shadow(0 0 6px var(--chip-color));
  }

  .reset-all-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 18px;
    background: rgba(239, 68, 68, 0.08);
    border: 1.5px solid rgba(239, 68, 68, 0.25);
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    color: rgba(248, 113, 113, 0.9);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .reset-all-btn:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.4);
    color: rgba(248, 113, 113, 1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  }

  .reset-all-btn:active {
    transform: translateY(0) scale(0.98);
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .search-bar {
      padding: 12px;
      gap: 12px;
    }

    .search-input {
      padding: 12px 40px 12px 40px;
      font-size: 13px;
    }

    .context-chip {
      padding: 10px 12px;
      font-size: 11px;
      border-radius: 10px;
    }

    .context-chip .chip-icon {
      font-size: 10px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .search-input,
    .clear-btn,
    .context-chip,
    .reset-all-btn {
      transition: none;
    }

    .context-chip:hover,
    .context-chip:active,
    .reset-all-btn:hover,
    .reset-all-btn:active {
      transform: none;
    }
  }

  /* Focus visible states */
  .search-input:focus-visible {
    outline: 2px solid rgba(139, 92, 246, 0.5);
    outline-offset: 2px;
  }

  .context-chip:focus-visible,
  .reset-all-btn:focus-visible,
  .clear-btn:focus-visible {
    outline: 2px solid rgba(139, 92, 246, 0.5);
    outline-offset: 2px;
  }
</style>
