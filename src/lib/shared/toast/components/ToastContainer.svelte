<!--
  ToastContainer - Displays toast notifications

  Place this component once at the app root level.
-->
<script lang="ts">
  import { toastQueue, removeToast, type Toast } from "../state/toast-state.svelte";

  const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
    info: {
      icon: "fa-info-circle",
      color: "#60a5fa",
      bg: "rgba(59, 130, 246, 0.15)",
    },
    success: {
      icon: "fa-check-circle",
      color: "#34d399",
      bg: "rgba(16, 185, 129, 0.15)",
    },
    warning: {
      icon: "fa-exclamation-triangle",
      color: "#fbbf24",
      bg: "rgba(245, 158, 11, 0.15)",
    },
    error: {
      icon: "fa-times-circle",
      color: "#f87171",
      bg: "rgba(239, 68, 68, 0.15)",
    },
  };

  function getConfig(type: string): { icon: string; color: string; bg: string } {
    return typeConfig[type] ?? typeConfig.info!;
  }
</script>

{#if toastQueue.length > 0}
  <div class="toast-container">
    {#each toastQueue as toast (toast.id)}
      {@const config = getConfig(toast.type)}
      <div
        class="toast"
        style="--toast-color: {config.color}; --toast-bg: {config.bg}"
        role="alert"
      >
        <i class="fas {config.icon} toast-icon"></i>
        <span class="toast-message">{toast.message}</span>
        <button
          class="toast-close"
          onclick={() => removeToast(toast.id)}
          aria-label="Dismiss"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 400px;
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--toast-bg);
    border: 1px solid var(--toast-color);
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    animation: slideIn 0.25s ease-out;
    pointer-events: auto;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .toast-icon {
    font-size: 18px;
    color: var(--toast-color);
    flex-shrink: 0;
  }

  .toast-message {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.4;
  }

  .toast-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .toast-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  /* Mobile positioning */
  @media (max-width: 480px) {
    .toast-container {
      left: 12px;
      right: 12px;
      bottom: 80px; /* Above mobile nav */
      max-width: none;
    }

    .toast {
      padding: 10px 14px;
    }

    .toast-message {
      font-size: 13px;
    }
  }
</style>
