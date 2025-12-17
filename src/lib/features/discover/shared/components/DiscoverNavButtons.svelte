<!--
Discover Navigation Buttons - Back/Forward for in-module navigation

Shows back and forward buttons when navigation history exists.
Integrates with discoverNavigationState for proper navigation flow.
-->
<script lang="ts">
  import {
    discoverNavigationState,
    type DiscoverLocation,
  } from "../state/discover-navigation-state.svelte";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  const { onNavigate } = $props<{
    onNavigate: (location: DiscoverLocation) => void;
  }>();

  let hapticService: IHapticFeedbackService | null = null;

  onMount(() => {
    hapticService = tryResolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  const canGoBack = $derived(discoverNavigationState.canGoBack);
  const canGoForward = $derived(discoverNavigationState.canGoForward);

  // Only show nav buttons if there's any history to navigate
  const showNavButtons = $derived(canGoBack || canGoForward);

  function handleBack() {
    const location = discoverNavigationState.goBack();
    if (location) {
      hapticService?.trigger("selection");
      onNavigate(location);
    }
  }

  function handleForward() {
    const location = discoverNavigationState.goForward();
    if (location) {
      hapticService?.trigger("selection");
      onNavigate(location);
    }
  }
</script>

{#if showNavButtons}
  <div class="nav-buttons">
    <button
      class="nav-button"
      onclick={handleBack}
      disabled={!canGoBack}
      aria-label="Go back"
      title="Go back"
    >
      <i class="fas fa-chevron-left"></i>
    </button>
    <button
      class="nav-button"
      onclick={handleForward}
      disabled={!canGoForward}
      aria-label="Go forward"
      title="Go forward"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>
{/if}

<style>
  .nav-buttons {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  /* 50px minimum touch target for accessibility */
  .nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    background: var(--theme-card-bg, #252532);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nav-button:hover:not(:disabled) {
    background: var(--theme-card-hover-bg, #2d2d3d);
    color: var(--theme-text, #fff);
  }

  .nav-button:active:not(:disabled) {
    transform: scale(0.95);
  }

  .nav-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .nav-button {
      transition: none;
    }

    .nav-button:active:not(:disabled) {
      transform: none;
    }
  }
</style>
