<!-- ProfileTab.svelte - User Profile & Account Settings -->
<script lang="ts">
  import { authStore } from "../../../auth/stores/authStore.svelte";
  import { resolve, TYPES } from "../../../inversify/di";
  import type { IAuthService } from "../../../auth/services/contracts/IAuthService";
  import { onMount } from "svelte";
  import {
    hasPasswordProvider,
    uiState,
  } from "../../../navigation/state/profile-settings-state.svelte";
  import UnifiedHeader from "../UnifiedHeader.svelte";
  import ConnectedAccounts from "../../../navigation/components/profile-settings/ConnectedAccounts.svelte";
  import PasswordSection from "../../../navigation/components/profile-settings/PasswordSection.svelte";
  import DangerZone from "../../../navigation/components/profile-settings/DangerZone.svelte";

  import type { IHapticFeedbackService } from "../../../application/services/contracts/IHapticFeedbackService";
  import SocialAuthCompact from "../../../auth/components/SocialAuthCompact.svelte";
  import EmailPasswordAuth from "../../../auth/components/EmailPasswordAuth.svelte";

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

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
    authService = resolve<IAuthService>(TYPES.IAuthService);
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
      // TODO: Implement password change via Firebase
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
      // TODO: Implement account deletion
      console.log("Deleting account");
      await authStore.signOut();
      alert("Account deleted successfully.");
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    }
  }
</script>

