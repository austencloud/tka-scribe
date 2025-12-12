<!-- MyFeedbackDetail - Detail view with confirmation flow -->
<script lang="ts">
  import type {
    FeedbackItem,
    TesterConfirmationStatus,
    FeedbackType,
    FeedbackStatus,
    FeedbackPriority,
  } from "../../domain/models/feedback-models";
  import {
    STATUS_CONFIG,
    TYPE_CONFIG,
    PRIORITY_CONFIG,
    CONFIRMATION_STATUS_CONFIG,
  } from "../../domain/models/feedback-models";
  import FeedbackEditDrawer from "./FeedbackEditDrawer.svelte";
  import FeedbackReplyPanel from "./FeedbackReplyPanel.svelte";
  import { useUserPreview } from "$lib/shared/debug/context/user-preview-context";

  const { item, onClose, onUpdate } = $props<{
    item: FeedbackItem;
    onClose: () => void;
    onUpdate: (feedbackId: string, updates: { type?: FeedbackType; description?: string }, appendMode?: boolean) => Promise<FeedbackItem>;
  }>();

  // Get preview context for read-only checks
  const preview = useUserPreview();

  let isEditDrawerOpen = $state(false);

  const typeConfig = $derived(TYPE_CONFIG[item.type as FeedbackType]);
  const statusConfig = $derived(STATUS_CONFIG[item.status as FeedbackStatus]);
  const priorityConfig = $derived(item.priority
    ? PRIORITY_CONFIG[item.priority as FeedbackPriority]
    : null);

  // Preview mode = read-only, no editing allowed
  const isPreviewMode = $derived(preview.isReadOnly);

  // Can edit if new, in-progress, or in-review (not completed/archived) AND not in preview mode
  const canEdit = $derived(
    !isPreviewMode && ["new", "in-progress", "in-review"].includes(item.status)
  );

  // Full edit mode only for "new" status, otherwise append mode
  const isAppendMode = $derived(item.status !== "new");

  // Check if should show reply panel (for feedback-needs-info or feedback-response statuses)
  const shouldShowReplyPanel = $derived(
    ["feedback-needs-info", "feedback-response"].includes(item.status)
  );

  let isReplySubmitting = $state(false);

  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  async function handleSave(updates: { type?: FeedbackType; description: string }, appendMode: boolean) {
    await onUpdate(item.id, updates, appendMode);
  }

  async function handleReplySubmit(reply: string) {
    isReplySubmitting = true;
    try {
      await onUpdate(item.id, { description: reply }, true);
    } finally {
      isReplySubmitting = false;
    }
  }
</script>

