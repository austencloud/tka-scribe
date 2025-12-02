<!-- FeedbackKanbanColumn - A single status column in the Kanban board -->
<script lang="ts">
  import type { FeedbackItem, FeedbackStatus } from "../../domain/models/feedback-models";
  import FeedbackKanbanCard from "./FeedbackKanbanCard.svelte";

  const {
    status,
    config,
    items,
    isDropTarget,
    isDragActive,
    selectedItemId,
    onDragStart,
    onDragEnd,
    onTouchDrag,
    onDragOver,
    onDragLeave,
    onDrop,
    onCardClick,
  } = $props<{
    status: FeedbackStatus;
    config: { label: string; color: string; icon: string };
    items: FeedbackItem[];
    isDropTarget: boolean;
    isDragActive: boolean;
    selectedItemId: string | null;
    onDragStart: (item: FeedbackItem) => void;
    onDragEnd: () => void;
    onTouchDrag?: (item: FeedbackItem, x: number, y: number) => void;
    onDragOver: () => void;
    onDragLeave: () => void;
    onDrop: () => void;
    onCardClick: (item: FeedbackItem) => void;
  }>();

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    onDragOver();
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    onDrop();
  }
</script>

<div
  class="kanban-column"
  class:drop-target={isDropTarget}
  class:drag-active={isDragActive}
  style="--column-color: {config.color}"
  ondragover={handleDragOver}
  ondragleave={onDragLeave}
  ondrop={handleDrop}
  role="region"
  aria-label="{config.label} column"
>
  <!-- Column Header -->
  <header class="column-header">
    <div class="header-icon">
      <i class="fas {config.icon}"></i>
    </div>
    <h3 class="header-title">{config.label}</h3>
    <span class="header-count">{items.length}</span>
  </header>

  <!-- Cards Container -->
  <div class="cards-container">
    {#if items.length === 0}
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <span>No items</span>
      </div>
    {:else}
      {#each items as item (item.id)}
        <FeedbackKanbanCard
          {item}
          isSelected={selectedItemId === item.id}
          {onDragStart}
          {onDragEnd}
          {onTouchDrag}
          onClick={() => onCardClick(item)}
        />
      {/each}
    {/if}
  </div>

  <!-- Drop zone indicator -->
  {#if isDropTarget}
    <div class="drop-indicator">
      <i class="fas fa-plus-circle"></i>
      <span>Drop here</span>
    </div>
  {/if}
</div>

<style>
  .kanban-column {
    --kb-space-xs: 8px;
    --kb-space-sm: 13px;
    --kb-space-md: 21px;

    --kb-text-xs: 0.75rem;
    --kb-text-sm: 0.875rem;

    --kb-radius-sm: 8px;
    --kb-radius-md: 16px;

    --kb-text: rgba(255, 255, 255, 0.95);
    --kb-text-muted: rgba(255, 255, 255, 0.7);
    --kb-text-subtle: rgba(255, 255, 255, 0.5);

    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 280px;
    max-width: 320px;
    flex: 1;
    /* Colorful gradient background based on column color */
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--column-color) 12%, rgba(20, 20, 30, 0.95)) 0%,
      color-mix(in srgb, var(--column-color) 5%, rgba(15, 15, 25, 0.98)) 100%
    );
    /* Vibrant top border accent */
    border: 1px solid color-mix(in srgb, var(--column-color) 25%, transparent);
    border-top: 3px solid var(--column-color);
    border-radius: var(--kb-radius-md);
    overflow: hidden;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    /* Subtle glow */
    box-shadow:
      0 4px 20px color-mix(in srgb, var(--column-color) 15%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .kanban-column:hover {
    border-color: color-mix(in srgb, var(--column-color) 40%, transparent);
    box-shadow:
      0 8px 30px color-mix(in srgb, var(--column-color) 25%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }

  .kanban-column.drag-active {
    border-style: dashed;
    opacity: 0.9;
  }

  .kanban-column.drop-target {
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

  /* Column Header - Gradient with color accent */
  .column-header {
    display: flex;
    align-items: center;
    gap: var(--kb-space-xs);
    padding: var(--kb-space-md) var(--kb-space-md);
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--column-color) 15%, transparent) 0%,
      transparent 100%
    );
    border-bottom: 1px solid color-mix(in srgb, var(--column-color) 20%, transparent);
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--column-color) 40%, transparent) 0%,
      color-mix(in srgb, var(--column-color) 20%, transparent) 100%
    );
    border-radius: var(--kb-radius-sm);
    color: var(--column-color);
    font-size: 14px;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--column-color) 30%, transparent);
  }

  .header-title {
    margin: 0;
    flex: 1;
    font-size: var(--kb-text-sm);
    font-weight: 700;
    color: var(--kb-text);
    letter-spacing: 0.02em;
  }

  .header-count {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 10px;
    background: color-mix(in srgb, var(--column-color) 25%, transparent);
    border: 1px solid color-mix(in srgb, var(--column-color) 30%, transparent);
    border-radius: 14px;
    font-size: var(--kb-text-xs);
    font-weight: 700;
    color: var(--column-color);
  }

  /* Cards Container */
  .cards-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--kb-space-sm);
    padding: var(--kb-space-sm);
    overflow-y: auto;
    min-height: 100px;
  }

  .cards-container::-webkit-scrollbar {
    width: 6px;
  }

  .cards-container::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .cards-container::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--column-color) 40%, transparent);
    border-radius: 3px;
  }

  .cards-container::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--column-color) 60%, transparent);
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--kb-space-sm);
    padding: var(--kb-space-md) var(--kb-space-md);
    margin: var(--kb-space-sm);
    border-radius: var(--kb-radius-sm);
    background: color-mix(in srgb, var(--column-color) 5%, transparent);
    border: 1px dashed color-mix(in srgb, var(--column-color) 20%, transparent);
    color: var(--kb-text-subtle);
    font-size: var(--kb-text-xs);
    text-align: center;
  }

  .empty-state i {
    font-size: 24px;
    color: color-mix(in srgb, var(--column-color) 50%, var(--kb-text-subtle));
  }

  /* Drop Indicator */
  .drop-indicator {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--kb-space-xs);
    background: color-mix(in srgb, var(--column-color) 10%, transparent);
    pointer-events: none;
    animation: pulseIn 0.2s ease;
  }

  .drop-indicator i {
    font-size: 28px;
    color: var(--column-color);
  }

  .drop-indicator span {
    font-size: var(--kb-text-sm);
    font-weight: 600;
    color: var(--column-color);
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

  /* Responsive */
  @media (max-width: 768px) {
    .kanban-column {
      min-width: 260px;
    }
  }
</style>
