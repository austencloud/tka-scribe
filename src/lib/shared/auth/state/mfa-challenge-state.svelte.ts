/**
 * MFA Challenge State
 *
 * Manages the MFA verification flow during sign-in.
 * Includes rate limiting (5 attempts, 60s lockout).
 */

import type { MultiFactorResolver } from "firebase/auth";
import type { IAuthService } from "../services/contracts/IAuthService";
import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

export interface MFAChallengeState {
  readonly verificationCode: string;
  readonly formError: string | null;
  readonly isSubmitting: boolean;
  readonly attemptsRemaining: number;
  readonly isLocked: boolean;
  readonly lockoutTimeRemaining: number;
  readonly canSubmit: boolean;

  setVerificationCode(value: string): void;
  submitVerification(): Promise<void>;
  reset(): void;
  cleanup(): void;
}

export function createMFAChallengeState(
  authService: IAuthService,
  resolver: MultiFactorResolver,
  hapticService: IHapticFeedbackService | null,
  onSuccess?: () => void,
  onCancel?: () => void
): MFAChallengeState {
  // Internal state
  let verificationCode = $state("");
  let formError = $state<string | null>(null);
  let isSubmitting = $state(false);
  let failedAttempts = $state(0);
  let lockoutEndTime = $state<number | null>(null);
  let lockoutTimeRemaining = $state(0);
  let lockoutInterval: ReturnType<typeof setInterval> | null = null;

  // Computed
  const attemptsRemaining = $derived(MAX_ATTEMPTS - failedAttempts);
  const isLocked = $derived(lockoutEndTime !== null && Date.now() < lockoutEndTime);
  const canSubmit = $derived(
    verificationCode.length === 6 && !isSubmitting && !isLocked
  );

  // Update lockout timer
  function startLockoutTimer() {
    if (lockoutInterval) {
      clearInterval(lockoutInterval);
    }

    lockoutInterval = setInterval(() => {
      if (lockoutEndTime && Date.now() < lockoutEndTime) {
        lockoutTimeRemaining = Math.ceil((lockoutEndTime - Date.now()) / 1000);
      } else {
        // Lockout ended
        lockoutEndTime = null;
        lockoutTimeRemaining = 0;
        failedAttempts = 0;
        if (lockoutInterval) {
          clearInterval(lockoutInterval);
          lockoutInterval = null;
        }
      }
    }, 1000);
  }

  return {
    get verificationCode() {
      return verificationCode;
    },
    get formError() {
      return formError;
    },
    get isSubmitting() {
      return isSubmitting;
    },
    get attemptsRemaining() {
      return attemptsRemaining;
    },
    get isLocked() {
      return isLocked;
    },
    get lockoutTimeRemaining() {
      return lockoutTimeRemaining;
    },
    get canSubmit() {
      return canSubmit;
    },

    setVerificationCode(value: string) {
      // Only allow digits, max 6 characters
      const cleaned = value.replace(/\D/g, "").slice(0, 6);
      verificationCode = cleaned;
      formError = null; // Clear error on input
    },

    async submitVerification() {
      if (!canSubmit) return;

      isSubmitting = true;
      formError = null;

      try {
        await authService.verifyMFACode(resolver, verificationCode);
        hapticService?.trigger("success");
        onSuccess?.();
      } catch (error: unknown) {
        console.error("MFA verification failed:", error);
        failedAttempts++;
        verificationCode = ""; // Clear code on error
        hapticService?.trigger("error");

        if (failedAttempts >= MAX_ATTEMPTS) {
          // Start lockout
          lockoutEndTime = Date.now() + LOCKOUT_DURATION_MS;
          lockoutTimeRemaining = LOCKOUT_DURATION_MS / 1000;
          formError = `Too many attempts. Please wait ${lockoutTimeRemaining} seconds.`;
          startLockoutTimer();
        } else {
          formError =
            error instanceof Error
              ? `${error.message} (${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining)`
              : "Verification failed";
        }
      } finally {
        isSubmitting = false;
      }
    },

    reset() {
      verificationCode = "";
      formError = null;
      isSubmitting = false;
      // Don't reset attempts/lockout - persist across retries
    },

    cleanup() {
      if (lockoutInterval) {
        clearInterval(lockoutInterval);
        lockoutInterval = null;
      }
      verificationCode = "";
      formError = null;
      isSubmitting = false;
      failedAttempts = 0;
      lockoutEndTime = null;
      lockoutTimeRemaining = 0;
    },
  };
}
