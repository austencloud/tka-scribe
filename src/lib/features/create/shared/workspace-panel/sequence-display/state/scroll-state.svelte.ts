/**
 * Scroll State Factory
 *
 * Svelte 5 runes-based state management for scroll detection and auto-scroll behavior.
 */

/**
 * Create scroll state for beat grid
 */
export function createScrollState() {
  // Scroll state
  let hasVerticalScrollbar = $state(false);
  let autoScrollEnabled = $state(true);
  let scrollContainerRef = $state<HTMLElement | null>(null);

  /**
   * Check if container has vertical scrollbar
   */
  function checkScrollbar() {
    if (!scrollContainerRef) return;

    const hasScrollbar =
      scrollContainerRef.scrollHeight > scrollContainerRef.clientHeight;

    if (hasScrollbar !== hasVerticalScrollbar) {
      hasVerticalScrollbar = hasScrollbar;
    }
  }

  /**
   * Scroll to bottom of container
   */
  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    if (!scrollContainerRef || !autoScrollEnabled) return;

    setTimeout(() => {
      scrollContainerRef?.scrollTo({
        top: scrollContainerRef.scrollHeight,
        behavior,
      });
    }, 100);
  }

  /**
   * Set scroll container reference
   */
  function setScrollContainer(element: HTMLElement | null) {
    scrollContainerRef = element;
    if (element) {
      checkScrollbar();
    }
  }

  /**
   * Enable/disable auto-scroll
   */
  function setAutoScroll(enabled: boolean) {
    autoScrollEnabled = enabled;
  }

  return {
    // Getters for reactive state
    get hasVerticalScrollbar() {
      return hasVerticalScrollbar;
    },
    get autoScrollEnabled() {
      return autoScrollEnabled;
    },
    get scrollContainerRef() {
      return scrollContainerRef;
    },

    // Actions
    setScrollContainer,
    checkScrollbar,
    scrollToBottom,
    setAutoScroll,
  };
}

export type ScrollState = ReturnType<typeof createScrollState>;
