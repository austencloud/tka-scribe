<!-- ArchiveEmptyState - Empty state display for archive views -->
<script lang="ts">
  const { icon = "fa-box-open", title, message } = $props<{
    icon?: string;
    title: string;
    message: string;
  }>();
</script>

<div class="empty-state">
  <i class="fas {icon}" aria-hidden="true"></i>
  <h3>{title}</h3>
  <p>{message}</p>
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    text-align: center;
  }

  .empty-state i {
    font-size: 48px;
    color: color-mix(in srgb, var(--theme-text-dim, #6b7280) 40%, transparent);
    margin-bottom: 16px;
  }

  .empty-state h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  .empty-state p {
    margin: 0;
    font-size: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }
</style>
