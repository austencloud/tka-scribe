<!--
  PasswordSection Component

  Allows users with password authentication to change their password.
  Modern design with show/hide toggles instead of confirm field.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "../../../application/services/contracts/IHapticFeedbackService";
  import {
    passwordState,
    resetPasswordForm,
    uiState,
  } from "../../state/profile-settings-state.svelte";

  let { onChangePassword, hapticService } = $props<{
    onChangePassword: () => Promise<void>;
    hapticService: IHapticFeedbackService | null;
  }>();

  // Password visibility toggles
  let showCurrentPassword = $state(false);
  let showNewPassword = $state(false);

  function handleCancel() {
    hapticService?.trigger("selection");
    uiState.showPasswordSection = false;
    resetPasswordForm();
    showCurrentPassword = false;
    showNewPassword = false;
  }

  function handleExpand() {
    hapticService?.trigger("selection");
    uiState.showPasswordSection = true;
  }

  function toggleCurrentPassword() {
    hapticService?.trigger("selection");
    showCurrentPassword = !showCurrentPassword;
  }

  function toggleNewPassword() {
    hapticService?.trigger("selection");
    showNewPassword = !showNewPassword;
  }

  const isFormValid = $derived(
    passwordState.new &&
      passwordState.new.length >= 8 &&
      !uiState.saving
  );

  const isPasswordWeak = $derived(
    passwordState.new && passwordState.new.length < 8
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
        <label class="label" for="current-password">
          Current Password <span class="optional">(optional)</span>
        </label>
        <div class="input-wrapper">
          <input
            id="current-password"
            type={showCurrentPassword ? "text" : "password"}
            class="input input-with-toggle"
            bind:value={passwordState.current}
            placeholder="Enter current password (fallback)"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="toggle-visibility"
            onclick={toggleCurrentPassword}
            aria-label={showCurrentPassword ? "Hide password" : "Show password"}
          >
            <i
              class="fas {showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}"
              aria-hidden="true"
            ></i>
          </button>
        </div>
        <p class="hint-message subtle">
          If you have passkeys enabled, you can leave this blank and verify with your device.
        </p>
      </div>

      <div class="field">
        <label class="label" for="new-password"> New Password </label>
        <div class="input-wrapper">
          <input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            class="input input-with-toggle"
            bind:value={passwordState.new}
            placeholder="Enter new password"
            aria-required="true"
            aria-invalid={isPasswordWeak ? "true" : "false"}
            aria-describedby={isPasswordWeak ? "password-hint" : undefined}
            autocomplete="new-password"
          />
          <button
            type="button"
            class="toggle-visibility"
            onclick={toggleNewPassword}
            aria-label={showNewPassword ? "Hide password" : "Show password"}
          >
            <i
              class="fas {showNewPassword ? 'fa-eye-slash' : 'fa-eye'}"
              aria-hidden="true"
            ></i>
          </button>
        </div>
        {#if isPasswordWeak}
          <p id="password-hint" class="hint-message" role="status">
            Password must be at least 8 characters
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
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
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
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
    margin-bottom: 8px;
    transition: all 0.2s ease;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input {
    width: 100%;
    padding: 12px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    font-size: 15px;
    transition: all 0.2s ease;
  }

  .input-with-toggle {
    padding-right: 50px;
  }

  .toggle-visibility {
    position: absolute;
    right: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-visibility:hover {
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.05));
  }

  .toggle-visibility:active {
    transform: scale(0.95);
  }

  .toggle-visibility i {
    font-size: 16px;
  }

  .input:focus {
    outline: none;
    border-color: color-mix(in srgb, var(--theme-accent, #6366f1) 60%, transparent);
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
  }

  .input[aria-invalid="true"] {
    border-color: rgba(251, 191, 36, 0.6);
  }

  .input[aria-invalid="true"]:focus {
    border-color: rgba(251, 191, 36, 0.8);
  }

  .hint-message {
    font-size: 13px;
    color: rgba(251, 191, 36, 0.9);
    margin: 6px 0 0 0;
    font-weight: 500;
  }

  .hint-message.subtle {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.55));
    font-weight: 500;
  }

  .optional {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.55));
    font-weight: 500;
    font-size: 12px;
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
    min-height: 52px;
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
    background: linear-gradient(
      135deg,
      var(--theme-accent, #6366f1),
      var(--theme-accent-strong, #4f46e5)
    );
    color: white;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--theme-accent, #6366f1) 30%, transparent);
  }

  .button--primary:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--theme-accent, #6366f1) 40%, transparent);
  }

  .button--secondary {
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 15%, transparent);
    color: var(--theme-accent, #a5b4fc);
    border: 1px solid color-mix(in srgb, var(--theme-accent, #6366f1) 40%, transparent);
  }

  .button--secondary:hover:not(:disabled) {
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 25%, transparent);
    border-color: color-mix(in srgb, var(--theme-accent, #6366f1) 60%, transparent);
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
    outline: 3px solid var(--theme-accent, rgba(99, 102, 241, 0.9));
    outline-offset: 2px;
  }

  .button:focus-visible,
  .toggle-visibility:focus-visible {
    outline: 3px solid var(--theme-accent, rgba(99, 102, 241, 0.9));
    outline-offset: 2px;
  }

  /* Accessibility - Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .button,
    .toggle-visibility {
      transition: none;
    }

    .button:hover,
    .button:active,
    .toggle-visibility:active {
      transform: none;
    }
  }

  /* Accessibility - High Contrast */
  @media (prefers-contrast: high) {
    .input:focus-visible {
      outline: 3px solid white;
    }

    .button:focus-visible,
    .toggle-visibility:focus-visible {
      outline: 3px solid white;
    }
  }
</style>
