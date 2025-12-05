<!-- MyFeedbackDetail - Detail view with confirmation flow -->
<script lang="ts">
  import type { FeedbackItem, TesterConfirmationStatus, FeedbackType, FeedbackStatus, FeedbackPriority } from "../../domain/models/feedback-models";
  import {
    STATUS_CONFIG,
    TYPE_CONFIG,
    PRIORITY_CONFIG,
    CONFIRMATION_STATUS_CONFIG,
  } from "../../domain/models/feedback-models";

  const { item, onClose } = $props<{
    item: FeedbackItem;
    onClose: () => void;
  }>();

  const typeConfig = TYPE_CONFIG[item.type as FeedbackType];
  const statusConfig = STATUS_CONFIG[item.status as FeedbackStatus];
  const priorityConfig = item.priority ? PRIORITY_CONFIG[item.priority as FeedbackPriority] : null;

  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
</script>

<div class="detail-panel">
  <!-- Header -->
  <header class="panel-header">
    <button class="close-button" onclick={onClose} type="button">
      <i class="fas fa-times"></i>
    </button>
    <div class="header-meta">
      <span class="type-badge" style="--badge-color: {typeConfig.color}">
        <i class="fas {typeConfig.icon}"></i>
        {typeConfig.label}
      </span>
      <span class="status-badge" style="--badge-color: {statusConfig.color}">
        <i class="fas {statusConfig.icon}"></i>
        {statusConfig.label}
      </span>
      {#if priorityConfig}
        <span class="priority-badge" style="--badge-color: {priorityConfig.color}">
          <i class="fas {priorityConfig.icon}"></i>
          {priorityConfig.label}
        </span>
      {/if}
    </div>
  </header>

  <!-- Content -->
  <div class="panel-content">
    <h2 class="item-title">{item.title}</h2>

    <div class="meta-row">
      <span class="date">
        <i class="fas fa-calendar"></i>
        {formatDate(item.createdAt)}
      </span>
      {#if item.updatedAt}
        <span class="updated">
          <i class="fas fa-clock"></i>
          Updated {formatDate(item.updatedAt)}
        </span>
      {/if}
    </div>

    <div class="description-section">
      <h3>Your Feedback</h3>
      <p class="description">{item.description}</p>
    </div>

    <!-- Screenshots -->
    {#if item.imageUrls && item.imageUrls.length > 0}
      <div class="screenshots-section">
        <h3>Screenshots ({item.imageUrls.length})</h3>
        <div class="screenshots-grid">
          {#each item.imageUrls as imageUrl, index}
            <a href={imageUrl} target="_blank" rel="noopener noreferrer" class="screenshot-link">
              <img src={imageUrl} alt="Screenshot {index + 1}" class="screenshot-thumb" />
              <div class="screenshot-overlay">
                <i class="fas fa-search-plus"></i>
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Context info -->
    {#if item.capturedModule || item.reportedModule}
      <div class="context-section">
        <h3>Context</h3>
        <div class="context-tags">
          <span class="context-tag">
            <i class="fas fa-cube"></i>
            {item.reportedModule || item.capturedModule}
          </span>
          {#if item.reportedTab || item.capturedTab}
            <span class="context-tag">
              <i class="fas fa-folder"></i>
              {item.reportedTab || item.capturedTab}
            </span>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Admin Notes -->
    {#if item.adminNotes}
      <div class="response-section">
        <h3>
          <i class="fas fa-sticky-note"></i>
          Admin Notes
        </h3>
        <div class="response-card">
          <p class="response-message">{item.adminNotes}</p>
        </div>
      </div>
    {/if}

    <!-- Resolution Notes -->
    {#if item.resolutionNotes}
      <div class="response-section">
        <h3>
          <i class="fas fa-check-circle"></i>
          Resolution
        </h3>
        <div class="response-card resolution">
          <p class="response-message">{item.resolutionNotes}</p>
          {#if item.updatedAt}
            <span class="response-date">
              Resolved {formatDate(item.updatedAt)}
            </span>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .detail-panel {
    display: flex;
    flex-direction: column;
    width: 400px;
    max-width: 50%;
    height: 100%;
    background: #12121a;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    flex-shrink: 0;
  }

  /* Header */
  .panel-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .close-button {
    align-self: flex-end;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .header-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .type-badge,
  .status-badge,
  .priority-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: color-mix(in srgb, var(--badge-color) 15%, transparent);
    border-radius: 14px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--badge-color);
  }

  /* Content */
  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .item-title {
    margin: 0 0 12px 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.4;
  }

  .meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .meta-row span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Sections */
  .description-section,
  .context-section,
  .response-section,
  .confirmation-section {
    margin-bottom: 20px;
  }

  .description-section h3,
  .context-section h3,
  .response-section h3,
  .confirmation-section h3 {
    margin: 0 0 8px 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .response-section h3 {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #3b82f6;
  }

  .description {
    margin: 0;
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    white-space: pre-wrap;
  }

  /* Context tags */
  .context-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .context-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .context-tag i {
    font-size: 0.75rem;
    opacity: 0.6;
  }

  /* Response card */
  .response-card {
    padding: 12px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 10px;
  }

  .response-message {
    margin: 0 0 8px 0;
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .response-date {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Resolution card styling */
  .response-card.resolution {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  /* Screenshots */
  .screenshots-section {
    margin-bottom: 24px;
  }

  .screenshots-section h3 {
    margin: 0 0 12px 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .screenshots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .screenshot-link {
    position: relative;
    display: block;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 200ms ease;
  }

  .screenshot-link:hover {
    border-color: rgba(99, 102, 241, 0.5);
    transform: scale(1.05);
  }

  .screenshot-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .screenshot-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    opacity: 0;
    transition: opacity 200ms ease;
  }

  .screenshot-link:hover .screenshot-overlay {
    opacity: 1;
  }

  .screenshot-overlay i {
    font-size: 1.5rem;
    color: white;
  }

  /* Scrollbar */
  .panel-content::-webkit-scrollbar {
    width: 6px;
  }

  .panel-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .panel-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  /* Mobile: Full width overlay */
  @container my-feedback (max-width: 600px) {
    .detail-panel {
      position: absolute;
      inset: 0;
      width: 100%;
      max-width: 100%;
      border-left: none;
      z-index: 10;
      background: #12121a;
    }
  }
</style>
