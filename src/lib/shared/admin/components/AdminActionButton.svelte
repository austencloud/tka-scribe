<script lang="ts">
  /**
   * AdminActionButton
   * Styled action button with variants
   */

  import type { AdminVariant } from "../types/admin-component-types";

  interface AdminActionButtonProps {
    variant?: AdminVariant;
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    class?: string;
    onclick?: () => void;
    children: any;
  }

  let {
    variant = "primary",
    icon,
    loading = false,
    disabled = false,
    fullWidth = false,
    class: className = "",
    onclick,
    children,
  }: AdminActionButtonProps = $props();
</script>

<button
  class="admin-action-btn variant-{variant} {className}"
  class:full-width={fullWidth}
  {onclick}
  disabled={disabled || loading}
>
  {#if loading}
    <i class="fas fa-spinner fa-spin"></i>
  {:else if icon}
    <i class="fas {icon}"></i>
  {/if}
  <span>{@render children()}</span>
</button>

<style>
  .admin-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 18px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: var(--min-touch-target); /* Touch target */
  }

  @media (min-width: 480px) {
    .admin-action-btn {
      padding: 10px 20px;
      border-radius: 8px;
    }
  }

  .admin-action-btn:active:not(:disabled) {
    transform: scale(0.97);
  }

  .admin-action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .admin-action-btn.full-width {
    width: 100%;
  }

  /* Primary variant */
  .variant-primary {
    background: #3b82f6;
    color: white;
  }

  @media (hover: hover) {
    .variant-primary:hover:not(:disabled) {
      background: #2563eb;
    }
  }

  /* Secondary variant */
  .variant-secondary {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.2));
  }

  @media (hover: hover) {
    .variant-secondary:hover:not(:disabled) {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.15));
    }
  }

  /* Warning variant */
  .variant-warning {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  @media (hover: hover) {
    .variant-warning:hover:not(:disabled) {
      background: rgba(245, 158, 11, 0.25);
    }
  }

  /* Danger variant */
  .variant-danger {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  @media (hover: hover) {
    .variant-danger:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.25);
    }
  }

  /* Info variant */
  .variant-info {
    background: color-mix(in srgb, var(--theme-accent) 15%, transparent);
    color: var(--theme-accent, #a5b4fc);
    border: 1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent);
  }

  .variant-info:hover:not(:disabled) {
    background: color-mix(in srgb, var(--theme-accent) 25%, transparent);
  }
</style>
