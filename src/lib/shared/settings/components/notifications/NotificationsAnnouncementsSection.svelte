<script lang="ts">
  import type { Announcement } from "$lib/features/admin/domain/models/announcement-models";
  import AnnouncementItem from "./AnnouncementItem.svelte";
  import NotificationsSectionShell from "./NotificationsSectionShell.svelte";

  export let announcements: Announcement[] = [];
  export let isLoading = false;
  export let dismissedAnnouncements = new Set<string>();
  export let severityColor: (severity: Announcement["severity"]) => string;
  export let formatDate: (date: Date) => string;
</script>

<NotificationsSectionShell eyebrow="Announcements" title="System messages & releases">
  {#if isLoading}
    <div class="loading-state panel-shell">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading announcements...</p>
    </div>
  {:else if announcements.length === 0}
    <div class="empty-state panel-shell">
      <i class="fas fa-inbox"></i>
      <p>No announcements right now</p>
      <span>We’ll post important updates here.</span>
    </div>
  {:else}
    <div class="announcements-list">
      {#each announcements as announcement (announcement.id)}
        <AnnouncementItem
          {announcement}
          dismissed={dismissedAnnouncements.has(announcement.id)}
          {severityColor}
          {formatDate}
        />
      {/each}
    </div>
  {/if}
</NotificationsSectionShell>

<style>
  .announcements-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .panel-shell {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
    border: 1px dashed var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 42px 18px;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
  }

  .loading-state i,
  .empty-state i {
    font-size: 36px;
    opacity: 0.6;
  }

  .empty-state p {
    font-size: 15px;
    font-weight: 600;
    margin: 0;
    color: rgba(255, 255, 255, 0.85);
  }

  .empty-state span {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.55));
  }
</style>
