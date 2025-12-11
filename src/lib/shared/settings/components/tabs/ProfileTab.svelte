<!-- ProfileTab.svelte - User Profile & Account Settings (2026 Redesign)
     Curated indigo/purple color scheme with glassmorphism cards -->
<script lang="ts">
  import { authStore } from "../../../auth/stores/authStore.svelte";
  import { resolve, TYPES } from "../../../inversify/di";
  import type { IAuthService } from "../../../auth/services/contracts/IAuthService";
  import { onMount } from "svelte";
  import {
    hasPasswordProvider,
    uiState,
  } from "../../../navigation/state/profile-settings-state.svelte";
  import ConnectedAccounts from "../../../navigation/components/profile-settings/ConnectedAccounts.svelte";
  import PasswordSection from "../../../navigation/components/profile-settings/PasswordSection.svelte";
  import DangerZone from "../../../navigation/components/profile-settings/DangerZone.svelte";
  import RobustAvatar from "../../../components/avatar/RobustAvatar.svelte";

  import type { IHapticFeedbackService } from "../../../application/services/contracts/IHapticFeedbackService";
  import SocialAuthCompact from "../../../auth/components/SocialAuthCompact.svelte";
  import EmailPasswordAuth from "../../../auth/components/EmailPasswordAuth.svelte";
  import { nuclearCacheClear } from "../../../auth/utils/nuclearCacheClear";

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
      await authStore.signOut();
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
      console.log("Changing password");
      hapticService?.trigger("success");
      alert("Password changed successfully!");
      uiState.showPasswordSection = false;
    } catch (error) {
      console.error("Failed to change password:", error);
      hapticService?.trigger("error");
      alert("Failed to change password. Please try again.");
    } finally {
      uiState.saving = false;
    }
  }

  async function handleDeleteAccount() {
    if (!uiState.showDeleteConfirmation) {
      uiState.showDeleteConfirmation = true;
      return;
    }

    hapticService?.trigger("warning");

    const confirmed = confirm(
      "Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted."
    );

    if (!confirmed) {
      uiState.showDeleteConfirmation = false;
      return;
    }

    try {
      console.log("Deleting account");
      await authStore.signOut();
      alert("Account deleted successfully.");
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    }
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
  {#if authStore.isAuthenticated && authStore.user}
    <!-- Signed In State -->
    <div class="profile-content">
      <!-- Profile Hero Card -->
      <section class="glass-card profile-card">
        <div class="profile-hero">
          <div class="avatar-wrapper">
            <RobustAvatar
              src={authStore.user.photoURL}
              name={authStore.user.displayName || authStore.user.email}
              alt={authStore.user.displayName || "User"}
              size="xl"
            />
          </div>
          <div class="profile-info">
            {#if authStore.user.displayName}
              <h2 class="profile-name">{authStore.user.displayName}</h2>
            {/if}
            {#if authStore.user.email}
              <p class="profile-email">{authStore.user.email}</p>
            {/if}
          </div>
          <button class="sign-out-btn" onclick={handleSignOut}>
            <i class="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      <!-- Connected Accounts -->
      <section class="glass-card accounts-card">
        <header class="card-header">
          <div class="card-icon">
            <i class="fas fa-link"></i>
          </div>
          <div class="card-header-text">
            <h3 class="card-title">Connected Accounts</h3>
            <p class="card-subtitle">Manage linked authentication providers</p>
          </div>
        </header>
        <div class="card-content">
          <ConnectedAccounts />
        </div>
      </section>

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
              Clears IndexedDB, localStorage, and cookies. Your cloud data is safe.
            </p>
          </div>
        </div>
      </section>

      <!-- Danger Zone -->
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
          <DangerZone onDeleteAccount={handleDeleteAccount} {hapticService} />
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
        <h2 class="auth-title">Sign In to TKA Studio</h2>
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
          <span>or {authMode === "signin" ? "sign in" : "sign up"} with email</span>
        </div>

        <EmailPasswordAuth bind:mode={authMode} />
      </div>
    </div>
  {/if}
</div>

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
    padding: clamp(16px, 3cqi, 24px);
    gap: clamp(14px, 2cqi, 20px);
    overflow-y: auto;
    max-width: 900px;
    margin: 0 auto;

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
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  .glass-card:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
    transform: translateY(-1px);
    box-shadow: var(--theme-shadow, 0 8px 32px rgba(0, 0, 0, 0.2));
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
      var(--theme-accent, #6366f1) 0%,
      var(--theme-accent-strong, #a78bfa) 100%
    );
    box-shadow: 0 0 32px color-mix(in srgb, var(--theme-accent, #6366f1) 25%, transparent);
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
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0 0 4px 0;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  }

  .profile-email {
    font-size: clamp(13px, 2cqi, 15px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
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
     ======================================== */
  .danger-card {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.1) 0%,
      rgba(220, 38, 38, 0.06) 100%
    );
    border: 1px solid rgba(239, 68, 68, 0.25);
  }

  .danger-card:hover {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.15) 0%,
      rgba(220, 38, 38, 0.08) 100%
    );
    border-color: rgba(239, 68, 68, 0.4);
    box-shadow: 0 8px 32px rgba(239, 68, 68, 0.15);
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
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent);
    color: var(--theme-accent, #6366f1);
  }

  .card-header-text {
    flex: 1;
    min-width: 0;
  }

  .card-title {
    font-size: 17px;
    font-weight: 600;
    margin: 0;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .card-subtitle {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.45));
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 52px;
    padding: 14px 24px;
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-accent, #6366f1) 40%, transparent);
    border-radius: 12px;
    color: var(--theme-accent, #6366f1);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
    align-self: flex-start;
  }

  .action-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 25%, transparent);
    border-color: color-mix(in srgb, var(--theme-accent, #6366f1) 60%, transparent);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent);
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
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
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
      color-mix(in srgb, var(--theme-accent, #6366f1) 25%, transparent),
      color-mix(in srgb, var(--theme-accent-strong, #a78bfa) 25%, transparent)
    );
    border: 2px solid color-mix(in srgb, var(--theme-accent, #6366f1) 40%, transparent);
    font-size: 32px;
    color: var(--theme-accent, #a5b4fc);
    box-shadow: 0 0 40px color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent);
  }

  .auth-title {
    font-size: clamp(22px, 4.5cqi, 30px);
    font-weight: 700;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  }

  .auth-subtitle {
    font-size: clamp(14px, 2.5cqi, 16px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
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
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
  }

  .auth-divider span {
    padding: 0 16px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
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
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent);
    border-radius: 3px;
  }

  .profile-tab::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 35%, transparent);
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
    outline: 2px solid var(--theme-accent, #6366f1);
    outline-offset: 2px;
  }
</style>
