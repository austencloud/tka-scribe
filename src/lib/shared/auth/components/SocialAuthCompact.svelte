<!--
  SocialAuthCompact.svelte - Compact Social Authentication Buttons

  Side-by-side Google and Facebook auth buttons for sign-in/sign-up flows
  Uses Google Identity Services for improved reliability on modern browsers
  Supports MFA challenge when enabled on account.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { getMultiFactorResolver, type MultiFactorResolver } from "firebase/auth";
  import { auth } from "../firebase";
  import { GoogleIdentityService } from "../services/implementations/GoogleIdentityService";
  import { env } from "$env/dynamic/public";
  import { resolve, TYPES } from "../../inversify/di";
  import type { IAuthService } from "../services/contracts/IAuthService";
  import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";
  import FacebookIcon from "./icons/FacebookIcon.svelte";
  import GoogleIcon from "./icons/GoogleIcon.svelte";
  import MFAChallengeModal from "./MFAChallengeModal.svelte";

  // Get Google OAuth Client ID from environment (runtime)
  const PUBLIC_GOOGLE_OAUTH_CLIENT_ID = env.PUBLIC_GOOGLE_OAUTH_CLIENT_ID;

  // Props
  let { mode = "signin", onFacebookAuth } = $props<{
    mode: "signin" | "signup";
    onFacebookAuth: () => void;
  }>();

  // Google Identity Service instance
  let googleIdentityService: GoogleIdentityService | null = null;
  let googleButtonReady = $state(false);

  // MFA state
  let showMFAChallenge = $state(false);
  let mfaResolver = $state<MultiFactorResolver | null>(null);
  let authService = $state<IAuthService | null>(null);
  let hapticService = $state<IHapticFeedbackService | null>(null);
  let googleError = $state<string | null>(null);

  // Initialize services
  onMount(async () => {
    // Resolve DI services for MFA
    try {
      authService = resolve<IAuthService>(TYPES.IAuthService);
      hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
    } catch (e) {
      console.warn("SocialAuthCompact: Failed to resolve services", e);
    }

    // Initialize Google Identity Services
    try {
      if (!PUBLIC_GOOGLE_OAUTH_CLIENT_ID) {
        console.warn(
          "⚠️ [SocialAuthCompact] Google OAuth Client ID not configured"
        );
        return;
      }

      googleIdentityService = new GoogleIdentityService(
        PUBLIC_GOOGLE_OAUTH_CLIENT_ID
      );
      await googleIdentityService.initialize();

      googleButtonReady = true;
      console.log(
        "✅ [SocialAuthCompact] Google Identity Services initialized"
      );
    } catch (error) {
      console.error(
        "❌ [SocialAuthCompact] Failed to initialize Google Identity Services:",
        error
      );
    }
  });

  // Handle Google sign-in
  async function handleGoogleClick() {
    console.log("🖱️ [SocialAuthCompact] Google button clicked");
    googleError = null;

    if (!googleIdentityService) {
      console.error(
        "❌ [SocialAuthCompact] Google Identity Service not initialized"
      );
      googleError = "Google Sign-In is not ready. Please refresh the page.";
      return;
    }

    try {
      console.log("🔐 [SocialAuthCompact] Triggering Google sign-in...");
      await googleIdentityService.signInWithPopup();
    } catch (error: any) {
      console.error("❌ [SocialAuthCompact] Google sign-in error:", error);

      // Check if MFA is required
      if (error.code === "auth/multi-factor-auth-required") {
        console.log("🔐 [SocialAuthCompact] MFA required, showing challenge modal...");
        mfaResolver = getMultiFactorResolver(auth, error);
        showMFAChallenge = true;
        return;
      }

      googleError = error.message || "Google sign-in failed";
    }
  }

  // MFA handlers
  function handleMFASuccess() {
    console.log("✅ [SocialAuthCompact] MFA verification successful");
    showMFAChallenge = false;
    mfaResolver = null;
    goto("/");
  }

  function handleMFACancel() {
    console.log("🔐 [SocialAuthCompact] MFA verification cancelled");
    showMFAChallenge = false;
    mfaResolver = null;
    googleError = "Sign-in cancelled. Please try again.";
  }

  function handleFacebookClick() {
    console.log(
      "🖱️ [SocialAuthCompact] Facebook button clicked, calling onFacebookAuth"
    );
    onFacebookAuth();
  }
