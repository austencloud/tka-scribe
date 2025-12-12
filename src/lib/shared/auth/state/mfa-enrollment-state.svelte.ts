/**
 * MFA Enrollment State
 *
 * Manages the multi-step TOTP enrollment flow:
 * 1. setup - Display QR code and secret for authenticator app
 * 2. verify - User enters verification code to confirm setup
 * 3. success - Enrollment complete
 */

import type { TotpSecret } from "firebase/auth";
import type { IAuthService } from "../services/contracts/IAuthService";
import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";

export type MFAEnrollmentStep = "setup" | "verify" | "success";

export interface MFAEnrollmentState {
  readonly currentStep: MFAEnrollmentStep;
  readonly qrCodeUri: string;
  readonly secretKey: string;
  readonly verificationCode: string;
  readonly formError: string | null;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly canSubmit: boolean;

  goToVerify(): void;
  setVerificationCode(value: string): void;
  submitVerification(): Promise<void>;
  reset(): void;
  cleanup(): void;
}

export function createMFAEnrollmentState(
  authService: IAuthService,
  hapticService: IHapticFeedbackService | null,
  onSuccess?: () => void,
  onClose?: () => void
): MFAEnrollmentState {
  // Internal state
  let currentStep = $state<MFAEnrollmentStep>("setup");
  let qrCodeUri = $state("");
  let secretKey = $state("");
  let totpSecret = $state<TotpSecret | null>(null);
  let verificationCode = $state("");
  let formError = $state<string | null>(null);
  let isLoading = $state(true);
  let isSubmitting = $state(false);

  // Computed
  const canSubmit = $derived(
    verificationCode.length === 6 && !isSubmitting && !formError
  );

  // Initialize enrollment on creation
  async function initialize() {
    isLoading = true;
    formError = null;

    try {
      const result = await authService.startTOTPEnrollment();
      totpSecret = result.secret;
      qrCodeUri = result.qrCodeUri;
      secretKey = result.secretKey;
      isLoading = false;
    } catch (error: unknown) {
      console.error("Failed to start TOTP enrollment:", error);
      formError =
        error instanceof Error ? error.message : "Failed to start enrollment";
      isLoading = false;
      hapticService?.trigger("error");
    }
  }

  // Start enrollment immediately
  initialize();

  return {
    get currentStep() {
      return currentStep;
    },
    get qrCodeUri() {
      return qrCodeUri;
    },
    get secretKey() {
      return secretKey;
    },
    get verificationCode() {
      return verificationCode;
    },
    get formError() {
      return formError;
    },
    get isLoading() {
      return isLoading;
    },
    get isSubmitting() {
      return isSubmitting;
    },
    get canSubmit() {
      return canSubmit;
    },

    goToVerify() {
      if (!isLoading && qrCodeUri) {
        currentStep = "verify";
      }
    },

    setVerificationCode(value: string) {
      // Only allow digits, max 6 characters
      const cleaned = value.replace(/\D/g, "").slice(0, 6);
      verificationCode = cleaned;
      formError = null; // Clear error on input
    },

    async submitVerification() {
      if (!canSubmit || !totpSecret) return;

      isSubmitting = true;
      formError = null;

      try {
        await authService.completeTOTPEnrollment(totpSecret, verificationCode);
        currentStep = "success";
        hapticService?.trigger("success");
        onSuccess?.();
      } catch (error: unknown) {
        console.error("MFA verification failed:", error);
        formError =
          error instanceof Error ? error.message : "Verification failed";
        verificationCode = ""; // Clear code on error
        hapticService?.trigger("error");
      } finally {
        isSubmitting = false;
      }
    },

    reset() {
      currentStep = "setup";
      qrCodeUri = "";
      secretKey = "";
      totpSecret = null;
      verificationCode = "";
      formError = null;
      isLoading = true;
      isSubmitting = false;
      initialize();
    },

    cleanup() {
      // Reset all state
      currentStep = "setup";
      qrCodeUri = "";
      secretKey = "";
      totpSecret = null;
      verificationCode = "";
      formError = null;
      isLoading = false;
      isSubmitting = false;
    },
  };
}
