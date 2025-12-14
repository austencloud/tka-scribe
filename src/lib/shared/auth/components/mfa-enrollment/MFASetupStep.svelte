<script lang="ts">
  /**
   * MFASetupStep
   *
   * Displays QR code and secret key for authenticator app setup.
   */

  import QRCode from "qrcode";
  import { onMount } from "svelte";

  interface Props {
    qrCodeUri: string;
    secretKey: string;
    isLoading: boolean;
    error: string | null;
    onContinue: () => void;
    onRetry?: () => void;
  }

  let { qrCodeUri, secretKey, isLoading, error, onContinue, onRetry }: Props =
    $props();

  let qrCodeDataUrl = $state("");
  let secretCopied = $state(false);

  onMount(async () => {
    if (qrCodeUri) {
      try {
        qrCodeDataUrl = await QRCode.toDataURL(qrCodeUri, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
      } catch (err) {
        console.error("Failed to generate QR code:", err);
      }
    }
  });

  // Regenerate QR code when URI changes
  $effect(() => {
    if (qrCodeUri) {
      QRCode.toDataURL(qrCodeUri, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      }).then((url) => {
        qrCodeDataUrl = url;
      });
    }
  });

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(secretKey);
      secretCopied = true;
      setTimeout(() => {
        secretCopied = false;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  function formatSecret(secret: string): string {
    // Format in groups of 4 for readability
    return secret.match(/.{1,4}/g)?.join(" ") || secret;
  }
</script>

<div class="setup-step">
  {#if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Setting up two-factor authentication...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <h3>Setup Failed</h3>
      <p class="error-message">{error}</p>
      {#if error.includes("not enabled")}
        <p class="error-help">
          TOTP-based MFA needs to be enabled in your Firebase project. Go to <strong
            >Google Cloud Console → Identity Platform → MFA</strong
          > and enable TOTP. Changes may take a few minutes to propagate.
        </p>
      {:else if error.includes("recent-login") || error.includes("requires-recent-login")}
        <p class="error-help">
          For security, Firebase requires a recent sign-in to enable 2FA. Please <strong
            >sign out and sign back in</strong
          >, then try enabling 2FA again.
        </p>
      {/if}
      {#if onRetry}
        <button type="button" class="retry-button" onclick={onRetry}>
          <i class="fas fa-redo"></i>
          Try Again
        </button>
      {/if}
    </div>
  {:else}
    <div class="qr-section">
      <h3>Scan QR Code</h3>
      <p class="instruction">
        Open your authenticator app (Google Authenticator, Authy, etc.) and scan
        this QR code.
      </p>

      <div class="qr-container">
        {#if qrCodeDataUrl}
          <img
            src={qrCodeDataUrl}
            alt="QR Code for authenticator app"
            class="qr-code"
          />
        {:else}
          <div class="qr-placeholder">
            <i class="fas fa-qrcode"></i>
          </div>
        {/if}
      </div>
    </div>

    <div class="manual-section">
      <h4>Can't scan? Enter manually:</h4>
      <div class="secret-container">
        <code class="secret-key">{formatSecret(secretKey)}</code>
        <button
          type="button"
          class="copy-button"
          onclick={copySecret}
          title="Copy to clipboard"
          aria-label="Copy secret key to clipboard"
        >
          <i class="fas {secretCopied ? 'fa-check' : 'fa-copy'}"></i>
        </button>
      </div>
      {#if secretCopied}
        <span class="copied-message">Copied!</span>
      {/if}
    </div>

    <button type="button" class="continue-button" onclick={onContinue}>
      Continue
      <i class="fas fa-arrow-right"></i>
    </button>
  {/if}
</div>

<style>
  .setup-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 16px;
  }

  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px;
    text-align: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-top-color: var(--theme-accent, #3b82f6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-state i {
    font-size: 48px;
    color: var(--semantic-error, #ef4444);
  }

  .error-state h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .error-state .error-message {
    margin: 0;
    font-size: 14px;
    color: var(--semantic-error, #ef4444);
    max-width: 300px;
    line-height: 1.5;
    padding: 12px 16px;
    background: color-mix(
      in srgb,
      var(--semantic-error, #ef4444) 15%,
      transparent
    );
    border: 1px solid var(--semantic-error, #ef4444);
    border-radius: 10px;
  }

  .error-state .error-help {
    margin: 0;
    font-size: 13px;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.7));
    max-width: 300px;
    line-height: 1.6;
  }

  .error-state .error-help strong {
    color: var(--theme-text, #ffffff);
  }

  .retry-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text, #ffffff);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 8px;
  }

  .retry-button:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-accent, #3b82f6);
  }

  .qr-section {
    text-align: center;
  }

  .qr-section h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .instruction {
    margin: 0 0 16px;
    font-size: 14px;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.7));
    max-width: 300px;
  }

  .qr-container {
    display: flex;
    justify-content: center;
    padding: 16px;
    background: #ffffff;
    border-radius: 16px;
  }

  .qr-code {
    width: 200px;
    height: 200px;
    display: block;
  }

  .qr-placeholder {
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border-radius: 8px;
  }

  .qr-placeholder i {
    font-size: 64px;
    color: #9ca3af;
  }

  .manual-section {
    text-align: center;
    width: 100%;
  }

  .manual-section h4 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.7));
  }

  .secret-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
  }

  .secret-key {
    font-family: "SF Mono", "Monaco", "Inconsolata", monospace;
    font-size: 14px;
    letter-spacing: 2px;
    color: var(--theme-text, #ffffff);
    word-break: break-all;
  }

  .copy-button {
    padding: 8px;
    background: transparent;
    border: none;
    color: var(--theme-accent, #3b82f6);
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .copy-button:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent, #3b82f6) 15%,
      transparent
    );
  }

  .copied-message {
    display: block;
    margin-top: 8px;
    font-size: 12px;
    color: var(--semantic-success, #22c55e);
  }

  .continue-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    background: linear-gradient(
      135deg,
      var(--theme-accent, #3b82f6),
      color-mix(in srgb, var(--theme-accent, #3b82f6) 80%, #000)
    );
    border: none;
    border-radius: 12px;
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .continue-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px
      color-mix(in srgb, var(--theme-accent, #3b82f6) 40%, transparent);
  }
</style>
