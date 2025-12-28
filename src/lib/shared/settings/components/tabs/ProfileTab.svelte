<!-- ProfileTab.svelte - User Profile & Account Settings (Refactored) -->
<script lang="ts">
  import { authState } from "../../../auth/state/authState.svelte";
  import { resolve, TYPES } from "../../../inversify/di";
  import type { IAuthenticator } from "../../../auth/services/contracts/IAuthenticator";
  import type { IAccountManager } from "../../../auth/services/contracts/IAccountManager";
  import type { IStepUpAuthCoordinator } from "../../../auth/services/contracts/IStepUpAuthCoordinator";
  import { onMount } from "svelte";
  import {
    hasPasswordProvider,
    passwordState,
    resetPasswordForm,
    uiState,
  } from "../../../navigation/state/profile-settings-state.svelte";
  import ConnectedAccounts from "../../../navigation/components/profile-settings/ConnectedAccounts.svelte";
  import {
    type ProviderConfig,
    type ProviderId,
  } from "../../../navigation/components/profile-settings/connectedAccounts.providers";
  import PasswordSection from "../../../navigation/components/profile-settings/PasswordSection.svelte";
  import DangerZone from "../../../navigation/components/profile-settings/DangerZone.svelte";
  import AccountSecuritySection from "../../../auth/components/AccountSecuritySection.svelte";
  import SubscriptionCard from "./profile/SubscriptionCard.svelte";
  import type { IHapticFeedback } from "../../../application/services/contracts/IHapticFeedback";
  import PasskeyStepUpModal from "../../../auth/components/PasskeyStepUpModal.svelte";
  import GlassCard from "./profile/GlassCard.svelte";
  import ProfileHeroSection from "./profile/ProfileHeroSection.svelte";
  import StorageSection from "./profile/StorageSection.svelte";
  import AuthPrompt from "./profile/AuthPrompt.svelte";
  import ProviderManagementDrawer from "./profile/ProviderManagementDrawer.svelte";

  interface Props {
    currentSettings?: unknown;
    onSettingUpdate?: (event: { key: string; value: unknown }) => void;
  }

  let {
    currentSettings: _currentSettings,
    onSettingUpdate: _onSettingUpdate,
  }: Props = $props();

  // Services
  let hapticService = $state<IHapticFeedback | null>(null);
  let authService = $state<IAuthenticator | null>(null);
  let accountManager = $state<IAccountManager | null>(null);
  let stepUpCoordinator = $state<IStepUpAuthCoordinator | null>(null);

  // Cache clearing state
  let clearingCache = $state(false);

  // Entry animation
  let isVisible = $state(false);

  // Provider drawer state (for mobile tap-to-manage)
  let showProviderDrawer = $state(false);
  let selectedProviderId = $state<ProviderId | null>(null);
  let selectedProviderConfig = $state<ProviderConfig | null>(null);
  let selectedProviderEmail = $state<string | null>(null);
  let connectedAccountsRef = $state<{
    requestDisconnect: (id: ProviderId) => void;
    getCanUnlink: () => boolean;
  } | null>(null);

  // Computed: can user unlink providers?
  const canUnlinkProviders = $derived(
    Boolean(authState.user?.providerData && authState.user.providerData.length > 1)
  );

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(TYPES.IHapticFeedback);
    authService = resolve<IAuthenticator>(TYPES.IAuthenticator);
    accountManager = resolve<IAccountManager>(TYPES.IAccountManager);
    stepUpCoordinator = resolve<IStepUpAuthCoordinator>(
      TYPES.IStepUpAuthCoordinator
    );

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
    if (!accountManager || uiState.saving) return;

    uiState.saving = true;

    try {
      await accountManager.changePassword(
        passwordState.current,
        passwordState.new
      );
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
    if (!accountManager) return;

    // This is called after the user has typed "DELETE" to confirm
    try {
      await accountManager.deleteAccount();
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    }
  }

  async function handleClearCache() {
    if (!accountManager) return;

    if (
      !confirm(
        "Clear all cached data?\n\n" +
          "This will remove locally stored data and reload the page. " +
          "Your account and saved sequences are not affected."
      )
    ) {
      return;
    }

    clearingCache = true;

    try {
      await accountManager.clearCache();
    } catch (error) {
      clearingCache = false;
    }
  }

  // Provider drawer handlers
  function handleProviderSelect(
    providerId: ProviderId,
    config: ProviderConfig,
    email: string | null
  ) {
    selectedProviderId = providerId;
    selectedProviderConfig = config;
    selectedProviderEmail = email;
    showProviderDrawer = true;
  }

  function closeProviderDrawer() {
    showProviderDrawer = false;
  }

  function handleDisconnectFromDrawer() {
    if (!selectedProviderId || !connectedAccountsRef) return;
    const providerToDisconnect = selectedProviderId;
    closeProviderDrawer();
    // Small delay to let drawer close
    setTimeout(() => {
      connectedAccountsRef?.requestDisconnect(providerToDisconnect);
    }, 150);
  }
</script>

