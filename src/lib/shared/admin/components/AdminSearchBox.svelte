<script lang="ts">
  /**
   * AdminSearchBox
   * Reusable search input with icon and clear button
   */

  interface AdminSearchBoxProps {
    value: string;
    placeholder?: string;
    icon?: string;
    disabled?: boolean;
    class?: string;
    oninput?: (e: Event) => void;
    onclear?: () => void;
  }

  let {
    value = $bindable(""),
    placeholder = "Search...",
    icon = "fa-search",
    disabled = false,
    class: className = "",
    oninput,
    onclear,
  }: AdminSearchBoxProps = $props();

  function handleClear() {
    value = "";
    onclear?.();
  }
</script>

<div class="admin-search-box {className}">
  <i class="fas {icon} search-icon"></i>
  <input
    type="text"
    bind:value
    {placeholder}
    {disabled}
    {oninput}
    class="search-input"
  />
  {#if value}
    <button class="clear-btn" onclick={handleClear} aria-label="Clear search">
      <i class="fas fa-times"></i>
    </button>
  {/if}
</div>

<style>
  .admin-search-box {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 10px 12px;
    transition: all 0.2s;
    min-height: 56px; /* Touch target */
    box-sizing: border-box;
  }

  @media (min-width: 480px) {
    .admin-search-box {
      gap: 12px;
      border-radius: 8px;
    }
  }

  .admin-search-box:focus-within {
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .search-icon {
    color: rgba(255, 255, 255, 0.4);
    font-size: 14px;
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: white;
    font-size: 16px; /* Prevent zoom on iOS */
    min-width: 0;
  }

  @media (min-width: 480px) {
    .search-input {
      font-size: 14px;
    }
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .clear-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;
    border-radius: 6px;
    min-width: 56px;
    min-height: 56px;
  }

  @media (hover: hover) {
    .clear-btn:hover {
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.15);
    }
  }

  .clear-btn:active {
    transform: scale(0.95);
  }
</style>
