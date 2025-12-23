<script lang="ts">
  /**
   * AdminListItem
   * Selectable list item with flexible slots
   */

  interface AdminListItemProps {
    selected?: boolean;
    disabled?: boolean;
    onClick: () => void;
    variant?: "default" | "compact" | "detailed";
    class?: string;
    children: any;
    icon?: any;
    meta?: any;
  }

  let {
    selected = false,
    disabled = false,
    onClick,
    variant = "default",
    class: className = "",
    children,
    icon,
    meta,
  }: AdminListItemProps = $props();
</script>

<button
  class="admin-list-item variant-{variant} {className}"
  class:selected
  class:disabled
  onclick={onClick}
  {disabled}
>
  {#if icon}
    <div class="item-icon">
      {@render icon()}
    </div>
  {/if}

  <div class="item-content">
    {@render children()}
  </div>

  {#if meta}
    <div class="item-meta">
      {@render meta()}
    </div>
  {/if}
</button>

<style>
  .admin-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
    color: inherit;
    font: inherit;
  }

  .admin-list-item:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .admin-list-item.selected {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .admin-list-item.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .item-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.6);
  }

  .item-content {
    flex: 1;
    min-width: 0;
  }

  .item-meta {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Compact variant */
  .variant-compact {
    padding: 8px 12px;
    gap: 8px;
  }

  /* Detailed variant */
  .variant-detailed {
    padding: 16px;
    align-items: flex-start;
  }
</style>
