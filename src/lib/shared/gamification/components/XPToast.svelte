<script lang="ts">
  /**
   * XP Toast
   *
   * Lightweight, subtle notification for XP gains.
   * Appears briefly (2.5 seconds) with a gentle fade animation.
   */

  import { xpToastQueue, removeXPToast } from "../state/xp-toast-state.svelte";

  // Track which toasts are currently animating out
  let exitingToasts = $state<Set<string>>(new Set());

  // Auto-remove toasts after display time
  $effect(() => {
    for (const toast of xpToastQueue) {
      if (!exitingToasts.has(toast.id)) {
        // Start exit animation after 2.5 seconds
        setTimeout(() => {
          exitingToasts.add(toast.id);
          exitingToasts = new Set(exitingToasts);

          // Actually remove after animation completes
          setTimeout(() => {
            removeXPToast(toast.id);
            exitingToasts.delete(toast.id);
            exitingToasts = new Set(exitingToasts);
          }, 300);
        }, 1500);
      }
    }
  });
</script>

<div class="xp-toast-container">
  {#each xpToastQueue as toast (toast.id)}
    <div
      class="xp-toast"
      class:exiting={exitingToasts.has(toast.id)}
      role="status"
      aria-live="polite"
    >
      <span class="xp-icon">+</span>
      <span class="xp-amount">{toast.amount}</span>
      <span class="xp-label">XP</span>
    </div>
  {/each}
</div>

<style>
  .xp-toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2100;
    display: flex;
    flex-direction: column-reverse;
    gap: 6px;
    pointer-events: none;
  }

  .xp-toast {
    display: flex;
    align-items: center;
    gap: 1px;
    padding: 6px 12px;
    background: color-mix(in srgb, var(--theme-shadow, #000) 75%, transparent);
    backdrop-filter: blur(8px);
    border-radius: 16px;
    border: 1px solid
      color-mix(in srgb, var(--theme-accent, #6366f1) 40%, transparent);
    box-shadow: 0 2px 8px var(--theme-shadow, rgba(0, 0, 0, 0.2));
    animation: fadeInUp 0.3s ease-out;
  }

  .xp-toast.exiting {
    animation: fadeOutDown 0.3s ease-in forwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeOutDown {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-4px);
    }
  }

  .xp-icon {
    font-size: 14px;
    font-weight: 600;
    color: color-mix(in srgb, var(--theme-accent, #6366f1) 90%, transparent);
  }

  .xp-amount {
    font-size: 16px;
    font-weight: 700;
    color: color-mix(in srgb, var(--theme-text, white) 95%, transparent);
  }

  .xp-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    margin-left: 2px;
  }

  /* Mobile positioning */
  @media (max-width: 768px) {
    .xp-toast-container {
      bottom: 80px; /* Above mobile nav */
      right: 16px;
    }

    .xp-toast {
      padding: 5px 10px;
    }

    .xp-amount {
      font-size: 14px;
    }

    .xp-label {
      font-size: 11px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .xp-toast {
      animation: fadeIn 0.15s ease;
    }

    .xp-toast.exiting {
      animation: fadeOut 0.15s ease forwards;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  }
</style>
