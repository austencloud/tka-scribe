<!--
  ProfileSettingsSheet - Profile & Account Settings

  Clean architecture coordinator component.
  Delegates to PersonalTab and AccountTab sub-components.
  Handles business logic and state management.
-->
<script lang="ts">
  import { authStore } from "$shared/auth";
  import { resolve, TYPES, type IHapticFeedbackService, BottomSheet } from "$shared";
  import { onMount } from "svelte";
  import {
    uiState,
    viewportState,
    setupViewportTracking,
    syncWithAuthStore,
    resetPasswordForm,
    resetUIState,
    passwordState
  } from "../state/profile-settings-state.svelte";
  import PersonalTab from "./profile-settings/PersonalTab.svelte";
  import AccountTab from "./profile-settings/AccountTab.svelte";

  // Props
  let { isOpen = false, onClose } = $props<{
    isOpen?: boolean;
    onClose: () => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService | null = null;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
    syncWithAuthStore();
  });

  // Sync with auth store
  $effect(() => {
    if (authStore.user) {
      syncWithAuthStore();
    }
  });

  // Setup viewport tracking
  $effect(() => {
    const cleanup = setupViewportTracking();
    return cleanup || undefined;
  });

  // ============================================================================
  // TAB NAVIGATION
  // ============================================================================

  function handleTabKeydown(event: KeyboardEvent, tabName: 'personal' | 'security') {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      hapticService?.trigger("selection");

      const tabs: Array<'personal' | 'security'> = ['personal', 'security'];
      const currentIndex = tabs.indexOf(tabName);
      let newIndex: number;

      if (event.key === 'ArrowLeft') {
        newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      } else {
        newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
      }

      uiState.activeTab = tabs[newIndex];

      // Focus the newly activated tab
      const newTabButton = document.getElementById(`${tabs[newIndex]}-tab`);
      newTabButton?.focus();
    }
  }

  // ============================================================================
  // BUSINESS LOGIC HANDLERS
  // ============================================================================

  async function handleSavePersonalInfo() {
    if (uiState.saving) return;

    hapticService?.trigger("selection");
    uiState.saving = true;

    try {
      // TODO: Implement profile update via Firebase
      console.log("Saving personal info");
      hapticService?.trigger("success");
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      hapticService?.trigger("error");
      alert("Failed to update profile. Please try again.");
    } finally {
      uiState.saving = false;
    }
  }

  async function handlePhotoUpload(file: File) {
    hapticService?.trigger("selection");
    uiState.uploadingPhoto = true;

    try {
      // TODO: Implement photo upload to Firebase Storage
      console.log("Uploading photo:", file);
      hapticService?.trigger("success");
      alert("Profile photo updated!");
    } catch (error) {
      console.error("Failed to upload photo:", error);
      hapticService?.trigger("error");
      alert("Failed to upload photo. Please try again.");
    } finally {
      uiState.uploadingPhoto = false;
    }
  }

  async function handleChangePassword() {
    if (uiState.saving) return;
    if (passwordState.new !== passwordState.confirm) {
      alert("Passwords don't match!");
      return;
    }

    hapticService?.trigger("selection");
    uiState.saving = true;

    try {
      // TODO: Implement password change via Firebase
      console.log("Changing password");
      hapticService?.trigger("success");
      alert("Password changed successfully!");
      resetPasswordForm();
      uiState.showPasswordSection = false;
    } catch (error) {
      console.error("Failed to change password:", error);
      hapticService?.trigger("error");
      alert("Failed to change password. Please try again.");
    } finally {
      uiState.saving = false;
    }
  }

  async function handleDownloadData() {
    hapticService?.trigger("selection");

    try {
      // TODO: Implement data export
      console.log("Downloading user data");
      alert("Data export will be sent to your email.");
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("Failed to export data. Please try again.");
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
      onClose();
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    }
  }
</script>

<BottomSheet
  {isOpen}
  labelledBy="profile-settings-title"
  on:close={onClose}
  class="profile-settings-sheet"
  backdropClass="profile-settings-sheet__backdrop"
