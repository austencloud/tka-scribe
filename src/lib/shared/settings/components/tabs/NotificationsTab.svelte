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
  import NotificationsHero from "$lib/shared/settings/components/notifications/NotificationsHero.svelte";
  import NotificationsAnnouncementsSection from "$lib/shared/settings/components/notifications/NotificationsAnnouncementsSection.svelte";
  import NotificationsSectionShell from "$lib/shared/settings/components/notifications/NotificationsSectionShell.svelte";

  // Services
  let announcementService: IAnnouncementService | null = null;

  // State
  let announcements = $state<Announcement[]>([]);
  let dismissedAnnouncements = $state<Set<string>>(new Set());
  let isLoading = $state(true);

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
  <NotificationsHero />

  <section class="content">
    <NotificationsSectionShell eyebrow="Preferences" title="What you want to hear about">
      <NotificationPreferencesPanel />
    </NotificationsSectionShell>

    <NotificationsAnnouncementsSection
      {announcements}
      {isLoading}
      dismissedAnnouncements={dismissedAnnouncements}
      severityColor={getSeverityColor}
      formatDate={formatDate}
    />
  </section>
</div>

<style>
  .notifications-tab {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
  }


  /* Responsive */
  @media (max-width: 900px) {
    .content {
      grid-template-columns: 1fr;
    }

    .hero {
      padding: 16px;
    }
  }

  @media (max-width: 640px) {
    .notifications-tab {
      gap: 16px;
    }
  }
</style>
