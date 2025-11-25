<script lang="ts">
  import FullscreenPrompt from "$lib/shared/components/FullscreenPrompt.svelte";
  import type { Container } from "inversify";
  import type { Snippet } from "svelte";
  import { onMount, setContext } from "svelte";
  import { authStore } from "$shared/auth";
  import { registerCacheClearShortcut } from "$lib/shared/utils/cache-buster";
  import "../app.css";
  // Import modern view transitions CSS
  import "$lib/shared/transitions/view-transitions.css";

  let { children } = $props<{
    children: Snippet;
  }>();

  // Application bootstrap - simplified to just DI container setup
  let container: Container | null = $state(null);
  let containerError = $state<string | null>(null);

  // Set context immediately (will be null initially)
  setContext("di-container", () => {
    return container;
  });

  // Update viewport height on window resize and visualViewport changes
  function updateViewportHeight() {
    if (typeof window !== "undefined") {
      // Use visualViewport for accurate height that accounts for browser chrome
      const height = window.visualViewport?.height ?? window.innerHeight;
      // Update CSS custom property for use throughout the app
      document.documentElement.style.setProperty(
        "--viewport-height",
        `${height}px`
      );
    }
  }

  onMount(() => {
    // ⚡ CRITICAL: Set up viewport height IMMEDIATELY for fast render
    updateViewportHeight();

    // Listen to visualViewport resize (more reliable than window resize for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateViewportHeight);
      window.visualViewport.addEventListener("scroll", updateViewportHeight);
    }

    // Fallback to window resize for browsers that don't support visualViewport
    window.addEventListener("resize", updateViewportHeight);

    // Register cache clear shortcut (Ctrl+Shift+Delete)
    registerCacheClearShortcut();

    // ==================================================================================
    // ⚡ PWA: NUCLEAR OPTION - COMPLETELY DISABLE BROWSER BACK NAVIGATION
    // ==================================================================================

    // 1. HISTORY MANIPULATION - Prevent back button navigation entirely
    // Push an initial state and prevent going back past it
    let isHistoryLocked = false;

    const lockHistory = () => {
      if (isHistoryLocked) return;

      // Push a dummy state to prevent going back
      window.history.pushState({ preventBack: true }, '', window.location.href);
      isHistoryLocked = true;
    };

    const handlePopState = (e: PopStateEvent) => {
      // Always push forward to prevent back navigation
      window.history.pushState({ preventBack: true }, '', window.location.href);
    };

    // Lock history on page load
    lockHistory();

    // Listen for popstate (back/forward navigation attempts)
    window.addEventListener('popstate', handlePopState);

    // 2. SMART GESTURE PREVENTION - Block browser navigation, allow drawer gestures
    let gestureStartX = 0;
    let gestureStartY = 0;
    let gestureStartedInDrawer = false;

    const isInsideDrawer = (element: HTMLElement | null): boolean => {
      if (!element) return false;
      // Check if element or any parent is a drawer
      return element.closest('.drawer-content') !== null;
    };

    const handleGestureStart = (e: TouchEvent | MouseEvent): void => {
      const target = e.target as HTMLElement;
      gestureStartedInDrawer = isInsideDrawer(target);

      gestureStartX = e instanceof TouchEvent ? e.touches[0]?.clientX || 0 : e.clientX;
      gestureStartY = e instanceof TouchEvent ? e.touches[0]?.clientY || 0 : e.clientY;

      // Allow drawer gestures to pass through
      if (gestureStartedInDrawer) {
        return; // Let drawer handle it
      }

      // For non-drawer gestures, only prevent if starting near screen edge (navigation zone)
      if (gestureStartX < 30 || gestureStartX > window.innerWidth - 30) {
        e.preventDefault();
        e.stopPropagation();
      }

      return;
    };

    const handleGestureMove = (e: TouchEvent | MouseEvent): void => {
      // Allow drawer gestures completely
      if (gestureStartedInDrawer) {
        return; // Let drawer handle its own gestures
      }

      const clientX = e instanceof TouchEvent ? e.touches[0]?.clientX : e.clientX;
      const clientY = e instanceof TouchEvent ? e.touches[0]?.clientY : e.clientY;

      if (!clientX || !clientY) return;

      const deltaX = clientX - gestureStartX;
      const deltaY = clientY - gestureStartY;
      const isHorizontalGesture = Math.abs(deltaX) > Math.abs(deltaY);

      // Only block horizontal gestures that look like navigation attempts
      // (significant horizontal movement from edge or across whole screen)
      if (isHorizontalGesture && Math.abs(deltaX) > 10) {
        e.preventDefault();
        e.stopPropagation();
      }

      return;
    };

    // 3. WHEEL EVENT PREVENTION - Block trackpad swipes (except in drawers)
    const handleWheel = (e: WheelEvent): void => {
      const target = e.target as HTMLElement;
      const inDrawer = isInsideDrawer(target);

      // Allow wheel events inside drawers
      if (inDrawer) {
        return;
      }

      // Block horizontal wheel/trackpad gestures outside drawers
      if (Math.abs(e.deltaX) > 0) {
        e.preventDefault();
        e.stopPropagation();
      }

      return;
    };

    // Attach ALL event listeners with {passive: false} at capture phase
    const options = { passive: false, capture: true };

    document.addEventListener('touchstart', handleGestureStart, options);
    document.addEventListener('touchmove', handleGestureMove, options);
    document.addEventListener('mousedown', handleGestureStart, options);
    document.addEventListener('mousemove', handleGestureMove, options);
    document.addEventListener('wheel', handleWheel, options);

    // ⚡ CRITICAL: Initialize Firebase Auth listener immediately
    // This is required to catch auth state changes from social sign-in
    authStore.initialize();

    // Note: Sequence restoration tester removed (now integrated into services)

    // ⚡ PERFORMANCE: Initialize services in background without blocking render
    // This allows Vite HMR WebSocket to connect immediately
    (async () => {
      try {
        const { getContainer } = await import("$shared");
        container = await getContainer();

        // ⚡ PERFORMANCE: Load glyph cache in idle time (non-blocking)
        // Uses requestIdleCallback to defer until after critical rendering
        const initializeGlyphCache = async () => {
          if (!container) return; // Guard against null container

          try {
            const { TYPES } = await import("$shared/inversify/types");
            type IGlyphCacheService = { initialize: () => Promise<void> };
            const glyphCache = container.get<IGlyphCacheService>(
              TYPES.IGlyphCacheService
            );
            await glyphCache.initialize();
          } catch (cacheError) {
            console.warn(
              "⚠️ Glyph cache init failed (non-blocking):",
              cacheError
            );
          }
        };

        // Use requestIdleCallback if available, otherwise setTimeout with small delay
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          window.requestIdleCallback(() => {
            initializeGlyphCache();
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(initializeGlyphCache, 100);
        }
      } catch (error) {
        console.error("❌ Root layout: Failed to set up DI container:", error);
        containerError =
          error instanceof Error ? error.message : "Container setup failed";
      }
    })();

    // Return synchronous cleanup function
    return () => {
      // Clean up auth listener
      authStore.cleanup();

      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          updateViewportHeight
        );
        window.visualViewport.removeEventListener(
          "scroll",
          updateViewportHeight
        );
      }
      window.removeEventListener("resize", updateViewportHeight);

      // Clean up back navigation prevention
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('touchstart', handleGestureStart, options);
      document.removeEventListener('touchmove', handleGestureMove, options);
      document.removeEventListener('mousedown', handleGestureStart, options);
      document.removeEventListener('mousemove', handleGestureMove, options);
      document.removeEventListener('wheel', handleWheel, options);
      console.log('🗑️ PWA: Navigation prevention removed');
    };
  });
</script>

<svelte:head>
  <!-- Default title only if page doesn't set one -->
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
</svelte:head>

{#if containerError}
  <div class="error-screen">
    <h1>Critical Error</h1>
    <p>{containerError}</p>
    <button onclick={() => window.location.reload()}>Retry</button>
  </div>
{:else if container}
  <!-- Only render children when container is ready -->
  {@render children()}

  <!-- Fullscreen prompt for extreme constraints -->
  <FullscreenPrompt />
{:else}
  <!-- Brief loading while container sets up -->
  <div class="error-screen">
    <p>Setting up services...</p>
  </div>
{/if}

<style>
  .error-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    text-align: center;
  }
</style>
