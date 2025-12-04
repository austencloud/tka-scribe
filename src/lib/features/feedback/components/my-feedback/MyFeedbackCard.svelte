<!-- MyFeedbackCard - Card for tester's own feedback item -->
<script lang="ts">
  import type { FeedbackItem } from "../../domain/models/feedback-models";
  import {
    STATUS_CONFIG,
    TYPE_CONFIG,
    CONFIRMATION_STATUS_CONFIG,
  } from "../../domain/models/feedback-models";

  const { item, isSelected, needsConfirmation, onClick } = $props<{
    item: FeedbackItem;
    isSelected: boolean;
    needsConfirmation: boolean;
    onClick: () => void;
  }>();

  const typeConfig = TYPE_CONFIG[item.type];
  const statusConfig = STATUS_CONFIG[item.status];

  function formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? "Just now" : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }
</script>

<button
  class="feedback-card"
  class:selected={isSelected}
  class:needs-confirmation={needsConfirmation}
  onclick={onClick}
  type="button"
>
  <!-- Type icon -->
  <div class="card-type" style="--type-color: {typeConfig.color}">
    <i class="fas {typeConfig.icon}"></i>
  </div>

  <!-- Content -->
  <div class="card-content">
    <div class="card-header">
      <h3 class="card-title">{item.title}</h3>
      {#if needsConfirmation}
        <span class="confirm-badge">
          <i class="fas fa-bell"></i>
          Confirm
        </span>
      {:else}
        <span class="status-badge" style="--badge-color: {statusConfig.color}">
          <i class="fas {statusConfig.icon}"></i>
          {statusConfig.label}
        </span>
      {/if}
    </div>

    <p class="card-description">{item.description}</p>

    <div class="card-footer">
      <span class="date">{formatDate(item.createdAt)}</span>
      {#if item.adminResponse}
        <span class="has-response">
          <i class="fas fa-reply"></i>
          Response
        </span>
      {/if}
    </div>
  </div>

  <!-- Selection indicator -->
  {#if isSelected}
    <div class="selection-indicator"></div>
  {/if}
</button>

<style>
  .feedback-card {
    position: relative;
    display: flex;
    gap: 12px;
    width: 100%;
    padding: 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .feedback-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .feedback-card.selected {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .feedback-card.needs-confirmation {
    background: rgba(245, 158, 11, 0.08);
    border-color: rgba(245, 158, 11, 0.25);
  }

  .feedback-card.needs-confirmation:hover {
    background: rgba(245, 158, 11, 0.12);
    border-color: rgba(245, 158, 11, 0.35);
  }

  /* Type icon */
  .card-type {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--type-color) 15%, transparent);
    border-radius: 8px;
    color: var(--type-color);
    font-size: 16px;
  }

  /* Content */
  .card-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .card-title {
    flex: 1;
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: color-mix(in srgb, var(--badge-color) 15%, transparent);
    border-radius: 12px;
    font-size: 0.6875rem;
    font-weight: 500;
    color: var(--badge-color);
    white-space: nowrap;
  }

  .status-badge i {
    font-size: 0.625rem;
  }

  .confirm-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: rgba(245, 158, 11, 0.2);
    border-radius: 12px;
    font-size: 0.6875rem;
    font-weight: 600;
    color: #f59e0b;
    white-space: nowrap;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .confirm-badge i {
    font-size: 0.625rem;
  }

  .card-description {
    margin: 0;
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 4px;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .has-response {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #3b82f6;
  }

  .has-response i {
    font-size: 0.6875rem;
  }

  /* Selection indicator */
  .selection-indicator {
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    background: #3b82f6;
    border-radius: 0 2px 2px 0;
  }
</style>