<div class="profile-tab" class:visible={isVisible}>
  {#if authState.isAuthenticated && authState.user}
    <!-- Signed In State -->
    <div class="profile-content">
      <!-- Profile Hero -->
      <ProfileHeroSection user={authState.user} onSignOut={handleSignOut} />

      <!-- Settings Grid - CSS Grid with intelligent auto-placement -->
      <div class="settings-grid">
        <!-- Connected Accounts -->
        <GlassCard
          icon="fas fa-link"
          title="Connected Accounts"
          subtitle="Manage linked providers"
        >
          {#snippet children()}
            <ConnectedAccounts
              bind:this={connectedAccountsRef}
              onProviderSelect={handleProviderSelect}
            />
          {/snippet}
        </GlassCard>

        <!-- Subscription -->
        <GlassCard
          icon="fas fa-crown"
          iconClass="premium-icon"
          title="Subscription"
          subtitle="Support TKA development"
        >
          {#snippet children()}
            <SubscriptionCard {hapticService} />
          {/snippet}
        </GlassCard>

        <!-- Security -->
        {#if authService}
          <GlassCard
            icon="fas fa-shield-alt"
            title="Security"
            subtitle="Protect sensitive actions"
          >
            {#snippet children()}
              <AccountSecuritySection {hapticService} />
            {/snippet}
          </GlassCard>
        {/if}

        <!-- Password Section (only for password-authenticated users) -->
        {#if hasPasswordProvider()}
          <GlassCard
            icon="fas fa-key"
            title="Password"
            subtitle="Update your account security"
          >
            {#snippet children()}
              <PasswordSection
                onChangePassword={handleChangePassword}
                {hapticService}
              />
            {/snippet}
          </GlassCard>
        {/if}

        <!-- Storage Section -->
        <StorageSection
          onClearCache={handleClearCache}
          isClearing={clearingCache}
        />
      </div>

      <!-- Danger Zone - Full width, separated from grid -->
      <GlassCard
        class="danger-card"
        icon="fas fa-skull"
        iconClass="danger-icon"
        title="Danger Zone"
        subtitle="Irreversible account actions"
      >
        {#snippet children()}
          <DangerZone
            onDeleteAccount={handleDeleteAccount}
            {hapticService}
            userIdentifier={authState.user?.displayName ||
              authState.user?.email ||
              ""}
          />
        {/snippet}
      </GlassCard>
    </div>
  {:else}
    <!-- Signed Out State -->
    <AuthPrompt onFacebookAuth={handleFacebookAuth} />
  {/if}
</div>

{#if stepUpCoordinator}
  <PasskeyStepUpModal
    isOpen={stepUpCoordinator.showStepUpModal}
    allowPassword={hasPasswordProvider()}
    onSuccess={() => stepUpCoordinator?.handleSuccess()}
    onCancel={() => stepUpCoordinator?.handleCancel()}
  />
{/if}

<!-- Provider Details Drawer (mobile tap-to-manage) -->
<ProviderManagementDrawer
  isOpen={showProviderDrawer}
  providerConfig={selectedProviderConfig}
  providerEmail={selectedProviderEmail}
  canUnlink={canUnlinkProviders}
  onDisconnect={handleDisconnectFromDrawer}
  onCancel={closeProviderDrawer}
/>

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     PROFILE TAB - Lightweight layout container
     All component-specific styles live in child components
     ═══════════════════════════════════════════════════════════════════════════ */
  .profile-tab {
    container-type: inline-size;
    container-name: profile-tab;

    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: clamp(12px, 3cqi, 24px);
    gap: clamp(12px, 2cqi, 20px);
    overflow-y: auto;
    overflow-x: hidden;

    opacity: 0;
    transition: opacity 200ms ease;
  }

  .profile-tab.visible {
    opacity: 1;
  }

  .profile-content {
    display: flex;
    flex-direction: column;
    gap: clamp(12px, 2cqi, 20px);
    max-width: 100%;
  }

  /* ========================================
     SETTINGS GRID - CSS Grid with intelligent auto-placement
     Grid automatically balances cards across columns
     ======================================== */
  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr));
    gap: clamp(10px, 2cqi, 16px);
    grid-auto-flow: dense; /* Intelligent placement to fill gaps */
    align-items: start; /* Prevent stretching */
  }

  /* Single column on narrow screens */
  @container profile-tab (max-width: 600px) {
    .settings-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Tighter spacing on very small screens */
  @container profile-tab (max-width: 360px) {
    .settings-grid {
      gap: 8px;
    }
  }

  /* ========================================
     DANGER CARD & PREMIUM ICON - Special styles
     ======================================== */
  :global(.danger-card) {
    background: var(
      --theme-danger-bg,
      linear-gradient(
        135deg,
        rgba(70, 15, 20, 0.9) 0%,
        rgba(85, 20, 25, 0.85) 100%
      )
    );
    border: 1px solid var(--theme-danger-border);
    box-shadow: var(
      --theme-danger-shadow,
      inset 0 1px 0 rgba(239, 68, 68, 0.15),
      0 4px 20px var(--theme-shadow)
    );
  }

  :global(.danger-card:hover) {
    background: var(
      --theme-danger-hover-bg,
      linear-gradient(
        135deg,
        rgba(85, 18, 25, 0.92) 0%,
        rgba(100, 25, 30, 0.88) 100%
      )
    );
    border-color: var(--theme-danger-hover-border);
    box-shadow: var(
      --theme-danger-hover-shadow,
      inset 0 1px 0 rgba(239, 68, 68, 0.2),
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(239, 68, 68, 0.15)
    );
  }

  :global(.danger-card .card-icon) {
    background: rgba(239, 68, 68, 0.2);
    color: var(--semantic-error);
  }

  :global(.danger-card .card-title) {
    color: #fecaca;
  }

  :global(.premium-icon) {
    background: linear-gradient(
      135deg,
      rgba(245, 158, 11, 0.2),
      rgba(251, 191, 36, 0.15)
    );
    color: var(--semantic-warning);
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
    .profile-tab {
      transition: none;
    }
  }
</style>
