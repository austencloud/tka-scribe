<!--
  AccountTab Component (Security Tab)

  Handles security & account management: connected accounts, password, data export, account deletion.
  Features centered layout matching PersonalTab with descriptive hints.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import {
    hasPasswordProvider,
    isCompactMode,
    isVeryCompactMode,
  } from "../../state/profile-settings-state.svelte";
  import ConnectedAccounts from "./ConnectedAccounts.svelte";
  import PasswordSection from "./PasswordSection.svelte";
  import DangerZone from "./DangerZone.svelte";

  let { onChangePassword, onDownloadData, onDeleteAccount, hapticService } =
    $props<{
      onChangePassword: () => Promise<void>;
      onDownloadData: () => Promise<void>;
      onDeleteAccount: () => Promise<void>;
      hapticService: IHapticFeedbackService | null;
    }>();
</script>

<section
  class="section section--account"
  class:compact={isCompactMode()}
  class:very-compact={isVeryCompactMode()}
>
  <!-- Centered content container -->
  <div class="form-content">
    <!-- Connected Accounts Card -->
    <div class="security-card">
      <div class="card-header">
        <i class="fas fa-link" aria-hidden="true"></i>
        <h3 class="card-title">Connected Accounts</h3>
      </div>
      <p class="card-description">
        Manage the authentication providers linked to your account
      </p>
      <ConnectedAccounts />
    </div>

    <!-- Password Section (only for password-authenticated users) -->
    {#if hasPasswordProvider()}
      <div class="security-card">
        <div class="card-header">
          <i class="fas fa-key" aria-hidden="true"></i>
          <h3 class="card-title">Password</h3>
        </div>
        <p class="card-description">
          Update your password to keep your account secure
        </p>
        <PasswordSection {onChangePassword} {hapticService} />
      </div>
    {/if}

    <!-- Data Export Card -->
    <div class="security-card">
      <div class="card-header">
        <i class="fas fa-database" aria-hidden="true"></i>
        <h3 class="card-title">Your Data</h3>
      </div>
      <p class="card-description">
        Download a copy of your account data and learning progress
      </p>
      <button class="button button--secondary" onclick={onDownloadData}>
        <i class="fas fa-download" aria-hidden="true"></i>
        Download My Data
      </button>
    </div>

    <!-- Danger Zone -->
    <DangerZone {onDeleteAccount} {hapticService} />
  </div>
</section>

<style>
  /* Section Layout */
  .section {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .form-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 24px;
    min-height: 0;
    transition: padding 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center; /* Center cards horizontally */
    gap: 24px; /* Spacing between cards */
  }

  .section.compact .form-content {
    padding: 18px;
    gap: 18px;
  }

  .section.very-compact .form-content {
    padding: 12px;
    gap: 12px;
  }

  /* Security Cards */
  .security-card {
    width: 100%;
    max-width: 500px; /* Slightly wider than PersonalTab for content */
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    transition: all 0.2s ease;
  }

  .section.compact .security-card {
    padding: 18px;
    border-radius: 12px;
  }

  .section.very-compact .security-card {
    padding: 14px;
    border-radius: 10px;
  }

  .security-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
  }

  /* Card Header */
  .card-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .card-header i {
    font-size: 20px;
    color: rgba(99, 102, 241, 0.8);
  }

  .section.compact .card-header i {
    font-size: 18px;
  }

  .section.very-compact .card-header i {
    font-size: 16px;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    text-align: center;
  }

  .section.compact .card-title {
    font-size: 16px;
  }

  .section.very-compact .card-title {
    font-size: 15px;
  }

  .card-description {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.65);
    text-align: center;
    margin: 0 0 20px 0;
    line-height: 1.5;
  }

  .section.compact .card-description {
    font-size: 13px;
    margin-bottom: 16px;
  }

  .section.very-compact .card-description {
    font-size: 12px;
    margin-bottom: 12px;
  }

  /* Buttons */
  .button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 24px;
    min-height: 48px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    margin-top: 8px;
  }

  .section.compact .button {
    padding: 11px 20px;
    min-height: 44px;
    font-size: 14px;
    gap: 8px;
    border-radius: 8px;
    margin-top: 6px;
  }

  .section.very-compact .button {
    padding: 11px 18px;
    min-height: 44px;
    font-size: 13px;
    gap: 6px;
    border-radius: 8px;
    margin-top: 4px;
  }

  .button i {
    font-size: 16px;
  }

  .section.compact .button i {
    font-size: 14px;
  }

  .section.very-compact .button i {
    font-size: 13px;
  }

  .button--secondary {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .button--secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  .button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Mobile Responsive */
  @media (max-width: 480px) {
    .form-content {
      padding: 16px;
      gap: 16px;
    }

    .security-card {
      padding: 16px;
    }
  }

  /* Accessibility - Focus Indicators */
  .button:focus-visible {
    outline: 3px solid rgba(99, 102, 241, 0.9);
    outline-offset: 2px;
  }

  /* Accessibility - Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .button,
    .security-card {
      transition: none;
    }

    .button:hover,
    .button:active {
      transform: none;
    }
  }

  /* Accessibility - High Contrast */
  @media (prefers-contrast: high) {
    .button:focus-visible {
      outline: 3px solid white;
    }

    .security-card {
      border: 2px solid white;
    }
  }
</style>
