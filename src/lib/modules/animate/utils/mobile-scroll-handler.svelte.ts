/**
 * mobile-scroll-handler.svelte.ts
 *
 * Svelte 5 composable for handling mobile scroll-to-expand behavior.
 * Provides touch and scroll event handlers for expand/collapse UX.
 */

/**
 * Creates mobile scroll handler state and event handlers
 */
export function createMobileScrollHandler() {
  let isExpanded = $state(false);
  let lastScrollTop = $state(0);
  let touchStartY = $state(0);
  let scrollContainerRef: HTMLDivElement | null = null;
  let rafId: number | null = null;

  /**
   * Handle touch start - record starting Y position for swipe detection
   */
  function handleTouchStart(e: TouchEvent, isSideBySideLayout: boolean) {
    if (!isSideBySideLayout && !isExpanded) {
      touchStartY = e.touches[0]?.pageY ?? 0;
    }
  }

  /**
   * Handle touch move - detect swipe up gesture to expand
   */
  function handleTouchMove(e: TouchEvent, isSideBySideLayout: boolean) {
    if (!isSideBySideLayout && !isExpanded && scrollContainerRef) {
      const currentY = e.touches[0]?.pageY ?? 0;
      const delta = touchStartY - currentY;

      // Swiped up more than 30px → EXPAND
      if (delta > 30) {
        isExpanded = true;
      }
    }
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
  };
}
