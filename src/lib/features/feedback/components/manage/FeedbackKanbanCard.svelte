<!-- FeedbackKanbanCard - Compact card for Kanban board -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { FeedbackItem } from "../../domain/models/feedback-models";
  import { TYPE_CONFIG, PRIORITY_CONFIG } from "../../domain/models/feedback-models";

  const { item, isSelected, onDragStart, onDragEnd, onTouchDrag, onClick } = $props<{
    item: FeedbackItem;
    isSelected: boolean;
    onDragStart: (item: FeedbackItem) => void;
    onDragEnd: () => void;
    onTouchDrag?: (item: FeedbackItem, x: number, y: number) => void;
    onClick: () => void;
  }>();

  const typeConfig = $derived(TYPE_CONFIG[item.type]);
  const priorityConfig = $derived(item.priority ? PRIORITY_CONFIG[item.priority] : null);

  // Format relative time
  function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  let isDragging = $state(false);
  let cardElement: HTMLButtonElement | null = null;

  // Track if we just finished dragging (to prevent click after drag)
  let justDragged = false;

  // Mount touch listeners with passive: false to allow preventDefault
  onMount(() => {
    if (!cardElement) return;

    cardElement.addEventListener("touchstart", handleTouchStart, { passive: true });
    cardElement.addEventListener("touchmove", handleTouchMove, { passive: false });
    cardElement.addEventListener("touchend", handleTouchEnd, { passive: false });
    cardElement.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      if (!cardElement) return;
      cardElement.removeEventListener("touchstart", handleTouchStart);
      cardElement.removeEventListener("touchmove", handleTouchMove);
      cardElement.removeEventListener("touchend", handleTouchEnd);
      cardElement.removeEventListener("touchcancel", handleTouchCancel);
    };
  });

  // Wrapper for click to prevent click after drag
  function handleClick(e: MouseEvent) {
    if (justDragged) {
      e.preventDefault();
      e.stopPropagation();
      justDragged = false;
      return;
    }
    onClick();
  }

  // Desktop drag and drop
  function handleDragStart(e: DragEvent) {
    isDragging = true;
    e.dataTransfer?.setData("text/plain", item.id);
    onDragStart(item);
  }

  function handleDragEnd() {
    isDragging = false;
    onDragEnd();
  }

  // Touch drag and drop for mobile
  let touchStartPos = { x: 0, y: 0 };
  let touchStartTime = 0;
  let isTouchDragging = false;
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let dragGhost: HTMLElement | null = null;
  let cardRect: DOMRect | null = null;

  function createDragGhost(x: number, y: number) {
    if (!cardElement) return;

    // Get card dimensions
    cardRect = cardElement.getBoundingClientRect();

    // Create ghost element
    dragGhost = cardElement.cloneNode(true) as HTMLElement;
    dragGhost.style.cssText = `
      position: fixed;
      left: ${x - cardRect.width / 2}px;
      top: ${y - cardRect.height / 2}px;
      width: ${cardRect.width}px;
      height: ${cardRect.height}px;
      z-index: 10000;
      pointer-events: none;
      opacity: 0.9;
      transform: scale(1.05) rotate(2deg);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 2px ${typeConfig.color};
      transition: transform 0.1s ease, box-shadow 0.1s ease;
    `;
    document.body.appendChild(dragGhost);
  }

  function moveDragGhost(x: number, y: number) {
    if (!dragGhost || !cardRect) return;
    dragGhost.style.left = `${x - cardRect.width / 2}px`;
    dragGhost.style.top = `${y - cardRect.height / 2}px`;
  }

  function removeDragGhost() {
    if (dragGhost) {
      dragGhost.remove();
      dragGhost = null;
      cardRect = null;
    }
  }

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    touchStartPos = { x: touch.clientX, y: touch.clientY };
    touchStartTime = Date.now();

    // Start long press timer (150ms - faster pickup)
    longPressTimer = setTimeout(() => {
      isTouchDragging = true;
      isDragging = true;
      createDragGhost(touch.clientX, touch.clientY);
      onDragStart(item);
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 150);
  }

  function handleTouchMove(e: TouchEvent) {
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);

    // If already dragging, just move the ghost
    if (isTouchDragging) {
      e.preventDefault();
      moveDragGhost(touch.clientX, touch.clientY);
      onTouchDrag?.(item, touch.clientX, touch.clientY);
      return;
    }

    // Not yet dragging - check if this is a scroll gesture
    // Only cancel if VERTICAL movement dominates (user wants to scroll list)
    // Horizontal movement means they're trying to drag to another column
    if (deltaY > 15 && deltaY > deltaX * 1.5) {
      // Vertical scroll detected - cancel long press
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      return;
    }

    // If there's significant horizontal movement, accelerate drag activation
    // (user clearly wants to drag, not scroll)
    if (deltaX > 20 && deltaX > deltaY && longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
      isTouchDragging = true;
      isDragging = true;
      createDragGhost(touch.clientX, touch.clientY);
      onDragStart(item);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      e.preventDefault();
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    if (isTouchDragging) {
      // End drag - prevent the subsequent click event
      e.preventDefault();
      justDragged = true;
      removeDragGhost();
      isTouchDragging = false;
      isDragging = false;
      onDragEnd();
    }
    // For quick taps, let the natural click event handle it
  }

  function handleTouchCancel() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    if (isTouchDragging) {
      removeDragGhost();
      isTouchDragging = false;
      isDragging = false;
      onDragEnd();
    }
  }
</script>

