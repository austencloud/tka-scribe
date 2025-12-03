<!--
  EmailVerificationBanner Component

  Displays a non-intrusive banner prompting users to verify their email.
  Only shows for email/password users who haven't verified their email.
-->
<script lang="ts">
  import { authStore } from "../stores/authStore.svelte";
  import { sendEmailVerification } from "firebase/auth";
  import { auth } from "../firebase";
  import { slide } from "svelte/transition";

  let sending = $state(false);
  let sent = $state(false);
  let error = $state<string | null>(null);
  let dismissed = $state(false);

  // Check if we should show the banner
  // Only show for email/password users with unverified email
  const shouldShow = $derived(() => {
    if (dismissed || !authStore.user) return false;

    // Check if user has email/password provider
    const hasEmailProvider = authStore.user.providerData.some(
      (provider) => provider.providerId === "password"
    );

    // Only show banner for email/password users who haven't verified
    return hasEmailProvider && !authStore.user.emailVerified;
  });

  async function resendVerification() {
    if (!authStore.user || sending) return;

    sending = true;
    error = null;

    try {
      await sendEmailVerification(authStore.user);
      sent = true;
    } catch (err: any) {
      if (err.code === "auth/too-many-requests") {
        error = "Please wait before requesting another email.";
      } else {
        error = "Failed to send verification email. Please try again.";
      }
    } finally {
      sending = false;
    }
  }

  async function checkVerification() {
    if (!auth.currentUser) return;

    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        // Refresh the page to update auth state
        window.location.reload();
      } else {
        error = "Email not yet verified. Please check your inbox.";
      }
    } catch {
      error = "Could not check verification status.";
    }
  }

  function dismiss() {
    dismissed = true;
  }
</script>

{#if shouldShow()}
  <div class="verification-banner" transition:slide={{ duration: 300 }}>
    <div class="banner-content">
      <i class="fas fa-envelope-open-text banner-icon" aria-hidden="true"></i>

      <div class="banner-text">
        {#if sent}
          <strong>Verification email sent!</strong>
          <span>Check your inbox and click the verification link.</span>
        {:else if error}
          <strong>Verify your email</strong>
          <span class="error-text">{error}</span>
        {:else}
          <strong>Please verify your email</strong>
          <span>Check your inbox for a verification link to secure your account.</span>
        {/if}
      </div>

      <div class="banner-actions">
        {#if sent}
          <button class="action-button" onclick={checkVerification}>
            I've verified
          </button>
        {:else}
          <button
            class="action-button"
            onclick={resendVerification}
            disabled={sending}
          >
            {sending ? "Sending..." : "Resend email"}
          </button>
        {/if}
        <button
          class="dismiss-button"
          onclick={dismiss}
          aria-label="Dismiss banner"
        >
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .verification-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    padding: 12px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .banner-icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  .banner-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 14px;
  }

  .banner-text strong {
    font-weight: 600;
  }

  .banner-text span {
    opacity: 0.9;
    font-size: 13px;
  }

  .error-text {
    color: #fef3c7 !important;
  }

  .banner-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .action-button {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .action-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }

  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .dismiss-button {
    background: transparent;
    border: none;
    color: white;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }

  .dismiss-button:hover {
    opacity: 1;
  }

  /* Mobile adjustments */
  @media (max-width: 600px) {
    .banner-content {
      flex-wrap: wrap;
    }

    .banner-text {
      flex-basis: calc(100% - 44px);
    }

    .banner-actions {
      flex-basis: 100%;
      margin-top: 8px;
    }

    .action-button {
      flex: 1;
    }
  }
</style>
