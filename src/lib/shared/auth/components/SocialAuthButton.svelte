<script lang="ts">
  /**
   * SocialAuthButton
   *
   * Branded social auth button wrapper.
   * Note: Authenticator-app 2FA (TOTP) has been removed from the app.
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

    try {
      try {
        await setPersistence(auth, indexedDBLocalPersistence);
      } catch {
        await setPersistence(auth, browserLocalPersistence);
      }

      const authProvider = getProvider();

      if (isMobileDevice()) {
        await signInWithRedirect(auth, authProvider);
        return;
      }

      await signInWithPopup(auth, authProvider);
      await goto("/");
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
    <p class="error" role="status">{error}</p>
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

  .error {
    margin: 10px 0 0;
    font-size: var(--font-size-compact);
    color: var(--semantic-error, var(--semantic-error));
  }
</style>