<button
  bind:this={cardElement}
  type="button"
  class="kanban-card"
  class:selected={isSelected}
  class:dragging={isDragging}
  style="--type-color: {typeConfig.color}"
  draggable="true"
  ondragstart={handleDragStart}
  ondragend={handleDragEnd}
  onclick={handleClick}
  aria-label="View {item.title}"
>
  <!-- Type indicator strip -->
  <div class="type-strip"></div>

  <div class="card-content">
    <!-- Header: Type icon + Title -->
    <div class="card-header">
      <div class="type-icon" title={typeConfig.label}>
        <i class="fas {typeConfig.icon}"></i>
      </div>
      <h4 class="card-title">{item.title}</h4>
    </div>

    <!-- Description preview -->
    <p class="card-description">{item.description}</p>

    <!-- Footer: User + Time + Priority -->
    <div class="card-footer">
      <div class="card-meta">
        <span class="meta-user">
          <i class="fas fa-user"></i>
          {item.userDisplayName.split(" ")[0]}
        </span>
        <span class="meta-time">{formatRelativeTime(item.createdAt)}</span>
      </div>

      {#if priorityConfig}
        <span
          class="priority-badge"
          style="--priority-color: {priorityConfig.color}"
          title="{priorityConfig.label} priority"
        >
          <i class="fas {priorityConfig.icon}"></i>
        </span>
      {/if}
    </div>
  </div>

  <!-- Drag handle indicator -->
  <div class="drag-handle" aria-hidden="true">
    <i class="fas fa-grip-vertical"></i>
  </div>
</button>

<style>
  .kanban-card {
    --kb-space-2xs: 6px;
    --kb-space-xs: 8px;
    --kb-space-sm: 13px;

    --kb-text-xs: 0.75rem;
    --kb-text-sm: 0.8125rem;

    --kb-radius-sm: 8px;
    --kb-radius-md: 12px;

    --kb-text: rgba(255, 255, 255, 0.95);
    --kb-text-muted: rgba(255, 255, 255, 0.7);
    --kb-text-subtle: rgba(255, 255, 255, 0.5);

    --spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

    position: relative;
    display: flex;
    width: 100%;
    padding: 0;
    /* Colorful gradient background using type color */
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--type-color) 8%, rgba(30, 30, 40, 0.95)) 0%,
      color-mix(in srgb, var(--type-color) 3%, rgba(25, 25, 35, 0.98)) 100%
    );
    border: 1px solid color-mix(in srgb, var(--type-color) 20%, rgba(255, 255, 255, 0.08));
    border-radius: var(--kb-radius-md);
    cursor: grab;
    text-align: left;
    overflow: hidden;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .kanban-card:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--type-color) 15%, rgba(35, 35, 45, 0.95)) 0%,
      color-mix(in srgb, var(--type-color) 8%, rgba(30, 30, 40, 0.98)) 100%
    );
    border-color: color-mix(in srgb, var(--type-color) 40%, rgba(255, 255, 255, 0.1));
    transform: translateY(-2px) scale(1.01);
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.3),
      0 0 20px color-mix(in srgb, var(--type-color) 15%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .kanban-card:active {
    cursor: grabbing;
    transform: scale(0.98);
  }

  .kanban-card.selected {
    border-color: var(--type-color);
    box-shadow:
      0 0 0 2px color-mix(in srgb, var(--type-color) 30%, transparent),
      0 4px 16px color-mix(in srgb, var(--type-color) 20%, transparent);
  }

  .kanban-card.dragging {
    opacity: 0.4;
    transform: scale(0.95);
  }

  /* Type indicator strip on left - more prominent */
  .type-strip {
    width: 5px;
    flex-shrink: 0;
    background: linear-gradient(
      180deg,
      var(--type-color) 0%,
      color-mix(in srgb, var(--type-color) 70%, transparent) 100%
    );
    box-shadow: 2px 0 8px color-mix(in srgb, var(--type-color) 30%, transparent);
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--kb-space-xs);
    padding: var(--kb-space-sm);
    min-width: 0;
  }

  /* Header */
  .card-header {
    display: flex;
    align-items: flex-start;
    gap: var(--kb-space-xs);
  }

  .type-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--type-color) 30%, transparent) 0%,
      color-mix(in srgb, var(--type-color) 15%, transparent) 100%
    );
    border-radius: 8px;
    color: var(--type-color);
    font-size: 12px;
    box-shadow: 0 2px 6px color-mix(in srgb, var(--type-color) 25%, transparent);
  }

  .card-title {
    margin: 0;
    flex: 1;
    font-size: var(--kb-text-sm);
    font-weight: 600;
    color: var(--kb-text);
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Description */
  .card-description {
    margin: 0;
    font-size: var(--kb-text-xs);
    color: var(--kb-text-muted);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Footer */
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--kb-space-xs);
    margin-top: var(--kb-space-xs);
    padding-top: var(--kb-space-xs);
    border-top: 1px solid color-mix(in srgb, var(--type-color) 10%, rgba(255, 255, 255, 0.05));
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: var(--kb-space-sm);
    font-size: 11px;
    color: var(--kb-text-subtle);
  }

  .meta-user,
  .meta-time {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .meta-user i,
  .meta-time i {
    font-size: 10px;
  }

  /* Priority badge */
  .priority-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: color-mix(in srgb, var(--priority-color) 15%, transparent);
    border-radius: 6px;
    color: var(--priority-color);
    font-size: 10px;
  }

  /* Drag handle */
  .drag-handle {
    position: absolute;
    top: 50%;
    right: var(--kb-space-xs);
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 32px;
    color: var(--kb-text-subtle);
    font-size: 10px;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .kanban-card:hover .drag-handle {
    opacity: 0.5;
  }

  /* Focus state */
  .kanban-card:focus-visible {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  }
</style>