</script>

<div class="social-auth-compact">
  <p class="social-compact-label">
    {mode === "signin" ? "Sign in with" : "Or sign up with"}
  </p>
  <div class="social-compact-buttons">
    <button
      class="social-compact-button social-compact-button--google"
      onclick={handleGoogleClick}
      disabled={!googleButtonReady}
      aria-label={mode === "signin"
        ? "Sign in with Google"
        : "Sign up with Google"}
    >
      <GoogleIcon />
      {googleButtonReady ? "Google" : "Loading..."}
    </button>
    <button
      class="social-compact-button social-compact-button--facebook"
      onclick={handleFacebookClick}
      aria-label={mode === "signin"
        ? "Sign in with Facebook"
        : "Sign up with Facebook"}
    >
      <FacebookIcon />
      Facebook
    </button>
  </div>
  {#if googleError}
    <p class="error-message">{googleError}</p>
  {/if}
</div>

<!-- MFA Challenge Modal -->
{#if showMFAChallenge && mfaResolver && authService}
  <MFAChallengeModal
    bind:isOpen={showMFAChallenge}
    resolver={mfaResolver}
    {authService}
    {hapticService}
    onSuccess={handleMFASuccess}
    onCancel={handleMFACancel}
  />
{/if}

<style>
  .social-auth-compact {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-top: 4px;
  }

  .social-compact-label {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    margin: 0;
    font-weight: 500;
  }

  .social-compact-buttons {
    display: flex;
    gap: 10px;
    width: 100%;
    max-width: 400px;
  }

  .social-compact-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 52px; /* WCAG minimum */
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    box-shadow: 0 2px 6px var(--theme-shadow, rgba(0, 0, 0, 0.15));
  }

  .social-compact-button :global(svg) {
    flex-shrink: 0;
  }

  /* Google button - white background with multicolor logo */
  .social-compact-button--google {
    background: white;
    color: #202124;
  }

  .social-compact-button--google:hover:not(:disabled) {
    background: #f8f9fa;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  /* Facebook button - brand blue */
  .social-compact-button--facebook {
    background: #1877f2;
    color: white;
  }

  .social-compact-button--facebook :global(svg) {
    fill: white;
  }

  .social-compact-button--facebook:hover:not(:disabled) {
    background: #0c63d4;
    box-shadow: 0 4px 10px rgba(24, 119, 242, 0.35);
    transform: translateY(-1px);
  }

  .social-compact-button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .social-compact-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .social-compact-button:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--theme-accent-strong, #6366f1) 70%, transparent);
    outline-offset: 2px;
  }

  .error-message {
    color: var(--semantic-error, #ef4444);
    font-size: 0.8125rem;
    text-align: center;
    margin: 0;
    padding: 0.5rem 1rem;
    background: color-mix(in srgb, var(--semantic-error, #ef4444) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--semantic-error, #ef4444) 30%, transparent);
    border-radius: 0.5rem;
    width: 100%;
    max-width: 400px;
  }

  /* ============================================================================
     RESPONSIVE DESIGN
     ============================================================================ */

  /* iPhone SE 1st gen and very small devices (568px height) */
  @media (max-height: 568px) {
    .social-auth-compact {
      gap: 10px;
      margin-top: 0;
    }

    .social-compact-label {
      font-size: 12px;
    }

    .social-compact-buttons {
      gap: 8px;
    }

    .social-compact-button {
      min-height: 52px;
      padding: 9px 12px;
      font-size: 13px;
      gap: 6px;
    }

    .social-compact-button :global(svg) {
      width: 16px;
      height: 16px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .social-compact-button {
      transition: none;
    }

    .social-compact-button:hover,
    .social-compact-button:active {
      transform: none;
    }
  }
</style>