<div class="detail-panel">
  <!-- Header -->
  <header class="panel-header">
    <div class="header-actions">
      {#if canEdit}
        <button
          class="edit-button"
          onclick={() => (isEditDrawerOpen = true)}
          type="button"
          aria-label="Edit feedback"
        >
          <i class="fas fa-pen"></i>
        </button>
      {/if}
      <button
        class="close-button"
        onclick={onClose}
        type="button"
        aria-label="Close detail panel"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
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
        <span
          class="priority-badge"
          style="--badge-color: {priorityConfig.color}"
        >
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
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="screenshot-link"
            >
              <img
                src={imageUrl}
                alt="Screenshot {index + 1}"
                class="screenshot-thumb"
              />
              <div class="screenshot-overlay">
                <i class="fas fa-search-plus"></i>
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Context info -->
    {#if item.capturedModule}
      <div class="context-section">
        <h3>Context</h3>
        <div class="context-tags">
          <span class="context-tag">
            <i class="fas fa-cube"></i>
            {item.capturedModule}
          </span>
          {#if item.capturedTab}
            <span class="context-tag">
              <i class="fas fa-folder"></i>
              {item.capturedTab}
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

    <!-- Reply Panel (for feedback-needs-info and feedback-response) -->
    {#if shouldShowReplyPanel && !isPreviewMode}
      <FeedbackReplyPanel
        {item}
        onSubmit={handleReplySubmit}
        isLoading={isReplySubmitting}
      />
    {/if}
  </div>

  <!-- Edit Drawer -->
  <FeedbackEditDrawer
    bind:isOpen={isEditDrawerOpen}
    {item}
    appendMode={isAppendMode}
    onSave={handleSave}
  />
</div>

<style>
  .detail-panel {
    display: flex;
    flex-direction: column;
    width: 400px;
    max-width: 50%;
    height: 100%;
    background: var(--theme-panel-bg, #12121a);
    border-left: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    overflow: hidden;
    flex-shrink: 0;
  }

  /* Header */
  .panel-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    flex-shrink: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  .edit-button,
  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--theme-card-bg, rgba(30, 30, 40, 0.95));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .edit-button:hover,
  .close-button:hover {
    background: var(--theme-card-hover-bg, rgba(40, 40, 50, 0.98));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.3));
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    transform: translateY(-1px);
  }

  .edit-button:hover {
    border-color: color-mix(in srgb, var(--theme-accent, #3b82f6) 50%, transparent);
    color: var(--theme-accent, #3b82f6);
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
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--badge-color) 40%, rgba(20, 20, 25, 0.9)),
      color-mix(in srgb, var(--badge-color) 25%, rgba(15, 15, 20, 0.9))
    );
    border: 1px solid color-mix(in srgb, var(--badge-color) 30%, transparent);
    border-radius: 14px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--badge-color);
    box-shadow: 0 2px 6px color-mix(in srgb, var(--badge-color) 20%, black);
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
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    line-height: 1.4;
  }

  .meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
    font-size: 0.8125rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .meta-row span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Sections */
  .description-section,
  .context-section,
  .response-section {
    margin-bottom: 20px;
  }

  .description-section h3,
  .context-section h3,
  .response-section h3 {
    margin: 0 0 8px 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .response-section h3 {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--theme-accent, #3b82f6);
  }

  .description {
    margin: 0;
    font-size: 0.9375rem;
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
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
    background: var(--theme-card-bg, rgba(30, 30, 40, 0.95));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 6px;
    font-size: 0.8125rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .context-tag i {
    font-size: 0.75rem;
    opacity: 0.6;
  }

  /* Response card */
  .response-card {
    padding: 12px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #3b82f6) 25%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent, #3b82f6) 15%, transparent) 100%
    );
    border: 1.5px solid color-mix(in srgb, var(--theme-accent, #3b82f6) 50%, transparent);
    border-radius: 10px;
    box-shadow:
      0 4px 16px color-mix(in srgb, var(--theme-accent, #3b82f6) 20%, transparent),
      0 0 0 1px color-mix(in srgb, var(--theme-accent, #3b82f6) 15%, transparent);
  }

  .response-message {
    margin: 0 0 8px 0;
    font-size: 0.9375rem;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .response-date {
    font-size: 0.75rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  /* Resolution card styling */
  .response-card.resolution {
    background: linear-gradient(
      135deg,
      rgba(16, 185, 129, 0.25) 0%,
      rgba(16, 185, 129, 0.15) 100%
    );
    border: 1.5px solid rgba(16, 185, 129, 0.5);
    box-shadow:
      0 4px 16px rgba(16, 185, 129, 0.2),
      0 0 0 1px rgba(16, 185, 129, 0.15);
  }

  /* Screenshots */
  .screenshots-section {
    margin-bottom: 24px;
  }

  .screenshots-section h3 {
    margin: 0 0 12px 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
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
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.3));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    transition: all 200ms ease;
  }

  .screenshot-link:hover {
    border-color: color-mix(in srgb, var(--theme-accent-strong, #6366f1) 50%, transparent);
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
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
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
      background: var(--theme-panel-bg, #12121a);
    }
  }
</style>
