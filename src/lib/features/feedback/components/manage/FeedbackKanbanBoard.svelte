<!-- FeedbackKanbanBoard - Kanban board layout for feedback management -->
<script lang="ts">
  import type { FeedbackManageState } from "../../state/feedback-manage-state.svelte";
  import type { FeedbackItem, FeedbackStatus } from "../../domain/models/feedback-models";
  import { STATUS_CONFIG } from "../../domain/models/feedback-models";
  import FeedbackKanbanColumn from "./FeedbackKanbanColumn.svelte";

  const { manageState } = $props<{
    manageState: FeedbackManageState;
  }>();

  // Simplified to just 3 statuses
  const ALL_STATUSES: FeedbackStatus[] = [
    "new",
    "in-progress",
    "completed",
  ];

  // Mobile: track active status tab
  let activeStatus = $state<FeedbackStatus>("new");

  // Get active status color for background gradient
  const activeStatusColor = $derived(STATUS_CONFIG[activeStatus].color);

  // Group items by status (only 3 columns now)
  const itemsByStatus = $derived(() => {
    const grouped: Record<string, FeedbackItem[]> = {
      new: [],
      "in-progress": [],
      completed: [],
    };

    for (const item of manageState.items) {
      // Map old statuses to new simplified ones
      if (item.status === "new" || item.status === "acknowledged" || item.status === "planned") {
        grouped["new"]?.push(item);
      } else if (item.status === "in-progress") {
        grouped["in-progress"]?.push(item);
      } else if (item.status === "completed" || item.status === "wont-fix") {
        grouped["completed"]?.push(item);
      }
    }

    return grouped;
  });

  // Drag state
  let draggedItem = $state<FeedbackItem | null>(null);
  let dragOverColumn = $state<FeedbackStatus | null>(null);

  // Touch drag state
  let touchDragPosition = $state<{ x: number; y: number } | null>(null);

  function handleDragStart(item: FeedbackItem) {
    draggedItem = item;
  }

  function handleDragEnd() {
    // If this was a touch drag, check which column we're over
    if (touchDragPosition && draggedItem) {
      const targetColumn = getColumnAtPosition(touchDragPosition.x, touchDragPosition.y);
      if (targetColumn && targetColumn !== draggedItem.status) {
        handleDrop(targetColumn);
        return;
      }
    }
    draggedItem = null;
    dragOverColumn = null;
    touchDragPosition = null;
  }

  // Handle touch drag position updates
  function handleTouchDrag(item: FeedbackItem, x: number, y: number) {
    touchDragPosition = { x, y };
    const targetColumn = getColumnAtPosition(x, y);
    if (targetColumn && targetColumn !== item.status) {
      dragOverColumn = targetColumn;
    } else {
      dragOverColumn = null;
    }
  }

  // Get the status column at a given screen position
  function getColumnAtPosition(x: number, y: number): FeedbackStatus | null {
    const element = document.elementFromPoint(x, y);
    if (!element) return null;

    // Walk up the DOM to find the column
    let current: Element | null = element;
    while (current) {
      if (current.classList?.contains("kanban-column")) {
        // Find the status from data attribute or aria-label
        const ariaLabel = current.getAttribute("aria-label");
        if (ariaLabel) {
          // Extract status from aria-label like "New column"
          const statusLabel = ariaLabel.replace(" column", "").toLowerCase();
          const statusMap: Record<string, FeedbackStatus> = {
            "new": "new",
            "in progress": "in-progress",
            "completed": "completed",
          };
          return statusMap[statusLabel] || null;
        }
      }
      current = current.parentElement;
    }
    return null;
  }

  function handleDragOver(status: FeedbackStatus) {
    if (draggedItem && draggedItem.status !== status) {
      dragOverColumn = status;
    }
  }

  function handleDragLeave() {
    dragOverColumn = null;
  }

  async function handleDrop(status: FeedbackStatus) {
    if (draggedItem && draggedItem.status !== status) {
      try {
        await manageState.updateStatus(draggedItem.id, status);
      } catch {
        // Error is logged in state
      }
    }
    draggedItem = null;
    dragOverColumn = null;
  }

  function handleCardClick(item: FeedbackItem) {
    manageState.selectItem(item);
  }
</script>

