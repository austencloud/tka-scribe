<script lang="ts">
  /**
   * Google One Tap Component (FedCM-Ready for 2028+)
   *
   * Provides frictionless Google sign-in with a single tap.
   * No redirects - just a small popup that appears automatically.
   *
   * Benefits:
   * - 90% increase in signups reported by implementers
   * - No page redirects - stays in context
   * - Works for both sign-in AND sign-up
   * - FedCM-native - future-proof, no third-party cookie issues
   *
   * FedCM Migration Notes:
   * - Deprecated status methods (isNotDisplayed, isSkippedMoment, etc.) removed
   * - Uses FedCM-only flow - prompt() callback only fires on success or error
   * - Users who dismiss can re-enable via browser address bar identity icon
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
    /** Called when sign-in fails or user dismisses */
    onError?: (error: Error) => void;
    /** Called when One Tap prompt is not available (FedCM disabled, cooldown, etc.) */
    onUnavailable?: () => void;
    /** Show the One Tap prompt automatically on mount */
    autoPrompt?: boolean;
    /** Position of the One Tap prompt */
    promptParentId?: string;
  }

  let {
    onSuccess,
    onError,
    onUnavailable,
    autoPrompt = true,
    promptParentId,
  }: Props = $props();

  let scriptLoaded = $state(false);
  let authService: IAuthenticator | null = null;

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
      script.onerror = () =>
        reject(new Error("Failed to load Google Identity Services"));
      document.head.appendChild(script);
    });
  }

  async function handleCredentialResponse(response: { credential: string }) {
    debug.info("Received Google credential, signing in...");

    try {
      if (!authService) {
        authService = await resolve<IAuthenticator>(TYPES.IAuthenticator);
      }

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

    // FedCM-only configuration (future-proof for 2028+)
    const config: GoogleOneTapConfig = {
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: true,
      cancel_on_tap_outside: false,
      context: "signin",
      itp_support: true,
      use_fedcm_for_prompt: true,
    };

    if (promptParentId) {
      config.prompt_parent_id = promptParentId;
    }

    window.google.accounts.id.initialize(config);
    debug.success("Google One Tap initialized (FedCM mode)");

    if (autoPrompt) {
      // Small delay to let the page settle
      setTimeout(() => {
        // FedCM-compatible: prompt() with no callback arguments
        // In FedCM mode, success goes through handleCredentialResponse
        // Failures are silent (user can retry via browser identity icon)
        try {
          window.google?.accounts.id.prompt();
          debug.info("One Tap prompt requested");
        } catch (error) {
          // FedCM may throw if disabled or on cooldown
          debug.warn("One Tap prompt unavailable:", error);
          onUnavailable?.();
        }
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
    try {
      window.google?.accounts.id.prompt();
    } catch {
      onUnavailable?.();
    }
  }
</script>

<!--
  This component is invisible - it just initializes One Tap.
  The prompt appears as an overlay from Google.
-->
