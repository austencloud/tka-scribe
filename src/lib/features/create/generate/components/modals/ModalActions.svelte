<!--
ModalActions.svelte - Premium modal action buttons
Provides consistent, beautiful button layouts for modal actions
-->
<script lang="ts">
  let {
    onCancel,
    onConfirm,
    cancelLabel = "Cancel",
    confirmLabel = "Confirm",
    confirmDisabled = false,
    confirmVariant = "primary" as "primary" | "success" | "danger",
  } = $props<{
    onCancel: () => void;
    onConfirm: () => void;
    cancelLabel?: string;
    confirmLabel?: string;
    confirmDisabled?: boolean;
    confirmVariant?: "primary" | "success" | "danger";
  }>();
</script>

<div class="modal-actions">
  <button class="action-button cancel-button" onclick={onCancel} type="button">
    {cancelLabel}
  </button>
  <button
    class="action-button confirm-button {confirmVariant}"
    onclick={onConfirm}
    disabled={confirmDisabled}
    type="button"
  >
    {confirmLabel}
  </button>
</div>

<style>
  .modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  .action-button {
    flex: 1;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    position: relative;
    overflow: hidden;
    letter-spacing: 0.01em;
  }

  .action-button::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at center,
      var(--theme-stroke-strong, rgba(255, 255, 255, 0.2)) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .action-button:hover::before {
    opacity: 1;
  }

  .cancel-button {
    background: linear-gradient(
      135deg,
      var(--theme-stroke, rgba(255, 255, 255, 0.1)),
      var(--theme-card-bg, rgba(255, 255, 255, 0.05))
    );
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.2));
  }

  .cancel-button:hover {
    background: linear-gradient(
      135deg,
      var(--theme-card-hover-bg, rgba(255, 255, 255, 0.15)),
      var(--theme-stroke, rgba(255, 255, 255, 0.08))
    );
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.3));
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--theme-shadow, rgba(0, 0, 0, 0.1));
  }

  .cancel-button:active {
    transform: translateY(0);
  }

  .confirm-button {
    color: var(--theme-text, white);
    font-weight: 700;
  }

  .confirm-button.primary {
    background: linear-gradient(
      135deg,
      var(--theme-accent, #3b82f6),
      color-mix(in srgb, var(--theme-accent, #3b82f6) 85%, #1e40af)
    );
    box-shadow: 0 2px 8px
      color-mix(in srgb, var(--theme-accent, #3b82f6) 30%, transparent);
  }

  .confirm-button.primary:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #3b82f6) 85%, #1e40af),
      color-mix(in srgb, var(--theme-accent, #3b82f6) 70%, #1e3a8a)
    );
    transform: translateY(-2px);
    box-shadow:
      0 6px 20px
        color-mix(in srgb, var(--theme-accent, #3b82f6) 40%, transparent),
      0 0 0 1px var(--theme-stroke, rgba(255, 255, 255, 0.2)) inset;
  }

  .confirm-button.success {
    background: linear-gradient(
      135deg,
      var(--semantic-success, #10b981),
      color-mix(in srgb, var(--semantic-success, #10b981) 85%, #065f46)
    );
    box-shadow: 0 2px 8px
      color-mix(in srgb, var(--semantic-success, #10b981) 30%, transparent);
  }

  .confirm-button.success:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-success, #10b981) 85%, #065f46),
      color-mix(in srgb, var(--semantic-success, #10b981) 70%, #064e3b)
    );
    transform: translateY(-2px);
    box-shadow:
      0 6px 20px
        color-mix(in srgb, var(--semantic-success, #10b981) 40%, transparent),
      0 0 0 1px var(--theme-stroke, rgba(255, 255, 255, 0.2)) inset;
  }

  .confirm-button.danger {
    background: linear-gradient(
      135deg,
      var(--semantic-error, #ef4444),
      color-mix(in srgb, var(--semantic-error, #ef4444) 85%, #7f1d1d)
    );
    box-shadow: 0 2px 8px
      color-mix(in srgb, var(--semantic-error, #ef4444) 30%, transparent);
  }

  .confirm-button.danger:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-error, #ef4444) 85%, #7f1d1d),
      color-mix(in srgb, var(--semantic-error, #ef4444) 70%, #7f1d1d)
    );
    transform: translateY(-2px);
    box-shadow:
      0 6px 20px
        color-mix(in srgb, var(--semantic-error, #ef4444) 40%, transparent),
      0 0 0 1px var(--theme-stroke, rgba(255, 255, 255, 0.2)) inset;
  }

  .confirm-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .confirm-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: saturate(0.5);
  }

  @media (max-width: 640px) {
    .action-button {
      padding: 11px 16px;
      font-size: 14px;
    }
  }
</style>