<div class="kanban-board" style="--active-color: {activeStatusColor}">
  <!-- Mobile: Colorful Status Tabs -->
  <div class="status-tabs" role="tablist" aria-label="Feedback status">
    {#each ALL_STATUSES as status}
      {@const config = STATUS_CONFIG[status]}
      {@const count = itemsByStatus()[status]?.length ?? 0}
      <button
        type="button"
        role="tab"
        class="status-tab"
        class:active={activeStatus === status}
        style="--tab-color: {config.color}"
        onclick={() => {
          activeStatus = status;
        }}
        aria-selected={activeStatus === status}
        aria-controls="column-{status}"
      >
        <i class="fas {config.icon}"></i>
        <span class="tab-label">{config.label.replace("Won't Fix", "Declined")}</span>
        {#if count > 0}
          <span class="tab-count">{count}</span>
        {/if}
      </button>
    {/each}
  </div>

  <div class="columns-container">
    {#each ALL_STATUSES as status}
      <FeedbackKanbanColumn
        {status}
        config={STATUS_CONFIG[status]}
        items={itemsByStatus()[status] ?? []}
        isDropTarget={dragOverColumn === status}
        isDragActive={draggedItem !== null}
        isActiveTab={activeStatus === status}
        selectedItemId={manageState.selectedItem?.id ?? null}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTouchDrag={handleTouchDrag}
        onDragOver={() => handleDragOver(status)}
        onDragLeave={handleDragLeave}
        onDrop={() => handleDrop(status)}
        onCardClick={handleCardClick}
      />
    {/each}
  </div>

  {#if manageState.isLoading && manageState.items.length === 0}
    <div class="loading-overlay">
      <div class="loading-skeletons">
        {#each Array(3) as _}
          <div class="skeleton-card">
            <div class="skeleton-header">
              <div class="skeleton-icon"></div>
              <div class="skeleton-title"></div>
            </div>
            <div class="skeleton-body"></div>
            <div class="skeleton-footer">
              <div class="skeleton-meta"></div>
              <div class="skeleton-badge"></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .kanban-board {
    /* ===== FLUID SPACING - All clamp() based ===== */
    --kb-space-2xs: clamp(4px, 1cqi, 8px);
    --kb-space-xs: clamp(6px, 1.5cqi, 12px);
    --kb-space-sm: clamp(10px, 2.5cqi, 16px);
    --kb-space-md: clamp(14px, 3.5cqi, 24px);
    --kb-space-lg: clamp(20px, 5cqi, 32px);
    --kb-space-xl: clamp(28px, 7cqi, 48px);

    /* ===== FLUID TYPOGRAPHY - Accessible minimum sizes ===== */
    --kb-text-xs: clamp(0.8125rem, 2cqi, 0.875rem);   /* min 13px */
    --kb-text-sm: clamp(0.875rem, 2.5cqi, 1rem);      /* min 14px */
    --kb-text-base: clamp(1rem, 3cqi, 1.125rem);      /* min 16px */
    --kb-text-lg: clamp(1.125rem, 3.5cqi, 1.25rem);   /* min 18px */

    /* ===== FLUID RADII ===== */
    --kb-radius-sm: clamp(6px, 1.5cqi, 10px);
    --kb-radius-md: clamp(10px, 2.5cqi, 16px);
    --kb-radius-lg: clamp(14px, 3.5cqi, 20px);
    --kb-radius-full: 999px;

    /* ===== COLORS ===== */
    --kb-text: rgba(255, 255, 255, 0.95);
    --kb-text-muted: rgba(255, 255, 255, 0.7);
    --kb-text-subtle: rgba(255, 255, 255, 0.5);

    /* ===== TRANSITIONS ===== */
    --spring-smooth: cubic-bezier(0.4, 0, 0.2, 1);
    --spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    container-type: inline-size;
    container-name: kanban;

    /* Dynamic gradient background based on active status */
    background:
      radial-gradient(
        ellipse 80% 50% at 50% 0%,
        color-mix(in srgb, var(--active-color) 12%, transparent) 0%,
        transparent 70%
      ),
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--active-color) 5%, rgba(15, 15, 20, 1)) 0%,
        rgba(12, 12, 16, 1) 100%
      );
    transition: background 0.5s ease;
  }

  /* ===== STATUS TABS - Fills available space, pure fluid sizing ===== */
  .status-tabs {
    display: none; /* Shown via container query on mobile */
    gap: var(--kb-space-xs);
    padding: var(--kb-space-sm) var(--kb-space-md);
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .status-tabs::-webkit-scrollbar {
    display: none;
  }

  /* Each tab fills available space equally */
  .status-tab {
    display: flex;
    flex: 1;
    /* Stack vertically: icon on top, label below */
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(2px, 0.5cqi, 6px);
    /* Fluid height with 44px minimum for accessibility */
    min-height: clamp(52px, 14cqi, 64px);
    /* Tighter padding */
    padding: clamp(8px, 2cqi, 12px) clamp(6px, 1.5cqi, 12px);
    background: rgba(255, 255, 255, 0.06);
    border: none;
    border-radius: clamp(12px, 3cqi, 18px);
    color: var(--kb-text-muted);
    /* Fluid font with accessible minimum */
    font-size: var(--kb-text-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s var(--spring-smooth);
  }

  .status-tab i {
    /* Fluid icon size */
    font-size: clamp(1rem, 3cqi, 1.25rem);
    color: var(--tab-color);
    opacity: 0.8;
    flex-shrink: 0;
  }

  .status-tab:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--kb-text);
  }

  .status-tab:active {
    transform: scale(0.96);
  }

  /* Active tab - COLORFUL and prominent */
  .status-tab.active {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--tab-color) 85%, #fff) 0%,
      var(--tab-color) 100%
    );
    color: rgba(0, 0, 0, 0.9);
    box-shadow:
      0 4px 20px color-mix(in srgb, var(--tab-color) 40%, transparent),
      0 0 0 1px color-mix(in srgb, var(--tab-color) 50%, transparent);
  }

  .status-tab.active i {
    color: rgba(0, 0, 0, 0.8);
    opacity: 1;
  }

  /* Label shown below icon - always visible, fluid font size */
  .tab-label {
    font-size: clamp(0.6875rem, 2cqi, 0.8125rem);
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
    /* Truncate only if truly no space */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  /* Count badge with fluid sizing */
  .tab-count {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Fluid badge size */
    min-width: clamp(20px, 5cqi, 26px);
    height: clamp(20px, 5cqi, 26px);
    padding: 0 var(--kb-space-2xs);
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--kb-radius-full);
    font-size: var(--kb-text-xs);
    font-weight: 700;
    flex-shrink: 0;
  }

  .status-tab.active .tab-count {
    background: rgba(0, 0, 0, 0.25);
    color: rgba(0, 0, 0, 0.9);
  }

  /* ===== COLUMNS CONTAINER ===== */
  .columns-container {
    display: flex;
    gap: clamp(12px, 2cqi, 24px);
    flex: 1;
    /* Center with max-width for wide screens */
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    /* Generous padding that scales */
    padding: clamp(16px, 3cqi, 32px);
    overflow-x: auto;
    overflow-y: hidden;
  }

  .columns-container::-webkit-scrollbar {
    height: clamp(4px, 1cqi, 8px);
  }

  .columns-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .columns-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: var(--kb-radius-sm);
  }

  .columns-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  /* ===== LOADING SKELETON ===== */
  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--kb-space-xl);
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
  }

  .loading-skeletons {
    display: flex;
    flex-direction: column;
    gap: var(--kb-space-md);
    width: 100%;
    max-width: clamp(280px, 70cqi, 400px);
  }

  .skeleton-card {
    display: flex;
    flex-direction: column;
    gap: var(--kb-space-sm);
    padding: var(--kb-space-md);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--kb-radius-lg);
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  .skeleton-header {
    display: flex;
    align-items: center;
    gap: var(--kb-space-sm);
  }

  .skeleton-icon {
    width: clamp(28px, 7cqi, 36px);
    height: clamp(28px, 7cqi, 36px);
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--kb-radius-sm);
  }

  .skeleton-title {
    flex: 1;
    height: clamp(16px, 4cqi, 20px);
    background: rgba(255, 255, 255, 0.12);
    border-radius: var(--kb-radius-sm);
  }

  .skeleton-body {
    height: clamp(36px, 9cqi, 48px);
    background: rgba(255, 255, 255, 0.08);
    border-radius: var(--kb-radius-sm);
  }

  .skeleton-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: var(--kb-space-sm);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .skeleton-meta {
    width: clamp(80px, 20cqi, 120px);
    height: clamp(12px, 3cqi, 16px);
    background: rgba(255, 255, 255, 0.08);
    border-radius: var(--kb-radius-sm);
  }

  .skeleton-badge {
    width: clamp(24px, 6cqi, 32px);
    height: clamp(24px, 6cqi, 32px);
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--kb-radius-sm);
  }

  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* ===== CONTAINER QUERY: Mobile layout (shows tabs) ===== */
  @container kanban (max-width: 650px) {
    .status-tabs {
      display: flex;
    }

    .columns-container {
      overflow-x: hidden;
      overflow-y: auto;
    }
  }

  /* ===== REDUCED MOTION ===== */
  @media (prefers-reduced-motion: reduce) {
    .kanban-board,
    .status-tab,
    .skeleton-card {
      transition: none;
      animation: none;
    }
  }
</style>
