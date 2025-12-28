<!--
  MigrationModal.svelte

  Simple, friendly announcement about the TKA Studio → TKA Scribe rebrand.
-->
<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import {
    MIGRATION_CONFIG,
    getNewDomainUrl,
  } from "../config/migration-config";
  import { migrationState } from "../state/migration-state.svelte";

  interface Props {
    onDismiss: () => void;
  }

  let { onDismiss }: Props = $props();

  const newUrl = getNewDomainUrl();

  function handleUpdate() {
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
  <div class="modal-content" transition:fly={{ y: 30, duration: 300 }}>
    <!-- Header with app icon -->
    <div class="modal-header">
      <div class="app-icon">
        <i class="fas fa-feather-alt" aria-hidden="true"></i>
      </div>
    </div>

    <!-- Body -->
    <div class="modal-body">
      <h2 id="migration-title">New Name, New Home</h2>

      <p class="announcement">
        <strong>TKA Studio</strong> is now <strong>TKA Scribe</strong>
      </p>

      <div class="domain-change">
        <span class="new-domain">{MIGRATION_CONFIG.NEW_DOMAIN}</span>
      </div>

      <p class="explanation">
        To continue using the app, you'll need to reinstall it from the new
        address. Your account and all your data will be there waiting for you.
      </p>
    </div>

    <!-- Actions - always visible -->
    <div class="modal-footer">
      <button class="primary-button" onclick={handleUpdate}>
        <i class="fas fa-arrow-right" aria-hidden="true"></i>
        Update Now
      </button>

      <button class="dismiss-button" onclick={handleRemindLater}>
        Remind Me Later
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    padding: 20px;
  }

  .modal-content {
    max-width: 400px;
    width: 100%;
    background: var(--theme-panel-bg, rgba(20, 22, 36, 0.98));
    border: 1px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
    border-radius: 20px;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }

  /* Header */
  .modal-header {
    display: flex;
    justify-content: center;
    padding: 32px 24px 16px;
  }

  .app-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 18px;
    font-size: 32px;
    color: white;
  }

  /* Body */
  .modal-body {
    padding: 8px 24px 24px;
    text-align: center;
  }

  .modal-body h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0 0 16px 0;
  }

  .announcement {
    font-size: 16px;
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
    margin: 0 0 20px 0;
  }

  .domain-change {
    display: flex;
    justify-content: center;
    padding: 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .new-domain {
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-accent, #6366f1);
  }

  .explanation {
    font-size: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    line-height: 1.6;
    margin: 0;
  }

  /* Footer with actions */
  .modal-footer {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0 24px 24px;
  }

  .primary-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 16px 24px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
  }

  .dismiss-button {
    padding: 12px 24px;
    background: transparent;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .dismiss-button:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.25));
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
  }

  /* Responsive */
  @media (max-width: 480px) {
    .modal-content {
      border-radius: 16px;
      margin: 12px;
    }

    .modal-header {
      padding: 24px 20px 12px;
    }

    .app-icon {
      width: 64px;
      height: 64px;
      font-size: 28px;
    }

    .modal-body {
      padding: 8px 20px 20px;
    }

    .modal-body h2 {
      font-size: 22px;
    }

    .modal-footer {
      padding: 0 20px 20px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .primary-button:hover {
      transform: none;
    }
  }
</style>
