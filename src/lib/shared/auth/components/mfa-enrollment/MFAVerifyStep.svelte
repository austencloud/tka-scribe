<script lang="ts">
  /**
   * MFAVerifyStep
   *
   * Verification code entry to complete MFA enrollment.
   */

  import VerificationCodeInput from "../shared/VerificationCodeInput.svelte";

  interface Props {
    verificationCode: string;
    error: string | null;
    isSubmitting: boolean;
    canSubmit: boolean;
    onCodeChange: (value: string) => void;
    onSubmit: () => void;
    onBack: () => void;
  }

  let {
    verificationCode,
    error,
    isSubmitting,
    canSubmit,
    onCodeChange,
    onSubmit,
    onBack,
  }: Props = $props();
</script>

<div class="verify-step">
  <div class="header">
    <div class="icon-badge">
      <i class="fas fa-mobile-alt"></i>
    </div>
    <h3>Enter Verification Code</h3>
    <p class="instruction">
      Enter the 6-digit code from your authenticator app to verify setup.
    </p>
  </div>

  <div class="code-section">
    <VerificationCodeInput
      value={verificationCode}
      disabled={isSubmitting}
      error={!!error}
      onchange={onCodeChange}
      onsubmit={onSubmit}
    />

    {#if error}
      <p class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {error}
      </p>
    {/if}
  </div>

  <div class="actions">
    <button type="button" class="back-button" onclick={onBack} disabled={isSubmitting}>
      <i class="fas fa-arrow-left"></i>
      Back
    </button>

    <button
      type="button"
      class="verify-button"
      onclick={onSubmit}
      disabled={!canSubmit}
    >
      {#if isSubmitting}
        <span class="spinner-small"></span>
        Verifying...
      {:else}
        Verify
        <i class="fas fa-check"></i>
      {/if}
    </button>
  </div>
</div>

<style>
  .verify-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 16px;
  }

  .header {
    text-align: center;
  }

  .icon-badge {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--theme-accent, #3b82f6) 20%, transparent);
    border-radius: 16px;
    color: var(--theme-accent, #3b82f6);
    font-size: 28px;
  }

  .header h3 {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .instruction {
    margin: 0;
    font-size: 14px;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.7));
    max-width: 280px;
  }

  .code-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 12px 16px;
    background: color-mix(in srgb, var(--semantic-error, #ef4444) 15%, transparent);
    border: 1px solid var(--semantic-error, #ef4444);
    border-radius: 10px;
    color: var(--semantic-error, #ef4444);
    font-size: 14px;
  }

  .actions {
    display: flex;
    gap: 12px;
    width: 100%;
    max-width: 320px;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 20px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    color: var(--theme-text, #ffffff);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover:not(:disabled) {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
  }

  .back-button:disabled {
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
    background: linear-gradient(135deg, var(--theme-accent, #3b82f6), color-mix(in srgb, var(--theme-accent, #3b82f6) 80%, #000));
    border: none;
    border-radius: 12px;
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .verify-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--theme-accent, #3b82f6) 40%, transparent);
  }

  .verify-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .spinner-small {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
