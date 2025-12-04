<!-- MyFeedbackDetail - Detail view with confirmation flow -->
<script lang="ts">
  import type { FeedbackItem, TesterConfirmationStatus } from "../../domain/models/feedback-models";
  import {
    STATUS_CONFIG,
    TYPE_CONFIG,
    PRIORITY_CONFIG,
    CONFIRMATION_STATUS_CONFIG,
  } from "../../domain/models/feedback-models";

  const { item, isConfirming, onConfirm, onClose } = $props<{
    item: FeedbackItem;
    isConfirming: boolean;
    onConfirm: (status: TesterConfirmationStatus, comment?: string) => void;
    onClose: () => void;
  }>();

  let confirmComment = $state("");
  let showConfirmPanel = $state(false);

  const typeConfig = TYPE_CONFIG[item.type];
  const statusConfig = STATUS_CONFIG[item.status];
  const priorityConfig = item.priority ? PRIORITY_CONFIG[item.priority] : null;

  const needsConfirmation = $derived(
    item.status === "resolved" &&
    (!item.testerConfirmation || item.testerConfirmation.status === "pending")
  );

  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function handleConfirm(status: TesterConfirmationStatus) {
    onConfirm(status, confirmComment.trim() || undefined);
    confirmComment = "";
    showConfirmPanel = false;
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

    <!-- Admin Response -->
    {#if item.adminResponse}
      <div class="response-section">
        <h3>
          <i class="fas fa-reply"></i>
          Developer Response
        </h3>
        <div class="response-card">
          <p class="response-message">{item.adminResponse.message}</p>
          <span class="response-date">
            {formatDate(item.adminResponse.respondedAt)}
          </span>
        </div>
      </div>
    {/if}

    <!-- Tester Confirmation Status -->
    {#if item.testerConfirmation && item.testerConfirmation.status !== "pending"}
      {@const confConfig = CONFIRMATION_STATUS_CONFIG[item.testerConfirmation.status]}
      <div class="confirmation-section">
        <h3>Your Confirmation</h3>
        <div class="confirmation-status" style="--status-color: {confConfig.color}">
          <i class="fas {confConfig.icon}"></i>
          <span>{confConfig.label}</span>
        </div>
        {#if item.testerConfirmation.comment}
          <p class="confirmation-comment">{item.testerConfirmation.comment}</p>
        {/if}
        {#if item.testerConfirmation.respondedAt}
          <span class="confirmation-date">
            {formatDate(item.testerConfirmation.respondedAt)}
          </span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Confirmation Action Panel -->
  {#if needsConfirmation}
    <div class="confirmation-panel">
      {#if !showConfirmPanel}
        <div class="confirm-prompt">
          <div class="prompt-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="prompt-text">
            <h4>Was this fixed to your satisfaction?</h4>
            <p>Please confirm if the implementation meets your expectations</p>
          </div>
          <button
            class="show-confirm-btn"
            onclick={() => showConfirmPanel = true}
            type="button"
          >
            Respond
          </button>
        </div>
      {:else}
        <div class="confirm-form">
          <textarea
            bind:value={confirmComment}
            placeholder="Optional: Add any comments or feedback about the implementation..."
            rows="3"
          ></textarea>

          <div class="confirm-actions">
            <button
              class="confirm-btn success"
              onclick={() => handleConfirm("confirmed")}
              disabled={isConfirming}
              type="button"
            >
              {#if isConfirming}
                <i class="fas fa-spinner fa-spin"></i>
              {:else}
                <i class="fas fa-check"></i>
              {/if}
              Works Great!
            </button>

            <button
              class="confirm-btn warning"
              onclick={() => handleConfirm("needs-work")}
              disabled={isConfirming}
              type="button"
            >
              {#if isConfirming}
                <i class="fas fa-spinner fa-spin"></i>
              {:else}
                <i class="fas fa-redo"></i>
              {/if}
              Needs More Work
            </button>
          </div>

          <button
            class="cancel-btn"
            onclick={() => { showConfirmPanel = false; confirmComment = ""; }}
            type="button"
          >
            Cancel
          </button>
        </div>
      {/if}
    </div>
  {/if}
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

  /* Confirmation status display */
  .confirmation-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: color-mix(in srgb, var(--status-color) 15%, transparent);
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--status-color);
  }

  .confirmation-comment {
    margin: 12px 0 8px 0;
    padding: 10px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
    font-style: italic;
  }

  .confirmation-date {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Confirmation Panel */
  .confirmation-panel {
    padding: 16px;
    background: rgba(245, 158, 11, 0.08);
    border-top: 1px solid rgba(245, 158, 11, 0.2);
    flex-shrink: 0;
  }

  .confirm-prompt {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .prompt-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(245, 158, 11, 0.15);
    border-radius: 10px;
    color: #f59e0b;
    font-size: 18px;
    flex-shrink: 0;
  }

  .prompt-text {
    flex: 1;
    min-width: 0;
  }

  .prompt-text h4 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .prompt-text p {
    margin: 2px 0 0 0;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .show-confirm-btn {
    padding: 8px 16px;
    background: #f59e0b;
    border: none;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 600;
    color: black;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .show-confirm-btn:hover {
    background: #fbbf24;
    transform: translateY(-1px);
  }

  /* Confirm form */
  .confirm-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .confirm-form textarea {
    width: 100%;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.9);
    resize: none;
    font-family: inherit;
  }

  .confirm-form textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .confirm-form textarea:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .confirm-actions {
    display: flex;
    gap: 10px;
  }

  .confirm-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    border: none;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .confirm-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .confirm-btn.success {
    background: #10b981;
    color: white;
  }

  .confirm-btn.success:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-1px);
  }

  .confirm-btn.warning {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .confirm-btn.warning:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.25);
  }

  .cancel-btn {
    width: 100%;
    padding: 8px;
    background: none;
    border: none;
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .cancel-btn:hover {
    color: rgba(255, 255, 255, 0.8);
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
