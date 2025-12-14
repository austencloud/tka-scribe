<script lang="ts">
  /**
   * MFAChallengeModal
   *
   * Modal shown during sign-in when MFA verification is required.
   */

  import type { MultiFactorResolver } from "firebase/auth";
  import VerificationCodeInput from "./shared/VerificationCodeInput.svelte";
  import {
    createMFAChallengeState,
    type MFAChallengeState,
  } from "../state/mfa-challenge-state.svelte";
  import type { IAuthService } from "../services/contracts/IAuthService";
  import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";

  interface Props {
    isOpen: boolean;
    resolver: MultiFactorResolver;
    authService: IAuthService;
    hapticService?: IHapticFeedbackService | null;
    onSuccess: () => void;
    onCancel: () => void;
  }

  let {
    isOpen = $bindable(),
    resolver,
    authService,
    hapticService = null,
    onSuccess,
    onCancel,
  }: Props = $props();

  let challengeState: MFAChallengeState | null = $state(null);

  // Create state when modal opens
  $effect(() => {
    if (isOpen && !challengeState) {
      challengeState = createMFAChallengeState(
        authService,
        resolver,
        hapticService,
        handleSuccess,
        handleCancel
      );
    }
  });

  function handleSuccess() {
    challengeState?.cleanup();
    challengeState = null;
    isOpen = false;
    onSuccess();
  }

  function handleCancel() {
    challengeState?.cleanup();
    challengeState = null;
    isOpen = false;
    onCancel();
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="mfa-modal-title"
    tabindex="-1"
    onkeydown={(e) =>
      e.key === "Escape" && !challengeState?.isSubmitting && handleCancel()}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="modal-content"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <header class="modal-header">
        <div class="header-icon">
          <i class="fas fa-shield-alt"></i>
        </div>
        <div class="header-text">
          <h2 id="mfa-modal-title">Two-Factor Authentication</h2>
          <p>Enter the code from your authenticator app</p>
        </div>
      </header>

      <div class="modal-body">
        {#if challengeState}
          <VerificationCodeInput
            value={challengeState.verificationCode}
            disabled={challengeState.isSubmitting || challengeState.isLocked}
            error={!!challengeState.formError}
            onchange={(v) => challengeState?.setVerificationCode(v)}
            onsubmit={() => challengeState?.submitVerification()}
          />

          {#if challengeState.formError}
            <p class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {challengeState.formError}
            </p>
          {/if}

          {#if challengeState.isLocked}
            <div class="lockout-timer">
              <i class="fas fa-clock"></i>
              <span>Try again in {challengeState.lockoutTimeRemaining}s</span>
            </div>
          {/if}
        {/if}
      </div>

      <footer class="modal-footer">
        <button
          type="button"
          class="cancel-button"
          onclick={handleCancel}
          disabled={challengeState?.isSubmitting}
        >
          Cancel
        </button>

        <button
          type="button"
          class="verify-button"
          onclick={() => challengeState?.submitVerification()}
          disabled={!challengeState?.canSubmit}
        >
          {#if challengeState?.isSubmitting}
            <span class="spinner"></span>
            Verifying...
          {:else}
            Verify
          {/if}
        </button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--theme-panel-bg, #0f172a) 85%,
      transparent
    );
    backdrop-filter: blur(8px);
    z-index: 10000;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    width: 100%;
    max-width: 420px;
    margin: 16px;
    background: var(--theme-panel-bg, #1e293b);
    border: 1px solid
      color-mix(in srgb, var(--theme-accent, #3b82f6) 30%, transparent);
    border-radius: 20px;
    box-shadow: 0 20px 60px var(--theme-shadow, rgba(0, 0, 0, 0.5));
    animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 24px 24px 16px;
  }

  .header-icon {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--theme-accent, #3b82f6) 20%,
      transparent
    );
    border-radius: 14px;
    color: var(--theme-accent, #3b82f6);
    font-size: 24px;
    flex-shrink: 0;
  }

  .header-text h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .header-text p {
    margin: 4px 0 0;
    font-size: 14px;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
  }

  .modal-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 16px 24px 24px;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 12px 16px;
    background: color-mix(
      in srgb,
      var(--semantic-error, #ef4444) 15%,
      transparent
    );
    border: 1px solid var(--semantic-error, #ef4444);
    border-radius: 10px;
    color: var(--semantic-error, #ef4444);
    font-size: 14px;
    width: 100%;
  }

  .lockout-timer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: color-mix(
      in srgb,
      var(--semantic-warning, #f59e0b) 15%,
      transparent
    );
    border: 1px solid var(--semantic-warning, #f59e0b);
    border-radius: 10px;
    color: var(--semantic-warning, #f59e0b);
    font-size: 14px;
  }

  .modal-footer {
    display: flex;
    gap: 12px;
    padding: 16px 24px 24px;
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .cancel-button {
    flex: 1;
    padding: 14px 20px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    color: var(--theme-text, #ffffff);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-button:hover:not(:disabled) {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
  }

  .cancel-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .verify-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 24px;
    background: linear-gradient(
      135deg,
      var(--theme-accent, #3b82f6),
      color-mix(in srgb, var(--theme-accent, #3b82f6) 80%, #000)
    );
    border: none;
    border-radius: 12px;
    color: #ffffff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .verify-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px
      color-mix(in srgb, var(--theme-accent, #3b82f6) 40%, transparent);
  }

  .verify-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
