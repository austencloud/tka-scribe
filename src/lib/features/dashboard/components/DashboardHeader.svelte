<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { ANIMATION_CONSTANTS } from "../domain/models/dashboard-config";

  interface Props {
    welcomeMessage: string;
    isVisible: boolean;
  }

  const { welcomeMessage, isVisible } = $props();
</script>

{#if isVisible}
  <header
    class="welcome-header"
    transition:fly={{
      y: -ANIMATION_CONSTANTS.SLIDE.sm,
      duration: ANIMATION_CONSTANTS.DURATION.normal,
      easing: cubicOut,
    }}
  >
    <h1>{welcomeMessage}</h1>
    <p>Where would you like to go?</p>
  </header>
{/if}

<style>
  .welcome-header {
    text-align: center;
    padding: 16px 0 8px;
  }

  .welcome-header h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.02em;
  }

  .welcome-header p {
    margin: 6px 0 0;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 768px) {
    .welcome-header h1 {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .welcome-header {
      padding: 12px 0 4px;
    }

    .welcome-header h1 {
      font-size: 1.25rem;
    }

    .welcome-header p {
      font-size: 0.875rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .welcome-header {
      transition: none;
    }
  }
</style>
