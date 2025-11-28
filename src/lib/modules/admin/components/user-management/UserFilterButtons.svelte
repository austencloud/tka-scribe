<script lang="ts">
  /**
   * UserFilterButtons
   * Filter buttons for user list
   */
  import type { UserFilterType } from "./types";

  interface Props {
    value: UserFilterType;
    onchange: (value: UserFilterType) => void;
  }

  let { value, onchange }: Props = $props();

  const filters: { key: UserFilterType; label: string; icon?: string }[] = [
    { key: "all", label: "All" },
    { key: "admins", label: "Admins", icon: "fa-shield-halved" },
    { key: "testers", label: "Testers", icon: "fa-flask" },
    { key: "premium", label: "Premium", icon: "fa-crown" },
    { key: "disabled", label: "Disabled", icon: "fa-ban" },
  ];
</script>

<div class="filter-buttons">
  {#each filters as filter}
    <button class:active={value === filter.key} onclick={() => onchange(filter.key)}>
      {#if filter.icon}
        <i class="fas {filter.icon}"></i>
      {/if}
      {filter.label}
    </button>
  {/each}
</div>

<style>
  .filter-buttons {
    display: flex;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px;
    border-radius: 8px;
  }

  .filter-buttons button {
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
  }

  .filter-buttons button:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  .filter-buttons button.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  @media (max-width: 768px) {
    .filter-buttons {
      overflow-x: auto;
      scrollbar-width: none;
    }

    .filter-buttons::-webkit-scrollbar {
      display: none;
    }
  }
</style>
