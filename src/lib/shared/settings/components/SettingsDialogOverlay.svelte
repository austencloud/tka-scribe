<script lang="ts">
  import { quintOut } from "svelte/easing";
  import { fade } from "svelte/transition";
  import type { Snippet } from "svelte";

  interface Props {
    /** Callback when backdrop is clicked or Escape is pressed */
    onClose: () => void;
    /** Dialog content */
    children: Snippet;
  }

  let { onClose, children }: Props = $props();

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleBackdropKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    }
  }
</script>

<div
  class="settings-overlay"
  onclick={handleBackdropClick}
  onkeydown={handleBackdropKeyDown}
  role="dialog"
  aria-modal="true"
  aria-labelledby="settings-title"
  tabindex="-1"
  in:fade={{ duration: 200, easing: quintOut }}
  out:fade={{ duration: 200, easing: quintOut }}
>
  {@render children()}
</div>

<style>
  .settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--spacing-lg);

    /* Enhanced glassmorphism effect */
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.85) 100%
    );
  }

  /* Medium screens and tablets - Full takeover approach */
  @media (max-width: 768px) {
    .settings-overlay {
      padding: 0;
      align-items: stretch;
      justify-content: stretch;
      height: 100dvh;
      height: 100svh;
    }
  }

  /* Mobile portrait - optimize for touch and maximize space */
  @media (max-width: 480px) {
    .settings-overlay {
      padding: 0;
      height: 100svh;
    }
  }

  /* Ultra-narrow screens - maintain usability */
  @media (max-width: 390px) {
    .settings-overlay {
      height: 100svh;
    }
  }

  /* Height-constrained devices (landscape phones, browser chrome) */
  @media (max-height: 600px) {
    .settings-overlay {
      height: 100svh;
    }
  }

  /* Very height-constrained (landscape with browser chrome) */
  @media (max-height: 450px) {
    .settings-overlay {
      padding: 0;
      height: 100svh;
    }
  }
</style>
