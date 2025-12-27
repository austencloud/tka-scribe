<!--
  ConnectedAccounts Component

  Displays linked OAuth providers and allows users to:
  - View currently linked accounts (Google, Facebook, Email/Password)
  - Link new providers to their account
  - Unlink providers (if more than one is linked)
-->
<script lang="ts">
  import { authState } from "../../../auth/state/authState.svelte";
  import { resolve, TYPES } from "../../../inversify/di";
  import type { IAuthenticator } from "../../../auth/services/contracts/IAuthenticator";
  import type { IHapticFeedback } from "../../../application/services/contracts/IHapticFeedback";
  import { onMount } from "svelte";
  import EmailLinkingDrawer from "../../../auth/components/EmailLinkingDrawer.svelte";
  import {
    PROVIDERS,
    type ProviderConfig,
    type ProviderId,
  } from "./connectedAccounts.providers";

  interface Props {
    onProviderSelect?: (
      providerId: ProviderId,
      config: ProviderConfig,
      email: string | null
    ) => void;
    onDisconnectRequest?: (providerId: ProviderId) => void;
  }

  let { onProviderSelect, onDisconnectRequest }: Props = $props();

  // Expose disconnect function for parent to call
  export function requestDisconnect(providerId: ProviderId) {
    unlinkProvider(providerId);
  }

  // Expose canUnlink status
  export function getCanUnlink() {
    return linkedProviders.length > 1;
  }

  // Services
  let authService = $state<IAuthenticator | null>(null);
  let hapticService = $state<IHapticFeedback | null>(null);

  // UI State
  let linkingProvider = $state<ProviderId | null>(null);
  let unlinkingProvider = $state<ProviderId | null>(null);
  let errorMessage = $state<string | null>(null);

  // Email linking drawer state
  let showEmailLinkingDrawer = $state(false);

  onMount(() => {
    authService = resolve<IAuthenticator>(TYPES.IAuthenticator);
    hapticService = resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  });

  // Derived state
  const linkedProviders = $derived(
    authState.user?.providerData?.map((p) => p.providerId) ?? []
  );

  const availableProviders = $derived(
    (Object.keys(PROVIDERS) as ProviderId[]).filter(
      (id) => !linkedProviders.includes(id)
    )
  );

  const canUnlink = $derived(linkedProviders.length > 1);

  // Get provider details from providerData
  function getProviderEmail(providerId: string): string | null {
    const provider = authState.user?.providerData?.find(
      (p) => p.providerId === providerId
    );
    return provider?.email ?? null;
  }

  // Link a new provider
  async function linkProvider(providerId: ProviderId) {
    if (!authService || linkingProvider) return;

    linkingProvider = providerId;
    errorMessage = null;
    hapticService?.trigger("selection");

    try {
      if (providerId === "google.com") {
        await authService.linkGoogleAccount();
      } else if (providerId === "facebook.com") {
        await authService.linkFacebookAccount();
      }
      // Note: Email/password linking requires a separate flow with password input
      hapticService?.trigger("success");
    } catch (error: unknown) {
      console.error(`Failed to link ${providerId}:`, error);
      const message = error instanceof Error ? error.message : "Unknown error";

      // Handle specific Firebase errors
      if (message.includes("already linked")) {
        errorMessage = `This ${PROVIDERS[providerId].name} account is already linked.`;
      } else if (message.includes("credential-already-in-use")) {
        errorMessage = `This ${PROVIDERS[providerId].name} account is already linked to another user.`;
      } else {
        errorMessage = `Failed to link ${PROVIDERS[providerId].name}. Please try again.`;
      }

      hapticService?.trigger("error");
    } finally {
      linkingProvider = null;
    }
  }

  // Unlink a provider
  async function unlinkProvider(providerId: ProviderId) {
    if (!authService || unlinkingProvider || !canUnlink) return;

    // Confirm before unlinking
    const providerName = PROVIDERS[providerId].name;
    const confirmed = confirm(
      `Are you sure you want to disconnect ${providerName}? You won't be able to sign in with ${providerName} anymore.`
    );

    if (!confirmed) return;

    unlinkingProvider = providerId;
    errorMessage = null;
    hapticService?.trigger("selection");

    try {
      await authService.unlinkProvider(providerId);
      hapticService?.trigger("success");
    } catch (error: unknown) {
      console.error(`Failed to unlink ${providerId}:`, error);
      const message = error instanceof Error ? error.message : "Unknown error";

      if (message.includes("only authentication method")) {
        errorMessage = "Cannot disconnect your only sign-in method.";
      } else {
        errorMessage = `Failed to disconnect ${providerName}. Please try again.`;
      }

      hapticService?.trigger("error");
    } finally {
      unlinkingProvider = null;
    }
  }

  function dismissError() {
    errorMessage = null;
  }

  // Email linking drawer functions
  function openEmailLinkingDrawer() {
    showEmailLinkingDrawer = true;
    hapticService?.trigger("selection");
  }

  function handleEmailLinkingSuccess() {
    // The drawer handles closing itself
    // We just need to show feedback if needed
    hapticService?.trigger("success");
  }

  // Open provider details (calls parent callback for drawer)
  function handleProviderTap(providerId: ProviderId) {
    hapticService?.trigger("selection");
    const config = PROVIDERS[providerId];
    const email = getProviderEmail(providerId);
    onProviderSelect?.(providerId, config, email);
  }

  // Check if email is verified
  const isEmailVerified = $derived(authState.user?.emailVerified ?? false);
