<script lang="ts">
  /**
   * ConfirmActionModal
   * Confirmation dialog for user management actions
   */
  import { ROLE_DISPLAY } from "$lib/shared/auth/domain/models/UserRole";
  import type { ConfirmActionData } from "./types";

  interface Props {
    action: ConfirmActionData;
    isActionPending?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }

  let { action, isActionPending = false, onConfirm, onCancel }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      onCancel();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={onCancel} onkeydown={handleKeydown}>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
    <h3>Confirm Action</h3>
    <p>
      {#if action.type === "changeRole"}
        Change {action.user.displayName}'s role from
        <strong>{ROLE_DISPLAY[action.user.role].label}</strong> to
        <strong>{ROLE_DISPLAY[action.newRole ?? "user"].label}</strong>?
      {:else if action.type === "toggleDisabled"}
        {action.user.isDisabled
          ? `Enable the account for ${action.user.displayName}?`
          : `Disable the account for ${action.user.displayName}? They won't be able to sign in.`}
      {:else if action.type === "resetData"}
        Reset all progress for {action.user.displayName}? This will clear their XP, level,
        achievements, and streaks. This cannot be undone.
      {:else if action.type === "delete"}
        Permanently delete {action.user.displayName}'s profile? This cannot be undone.
      {/if}
    </p>
    <div class="modal-actions">
      <button class="cancel-btn" onclick={onCancel}>Cancel</button>
      <button
        class="confirm-btn"
        class:danger={action.type === "delete" || action.type === "resetData"}
        onclick={onConfirm}
        disabled={isActionPending}
      >
        {#if isActionPending}
          <i class="fas fa-spinner fa-spin"></i>
        {:else}
          Confirm
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
  }

  .modal {
    background: #1a1a2e;
    border-radius: 16px;
    padding: 24px;
    max-width: 400px;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
  }

  .modal p {
    margin: 0 0 24px 0;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
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
  }

  .cancel-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: rgba(255, 255, 255, 0.8);
  }

  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .confirm-btn {
    background: #3b82f6;
    border: none;
    color: white;
  }

  .confirm-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  .confirm-btn.danger {
    background: #ef4444;
  }

  .confirm-btn.danger:hover:not(:disabled) {
    background: #dc2626;
  }

  .confirm-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>
