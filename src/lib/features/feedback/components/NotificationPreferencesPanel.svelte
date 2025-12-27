<!--
  NotificationPreferencesPanel - User Notification Settings

  Allows users to control which notification types they want to receive.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import { notificationPreferencesService } from "../services/implementations/NotificationPreferencesManager";
  import type {
    NotificationPreferences,
    NotificationType,
  } from "../domain/models/notification-models";
  import {
    DEFAULT_NOTIFICATION_PREFERENCES,
    NOTIFICATION_TYPE_CONFIG,
    getPreferenceKeyForType,
  } from "../domain/models/notification-models";
  import PreferenceGroup from "./notifications/PreferenceGroup.svelte";
  import type { PreferenceItem } from "./notifications/PreferenceItem";

  // State
  let preferences = $state<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  let isLoading = $state(true);
  let bulkBusy = $state<"enable" | "disable" | null>(null);
  let bulkPressed = $state<"enable" | "disable" | null>(null);
  let pendingKeys = $state<Set<keyof NotificationPreferences>>(new Set());

  // Load preferences on mount
  onMount(async () => {
    await loadPreferences();
  });

  async function loadPreferences() {
    const user = authState.user;
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
    const user = authState.user;
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
    const user = authState.user;
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
    const user = authState.user;
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

  // Preference descriptions (keyed by notification type for clarity)
  const typeDescriptions: Record<NotificationType, string> = {
    "feedback-resolved": "When your feedback is marked as resolved",
    "feedback-in-progress": "When work starts on your feedback",
    "feedback-needs-info": "When admin needs more details from you",
    "feedback-response": "When admin sends you a message",
    "sequence-liked": "When someone likes your sequence",
    "user-followed": "When someone follows you",
    "achievement-unlocked": "When you unlock an achievement",
    "message-received": "When you receive a direct message",
    "admin-new-user-signup": "When a new user signs up",
    "system-announcement": "Important system announcements",
  };

  // Dynamically generate preference groups from NOTIFICATION_TYPE_CONFIG
  function generatePreferenceGroups(): {
    title: string;
    description: string;
    items: PreferenceItem[];
  }[] {
    const groups: {
      title: string;
      description: string;
      items: PreferenceItem[];
    }[] = [];

    // Group by category
    const feedback: PreferenceItem[] = [];
    const sequence: PreferenceItem[] = [];
    const social: PreferenceItem[] = [];
    const admin: PreferenceItem[] = [];

    for (const [type, config] of Object.entries(NOTIFICATION_TYPE_CONFIG)) {
      const prefKey = getPreferenceKeyForType(type as NotificationType);
      if (!prefKey) continue; // Skip types without preferences (system-announcement)

      const item: PreferenceItem = {
        key: prefKey,
        label: config.label,
        description: typeDescriptions[type as NotificationType] || config.label,
      };

      // Categorize
      if (type.startsWith("feedback-")) {
        feedback.push(item);
      } else if (type.startsWith("sequence-")) {
        sequence.push(item);
      } else if (type === "user-followed" || type === "achievement-unlocked") {
        social.push(item);
      } else if (type === "admin-new-user-signup") {
        admin.push(item);
      }
    }

    if (feedback.length > 0) {
      groups.push({
        title: "Feedback Notifications",
        description: "Get notified when your feedback is addressed",
        items: feedback,
      });
    }

    if (sequence.length > 0) {
      groups.push({
        title: "Sequence Engagement",
        description: "Get notified when others interact with your sequences",
        items: sequence,
      });
    }

    if (social.length > 0) {
      groups.push({
        title: "Social & Achievements",
        description: "Get notified about followers and milestones",
        items: social,
      });
    }

    if (admin.length > 0) {
      groups.push({
        title: "Admin Notifications",
        description: "Get notified about important admin events",
        items: admin,
      });
    }

    return groups;
  }

  const preferenceGroups = $derived(generatePreferenceGroups());
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
  {:else if !authState.isAuthenticated}
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
          {preferences}
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
    transition:
      transform 180ms ease,
      box-shadow 180ms ease,
      border-color 180ms ease,
      filter 180ms ease,
      background 180ms ease;
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

  /* ============================================================================
     SYSTEM NOTICE
     ============================================================================ */
  .system-notice {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: color-mix(in srgb, var(--theme-accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-accent) 20%, transparent);
    border-radius: 8px;
  }

  .system-notice i {
    color: color-mix(in srgb, var(--theme-accent) 80%, transparent);
    font-size: 14px;
    flex-shrink: 0;
  }

  .system-notice p {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
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
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .action-button {
      transition: none;
    }
  }
</style>
