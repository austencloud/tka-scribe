<script lang="ts">
  import { slide } from "svelte/transition";

  // ✅ PURE RUNES: Props using modern Svelte 5 runes
  const {
    show = false,
    message = "",
    type = "error",
    dismissible = true,
    onDismiss = () => {},
    onRetry = null,
  } = $props<{
    show?: boolean;
    message?: string;
    type?: "error" | "warning" | "info";
    dismissible?: boolean;
    onDismiss?: () => void;
    onRetry?: (() => void) | null;
  }>();

  // Color schemes for different types
  const colorSchemes = {
    error: {
      bg: "rgba(239, 68, 68, 0.1)",
      border: "rgba(239, 68, 68, 0.3)",
      text: "#dc2626",
    },
    warning: {
      bg: "rgba(245, 158, 11, 0.1)",
      border: "rgba(245, 158, 11, 0.3)",
      text: "#d97706",
    },
    info: {
      bg: "rgba(59, 130, 246, 0.1)",
      border: "rgba(59, 130, 246, 0.3)",
      text: "#2563eb",
    },
  };

  const scheme = colorSchemes[type as keyof typeof colorSchemes];
</script>

<!-- Error banner -->
{#if show}
  <div 
    class="error-banner" 
    transition:slide
    style="--bg-color: {scheme.bg}; --border-color: {scheme.border}; --text-color: {scheme.text}"
  >
    <div class="error-content">
      <span class="error-message">{message}</span>
      
      <div class="error-actions">
        {#if onRetry}
          <button class="error-retry" onclick={onRetry}>
            Retry
          </button>
        {/if}
        
        {#if dismissible}
          <button class="error-dismiss" onclick={onDismiss}>
            ✕
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .error-banner {
    flex-shrink: 0;
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin: var(--spacing-md);
    padding: var(--spacing-md);
    z-index: 100;
  }

  .error-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
  }

  .error-message {
    color: var(--text-color);
    font-weight: 500;
    flex: 1;
  }

  .error-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .error-retry {
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 4px;
    transition: all 0.2s;
  }

  .error-retry:hover {
    background: var(--border-color);
  }

  .error-dismiss {
    background: none;
    border: none;
    color: var(--text-color);
    font-size: 1.2rem;
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .error-dismiss:hover {
    background: var(--bg-color);
  }
</style>