>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <h2 id="profile-settings-title">Account Settings</h2>
      <button
        class="close"
        onclick={onClose}
        aria-label="Close settings"
      >
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </header>

    <!-- Tabs -->
    <div class="tabs" role="tablist" aria-label="Account settings sections">
      <button
        id="personal-tab"
        class="tab"
        class:active={uiState.activeTab === 'personal'}
        role="tab"
        aria-selected={uiState.activeTab === 'personal'}
        aria-controls="personal-panel"
        tabindex={uiState.activeTab === 'personal' ? 0 : -1}
        onclick={() => {
          hapticService?.trigger("selection");
          uiState.activeTab = 'personal';
        }}
        onkeydown={(e) => handleTabKeydown(e, 'personal')}
      >
        <i class="fas fa-user" aria-hidden="true"></i>
        Personal
      </button>
      <button
        id="security-tab"
        class="tab"
        class:active={uiState.activeTab === 'security'}
        role="tab"
        aria-selected={uiState.activeTab === 'security'}
        aria-controls="security-panel"
        tabindex={uiState.activeTab === 'security' ? 0 : -1}
        onclick={() => {
          hapticService?.trigger("selection");
          uiState.activeTab = 'security';
        }}
        onkeydown={(e) => handleTabKeydown(e, 'security')}
      >
        <i class="fas fa-shield-alt" aria-hidden="true"></i>
        Security
      </button>
    </div>

    <!-- Content -->
    <div class="content" bind:this={viewportState.contentContainer}>
      {#if uiState.activeTab === 'personal'}
        <div
          id="personal-panel"
          role="tabpanel"
          aria-labelledby="personal-tab"
          tabindex="0"
        >
          <PersonalTab
            onSave={handleSavePersonalInfo}
            onPhotoUpload={handlePhotoUpload}
            {hapticService}
          />
        </div>
      {/if}

      {#if uiState.activeTab === 'security'}
        <div
          id="security-panel"
          role="tabpanel"
          aria-labelledby="security-tab"
          tabindex="0"
        >
          <AccountTab
            onChangePassword={handleChangePassword}
            onDownloadData={handleDownloadData}
            onDeleteAccount={handleDeleteAccount}
            {hapticService}
          />
        </div>
      {/if}
    </div>
  </div>
</BottomSheet>

<style>
  /* Backdrop */
  :global(.profile-settings-sheet__backdrop) {
    z-index: 1200; /* Higher than ProfileSheet (1100) */
  }

  /* Container - 95vh for complex forms */
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 95vh;
    max-height: 95vh;
    background: linear-gradient(
      135deg,
      rgba(20, 25, 35, 0.98) 0%,
      rgba(15, 20, 30, 0.95) 100%
    );
    overflow: hidden;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .header h2 {
    font-size: 24px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .close {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close:hover {
    background: rgba(255, 255, 255, 0.16);
    transform: scale(1.05);
  }

  .close:active {
    transform: scale(0.95);
  }

  /* Tabs */
  .tabs {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 0 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 24px; /* Increased padding for more substantial feel */
    min-height: 48px; /* Increased from 44px for better visual presence */
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: rgba(255, 255, 255, 0.7); /* Improved contrast for WCAG AA */
    font-size: 15px; /* Slightly larger for better readability */
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .tab i {
    font-size: 16px;
  }

  .tab:hover {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.05);
  }

  .tab.active {
    color: rgba(99, 102, 241, 0.95);
    border-bottom-color: rgba(99, 102, 241, 0.9);
  }

  /* Content */
  .content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0; /* Critical: allows flex child to shrink below content size */
  }

  /* Mobile Responsive */
  @media (max-width: 480px) {
    .container {
      height: 98vh;
      max-height: 98vh;
    }

    .header {
      padding: 16px;
    }

    .header h2 {
      font-size: 18px;
    }

    .tabs {
      padding: 0 16px;
      gap: 4px;
    }

    .tab {
      padding: 14px 16px;
      min-height: 48px; /* Maintain substantial touch target size on mobile */
      font-size: 13px;
      gap: 6px;
    }

    .tab i {
      font-size: 14px;
    }
  }

  /* Accessibility - Focus Indicators */
  .close:focus-visible {
    outline: 3px solid rgba(99, 102, 241, 0.9);
    outline-offset: 2px;
  }

  .tab:focus-visible {
    outline: 3px solid rgba(99, 102, 241, 0.9);
    outline-offset: -3px;
    background: rgba(99, 102, 241, 0.1);
  }

  /* Accessibility - Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .close,
    .tab {
      transition: none;
    }

    .close:hover,
    .close:active {
      transform: none;
    }
  }

  /* Accessibility - High Contrast */
  @media (prefers-contrast: high) {
    .container {
      background: rgba(0, 0, 0, 0.98);
      border: 2px solid white;
    }

    .tab:focus-visible {
      outline: 3px solid white;
    }

    .close:focus-visible {
      outline: 3px solid white;
    }
  }
</style>
