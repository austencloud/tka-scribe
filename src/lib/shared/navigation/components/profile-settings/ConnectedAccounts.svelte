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
    type ProviderId,
  } from "./connectedAccounts.providers";

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
    // Check if authService is available
    if (!authService) {
      console.error("Auth service not available - cannot link provider");
      errorMessage = "Unable to connect. Please refresh the page and try again.";
      hapticService?.trigger("error");
      return;
    }

    // Prevent double-clicking
    if (linkingProvider) return;

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
      // Note: linkWithRedirect navigates away, so success feedback happens on return
    } catch (error: unknown) {
      console.error(`Failed to link ${providerId}:`, error);
      const message = error instanceof Error ? error.message : "Unknown error";

      // Handle specific Firebase errors
      if (message.includes("already linked")) {
        errorMessage = `This ${PROVIDERS[providerId].name} account is already linked.`;
      } else if (message.includes("credential-already-in-use")) {
        errorMessage = `This ${PROVIDERS[providerId].name} account is already linked to another user.`;
      } else if (message.includes("No user is currently signed in")) {
        errorMessage = "You must be signed in to link accounts.";
      } else {
        errorMessage = `Failed to link ${PROVIDERS[providerId].name}. Please try again.`;
      }

      hapticService?.trigger("error");
      linkingProvider = null;
    }
    // Note: Don't reset linkingProvider in finally - redirect flow means page navigates away
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

  // Check if email is verified
  const isEmailVerified = $derived(authState.user?.emailVerified ?? false);
</script>

<div class="connected-accounts">
  <!-- Error Message -->
  {#if errorMessage}
    <div class="error-banner" role="alert">
      <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
      <span>{errorMessage}</span>
      <button
        class="dismiss-btn"
        onclick={dismissError}
        aria-label="Dismiss error"
      >
        <i class="fas fa-times" aria-hidden="true"></i>
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
            <div
              class="provider-card linked"
              style="--provider-color: {config.color}; --provider-bg: {config.bgColor}; --provider-border: {config.borderColor};"
            >
              <div class="provider-icon">
                <i class={config.icon} aria-hidden="true"></i>
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
                    <i class="fas fa-clock" aria-hidden="true"></i>
                    <span class="badge-text">Unverified</span>
                  </span>
                {:else}
                  <span class="connected-badge">
                    <i class="fas fa-check-circle" aria-hidden="true"></i>
                    <span class="badge-text">Connected</span>
                  </span>
                {/if}
              </div>
              <!-- Unlink button - visible on all screen sizes -->
              {#if canUnlink}
                <span
                  class="unlink-btn"
                  role="button"
                  tabindex="0"
                  onclick={(e) => {
                    e.stopPropagation();
                    unlinkProvider(providerId as ProviderId);
                  }}
                  onkeydown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      unlinkProvider(providerId as ProviderId);
                    }
                  }}
                  aria-label="Disconnect {config.name}"
                >
                  {#if isUnlinking}
                    <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                  {:else}
                    <i class="fas fa-unlink" aria-hidden="true"></i>
                  {/if}
                </span>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
      {#if !canUnlink}
        <p class="hint">
          <i class="fas fa-info-circle" aria-hidden="true"></i>
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
                <i class={config.icon} aria-hidden="true"></i>
              </div>
              <div class="provider-info">
                <span class="provider-name">Add Email & Password</span>
                <span class="provider-description">
                  Sign in with email and password
                </span>
              </div>
              <div class="link-icon">
                <i class="fas fa-plus-circle" aria-hidden="true"></i>
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
                  <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                {:else}
                  <i class={config.icon} aria-hidden="true"></i>
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
                <i class="fas fa-plus-circle" aria-hidden="true"></i>
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
      <i class="fas fa-link" aria-hidden="true"></i>
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
    font-size: var(--font-size-sm);
  }

  .error-banner i:first-child {
    color: var(--semantic-error);
    font-size: var(--font-size-base);
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
    color: var(--theme-text-dim, var(--theme-text-dim));
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .dismiss-btn:hover {
    color: var(--theme-text-dim);
    background: var(--theme-stroke);
  }

  /* Section Styles */
  .section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-title {
    margin: 0;
    font-size: var(--font-size-compact);
    font-weight: 600;
    color: var(--theme-text-dim, var(--theme-text-dim));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-description {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--theme-text-dim, var(--theme-text-dim));
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
    width: 100%;
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
    background: var(--theme-stroke);
    border-radius: 10px;
    flex-shrink: 0;
  }

  .provider-icon i {
    font-size: var(--font-size-lg);
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
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--theme-text);
  }

  .provider-email,
  .provider-description {
    font-size: var(--font-size-compact);
    color: var(--theme-text-dim, var(--theme-text-dim));
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
    font-size: var(--font-size-compact);
    font-weight: 500;
    color: #4ade80;
  }

  .connected-badge i {
    font-size: var(--font-size-compact);
  }

  /* Verification Badge (for unverified email) */
  .verification-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 20px;
    font-size: var(--font-size-compact);
    font-weight: 500;
  }

  .verification-badge.pending {
    background: rgba(245, 158, 11, 0.15);
    color: var(--semantic-warning);
  }

  .verification-badge i {
    font-size: var(--font-size-compact);
  }

  /* Unlink Button - Desktop only */
  .unlink-btn {
    width: 48px; /* WCAG AAA touch target */
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-hover-bg, var(--theme-card-bg));
    border: 1px solid var(--theme-stroke, var(--theme-stroke));
    border-radius: 10px;
    color: var(--theme-text-dim, var(--theme-text-dim));
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .unlink-btn:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: var(--semantic-error);
  }

  .unlink-btn i {
    font-size: var(--font-size-sm);
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
    font-size: var(--font-size-xl);
  }

  /* Hint */
  .hint {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-compact);
    color: var(--theme-text-dim);
    margin: 4px 0 0 0;
    padding: 8px 12px;
    background: var(--theme-card-bg);
    border-radius: 8px;
  }

  .hint i {
    font-size: var(--font-size-sm);
    color: color-mix(in srgb, var(--theme-accent) 70%, transparent);
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 32px 16px;
    color: var(--theme-text-dim);
  }

  .empty-state i {
    font-size: var(--font-size-3xl);
    opacity: 0.5;
  }

  .empty-state p {
    margin: 0;
    font-size: var(--font-size-sm);
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
      font-size: var(--font-size-base);
    }

    .provider-name {
      font-size: var(--font-size-sm);
    }

    .provider-email,
    .provider-description {
      font-size: var(--font-size-compact);
    }

    .connected-badge,
    .verification-badge {
      padding: 5px 8px;
      font-size: var(--font-size-compact);
      gap: 4px;
    }

    /* Hide badge text on mobile to prevent overflow */
    .badge-text {
      display: none;
    }

    /* Compact unlink button on mobile - icon only */
    .unlink-btn {
      width: 40px;
      height: 40px;
    }

    /* Keep hint visible on mobile */
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
  .unlink-btn:focus-visible,
  .dismiss-btn:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--theme-accent) 80%, transparent);
    outline-offset: 2px;
  }
</style>
