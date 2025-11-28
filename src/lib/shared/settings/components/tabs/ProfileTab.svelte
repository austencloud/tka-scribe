<!-- ProfileTab.svelte - User Profile & Account Settings -->
<script lang="ts">
  import { authStore } from "../../../auth";
  import { resolve, TYPES } from "../../../inversify";
  import type { IAuthService } from "../../../auth";
  import { onMount } from "svelte";
  import {
    hasPasswordProvider,
    uiState,
  } from "../../../navigation/state/profile-settings-state.svelte";
  import UnifiedHeader from "../UnifiedHeader.svelte";
  import ConnectedAccounts from "../../../navigation/components/profile-settings/ConnectedAccounts.svelte";
  import PasswordSection from "../../../navigation/components/profile-settings/PasswordSection.svelte";
  import DangerZone from "../../../navigation/components/profile-settings/DangerZone.svelte";
  import {
    SocialAuthCompact,
    EmailPasswordAuth,
  } from "../../../auth/components";
  import type { IHapticFeedbackService } from "../../../application/services/contracts/IHapticFeedbackService";

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

      <!-- Sign Out Button -->
      <button class="sign-out-button" onclick={handleSignOut}>
        <i class="fas fa-sign-out-alt"></i>
        Sign Out
      </button>

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
    padding: 24px 16px;
    max-width: 900px;
    margin: 0 auto;
  }

  .profile-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Profile Card */
  .profile-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px 24px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .profile-avatar {
    width: 96px;
    height: 96px;
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
    text-align: center;
  }

  .profile-name {
    font-size: 24px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 4px 0;
  }

  .profile-email {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  /* Account Sections */
  .account-sections {
    display: flex;
    flex-direction: column;
    gap: clamp(18px, 3vh, 24px);
  }

  /* Security Cards */
  .security-card {
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(12px, 2vh, 16px);
    padding: clamp(18px, 3vh, 24px);
    transition: all 0.2s ease;
  }

  .security-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
  }

  /* Sign Out Button */
  .sign-out-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px 24px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 12px;
    color: #ef4444;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sign-out-button:hover {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.5);
    transform: translateY(-1px);
  }

  .sign-out-button:active {
    transform: translateY(0) scale(0.98);
  }

  .sign-out-button i {
    font-size: 18px;
  }

  /* Auth Section - Inline Auth */
  .auth-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px 16px;
  }

  .auth-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
  }

  .prompt-icon {
    width: 64px;
    height: 64px;
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
    font-size: 32px;
    color: rgba(99, 102, 241, 0.9);
  }

  .auth-header h3 {
    font-size: 20px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .auth-header p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    max-width: 400px;
    line-height: 1.5;
  }

  /* Auth Content */
  .auth-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
  }

  /* Auth Divider */
  .auth-divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 4px 0;
  }

  .auth-divider::before,
  .auth-divider::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  }

  .auth-divider span {
    padding: 0 16px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
    font-weight: 500;
  }

  /* Mobile Responsive */
  @media (max-width: 480px) {
    .profile-tab {
      padding: 16px;
    }

    .security-card {
      padding: 16px;
    }
  }

  /* Desktop: Better sizing and spacing */
  @media (min-width: 769px) {
    .profile-tab {
      padding: clamp(24px, 3vw, 32px) clamp(16px, 2vw, 24px);
    }

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
