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
  import PreferenceGroup from "./notifications/PreferenceGroup.svelte";
  import type { PreferenceItem } from "./notifications/PreferenceItem";

  // State
  let preferences = $state<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  let isLoading = $state(true);
  let bulkBusy: "enable" | "disable" | null = null;
  let bulkPressed: "enable" | "disable" | null = null;
  let pendingKeys = $state<Set<keyof NotificationPreferences>>(new Set());

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
    if (!user) return;
    if (pendingKeys.has(key)) return;

    try {
      pendingKeys.add(key);
      // Optimistic update
      preferences = { ...preferences, [key]: !preferences[key] };
      await notificationPreferencesService.togglePreference(user.uid, key);
    } catch (error) {
      console.error("Failed to toggle preference:", error);
      // Revert on error
      await loadPreferences();
    } finally {
      pendingKeys.delete(key);
    }
  }

  function clearBulkPressedSoon() {
    setTimeout(() => {
      bulkPressed = null;
    }, 120);
  }

  async function enableAll() {
    const user = authStore.user;
    if (!user || bulkBusy) return;

    try {
      bulkBusy = "enable";
      await notificationPreferencesService.enableAll(user.uid);
      await loadPreferences();
    } catch (error) {
      console.error("Failed to enable all:", error);
    } finally {
      bulkBusy = null;
      clearBulkPressedSoon();
    }
  }

  async function disableAll() {
    const user = authStore.user;
    if (!user || bulkBusy) return;

    try {
      bulkBusy = "disable";
      await notificationPreferencesService.disableAll(user.uid);
      await loadPreferences();
    } catch (error) {
      console.error("Failed to disable all:", error);
    } finally {
      bulkBusy = null;
      clearBulkPressedSoon();
    }
  }

  // Preference groups for organization
  const preferenceGroups: {
    title: string;
    description: string;
    items: PreferenceItem[];
  }[] = [
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
    <div class="loading-state shell">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading preferences...</p>
    </div>
  {:else if !authStore.isAuthenticated}
    <div class="empty-state shell">
      <i class="fas fa-user-slash"></i>
      <p>Sign in to manage notification preferences</p>
    </div>
  {:else}
    <!-- Quick Actions -->
    <div class="quick-actions">
      <button
        class="action-button"
        class:pressed={bulkPressed === "enable"}
        onclick={enableAll}
        onpointerdown={() => (bulkPressed = "enable")}
        onpointerup={() => clearBulkPressedSoon()}
        onpointerleave={() => (bulkPressed = null)}
        aria-label="Enable all notifications"
        aria-busy={bulkBusy === "enable"}
      >
        <i class="fas fa-check-circle"></i>
        Enable All
      </button>
      <button
        class="action-button"
        class:pressed={bulkPressed === "disable"}
        onclick={disableAll}
        onpointerdown={() => (bulkPressed = "disable")}
        onpointerup={() => clearBulkPressedSoon()}
        onpointerleave={() => (bulkPressed = null)}
        aria-label="Disable all notifications"
        aria-busy={bulkBusy === "disable"}
      >
        <i class="fas fa-times-circle"></i>
        Disable All
      </button>
    </div>

    <!-- Preference Groups Grid -->
    <div class="preference-groups-grid">
      {#each preferenceGroups as group}
        <PreferenceGroup
          title={group.title}
          description={group.description}
          items={group.items}
          preferences={preferences}
          isBusyKey={(key) => pendingKeys.has(key)}
          onToggle={togglePreference}
        />
      {/each}
    </div>

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
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px;
  }

  /* ============================================================================
     PANEL HEADER
     ============================================================================ */
  .panel-header {
    margin-bottom: 18px;
  }

  .panel-header h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0 0 6px 0;
  }

  .subtitle {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
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
    gap: 10px;
    padding: 40px 18px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  .loading-state i,
  .empty-state i {
    font-size: 32px;
  }

  .shell {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
    border: 1px dashed var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
  }

  /* ============================================================================
     QUICK ACTIONS
     ============================================================================ */
  .quick-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 18px;
  }

  .action-button {
    flex: 1;
    padding: 10px 16px;
    background: linear-gradient(
      135deg,
      var(--theme-card-bg, #0f172a),
      var(--theme-panel-bg, #0b1021)
    );
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 10px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, filter 180ms ease, background 180ms ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-shadow: var(--theme-shadow, 0 10px 24px rgba(0, 0, 0, 0.28));
    -webkit-tap-highlight-color: transparent;
  }

  .action-button:hover:not(:disabled) {
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    transform: translateY(-1px);
    box-shadow: var(--theme-shadow, 0 14px 30px rgba(0, 0, 0, 0.35));
    background: linear-gradient(
      135deg,
      var(--theme-card-hover-bg, #131a2e),
      var(--theme-panel-bg, #0e1426)
    );
  }

  .action-button:active:not(:disabled),
  .action-button.pressed:not(:disabled) {
    transform: translateY(0) scale(0.98);
    box-shadow: var(--theme-shadow, 0 8px 18px rgba(0, 0, 0, 0.25));
    filter: brightness(0.97);
  }

  /* ============================================================================
     PREFERENCE GROUPS GRID
     ============================================================================ */
  .preference-groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 14px;
    margin-bottom: 16px;
  }

  .preference-group {
    display: flex;
    flex-direction: column;
  }

  .group-header {
    margin-bottom: 10px;
  }

  .group-header h3 {
    font-size: 14px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.92);
    margin: 0 0 2px 0;
  }

  .group-description {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    margin: 0;
    line-height: 1.4;
  }

  .preference-items {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* ============================================================================
     PREFERENCE ITEM - Bento Box Chip Style
     ============================================================================ */
  .preference-item {
    width: 100%;
    padding: 14px 14px;
    background: linear-gradient(150deg, #111728, #0d1324);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: left;
    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.32),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .preference-item:hover:not(:disabled) {
    background: linear-gradient(150deg, #131a2e, #0e1426);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow:
      0 14px 36px rgba(0, 0, 0, 0.38),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    transform: translateY(-1px);
  }

  .preference-item:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  .preference-item:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Active (Enabled) State - Gradient Accent */
  .preference-item.enabled {
    background: linear-gradient(150deg, rgba(16, 185, 129, 0.2), rgba(14, 165, 233, 0.16));
    border-color: rgba(110, 231, 183, 0.5);
    box-shadow:
      0 18px 48px rgba(16, 185, 129, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 0 1px rgba(16, 185, 129, 0.2);
  }

  .preference-item.enabled:hover:not(:disabled) {
    background: linear-gradient(150deg, rgba(16, 185, 129, 0.25), rgba(14, 165, 233, 0.2));
    border-color: rgba(110, 231, 183, 0.6);
    box-shadow:
      0 18px 48px rgba(16, 185, 129, 0.32),
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      0 0 0 1px rgba(16, 185, 129, 0.26);
  }

  .item-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .item-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .item-label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.2;
    letter-spacing: -0.08px;
    flex: 1;
  }

  /* Enabled state gets brighter text */
  .preference-item.enabled .item-label {
    color: #6ee7b7;
  }

  .item-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
  }

  .preference-item.enabled .item-status {
    color: #0d1b2a;
    background: linear-gradient(135deg, #6ee7b7, #2dd4bf);
    border-color: transparent;
    box-shadow: 0 6px 18px rgba(109, 231, 183, 0.35);
  }

  .item-description {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
    line-height: 1.4;
  }

  .preference-item.enabled .item-description {
    color: rgba(255, 255, 255, 0.7);
  }

  /* Status indicator icon */
  .item-header::after {
    content: "\f00c"; /* FontAwesome check icon */
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
    font-size: 12px;
    color: transparent;
    transition: color 0.2s ease;
  }

  .preference-item.enabled .item-header::after {
    color: #6ee7b7;
  }

  /* ============================================================================
     SYSTEM NOTICE
     ============================================================================ */
  .system-notice {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 8px;
  }

  .system-notice i {
    color: rgba(99, 102, 241, 0.8);
    font-size: 14px;
    flex-shrink: 0;
  }

  .system-notice p {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    line-height: 1.4;
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 640px) {
    .notification-preferences-panel {
      padding: 14px;
    }

    .panel-header h2 {
      font-size: 18px;
    }

    .quick-actions {
      flex-direction: column;
    }

    .preference-item {
      padding: 14px;
    }

    .item-label {
      font-size: 14px;
    }

    .item-description {
      font-size: 12px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .preference-item,
    .action-button {
      transition: none;
    }

    .preference-item:hover:not(:disabled) {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .preference-item {
      border-width: 2px;
    }

    .preference-item.enabled {
      border-color: rgba(16, 185, 129, 0.8);
    }
  }
</style>
