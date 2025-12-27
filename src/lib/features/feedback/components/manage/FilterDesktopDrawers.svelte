<!-- FilterDesktopDrawers - Side drawers for status/priority filters (desktop) -->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import type { FeedbackManageState } from "../../state/feedback-manage-state.svelte";
  import type { FilterBarUIState } from "../../state/filter-bar-ui-state.svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import {
    STATUS_CONFIG,
    PRIORITY_CONFIG,
  } from "../../domain/models/feedback-models";
  import type {
    FeedbackStatus,
    FeedbackPriority,
  } from "../../domain/models/feedback-models";
  import FilterOptionGrid from "./FilterOptionGrid.svelte";

  interface Props {
    manageState: FeedbackManageState;
    uiState: FilterBarUIState;
  }

  const { manageState, uiState }: Props = $props();

  let hapticService: IHapticFeedback | undefined;

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  });

  function handleStatusFilter(status: FeedbackStatus | "all") {
    hapticService?.trigger("selection");
    manageState.setFilter("status", status);
    uiState.closeStatusDrawer();
  }

  function handlePriorityFilter(priority: FeedbackPriority | "all") {
    hapticService?.trigger("selection");
    manageState.setFilter("priority", priority);
    uiState.closePriorityDrawer();
  }

  // Prepare filter options for grid components
  const statusOptions = [
    { value: "all", label: "All Status", icon: "", color: "#10b981" },
    ...Object.entries(STATUS_CONFIG).map(([value, config]) => ({
      value,
      label: config.label,
      icon: config.icon,
      color: config.color,
    })),
  ];

  const priorityOptions = [
    { value: "all", label: "All Priority", icon: "", color: "#10b981" },
    ...Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({
      value,
      label: config.label,
      icon: config.icon,
      color: config.color,
    })),
  ];
</script>

<!-- Status Filter Drawer (Right Side Panel) -->
<Drawer
  bind:isOpen={uiState.isStatusDrawerOpen}
  placement="right"
  showHandle={false}
  ariaLabel="Status filter"
  class="filter-drawer"
>
  <div class="drawer-panel">
    <header class="drawer-header">
      <h2 class="drawer-title">
        <i class="fas fa-tasks"></i>
        Filter by Status
      </h2>
      <button
        type="button"
        class="drawer-close"
        onclick={() => uiState.closeStatusDrawer()}
        aria-label="Close panel"
      >
        <i class="fas fa-times"></i>
      </button>
    </header>
    <div class="filter-drawer-content">
      <FilterOptionGrid
        options={statusOptions}
        selectedValue={manageState.filters.status}
        onSelect={(v) => handleStatusFilter(v as FeedbackStatus | "all")}
        showIcons={true}
        isVertical={true}
      />
    </div>
  </div>
</Drawer>

<!-- Priority Filter Drawer (Right Side Panel) -->
<Drawer
  bind:isOpen={uiState.isPriorityDrawerOpen}
  placement="right"
  showHandle={false}
  ariaLabel="Priority filter"
  class="filter-drawer"
>
  <div class="drawer-panel">
    <header class="drawer-header">
      <h2 class="drawer-title">
        <i class="fas fa-flag"></i>
        Filter by Priority
      </h2>
      <button
        type="button"
        class="drawer-close"
        onclick={() => uiState.closePriorityDrawer()}
        aria-label="Close panel"
      >
        <i class="fas fa-times"></i>
      </button>
    </header>
    <div class="filter-drawer-content">
      <FilterOptionGrid
        options={priorityOptions}
        selectedValue={manageState.filters.priority}
        onSelect={(v) => handlePriorityFilter(v as FeedbackPriority | "all")}
        showIcons={true}
        isVertical={true}
      />
    </div>
  </div>
</Drawer>

<style>
  .drawer-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(
      --theme-panel-bg,
      linear-gradient(180deg, #1e1e24 0%, #16161a 100%)
    );
  }

  .drawer-header {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 21px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .drawer-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .drawer-title i {
    color: var(--semantic-success, #10b981);
  }

  .drawer-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    margin-left: auto;
    margin-right: calc(-1 * 13px);
    background: none;
    border: none;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.15s ease;
  }

  .drawer-close:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .drawer-close:active {
    transform: scale(0.95);
  }

  .filter-drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 13px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
</style>
