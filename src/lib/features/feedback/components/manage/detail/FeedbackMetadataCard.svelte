<script lang="ts">
  import type { FeedbackDetailState } from "../../../state/feedback-detail-state.svelte";
  import RobustAvatar from "$lib/shared/components/avatar/RobustAvatar.svelte";

  const { detailState } = $props<{ detailState: FeedbackDetailState }>();
</script>

<section class="section">
  <h3 class="section-title">Submitted By</h3>
  <div class="user-card">
    <RobustAvatar
      src={detailState.item.userPhotoURL}
      name={detailState.item.userDisplayName}
      alt="{detailState.item.userDisplayName}'s avatar"
      size="lg"
    />
    <div class="user-info">
      <span class="user-name">{detailState.item.userDisplayName}</span>
      <span class="user-email">{detailState.item.userEmail}</span>
    </div>
    <div class="user-time">
      <span class="time-relative"
        >{detailState.formatRelativeTime(detailState.item.createdAt)}</span
      >
      <span class="time-absolute"
        >{detailState.formatDate(detailState.item.createdAt)}</span
      >
    </div>
  </div>
</section>

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-sm);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    margin: 0;
    font-size: var(--fb-text-xs);
    font-weight: 600;
    color: var(--fb-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .user-card {
    display: flex;
    align-items: center;
    gap: var(--fb-space-md);
    padding: var(--fb-space-md);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
  }

  /* RobustAvatar handles its own sizing via size="lg" (64px) */

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: var(--fb-text-sm);
    font-weight: 600;
    color: var(--fb-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-email {
    font-size: var(--fb-text-xs);
    color: var(--fb-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-time {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: right;
    flex-shrink: 0;
  }

  .time-relative {
    font-size: var(--fb-text-xs);
    font-weight: 500;
    color: var(--fb-text);
  }

  .time-absolute {
    font-size: var(--fb-text-xs);
    color: var(--fb-text-muted);
  }
</style>
