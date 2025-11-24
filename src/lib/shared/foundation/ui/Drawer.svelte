<!--
  Drawer.svelte - Minimal, reliable drawer with pure CSS animations

  NO MORE VAUL-SVELTE. Just clean, predictable CSS transforms.

  Features:
  - Slides from right, left, top, or bottom based on placement
  - Smooth CSS transitions that actually work
  - Backdrop support
  - Escape key to close
  - Focus trapping for accessibility (WAI-ARIA compliant)
  - Inert attribute on background content
  - Focus restoration on close
  - Snap points for multi-height drawers
  - Same API as before so nothing breaks
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { tryResolve, TYPES } from "$shared/inversify";
  import type { IResponsiveLayoutService } from "$lib/modules/create/shared/services/contracts/IResponsiveLayoutService";
  import { SwipeToDismissHandler } from "./SwipeToDismissHandler";
  import { FocusTrapHandler } from "./FocusTrapHandler";
  import { SnapPointsHandler, type SnapPointValue } from "./SnapPointsHandler";

  type CloseReason = "backdrop" | "escape" | "programmatic";

  let {
    isOpen = $bindable(false),
    closeOnBackdrop = true,
    closeOnEscape = true,
    dismissible = true,
    labelledBy,
    ariaLabel,
    role = "dialog",
    showHandle = true,
    class: drawerClass = "",
    backdropClass = "",
    placement = "bottom",
    respectLayoutMode = false,
    // Focus trap options
    trapFocus = true,
    initialFocusElement = null,
    returnFocusOnClose = true,
    setInertOnSiblings = true,
    // Snap points options
    snapPoints = null,
    activeSnapPoint = $bindable<number | null>(null),
    closeOnSnapToZero = true,
    onclose,
    onOpenChange,
    onbackdropclick,
    onDragChange,
    onSnapPointChange,
    children,
  } = $props<{
    isOpen?: boolean;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    dismissible?: boolean;
    labelledBy?: string;
    ariaLabel?: string;
    role?: "dialog" | "menu" | "listbox" | "alertdialog";
    showHandle?: boolean;
    class?: string;
    backdropClass?: string;
    placement?: "bottom" | "top" | "right" | "left";
    respectLayoutMode?: boolean;
    /** Enable focus trapping inside the drawer. Default: true */
    trapFocus?: boolean;
    /** Element to focus when drawer opens. Default: first focusable element */
    initialFocusElement?: HTMLElement | null;
    /** Return focus to trigger element when drawer closes. Default: true */
    returnFocusOnClose?: boolean;
    /** Set inert attribute on sibling elements when open. Default: true */
    setInertOnSiblings?: boolean;
    /** Snap points for multi-height drawer (e.g., ["25%", "50%", "90%"] or [200, 400]) */
    snapPoints?: SnapPointValue[] | null;
    /** Current active snap point index (bindable) */
    activeSnapPoint?: number | null;
    /** Close drawer when snapping to index 0. Default: true */
    closeOnSnapToZero?: boolean;
    onclose?: (event: CustomEvent<{ reason: CloseReason }>) => void;
    onOpenChange?: (open: boolean) => void;
    onbackdropclick?: (event: MouseEvent) => boolean;
    onDragChange?: (offset: number, progress: number, isDragging: boolean) => void;
    /** Called when snap point changes */
    onSnapPointChange?: (index: number, valuePx: number) => void;
    children?: () => unknown;
  }>();

  let layoutService: IResponsiveLayoutService | null = null;
  let isSideBySideLayout = $state(false);
  let mounted = $state(false);
  let wasOpen = $state(false);
  let shouldRender = $state(false);
  let isAnimatedOpen = $state(false); // Controls visual state for animations

  // Reactive state for drag visuals
  let isDragging = $state(false);
  let dragOffsetX = $state(0);
  let dragOffsetY = $state(0);

  // Internal drag change handler that updates local state AND calls parent callback
  function handleInternalDragChange(offset: number, progress: number, dragging: boolean) {
    isDragging = dragging;
    if (placement === "right" || placement === "left") {
      dragOffsetX = offset;
      dragOffsetY = 0;
    } else {
      dragOffsetX = 0;
      dragOffsetY = offset;
    }
    // Forward to parent callback
    onDragChange?.(offset, progress, dragging);
  }

  // Handle drag end for snap points - returns true if handled
  function handleDragEnd(offset: number, velocity: number, duration: number): boolean {
    if (!snapHandler || !snapPoints || snapPoints.length === 0) {
      return false; // Let default dismiss logic handle it
    }

    // Calculate target snap point based on gesture
    const targetIndex = snapHandler.snapToClosest(offset, velocity, duration);
    snapPointOffset = snapHandler.getTransformOffset();

    // If snapping to index 0 with closeOnSnapToZero, let dismiss handle it
    if (targetIndex === 0 && closeOnSnapToZero) {
      return false; // Will trigger onDismiss
    }

    return true; // Handled - don't trigger default dismiss
  }

  // Swipe-to-dismiss handler
  let drawerElement = $state<HTMLElement | null>(null);
  let swipeHandler = new SwipeToDismissHandler({
    placement,
    dismissible,
    onDismiss: () => {
      isOpen = false;
    },
    onDragChange: handleInternalDragChange,
    onDragEnd: handleDragEnd,
  });

  // Focus trap handler for accessibility
  let focusTrapHandler = new FocusTrapHandler({
    initialFocus: initialFocusElement,
    returnFocusOnDeactivate: returnFocusOnClose,
    setInertOnSiblings: setInertOnSiblings,
  });

  // Snap points handler (only created when snapPoints are provided)
  let snapHandler: SnapPointsHandler | null = null;
  let snapPointOffset = $state(0); // Current snap point transform offset
  let currentSnapIndex = $state<number | null>(null);

  // Initialize snap handler when snapPoints are provided
  $effect(() => {
    if (snapPoints && snapPoints.length > 0) {
      snapHandler = new SnapPointsHandler({
        placement,
        snapPoints,
        defaultSnapPoint: snapPoints.length - 1, // Start fully open
        onSnapPointChange: (index, valuePx) => {
          currentSnapIndex = index;
          activeSnapPoint = index;
          onSnapPointChange?.(index, valuePx);

          // Close drawer if snapping to zero and closeOnSnapToZero is true
          if (index === 0 && closeOnSnapToZero) {
            isOpen = false;
          }
        },
      });
    } else {
      snapHandler = null;
      snapPointOffset = 0;
      currentSnapIndex = null;
    }
  });

  // Initialize snap handler dimensions when drawer element is available
  $effect(() => {
    if (drawerElement && snapHandler && isAnimatedOpen) {
      const rect = drawerElement.getBoundingClientRect();
      snapHandler.initialize(rect.width, rect.height);
      snapPointOffset = snapHandler.getTransformOffset();
    }
  });

  // Initialize layout service if responsive layout is enabled
  onMount(() => {
    mounted = true;
    if (respectLayoutMode) {
      // Try to resolve layout service (optional dependency)
      // Will be null if create module hasn't loaded yet
      layoutService = tryResolve<IResponsiveLayoutService>(
        TYPES.IResponsiveLayoutService
      );
    }
  });

  // Reactive layout detection
  $effect(() => {
    if (respectLayoutMode && layoutService) {
      isSideBySideLayout = layoutService.shouldUseSideBySideLayout();
    }
  });

  // Track open state changes and notify parent
  $effect(() => {
    if (isOpen !== wasOpen) {
      onOpenChange?.(isOpen);

      // When opening, add to DOM in closed state, then animate open
      if (isOpen) {
        shouldRender = true;
        isAnimatedOpen = false; // Start closed
        swipeHandler.reset(); // Reset drag state when opening
        // Force browser to render the closed state first using RAF for reliability
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            isAnimatedOpen = true; // Then transition to open
            // Activate focus trap after animation starts (element is in DOM)
            if (trapFocus && drawerElement) {
              focusTrapHandler.activate(drawerElement);
            }
          });
        });
      }

      // When closing, animate to closed state, then remove from DOM
      if (wasOpen && !isOpen) {
        emitClose("programmatic");
        isAnimatedOpen = false; // Trigger close animation
        swipeHandler.reset(); // Reset drag state when closing
        // Deactivate focus trap immediately so focus can return
        focusTrapHandler.deactivate();
        // Keep in DOM during closing animation (350ms), then remove
        setTimeout(() => {
          shouldRender = false;
        }, 400); // 350ms transition + 50ms buffer
      }

      wasOpen = isOpen;
    }
  });

  function emitClose(reason: CloseReason) {
    if (onclose) {
      onclose(new CustomEvent("close", { detail: { reason } }));
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    // If custom handler provided, use it to determine whether to close
    if (onbackdropclick) {
      const shouldClose = onbackdropclick(event);
      if (shouldClose) {
        emitClose("backdrop");
        isOpen = false;
      }
      return;
    }

    // Default behavior
    if (closeOnBackdrop) {
      emitClose("backdrop");
      isOpen = false;
    }
  }

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && closeOnEscape && isOpen) {
      event.preventDefault();
      emitClose("escape");
      isOpen = false;
    }
  }

  // Compute state attribute for CSS - use animated state for visual transitions
  const dataState = $derived(isAnimatedOpen ? "open" : "closed");

  // Compute full class names
  const overlayClasses = $derived(
    `drawer-overlay ${backdropClass} ${respectLayoutMode && isSideBySideLayout ? "side-by-side-layout" : ""}`.trim()
  );

  const contentClasses = $derived(
    `drawer-content ${drawerClass} ${respectLayoutMode && isSideBySideLayout ? "side-by-side-layout" : ""}`.trim()
  );

  // Compute transform including drag offset and snap point offset
  const computedTransform = $derived.by(() => {
    // During drag, show drag offset
    if (isDragging && (dragOffsetY !== 0 || dragOffsetX !== 0)) {
      const isHorizontal = placement === "left" || placement === "right";
      if (isHorizontal) {
        return `translateX(${dragOffsetX + snapPointOffset}px)`;
      } else {
        return `translateY(${dragOffsetY + snapPointOffset}px)`;
      }
    }

    // When not dragging, show snap point offset if snap points are active
    if (snapPointOffset !== 0 && isAnimatedOpen) {
      const isHorizontal = placement === "left" || placement === "right";
      if (isHorizontal) {
        return `translateX(${snapPointOffset}px)`;
      } else {
        return `translateY(${snapPointOffset}px)`;
      }
    }

    return "";
  });

  // Update handler options when props change
  $effect(() => {
    swipeHandler.updateOptions({
      placement,
      dismissible,
      onDragChange: handleInternalDragChange,
      onDragEnd: handleDragEnd,
    });
  });

  // Update focus trap options when props change
  $effect(() => {
    focusTrapHandler.updateOptions({
      initialFocus: initialFocusElement,
      returnFocusOnDeactivate: returnFocusOnClose,
      setInertOnSiblings: setInertOnSiblings,
    });
  });

  // Attach/detach swipe handler when element changes
  $effect(() => {
    if (drawerElement) {
      swipeHandler.attach(drawerElement);
    }
    return () => {
      swipeHandler.detach();
    };
  });

  // Clean up on component destroy
  onDestroy(() => {
    swipeHandler.detach();
    focusTrapHandler.deactivate();
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if mounted && shouldRender}
  <!-- Backdrop -->
  <div
    class={overlayClasses}
    data-state={dataState}
    onclick={handleBackdropClick}
    aria-hidden="true"
  ></div>

  <!-- Drawer content -->
  <div
    bind:this={drawerElement}
    class={contentClasses}
    class:dragging={isDragging}
    class:has-snap-points={snapPoints && snapPoints.length > 0}
    data-placement={placement}
    data-state={dataState}
    data-snap-index={currentSnapIndex}
    {role}
    aria-modal="true"
    aria-labelledby={labelledBy}
    aria-label={ariaLabel}
    style:transform={computedTransform || undefined}
    style:transition={isDragging ? "none" : ""}
  >
    {#if showHandle}
      <div class="drawer-handle" aria-hidden="true"></div>
    {/if}
    <div class="drawer-inner">
      {@render children?.()}
    </div>
  </div>
{/if}

<style>
  /* Overlay (backdrop) */
  .drawer-overlay {
    position: fixed;
    inset: 0;
    z-index: calc(var(--sheet-z-index, var(--sheet-z-base, 50)) - 1);

    pointer-events: var(--sheet-backdrop-pointer-events, auto);
    transition: opacity 350ms cubic-bezier(0.32, 0.72, 0, 1);
    opacity: 0;
  }

  .drawer-overlay[data-state="open"] {
    opacity: 1;
  }

  .drawer-overlay[data-state="closed"] {
    opacity: 0;
    pointer-events: none;
  }

  /* Edit panel backdrop - completely transparent and non-interactive */
  .drawer-overlay.edit-panel-backdrop {
    background: transparent !important;
    backdrop-filter: none !important;
    pointer-events: none !important;
  }

  /* Sequence Actions sheet backdrop - completely transparent to show beats behind */
  .drawer-overlay.actions-sheet-backdrop {
    background: transparent !important;
    backdrop-filter: none !important;
    pointer-events: auto !important;
  }

  /* Side-by-side layout: Constrain backdrop to right half of viewport */
  .drawer-overlay.side-by-side-layout {
    left: var(--create-panel-left, 50%);
    right: 0;
    top: var(--create-panel-top, 0);
    bottom: var(--create-panel-bottom, 0);
  }

  /* Drawer content container */
  .drawer-content {
    position: fixed;
    z-index: var(--sheet-z-index, var(--sheet-z-base, 50));
    display: flex;
    flex-direction: column;
    outline: none;
    /* Background with fallback */
    background: var(--sheet-bg, rgba(26, 26, 46, 0.95));
    backdrop-filter: var(--sheet-filter, blur(24px));
    -webkit-backdrop-filter: var(--sheet-filter, blur(24px));

    border: var(
      --sheet-border,
      var(--sheet-border-subtle, 1px solid rgba(255, 255, 255, 0.1))
    );

    /* Smooth CSS transitions */
    transition:
      transform 350ms cubic-bezier(0.32, 0.72, 0, 1),
      opacity 350ms cubic-bezier(0.32, 0.72, 0, 1);
    will-change: transform;

    /* Prevent pull-to-refresh ONLY on this drawer, not globally */
    overscroll-behavior-y: contain;
    /* Allow touch manipulation - default to vertical panning */
    touch-action: pan-y;
  }

  /* Horizontal touch action for right/left placement */
  .drawer-content[data-placement="right"],
  .drawer-content[data-placement="left"] {
    touch-action: pan-x;
    overscroll-behavior-x: contain;
  }

  .drawer-content[data-state="closed"] {
    pointer-events: none;
  }

  /* Bottom placement - default (mobile) */
  .drawer-content[data-placement="bottom"]:not(.side-by-side-layout) {
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-width: 100%;
    max-height: var(
      --sheet-max-height,
      min(95vh, var(--modal-max-height, 95vh))
    );
    margin: 0;
    border-top-left-radius: var(
      --sheet-border-radius-top-left,
      var(--sheet-radius-large, 20px)
    );
    border-top-right-radius: var(
      --sheet-border-radius-top-right,
      var(--sheet-radius-large, 20px)
    );
    border-bottom: none;
  }

  .drawer-content[data-placement="bottom"][data-state="closed"] {
    transform: translate3d(0, 100%, 0);
  }

  .drawer-content[data-placement="bottom"][data-state="open"] {
    transform: translate3d(0, 0, 0);
  }

  /* Top placement */
  .drawer-content[data-placement="top"] {
    top: 0;
    left: 0;
    right: 0;
    width: var(--sheet-width, min(720px, 100%));
    max-height: var(
      --sheet-max-height,
      min(95vh, var(--modal-max-height, 95vh))
    );
    margin: 0 auto;
    border-bottom-left-radius: var(--sheet-radius-large, 20px);
    border-bottom-right-radius: var(--sheet-radius-large, 20px);
    border-top: none;
  }

  .drawer-content[data-placement="top"][data-state="closed"] {
    transform: translate3d(0, -100%, 0);
  }

  .drawer-content[data-placement="top"][data-state="open"] {
    transform: translate3d(0, 0, 0);
  }

  /* Right placement */
  .drawer-content[data-placement="right"] {
    top: 0;
    right: 0;
    bottom: 0;
    height: 100vh;
    width: var(--sheet-width, min(600px, 90vw));
    border-left: var(
      --sheet-border-strong,
      2px solid rgba(255, 255, 255, 0.15)
    );
    border-right: none;
    border-top-left-radius: var(--sheet-radius-large, 20px);
    border-bottom-left-radius: var(--sheet-radius-large, 20px);
    cursor: grab;
  }

  .drawer-content[data-placement="right"].dragging {
    cursor: grabbing;
    user-select: none;
  }

  .drawer-content[data-placement="right"][data-state="closed"] {
    transform: translate3d(100%, 0, 0);
  }

  .drawer-content[data-placement="right"][data-state="open"] {
    transform: translate3d(0, 0, 0);
  }

  /* Right placement in side-by-side mode - use tracked width */
  .drawer-content[data-placement="right"].side-by-side-layout {
    top: var(--create-panel-top, 0);
    bottom: var(--create-panel-bottom, 0);
    height: auto;
    max-height: none;
    width: var(--create-panel-width, clamp(360px, 32vw, 520px));
    max-width: 100%;
  }

  /* Left placement */
  .drawer-content[data-placement="left"] {
    top: 0;
    left: 0;
    bottom: 0;
    height: 100vh;
    width: var(--sheet-width, min(600px, 90vw));
    border-right: var(
      --sheet-border-strong,
      2px solid rgba(255, 255, 255, 0.15)
    );
    border-left: none;
    border-top-right-radius: var(--sheet-radius-large, 20px);
    border-bottom-right-radius: var(--sheet-radius-large, 20px);
    cursor: grab;
  }

  .drawer-content[data-placement="left"].dragging {
    cursor: grabbing;
    user-select: none;
  }

  .drawer-content[data-placement="left"][data-state="closed"] {
    transform: translate3d(-100%, 0, 0);
  }

  .drawer-content[data-placement="left"][data-state="open"] {
    transform: translate3d(0, 0, 0);
  }

  /* Handle - fully self-contained styling */
  /* 
   * The drawer handle is now fully self-contained within this component.
   * All styling variations (placement, layout mode) are handled here.
   * External components should NOT override these styles.
   * 
   * Handle adapts automatically to:
   * - Bottom placement (mobile): horizontal bar at top
   * - Right placement + side-by-side: vertical bar on left edge
   * - Left placement: vertical bar on right edge
   * - Top placement: horizontal bar at bottom
   */
  .drawer-handle {
    position: relative;
    width: 40px;
    height: 4px;
    margin: 10px auto 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.3);
    flex-shrink: 0;
  }

  /* Handle for right placement in side-by-side mode - vertical on left edge */
  .drawer-content[data-placement="right"].side-by-side-layout .drawer-handle {
    position: absolute;
    top: 50%;
    left: 18px;
    width: 4px;
    height: 48px;
    margin: 0;
    border-radius: 999px;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.35);
  }

  /* Handle for left placement - vertical on right edge */
  .drawer-content[data-placement="left"] .drawer-handle {
    position: absolute;
    top: 50%;
    right: 18px;
    width: 4px;
    height: 48px;
    margin: 0;
    border-radius: 999px;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.35);
  }

  /* Handle for top placement - horizontal on bottom edge */
  .drawer-content[data-placement="top"] .drawer-handle {
    position: relative;
    width: 40px;
    height: 4px;
    margin: 8px auto 10px;
    order: 1; /* Place below content */
  }

  /* Handle for bottom placement - stays at top (default) */
  .drawer-content[data-placement="bottom"]:not(.side-by-side-layout)
    .drawer-handle {
    position: relative;
    width: 40px;
    height: 4px;
    margin: 10px auto 8px;
  }

  /* Inner content container */
  .drawer-inner {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    /* Contain scroll - don't chain to parent */
    overscroll-behavior-y: contain;
  }

  /* Scrollbar styling */
  .drawer-inner::-webkit-scrollbar {
    width: 8px;
  }

  .drawer-inner::-webkit-scrollbar-track {
    background: transparent;
  }

  .drawer-inner::-webkit-scrollbar-thumb {
    border-radius: 4px;
  }

  .drawer-inner::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .drawer-content[data-placement="bottom"] {
      border-top-left-radius: var(--sheet-radius-medium, 16px);
      border-top-right-radius: var(--sheet-radius-medium, 16px);
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .drawer-content {
      background: rgba(0, 0, 0, 0.98);
      border: 2px solid white;
    }

    .drawer-handle {
      background: rgba(255, 255, 255, 0.8);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .drawer-content,
    .drawer-overlay {
      transition: none;
    }
  }
</style>
