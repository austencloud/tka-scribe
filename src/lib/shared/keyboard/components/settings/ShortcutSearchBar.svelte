<!--
  ShortcutSearchBar.svelte

  Search bar for keyboard shortcuts settings.
-->
<script lang="ts">
  let {
    query = $bindable(""),
    customizedCount = 0,
    onResetAll = () => {},
  }: {
    query?: string;
    customizedCount?: number;
    onResetAll?: () => void;
  } = $props();

  function clearSearch() {
    query = "";
  }
</script>

<div class="search-bar">
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

  {#if customizedCount > 0}
    <button class="reset-all-btn" onclick={onResetAll} type="button">
      <i class="fas fa-undo"></i>
      <span>Reset ({customizedCount})</span>
    </button>
  {/if}
</div>

<style>
  .search-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    margin-bottom: 12px;
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
  }

  .search-icon {
    position: absolute;
    left: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    font-size: 14px;
    pointer-events: none;
    transition: color 0.15s ease;
  }

  .search-input-wrapper:focus-within .search-icon {
    color: var(--theme-accent-strong, #8b5cf6);
  }

  .search-input {
    width: 100%;
    height: 44px;
    padding: 10px 44px 10px 40px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    font-size: 14px;
    font-weight: 500;
    outline: none;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .search-input::placeholder {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.35));
    font-weight: 400;
  }

  .search-input:focus {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.06));
    border-color: var(--theme-accent-strong, #8b5cf6);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 20%, transparent);
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
    background: color-mix(in srgb, var(--semantic-error, #ef4444) 15%, transparent);
    border-color: color-mix(in srgb, var(--semantic-error, #ef4444) 30%, transparent);
    color: var(--semantic-error, #f87171);
  }

  .clear-btn:active {
    transform: scale(0.95);
  }

  .reset-all-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 14px;
    min-height: 44px;
    background: color-mix(in srgb, var(--semantic-error, #ef4444) 8%, rgba(255, 255, 255, 0.06));
    border: 1px solid color-mix(in srgb, var(--semantic-error, #ef4444) 20%, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    color: color-mix(in srgb, var(--semantic-error, #ef4444) 80%, white);
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .reset-all-btn i {
    font-size: 11px;
    opacity: 0.8;
  }

  .reset-all-btn:hover {
    background: color-mix(in srgb, var(--semantic-error, #ef4444) 15%, rgba(255, 255, 255, 0.08));
    border-color: color-mix(in srgb, var(--semantic-error, #ef4444) 40%, transparent);
    color: var(--semantic-error, #f87171);
    transform: translateY(-1px);
  }

  .reset-all-btn:hover i {
    opacity: 1;
  }

  .reset-all-btn:active {
    transform: translateY(0) scale(0.97);
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .search-bar {
      padding: 10px 12px;
    }

    .search-input {
      font-size: 13px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .search-input,
    .clear-btn,
    .reset-all-btn {
      transition: none;
    }

    .reset-all-btn:hover,
    .reset-all-btn:active {
      transform: none;
    }
  }

  /* Focus visible states */
  .search-input:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 50%, transparent);
    outline-offset: 2px;
  }

  .reset-all-btn:focus-visible,
  .clear-btn:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 50%, transparent);
    outline-offset: 2px;
  }
</style>
