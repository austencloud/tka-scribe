<!--
  AccountTab Component

  Handles account management: connected accounts, password, data export, account deletion.
  Composes ConnectedAccounts, PasswordSection, and DangerZone components.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { hasPasswordProvider } from "../../state/profile-settings-state.svelte";
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

<section class="section section--account">
  <h3 class="section-title">
    <i class="fas fa-cog"></i>
    Account Management
  </h3>

  <!-- Connected Accounts -->
  <ConnectedAccounts />

  <!-- Password Section (only for password-authenticated users) -->
  {#if hasPasswordProvider()}
    <PasswordSection {onChangePassword} {hapticService} />
  {/if}

  <!-- Data Export -->
  <div class="data-section">
    <h4 class="subsection-title">Your Data</h4>
    <button class="button button--secondary" onclick={onDownloadData}>
      <i class="fas fa-download"></i>
      Download My Data
    </button>
  </div>

  <!-- Danger Zone -->
  <DangerZone {onDeleteAccount} {hapticService} />
</section>

<style>
  .section {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .section--account {
    padding: 24px;
    min-height: auto;
  }

  .section-title {
    display: none; /* Hide since tabs show the title */
  }

  .subsection-title {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 12px 0;
  }

  .data-section {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

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

  .button i {
    font-size: 16px;
  }

  .button--secondary {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .button--secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
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
    .section--account {
      padding: 16px;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .button {
      transition: none;
    }

    .button:hover,
    .button:active {
      transform: none;
    }
  }
</style>
