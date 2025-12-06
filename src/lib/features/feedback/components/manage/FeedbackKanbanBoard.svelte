<!-- FeedbackKanbanBoard - Kanban board layout for feedback management -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { FeedbackManageState } from "../../state/feedback-manage-state.svelte";
  import type {
    FeedbackItem,
    FeedbackStatus,
  } from "../../domain/models/feedback-models";
  import { STATUS_CONFIG } from "../../domain/models/feedback-models";
  import FeedbackKanbanColumn from "./FeedbackKanbanColumn.svelte";

  const { manageState } = $props<{
    manageState: FeedbackManageState;
  }>();

  // 4 Kanban columns + archived drop zone
  const KANBAN_STATUSES: FeedbackStatus[] = [
    "new",
    "in-progress",
    "in-review",
    "completed",
  ];

  const ARCHIVE_STATUS: FeedbackStatus = "archived";

  // Mobile: track active status tab
  let activeStatus = $state<FeedbackStatus>("new");

  // Get active status color for background gradient
  const activeStatusColor = $derived(STATUS_CONFIG[activeStatus].color);

  // Group items by status (4 columns)
  // Uses allItems (unfiltered) to show all feedback in their respective status columns
  const itemsByStatus = $derived.by(() => {
    const grouped: Record<string, FeedbackItem[]> = {
      new: [],
      "in-progress": [],
      "in-review": [],
      completed: [],
    };

    // Use allItems for kanban - we always want to show items in their status columns
    for (const item of manageState.allItems) {
      // Filter out soft-deleted items
      if (item.isDeleted) continue;

      // Filter out archived items - they don't appear in Kanban
      if (item.status === "archived") continue;

      // Map to the 4 statuses
      if (grouped[item.status]) {
        grouped[item.status]?.push(item);
      }
      // Note: No fallback - unknown statuses are ignored
    }

    return grouped;
  });

  // Deferred items (archived items with deferredUntil timestamp)
  const deferredItems = $derived.by(() => {
    return manageState.allItems.filter(
      (item: FeedbackItem) =>
        item.status === "archived" && item.deferredUntil && !item.isDeleted
    );
  });

  // Defer dialog state
  let showDeferDialog = $state(false);
  let itemToDefer = $state<FeedbackItem | null>(null);

  // Mobile view detection (matches container query breakpoint)
  // When in mobile view (< 652px), we show tabs instead of columns, so drag-drop should be disabled
  let isMobileView = $state(false);
  let resizeObserver: ResizeObserver | null = null;

  // Drag state
  let draggedItem = $state<FeedbackItem | null>(null);
  let dragOverColumn = $state<FeedbackStatus | "deferred" | null>(null);

  // Touch drag state
  let touchDragPosition = $state<{ x: number; y: number } | null>(null);

  function handleDragStart(item: FeedbackItem) {
    draggedItem = item;
  }

  function handleDragEnd() {
    // If this was a touch drag, check which column we're over
    if (touchDragPosition && draggedItem) {
      const targetColumn = getColumnAtPosition(
        touchDragPosition.x,
        touchDragPosition.y
      );
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
  function getColumnAtPosition(
    x: number,
    y: number
  ): FeedbackStatus | "deferred" | null {
    const element = document.elementFromPoint(x, y);
    if (!element) return null;

    // Walk up the DOM to find the column or drop zones
    let current: Element | null = element;
    while (current) {
      // Check for defer drop zone
      if (current.classList?.contains("defer-drop-zone")) {
        return "deferred";
      }

      // Check for archive drop zone
      if (current.classList?.contains("archive-drop-zone")) {
        return ARCHIVE_STATUS;
      }

      if (current.classList?.contains("kanban-column")) {
        // Find the status from data attribute or aria-label
        const ariaLabel = current.getAttribute("aria-label");
        if (ariaLabel) {
          // Extract status from aria-label like "New column"
          const statusLabel = ariaLabel.replace(" column", "").toLowerCase();
          const statusMap: Record<string, FeedbackStatus> = {
            new: "new",
            "in progress": "in-progress",
            "in review": "in-review",
            completed: "completed",
          };
          return statusMap[statusLabel] || null;
        }
      }
      current = current.parentElement;
    }
    return null;
  }

  function handleDragOver(status: FeedbackStatus | "deferred") {
    if (draggedItem) {
      // For deferred, always allow hover (we'll show the dialog)
      if (status === "deferred" || draggedItem.status !== status) {
        dragOverColumn = status;
      }
    }
  }

  function handleDragLeave() {
    dragOverColumn = null;
  }

  async function handleDrop(status: FeedbackStatus | "deferred") {
    if (!draggedItem) return;

    // Special handling for defer - show dialog instead of immediate update
    if (status === "deferred") {
      itemToDefer = draggedItem;
      showDeferDialog = true;
      draggedItem = null;
      dragOverColumn = null;
      return;
    }

    // Normal status update
    if (draggedItem.status !== status) {
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

  // Defer dialog handlers
  let deferDate = $state("");
  let deferNotes = $state("");
  let isSubmittingDefer = $state(false);

  async function handleDeferSubmit() {
    if (!itemToDefer || !deferDate) return;

    isSubmittingDefer = true;

    try {
      // Call the feedback service to defer the item
      await manageState.deferFeedback(itemToDefer.id, deferDate, deferNotes);

      // Close dialog and reset state
      showDeferDialog = false;
      itemToDefer = null;
      deferDate = "";
      deferNotes = "";
    } catch (err) {
      console.error("Failed to defer feedback:", err);
      // Could show an error toast here
    } finally {
      isSubmittingDefer = false;
    }
  }

  function handleDeferCancel() {
    showDeferDialog = false;
    itemToDefer = null;
    deferDate = "";
    deferNotes = "";
  }

  // Set up ResizeObserver to detect mobile view (< 652px container width)
  onMount(() => {
    const boardElement = document.querySelector(".kanban-board");
    if (!boardElement) return;

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        isMobileView = width < 652;
      }
    });

    resizeObserver.observe(boardElement);

    return () => {
      resizeObserver?.disconnect();
    };
  });
</script>

<div class="kanban-board" style="--active-color: {activeStatusColor}">
  <!-- Mobile: Colorful Status Tabs -->
  <div class="status-tabs" role="tablist" aria-label="Feedback status">
    {#each KANBAN_STATUSES as status}
      {@const config = STATUS_CONFIG[status]}
      {@const count = itemsByStatus[status]?.length ?? 0}
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
        <span class="tab-label"
          >{config.label.replace("Won't Fix", "Declined")}</span
        >
        {#if count > 0}
          <span class="tab-count">{count}</span>
        {/if}
      </button>
    {/each}
  </div>

  <div class="columns-container">
    {#each KANBAN_STATUSES as status}
      <FeedbackKanbanColumn
        {status}
        config={STATUS_CONFIG[status]}
        items={itemsByStatus[status] ?? []}
        isDropTarget={dragOverColumn === status}
        isDragActive={draggedItem !== null}
        isActiveTab={activeStatus === status}
        selectedItemId={manageState.selectedItem?.id ?? null}
        disableDrag={isMobileView}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTouchDrag={handleTouchDrag}
        onDragOver={() => handleDragOver(status)}
        onDragLeave={handleDragLeave}
        onDrop={() => handleDrop(status)}
        onCardClick={handleCardClick}
      />
    {/each}

    <!-- Archive/Defer Stack - Thin bar on the right with stacked zones -->
    <div class="archive-defer-stack">
      <!-- Deferred Drop Zone - Smaller top section -->
      <div
        class="defer-drop-zone"
        class:drop-target={dragOverColumn === "deferred"}
        class:drag-active={draggedItem !== null}
        style="--column-color: #f59e0b"
        ondragover={(e) => {
          e.preventDefault();
          handleDragOver("deferred");
        }}
        ondragleave={handleDragLeave}
        ondrop={(e) => {
          e.preventDefault();
          handleDrop("deferred");
        }}
        role="region"
        aria-label="Defer drop zone"
      >
        <div class="defer-label">
          <i class="fas fa-clock"></i>
          <span>Defer</span>
          {#if deferredItems.length > 0}
            <span class="defer-count">{deferredItems.length}</span>
          {/if}
        </div>

        {#if dragOverColumn === "deferred"}
          <div class="drop-indicator">
            <i class="fas fa-calendar-plus"></i>
          </div>
        {/if}
      </div>

      <!-- Archived Drop Zone - Larger bottom section -->
      <div
        class="archive-drop-zone"
        class:drop-target={dragOverColumn === ARCHIVE_STATUS}
        class:drag-active={draggedItem !== null}
        style="--column-color: {STATUS_CONFIG[ARCHIVE_STATUS].color}"
        ondragover={(e) => {
          e.preventDefault();
          if (draggedItem && draggedItem.status !== ARCHIVE_STATUS) {
            dragOverColumn = ARCHIVE_STATUS;
          }
        }}
        ondragleave={handleDragLeave}
        ondrop={(e) => {
          e.preventDefault();
          handleDrop(ARCHIVE_STATUS);
        }}
        role="region"
        aria-label="Archive drop zone"
      >
        <div class="archive-label">
          <i class="fas {STATUS_CONFIG[ARCHIVE_STATUS].icon}"></i>
          <span>Archived</span>
        </div>

        {#if dragOverColumn === ARCHIVE_STATUS}
          <div class="drop-indicator">
            <i class="fas fa-arrow-right"></i>
          </div>
        {/if}
      </div>
    </div>
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

  <!-- Defer Dialog -->
  {#if showDeferDialog && itemToDefer}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="defer-dialog-overlay"
      onclick={handleDeferCancel}
      onkeydown={(e) => e.key === "Escape" && handleDeferCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="defer-dialog-title"
      tabindex="-1"
    >
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="defer-dialog"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
      >
        <div class="dialog-header">
          <div class="dialog-icon">
            <i class="fas fa-clock"></i>
          </div>
          <h3 class="dialog-title" id="defer-dialog-title">Defer Feedback</h3>
          <button
            type="button"
            class="close-button"
            onclick={handleDeferCancel}
            aria-label="Close dialog"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="dialog-body">
          <div class="feedback-preview">
            <span class="preview-label">Item:</span>
            <span class="preview-title"
              >{itemToDefer.title ||
                itemToDefer.description.substring(0, 60)}</span
            >
          </div>

          <div class="form-field">
            <label for="defer-date" class="field-label">
              <i class="fas fa-calendar"></i>
              Reactivate on
            </label>
            <input
              id="defer-date"
              type="date"
              class="date-input"
              bind:value={deferDate}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div class="form-field">
            <label for="defer-notes" class="field-label">
              <i class="fas fa-sticky-note"></i>
              Reason (optional)
            </label>
            <textarea
              id="defer-notes"
              class="notes-input"
              bind:value={deferNotes}
              placeholder="Why are you deferring this? (e.g., 'Wait for Svelte 6', 'Revisit after Q1')"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="dialog-footer">
          <button
            type="button"
            class="cancel-button"
            onclick={handleDeferCancel}
            disabled={isSubmittingDefer}
          >
            Cancel
          </button>
          <button
            type="button"
            class="submit-button"
            onclick={handleDeferSubmit}
            disabled={!deferDate || isSubmittingDefer}
          >
            {#if isSubmittingDefer}
              <i class="fas fa-spinner fa-spin"></i>
              Deferring...
            {:else}
              <i class="fas fa-clock"></i>
              Defer
            {/if}
          </button>
        </div>
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
    --kb-space-xl: clamp(28px, 7cqi, 52px);

    /* ===== FLUID TYPOGRAPHY - Accessible minimum sizes ===== */
    --kb-text-xs: clamp(0.8125rem, 2cqi, 0.875rem); /* min 13px */
    --kb-text-sm: clamp(0.875rem, 2.5cqi, 1rem); /* min 14px */
    --kb-text-base: clamp(1rem, 3cqi, 1.125rem); /* min 16px */
    --kb-text-lg: clamp(1.125rem, 3.5cqi, 1.25rem); /* min 18px */

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
    /* Remove glassmorphic backdrop so the underlying page background shows through */
    background: transparent;
    backdrop-filter: none;
    box-shadow: none;

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
    gap: clamp(16px, 1cqi, 32px);
    flex: 1;
    /* Center with max-width for wide screens */
    width: 100%;
    margin: 0 auto;
    /* Generous padding that scales */
    padding: clamp(16px, 1cqi, 32px);
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
    height: clamp(36px, 9cqi, 52px);
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
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes pulseIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* ===== ARCHIVE DROP ZONE ===== */
  .archive-drop-zone {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* Thin bar - same height as columns */
    width: clamp(60px, 8cqi, 80px);
    min-width: clamp(60px, 8cqi, 80px);
    flex: 1; /* Fill remaining vertical space */
    flex-shrink: 0;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--column-color) 8%, rgba(20, 20, 30, 0.95)) 0%,
      color-mix(in srgb, var(--column-color) 3%, rgba(15, 15, 25, 0.98)) 100%
    );
    border: 1px solid color-mix(in srgb, var(--column-color) 20%, transparent);
    border-top: 3px solid var(--column-color);
    border-radius: var(--kb-radius-md);
    overflow: hidden;
    transition: all 0.25s var(--spring-smooth);
    box-shadow:
      0 4px 20px color-mix(in srgb, var(--column-color) 15%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .archive-drop-zone:hover {
    border-color: color-mix(in srgb, var(--column-color) 30%, transparent);
    box-shadow:
      0 6px 24px color-mix(in srgb, var(--column-color) 20%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .archive-drop-zone.drag-active {
    border-style: dashed;
    opacity: 0.9;
  }

  .archive-drop-zone.drop-target {
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--column-color) 20%, rgba(20, 20, 30, 0.95)) 0%,
      color-mix(in srgb, var(--column-color) 12%, rgba(15, 15, 25, 0.98)) 100%
    );
    border-color: var(--column-color);
    border-style: solid;
    box-shadow:
      0 0 40px color-mix(in srgb, var(--column-color) 40%, transparent),
      inset 0 0 30px color-mix(in srgb, var(--column-color) 10%, transparent);
    transform: scale(1.02);
  }

  .archive-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--kb-space-xs);
    padding: var(--kb-space-md);
    color: var(--kb-text-muted);
    text-align: center;
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }

  .archive-label i {
    font-size: clamp(1.25rem, 4cqi, 1.5rem);
    color: var(--column-color);
    opacity: 0.8;
    writing-mode: horizontal-tb;
    transform: rotate(-90deg);
  }

  .archive-label span {
    font-size: var(--kb-text-sm);
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .archive-drop-zone .drop-indicator {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--column-color) 12%, transparent);
    backdrop-filter: blur(4px);
    pointer-events: none;
    animation: pulseIn 0.2s ease;
  }

  .archive-drop-zone .drop-indicator i {
    font-size: clamp(1.5rem, 5cqi, 2rem);
    color: var(--column-color);
    animation: slideRight 0.6s ease-in-out infinite;
  }

  @keyframes slideRight {
    0%,
    100% {
      transform: translateX(-4px);
      opacity: 0.6;
    }
    50% {
      transform: translateX(4px);
      opacity: 1;
    }
  }

  /* ===== ARCHIVE/DEFER STACK ===== */
  .archive-defer-stack {
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 2cqi, 16px);
    width: clamp(60px, 8cqi, 80px);
    min-width: clamp(60px, 8cqi, 80px);
    flex-shrink: 0;
    align-self: stretch; /* Fill full height of parent container */
  }

  /* ===== DEFER DROP ZONE (smaller, horizontal layout) ===== */
  .defer-drop-zone {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    /* Smaller height - about 1/4 of archive */
    height: clamp(60px, 10cqi, 80px);
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--column-color) 8%, rgba(20, 20, 30, 0.95)) 0%,
      color-mix(in srgb, var(--column-color) 3%, rgba(15, 15, 25, 0.98)) 100%
    );
    border: 1px solid color-mix(in srgb, var(--column-color) 20%, transparent);
    border-top: 3px solid var(--column-color);
    border-radius: var(--kb-radius-md);
    overflow: hidden;
    transition: all 0.25s var(--spring-smooth);
    box-shadow:
      0 4px 20px color-mix(in srgb, var(--column-color) 15%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .defer-drop-zone:hover {
    border-color: color-mix(in srgb, var(--column-color) 30%, transparent);
    box-shadow:
      0 6px 24px color-mix(in srgb, var(--column-color) 20%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .defer-drop-zone.drag-active {
    border-style: dashed;
    opacity: 0.9;
  }

  .defer-drop-zone.drop-target {
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--column-color) 20%, rgba(20, 20, 30, 0.95)) 0%,
      color-mix(in srgb, var(--column-color) 12%, rgba(15, 15, 25, 0.98)) 100%
    );
    border-color: var(--column-color);
    border-style: solid;
    box-shadow:
      0 0 40px color-mix(in srgb, var(--column-color) 40%, transparent),
      inset 0 0 30px color-mix(in srgb, var(--column-color) 10%, transparent);
    transform: scale(1.02);
  }

  .defer-label {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: var(--kb-space-xs);
    padding: var(--kb-space-sm);
    color: var(--kb-text-muted);
    text-align: center;
    flex-wrap: wrap;
  }

  .defer-label i {
    font-size: clamp(1rem, 3cqi, 1.25rem);
    color: var(--column-color);
    opacity: 0.8;
  }

  .defer-label span {
    font-size: var(--kb-text-xs);
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .defer-count {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: clamp(18px, 4.5cqi, 24px);
    height: clamp(18px, 4.5cqi, 24px);
    padding: 0 var(--kb-space-2xs);
    background: color-mix(in srgb, var(--column-color) 30%, transparent);
    border: 1px solid color-mix(in srgb, var(--column-color) 40%, transparent);
    border-radius: var(--kb-radius-full);
    font-size: var(--kb-text-xs);
    font-weight: 700;
    color: var(--column-color);
  }

  .defer-drop-zone .drop-indicator {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--column-color) 12%, transparent);
    backdrop-filter: blur(4px);
    pointer-events: none;
    animation: pulseIn 0.2s ease;
  }

  .defer-drop-zone .drop-indicator i {
    font-size: clamp(1.25rem, 4cqi, 1.5rem);
    color: var(--column-color);
    animation: pulse 0.6s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  /* ===== CONTAINER QUERY: Mobile layout (shows tabs) ===== */
  @container kanban (max-width: 652px) {
    .status-tabs {
      display: flex;
    }

    .columns-container {
      overflow-x: hidden;
      overflow-y: auto;
    }

    /* Hide archive/defer stack on mobile - not useful in tab view */
    .archive-defer-stack {
      display: none;
    }
  }

  /* ===== REDUCED MOTION ===== */
  @media (prefers-reduced-motion: reduce) {
    .kanban-board,
    .status-tab,
    .skeleton-card,
    .archive-drop-zone,
    .archive-drop-zone .drop-indicator i {
      transition: none;
      animation: none;
    }
  }

  /* ===== DEFER DIALOG ===== */
  .defer-dialog-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  .defer-dialog {
    display: flex;
    flex-direction: column;
    width: clamp(320px, 90vw, 500px);
    max-height: 90vh;
    background: linear-gradient(
      180deg,
      rgba(30, 30, 40, 0.98) 0%,
      rgba(20, 20, 30, 0.98) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(16px, 4cqi, 24px);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: clamp(12px, 3cqi, 16px);
    padding: clamp(16px, 4cqi, 24px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: linear-gradient(
      90deg,
      color-mix(in srgb, #f59e0b 10%, transparent) 0%,
      transparent 100%
    );
  }

  .dialog-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(36px, 9cqi, 44px);
    height: clamp(36px, 9cqi, 44px);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, #f59e0b 40%, transparent) 0%,
      color-mix(in srgb, #f59e0b 20%, transparent) 100%
    );
    border-radius: clamp(8px, 2cqi, 12px);
    color: #f59e0b;
    font-size: clamp(16px, 4cqi, 20px);
    box-shadow: 0 4px 12px color-mix(in srgb, #f59e0b 30%, transparent);
  }

  .dialog-title {
    flex: 1;
    margin: 0;
    font-size: clamp(1.125rem, 3.5cqi, 1.375rem);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(32px, 8cqi, 40px);
    height: clamp(32px, 8cqi, 40px);
    background: transparent;
    border: none;
    border-radius: clamp(6px, 1.5cqi, 8px);
    color: rgba(255, 255, 255, 0.6);
    font-size: clamp(16px, 4cqi, 18px);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .dialog-body {
    display: flex;
    flex-direction: column;
    gap: clamp(16px, 4cqi, 24px);
    padding: clamp(20px, 5cqi, 28px);
    overflow-y: auto;
  }

  .feedback-preview {
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 1.5cqi, 8px);
    padding: clamp(12px, 3cqi, 16px);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-left: 3px solid #f59e0b;
    border-radius: clamp(8px, 2cqi, 12px);
  }

  .preview-label {
    font-size: clamp(0.75rem, 2cqi, 0.875rem);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .preview-title {
    font-size: clamp(0.875rem, 2.5cqi, 1rem);
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.4;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 2cqi, 12px);
  }

  .field-label {
    display: flex;
    align-items: center;
    gap: clamp(8px, 2cqi, 10px);
    font-size: clamp(0.875rem, 2.5cqi, 1rem);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
  }

  .field-label i {
    font-size: clamp(14px, 3.5cqi, 16px);
    color: #f59e0b;
    opacity: 0.8;
  }

  .date-input,
  .notes-input {
    width: 100%;
    padding: clamp(10px, 2.5cqi, 14px) clamp(12px, 3cqi, 16px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(8px, 2cqi, 12px);
    color: rgba(255, 255, 255, 0.95);
    font-size: clamp(0.875rem, 2.5cqi, 1rem);
    font-family: inherit;
    transition: all 0.2s ease;
  }

  .date-input:focus,
  .notes-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px color-mix(in srgb, #f59e0b 15%, transparent);
  }

  .notes-input {
    resize: vertical;
    min-height: 80px;
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: clamp(10px, 2.5cqi, 14px);
    padding: clamp(16px, 4cqi, 20px) clamp(20px, 5cqi, 28px);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.2);
  }

  .cancel-button,
  .submit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 1.5cqi, 8px);
    padding: clamp(10px, 2.5cqi, 12px) clamp(16px, 4cqi, 24px);
    border: none;
    border-radius: clamp(8px, 2cqi, 12px);
    font-size: clamp(0.875rem, 2.5cqi, 1rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-button {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.8);
  }

  .cancel-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.95);
  }

  .submit-button {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: rgba(0, 0, 0, 0.9);
    box-shadow: 0 4px 12px color-mix(in srgb, #f59e0b 30%, transparent);
  }

  .submit-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    box-shadow: 0 6px 16px color-mix(in srgb, #f59e0b 40%, transparent);
    transform: translateY(-1px);
  }

  .submit-button:disabled,
  .cancel-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
