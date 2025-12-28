<script lang="ts">
  /**
   * RoleFilterButtons - Admin filter for user roles
   */

  import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
  import { ROLE_DISPLAY } from "$lib/shared/auth/domain/models/UserRole";

  type FilterValue = UserRole | "all";

  interface Props {
    value: FilterValue;
  }

  let { value = $bindable<FilterValue>("all") }: Props = $props();

  const filters: { value: FilterValue; label: string; icon?: string }[] = [
    { value: "all", label: "All" },
    { value: "admin", label: "Admins", icon: ROLE_DISPLAY.admin.icon },
    { value: "tester", label: "Testers", icon: ROLE_DISPLAY.tester.icon },
    { value: "premium", label: "Premium", icon: ROLE_DISPLAY.premium.icon },
  ];
</script>

<div class="role-filters">
  {#each filters as filter}
    <button
      class="filter-btn"
      class:active={value === filter.value}
      onclick={() => (value = filter.value)}
    >
      {#if filter.icon}
        <i class="fas {filter.icon}" aria-hidden="true"></i>
      {/if}
      {filter.label}
    </button>
  {/each}
</div>

<style>
  .role-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .filter-btn.active {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.4);
    color: #a78bfa;
  }

  .filter-btn i {
    font-size: 12px;
  }
</style>
