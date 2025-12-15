<!--
  MigrationModal.svelte

  Full-screen migration notice with seamless PWA installation.
  Shown on first visit and for critical reminders.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { resolve } from "../../inversify/di";
  import { TYPES } from "../../inversify/types";
  import type { IMobileFullscreenService } from "../../mobile/services/contracts/IMobileFullscreenService";
  import type { IPlatformDetectionService } from "../../mobile/services/contracts/IPlatformDetectionService";
  import {
    getInstallInstructions,
    type Platform,
    type Browser,
  } from "../../mobile/config/pwa-install-instructions";
  import PlatformInstructions from "../../mobile/components/PlatformInstructions.svelte";
  import {
    MIGRATION_CONFIG,
    getNewDomainUrl,
    formatDeadline,
  } from "../config/migration-config";
  import { migrationState } from "../state/migration-state.svelte";

  interface Props {
    onDismiss: () => void;
  }

  let { onDismiss }: Props = $props();

  // Services
  let fullscreenService: IMobileFullscreenService | null = null;
  let platformService: IPlatformDetectionService | null = null;

  // State
  let canInstallNatively = $state(false);
  let isInstalling = $state(false);
  let installSuccess = $state(false);
  let showManualGuide = $state(false);
  let platform = $state<Platform>("desktop");
  let browser = $state<Browser>("other");

  // Derived
  const severity = $derived(migrationState.severity);
  const daysLeft = $derived(migrationState.daysUntilDeadline);
  const remindersRemaining = $derived(migrationState.remindersRemaining);
  const isFirstReminder = $derived(migrationState.isFirstReminder);
  const isFinalReminder = $derived(migrationState.isFinalReminder);
  const newUrl = $derived(getNewDomainUrl());
  const instructions = $derived(getInstallInstructions(platform, browser));

  onMount(() => {
    try {
      fullscreenService = resolve<IMobileFullscreenService>(TYPES.IMobileFullscreenService);
      platformService = resolve<IPlatformDetectionService>(TYPES.IPlatformDetectionService);

      // Detect platform
      const detected = platformService.detectPlatformAndBrowser();
      platform = detected.platform;
      browser = detected.browser;

      // Check if native install is available
      canInstallNatively = fullscreenService.canInstallPWA();

      // Listen for install prompt becoming available
      fullscreenService.onInstallPromptAvailable((available) => {
        canInstallNatively = available;
      });
    } catch (e) {
      console.warn("Failed to resolve services for migration modal:", e);
    }
  });

  function getSeverityConfig() {
    switch (severity) {
      case "critical":
        return {
          icon: "fa-exclamation-triangle",
          color: "#ef4444",
          gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))",
          badge: "Action Required",
        };
      case "warning":
        return {
          icon: "fa-exclamation-circle",
          color: "#f59e0b",
          gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))",
          badge: "Important Update",
        };
      default:
        return {
          icon: "fa-info-circle",
          color: "var(--theme-accent, #6366f1)",
          gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1))",
          badge: "Site Update",
        };
    }
  }

  const config = $derived(getSeverityConfig());

  async function handleInstallClick() {
    // First, try native install prompt
    if (canInstallNatively && fullscreenService) {
      isInstalling = true;
      try {
        const accepted = await fullscreenService.promptInstallPWA();
        if (accepted) {
          installSuccess = true;
          // After success, redirect to new domain
          setTimeout(() => {
            window.location.href = newUrl;
          }, 2000);
          return;
        }
      } catch (e) {
        console.warn("Native install failed:", e);
      } finally {
        isInstalling = false;
      }
    }

    // Fall back to manual guide
    showManualGuide = true;
  }

  function handleGoToNewSite() {
    migrationState.markMigrationCompleted();
    window.location.href = newUrl;
  }

  function handleRemindLater() {
    migrationState.recordReminderShown();
    onDismiss();
  }
</script>

<div
  class="modal-overlay"
  transition:fade={{ duration: 200 }}
  role="dialog"
  aria-modal="true"
  aria-labelledby="migration-title"
