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
    children: Snippet
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

    // ⚡ CRITICAL: Initialize Firebase Auth listener immediately
    // This is required to catch auth state changes from social sign-in
    authStore.initialize();

    // 🧪 DEVELOPMENT: Initialize sequence restoration tester (browser console access)
    if (import.meta.env.DEV) {
      import(
        "$lib/shared/navigation/utils/test-sequence-restoration.svelte"
      ).catch((err) =>
        console.warn("⚠️ Failed to load sequence restoration tester:", err)
      );
    }

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
