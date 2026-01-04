<script lang="ts">
  /**
   * SocialAuthButton
   *
   * Branded social auth button wrapper.
   * Google uses One Tap for seamless authentication (no redirects).
   */

  import { goto } from "$app/navigation";
  import {
    browserLocalPersistence,
    FacebookAuthProvider,
    GithubAuthProvider,
    GoogleAuthProvider,
    indexedDBLocalPersistence,
    setPersistence,
    signInWithPopup,
    signInWithRedirect,
    TwitterAuthProvider,
  } from "firebase/auth";
  import { auth } from "../firebase";
  import { isGoogleOneTapConfigured } from "../config/google-oauth";

  let {
    provider,
    class: className = "",
    children,
  }: {
    provider: "facebook" | "google" | "github" | "twitter";
    class?: string;
    children: import("svelte").Snippet;
  } = $props();

  let loading = $state(false);
  let error = $state<string | null>(null);

  function isMobileDevice(): boolean {
    if (typeof window === "undefined") return false;
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    return hasTouch && window.innerWidth < 768;
  }

  function getProvider() {
    switch (provider) {
      case "google":
        return new GoogleAuthProvider();
      case "facebook":
        return new FacebookAuthProvider();
      case "github":
        return new GithubAuthProvider();
      case "twitter":
        return new TwitterAuthProvider();
    }
  }

  async function handleClick() {
    if (loading) return;
    loading = true;
    error = null;

    // For Google, try One Tap first (seamless, no redirects)
    if (
      provider === "google" &&
      isGoogleOneTapConfigured() &&
      window.google?.accounts?.id
    ) {
      window.google.accounts.id.prompt((notification) => {
        // If One Tap can't display, fall back to popup/redirect
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log("[SocialAuthButton] One Tap unavailable, using fallback");
          handleLegacyAuth();
        } else {
          loading = false;
        }
      });
      return;
    }

    // For other providers or if One Tap unavailable
    await handleLegacyAuth();
  }

  async function handleLegacyAuth() {
    try {
      try {
        await setPersistence(auth, indexedDBLocalPersistence);
      } catch {
        await setPersistence(auth, browserLocalPersistence);
      }

      const authProvider = getProvider();

      // Mobile always uses redirect (more reliable)
      if (isMobileDevice()) {
        console.log("[SocialAuthButton] Mobile detected, using redirect flow");
        await signInWithRedirect(auth, authProvider);
        return;
      }

      // Desktop: try popup first, fall back to redirect if it fails
      try {
        await signInWithPopup(auth, authProvider);
        await goto("/app");
      } catch (popupError: unknown) {
        const errorCode = (popupError as { code?: string })?.code;
        console.warn(
          "[SocialAuthButton] Popup failed:",
          errorCode,
          "- falling back to redirect"
        );

        // Popup blocked, closed, or COOP issue - use redirect instead
        if (
          errorCode === "auth/popup-blocked" ||
          errorCode === "auth/popup-closed-by-user" ||
          errorCode === "auth/cancelled-popup-request" ||
          errorCode === "auth/internal-error"
        ) {
          await signInWithRedirect(auth, authProvider);
          return;
        }

        // Re-throw other errors (like auth/account-exists-with-different-credential)
        throw popupError;
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Sign-in failed";
      error = message;
      console.error("[SocialAuthButton] Sign-in error:", e);
    } finally {
      loading = false;
    }
  }
</script>

<div class="social-auth-button {className}">
  <button type="button" class="btn" onclick={handleClick} disabled={loading}>
    {@render children()}
  </button>

  {#if error}
    <p class="error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .social-auth-button {
    width: 100%;
  }

  .btn {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: var(--min-touch-target);
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid var(--theme-stroke);
    background: var(--theme-card-bg, var(--theme-card-bg));
    color: var(--theme-text);
    font-weight: 700;
    cursor: pointer;
    transition:
      transform 0.15s ease,
      background 0.15s ease;
  }

  .btn:hover:not(:disabled) {
    transform: translateY(-1px);
    background: var(--theme-card-hover-bg, var(--theme-card-bg));
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn:focus-visible {
    outline: 2px solid var(--theme-accent);
    outline-offset: 2px;
  }

  .error {
    margin: 10px 0 0;
    font-size: var(--font-size-compact);
    color: var(--semantic-error, var(--semantic-error));
  }
</style>
