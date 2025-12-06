<!--
  NotificationPreferencesPanel - User Notification Settings

  Allows users to control which notification types they want to receive.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import { notificationPreferencesService } from "../services/implementations/NotificationPreferencesService";
  import type { NotificationPreferences } from "../domain/models/notification-models";
  import { DEFAULT_NOTIFICATION_PREFERENCES } from "../domain/models/notification-models";

  // State
  let preferences = $state<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  let isLoading = $state(true);
  let isSaving = $state(false);

  // Load preferences on mount
  onMount(async () => {
    await loadPreferences();
  });

  async function loadPreferences() {
    const user = authStore.user;
    if (!user) {
      isLoading = false;
      return;
    }

    try {
      isLoading = true;
      preferences = await notificationPreferencesService.getPreferences(
        user.uid
      );
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      isLoading = false;
    }
  }

  async function togglePreference(key: keyof NotificationPreferences) {
    const user = authStore.user;
    if (!user || isSaving) return;

    try {
      isSaving = true;
      // Optimistic update
      preferences = { ...preferences, [key]: !preferences[key] };
      await notificationPreferencesService.togglePreference(user.uid, key);
    } catch (error) {
      console.error("Failed to toggle preference:", error);
      // Revert on error
      await loadPreferences();
    } finally {
      isSaving = false;
    }
  }

  async function enableAll() {
    const user = authStore.user;
    if (!user || isSaving) return;

    try {
      isSaving = true;
      await notificationPreferencesService.enableAll(user.uid);
      await loadPreferences();
    } catch (error) {
      console.error("Failed to enable all:", error);
    } finally {
      isSaving = false;
    }
  }

  async function disableAll() {
    const user = authStore.user;
    if (!user || isSaving) return;

    try {
      isSaving = true;
      await notificationPreferencesService.disableAll(user.uid);
      await loadPreferences();
    } catch (error) {
      console.error("Failed to disable all:", error);
    } finally {
      isSaving = false;
    }
  }

  // Preference groups for organization
  const preferenceGroups = [
    {
      title: "Feedback Notifications",
      description: "Get notified when your feedback is addressed",
      items: [
        {
          key: "feedbackResolved" as const,
          label: "Feedback Resolved",
          description: "When your feedback is marked as resolved",
        },
        {
          key: "feedbackInProgress" as const,
          label: "Being Worked On",
          description: "When work starts on your feedback",
        },
        {
          key: "feedbackNeedsInfo" as const,
          label: "More Info Needed",
          description: "When admin needs more details from you",
        },
        {
          key: "feedbackResponse" as const,
          label: "Admin Response",
          description: "When admin sends you a message",
        },
      ],
    },
    {
      title: "Sequence Engagement",
      description: "Get notified when others interact with your sequences",
      items: [
        {
          key: "sequenceSaved" as const,
          label: "Sequence Saved",
          description: "When someone saves your sequence",
        },
        {
          key: "sequenceVideoSubmitted" as const,
          label: "Video Submitted",
          description: "When someone submits a video of your sequence",
        },
        {
          key: "sequenceLiked" as const,
          label: "Sequence Liked",
          description: "When someone likes your sequence",
        },
        {
          key: "sequenceCommented" as const,
          label: "New Comment",
          description: "When someone comments on your sequence",
        },
      ],
    },
    {
      title: "Social & Achievements",
      description: "Get notified about followers and milestones",
      items: [
        {
          key: "userFollowed" as const,
          label: "New Follower",
          description: "When someone follows you",
        },
        {
          key: "achievementUnlocked" as const,
          label: "Achievement Unlocked",
          description: "When you unlock an achievement",
        },
      ],
    },
  ];
</script>

