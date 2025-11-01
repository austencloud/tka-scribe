<!--
  DangerZone Component

  Handles account deletion with confirmation flow.
  Displays warning and requires two-step confirmation.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { uiState } from "../../state/profile-settings-state.svelte";

  let { onDeleteAccount, hapticService } = $props<{
    onDeleteAccount: () => Promise<void>;
    hapticService: IHapticFeedbackService | null;
  }>();

  function handleShowConfirmation() {
    hapticService?.trigger("selection");
    uiState.showDeleteConfirmation = true;
  }

  function handleCancel() {
    hapticService?.trigger("selection");
    uiState.showDeleteConfirmation = false;
  }
</script>

<div class="danger-zone">
  <h4 class="danger-title">Danger Zone</h4>
  <p class="danger-text">
    Once you delete your account, there is no going back. Please be certain.
  </p>

  {#if !uiState.showDeleteConfirmation}
    <button class="button button--danger" onclick={handleShowConfirmation}>
      <i class="fas fa-trash-alt" aria-hidden="true"></i>
      Delete Account
    </button>
  {:else}
    <div class="delete-confirmation">
      <p class="delete-warning">
        <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
        Are you sure? This action cannot be undone!
      </p>
      <div class="button-row">
        <button class="button button--secondary" onclick={handleCancel}>
          Cancel
        </button>
        <button class="button button--danger" onclick={onDeleteAccount}>
          <i class="fas fa-trash-alt" aria-hidden="true"></i>
          Yes, Delete My Account
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .danger-zone {
    background: rgba(239, 68, 68, 0.05);
    border: 2px solid rgba(239, 68, 68, 0.2);
    border-radius: 12px;
    padding: 20px;
    margin-top: 20px;
  }

  .danger-title {
    font-size: 16px;
    font-weight: 600;
    color: #ef4444;
    margin: 0 0 8px 0;
  }

  .danger-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 16px 0;
  }

  .delete-confirmation {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 16px;
  }

  .delete-warning {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #ef4444;
    margin: 0 0 16px 0;
    font-weight: 500;
  }

  .delete-warning i {
    font-size: 18px;
  }

  .button-row {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }

  .button-row .button {
    width: auto;
    flex: 1;
    margin-top: 0;
  }

  .button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 24px;
    min-height: 48px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    margin-top: 8px;
  }

  .button i {
    font-size: 16px;
  }

  .button--secondary {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .button--secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .button--danger {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 2px solid rgba(239, 68, 68, 0.3);
  }

  .button--danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Mobile Responsive */
  @media (max-width: 480px) {
    .button-row {
      flex-direction: column;
    }

    .button-row .button {
      width: 100%;
    }
  }

  /* Accessibility - Focus Indicators */
  .button:focus-visible {
    outline: 3px solid rgba(99, 102, 241, 0.9);
    outline-offset: 2px;
  }

  .button--danger:focus-visible {
    outline: 3px solid rgba(239, 68, 68, 0.9);
    outline-offset: 2px;
  }

  /* Accessibility - Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .button {
      transition: none;
    }

    .button:hover,
    .button:active {
      transform: none;
    }
  }

  /* Accessibility - High Contrast */
  @media (prefers-contrast: high) {
    .button:focus-visible {
      outline: 3px solid white;
    }

    .button--danger:focus-visible {
      outline: 3px solid white;
    }
  }
</style>
