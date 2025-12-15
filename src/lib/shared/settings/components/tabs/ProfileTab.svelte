<!-- ProfileTab.svelte - User Profile & Account Settings (2026 Redesign)
     Curated indigo/purple color scheme with glassmorphism cards -->
<script lang="ts">
  import { authState } from "../../../auth/state/authState.svelte";
  import { resolve, TYPES } from "../../../inversify/di";
  import type { IAuthService } from "../../../auth/services/contracts/IAuthService";
  import { onMount } from "svelte";
  import {
    hasPasswordProvider,
    passwordState,
    resetPasswordForm,
    uiState,
  } from "../../../navigation/state/profile-settings-state.svelte";
  import ConnectedAccounts from "../../../navigation/components/profile-settings/ConnectedAccounts.svelte";
  import PasswordSection from "../../../navigation/components/profile-settings/PasswordSection.svelte";
  import DangerZone from "../../../navigation/components/profile-settings/DangerZone.svelte";
  import AccountSecuritySection from "../../../auth/components/AccountSecuritySection.svelte";
  import RobustAvatar from "../../../components/avatar/RobustAvatar.svelte";

  import type { IHapticFeedbackService } from "../../../application/services/contracts/IHapticFeedbackService";
  import SocialAuthCompact from "../../../auth/components/SocialAuthCompact.svelte";
  import EmailPasswordAuth from "../../../auth/components/EmailPasswordAuth.svelte";
  import { nuclearCacheClear } from "../../../auth/utils/nuclearCacheClear";
  import PasskeyStepUpModal from "../../../auth/components/PasskeyStepUpModal.svelte";
  import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
  } from "firebase/auth";

  interface Props {
    currentSettings?: unknown;
    onSettingUpdate?: (event: { key: string; value: unknown }) => void;
  }

  let {
    currentSettings: _currentSettings,
    onSettingUpdate: _onSettingUpdate,
  }: Props = $props();

  // Services
  let hapticService = $state<IHapticFeedbackService | null>(null);
  let authService = $state<IAuthService | null>(null);

  // Auth mode for inline auth
  let authMode = $state<"signin" | "signup">("signin");

  // Cache clearing state
  let clearingCache = $state(false);

  // Entry animation
  let isVisible = $state(false);

  // Step-up auth modal
  let showStepUpModal = $state(false);
  let pendingAction = $state<(() => Promise<void>) | null>(null);

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
    authService = resolve<IAuthService>(TYPES.IAuthService);

    setTimeout(() => (isVisible = true), 30);
  });

  async function handleSignOut() {
    hapticService?.trigger("selection");
    try {
      await authState.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  async function handleFacebookAuth() {
    hapticService?.trigger("selection");
    try {
      await authService?.signInWithFacebook();
    } catch (error: any) {
      console.error("❌ Facebook auth failed:", error);
      hapticService?.trigger("error");
    }
  }

  async function handleChangePassword() {
    if (uiState.saving) return;

    hapticService?.trigger("selection");
    uiState.saving = true;

    try {
      const newPassword = passwordState.new;
      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      await withSensitiveAuth(async () => {
        await authedApi("/api/account/update-password", { newPassword });
      }, { allowPasswordReauth: true, password: passwordState.current });

      // Also update client auth password so Firebase doesn't immediately desync
      if (authState.user) {
        await updatePassword(authState.user, newPassword).catch(() => {});
      }

      hapticService?.trigger("success");
      alert("Password updated. For security, you may be signed out on other devices.");
      uiState.showPasswordSection = false;
      resetPasswordForm();
    } catch (error) {
      console.error("Failed to change password:", error);
      hapticService?.trigger("error");
      alert("Failed to change password. Please try again.");
    } finally {
      uiState.saving = false;
    }
  }

  async function handleDeleteAccount() {
    // This is called after the user has typed "DELETE" to confirm
    hapticService?.trigger("warning");

    try {
      await withSensitiveAuth(async () => {
        await authedApi("/api/account/delete");
      }, { allowPasswordReauth: true });

      await authState.signOut().catch(() => {});
      alert("Account deleted successfully.");
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    }
  }

  async function authedApi(path: string, body?: unknown) {
    const user = authState.user;
    if (!user) throw new Error("Not signed in");

    const token = await user.getIdToken();
    const res = await fetch(path, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : "{}",
    });

    const data = (await res.json().catch(() => ({}))) as any;
    if (!res.ok) {
      const err = new Error(data?.error || `Request failed: ${res.status}`);
      (err as any).status = res.status;
      (err as any).code = data?.code;
      throw err;
    }
    return data;
  }

  async function passwordReauthIfPossible(password: string | null | undefined) {
    if (!password) return false;
    if (!authState.user?.email) return false;
    if (!hasPasswordProvider()) return false;

    const credential = EmailAuthProvider.credential(authState.user.email, password);
    await reauthenticateWithCredential(authState.user, credential);
    await authState.user.getIdToken(true);
    return true;
  }

  async function withSensitiveAuth(
    action: () => Promise<void>,
    options?: { allowPasswordReauth?: boolean; password?: string }
  ) {
    try {
      await action();
      return;
    } catch (e: unknown) {
      const code = typeof e === "object" && e && "code" in e ? (e as any).code : null;
      if (code !== "step_up_required") throw e;
    }

    if (options?.allowPasswordReauth) {
      const did = await passwordReauthIfPossible(options.password).catch(() => false);
      if (did) {
        await action();
        return;
      }
    }

    pendingAction = action;
    showStepUpModal = true;
  }

  async function handleStepUpSuccess() {
    const action = pendingAction;
    pendingAction = null;
    if (!action) return;
    try {
      await action();
    } catch (e) {
      console.error("Sensitive action failed after verification:", e);
      alert("Verification succeeded, but the action still failed. Please try again.");
    }
  }

  function handleStepUpCancel() {
    pendingAction = null;
  }

  async function handleClearCache() {
    if (
      !confirm(
        "Clear all cached data?\n\n" +
          "This will remove locally stored data and reload the page. " +
          "Your account and saved sequences are not affected."
      )
    ) {
      return;
    }

    hapticService?.trigger("selection");
    clearingCache = true;

    try {
      await nuclearCacheClear();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Failed to clear cache:", error);
      hapticService?.trigger("error");
      alert("Failed to clear cache. Please try again.");
      clearingCache = false;
    }
  }
</script>

<div class="profile-tab" class:visible={isVisible}>
  {#if authState.isAuthenticated && authState.user}
    <!-- Signed In State -->
    <div class="profile-content">
      <!-- Profile Hero Card -->
      <section class="glass-card profile-card">
        <div class="profile-hero">
          <div class="avatar-wrapper">
            <RobustAvatar
              src={authState.user.photoURL}
              name={authState.user.displayName || authState.user.email}
              alt={authState.user.displayName || "User"}
              size="xl"
            />
          </div>
          <div class="profile-info">
            {#if authState.user.displayName}
              <h2 class="profile-name">{authState.user.displayName}</h2>
            {/if}
            {#if authState.user.email}
              <p class="profile-email">{authState.user.email}</p>
            {/if}
          </div>
          <button class="sign-out-btn" onclick={handleSignOut}>
            <i class="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      <!-- Settings Grid - 2x2 layout for utility cards -->
      <div class="settings-grid">
        <!-- Connected Accounts -->
        <section class="glass-card accounts-card">
          <header class="card-header">
            <div class="card-icon">
              <i class="fas fa-link"></i>
            </div>
            <div class="card-header-text">
              <h3 class="card-title">Connected Accounts</h3>
              <p class="card-subtitle">Manage linked providers</p>
            </div>
          </header>
          <div class="card-content">
            <ConnectedAccounts />
          </div>
        </section>

        <!-- Security -->
        {#if authService}
          <section class="glass-card security-card">
            <header class="card-header">
              <div class="card-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
              <div class="card-header-text">
                <h3 class="card-title">Security</h3>
                <p class="card-subtitle">Protect sensitive actions</p>
              </div>
            </header>
            <div class="card-content">
              <AccountSecuritySection {hapticService} />
            </div>
          </section>
        {/if}

        <!-- Password Section (only for password-authenticated users) -->
        {#if hasPasswordProvider()}
          <section class="glass-card password-card">
            <header class="card-header">
              <div class="card-icon">
                <i class="fas fa-key"></i>
              </div>
              <div class="card-header-text">
                <h3 class="card-title">Password</h3>
                <p class="card-subtitle">Update your account security</p>
              </div>
            </header>
            <div class="card-content">
              <PasswordSection
                onChangePassword={handleChangePassword}
                {hapticService}
              />
            </div>
          </section>
        {/if}

        <!-- Storage Section -->
        <section class="glass-card storage-card">
          <header class="card-header">
            <div class="card-icon">
              <i class="fas fa-database"></i>
            </div>
            <div class="card-header-text">
              <h3 class="card-title">Storage</h3>
              <p class="card-subtitle">Manage local cached data</p>
            </div>
          </header>
          <div class="card-content">
            <div class="storage-content">
              <button
                class="action-btn"
                onclick={handleClearCache}
                disabled={clearingCache}
              >
                <i class="fas fa-broom"></i>
                <span>{clearingCache ? "Clearing..." : "Clear Cache"}</span>
              </button>
              <p class="hint-text">
                Clears IndexedDB, localStorage, and cookies. Your cloud data is
                safe.
              </p>
            </div>
          </div>
        </section>

      </div>

      <!-- Danger Zone - Full width, separated from grid -->
      <section class="glass-card danger-card">
        <header class="card-header">
          <div class="card-icon danger-icon">
            <i class="fas fa-skull"></i>
          </div>
          <div class="card-header-text">
            <h3 class="card-title danger-title">Danger Zone</h3>
            <p class="card-subtitle">Irreversible account actions</p>
          </div>
        </header>
        <div class="card-content">
          <DangerZone
            onDeleteAccount={handleDeleteAccount}
            {hapticService}
            userIdentifier={authState.user?.displayName ||
              authState.user?.email ||
              ""}
          />
        </div>
      </section>
    </div>
  {:else}
    <!-- Signed Out State - Auth Section -->
    <div class="auth-section">
      <div class="auth-hero">
        <div class="auth-icon-wrapper">
          <i class="fas fa-user-astronaut"></i>
        </div>
        <h2 class="auth-title">Sign In to TKA Scribe</h2>
        <p class="auth-subtitle">
          Save your progress, sync across devices, and access your creations.
        </p>
      </div>

      <div class="auth-form-container">
        <SocialAuthCompact
          mode={authMode}
          onFacebookAuth={handleFacebookAuth}
        />

        <div class="auth-divider">
          <span
            >or {authMode === "signin" ? "sign in" : "sign up"} with email</span
          >
        </div>

        <EmailPasswordAuth bind:mode={authMode} />
      </div>
    </div>
  {/if}
</div>

<PasskeyStepUpModal
  bind:isOpen={showStepUpModal}
  allowPassword={hasPasswordProvider()}
  onSuccess={handleStepUpSuccess}
  onCancel={handleStepUpCancel}
/>

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     PROFILE TAB - Theme-Aware Glassmorphism
     Uses --theme-* CSS variables set by background selection
     ═══════════════════════════════════════════════════════════════════════════ */
  .profile-tab {
    container-type: inline-size;
    container-name: profile-tab;

    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: clamp(16px, 3cqi, 24px);
    gap: clamp(14px, 2cqi, 20px);
    overflow-y: auto;

    opacity: 0;
    transition: opacity 200ms ease;
  }

  .profile-tab.visible {
    opacity: 1;
  }

  .profile-content {
    display: flex;
    flex-direction: column;
    gap: clamp(14px, 2cqi, 20px);
  }

  /* ========================================
     SETTINGS GRID - 2x2 layout for utility cards
     ======================================== */
  .settings-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(14px, 2cqi, 20px);
  }

  .settings-grid .glass-card {
    /* Cards should stretch to fill their grid cell */
    height: 100%;
  }

  /* Single column on narrow screens */
  @container profile-tab (max-width: 600px) {
    .settings-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ========================================
     GLASS CARD BASE - Theme-aware
     ======================================== */
  .glass-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: clamp(16px, 2.5cqi, 24px);
    border-radius: 16px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  .glass-card:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
    transform: translateY(-1px);
    box-shadow: var(--theme-shadow);
  }

  /* ========================================
     PROFILE CARD - Hero section
     ======================================== */
  .profile-hero {
    display: flex;
    align-items: center;
    gap: clamp(14px, 2.5cqi, 24px);
    flex-wrap: wrap;
  }

  .avatar-wrapper {
    width: clamp(72px, 14cqi, 100px);
    height: clamp(72px, 14cqi, 100px);
    border-radius: 50%;
    overflow: hidden;
    padding: 3px;
    background: linear-gradient(
      135deg,
      var(--theme-accent) 0%,
      var(--theme-accent-strong) 100%
    );
    box-shadow: 0 0 32px
      color-mix(in srgb, var(--theme-accent) 25%, transparent);
    flex-shrink: 0;
  }

  .avatar-wrapper :global(img),
  .avatar-wrapper :global(.avatar-fallback) {
    border-radius: 50%;
  }

  .profile-info {
    flex: 1;
    min-width: 140px;
  }

  .profile-name {
    font-size: clamp(20px, 3.5cqi, 28px);
    font-weight: 700;
    color: var(--theme-text);
    margin: 0 0 4px 0;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  }

  .profile-email {
    font-size: clamp(13px, 2cqi, 15px);
    color: var(--theme-text-dim);
    margin: 0;
  }

  .sign-out-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    padding: 12px 20px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 12px;
    color: #fca5a5;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
    flex-shrink: 0;
  }

  .sign-out-btn:hover {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.6);
    color: #fecaca;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.2);
  }

  .sign-out-btn:active {
    transform: scale(0.97);
  }

  /* Mobile: Stack profile */
  @container profile-tab (max-width: 420px) {
    .profile-hero {
      flex-direction: column;
      text-align: center;
    }

    .profile-info {
      min-width: 100%;
    }

    .sign-out-btn {
      width: 100%;
    }
  }

  /* ========================================
     DANGER CARD - Always red (semantic)
     Dark base with red tint for visibility on any background
     ======================================== */
  .danger-card {
    background: var(
      --theme-danger-bg,
      linear-gradient(
        135deg,
        rgba(70, 15, 20, 0.9) 0%,
        rgba(85, 20, 25, 0.85) 100%
      )
    );
    border: 1px solid var(--theme-danger-border, rgba(239, 68, 68, 0.5));
    box-shadow: var(
      --theme-danger-shadow,
      inset 0 1px 0 rgba(239, 68, 68, 0.15),
      0 4px 20px rgba(0, 0, 0, 0.3)
    );
  }

  .danger-card:hover {
    background: var(
      --theme-danger-hover-bg,
      linear-gradient(
        135deg,
        rgba(85, 18, 25, 0.92) 0%,
        rgba(100, 25, 30, 0.88) 100%
      )
    );
    border-color: var(--theme-danger-hover-border, rgba(239, 68, 68, 0.65));
    box-shadow: var(
      --theme-danger-hover-shadow,
      inset 0 1px 0 rgba(239, 68, 68, 0.2),
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(239, 68, 68, 0.15)
    );
  }

  .danger-card .card-icon {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
  }

  .danger-card .card-title {
    color: #fecaca;
  }

  /* ========================================
     CARD HEADER
     ======================================== */
  .card-header {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    font-size: 18px;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--theme-accent) 20%, transparent);
    color: var(--theme-accent);
  }

  .card-header-text {
    flex: 1;
    min-width: 0;
  }

  .card-title {
    font-size: 17px;
    font-weight: 600;
    margin: 0;
    color: var(--theme-text);
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .card-subtitle {
    font-size: 13px;
    color: var(--theme-text-dim);
    margin: 3px 0 0 0;
  }

  .card-content {
    padding-top: 4px;
  }

  /* ========================================
     STORAGE SECTION
     ======================================== */
  .storage-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    min-height: 52px;
    padding: 14px 24px;
    background: color-mix(in srgb, var(--theme-accent) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-accent) 40%, transparent);
    border-radius: 10px;
    color: var(--theme-accent);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .action-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--theme-accent) 25%, transparent);
    border-color: color-mix(in srgb, var(--theme-accent) 60%, transparent);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px
      color-mix(in srgb, var(--theme-accent) 20%, transparent);
  }

  .action-btn:active:not(:disabled) {
    transform: scale(0.97);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hint-text {
    font-size: 13px;
    color: var(--theme-text-dim);
    margin: 0;
    line-height: 1.5;
  }

  /* ========================================
     AUTH SECTION - Sign In State
     ======================================== */
  .auth-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(28px, 5cqi, 48px);
    padding: clamp(24px, 5cqi, 48px);
    max-width: 440px;
    margin: 0 auto;
    width: 100%;
  }

  .auth-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    text-align: center;
  }

  .auth-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 24px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent) 25%, transparent),
      color-mix(in srgb, var(--theme-accent-strong) 25%, transparent)
    );
    border: 2px solid color-mix(in srgb, var(--theme-accent) 40%, transparent);
    font-size: 32px;
    color: var(--theme-accent);
    box-shadow: 0 0 40px
      color-mix(in srgb, var(--theme-accent) 20%, transparent);
  }

  .auth-title {
    font-size: clamp(22px, 4.5cqi, 30px);
    font-weight: 700;
    color: var(--theme-text);
    margin: 0;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  }

  .auth-subtitle {
    font-size: clamp(14px, 2.5cqi, 16px);
    color: var(--theme-text-dim);
    margin: 0;
    max-width: 340px;
    line-height: 1.5;
  }

  .auth-form-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
  }

  .auth-divider {
    display: flex;
    align-items: center;
    text-align: center;
  }

  .auth-divider::before,
  .auth-divider::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid var(--theme-stroke);
  }

  .auth-divider span {
    padding: 0 16px;
    color: var(--theme-text-dim);
    font-size: 13px;
    font-weight: 500;
  }

  /* ========================================
     SCROLLBAR
     ======================================== */
  .profile-tab::-webkit-scrollbar {
    width: 6px;
  }

  .profile-tab::-webkit-scrollbar-track {
    background: transparent;
  }

  .profile-tab::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--theme-accent) 20%, transparent);
    border-radius: 3px;
  }

  .profile-tab::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--theme-accent) 35%, transparent);
  }

  /* ========================================
     ACCESSIBILITY
     ======================================== */
  @media (prefers-reduced-motion: reduce) {
    .profile-tab,
    .glass-card,
    .sign-out-btn,
    .action-btn {
      transition: none;
    }

    .glass-card:hover,
    .sign-out-btn:hover,
    .action-btn:hover:not(:disabled) {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .glass-card {
      border-width: 2px;
    }

    .sign-out-btn,
    .action-btn {
      border-width: 2px;
    }
  }

  .sign-out-btn:focus-visible,
  .action-btn:focus-visible {
    outline: 2px solid var(--theme-accent);
    outline-offset: 2px;
  }
</style>
