<!-- MyFeedbackDetail - Detail view with responsive drawer (bottom sheet on mobile, side panel on desktop) -->
<script lang="ts">
  import { onMount } from "svelte";
  import type {
    FeedbackItem,
    FeedbackType,
    FeedbackStatus,
    FeedbackPriority,
  } from "../../domain/models/feedback-models";
  import {
    STATUS_CONFIG,
    TYPE_CONFIG,
    PRIORITY_CONFIG,
  } from "../../domain/models/feedback-models";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import FeedbackEditDrawer from "./FeedbackEditDrawer.svelte";
  import FeedbackReplyPanel from "./FeedbackReplyPanel.svelte";
  import { useUserPreview } from "$lib/shared/debug/context/user-preview-context";

  let {
    item,
    isOpen = false,
    onClose,
    onUpdate,
    onDelete,
  } = $props<{
    item: FeedbackItem | null;
    isOpen?: boolean;
    onClose: () => void;
    onUpdate: (feedbackId: string, updates: { type?: FeedbackType; description?: string }, appendMode?: boolean) => Promise<FeedbackItem>;
    onDelete: (feedbackId: string) => Promise<void>;
  }>();

  // Local drawer state that syncs with parent's isOpen
  let drawerOpen = $state(false);

  // Sync with parent prop
  $effect(() => {
    drawerOpen = isOpen;
  });

  // Responsive placement
  let isMobile = $state(false);
  const placement = $derived(isMobile ? "bottom" : "right") as "bottom" | "right";

  onMount(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    isMobile = mediaQuery.matches;
    const handler = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  // Get preview context for read-only checks
  const preview = useUserPreview();

  let isEditDrawerOpen = $state(false);
  let showDeleteConfirm = $state(false);
  let isDeleting = $state(false);

  const typeConfig = $derived(item ? TYPE_CONFIG[item.type as FeedbackType] : null);
  const statusConfig = $derived(item ? STATUS_CONFIG[item.status as FeedbackStatus] : null);
  const priorityConfig = $derived(item?.priority
    ? PRIORITY_CONFIG[item.priority as FeedbackPriority]
    : null);

  // Preview mode = read-only, no editing allowed
  const isPreviewMode = $derived(preview.isReadOnly);

  // Can edit if new, in-progress, or in-review (not completed/archived) AND not in preview mode
  const canEdit = $derived(
    item && !isPreviewMode && ["new", "in-progress", "in-review"].includes(item.status)
  );

  // Full edit mode only for "new" status, otherwise append mode
  const isAppendMode = $derived(item ? item.status !== "new" : false);

  // Can delete only when status is "new" (not yet picked up by admin)
  const canDelete = $derived(item && !isPreviewMode && item.status === "new");

  // Check if should show reply panel (for feedback-needs-info or feedback-response statuses)
  const shouldShowReplyPanel = $derived(
    item && ["feedback-needs-info", "feedback-response"].includes(item.status)
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
    if (!item) return;
    await onUpdate(item.id, updates, appendMode);
  }

  async function handleReplySubmit(reply: string) {
    if (!item) return;
    isReplySubmitting = true;
    try {
      await onUpdate(item.id, { description: reply }, true);
    } finally {
      isReplySubmitting = false;
    }
  }

  async function handleDelete() {
    if (!item) return;
    isDeleting = true;
    try {
      await onDelete(item.id);
      // Panel will close automatically when item is removed
    } catch (err) {
      console.error("Failed to delete feedback:", err);
      showDeleteConfirm = false;
    } finally {
      isDeleting = false;
    }
  }

  function handleClose() {
    showDeleteConfirm = false;
    onClose();
  }
</script>

<Drawer
  bind:isOpen={drawerOpen}
  {placement}
  showHandle={isMobile}
  closeOnBackdrop={true}
  closeOnEscape={true}
  onclose={handleClose}
  class="feedback-detail-drawer"
  backdropClass="feedback-detail-backdrop"
  ariaLabel="Feedback details"
>
  {#if item && typeConfig && statusConfig}
    <div class="detail-container">
      <!-- Header -->
      <header class="panel-header">
        <div class="header-actions">
          {#if canEdit}
            <button
              class="action-button edit"
              onclick={() => (isEditDrawerOpen = true)}
              type="button"
              aria-label="Edit feedback"
            >
              <i class="fas fa-pen"></i>
            </button>
          {/if}
          {#if canDelete}
            <button
              class="action-button delete"
              onclick={() => (showDeleteConfirm = true)}
              type="button"
              aria-label="Delete feedback"
            >
              <i class="fas fa-trash"></i>
            </button>
          {/if}
          <button
            class="action-button close"
            onclick={handleClose}
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

      <!-- Delete Confirmation Dialog -->
      {#if showDeleteConfirm}
        <div class="delete-confirm-overlay" onclick={() => (showDeleteConfirm = false)}>
          <div class="delete-confirm-dialog" onclick={(e) => e.stopPropagation()}>
            <div class="dialog-icon">
              <i class="fas fa-trash-alt"></i>
            </div>
            <h3>Delete Feedback?</h3>
            <p>This action cannot be undone. Your feedback will be permanently removed.</p>
            <div class="dialog-actions">
              <button
                class="cancel-btn"
                onclick={() => (showDeleteConfirm = false)}
                disabled={isDeleting}
                type="button"
              >
                Cancel
              </button>
              <button
                class="confirm-btn"
                onclick={handleDelete}
                disabled={isDeleting}
                type="button"
              >
                {#if isDeleting}
                  <i class="fas fa-spinner fa-spin"></i>
                  Deleting...
                {:else}
                  Delete
                {/if}
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Edit Drawer -->
      <FeedbackEditDrawer
        bind:isOpen={isEditDrawerOpen}
        {item}
        appendMode={isAppendMode}
        onSave={handleSave}
      />
    </div>
  {/if}
</Drawer>

<style>
  /* Drawer sizing and z-index (must be above bottom nav z-index: 100) */
  :global(.drawer-content.feedback-detail-drawer) {
    --sheet-width: min(420px, 95vw);
    width: var(--sheet-width) !important;
    z-index: 110 !important;
  }

  :global(.drawer-overlay.feedback-detail-backdrop) {
    z-index: 109 !important;
  }

  @media (max-width: 768px) {
    :global(.drawer-content.feedback-detail-drawer) {
      --sheet-width: 100%;
      width: 100% !important;
      max-height: 90vh;
      max-height: 90dvh;
    }
  }

  .detail-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 300px;
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

  .action-button {
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

  .action-button:hover {
    background: var(--theme-card-hover-bg, rgba(40, 40, 50, 0.98));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.3));
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    transform: translateY(-1px);
  }

  .action-button.edit:hover {
    border-color: color-mix(in srgb, var(--theme-accent, #3b82f6) 50%, transparent);
    color: var(--theme-accent, #3b82f6);
  }

  .action-button.delete:hover {
    border-color: color-mix(in srgb, #ef4444 50%, transparent);
    color: #ef4444;
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
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
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

  /* Delete Confirmation Dialog */
  .delete-confirm-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 100;
    animation: fadeIn 0.15s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .delete-confirm-dialog {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px 32px;
    background: #1a1a24;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    max-width: 320px;
    text-align: center;
    animation: slideUp 0.2s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dialog-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(239, 68, 68, 0.15);
    border-radius: 12px;
    color: #ef4444;
    font-size: 20px;
  }

  .delete-confirm-dialog h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .delete-confirm-dialog p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    line-height: 1.5;
  }

  .dialog-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  .cancel-btn,
  .confirm-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn {
    background: var(--theme-card-bg, rgba(40, 40, 50, 0.9));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
  }

  .cancel-btn:hover:not(:disabled) {
    background: var(--theme-card-hover-bg, rgba(50, 50, 60, 0.95));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .confirm-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #ef4444;
    border: 1px solid #dc2626;
    color: white;
  }

  .confirm-btn:hover:not(:disabled) {
    background: #dc2626;
  }

  .cancel-btn:disabled,
  .confirm-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
