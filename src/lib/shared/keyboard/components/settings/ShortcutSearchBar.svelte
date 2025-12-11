<!--
  ShortcutSearchBar.svelte

  Search and filter bar for keyboard shortcuts settings.
  Includes search input and context filter chips.
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

  // Available context filters
  const contexts: Array<{ id: ShortcutContext | "all"; label: string }> = [
    { id: "all", label: "All" },
    { id: "global", label: "Global" },
    { id: "create", label: "Create" },
    { id: "compose", label: "Compose" },
    { id: "discover", label: "Discover" },
    { id: "edit-panel", label: "Edit" },
    { id: "animation-panel", label: "Animation" },
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
      <button class="clear-btn" onclick={clearSearch} type="button">
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
        onclick={() => (contextFilter = ctx.id)}
        type="button"
      >
        {ctx.label}
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
    gap: 12px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(12px);
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 14px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 14px;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 12px 40px 12px 42px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 15px;
    outline: none;
    transition: all 200ms ease;
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .search-input:focus {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  .clear-btn {
    position: absolute;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .clear-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
  }

  .context-chips {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding: 2px 0;
  }

  .context-chips::-webkit-scrollbar {
    display: none;
  }

  .context-chip {
    padding: 6px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .context-chip:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
  }

  .context-chip.active {
    background: rgba(99, 102, 241, 0.9);
    border-color: transparent;
    color: white;
  }

  .reset-all-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: rgba(248, 113, 113, 1);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .reset-all-btn:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.4);
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .search-bar {
      padding: 12px;
    }

    .context-chip {
      padding: 8px 12px;
      font-size: 12px;
    }
  }
</style>
