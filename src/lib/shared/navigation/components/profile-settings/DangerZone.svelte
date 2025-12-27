<!--
  DangerZone Component

  Handles account deletion with collapsible disclosure pattern.
  User must expand section before seeing deletion option.
  Includes GitHub-style text confirmation barrier.
-->
<script lang="ts">
  import type { IHapticFeedback } from "../../../application/services/contracts/IHapticFeedback";
  import { uiState } from "../../state/profile-settings-state.svelte";

  let { onDeleteAccount, hapticService, userIdentifier } = $props<{
    onDeleteAccount: () => Promise<void>;
    hapticService: IHapticFeedback | null;
    userIdentifier: string;
  }>();

  let isExpanded = $state(false);
  let confirmationText = $state("");

  // Require exact match of their username/email (case-insensitive)
  let isConfirmationValid = $derived(
    confirmationText.toLowerCase().trim() ===
      userIdentifier.toLowerCase().trim()
  );

  function toggleExpanded() {
    hapticService?.trigger("selection");
    isExpanded = !isExpanded;
    if (!isExpanded) {
      uiState.showDeleteConfirmation = false;
      confirmationText = "";
    }
  }

  function handleShowConfirmation() {
    hapticService?.trigger("selection");
    uiState.showDeleteConfirmation = true;
  }

  function handleCancel() {
    hapticService?.trigger("selection");
    uiState.showDeleteConfirmation = false;
    confirmationText = "";
  }

  function handleConfirmDelete() {
    if (!isConfirmationValid) return;
    hapticService?.trigger("warning");
    onDeleteAccount();
  }
</script>

<div class="danger-section">
  <!-- Collapsible trigger -->
  <button
    class="disclosure-button"
    onclick={toggleExpanded}
    aria-expanded={isExpanded}
  >
    <i
      class="fas fa-chevron-right"
      class:expanded={isExpanded}
      aria-hidden="true"
    ></i>
    <span>Account Deletion</span>
  </button>

  {#if isExpanded}
    <div class="danger-content">
      <p class="warning-text">
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        Deleting your account is permanent and cannot be undone. All your progress
        and data will be lost.
      </p>

      {#if !uiState.showDeleteConfirmation}
        <button class="button button--danger" onclick={handleShowConfirmation}>
          <i class="fas fa-trash-alt" aria-hidden="true"></i>
          Delete My Account
        </button>
      {:else}
        <div class="confirmation-box">
          <p class="confirmation-text">
            <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
            Are you absolutely sure? This action is irreversible.
          </p>

          <div class="confirmation-input-section">
            <label for="delete-confirmation" class="confirmation-label">
              To confirm, type <strong>{userIdentifier}</strong> below:
            </label>
            <input
              id="delete-confirmation"
              type="text"
              class="confirmation-input"
              class:valid={isConfirmationValid}
              placeholder={userIdentifier}
              bind:value={confirmationText}
              autocomplete="off"
              spellcheck="false"
            />
          </div>

          <div class="button-row">
            <button class="button button--secondary" onclick={handleCancel}>
              Cancel
            </button>
            <button
              class="button button--danger-confirm"
              onclick={handleConfirmDelete}
              disabled={!isConfirmationValid}
            >
              <i class="fas fa-trash-alt" aria-hidden="true"></i>
              Yes, Delete Forever
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .danger-section {
    width: 100%;
    max-width: min(900px, 85vw); /* Match SecurityTab card width */
    margin: 0 auto;
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    padding-top: clamp(20px, 3vh, 28px);
  }

  /* Disclosure Button */
  .disclosure-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 10px;
    color: rgba(239, 68, 68, 0.8);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .disclosure-button:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: rgba(239, 68, 68, 0.95);
  }

  .disclosure-button i {
    font-size: 12px;
    transition: transform 0.2s ease;
    color: rgba(239, 68, 68, 0.7);
  }

  .disclosure-button i.expanded {
    transform: rotate(90deg);
  }

  /* Danger Content */
  .danger-content {
    margin-top: 16px;
    padding: 20px;
    background: rgba(239, 68, 68, 0.04);
    border: 1px solid rgba(239, 68, 68, 0.15);
    border-radius: 12px;
  }

  .warning-text {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    line-height: 1.6;
    margin: 0 0 16px 0;
  }

  .warning-text i {
    font-size: 16px;
    color: rgba(239, 68, 68, 0.7);
    margin-top: 2px;
    flex-shrink: 0;
  }

  .confirmation-box {
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.3));
    border-radius: 10px;
    padding: 16px;
    margin-top: 12px;
  }

  .confirmation-text {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #ef4444;
    margin: 0 0 16px 0;
    font-weight: 500;
  }

  .confirmation-text i {
    font-size: 18px;
    flex-shrink: 0;
  }

  /* Confirmation Input */
  .confirmation-input-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .confirmation-label {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    line-height: 1.5;
  }

  .confirmation-label strong {
    color: #ef4444;
    font-family:
      ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    background: rgba(239, 68, 68, 0.15);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  .confirmation-input {
    width: 100%;
    padding: 12px 14px;
    font-size: 14px;
    font-family:
      ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    letter-spacing: 0.5px;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(239, 68, 68, 0.25);
    border-radius: 8px;
    color: var(--theme-text, #fff);
    outline: none;
    transition: all 0.2s ease;
  }

  .confirmation-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
    font-family: inherit;
  }

  .confirmation-input:focus {
    border-color: rgba(239, 68, 68, 0.5);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .confirmation-input.valid {
    border-color: rgba(239, 68, 68, 0.6);
    background: rgba(239, 68, 68, 0.08);
  }

  /* Buttons */
  .button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 20px;
    min-height: var(--min-touch-target);
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .button i {
    font-size: 14px;
  }

  .button--secondary {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    border: 1px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
  }

  .button--secondary:hover:not(:disabled) {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.12));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.25));
  }

  .button--danger {
    background: rgba(239, 68, 68, 0.1);
    color: rgba(239, 68, 68, 0.9);
    border: 1px solid rgba(239, 68, 68, 0.25);
  }

  .button--danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.4);
  }

  .button--danger-confirm {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 2px solid rgba(239, 68, 68, 0.4);
  }

  .button--danger-confirm:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.6);
  }

  .button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .button-row {
    display: flex;
    gap: 12px;
  }

  .button-row .button {
    flex: 1;
  }

  /* Mobile Responsive */
  @media (max-width: 480px) {
    .danger-section {
      padding-top: 16px;
    }

    .button-row {
      flex-direction: column;
    }

    .button-row .button {
      width: 100%;
    }
  }

  /* Accessibility - Focus Indicators */
  .disclosure-button:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--theme-accent) 90%, transparent);
    outline-offset: 2px;
  }

  .button:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--theme-accent) 90%, transparent);
    outline-offset: 2px;
  }

  .button--danger:focus-visible,
  .button--danger-confirm:focus-visible {
    outline: 3px solid rgba(239, 68, 68, 0.9);
    outline-offset: 2px;
  }

  /* Accessibility - Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .disclosure-button i,
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
    .disclosure-button:focus-visible,
    .button:focus-visible {
      outline: 3px solid white;
    }
  }
</style>
