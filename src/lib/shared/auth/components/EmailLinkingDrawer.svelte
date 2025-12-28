<!--
  EmailLinkingDrawer Component

  A multi-step modal for linking email/password to an existing account.
  Uses Bits UI Dialog for accessibility and proper focus management.

  Steps:
  1. Form - Enter email and password
  2. Verification - Wait for email verification (with polling)
  3. Success - Confirmation that email is linked and verified
-->
<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { authState } from "../state/authState.svelte";
  import { resolve, TYPES } from "../../inversify/di";
  import type { IAuthenticator } from "../services/contracts/IAuthenticator";
  import type { IHapticFeedback } from "../../application/services/contracts/IHapticFeedback";
  import { onMount, onDestroy } from "svelte";
  import {
    createEmailLinkingState,
    type EmailLinkingState,
  } from "../state/email-linking-state.svelte";
  import EmailLinkingFormStep from "./email-linking/EmailLinkingFormStep.svelte";
  import EmailLinkingVerifyStep from "./email-linking/EmailLinkingVerifyStep.svelte";
  import EmailLinkingSuccessStep from "./email-linking/EmailLinkingSuccessStep.svelte";

  const MAX_VERIFICATION_CHECKS = 60;

  let {
    isOpen = $bindable(false),
    onSuccess,
  }: {
    isOpen?: boolean;
    onSuccess?: () => void;
  } = $props();

  // Services
  let authService = $state<IAuthenticator | null>(null);
  let hapticService = $state<IHapticFeedback | null>(null);
  let linkingState = $state<EmailLinkingState | null>(null);

  onMount(() => {
    authService = resolve<IAuthenticator>(TYPES.IAuthenticator);
    hapticService = resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  });

  onDestroy(() => {
    linkingState?.cleanup();
  });

  // Create state when services are ready and dialog opens
  $effect(() => {
    if (isOpen && authService && !linkingState) {
      const initialEmail = authState.user?.email ?? "";
      linkingState = createEmailLinkingState(
        authService,
        hapticService,
        initialEmail,
        onSuccess,
        () => {
          isOpen = false;
        }
      );
      hapticService?.trigger("selection");
    }
  });

  function handleOpenChange(open: boolean) {
    if (!open && isOpen && linkingState?.canClose) {
      linkingState.reset();
      linkingState = null;
    }
    isOpen = open;
  }

  function handleClose() {
    if (linkingState?.canClose) {
      linkingState.reset();
      linkingState = null;
      isOpen = false;
    }
  }
</script>

<DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay class="email-modal-backdrop" />
    <DialogPrimitive.Content class="email-modal-container">
      >
      {#if linkingState}
        <!-- Header -->
        <div class="modal-header">
          <div
            class="header-icon"
            class:success={linkingState.currentStep === "success"}
            class:verifying={linkingState.currentStep === "verifying"}
          >
            {#if linkingState.currentStep === "success"}
              <i class="fas fa-check-circle" aria-hidden="true"></i>
            {:else if linkingState.currentStep === "verifying"}
              <i class="fas fa-envelope-open-text" aria-hidden="true"></i>
            {:else}
              <i class="fas fa-envelope" aria-hidden="true"></i>
            {/if}
          </div>
          <div class="header-content">
            <DialogPrimitive.Title class="modal-title">
              {#if linkingState.currentStep === "success"}
                Email Linked Successfully
              {:else if linkingState.currentStep === "verifying"}
                Verify Your Email
              {:else}
                Add Email & Password
              {/if}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description class="modal-subtitle">
              {#if linkingState.currentStep === "success"}
                Your email has been verified and linked to your account
              {:else if linkingState.currentStep === "verifying"}
                We sent a verification link to <strong
                  >{linkingState.email}</strong
                >
              {:else}
                Create a password to sign in with your email
              {/if}
            </DialogPrimitive.Description>
          </div>
          {#if linkingState.canClose}
            <button class="close-btn" onclick={handleClose} aria-label="Close">
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          {/if}
        </div>

        <!-- Step Content -->
        <div class="modal-content">
          {#if linkingState.currentStep === "form"}
            <EmailLinkingFormStep
              email={linkingState.email}
              password={linkingState.password}
              showPassword={linkingState.showPassword}
              formError={linkingState.formError}
              isSubmitting={linkingState.isSubmitting}
              onEmailChange={(v) => linkingState?.setEmail(v)}
              onPasswordChange={(v) => linkingState?.setPassword(v)}
              onTogglePassword={() => linkingState?.togglePassword()}
              onSubmit={() => linkingState?.submitForm()}
              onCancel={handleClose}
            />
          {:else if linkingState.currentStep === "verifying"}
            <EmailLinkingVerifyStep
              email={linkingState.email}
              checkCount={linkingState.verificationCheckCount}
              maxChecks={MAX_VERIFICATION_CHECKS}
              resendCooldown={linkingState.resendCooldown}
              canResend={linkingState.canResend}
              formError={linkingState.formError}
              onResend={() => linkingState?.resendVerification()}
              onSkip={() => linkingState?.skipVerification()}
            />
          {:else if linkingState.currentStep === "success"}
            <EmailLinkingSuccessStep
              email={linkingState.email}
              onComplete={() => linkingState?.handleSuccess()}
            />
          {/if}
        </div>
      {/if}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
</DialogPrimitive.Root>

<style>
  /* Modal Backdrop */
  :global(.email-modal-backdrop) {
    position: fixed;
    inset: 0;
    background: color-mix(in srgb, var(--theme-shadow, #000) 70%, transparent);
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
    background: color-mix(
      in srgb,
      var(--theme-panel-bg, #19191e) 98%,
      transparent
    );
    border: 1px solid
      color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 30%, transparent);
    border-radius: 20px;
    padding: 32px;
    max-width: 480px;
    width: calc(100% - 40px);
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    box-shadow:
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 10%, transparent),
      0 20px 60px var(--theme-shadow, rgba(0, 0, 0, 0.6)),
      0 0 100px
        color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 10%, transparent);
    z-index: 1001;
    animation: modalSlideIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
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
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 15%,
      transparent
    );
    border: 1px solid
      color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 30%, transparent);
    border-radius: 14px;
    flex-shrink: 0;
  }

  .header-icon i {
    font-size: 22px;
    color: var(--theme-accent-strong, #8b5cf6);
  }

  .header-icon.verifying {
    background: color-mix(
      in srgb,
      var(--semantic-info, #3b82f6) 15%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-info, #3b82f6) 30%,
      transparent
    );
  }

  .header-icon.verifying i {
    color: var(--semantic-info, #3b82f6);
  }

  .header-icon.success {
    background: color-mix(
      in srgb,
      var(--semantic-success, #22c55e) 15%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-success, #22c55e) 30%,
      transparent
    );
  }

  .header-icon.success i {
    color: var(--semantic-success, #22c55e);
  }

  .header-content {
    flex: 1;
    min-width: 0;
  }

  :global(.modal-title) {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: color-mix(in srgb, var(--theme-text, white) 95%, transparent);
  }

  :global(.modal-subtitle) {
    margin: 6px 0 0 0;
    font-size: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    line-height: 1.5;
  }

  :global(.modal-subtitle) strong {
    color: color-mix(in srgb, var(--theme-text, white) 90%, transparent);
  }

  .close-btn {
    width: 48px; /* WCAG AAA touch target */
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .close-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: color-mix(in srgb, var(--theme-text, white) 80%, transparent);
  }

  .close-btn:focus-visible {
    outline: 2px solid var(--theme-accent-strong, rgba(139, 92, 246, 0.8));
    outline-offset: 2px;
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
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    :global(.email-modal-backdrop),
    :global(.email-modal-container) {
      animation: none;
    }
  }
</style>
