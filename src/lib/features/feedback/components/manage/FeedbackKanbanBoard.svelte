<!-- FeedbackKanbanBoard - Kanban board layout for feedback management -->
<script lang="ts">
  import type { FeedbackManageState } from "../../state/feedback-manage-state.svelte";
  import type { FeedbackItem, FeedbackStatus } from "../../domain/models/feedback-models";
  import { STATUS_CONFIG } from "../../domain/models/feedback-models";
  import FeedbackKanbanColumn from "./FeedbackKanbanColumn.svelte";

  const { manageState } = $props<{
    manageState: FeedbackManageState;
  }>();

  // Visible columns in order (wont-fix is hidden by default)
  const VISIBLE_STATUSES: FeedbackStatus[] = [
    "new",
    "acknowledged",
    "planned",
    "in-progress",
    "completed",
  ];

  // Track whether wont-fix column is visible
  let showWontFix = $state(false);

  // Group items by status
  const itemsByStatus = $derived(() => {
    const grouped: Record<FeedbackStatus, FeedbackItem[]> = {
      new: [],
      acknowledged: [],
      planned: [],
      "in-progress": [],
      completed: [],
      "wont-fix": [],
    };

    for (const item of manageState.items) {
      grouped[item.status].push(item);
    }

    return grouped;
  });

  // Count for wont-fix to show in toggle
  const wontFixCount = $derived(itemsByStatus()["wont-fix"].length);

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
            "acknowledged": "acknowledged",
            "planned": "planned",
            "in progress": "in-progress",
            "completed": "completed",
            "won't fix": "wont-fix",
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

<div class="kanban-board">
  <div class="columns-container">
    {#each VISIBLE_STATUSES as status}
      <FeedbackKanbanColumn
        {status}
        config={STATUS_CONFIG[status]}
        items={itemsByStatus()[status]}
        isDropTarget={dragOverColumn === status}
        isDragActive={draggedItem !== null}
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

    <!-- Won't Fix column (collapsible) -->
    {#if showWontFix}
      <FeedbackKanbanColumn
        status="wont-fix"
        config={STATUS_CONFIG["wont-fix"]}
        items={itemsByStatus()["wont-fix"]}
        isDropTarget={dragOverColumn === "wont-fix"}
        isDragActive={draggedItem !== null}
        selectedItemId={manageState.selectedItem?.id ?? null}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTouchDrag={handleTouchDrag}
        onDragOver={() => handleDragOver("wont-fix")}
        onDragLeave={handleDragLeave}
        onDrop={() => handleDrop("wont-fix")}
        onCardClick={handleCardClick}
      />
    {:else}
      <!-- Collapsed won't-fix indicator -->
      <button
        type="button"
        class="wontfix-toggle"
        onclick={() => (showWontFix = true)}
        aria-label="Show Won't Fix column"
      >
        <div class="toggle-icon">
          <i class="fas fa-ban"></i>
        </div>
        <span class="toggle-label">Won't Fix</span>
        {#if wontFixCount > 0}
          <span class="toggle-count">{wontFixCount}</span>
        {/if}
        <i class="fas fa-chevron-right toggle-arrow"></i>
      </button>
    {/if}
  </div>

  {#if manageState.isLoading && manageState.items.length === 0}
    <div class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-circle-notch fa-spin"></i>
        <span>Loading feedback...</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .kanban-board {
    --kb-space-xs: 8px;
    --kb-space-sm: 13px;
    --kb-space-md: 21px;

    --kb-text-xs: 0.75rem;
    --kb-text-sm: 0.875rem;

    --kb-radius-md: 12px;

    --kb-surface: rgba(255, 255, 255, 0.03);
    --kb-border: rgba(255, 255, 255, 0.08);
    --kb-text: rgba(255, 255, 255, 0.95);
    --kb-text-muted: rgba(255, 255, 255, 0.6);
    --kb-text-subtle: rgba(255, 255, 255, 0.4);

    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .columns-container {
    display: flex;
    gap: var(--kb-space-sm);
    height: 100%;
    padding: var(--kb-space-sm);
    overflow-x: auto;
    overflow-y: hidden;
  }

  /* Scrollbar styling */
  .columns-container::-webkit-scrollbar {
    height: 6px;
  }

  .columns-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .columns-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .columns-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Won't Fix toggle button */
  .wontfix-toggle {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--kb-space-xs);
    min-width: 48px;
    padding: var(--kb-space-md) var(--kb-space-xs);
    background: var(--kb-surface);
    border: 1px dashed var(--kb-border);
    border-radius: var(--kb-radius-md);
    color: var(--kb-text-subtle);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .wontfix-toggle:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
    color: var(--kb-text-muted);
  }

  .toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(107, 114, 128, 0.15);
    border-radius: 8px;
    font-size: 14px;
  }

  .toggle-label {
    font-size: var(--kb-text-xs);
    font-weight: 500;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    white-space: nowrap;
  }

  .toggle-count {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background: rgba(107, 114, 128, 0.2);
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
  }

  .toggle-arrow {
    font-size: 10px;
    transition: transform 0.2s ease;
  }

  .wontfix-toggle:hover .toggle-arrow {
    transform: translateX(2px);
  }

  /* Loading overlay */
  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--kb-space-sm);
    color: var(--kb-text-muted);
    font-size: var(--kb-text-sm);
  }

  .loading-spinner i {
    font-size: 24px;
    color: #10b981;
  }
</style>
