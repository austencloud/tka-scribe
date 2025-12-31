<!--
  SocialAuthCompact.svelte - Compact Social Authentication Buttons

  Side-by-side Google and Facebook auth buttons for sign-in/sign-up flows.
  Note: Authenticator-app 2FA (TOTP) has been removed from the app.
-->
<script lang="ts">
  import {
    GoogleAuthProvider,
    browserLocalPersistence,
    indexedDBLocalPersistence,
    setPersistence,
    signInWithPopup,
  } from "firebase/auth";
  import FacebookIcon from "./icons/FacebookIcon.svelte";
  import GoogleIcon from "./icons/GoogleIcon.svelte";
  import { auth } from "../firebase";

  let { mode = "signin", onFacebookAuth } = $props<{
    mode: "signin" | "signup";
    onFacebookAuth: () => void;
  }>();

  let googleError = $state<string | null>(null);

  async function handleGoogleClick() {
    googleError = null;
    try {
      try {
        await setPersistence(auth, indexedDBLocalPersistence);
      } catch {
        await setPersistence(auth, browserLocalPersistence);
      }

      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("? [SocialAuthCompact] Google sign-in error:", error);
      googleError = error?.message || "Google sign-in failed";
    }
  }

  function handleFacebookClick() {
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
      aria-label={mode === "signin"
        ? "Sign in with Google"
        : "Sign up with Google"}
    >
      <GoogleIcon />
      Google
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
    <p class="error-message" role="alert">{googleError}</p>
  {/if}
</div>

<style>
  .social-auth-compact {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(8px, 1.5vh, 12px);
    margin-top: clamp(2px, 0.5vh, 4px);
  }

  .social-compact-label {
    font-size: clamp(0.6875rem, 1.5vh, var(--font-size-compact));
    color: var(--theme-text-dim, var(--theme-text-dim));
    margin: 0;
    font-weight: 500;
  }

  .social-compact-buttons {
    display: flex;
    gap: clamp(6px, 1vw, 10px);
    width: 100%;
    max-width: 400px;
  }

  .social-compact-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(4px, 1vw, 8px);
    min-height: clamp(36px, 5vh, var(--min-touch-target));
    padding: clamp(8px, 1.2vh, 10px) clamp(10px, 2vw, 16px);
    border-radius: clamp(6px, 1vh, 8px);
    font-size: clamp(0.75rem, 1.8vh, var(--font-size-sm));
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    box-shadow: 0 2px 6px var(--theme-shadow);
  }

  .social-compact-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .social-compact-button :global(svg) {
    flex-shrink: 0;
  }

  .social-compact-button--google {
    background: #ffffff;
    color: #111827;
  }

  .social-compact-button--google:hover:not(:disabled) {
    background: #f3f4f6;
    transform: translateY(-1px);
  }

  .social-compact-button--facebook {
    background: #1877f2;
    color: #ffffff;
  }

  .social-compact-button--facebook:hover:not(:disabled) {
    background: #166fe5;
    transform: translateY(-1px);
  }

  .error-message {
    margin: 0;
    font-size: var(--font-size-compact);
    color: var(--semantic-error, var(--semantic-error));
  }
</style>
