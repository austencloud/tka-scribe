<!--
  AnnouncementChecker - Check and Display Undismissed Announcements

  Runs on app load to check for announcements that need to be shown as modals.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { loadSharedModules } from "$lib/shared/inversify/container";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IAnnouncementService } from "../services/contracts/IAnnouncementService";
  import type { Announcement } from "../domain/models/announcement-models";
  import AnnouncementModal from "./AnnouncementModal.svelte";

  // Services
  let announcementService: IAnnouncementService | null = null;

  // State
  let pendingAnnouncements = $state<Announcement[]>([]);
  let currentAnnouncement = $state<Announcement | null>(null);

  // Watch for auth state changes
  $effect(() => {
    if (authStore.isAuthenticated && authStore.user) {
      checkForAnnouncements();
    }
  });

  onMount(async () => {
    try {
      // Wait for Tier 2 modules (including admin) to load
      await loadSharedModules();

      announcementService = resolve<IAnnouncementService>(
        TYPES.IAnnouncementService
      );

      if (authStore.isAuthenticated) {
        checkForAnnouncements();
      }
    } catch (error) {
      console.error("Failed to initialize announcement checker:", error);
    }
  });

  async function checkForAnnouncements() {
    if (!announcementService || !authStore.user) return;

    try {
      const undismissed =
        await announcementService.getUndismissedModalAnnouncements(
          authStore.user.uid
        );

      pendingAnnouncements = undismissed;
      if (undismissed.length > 0) {
        currentAnnouncement = undismissed[0] ?? null;
      }
    } catch (error) {
      console.error("Failed to check for announcements:", error);
    }
  }

  function handleDismiss() {
    // Remove current announcement from queue
    pendingAnnouncements = pendingAnnouncements.slice(1);

    // Show next announcement if available
    if (pendingAnnouncements.length > 0) {
      currentAnnouncement = pendingAnnouncements[0] ?? null;
    } else {
      currentAnnouncement = null;
    }
  }
</script>

{#if currentAnnouncement}
  <AnnouncementModal
    announcement={currentAnnouncement}
    onDismiss={handleDismiss}
  />
{/if}
