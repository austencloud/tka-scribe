<script lang="ts">
  /**
   * MFAEnrollmentDrawer
   *
   * Multi-step drawer for TOTP enrollment.
   * Uses Drawer component for mobile-friendly UX.
   */

  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import MFASetupStep from "./mfa-enrollment/MFASetupStep.svelte";
  import MFAVerifyStep from "./mfa-enrollment/MFAVerifyStep.svelte";
  import MFASuccessStep from "./mfa-enrollment/MFASuccessStep.svelte";
  import {
    createMFAEnrollmentState,
    type MFAEnrollmentState,
  } from "../state/mfa-enrollment-state.svelte";
  import type { IAuthService } from "../services/contracts/IAuthService";
  import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";

  interface Props {
    isOpen: boolean;
    authService: IAuthService;
    hapticService?: IHapticFeedbackService | null;
    onClose: () => void;
    onSuccess?: () => void;
  }

  let {
    isOpen = $bindable(),
    authService,
    hapticService = null,
    onClose,
    onSuccess,
  }: Props = $props();

  let enrollmentState: MFAEnrollmentState | null = $state(null);

  // Create state when drawer opens
  $effect(() => {
    if (isOpen && !enrollmentState) {
      enrollmentState = createMFAEnrollmentState(
        authService,
        hapticService,
        () => {
          onSuccess?.();
        },
        requestClose
      );
    }
  });

  function requestClose() {
    if (enrollmentState?.currentStep === "verify" && enrollmentState.isSubmitting)
      return;
    isOpen = false;
  }

  function handleOpenChange(open: boolean) {
    if (!open && enrollmentState) {
      enrollmentState.cleanup();
      enrollmentState = null;
      onClose();
    }
  }

  function handleContinueToVerify() {
    enrollmentState?.goToVerify();
  }
</script>

<Drawer
  bind:isOpen
  placement="bottom"
  dismissible={enrollmentState?.currentStep !== "verify" ||
    !enrollmentState?.isSubmitting}
  onOpenChange={handleOpenChange}
>
  <div class="drawer-content">
    <header class="drawer-header">
      <div
        class="header-icon"
        class:success={enrollmentState?.currentStep === "success"}
      >
        {#if enrollmentState?.currentStep === "success"}
          <i class="fas fa-shield-check"></i>
        {:else}
          <i class="fas fa-shield-alt"></i>
        {/if}
      </div>
      <div class="header-text">
        <h2>
          {#if enrollmentState?.currentStep === "success"}
            Setup Complete
          {:else}
            Set Up Two-Factor Authentication
          {/if}
        </h2>
        {#if enrollmentState?.currentStep !== "success"}
          <p>Add an extra layer of security to your account</p>
        {/if}
      </div>
      {#if enrollmentState?.currentStep !== "verify" || !enrollmentState?.isSubmitting}
        <button
          type="button"
          class="close-button"
          onclick={requestClose}
          aria-label="Close"
        >
          <i class="fas fa-times"></i>
        </button>
      {/if}
    </header>

    <div class="drawer-body">
      {#if enrollmentState}
        {#if enrollmentState.currentStep === "setup"}
          <MFASetupStep
            qrCodeUri={enrollmentState.qrCodeUri}
            secretKey={enrollmentState.secretKey}
            isLoading={enrollmentState.isLoading}
            error={enrollmentState.formError}
            onContinue={handleContinueToVerify}
            onRetry={() => enrollmentState?.reset()}
          />
        {:else if enrollmentState.currentStep === "verify"}
          <MFAVerifyStep
            verificationCode={enrollmentState.verificationCode}
            error={enrollmentState.formError}
            isSubmitting={enrollmentState.isSubmitting}
            canSubmit={enrollmentState.canSubmit}
            onCodeChange={(v) => enrollmentState?.setVerificationCode(v)}
            onSubmit={() => enrollmentState?.submitVerification()}
            onBack={() => enrollmentState?.reset()}
          />
        {:else if enrollmentState.currentStep === "success"}
          <MFASuccessStep onClose={requestClose} />
        {/if}
      {/if}
    </div>
  </div>
</Drawer>

<style>
  .drawer-content {
    display: flex;
    flex-direction: column;
    min-height: 400px;
    max-height: 90vh;
  }

  .drawer-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 24px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .header-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--theme-accent, #3b82f6) 20%,
      transparent
    );
    border-radius: 12px;
    color: var(--theme-accent, #3b82f6);
    font-size: 22px;
    flex-shrink: 0;
  }

  .header-icon.success {
    background: color-mix(
      in srgb,
      var(--semantic-success, #22c55e) 20%,
      transparent
    );
    color: var(--semantic-success, #22c55e);
  }

  .header-text {
    flex: 1;
    min-width: 0;
  }

  .header-text h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .header-text p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
  }

  .close-button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .close-button:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    color: var(--theme-text, #ffffff);
  }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px 24px;
  }
</style>
