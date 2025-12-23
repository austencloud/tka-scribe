<script lang="ts">
  /**
   * UserSearch - Shared search component for user lists
   * Simple wrapper around PanelSearch with user-specific defaults
   */

  interface Props {
    value: string;
    placeholder?: string;
    maxWidth?: string;
    oninput?: (value: string) => void;
  }

  let {
    value = $bindable(""),
    placeholder = "Search users...",
    maxWidth,
    oninput,
  }: Props = $props();
</script>

<div class="user-search">
  <i class="fas fa-search user-search__icon" aria-hidden="true"></i>
  <input
    type="text"
    class="user-search__input"
    {placeholder}
    {value}
    style:max-width={maxWidth}
    oninput={(e) => {
      value = e.currentTarget.value;
      oninput?.(value);
    }}
  />
</div>

<style>
  .user-search {
    position: relative;
    width: 100%;
  }

  .user-search__icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
    pointer-events: none;
  }

  .user-search__input {
    width: 100%;
    padding: 10px 12px 10px 36px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .user-search__input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .user-search__input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
</style>