<div class="notification-preferences-panel">
  <div class="panel-header">
    <h2>Notification Preferences</h2>
    <p class="subtitle">Choose which notifications you want to receive</p>
  </div>

  {#if isLoading}
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading preferences...</p>
    </div>
  {:else if !authStore.isAuthenticated}
    <div class="empty-state">
      <i class="fas fa-user-slash"></i>
      <p>Sign in to manage notification preferences</p>
    </div>
  {:else}
    <!-- Quick Actions -->
    <div class="quick-actions">
      <button
        class="action-button"
        onclick={enableAll}
        disabled={isSaving}
        aria-label="Enable all notifications"
      >
        <i class="fas fa-check-circle"></i>
        Enable All
      </button>
      <button
        class="action-button"
        onclick={disableAll}
        disabled={isSaving}
        aria-label="Disable all notifications"
      >
        <i class="fas fa-times-circle"></i>
        Disable All
      </button>
    </div>

    <!-- Preference Groups -->
    {#each preferenceGroups as group}
      <div class="preference-group">
        <div class="group-header">
          <h3>{group.title}</h3>
          <p class="group-description">{group.description}</p>
        </div>

        <div class="preference-items">
          {#each group.items as item}
            <button
              class="preference-item"
              class:enabled={preferences[item.key]}
              onclick={() => togglePreference(item.key)}
              disabled={isSaving}
              aria-label="Toggle {item.label}"
            >
              <div class="item-content">
                <div class="item-header">
                  <span class="item-label">{item.label}</span>
                  <div
                    class="toggle-switch"
                    class:enabled={preferences[item.key]}
                  >
                    <div class="toggle-thumb"></div>
                  </div>
                </div>
                <p class="item-description">{item.description}</p>
              </div>
            </button>
          {/each}
        </div>
      </div>
    {/each}

    <!-- System Notifications Notice -->
    <div class="system-notice">
      <i class="fas fa-info-circle"></i>
      <p>System announcements cannot be disabled and will always be shown.</p>
    </div>
  {/if}
</div>

<style>
  .notification-preferences-panel {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
  }

  /* ============================================================================
     PANEL HEADER
     ============================================================================ */
  .panel-header {
    margin-bottom: 32px;
  }

  .panel-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 8px 0;
  }

  .subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  /* ============================================================================
     LOADING/EMPTY STATES
     ============================================================================ */
  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 52px 24px;
    color: rgba(255, 255, 255, 0.5);
  }

  .loading-state i,
  .empty-state i {
    font-size: 32px;
  }

  /* ============================================================================
     QUICK ACTIONS
     ============================================================================ */
  .quick-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }

  .action-button {
    flex: 1;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .action-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.95);
  }

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ============================================================================
     PREFERENCE GROUPS
     ============================================================================ */
  .preference-group {
    margin-bottom: 32px;
  }

  .group-header {
    margin-bottom: 16px;
  }

  .group-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 4px 0;
  }

  .group-description {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }

  .preference-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* ============================================================================
     PREFERENCE ITEM
     ============================================================================ */
  .preference-item {
    width: 100%;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .preference-item:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .preference-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .preference-item.enabled {
    border-color: rgba(16, 185, 129, 0.3);
  }

  .item-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .item-label {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .item-description {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }

  /* ============================================================================
     TOGGLE SWITCH
     ============================================================================ */
  .toggle-switch {
    width: 44px;
    height: 24px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    position: relative;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
  }

  .toggle-switch.enabled {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  .toggle-thumb {
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 3px;
    left: 3px;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-switch.enabled .toggle-thumb {
    transform: translateX(20px);
  }

  /* ============================================================================
     SYSTEM NOTICE
     ============================================================================ */
  .system-notice {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 10px;
    margin-top: 24px;
  }

  .system-notice i {
    color: rgba(99, 102, 241, 0.8);
    font-size: 16px;
  }

  .system-notice p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 640px) {
    .notification-preferences-panel {
      padding: 16px;
    }

    .panel-header h2 {
      font-size: 20px;
    }

    .quick-actions {
      flex-direction: column;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .preference-item,
    .action-button,
    .toggle-switch,
    .toggle-thumb {
      transition: none;
    }
  }
</style>