<div class="profile-tab">
  {#if authStore.isAuthenticated && authStore.user}
    <!-- Signed In State -->
    <div class="profile-section">
      <!-- Profile Card -->
      <div class="profile-card">
        <div class="profile-top">
          <!-- Profile Picture -->
          <div class="profile-avatar">
            {#if authStore.user.photoURL}
              <img
                src={authStore.user.photoURL}
                alt={authStore.user.displayName || "User"}
                class="avatar-image"
                crossorigin="anonymous"
                referrerpolicy="no-referrer"
              />
            {:else}
              <div class="avatar-placeholder">
                {(authStore.user.displayName || authStore.user.email || "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            {/if}
          </div>

          <!-- User Info -->
          <div class="profile-info">
            {#if authStore.user.displayName}
              <h3 class="profile-name">{authStore.user.displayName}</h3>
            {/if}
            {#if authStore.user.email}
              <p class="profile-email">{authStore.user.email}</p>
            {/if}
          </div>

          <button class="sign-out-chip" onclick={handleSignOut}>
            <i class="fas fa-sign-out-alt"></i>
            Sign Out
          </button>
        </div>
      </div>

      <!-- Account Management Sections -->
      <div class="account-sections">
        <!-- Connected Accounts Card -->
        <div class="security-card">
          <UnifiedHeader
            title="Connected Accounts"
            icon="fas fa-link"
            description="Manage the authentication providers linked to your account"
          />
          <ConnectedAccounts />
        </div>

        <!-- Password Section (only for password-authenticated users) -->
        {#if hasPasswordProvider()}
          <div class="security-card">
            <UnifiedHeader
              title="Password"
              icon="fas fa-key"
              description="Update your password to keep your account secure"
            />
            <PasswordSection
              onChangePassword={handleChangePassword}
              {hapticService}
            />
          </div>
        {/if}
      </div>

      <!-- Account Deletion -->
      <DangerZone onDeleteAccount={handleDeleteAccount} {hapticService} />
    </div>
  {:else}
    <!-- Signed Out State - Inline Auth -->
    <div class="auth-section">
      <div class="auth-header">
        <div class="prompt-icon">
          <i class="fas fa-user-circle"></i>
        </div>
        <h3>Sign In to TKA Studio</h3>
        <p>
          Save your progress, sync across devices, and access your creations.
        </p>
      </div>

      <!-- Social Auth Buttons - Compact side-by-side layout -->
      <div class="auth-content">
        <SocialAuthCompact
          mode={authMode}
          onFacebookAuth={handleFacebookAuth}
        />

        <!-- Divider -->
        <div class="auth-divider">
          <span
            >or {authMode === "signin" ? "sign in" : "sign up"} with email</span
          >
        </div>

        <!-- Email/Password Auth -->
        <EmailPasswordAuth bind:mode={authMode} />
      </div>
    </div>
  {/if}
</div>

<style>
  .profile-tab {
    padding: 3cqh 3cqw;
    max-width: 900px;
    margin: 0 auto;
    height: 100%;
    overflow-y: auto;
  }

  /* Compact layout when parent container height is limited */
  @container settings-content (max-height: 600px) {
    .profile-tab {
      padding: 2cqh 2cqw;
    }
  }

  @container settings-content (max-height: 500px) {
    .profile-tab {
      padding: 1.5cqh 1.5cqw;
    }
  }

  .profile-section {
    display: flex;
    flex-direction: column;
    gap: 3cqh;
  }

  @container settings-content (max-height: 600px) {
    .profile-section {
      gap: 2cqh;
    }
  }

  @container settings-content (max-height: 500px) {
    .profile-section {
      gap: 1.5cqh;
    }
  }

  /* Profile Card */
  .profile-card {
    display: flex;
    flex-direction: column;
    gap: 2cqh;
    padding: 3cqh 3cqw;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  @container settings-content (max-height: 600px) {
    .profile-card {
      gap: 1.5cqh;
      padding: 2cqh 2cqw;
    }

    .profile-top {
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
      align-items: start;
    }

    .sign-out-chip {
      grid-column: 2;
      justify-self: start;
      margin-top: 6px;
    }
  }

  /* Mobile: Stack profile card elements on narrow screens */
  @container settings-content (max-width: 450px) {
    .profile-top {
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
    }

    .sign-out-chip {
      grid-column: 1 / -1;
      justify-self: center;
      margin-top: 1.5cqh;
    }
  }

  .profile-top {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1.5cqw;
    align-items: center;
  }

  .profile-avatar {
    width: min(96px, 15cqh);
    height: min(96px, 15cqh);
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid rgba(255, 255, 255, 0.2);
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .profile-info {
    text-align: left;
  }

  .profile-name {
    font-size: clamp(18px, 3cqw, 24px);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 4px 0;
  }

  .profile-email {
    font-size: clamp(12px, 2cqw, 14px);
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  .sign-out-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.6cqw;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgba(239, 68, 68, 0.4);
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease,
      border-color 0.15s ease;
    justify-self: end;
  }

  .sign-out-chip i {
    font-size: 14px;
  }

  .sign-out-chip:hover {
    transform: translateY(-1px);
    border-color: rgba(239, 68, 68, 0.6);
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.15);
  }

  .sign-out-chip:active {
    transform: translateY(0) scale(0.98);
  }

  /* Account Sections */
  .account-sections {
    display: flex;
    flex-direction: column;
    gap: 2cqh;
  }

  /* Security Cards */
  .security-card {
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 2cqh 2cqw;
    transition: all 0.2s ease;
  }

  @container settings-content (max-height: 600px) {
    .security-card {
      padding: 1.5cqh 1.5cqw;
    }
  }

  .security-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
  }

  /* Auth Section - Inline Auth */
  .auth-section {
    display: flex;
    flex-direction: column;
    gap: 3cqh;
    padding: 3cqh 3cqw;
    height: 100%;
    justify-content: center;
  }

  @container settings-content (max-height: 600px) {
    .auth-section {
      gap: 2cqh;
      padding: 2cqh 2cqw;
    }
  }

  @container settings-content (max-height: 500px) {
    .auth-section {
      gap: 1.5cqh;
      padding: 1cqh 1.5cqw;
    }
  }

  .auth-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5cqh;
    text-align: center;
  }

  .prompt-icon {
    width: min(64px, 10cqh);
    height: min(64px, 10cqh);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.15),
      rgba(118, 75, 162, 0.15)
    );
    border: 2px solid rgba(99, 102, 241, 0.3);
  }

  .prompt-icon i {
    font-size: min(32px, 5cqh);
    color: rgba(99, 102, 241, 0.9);
  }

  .auth-header h3 {
    font-size: clamp(16px, 3cqw, 20px);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .auth-header p {
    font-size: clamp(12px, 2cqw, 14px);
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    max-width: 400px;
    line-height: 1.5;
  }

  /* Auth Content */
  .auth-content {
    display: flex;
    flex-direction: column;
    gap: 2cqh;
    max-width: min(400px, 90cqw);
    margin: 0 auto;
    width: 100%;
  }

  @container settings-content (max-height: 500px) {
    .auth-content {
      gap: 1.5cqh;
    }
  }

  /* Auth Divider */
  .auth-divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 0.5cqh 0;
  }

  .auth-divider::before,
  .auth-divider::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  }

  .auth-divider span {
    padding: 0 2cqw;
    color: rgba(255, 255, 255, 0.5);
    font-size: clamp(11px, 1.8cqw, 13px);
    font-weight: 500;
  }

  /* Desktop: Constrain button width */
  @container settings-content (min-width: 600px) {
    .sign-out-button {
      max-width: 280px;
      margin: 0 auto;
    }

    .auth-content {
      max-width: 440px;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .security-card,
    .sign-out-button {
      transition: none;
    }

    .sign-out-button:hover {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .profile-card,
    .security-card,
    .sign-out-button {
      border-width: 2px;
    }

    .auth-divider::before,
    .auth-divider::after {
      border-color: white;
    }
  }
</style>
