<script lang="ts">
  import type { Announcement } from "$lib/features/admin/domain/models/announcement-models";
  import AnnouncementItem from "./AnnouncementItem.svelte";
  import NotificationsSectionShell from "./NotificationsSectionShell.svelte";

  interface Props {
    announcements?: Announcement[];
    isLoading?: boolean;
    dismissedAnnouncements?: Set<string>;
    severityColor: (severity: Announcement["severity"]) => string;
    formatDate: (date: Date) => string;
  }

  let {
    announcements = [],
    isLoading = false,
    dismissedAnnouncements = new Set<string>(),
    severityColor,
    formatDate
  }: Props = $props();
</script>

<NotificationsSectionShell
  eyebrow="Announcements"
  title="System messages & releases"
>
  {#if isLoading}
    <div class="loading-state panel-shell">
      <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
      <p>Loading announcements...</p>
    </div>
  {:else if announcements.length === 0}
    <div class="empty-state panel-shell">
      <i class="fas fa-inbox" aria-hidden="true"></i>
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
    color: var(--theme-text-dim);
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
    color: var(--theme-text);
  }

  .empty-state span {
    font-size: 13px;
    color: var(--theme-text-dim);
  }
</style>