>
  <div
    class="modal-content"
    class:critical={severity === "critical"}
    transition:fly={{ y: 30, duration: 300 }}
  >
    <!-- Header -->
    <div class="modal-header" style="background: {config.gradient};">
      <div class="header-icon" style="color: {config.color};">
        <i class="fas {config.icon}"></i>
      </div>
      <span class="severity-badge" style="background: {config.color};">
        {config.badge}
      </span>
    </div>

    <!-- Body -->
    <div class="modal-body">
      {#if installSuccess}
        <!-- Success State -->
        <div class="success-state" transition:fade>
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2>App Installed!</h2>
          <p>Redirecting you to the new site...</p>
        </div>
      {:else if showManualGuide}
        <!-- Manual Install Guide -->
        <div class="manual-guide" transition:fade>
          <button class="back-button" onclick={() => (showManualGuide = false)}>
            <i class="fas fa-arrow-left"></i>
            Back
          </button>

          <h2 id="migration-title">Install TKA Scribe</h2>
          <p class="guide-intro">
            Follow these steps to add TKA Scribe to your home screen from
            <strong>{MIGRATION_CONFIG.NEW_DOMAIN}</strong>
          </p>

          <div class="guide-steps">
            <div class="step-zero">
              <div class="step-number">0</div>
              <div class="step-content">
                <strong>First, go to the new site:</strong>
                <a href={newUrl} class="new-site-link" target="_blank" rel="noopener">
                  {MIGRATION_CONFIG.NEW_DOMAIN}
                  <i class="fas fa-external-link-alt"></i>
                </a>
              </div>
            </div>

            <div class="step-divider">
              <span>Then follow these steps:</span>
            </div>

            <PlatformInstructions {instructions} compact={true} />
          </div>

          <div class="guide-footer">
            <button class="primary-button" onclick={handleGoToNewSite}>
              <i class="fas fa-external-link-alt"></i>
              Go to {MIGRATION_CONFIG.NEW_DOMAIN}
            </button>
          </div>
        </div>
      {:else}
        <!-- Main Content -->
        <h2 id="migration-title">We're Moving!</h2>

        <div class="message-content">
          <p class="main-message">
            <strong>TKA Scribe</strong> is moving to a new home:
          </p>

          <div class="domain-change">
            <div class="old-domain">
              <i class="fas fa-times-circle"></i>
              <span>{MIGRATION_CONFIG.OLD_DOMAIN}</span>
            </div>
            <div class="arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
            <div class="new-domain">
              <i class="fas fa-check-circle"></i>
              <span>{MIGRATION_CONFIG.NEW_DOMAIN}</span>
            </div>
          </div>

          <p class="explanation">
            To keep using TKA Scribe, you'll need to reinstall the app from the new address.
            Don't worry — your account and all your data will be there waiting for you!
          </p>

          {#if daysLeft > 0}
            <div class="deadline-info" class:critical={severity === "critical"}>
              <i class="fas fa-calendar-alt"></i>
              <span>
                The old site will stop working on <strong>{formatDeadline()}</strong>
                ({daysLeft} {daysLeft === 1 ? "day" : "days"} remaining)
              </span>
            </div>
          {:else}
            <div class="deadline-info critical">
              <i class="fas fa-exclamation-triangle"></i>
              <span>The old site is being retired. Please update now!</span>
            </div>
          {/if}
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            class="primary-button install-button"
            onclick={handleInstallClick}
            disabled={isInstalling}
          >
            {#if isInstalling}
              <i class="fas fa-spinner fa-spin"></i>
              Installing...
            {:else if canInstallNatively}
              <i class="fas fa-download"></i>
              Install from New Site
            {:else}
              <i class="fas fa-mobile-alt"></i>
              Show Me How
            {/if}
          </button>

          <button class="secondary-button" onclick={handleGoToNewSite}>
            <i class="fas fa-external-link-alt"></i>
            Just Take Me There
          </button>
        </div>

        <!-- Reminder Info -->
        {#if !isFinalReminder && remindersRemaining > 0}
          <div class="reminder-info">
            <button class="remind-later" onclick={handleRemindLater}>
              <i class="fas fa-clock"></i>
              Remind me later
            </button>
            <span class="reminder-count">
              ({remindersRemaining} {remindersRemaining === 1 ? "reminder" : "reminders"} remaining)
            </span>
          </div>
        {:else if isFinalReminder}
          <div class="final-reminder-notice">
            <i class="fas fa-bell"></i>
            This is your final reminder
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    padding: 20px;
  }

  .modal-content {
    max-width: 520px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    background: var(--theme-panel-bg, rgba(20, 22, 36, 0.98));
    border: 1px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
    border-radius: 20px;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
  }

  .modal-content.critical {
    border-color: rgba(239, 68, 68, 0.4);
    box-shadow:
      0 25px 80px rgba(0, 0, 0, 0.6),
      0 0 40px rgba(239, 68, 68, 0.15);
  }

  /* Header */
  .modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px 24px 24px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    font-size: 36px;
  }

  .severity-badge {
    padding: 6px 16px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: white;
    border-radius: 20px;
  }

  /* Body */
  .modal-body {
    padding: 28px 24px 24px;
  }

  .modal-body h2 {
    font-size: 26px;
    font-weight: 700;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0 0 20px 0;
    text-align: center;
  }

  .message-content {
    margin-bottom: 28px;
  }

  .main-message {
    font-size: 15px;
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
    text-align: center;
    margin: 0 0 20px 0;
  }

  /* Domain Change Visual */
  .domain-change {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 20px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .old-domain,
  .new-domain {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
  }

  .old-domain {
    color: rgba(239, 68, 68, 0.9);
    text-decoration: line-through;
    opacity: 0.7;
  }

  .new-domain {
    color: rgba(34, 197, 94, 0.95);
  }

  .arrow {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 18px;
  }

  .explanation {
    font-size: 14px;
    color: var(--theme-text, rgba(255, 255, 255, 0.75));
    line-height: 1.6;
    text-align: center;
    margin: 0 0 20px 0;
  }

  .deadline-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 18px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    font-size: 13px;
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
  }

  .deadline-info.critical {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: rgba(239, 68, 68, 0.95);
  }

  .deadline-info i {
    font-size: 16px;
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .primary-button,
  .secondary-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 16px 24px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .primary-button {
    background: linear-gradient(
      135deg,
      var(--theme-accent, #6366f1) 0%,
      color-mix(in srgb, var(--theme-accent, #6366f1) 80%, #8b5cf6) 100%
    );
    border: none;
    color: white;
  }

  .primary-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--theme-accent, #6366f1) 40%, transparent);
  }

  .primary-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .secondary-button {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .secondary-button:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
  }

  /* Reminder Info */
  .reminder-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .remind-later {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: transparent;
    border: none;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 13px;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .remind-later:hover {
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .reminder-count {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .final-reminder-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(245, 158, 11, 0.95);
  }

  /* Success State */
  .success-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px 20px;
    text-align: center;
  }

  .success-icon {
    font-size: 64px;
    color: rgba(34, 197, 94, 0.95);
  }

  .success-state h2 {
    margin: 0;
    color: rgba(34, 197, 94, 0.95);
  }

  .success-state p {
    margin: 0;
    color: var(--theme-text, rgba(255, 255, 255, 0.75));
  }

  /* Manual Guide */
  .manual-guide {
    position: relative;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
    font-size: 13px;
    cursor: pointer;
    margin-bottom: 16px;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
  }

  .guide-intro {
    font-size: 14px;
    color: var(--theme-text, rgba(255, 255, 255, 0.75));
    text-align: center;
    margin: 0 0 24px 0;
  }

  .guide-steps {
    margin-bottom: 24px;
  }

  .step-zero {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.25);
    border-radius: 12px;
    margin-bottom: 16px;
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(34, 197, 94, 0.2);
    border-radius: 50%;
    font-size: 14px;
    font-weight: 700;
    color: rgba(34, 197, 94, 0.95);
    flex-shrink: 0;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .new-site-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: rgba(34, 197, 94, 0.95);
    font-weight: 600;
    text-decoration: none;
  }

  .new-site-link:hover {
    text-decoration: underline;
  }

  .step-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 0;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 12px;
  }

  .guide-footer {
    padding-top: 16px;
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  /* Responsive */
  @media (max-width: 480px) {
    .modal-content {
      border-radius: 16px;
      margin: 12px;
    }

    .modal-header {
      padding: 24px 16px 20px;
    }

    .header-icon {
      width: 60px;
      height: 60px;
      font-size: 28px;
    }

    .modal-body {
      padding: 20px 16px;
    }

    .modal-body h2 {
      font-size: 22px;
    }

    .domain-change {
      flex-direction: column;
      gap: 12px;
      padding: 16px;
    }

    .arrow {
      transform: rotate(90deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .primary-button:hover {
      transform: none;
    }
  }
</style>
