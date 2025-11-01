<!--
  PasswordSection Component

  Allows users with password authentication to change their password.
  Expandable section with current/new/confirm password fields.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import {
    passwordState,
    uiState,
    resetPasswordForm,
  } from "../../state/profile-settings-state.svelte";

  let { onChangePassword, hapticService } = $props<{
    onChangePassword: () => Promise<void>;
    hapticService: IHapticFeedbackService | null;
  }>();

  function handleCancel() {
    hapticService?.trigger("selection");
    uiState.showPasswordSection = false;
    resetPasswordForm();
  }

  function handleExpand() {
    hapticService?.trigger("selection");
    uiState.showPasswordSection = true;
  }

  const isFormValid = $derived(
    passwordState.current &&
      passwordState.new &&
      passwordState.confirm &&
      !uiState.saving
  );

  const passwordMismatch = $derived(
    passwordState.new &&
      passwordState.confirm &&
      passwordState.new !== passwordState.confirm
  );
</script>

<div class="password-section">
  {#if !uiState.showPasswordSection}
    <button class="button button--secondary" onclick={handleExpand}>
      <i class="fas fa-lock" aria-hidden="true"></i>
      Change Password
    </button>
  {:else}
    <div class="password-form">
      <div class="field">
        <label class="label" for="current-password"> Current Password </label>
        <input
          id="current-password"
          type="password"
          class="input"
          bind:value={passwordState.current}
          placeholder="Enter current password"
        />
      </div>

      <div class="field">
        <label class="label" for="new-password"> New Password </label>
        <input
          id="new-password"
          type="password"
          class="input"
          bind:value={passwordState.new}
          placeholder="Enter new password"
          aria-required="true"
        />
      </div>

      <div class="field">
        <label class="label" for="confirm-password"> Confirm Password </label>
        <input
          id="confirm-password"
          type="password"
          class="input"
          bind:value={passwordState.confirm}
          placeholder="Confirm new password"
          aria-required="true"
          aria-invalid={passwordMismatch}
          aria-describedby={passwordMismatch ? "password-error" : undefined}
        />
        {#if passwordMismatch}
          <p id="password-error" class="error-message" role="alert">
            Passwords do not match
          </p>
        {/if}
      </div>

      <div class="button-row">
        <button class="button button--secondary" onclick={handleCancel}>
          Cancel
        </button>
        <button
          class="button button--primary"
          onclick={onChangePassword}
          disabled={!isFormValid}
        >
          <i class="fas fa-check" aria-hidden="true"></i>
          Update Password
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .password-section {
    margin: 0;
    padding: 0;
  }

  .password-form {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 20px;
    margin-top: 16px;
  }

  .field {
    margin-bottom: 20px;
  }

  .label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 8px;
    transition: all 0.2s ease;
  }

  .input {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 15px;
    transition: all 0.2s ease;
  }

  .input:focus {
    outline: none;
    border-color: rgba(99, 102, 241, 0.6);
    background: rgba(255, 255, 255, 0.08);
  }

  .input[aria-invalid="true"] {
    border-color: rgba(239, 68, 68, 0.6);
  }

  .input[aria-invalid="true"]:focus {
    border-color: rgba(239, 68, 68, 0.8);
  }

  .error-message {
    font-size: 13px;
    color: #ef4444;
    margin: 6px 0 0 0;
    font-weight: 500;
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

  .button--primary {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  }

  .button--primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #4f46e5, #4338ca);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
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

  .button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Accessibility - Focus Indicators */
  .input:focus-visible {
    outline: 3px solid rgba(99, 102, 241, 0.9);
    outline-offset: 2px;
  }

  .button:focus-visible {
    outline: 3px solid rgba(99, 102, 241, 0.9);
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
    .input:focus-visible {
      outline: 3px solid white;
    }

    .button:focus-visible {
      outline: 3px solid white;
    }
  }
</style>
