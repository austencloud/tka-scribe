<!--
  NotificationsTab - Notification Center for Users

  Shows system announcements and notification preferences.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IAnnouncementService } from "$lib/features/admin/services/contracts/IAnnouncementService";
  import type { Announcement } from "$lib/features/admin/domain/models/announcement-models";
  import NotificationPreferencesPanel from "$lib/features/feedback/components/NotificationPreferencesPanel.svelte";

  // Services
  let announcementService: IAnnouncementService | null = null;

  // State
  let announcements = $state<Announcement[]>([]);
  let dismissedAnnouncements = $state<Set<string>>(new Set());
  let isLoading = $state(true);
  let activeView = $state<"announcements" | "preferences">("announcements");

  onMount(async () => {
    try {
      announcementService = resolve<IAnnouncementService>(
        TYPES.IAnnouncementService
      );
      await loadAnnouncements();
    } catch (error) {
      console.error("Failed to initialize notification center:", error);
    } finally {
      isLoading = false;
    }
  });

  async function loadAnnouncements() {
    if (!announcementService || !authStore.user) return;

    try {
      const allAnnouncements =
        await announcementService.getActiveAnnouncementsForUser(
          authStore.user.uid
        );

      announcements = allAnnouncements;

      // Load dismissal status for each announcement
      const dismissed = new Set<string>();
      for (const announcement of allAnnouncements) {
        const isDismissed = await announcementService.hasUserDismissed(
          authStore.user.uid,
          announcement.id
        );
        if (isDismissed) {
          dismissed.add(announcement.id);
        }
      }
      dismissedAnnouncements = dismissed;
    } catch (error) {
      console.error("Failed to load announcements:", error);
    }
  }

  function isAnnouncementDismissed(announcementId: string): boolean {
    return dismissedAnnouncements.has(announcementId);
  }

  function getSeverityColor(severity: Announcement["severity"]): string {
    switch (severity) {
      case "critical":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
        return "#6366f1";
    }
  }

  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

<div class="notifications-tab">
  <div class="tab-header">
    <h2>Notifications</h2>
    <div class="view-selector">
      <button
        class="view-button"
        class:active={activeView === "announcements"}
        onclick={() => (activeView = "announcements")}
      >
        <i class="fas fa-bullhorn"></i>
        Announcements
      </button>
      <button
        class="view-button"
        class:active={activeView === "preferences"}
        onclick={() => (activeView = "preferences")}
      >
        <i class="fas fa-cog"></i>
        Preferences
      </button>
    </div>
  </div>

  {#if activeView === "announcements"}
    <div class="announcements-view">
      {#if isLoading}
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading announcements...</p>
        </div>
      {:else if announcements.length === 0}
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>No announcements</p>
          <span>System announcements will appear here</span>
        </div>
      {:else}
        <div class="announcements-list">
          {#each announcements as announcement (announcement.id)}
            <div
              class="announcement-item"
              class:dismissed={isAnnouncementDismissed(announcement.id)}
            >
              <div class="announcement-header">
                <span
                  class="severity-badge"
                  style="background: {getSeverityColor(announcement.severity)};"
                >
                  {announcement.severity}
                </span>
                <span class="announcement-date">
                  {formatDate(announcement.createdAt)}
                </span>
              </div>

              <h3 class="announcement-title">{announcement.title}</h3>
              <p class="announcement-message">{announcement.message}</p>

              {#if announcement.actionUrl}
                <a
                  href={announcement.actionUrl}
                  class="action-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {announcement.actionLabel || "Learn More"}
                  <i class="fas fa-external-link-alt"></i>
                </a>
              {/if}

              {#if isAnnouncementDismissed(announcement.id)}
                <div class="dismissed-badge">
                  <i class="fas fa-check"></i>
                  Dismissed
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <div class="preferences-view">
      <NotificationPreferencesPanel />
    </div>
  {/if}
</div>

<style>
  .notifications-tab {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }

  /* ============================================================================
     TAB HEADER
     ============================================================================ */
  .tab-header {
    margin-bottom: 24px;
  }

  .tab-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 16px 0;
  }

  /* ============================================================================
     VIEW SELECTOR
     ============================================================================ */
  .view-selector {
    display: flex;
    gap: 12px;
  }

  .view-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .view-button.active {
    background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
    border-color: transparent;
    color: white;
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
    text-align: center;
  }

  .loading-state i,
  .empty-state i {
    font-size: 48px;
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }

  .empty-state span {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
  }

  /* ============================================================================
     ANNOUNCEMENTS LIST
     ============================================================================ */
  .announcements-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .announcement-item {
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .announcement-item:not(.dismissed):hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
  }

  .announcement-item.dismissed {
    opacity: 0.6;
  }

  /* ============================================================================
     ANNOUNCEMENT HEADER
     ============================================================================ */
  .announcement-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .severity-badge {
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: white;
    border-radius: 6px;
    letter-spacing: 0.5px;
  }

  .announcement-date {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* ============================================================================
     ANNOUNCEMENT CONTENT
     ============================================================================ */
  .announcement-title {
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 12px 0;
  }

  .announcement-message {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin: 0 0 16px 0;
    white-space: pre-wrap;
  }

  .action-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(99, 102, 241, 0.2);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 8px;
    color: #818cf8;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .action-link:hover {
    background: rgba(99, 102, 241, 0.3);
    border-color: rgba(99, 102, 241, 0.5);
    transform: translateY(-2px);
  }

  .dismissed-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 6px;
    color: #34d399;
    font-size: 12px;
    font-weight: 600;
    margin-top: 12px;
  }

  /* ============================================================================
     PREFERENCES VIEW
     ============================================================================ */
  .preferences-view {
    margin-top: 24px;
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 640px) {
    .tab-header h2 {
      font-size: 20px;
    }

    .view-selector {
      flex-direction: column;
    }
  }
</style>
