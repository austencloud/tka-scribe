<script lang="ts">
  /**
   * Info Button Component
   *
   * Opens the full-screen info page modal.
   * Provides access to resources, community links, and support options.
   */

  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import { onMount } from "svelte";
  import { toggleInfo } from "../state/info-state.svelte";

  // Props
  let { onclick = () => {} }: { onclick?: () => void } = $props();

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleClick() {
    // Trigger haptic feedback for info button
    hapticService?.trigger("selection");
    toggleInfo();
    onclick();
  }
</script>

<button
  class="info-button glass-surface"
  onclick={handleClick}
  title="Resources & Support"
  aria-label="Open resources and support page"
>
  <i class="fas fa-circle-info icon-minimal"></i>
</button>

<style>
  .info-button {
    /* Match existing button sizing - WCAG AAA minimum touch target */
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(56, 189, 248, 0.3);
    background: linear-gradient(
      135deg,
      rgba(56, 189, 248, 0.15) 0%,
      rgba(6, 182, 212, 0.1) 100%
    );
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .info-button:hover {
    background: linear-gradient(
      135deg,
      rgba(56, 189, 248, 0.25) 0%,
      rgba(6, 182, 212, 0.2) 100%
    );
    border-color: rgba(56, 189, 248, 0.5);
    transform: scale(1.05);
  }

  .info-button:active {
    transform: scale(0.95);
  }

  /* Icon styling - White to match other buttons */
  .icon-minimal {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.9);
  }

  /* Accessibility */
  .info-button:focus-visible {
    outline: 2px solid rgba(99, 102, 241, 0.7);
    outline-offset: 2px;
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .info-button {
      transition: none;
    }

    .info-button:hover,
    .info-button:active {
      transform: none;
    }
  }

  /* High Contrast */
  @media (prefers-contrast: high) {
    .info-button {
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid white;
    }

    .icon-minimal {
      color: white;
      filter: none;
    }
  }
</style>
