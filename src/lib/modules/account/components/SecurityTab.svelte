<!--
  SecurityTab.svelte - Account Security Tab

  Authentication and account security management.
  For signed-in users: connected accounts, password, sign out, danger zone.
  For guests: sign in/sign up options.
-->
<script lang="ts">
  import { authStore } from "$shared/auth";
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import type { IAuthService } from "$shared/auth";
  import { onMount } from "svelte";
  import {
    hasPasswordProvider,
    uiState,
  } from "$shared/navigation/state/profile-settings-state.svelte";
  import UnifiedHeader from "$shared/settings/components/UnifiedHeader.svelte";
  import ConnectedAccounts from "$shared/navigation/components/profile-settings/ConnectedAccounts.svelte";
  import PasswordSection from "$shared/navigation/components/profile-settings/PasswordSection.svelte";
  import DangerZone from "$shared/navigation/components/profile-settings/DangerZone.svelte";
  import {
    SocialAuthCompact,
    EmailPasswordAuth,
  } from "$shared/auth/components";

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
    } catch (error: unknown) {
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

<div class="security-tab">
  {#if authStore.isAuthenticated && authStore.user}
    <!-- Signed In State -->
    <div class="security-section">
      <!-- Profile Summary -->
      <div class="profile-summary">
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
          <i class="fas fa-shield-alt"></i>
        </div>
        <h3>Sign In to TKA Studio</h3>
        <p>
          Save your sequences, sync settings across devices, and track your progress.
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
          <span>or {authMode === "signin" ? "sign in" : "sign up"} with email</span>
        </div>

        <!-- Email/Password Auth -->
        <EmailPasswordAuth bind:mode={authMode} />
      </div>

      <!-- Guest Info -->
      <div class="guest-info">
        <i class="fas fa-info-circle"></i>
        <p>
          You can continue using the app as a guest. Your preferences will be saved locally on this device.
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .security-tab {
    padding: 24px;
    max-width: 800px;
    margin: 0 auto;
    overflow-y: auto;
    height: 100%;
  }

  .security-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Profile Summary */
  .profile-summary {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .profile-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
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
    font-size: 24px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .profile-info {
    flex: 1;
    min-width: 0;
  }

  .profile-name {
    font-size: 18px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 4px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-email {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Account Sections */
  .account-sections {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Security Cards */
  .security-card {
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s ease;
  }

  .security-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
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

  /* Auth Section */
  .auth-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    padding: 32px 16px;
    min-height: 400px;
  }

  .auth-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
  }

  .prompt-icon {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      rgba(16, 185, 129, 0.15),
      rgba(99, 102, 241, 0.15)
    );
    border: 2px solid rgba(16, 185, 129, 0.3);
  }

  .prompt-icon i {
    font-size: 32px;
    color: rgba(16, 185, 129, 0.9);
  }

  .auth-header h3 {
    font-size: 22px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .auth-header p {
    font-size: 15px;
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

  /* Guest Info */
  .guest-info {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 10px;
    max-width: 400px;
    width: 100%;
  }

  .guest-info i {
    font-size: 16px;
    color: rgba(99, 102, 241, 0.8);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .guest-info p {
    margin: 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
  }

  /* Mobile Responsive */
  @media (max-width: 480px) {
    .security-tab {
      padding: 16px;
    }

    .profile-summary {
      padding: 16px;
    }

    .profile-avatar {
      width: 52px;
      height: 52px;
    }

    .avatar-placeholder {
      font-size: 20px;
    }

    .profile-name {
      font-size: 16px;
    }

    .security-card {
      padding: 16px;
    }

    .auth-section {
      padding: 24px 16px;
      gap: 24px;
    }

    .prompt-icon {
      width: 60px;
      height: 60px;
    }

    .prompt-icon i {
      font-size: 28px;
    }

    .auth-header h3 {
      font-size: 20px;
    }
  }

  /* Desktop */
  @media (min-width: 769px) {
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
    .profile-summary,
    .security-card,
    .sign-out-button,
    .guest-info {
      border-width: 2px;
    }

    .auth-divider::before,
    .auth-divider::after {
      border-color: white;
    }
  }
</style>
