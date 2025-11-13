<!--
SidePanel - Modern 2026 Side Panel / Bottom Sheet Component

Features:
- Desktop: Side panel from right with pin/unpin
- Mobile: Bottom sheet with swipe-to-dismiss
- Smooth animations and gestures
- Backdrop dimming
- Customizable header and content
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";

  // Props
  let {
    isOpen = false,
    onClose,
    mode = "mobile", // 'mobile' | 'desktop'
    title,
    isPinned = $bindable(false),
    showPinButton = true,
    headerActions,
    children,
  } = $props<{
    isOpen: boolean;
    onClose: () => void;
    mode?: "mobile" | "desktop";
    title?: string;
    isPinned?: boolean;
    showPinButton?: boolean;
    headerActions?: Snippet;
    children: Snippet;
  }>();

  // Swipe gesture state
  let startY = $state(0);
  let currentY = $state(0);
  let isDragging = $state(false);
  let panelElement = $state<HTMLDivElement | null>(null);

  // Computed
  const swipeOffset = $derived(isDragging ? Math.max(0, currentY - startY) : 0);
  const shouldClose = $derived(swipeOffset > 100);

  // Handle touch start
  function handleTouchStart(e: TouchEvent) {
    if (mode !== "mobile") return;
    startY = e.touches[0]!.clientY;
    currentY = startY;
    isDragging = true;
  }

  // Handle touch move
  function handleTouchMove(e: TouchEvent) {
    if (!isDragging || mode !== "mobile") return;
    currentY = e.touches[0]!.clientY;
  }

  // Handle touch end
  function handleTouchEnd() {
    if (!isDragging || mode !== "mobile") return;

    if (shouldClose) {
      onClose();
    }

    isDragging = false;
    currentY = 0;
    startY = 0;
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
    role="button"
    tabindex="-1"
  ></div>

  <!-- Panel -->
  <div
    bind:this={panelElement}
    class="side-panel"
    class:open={isOpen}
    class:pinned={isPinned}
    class:mobile={mode === "mobile"}
    class:desktop={mode === "desktop"}
    class:dragging={isDragging}
    style:transform={mode === "mobile" && isDragging ? `translateY(${swipeOffset}px)` : undefined}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    role="dialog"
    aria-modal="true"
    aria-labelledby="panel-title"
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
            onclick={() => isPinned = !isPinned}
            type="button"
            aria-label={isPinned ? "Unpin panel" : "Pin panel"}
            title={isPinned ? "Unpin panel (overlay)" : "Pin panel (split view)"}
          >
            <i class="fas" class:fa-thumbtack={isPinned} class:fa-link={!isPinned}></i>
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

  /* Desktop Side Panel */
  .side-panel.desktop {
    top: 0;
    right: 0;
    bottom: 0;
    width: min(480px, 90vw);
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 12px 0 0 12px;
  }

  .side-panel.desktop.open {
    transform: translateX(0);
  }

  .side-panel.desktop.pinned {
    box-shadow: none;
    border-right: none;
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
  }

  .side-panel.mobile.open {
    transform: translateY(0);
  }

  .side-panel.mobile.dragging {
    transition: none;
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
