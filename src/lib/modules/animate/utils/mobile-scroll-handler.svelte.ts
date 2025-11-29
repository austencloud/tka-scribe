/**
 * mobile-scroll-handler.svelte.ts
 *
 * Svelte 5 composable for handling mobile scroll-to-expand behavior.
 * Provides touch and scroll event handlers for expand/collapse UX.
 * Prevents browser back navigation on horizontal swipe gestures.
 */

/**
 * Creates mobile scroll handler state and event handlers
 */
export function createMobileScrollHandler() {
  let isExpanded = $state(false);
  let lastScrollTop = $state(0);
  let touchStartY = $state(0);
  let touchStartX = $state(0);
  let scrollContainerRef: HTMLDivElement | null = null;
  let rafId: number | null = null;

  /**
   * Handle touch start - record starting position for swipe detection
   */
  function handleTouchStart(e: TouchEvent, _isSideBySideLayout: boolean) {
    const touch = e.touches[0];
    if (!touch) return;

    // Always record touch position
    touchStartY = touch.pageY;
    touchStartX = touch.pageX;

    // Prevent browser back navigation when touch starts near screen edge
    // (within 10px of left edge - typical swipe-to-go-back zone)
    if (touch.pageX < 10) {
      e.preventDefault();
    }
  }

  /**
   * Handle touch move - detect swipe up gesture to expand
   * and prevent browser back navigation on horizontal swipes
   */
  function handleTouchMove(e: TouchEvent, isSideBySideLayout: boolean) {
    const touch = e.touches[0];
    if (!touch) return;

    const currentY = touch.pageY;
    const currentX = touch.pageX;
    const deltaY = touchStartY - currentY;
    const deltaX = currentX - touchStartX;

    // Detect horizontal swipe
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

    // ALWAYS prevent browser back navigation on horizontal swipes
    // This is critical for PWA behavior
    if (isHorizontalSwipe && Math.abs(deltaX) > 5) {
      e.preventDefault();
    }

    // Only handle expand/collapse when not in side-by-side mode
    if (!isSideBySideLayout && !isExpanded && scrollContainerRef) {
      // Swiped up more than 30px → EXPAND (only for vertical swipes)
      if (!isHorizontalSwipe && deltaY > 30) {
        isExpanded = true;
      }
    }
  }

  /**
   * Svelte action to attach non-passive touch event listeners
   * and prevent trackpad swipe gestures
   * This is required because touch events are passive by default in Chrome 56+
   */
  function preventBackNavigation(node: HTMLElement, isSideBySideLayout: boolean) {
    const onTouchStart = (e: TouchEvent) => {
      handleTouchStart(e, isSideBySideLayout);
    };

    const onTouchMove = (e: TouchEvent) => {
      handleTouchMove(e, isSideBySideLayout);
    };

    // Prevent trackpad two-finger horizontal swipe (wheel event)
    const onWheel = (e: WheelEvent) => {
      // Detect horizontal wheel/trackpad swipe
      const isHorizontalSwipe = Math.abs(e.deltaX) > Math.abs(e.deltaY);

      // Prevent browser back/forward navigation on horizontal trackpad gestures
      if (isHorizontalSwipe && Math.abs(e.deltaX) > 5) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Add listeners with {passive: false} to allow preventDefault()
    node.addEventListener('touchstart', onTouchStart, { passive: false });
    node.addEventListener('touchmove', onTouchMove, { passive: false });
    node.addEventListener('wheel', onWheel, { passive: false });

    return {
      update(newIsSideBySideLayout: boolean) {
        // Re-attach listeners with updated layout state if needed
        node.removeEventListener('touchstart', onTouchStart);
        node.removeEventListener('touchmove', onTouchMove);
        node.removeEventListener('wheel', onWheel);

        const updatedOnTouchStart = (e: TouchEvent) => handleTouchStart(e, newIsSideBySideLayout);
        const updatedOnTouchMove = (e: TouchEvent) => handleTouchMove(e, newIsSideBySideLayout);

        node.addEventListener('touchstart', updatedOnTouchStart, { passive: false });
        node.addEventListener('touchmove', updatedOnTouchMove, { passive: false });
        node.addEventListener('wheel', onWheel, { passive: false });
      },
      destroy() {
        node.removeEventListener('touchstart', onTouchStart);
        node.removeEventListener('touchmove', onTouchMove);
        node.removeEventListener('wheel', onWheel);
      }
    };
  }

  /**
   * Handle scroll - detect when at top and scrolling up to collapse
   * Uses requestAnimationFrame for performance
   */
  function handleScroll(e: Event, isSideBySideLayout: boolean) {
    if (!isSideBySideLayout && isExpanded && scrollContainerRef) {
      // Cancel any pending RAF callback
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      // Schedule scroll detection on next frame
      rafId = requestAnimationFrame(() => {
        const target = e.target as HTMLDivElement;
        const { scrollTop } = target;
        const scrollingUp = scrollTop < lastScrollTop;

        // At top (scrollTop === 0) and scrolling up → COLLAPSE
        if (scrollTop === 0 && scrollingUp) {
          isExpanded = false;
          // Reset scroll position
          target.scrollTop = 0;
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        rafId = null;
      });
    }
  }

  /**
   * Reset expanded state when panel closes or layout changes
   */
  function reset() {
    isExpanded = false;
    lastScrollTop = 0;
  }

  /**
   * Set the scroll container ref
   */
  function setScrollContainer(element: HTMLDivElement | null) {
    scrollContainerRef = element;
  }

  /**
   * Toggle expanded state manually
   */
  function toggleExpanded() {
    isExpanded = !isExpanded;
  }

  return {
    get isExpanded() {
      return isExpanded;
    },
    set isExpanded(value: boolean) {
      isExpanded = value;
    },
    handleTouchStart,
    handleTouchMove,
    handleScroll,
    reset,
    setScrollContainer,
    toggleExpanded,
    preventBackNavigation,
  };
}
