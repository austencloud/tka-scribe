<!--
SidePanel - Modern 2026 Side Panel / Bottom Sheet Component

Features:
- Desktop: Side panel from left or right with pin/unpin
- Desktop: Swipe/drag to dismiss (horizontal swipe)
- Mobile: Bottom sheet with swipe-to-dismiss (vertical swipe)
- Smooth animations and gestures
- Backdrop dimming with click-to-close
- Customizable header and content
- Smart drag detection (ignores interactive elements)
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";

  // Props
  let {
    isOpen = false,
    onClose,
    mode = "mobile", // 'mobile' | 'desktop'
    side = "right", // 'left' | 'right'
    title,
    isPinned = $bindable(false),
    showPinButton = true,
    headerActions,
    children,
  } = $props<{
    isOpen: boolean;
    onClose: () => void;
    mode?: "mobile" | "desktop";
    side?: "left" | "right";
    title?: string;
    isPinned?: boolean;
    showPinButton?: boolean;
    headerActions?: Snippet;
    children: Snippet;
  }>();

  // Swipe gesture state
  let startY = $state(0);
  let currentY = $state(0);
  let startX = $state(0);
  let currentX = $state(0);
  let isDragging = $state(false);
  let _panelElement = $state<HTMLDivElement | null>(null);

  // Computed - different swipe directions based on mode and side
  const swipeOffset = $derived.by(() => {
    if (!isDragging) return 0;

    if (mode === "mobile") {
      // Mobile: vertical swipe down to dismiss
      return Math.max(0, currentY - startY);
    } else if (mode === "desktop") {
      // Desktop left panel: horizontal swipe left to dismiss
      if (side === "left") {
        return Math.min(0, currentX - startX);
      }
      // Desktop right panel: horizontal swipe right to dismiss
      else {
        return Math.max(0, currentX - startX);
      }
    }
    return 0;
  });

  const shouldClose = $derived(Math.abs(swipeOffset) > 100);

  // Handle touch/mouse start
  function handleTouchStart(e: TouchEvent | MouseEvent) {
    // Don't start drag if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("textarea")
    ) {
      return;
    }

    if (e instanceof TouchEvent) {
      startY = e.touches[0]!.clientY;
      currentY = startY;
      startX = e.touches[0]!.clientX;
      currentX = startX;
    } else {
      startY = e.clientY;
      currentY = startY;
      startX = e.clientX;
      currentX = startX;
    }
    isDragging = true;
  }

  // Handle touch/mouse move
  function handleTouchMove(e: TouchEvent | MouseEvent) {
    if (!isDragging) return;

    if (e instanceof TouchEvent) {
      currentY = e.touches[0]!.clientY;
      currentX = e.touches[0]!.clientX;
    } else {
      currentY = e.clientY;
      currentX = e.clientX;
    }
  }

  // Handle touch/mouse end
  function handleTouchEnd() {
    if (!isDragging) return;

    if (shouldClose) {
      onClose();
    }

    isDragging = false;
    currentY = 0;
    startY = 0;
    currentX = 0;
    startX = 0;
  }

  // Handle backdrop click
  function handleBackdropClick() {
    if (!isPinned) {
      onClose();
    }
  }

  // Handle escape key
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && isOpen && !isPinned) {
      onClose();
    }
  }

  // Lifecycle
  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="backdrop"
    class:pinned={isPinned}
    class:mobile={mode === "mobile"}
    onclick={handleBackdropClick}
    onkeydown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleBackdropClick();
      }
    }}
    role="button"
    tabindex="-1"
  ></div>

  <!-- Panel -->
  <div
    bind:this={_panelElement}
    class="side-panel"
    class:open={isOpen}
    class:pinned={isPinned}
    class:mobile={mode === "mobile"}
    class:desktop={mode === "desktop"}
    class:left={side === "left"}
    class:right={side === "right"}
    class:dragging={isDragging}
    style:transform={isDragging
      ? mode === "mobile"
        ? `translateY(${swipeOffset}px)`
        : `translateX(${swipeOffset}px)`
      : undefined}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    onmousedown={handleTouchStart}
    onmousemove={handleTouchMove}
    onmouseup={handleTouchEnd}
    onmouseleave={handleTouchEnd}
    role="dialog"
    aria-modal="true"
    aria-labelledby="panel-title"
    tabindex="0"
  >
    <!-- Handle (mobile only) -->
    {#if mode === "mobile"}
      <div class="handle-bar"></div>
    {/if}

    <!-- Header -->
    <div class="panel-header">
      <div class="header-left">
        {#if title}
          <h2 id="panel-title" class="panel-title">{title}</h2>
        {/if}
      </div>

      <div class="header-right">
        {#if headerActions}
          {@render headerActions()}
        {/if}

        {#if mode === "desktop" && showPinButton}
          <button
            class="pin-button"
            class:pinned={isPinned}
            onclick={() => (isPinned = !isPinned)}
            type="button"
            aria-label={isPinned ? "Unpin panel" : "Pin panel"}
            title={isPinned
              ? "Unpin panel (overlay)"
              : "Pin panel (split view)"}
          >
            <i
              class="fas"
              class:fa-thumbtack={isPinned}
              class:fa-link={!isPinned}
            ></i>
          </button>
        {/if}

        <button
          class="close-button"
          onclick={onClose}
          type="button"
          aria-label="Close panel"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="panel-content">
      {@render children()}
    </div>
  </div>
{/if}

<style>
  /* Backdrop */
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 999;
    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .backdrop.mobile {
    background: rgba(0, 0, 0, 0.4);
  }

  .backdrop.pinned {
    display: none;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Side Panel Base */
  .side-panel {
    position: fixed;
    background: rgba(20, 20, 30, 0.98);
    backdrop-filter: blur(20px);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Desktop Side Panel - Right Side */
  .side-panel.desktop.right {
    top: 0;
    right: 0;
    bottom: 0;
    width: min(480px, 90vw);
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 12px 0 0 12px;
    cursor: grab;
  }

  .side-panel.desktop.right.open {
    transform: translateX(0);
  }

  .side-panel.desktop.right.dragging {
    cursor: grabbing;
    transition: none;
    user-select: none;
    opacity: 0.95;
  }

  .side-panel.desktop.right.pinned {
    box-shadow: none;
    border-right: none;
    cursor: default;
  }

  /* Desktop Side Panel - Left Side */
  .side-panel.desktop.left {
    top: 0;
    left: 0;
    bottom: 0;
    width: min(480px, 90vw);
    transform: translateX(-100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0 12px 12px 0;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    border-left: none;
    cursor: grab;
  }

  .side-panel.desktop.left.open {
    transform: translateX(0);
  }

  .side-panel.desktop.left.dragging {
    cursor: grabbing;
    transition: none;
    user-select: none;
    opacity: 0.95;
  }

  .side-panel.desktop.left.pinned {
    box-shadow: none;
    border-left: none;
    cursor: default;
  }

  /* Mobile Bottom Sheet */
  .side-panel.mobile {
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 85vh;
    transform: translateY(100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 20px 20px 0 0;
    padding-top: 8px;
    cursor: default;
  }

  .side-panel.mobile.open {
    transform: translateY(0);
  }

  .side-panel.mobile.dragging {
    transition: none;
    user-select: none;
  }

  /* Handle Bar (mobile) */
  .handle-bar {
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    margin: 0 auto 12px;
  }

  /* Header */
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .panel-title {
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Buttons */
  .pin-button,
  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pin-button:hover,
  .close-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 1);
  }

  .pin-button.pinned {
    background: rgba(103, 126, 234, 0.2);
    border-color: rgba(103, 126, 234, 0.4);
    color: #667eea;
  }

  .pin-button.pinned:hover {
    background: rgba(103, 126, 234, 0.3);
  }

  /* Content */
  .panel-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px;
    min-height: 0;
  }

  /* Scrollbar styling */
  .panel-content::-webkit-scrollbar {
    width: 8px;
  }

  .panel-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  .panel-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .panel-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .panel-header {
      padding: 12px 16px;
    }

    .panel-title {
      font-size: 16px;
    }

    .panel-content {
      padding: 16px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .side-panel,
    .backdrop {
      animation: none;
      transition: none;
    }
  }
</style>
