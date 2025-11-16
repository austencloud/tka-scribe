<!-- Toast.svelte - Temporary notification for save status -->
<script lang="ts">
  let {
    message = "",
    show = false,
    duration = 3000,
  } = $props<{
    message?: string;
    show?: boolean;
    duration?: number;
  }>();

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isVisible = $state(false);

  $effect(() => {
    if (show) {
      isVisible = true;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        isVisible = false;
      }, duration);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  });
</script>

{#if isVisible}
  <div class="toast" role="status" aria-live="polite">
    <i class="fas fa-check-circle"></i>
    <span>{message}</span>
  </div>
{/if}

<style>
  /* iOS-Native Toast Notification */
  .toast {
    position: fixed;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 65px); /* Above tab bar */
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 16px;
    background: rgba(34, 197, 94, 0.92); /* iOS system green */
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-radius: 12px; /* iOS corner radius */
    color: white;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.24px; /* iOS tracking */
    box-shadow:
      0 8px 16px rgba(0, 0, 0, 0.25),
      0 2px 4px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    pointer-events: none;
    /* iOS spring animation */
    animation: ios-toast-spring 0.5s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  .toast i {
    font-size: 17px;
  }

  /* iOS Spring Animation */
  @keyframes ios-toast-spring {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(30px) scale(0.9);
    }
    50% {
      opacity: 1;
      transform: translateX(-50%) translateY(-4px) scale(1.02);
    }
    100% {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  /* Desktop positioning */
  @media (min-width: 769px) {
    .toast {
      bottom: 24px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .toast {
      animation: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .toast {
      background: rgba(34, 197, 94, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
  }
</style>
