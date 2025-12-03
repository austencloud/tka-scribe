<!--
  EmailLinkingModal Component

  A multi-step modal for linking email/password to an existing account.
  Uses Bits UI Dialog for accessibility and proper focus management.

  Steps:
  1. Form - Enter email and password
  2. Verification - Wait for email verification (with polling)
  3. Success - Confirmation that email is linked and verified

  Features:
  - Centered modal with glassmorphism styling
  - Email verification with polling
  - Resend verification email
  - Haptic feedback integration
  - Accessible with proper ARIA attributes
-->
<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { authStore } from "../stores/authStore.svelte";
  import { resolve, TYPES } from "../../inversify/di";
  import type { IAuthService } from "../services/contracts/IAuthService";
  import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";
  import { onMount, onDestroy } from "svelte";

  type Step = "form" | "verifying" | "success";

  let {
    isOpen = $bindable(false),
    onSuccess,
  }: {
    isOpen?: boolean;
    onSuccess?: () => void;
  } = $props();

  // Services
  let authService = $state<IAuthService | null>(null);
  let hapticService = $state<IHapticFeedbackService | null>(null);

  // Form state
  let currentStep = $state<Step>("form");
  let emailInput = $state("");
  let passwordInput = $state("");
  let confirmPasswordInput = $state("");
  let showPassword = $state(false);
  let formError = $state<string | null>(null);
  let isSubmitting = $state(false);

  // Verification state
  let verificationCheckInterval: ReturnType<typeof setInterval> | null = null;
  let verificationCheckCount = $state(0);
  let resendCooldown = $state(0);
  let resendCooldownInterval: ReturnType<typeof setInterval> | null = null;

  const MAX_VERIFICATION_CHECKS = 60; // Check for 10 minutes (60 * 10 sec)
  const VERIFICATION_CHECK_INTERVAL_MS = 10000; // 10 seconds
  const RESEND_COOLDOWN_SECONDS = 60;

  onMount(() => {
    authService = resolve<IAuthService>(TYPES.IAuthService);
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  onDestroy(() => {
    stopVerificationPolling();
    stopResendCooldown();
  });

  // Handle open change from Bits UI
  function handleOpenChange(open: boolean) {
    if (!open && isOpen && currentStep === "form") {
      // User closed via escape or backdrop - only allow on form step
      resetForm();
    }
    if (open) {
      // Pre-fill email if user has one from social auth
      emailInput = authStore.user?.email ?? "";
      hapticService?.trigger("selection");
    }
    isOpen = open;
  }

  function resetForm() {
    currentStep = "form";
    emailInput = "";
    passwordInput = "";
    confirmPasswordInput = "";
    showPassword = false;
    formError = null;
    isSubmitting = false;
    verificationCheckCount = 0;
    stopVerificationPolling();
    stopResendCooldown();
  }

  function validateForm(): boolean {
    if (!emailInput.trim()) {
      formError = "Email is required";
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      formError = "Please enter a valid email address";
      return false;
    }

    if (passwordInput.length < 6) {
      formError = "Password must be at least 6 characters";
      return false;
    }

    if (passwordInput !== confirmPasswordInput) {
      formError = "Passwords do not match";
      return false;
    }

    return true;
  }

  async function submitForm() {
    if (!authService || isSubmitting) return;

    formError = null;

    if (!validateForm()) {
      hapticService?.trigger("error");
      return;
    }

    isSubmitting = true;
    hapticService?.trigger("selection");

    try {
      await authService.linkEmailPassword(emailInput, passwordInput);
      hapticService?.trigger("success");

      // Move to verification step
      currentStep = "verifying";
      startVerificationPolling();
      startResendCooldown();
    } catch (error: unknown) {
      console.error("Failed to link email/password:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      formError = message;
      hapticService?.trigger("error");
    } finally {
      isSubmitting = false;
    }
  }

  function startVerificationPolling() {
    stopVerificationPolling();
    verificationCheckCount = 0;

    verificationCheckInterval = setInterval(async () => {
      try {
        const isVerified = await authService?.reloadUser();

        if (isVerified) {
          stopVerificationPolling();
          currentStep = "success";
          hapticService?.trigger("success");
        } else {
          verificationCheckCount++;

          if (verificationCheckCount >= MAX_VERIFICATION_CHECKS) {
            stopVerificationPolling();
            // Don't show error, just stop polling - user can still resend
          }
        }
      } catch (error) {
        console.error("Failed to check verification status:", error);
      }
    }, VERIFICATION_CHECK_INTERVAL_MS);
  }

  function stopVerificationPolling() {
    if (verificationCheckInterval) {
      clearInterval(verificationCheckInterval);
      verificationCheckInterval = null;
    }
  }

  function startResendCooldown() {
    resendCooldown = RESEND_COOLDOWN_SECONDS;
    stopResendCooldown();

    resendCooldownInterval = setInterval(() => {
      resendCooldown--;
      if (resendCooldown <= 0) {
        stopResendCooldown();
      }
    }, 1000);
  }

  function stopResendCooldown() {
    if (resendCooldownInterval) {
      clearInterval(resendCooldownInterval);
      resendCooldownInterval = null;
    }
  }

  async function resendVerificationEmail() {
    if (!authService || resendCooldown > 0) return;

    hapticService?.trigger("selection");

    try {
      await authService.resendVerificationEmail();
      startResendCooldown();
      hapticService?.trigger("success");
    } catch (error: unknown) {
      console.error("Failed to resend verification email:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      formError = message;
      hapticService?.trigger("error");
    }
  }

  function handleSuccess() {
    hapticService?.trigger("success");
    resetForm();
    isOpen = false;
    onSuccess?.();
  }

  function handleClose() {
    if (currentStep === "form") {
      resetForm();
      isOpen = false;
    }
  }

  function handleSkipVerification() {
    hapticService?.trigger("selection");
    resetForm();
    isOpen = false;
    onSuccess?.();
  }

  // Computed
  const canResend = $derived(resendCooldown <= 0);
  const progressPercent = $derived(
    Math.min((verificationCheckCount / MAX_VERIFICATION_CHECKS) * 100, 100)
  );
  const canCloseModal = $derived(currentStep === "form");
</script>

<DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay class="email-modal-backdrop" />
    <DialogPrimitive.Content
      class="email-modal-container"
      oninteractoutside={(e) => {
        // Prevent closing during verification/success steps
        if (currentStep !== "form") {
          e.preventDefault();
        }
      }}
      onescapekeydown={(e) => {
        // Prevent closing during verification/success steps
        if (currentStep !== "form") {
          e.preventDefault();
        }
      }}
    >
      <!-- Header -->
      <div class="modal-header">
        <div class="header-icon" class:success={currentStep === "success"} class:verifying={currentStep === "verifying"}>
          {#if currentStep === "success"}
            <i class="fas fa-check-circle"></i>
          {:else if currentStep === "verifying"}
            <i class="fas fa-envelope-open-text"></i>
          {:else}
            <i class="fas fa-envelope"></i>
          {/if}
        </div>
        <div class="header-content">
          <DialogPrimitive.Title class="modal-title">
            {#if currentStep === "success"}
              Email Linked Successfully
            {:else if currentStep === "verifying"}
              Verify Your Email
            {:else}
              Add Email & Password
            {/if}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description class="modal-subtitle">
            {#if currentStep === "success"}
              Your email has been verified and linked to your account
            {:else if currentStep === "verifying"}
              We sent a verification link to <strong>{emailInput}</strong>
            {:else}
              Create a password to sign in with your email
            {/if}
          </DialogPrimitive.Description>
        </div>
        {#if canCloseModal}
          <button class="close-btn" onclick={handleClose} aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        {/if}
      </div>

      <!-- Step Content -->
      <div class="modal-content">
        {#if currentStep === "form"}
          <!-- Form Step -->
          <form class="email-form" onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
            <div class="form-group">
              <label for="email-link-email">Email Address</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope input-icon"></i>
                <input
                  id="email-link-email"
                  type="email"
                  bind:value={emailInput}
                  placeholder="you@example.com"
                  required
                  disabled={isSubmitting}
                  autocomplete="email"
                  class:has-value={emailInput.length > 0}
                />
              </div>
            </div>

            <div class="form-group">
              <label for="email-link-password">Password</label>
              <div class="input-wrapper">
                <i class="fas fa-lock input-icon"></i>
                <input
                  id="email-link-password"
                  type={showPassword ? "text" : "password"}
                  bind:value={passwordInput}
                  placeholder="At least 6 characters"
                  required
                  minlength="6"
                  disabled={isSubmitting}
                  autocomplete="new-password"
                  class:has-value={passwordInput.length > 0}
                />
                <button
                  type="button"
                  class="toggle-password"
                  onclick={() => showPassword = !showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isSubmitting}
                >
                  <i class="fas {showPassword ? 'fa-eye-slash' : 'fa-eye'}"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="email-link-confirm">Confirm Password</label>
              <div class="input-wrapper">
                <i class="fas fa-lock input-icon"></i>
                <input
                  id="email-link-confirm"
                  type={showPassword ? "text" : "password"}
                  bind:value={confirmPasswordInput}
                  placeholder="Confirm your password"
                  required
                  minlength="6"
                  disabled={isSubmitting}
                  autocomplete="new-password"
                  class:has-value={confirmPasswordInput.length > 0}
                />
              </div>
              {#if confirmPasswordInput.length > 0 && passwordInput !== confirmPasswordInput}
                <span class="field-hint error">Passwords don't match</span>
              {:else if confirmPasswordInput.length > 0 && passwordInput === confirmPasswordInput}
                <span class="field-hint success">
                  <i class="fas fa-check"></i> Passwords match
                </span>
              {/if}
            </div>

            {#if formError}
              <div class="form-error" role="alert">
                <i class="fas fa-exclamation-circle"></i>
                <span>{formError}</span>
              </div>
            {/if}

            <div class="form-actions">
              <button type="button" class="cancel-btn" onclick={handleClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" class="submit-btn" disabled={isSubmitting} aria-busy={isSubmitting}>
                {#if isSubmitting}
                  <i class="fas fa-spinner fa-spin"></i>
                  <span>Linking...</span>
                {:else}
                  <i class="fas fa-link"></i>
                  <span>Link Email</span>
                {/if}
              </button>
            </div>
          </form>

        {:else if currentStep === "verifying"}
          <!-- Verification Step -->
          <div class="verification-content">
            <div class="verification-animation">
              <div class="email-icon-container">
                <i class="fas fa-envelope"></i>
                <div class="pulse-ring"></div>
                <div class="pulse-ring delay"></div>
              </div>
            </div>

            <div class="verification-instructions">
              <p>Click the link in the email we sent to verify your address.</p>
              <p class="hint">Check your spam folder if you don't see it.</p>
            </div>

            <div class="verification-status">
              <div class="status-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Waiting for verification...</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style:width="{progressPercent}%"></div>
              </div>
            </div>

            <div class="resend-section">
              <p>Didn't receive the email?</p>
              <button
                class="resend-btn"
                onclick={resendVerificationEmail}
                disabled={!canResend}
              >
                {#if resendCooldown > 0}
                  <i class="fas fa-clock"></i>
                  <span>Resend in {resendCooldown}s</span>
                {:else}
                  <i class="fas fa-paper-plane"></i>
                  <span>Resend Verification Email</span>
                {/if}
              </button>
            </div>

            {#if formError}
              <div class="form-error" role="alert">
                <i class="fas fa-exclamation-circle"></i>
                <span>{formError}</span>
              </div>
            {/if}

            <button class="skip-btn" onclick={handleSkipVerification}>
              I'll verify later
            </button>
          </div>

        {:else if currentStep === "success"}
          <!-- Success Step -->
          <div class="success-content">
            <div class="success-animation">
              <div class="success-checkmark">
                <i class="fas fa-check"></i>
              </div>
            </div>

            <div class="success-message">
              <p>You can now sign in using:</p>
              <div class="credential-display">
                <i class="fas fa-envelope"></i>
                <span>{emailInput}</span>
              </div>
            </div>

            <button class="done-btn" onclick={handleSuccess}>
              <i class="fas fa-check"></i>
              <span>Done</span>
            </button>
          </div>
        {/if}
      </div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
</DialogPrimitive.Root>

<style>
  /* Modal Backdrop */
  :global(.email-modal-backdrop) {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
  }

  /* Modal Container */
  :global(.email-modal-container) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(25, 25, 30, 0.98);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 20px;
    padding: 32px;
    max-width: 480px;
    width: calc(100% - 40px);
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    box-shadow:
      0 0 0 1px rgba(139, 92, 246, 0.1),
      0 20px 60px rgba(0, 0, 0, 0.6),
      0 0 100px rgba(139, 92, 246, 0.1);
    z-index: 1001;
    animation: modalSlideIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translate(-50%, -48%) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  /* Header */
  .modal-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }

  .header-icon {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(139, 92, 246, 0.15);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 14px;
    flex-shrink: 0;
  }

  .header-icon i {
    font-size: 22px;
    color: #8b5cf6;
  }

  .header-icon.verifying {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .header-icon.verifying i {
    color: #3b82f6;
  }

  .header-icon.success {
    background: rgba(34, 197, 94, 0.15);
    border-color: rgba(34, 197, 94, 0.3);
  }

  .header-icon.success i {
    color: #22c55e;
  }

  .header-content {
    flex: 1;
    min-width: 0;
  }

  :global(.modal-title) {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  :global(.modal-subtitle) {
    margin: 6px 0 0 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
  }

  :global(.modal-subtitle) strong {
    color: rgba(255, 255, 255, 0.9);
  }

  .close-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }

  /* Form Styles */
  .email-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-icon {
    position: absolute;
    left: 14px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
    transition: color 0.2s ease;
    pointer-events: none;
  }

  .input-wrapper:focus-within .input-icon {
    color: #8b5cf6;
  }

  .form-group input {
    width: 100%;
    padding: 14px 14px 14px 44px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 15px;
    transition: all 0.2s ease;
  }

  .form-group input::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }

  .form-group input:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .form-group input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-password {
    position: absolute;
    right: 10px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .toggle-password:hover:not(:disabled) {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.1);
  }

  .toggle-password:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .field-hint {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .field-hint.error {
    color: #ef4444;
  }

  .field-hint.success {
    color: #22c55e;
  }

  .form-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    color: #fca5a5;
    font-size: 14px;
    line-height: 1.4;
  }

  .form-error i {
    color: #ef4444;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  .cancel-btn {
    flex: 1;
    padding: 14px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .cancel-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .submit-btn {
    flex: 1.5;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  /* Verification Step */
  .verification-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    text-align: center;
    padding: 8px 0;
  }

  .verification-animation {
    position: relative;
  }

  .email-icon-container {
    position: relative;
    width: 88px;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.15);
    border-radius: 50%;
  }

  .email-icon-container i {
    font-size: 36px;
    color: #3b82f6;
  }

  .pulse-ring {
    position: absolute;
    inset: 0;
    border: 2px solid rgba(59, 130, 246, 0.4);
    border-radius: 50%;
    animation: pulse-ring 2s ease-out infinite;
  }

  .pulse-ring.delay {
    animation-delay: 1s;
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1.6);
      opacity: 0;
    }
  }

  .verification-instructions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .verification-instructions p {
    margin: 0;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.8);
  }

  .verification-instructions .hint {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }

  .verification-status {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  .status-indicator i {
    color: #3b82f6;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .resend-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .resend-section p {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }

  .resend-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .resend-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .resend-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .skip-btn {
    padding: 10px 20px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.2s ease;
  }

  .skip-btn:hover {
    color: rgba(255, 255, 255, 0.7);
  }

  /* Success Step */
  .success-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    text-align: center;
    padding: 8px 0;
  }

  .success-animation {
    position: relative;
  }

  .success-checkmark {
    width: 88px;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(34, 197, 94, 0.15);
    border-radius: 50%;
    animation: success-pop 0.4s ease-out;
  }

  .success-checkmark i {
    font-size: 40px;
    color: #22c55e;
  }

  @keyframes success-pop {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .success-message {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .success-message p {
    margin: 0;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.7);
  }

  .credential-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 24px;
    background: rgba(139, 92, 246, 0.15);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
  }

  .credential-display i {
    color: #8b5cf6;
    font-size: 16px;
  }

  .credential-display span {
    font-size: 15px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.95);
  }

  .done-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    max-width: 220px;
    padding: 14px 28px;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .done-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
  }

  .done-btn:active {
    transform: translateY(0);
  }

  /* Responsive */
  @media (max-width: 480px) {
    :global(.email-modal-container) {
      padding: 24px 20px;
      border-radius: 16px;
    }

    .modal-header {
      gap: 12px;
    }

    .header-icon {
      width: 44px;
      height: 44px;
    }

    .header-icon i {
      font-size: 18px;
    }

    :global(.modal-title) {
      font-size: 18px;
    }

    .form-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .submit-btn {
      flex: none;
      width: 100%;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    :global(.email-modal-backdrop),
    :global(.email-modal-container),
    .pulse-ring,
    .success-checkmark,
    .progress-fill {
      animation: none;
    }

    .submit-btn:hover:not(:disabled),
    .done-btn:hover {
      transform: none;
    }
  }

  /* Focus States */
  .close-btn:focus-visible,
  .cancel-btn:focus-visible,
  .submit-btn:focus-visible,
  .resend-btn:focus-visible,
  .skip-btn:focus-visible,
  .done-btn:focus-visible,
  .toggle-password:focus-visible {
    outline: 2px solid rgba(139, 92, 246, 0.8);
    outline-offset: 2px;
  }
</style>