</script>

<div class="connected-accounts">
  <!-- Error Message -->
  {#if errorMessage}
    <div class="error-banner" role="alert">
      <i class="fas fa-exclamation-circle"></i>
      <span>{errorMessage}</span>
      <button
        class="dismiss-btn"
        onclick={dismissError}
        aria-label="Dismiss error"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  {/if}

  <!-- Linked Accounts Section -->
  {#if linkedProviders.length > 0}
    <div class="section">
      <h4 class="section-title">Linked Accounts</h4>
      <p class="section-description">
        You can sign in with any of these methods
      </p>
      <div class="providers-list">
        {#each linkedProviders as providerId}
          {@const config = PROVIDERS[providerId as ProviderId]}
          {@const email = getProviderEmail(providerId)}
          {@const isUnlinking = unlinkingProvider === providerId}
          {#if config}
            <button
              class="provider-card linked"
              style="--provider-color: {config.color}; --provider-bg: {config.bgColor}; --provider-border: {config.borderColor};"
              onclick={() => handleProviderTap(providerId as ProviderId)}
              type="button"
            >
              <div class="provider-icon">
                <i class={config.icon}></i>
              </div>
              <div class="provider-info">
                <span class="provider-name">{config.name}</span>
                {#if email}
                  <span class="provider-email">{email}</span>
                {/if}
              </div>
              <div class="provider-status">
                {#if providerId === "password" && !isEmailVerified}
                  <span class="verification-badge pending">
                    <i class="fas fa-clock"></i>
                    <span class="badge-text">Unverified</span>
                  </span>
                {:else}
                  <span class="connected-badge">
                    <i class="fas fa-check-circle"></i>
                    <span class="badge-text">Connected</span>
                  </span>
                {/if}
              </div>
              <!-- Desktop: show unlink button inline -->
              {#if canUnlink}
                <span
                  class="unlink-btn desktop-only"
                  role="button"
                  tabindex="-1"
                  onclick={(e) => {
                    e.stopPropagation();
                    unlinkProvider(providerId as ProviderId);
                  }}
                  onkeydown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      unlinkProvider(providerId as ProviderId);
                    }
                  }}
                  aria-label="Disconnect {config.name}"
                >
                  {#if isUnlinking}
                    <i class="fas fa-spinner fa-spin"></i>
                  {:else}
                    <i class="fas fa-unlink"></i>
                  {/if}
                </span>
              {/if}
              <!-- Mobile: show chevron hint -->
              <span class="mobile-chevron">
                <i class="fas fa-chevron-right"></i>
              </span>
            </button>
          {/if}
        {/each}
      </div>
      {#if !canUnlink}
        <p class="hint">
          <i class="fas fa-info-circle"></i>
          Link another account to enable disconnecting
        </p>
      {/if}
    </div>
  {/if}

  <!-- Available Providers Section -->
  {#if availableProviders.length > 0}
    <div class="section">
      <h4 class="section-title">Add Sign-In Method</h4>
      <p class="section-description">
        Link additional accounts for easier access
      </p>
      <div class="providers-list">
        {#each availableProviders as providerId}
          {@const config = PROVIDERS[providerId]}
          {@const isLinking = linkingProvider === providerId}
          {#if providerId === "password"}
            <!-- Email/Password linking - Opens drawer -->
            <button
              class="provider-card available"
              style="--provider-color: {config.color}; --provider-bg: {config.bgColor}; --provider-border: {config.borderColor};"
              onclick={openEmailLinkingDrawer}
              disabled={linkingProvider !== null}
            >
              <div class="provider-icon">
                <i class={config.icon}></i>
              </div>
              <div class="provider-info">
                <span class="provider-name">Add Email & Password</span>
                <span class="provider-description">
                  Sign in with email and password
                </span>
              </div>
              <div class="link-icon">
                <i class="fas fa-plus-circle"></i>
              </div>
            </button>
          {:else}
            <button
              class="provider-card available"
              style="--provider-color: {config.color}; --provider-bg: {config.bgColor}; --provider-border: {config.borderColor};"
              onclick={() => linkProvider(providerId)}
              disabled={isLinking || linkingProvider !== null}
            >
              <div class="provider-icon">
                {#if isLinking}
                  <i class="fas fa-spinner fa-spin"></i>
                {:else}
                  <i class={config.icon}></i>
                {/if}
              </div>
              <div class="provider-info">
                <span class="provider-name">
                  {isLinking
                    ? `Connecting ${config.name}...`
                    : `Connect ${config.name}`}
                </span>
                <span class="provider-description">
                  Sign in with your {config.name} account
                </span>
              </div>
              <div class="link-icon">
                <i class="fas fa-plus-circle"></i>
              </div>
            </button>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

  <!-- Empty State -->
  {#if !linkedProviders.length}
    <div class="empty-state">
      <i class="fas fa-link"></i>
      <p>No accounts connected</p>
    </div>
  {/if}
</div>

<!-- Email Linking Drawer -->
<EmailLinkingDrawer
  bind:isOpen={showEmailLinkingDrawer}
  onSuccess={handleEmailLinkingSuccess}
/>

<style>
  .connected-accounts {
    container-type: inline-size;
    container-name: connected-accounts;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Error Banner */
  .error-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    color: #fca5a5;
    font-size: 14px;
  }

  .error-banner i:first-child {
    color: #ef4444;
    font-size: 16px;
    flex-shrink: 0;
  }

  .error-banner span {
    flex: 1;
    line-height: 1.4;
  }

  .dismiss-btn {
    background: none;
    border: none;
    padding: 4px 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .dismiss-btn:hover {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.8));
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  /* Section Styles */
  .section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-description {
    margin: 0;
    font-size: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    line-height: 1.4;
  }

  /* Provider List */
  .providers-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Provider Card Base */
  .provider-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: var(--provider-bg);
    border: 1px solid var(--provider-border);
    border-radius: 12px;
    transition: all 0.2s ease;
    min-width: 0;
  }

  .provider-card.linked {
    cursor: pointer;
    width: 100%;
    text-align: left;
    font-family: inherit;
  }

  .provider-card.linked:hover {
    background: color-mix(in srgb, var(--provider-bg) 100%, white 5%);
    border-color: var(--provider-color);
  }

  .provider-card.linked:active {
    transform: scale(0.99);
  }

  .provider-card.available {
    cursor: pointer;
    width: 100%;
    text-align: left;
    font-family: inherit;
  }

  .provider-card.available:hover:not(:disabled) {
    background: color-mix(in srgb, var(--provider-bg) 100%, white 5%);
    border-color: var(--provider-color);
    transform: translateY(-1px);
  }

  .provider-card.available:active:not(:disabled) {
    transform: translateY(0) scale(0.99);
  }

  .provider-card.available:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Provider Icon */
  .provider-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    flex-shrink: 0;
  }

  .provider-icon i {
    font-size: 18px;
    color: var(--provider-color);
  }

  /* Provider Info */
  .provider-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .provider-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .provider-email,
  .provider-description {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Connected Badge */
  .provider-status {
    flex-shrink: 0;
  }

  .connected-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(34, 197, 94, 0.15);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    color: #4ade80;
  }

  .connected-badge i {
    font-size: 12px;
  }

  /* Verification Badge (for unverified email) */
  .verification-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }

  .verification-badge.pending {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
  }

  .verification-badge i {
    font-size: 12px;
  }

  /* Unlink Button - Desktop only */
  .unlink-btn {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .unlink-btn:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .unlink-btn i {
    font-size: 14px;
  }

  /* Mobile chevron - shows on mobile to indicate tappable */
  .mobile-chevron {
    display: none;
    align-items: center;
    justify-content: center;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    font-size: 14px;
    flex-shrink: 0;
  }

  /* Link Icon (for available providers) */
  .link-icon {
    flex-shrink: 0;
    color: var(--provider-color);
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  .provider-card.available:hover:not(:disabled) .link-icon {
    opacity: 1;
    transform: scale(1.1);
  }

  .link-icon i {
    font-size: 20px;
  }

  /* Hint */
  .hint {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    margin: 4px 0 0 0;
    padding: 8px 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border-radius: 8px;
  }

  .hint i {
    font-size: 14px;
    color: color-mix(in srgb, var(--theme-accent) 70%, transparent);
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 32px 16px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .empty-state i {
    font-size: 32px;
    opacity: 0.5;
  }

  .empty-state p {
    margin: 0;
    font-size: 14px;
  }

  /* Mobile - compact layout, use tap-to-manage pattern */
  @container connected-accounts (max-width: 400px) {
    .provider-card {
      padding: 12px 14px;
      gap: 10px;
    }

    .provider-icon {
      width: 36px;
      height: 36px;
    }

    .provider-icon i {
      font-size: 16px;
    }

    .provider-name {
      font-size: 14px;
    }

    .provider-email,
    .provider-description {
      font-size: 12px;
    }

    .connected-badge,
    .verification-badge {
      padding: 5px 8px;
      font-size: 11px;
      gap: 4px;
    }

    /* Hide badge text on mobile to prevent overflow */
    .badge-text {
      display: none;
    }

    /* Hide desktop unlink button on mobile - use drawer instead */
    .unlink-btn.desktop-only {
      display: none;
    }

    /* Show chevron on mobile to indicate tappable */
    .mobile-chevron {
      display: flex;
    }

    /* Hide hint on mobile - drawer explains it */
    .hint {
      display: none;
    }
  }

  /* Accessibility - Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .provider-card,
    .unlink-btn,
    .link-icon,
    .dismiss-btn {
      transition: none;
    }

    .provider-card.available:hover:not(:disabled),
    .provider-card.available:active:not(:disabled) {
      transform: none;
    }
  }

  /* Accessibility - High Contrast */
  @media (prefers-contrast: high) {
    .provider-card,
    .error-banner,
    .unlink-btn {
      border-width: 2px;
    }

    .connected-badge {
      background: rgba(34, 197, 94, 0.3);
    }
  }

  /* Focus States */
  .provider-card.available:focus-visible,
  .provider-card.linked:focus-visible,
  .unlink-btn:focus-visible,
  .dismiss-btn:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--theme-accent) 80%, transparent);
    outline-offset: 2px;
  }
</style>
