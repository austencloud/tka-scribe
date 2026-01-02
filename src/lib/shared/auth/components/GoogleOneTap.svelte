<script lang="ts">
  /**
   * Google One Tap Component
   *
   * Provides frictionless Google sign-in with a single tap.
   * No redirects - just a small popup that appears automatically.
   *
   * Benefits:
   * - 90% increase in signups reported by implementers
   * - No page redirects - stays in context
   * - Works for both sign-in AND sign-up
   * - FedCM-based - modern, no third-party cookie issues
   */

  import { onMount, onDestroy } from "svelte";
  import { resolve } from "../../inversify/di";
  import { TYPES } from "../../inversify/types";
  import type { IAuthenticator } from "../services/contracts/IAuthenticator";
  import { GOOGLE_CLIENT_ID } from "../config/google-oauth";
  import { createComponentLogger } from "$lib/shared/utils/debug-logger";

  const debug = createComponentLogger("GoogleOneTap");

  interface Props {
    /** Called when sign-in succeeds */
    onSuccess?: () => void;
    /** Called when sign-in fails */
    onError?: (error: Error) => void;
    /** Show the One Tap prompt automatically on mount */
    autoPrompt?: boolean;
    /** Position of the One Tap prompt */
    promptParentId?: string;
  }

  let { onSuccess, onError, autoPrompt = true, promptParentId }: Props = $props();

  let scriptLoaded = $state(false);
  let authService: IAuthenticator | null = null;

  // Uses global types from app.d.ts (GoogleOneTapConfig, GooglePromptNotification, GoogleButtonConfig, Window.google)

  function loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      // Check if script is already in DOM
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve());
        existingScript.addEventListener("error", reject);
        return;
      }

      // Load the script
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
      document.head.appendChild(script);
    });
  }

  async function handleCredentialResponse(response: { credential: string }) {
    debug.info("Received Google credential, signing in...");

    try {
      if (!authService) {
        authService = await resolve<IAuthenticator>(TYPES.IAuthenticator);
      }

      // Use the new credential-based sign-in
      await authService.signInWithGoogleCredential(response.credential);

      debug.success("Google One Tap sign-in successful!");
      onSuccess?.();
    } catch (error) {
      debug.error("Google One Tap sign-in failed:", error);
      onError?.(error instanceof Error ? error : new Error("Sign-in failed"));
    }
  }

  function initializeOneTap() {
    if (!window.google?.accounts?.id) {
      debug.error("Google Identity Services not loaded");
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      debug.error("Google Client ID not configured");
      return;
    }

    const config: GoogleOneTapConfig = {
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: true, // Auto-select if user has only one Google account
      cancel_on_tap_outside: false,
      context: "signin",
      itp_support: true, // Intelligent Tracking Prevention support
      // FedCM is mandatory - users who dismiss can re-enable via browser address bar icon
      use_fedcm_for_prompt: true,
    };

    if (promptParentId) {
      config.prompt_parent_id = promptParentId;
    }

    window.google.accounts.id.initialize(config);
    debug.success("Google One Tap initialized");

    if (autoPrompt) {
      // Small delay to let the page settle
      setTimeout(() => {
        window.google?.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            debug.warn(
              "One Tap not displayed:",
              notification.getNotDisplayedReason()
            );
          } else if (notification.isSkippedMoment()) {
            debug.info("One Tap skipped:", notification.getSkippedReason());
          } else if (notification.isDismissedMoment()) {
            debug.info("One Tap dismissed:", notification.getDismissedReason());
          }
        });
      }, 500);
    }
  }

  onMount(async () => {
    try {
      authService = await resolve<IAuthenticator>(TYPES.IAuthenticator);
      await loadGoogleScript();
      scriptLoaded = true;
      initializeOneTap();
    } catch (error) {
      debug.error("Failed to initialize Google One Tap:", error);
    }
  });

  onDestroy(() => {
    // Cancel any pending prompts
    window.google?.accounts.id.cancel();
  });

  /**
   * Manually trigger the One Tap prompt
   * Useful for showing it on button click if autoPrompt is false
   */
  export function showPrompt() {
    window.google?.accounts.id.prompt();
  }
</script>

<!--
  This component is invisible - it just initializes One Tap.
  The prompt appears as an overlay from Google.
-->
