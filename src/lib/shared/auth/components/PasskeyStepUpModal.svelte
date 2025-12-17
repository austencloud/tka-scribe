<script lang="ts">
  import {
    EmailAuthProvider,
    reauthenticateWithCredential,
  } from "firebase/auth";
  import { auth } from "../firebase";
  import {
    registerPasskey,
    stepUpWithPasskey,
  } from "../webauthn/passkeysClient";

  interface Props {
    isOpen: boolean;
    allowPassword?: boolean;
    onSuccess: () => void;
    onCancel: () => void;
  }

  let {
    isOpen = $bindable(),
    allowPassword = false,
    onSuccess,
    onCancel,
  }: Props = $props();

  let isSubmitting = $state(false);
  let error = $state<string | null>(null);
  let password = $state("");
  let showPassword = $state(false);
  let showPasskeySetup = $state(false);

  async function handlePasskeyVerify() {
    if (isSubmitting) return;
    isSubmitting = true;
    error = null;
    showPasskeySetup = false;
    try {
      await stepUpWithPasskey();
      isOpen = false;
      onSuccess();
    } catch (e: unknown) {
      const code =
        typeof e === "object" && e && "code" in e
          ? String((e as { code: unknown }).code)
          : "";

      if (code === "no_passkeys") {
        showPasskeySetup = true;
        error = "No passkey is set up yet. Create one to continue.";
      } else {
        error = e instanceof Error ? e.message : "Verification failed";
      }
    } finally {
      isSubmitting = false;
    }
  }

  async function handleCreatePasskey() {
    if (isSubmitting) return;
    isSubmitting = true;
    error = null;
    try {
      await registerPasskey();
      showPasskeySetup = false;
      await stepUpWithPasskey();
      isOpen = false;
      onSuccess();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to create passkey";
    } finally {
      isSubmitting = false;
    }
  }

  async function handlePasswordVerify() {
    if (isSubmitting) return;
    const user = auth.currentUser;
    if (!user?.email) {
      error = "Password verification requires an email/password account";
      return;
    }
    if (!password) {
      error = "Enter your password to continue";
      return;
    }

    isSubmitting = true;
    error = null;
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await user.getIdToken(true);
      password = "";
      isOpen = false;
      onSuccess();
    } catch (e: unknown) {
      const code =
        typeof e === "object" && e && "code" in e
          ? String((e as { code: unknown }).code)
          : "";

      if (code === "auth/multi-factor-auth-required") {
        error =
          "This account has authenticator 2FA enabled, which is no longer supported in the app. Remove it using the admin migration script.";
        return;
      }

      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password"
      ) {
        error = "Incorrect password. Try again, or use a passkey.";
      } else {
        error = e instanceof Error ? e.message : "Password verification failed";
      }
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancel() {
    if (isSubmitting) return;
    password = "";
    showPasskeySetup = false;
    isOpen = false;
    onCancel();
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="passkey-modal-title"
    tabindex="-1"
    onkeydown={(e) => e.key === "Escape" && handleCancel()}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="modal-content"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <header class="modal-header">
        <div class="header-icon">
          <i class="fas fa-fingerprint"></i>
        </div>
        <div class="header-text">
          <h2 id="passkey-modal-title">Verify it’s you</h2>
          <p>Use your device passkey to continue</p>
        </div>
      </header>

      <div class="modal-body">
        <p class="info">
          This is required for sensitive actions (password, email, account
          deletion).
        </p>

        {#if showPasskeySetup}
          <div class="setup">
            <p class="setup-text">
              Create a passkey on this device to verify quickly next time (Face
              ID / Touch ID / Windows Hello).
            </p>
            <button
              type="button"
              class="setup-button"
              onclick={handleCreatePasskey}
              disabled={isSubmitting}
            >
              <i class="fas fa-plus"></i>
              Create Passkey
            </button>
          </div>
        {/if}

        {#if allowPassword}
          <div class="password">
            <label class="label" for="verify-password"
              >Password (optional)</label
            >
            <div class="pw-wrap">
              <input
                id="verify-password"
                type={showPassword ? "text" : "password"}
                class="pw-input"
                bind:value={password}
                autocomplete="current-password"
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                class="pw-toggle"
                onclick={() => (showPassword = !showPassword)}
                disabled={isSubmitting}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i class="fas {showPassword ? 'fa-eye-slash' : 'fa-eye'}"></i>
              </button>
            </div>
          </div>
        {/if}

        {#if error}
          <p class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {error}
          </p>
        {/if}
      </div>

      <footer class="modal-footer">
        <button
          type="button"
          class="cancel-button"
          onclick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        {#if allowPassword}
          <button
            type="button"
            class="verify-button secondary"
            onclick={handlePasswordVerify}
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <span class="spinner"></span>
              Verifying...
            {:else}
              Verify with Password
            {/if}
          </button>
        {/if}

        <button
          type="button"
          class="verify-button"
          onclick={handlePasskeyVerify}
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <span class="spinner"></span>
            Verifying...
          {:else}
            Verify with Passkey
          {/if}
        </button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--theme-panel-bg, #0f172a) 85%,
      transparent
    );
    backdrop-filter: blur(8px);
    z-index: 10000;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    width: 100%;
    max-width: 420px;
    margin: 16px;
    background: var(--theme-panel-bg, #1e293b);
    border: 1px solid
      color-mix(in srgb, var(--theme-accent, #3b82f6) 30%, transparent);
    border-radius: 20px;
    box-shadow: 0 20px 60px var(--theme-shadow, rgba(0, 0, 0, 0.5));
    animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 24px 24px 16px;
  }

  .header-icon {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, #22c55e 20%, transparent);
    border-radius: 14px;
    color: #22c55e;
    font-size: 24px;
    flex-shrink: 0;
  }

  .header-text h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .header-text p {
    margin: 4px 0 0;
    font-size: 14px;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
  }

  .modal-body {
    padding: 8px 24px 20px;
  }

  .password {
    margin-top: 14px;
  }

  .label {
    display: block;
    margin-bottom: 8px;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.7));
    font-size: 13px;
    font-weight: 600;
  }

  .pw-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .pw-input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #fff;
    font-size: 14px;
  }

  .pw-toggle {
    position: absolute;
    right: 6px;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
  }

  .setup {
    margin-top: 14px;
    padding: 12px 12px;
    border-radius: 12px;
    border: 1px solid rgba(34, 197, 94, 0.25);
    background: rgba(34, 197, 94, 0.08);
  }

  .setup-text {
    margin: 0 0 10px 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    line-height: 1.4;
  }

  .setup-button {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #fff;
    font-weight: 700;
    cursor: pointer;
  }

  .info {
    margin: 0;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.7));
    font-size: 14px;
    line-height: 1.5;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 16px 0 0;
    padding: 12px 16px;
    background: color-mix(
      in srgb,
      var(--semantic-error, #ef4444) 15%,
      transparent
    );
    border: 1px solid var(--semantic-error, #ef4444);
    border-radius: 10px;
    color: var(--semantic-error, #ef4444);
    font-size: 14px;
  }

  .modal-footer {
    display: flex;
    gap: 12px;
    padding: 0 24px 24px;
  }

  .cancel-button {
    flex: 1;
    padding: 12px 16px;
    border-radius: 10px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, #fff);
    cursor: pointer;
    font-weight: 500;
  }

  .verify-button {
    flex: 1.3;
    padding: 12px 16px;
    border-radius: 10px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: none;
    color: #fff;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .verify-button.secondary {
    flex: 1;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: #fff;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
