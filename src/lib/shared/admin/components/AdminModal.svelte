<script lang="ts">
  /**
   * AdminModal
   * Confirmation modal dialog
   */

  import type { ModalVariant } from "../types/admin-component-types";

  interface AdminModalProps {
    title: string;
    message?: string;
    variant?: ModalVariant;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    class?: string;
    children?: any;
  }

  let {
    title,
    message,
    variant = "confirm",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    loading = false,
    class: className = "",
    children,
  }: AdminModalProps = $props();

  async function handleConfirm() {
    await onConfirm();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      onCancel();
    }
  }
</script>

<div
  class="modal-overlay"
  onclick={handleBackdropClick}
  onkeydown={handleKeydown}
  role="button"
  tabindex="0"
  aria-label="Close modal"
>
  <div
    class="admin-modal variant-{variant} {className}"
    role="dialog"
    aria-labelledby="modal-title"
  >
    <h3 id="modal-title" class="modal-title">{title}</h3>

    {#if children}
      <div class="modal-content">
        {@render children()}
      </div>
    {:else if message}
      <p class="modal-message">{message}</p>
    {/if}

    <div class="modal-actions">
      <button class="cancel-btn" onclick={onCancel} disabled={loading}>
        {cancelLabel}
      </button>
      <button
        class="confirm-btn"
        class:danger={variant === "danger"}
        class:warning={variant === "warning"}
        onclick={handleConfirm}
        disabled={loading}
      >
        {#if loading}
          <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
        {:else}
          {confirmLabel}
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: var(
      --sheet-backdrop-bg,
      var(--backdrop-medium, rgba(0, 0, 0, 0.7))
    );
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
  }

  .admin-modal {
    background: var(--theme-panel-elevated-bg, #1a1a2e);
    border-radius: 16px;
    padding: 24px;
    max-width: 400px;
    width: 100%;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .modal-title {
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .modal-message {
    margin: 0 0 24px 0;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    line-height: 1.5;
  }

  .modal-content {
    margin-bottom: 24px;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .cancel-btn,
  .confirm-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .cancel-btn {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
  }

  .cancel-btn:hover:not(:disabled) {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.15));
  }

  .confirm-btn {
    background: var(--theme-accent, #3b82f6);
    color: white;
  }

  .confirm-btn:hover:not(:disabled) {
    background: var(--theme-accent-strong, #2563eb);
  }

  .confirm-btn.danger {
    background: var(--semantic-error, #ef4444);
  }

  .confirm-btn.danger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--semantic-error, #ef4444) 85%, black);
  }

  .confirm-btn.warning {
    background: var(--semantic-warning, #f59e0b);
  }

  .confirm-btn.warning:hover:not(:disabled) {
    background: color-mix(in srgb, var(--semantic-warning, #f59e0b) 80%, black);
  }

  .cancel-btn:disabled,
  .confirm-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>
