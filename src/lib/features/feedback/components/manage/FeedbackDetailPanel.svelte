<!-- FeedbackDetailPanel - Premium detail view with spring animations -->
<script lang="ts">
  import type { FeedbackItem, FeedbackStatus } from "../../domain/models/feedback-models";
  import { TYPE_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from "../../domain/models/feedback-models";
  import type { FeedbackManageState } from "../../state/feedback-manage-state.svelte";

  // Using 'manageState' to avoid conflict with $state rune
  const { item, manageState, onClose } = $props<{
    item: FeedbackItem;
    manageState: FeedbackManageState;
    onClose: () => void;
  }>();

  // Default config for fallback
  const DEFAULT_TYPE_CONFIG = { color: "#6b7280", icon: "fa-question-circle", label: "Unknown" };

  const typeConfig = item.type && item.type in TYPE_CONFIG
    ? TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG]
    : DEFAULT_TYPE_CONFIG;
  const priorityConfig = item.priority && item.priority in PRIORITY_CONFIG
    ? PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]
    : null;

  // Local reactive state
  let adminNotes = $state(item.adminNotes || "");
  let isSavingNotes = $state(false);
  let isUpdatingStatus = $state(false);
  let lastUpdatedStatus = $state<string | null>(null);
  let showDeleteConfirm = $state(false);
  let isDeleting = $state(false);

  // Check if notes have changed
  const notesChanged = $derived(adminNotes !== (item.adminNotes || ""));

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? "Just now" : `${minutes} minutes ago`;
      }
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return formatDate(date);
  }

  async function handleStatusChange(status: FeedbackStatus) {
    if (isUpdatingStatus || item.status === status) return;
    isUpdatingStatus = true;
    lastUpdatedStatus = status;
    try {
      await manageState.updateStatus(item.id, status);
    } finally {
      isUpdatingStatus = false;
      // Clear animation trigger after delay
      setTimeout(() => { lastUpdatedStatus = null; }, 600);
    }
  }

  async function handleSaveNotes() {
    if (isSavingNotes || !notesChanged) return;
    isSavingNotes = true;
    try {
      await manageState.updateAdminNotes(item.id, adminNotes);
    } finally {
      isSavingNotes = false;
    }
  }

  async function handleDelete() {
    if (isDeleting) return;
    isDeleting = true;
    try {
      await manageState.deleteFeedback(item.id);
      onClose();
    } finally {
      isDeleting = false;
      showDeleteConfirm = false;
    }
  }
</script>

<div class="detail-panel">
  <!-- Header with close button -->
  <header class="panel-header">
    <div class="header-badge" style="--badge-color: {typeConfig.color}">
      <i class="fas {typeConfig.icon}"></i>
      <span>{typeConfig.label}</span>
    </div>
    <button
      type="button"
      class="close-btn"
      onclick={onClose}
      aria-label="Close panel"
    >
      <i class="fas fa-times"></i>
    </button>
  </header>

  <!-- Scrollable content -->
  <div class="panel-content">
    <!-- Title Section -->
    <section class="section title-section">
      <h2 class="feedback-title">{item.title}</h2>
      {#if priorityConfig}
        <span class="priority-badge" style="--badge-color: {priorityConfig.color}">
          <i class="fas {priorityConfig.icon}"></i>
          {priorityConfig.label} Priority
        </span>
      {/if}
    </section>

    <!-- Description Section -->
    <section class="section">
      <h3 class="section-title">Description</h3>
      <div class="description-content">
        <p class="description-text">{item.description}</p>
      </div>
    </section>

    <!-- Context Section -->
    <section class="section">
      <h3 class="section-title">Context</h3>
      <div class="context-card">
        <div class="context-row">
          <div class="context-item">
            <span class="context-label">
              <i class="fas fa-crosshairs"></i>
              Captured
            </span>
            <span class="context-value">
              {item.capturedModule}
              <span class="context-separator">›</span>
              {item.capturedTab || "—"}
            </span>
          </div>
        </div>
        {#if item.reportedModule}
          <div class="context-row">
            <div class="context-item">
              <span class="context-label">
                <i class="fas fa-edit"></i>
                Reported
              </span>
              <span class="context-value">
                {item.reportedModule}
                <span class="context-separator">›</span>
                {item.reportedTab || "—"}
              </span>
            </div>
          </div>
        {/if}
      </div>
    </section>

    <!-- User & Time Section -->
    <section class="section">
      <h3 class="section-title">Submitted By</h3>
      <div class="user-card">
        <div class="user-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="user-info">
          <span class="user-name">{item.userDisplayName}</span>
          <span class="user-email">{item.userEmail}</span>
        </div>
        <div class="user-time">
          <span class="time-relative">{formatRelativeTime(item.createdAt)}</span>
          <span class="time-absolute">{formatDate(item.createdAt)}</span>
        </div>
      </div>
    </section>

    <!-- Status Section -->
    <section class="section">
      <h3 class="section-title">
        <i class="fas fa-tasks"></i>
        Status
      </h3>
      <div class="status-grid">
        {#each Object.entries(STATUS_CONFIG) as [status, config]}
          <button
            type="button"
            class="status-btn"
            class:active={item.status === status}
            class:just-selected={lastUpdatedStatus === status}
            style="--status-color: {config.color}"
            onclick={() => handleStatusChange(status as FeedbackStatus)}
            disabled={isUpdatingStatus}
          >
            <span class="status-icon">
              <i class="fas {config.icon}"></i>
            </span>
            <span class="status-label">{config.label}</span>
            {#if item.status === status}
              <span class="status-check">
                <i class="fas fa-check"></i>
              </span>
            {/if}
          </button>
        {/each}
      </div>
    </section>

    <!-- Admin Notes Section -->
    <section class="section">
      <h3 class="section-title">
        <i class="fas fa-sticky-note"></i>
        Admin Notes
      </h3>
      <div class="notes-container">
        <textarea
          class="notes-input"
          bind:value={adminNotes}
          placeholder="Add internal notes for this feedback..."
          rows="4"
        ></textarea>
        <div class="notes-actions">
          {#if notesChanged}
            <span class="notes-hint">
              <i class="fas fa-circle"></i>
              Unsaved
            </span>
          {/if}
          <button
            type="button"
            class="save-btn"
            onclick={handleSaveNotes}
            disabled={isSavingNotes || !notesChanged}
          >
            {#if isSavingNotes}
              <i class="fas fa-circle-notch fa-spin"></i>
              Saving...
            {:else}
              <i class="fas fa-save"></i>
              Save Notes
            {/if}
          </button>
        </div>
      </div>
    </section>

    <!-- Danger Zone -->
    <section class="section danger-section">
      <h3 class="section-title danger">
        <i class="fas fa-exclamation-triangle"></i>
        Danger Zone
      </h3>
      {#if showDeleteConfirm}
        <div class="delete-confirm">
          <div class="delete-confirm-content">
            <div class="delete-icon-wrapper">
              <i class="fas fa-trash-alt"></i>
            </div>
            <div class="delete-confirm-text">
              <p class="delete-confirm-title">Delete this feedback?</p>
              <p class="delete-confirm-subtitle">This action cannot be undone.</p>
            </div>
          </div>
          <div class="delete-confirm-actions">
            <button
              type="button"
              class="cancel-btn"
              onclick={() => (showDeleteConfirm = false)}
            >
              Cancel
            </button>
            <button
              type="button"
              class="confirm-btn"
              onclick={handleDelete}
              disabled={isDeleting}
            >
              {#if isDeleting}
                <i class="fas fa-circle-notch fa-spin"></i>
              {:else}
                <i class="fas fa-trash"></i>
              {/if}
              Delete
            </button>
          </div>
        </div>
      {:else}
        <button
          type="button"
          class="delete-btn"
          onclick={() => (showDeleteConfirm = true)}
        >
          <i class="fas fa-trash-alt"></i>
          Delete Feedback
        </button>
      {/if}
    </section>
  </div>
</div>

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     DESIGN TOKENS
     ═══════════════════════════════════════════════════════════════════════════ */
  .detail-panel {
    --fb-space-3xs: 4px;
    --fb-space-2xs: 6px;
    --fb-space-xs: 8px;
    --fb-space-sm: 13px;
    --fb-space-md: 21px;
    --fb-space-lg: 34px;
    --fb-space-xl: 55px;

    --fb-text-xs: 0.75rem;
    --fb-text-sm: 0.875rem;
    --fb-text-base: 1rem;
    --fb-text-lg: 1.25rem;
    --fb-text-xl: 1.5rem;

    --fb-radius-sm: 8px;
    --fb-radius-md: 12px;
    --fb-radius-lg: 16px;

    --fb-primary: #10b981;
    --fb-error: #ef4444;
    --fb-purple: #8b5cf6;
    --fb-surface: rgba(255, 255, 255, 0.04);
    --fb-surface-hover: rgba(255, 255, 255, 0.08);
    --fb-border: rgba(255, 255, 255, 0.08);
    --fb-text: rgba(255, 255, 255, 0.95);
    --fb-text-muted: rgba(255, 255, 255, 0.6);
    --fb-text-subtle: rgba(255, 255, 255, 0.4);

    /* Spring animations */
    --spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
    --spring-smooth: cubic-bezier(0.4, 0, 0.2, 1);

    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--background, #0f0f14);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     HEADER
     ═══════════════════════════════════════════════════════════════════════════ */
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--fb-space-md);
    padding: var(--fb-space-md);
    border-bottom: 1px solid var(--fb-border);
    background: var(--fb-surface);
  }

  .header-badge {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    padding: var(--fb-space-xs) var(--fb-space-sm);
    background: color-mix(in srgb, var(--badge-color) 15%, transparent);
    border-radius: var(--fb-radius-sm);
    font-size: var(--fb-text-sm);
    font-weight: 600;
    color: var(--badge-color);
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin: calc(var(--fb-space-xs) * -1);
    background: none;
    border: 1px solid transparent;
    border-radius: var(--fb-radius-md);
    color: var(--fb-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: var(--fb-surface-hover);
    border-color: var(--fb-border);
    color: var(--fb-text);
  }

  .close-btn:active {
    transform: scale(0.95);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     CONTENT
     ═══════════════════════════════════════════════════════════════════════════ */
  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--fb-space-md);
    padding-bottom: calc(var(--fb-space-lg) + env(safe-area-inset-bottom, 0px));
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-lg);
  }

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

  .section-title i {
    font-size: 0.9em;
  }

  .section-title.danger {
    color: var(--fb-error);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     TITLE SECTION
     ═══════════════════════════════════════════════════════════════════════════ */
  .title-section {
    gap: var(--fb-space-sm);
  }

  .feedback-title {
    margin: 0;
    font-size: var(--fb-text-xl);
    font-weight: 700;
    color: var(--fb-text);
    line-height: 1.3;
    letter-spacing: -0.02em;
  }

  .priority-badge {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    gap: var(--fb-space-xs);
    padding: var(--fb-space-2xs) var(--fb-space-sm);
    background: color-mix(in srgb, var(--badge-color) 12%, transparent);
    border-radius: 999px;
    font-size: var(--fb-text-xs);
    font-weight: 500;
    color: var(--badge-color);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     DESCRIPTION SECTION
     ═══════════════════════════════════════════════════════════════════════════ */
  .description-content {
    padding: var(--fb-space-md);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
  }

  .description-text {
    margin: 0;
    font-size: var(--fb-text-sm);
    color: var(--fb-text-muted);
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     CONTEXT SECTION
     ═══════════════════════════════════════════════════════════════════════════ */
  .context-card {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-xs);
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
  }

  .context-row {
    display: flex;
    flex-direction: column;
  }

  .context-row + .context-row {
    padding-top: var(--fb-space-xs);
    border-top: 1px solid var(--fb-border);
  }

  .context-item {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-3xs);
  }

  .context-label {
    display: flex;
    align-items: center;
    gap: var(--fb-space-2xs);
    font-size: var(--fb-text-xs);
    color: var(--fb-text-subtle);
  }

  .context-label i {
    width: 14px;
    text-align: center;
  }

  .context-value {
    font-size: var(--fb-text-sm);
    color: var(--fb-text);
    font-family: "SF Mono", ui-monospace, monospace;
    padding-left: calc(14px + var(--fb-space-2xs));
  }

  .context-separator {
    color: var(--fb-text-subtle);
    margin: 0 var(--fb-space-2xs);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     USER SECTION
     ═══════════════════════════════════════════════════════════════════════════ */
  .user-card {
    display: flex;
    align-items: center;
    gap: var(--fb-space-sm);
    padding: var(--fb-space-md);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
  }

  .user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 50%;
    color: var(--fb-primary);
    font-size: 18px;
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-3xs);
  }

  .user-name {
    font-size: var(--fb-text-sm);
    font-weight: 600;
    color: var(--fb-text);
  }

  .user-email {
    font-size: var(--fb-text-xs);
    color: var(--fb-text-subtle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-time {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--fb-space-3xs);
    text-align: right;
  }

  .time-relative {
    font-size: var(--fb-text-xs);
    font-weight: 500;
    color: var(--fb-text-muted);
  }

  .time-absolute {
    font-size: 10px;
    color: var(--fb-text-subtle);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     STATUS SECTION - 48px touch targets with spring animations
     ═══════════════════════════════════════════════════════════════════════════ */
  .status-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--fb-space-xs);
  }

  .status-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    min-height: 48px;
    padding: var(--fb-space-sm) var(--fb-space-md);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text-muted);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s var(--spring-smooth);
    overflow: hidden;
  }

  .status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: var(--fb-surface-hover);
    border-radius: 6px;
    font-size: 0.75em;
    transition: all 0.2s var(--spring-bounce);
  }

  .status-label {
    flex: 1;
    text-align: left;
  }

  .status-btn:hover:not(:disabled):not(.active) {
    background: var(--fb-surface-hover);
    border-color: var(--fb-text-subtle);
    color: var(--fb-text);
  }

  .status-btn:hover:not(:disabled):not(.active) .status-icon {
    background: rgba(255, 255, 255, 0.12);
  }

  .status-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .status-btn.active {
    background: color-mix(in srgb, var(--status-color) 15%, transparent);
    border-color: var(--status-color);
    color: var(--fb-text);
  }

  .status-btn.active .status-icon {
    background: color-mix(in srgb, var(--status-color) 25%, transparent);
    color: var(--status-color);
  }

  .status-btn.just-selected {
    animation: statusPop 0.4s var(--spring-bounce);
  }

  @keyframes statusPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }

  .status-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .status-check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: var(--status-color);
    border-radius: 50%;
    color: white;
    font-size: 10px;
    animation: checkPop 0.3s var(--spring-bounce);
  }

  @keyframes checkPop {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     NOTES SECTION
     ═══════════════════════════════════════════════════════════════════════════ */
  .notes-container {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-sm);
  }

  .notes-input {
    width: 100%;
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text);
    font-size: 16px; /* Prevent iOS zoom */
    font-family: inherit;
    line-height: 1.6;
    resize: vertical;
    min-height: 100px;
    transition: all 0.2s ease;
  }

  .notes-input::placeholder {
    color: var(--fb-text-subtle);
  }

  .notes-input:focus {
    outline: none;
    border-color: var(--fb-purple);
    background: var(--fb-surface-hover);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .notes-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--fb-space-md);
  }

  .notes-hint {
    display: flex;
    align-items: center;
    gap: var(--fb-space-2xs);
    font-size: var(--fb-text-xs);
    color: var(--fb-purple);
    font-weight: 500;
  }

  .notes-hint i {
    font-size: 6px;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .save-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--fb-space-xs);
    min-height: 48px;
    padding: 0 var(--fb-space-md);
    background: var(--fb-purple);
    border: none;
    border-radius: var(--fb-radius-md);
    color: white;
    font-size: var(--fb-text-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s var(--spring-smooth);
  }

  .save-btn:hover:not(:disabled) {
    background: #7c3aed;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    transform: translateY(-1px);
  }

  .save-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .save-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     DANGER ZONE
     ═══════════════════════════════════════════════════════════════════════════ */
  .danger-section {
    margin-top: var(--fb-space-md);
    padding-top: var(--fb-space-lg);
    border-top: 1px solid var(--fb-border);
  }

  .delete-btn {
    display: flex;
    align-items: center;
    align-self: flex-start;
    gap: var(--fb-space-xs);
    min-height: 48px;
    padding: 0 var(--fb-space-md);
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: var(--fb-radius-md);
    color: var(--fb-error);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .delete-btn:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    transform: translateY(-1px);
  }

  .delete-btn:active {
    transform: translateY(0) scale(0.98);
  }

  .delete-confirm {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-md);
    padding: var(--fb-space-md);
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.15);
    border-radius: var(--fb-radius-md);
    animation: shake 0.4s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }

  .delete-confirm-content {
    display: flex;
    align-items: flex-start;
    gap: var(--fb-space-sm);
  }

  .delete-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(239, 68, 68, 0.15);
    border-radius: var(--fb-radius-sm);
    color: var(--fb-error);
    font-size: 16px;
    flex-shrink: 0;
  }

  .delete-confirm-text {
    flex: 1;
  }

  .delete-confirm-title {
    margin: 0 0 var(--fb-space-3xs) 0;
    font-size: var(--fb-text-sm);
    font-weight: 600;
    color: var(--fb-text);
  }

  .delete-confirm-subtitle {
    margin: 0;
    font-size: var(--fb-text-xs);
    color: var(--fb-text-muted);
  }

  .delete-confirm-actions {
    display: flex;
    gap: var(--fb-space-xs);
    justify-content: flex-end;
  }

  .cancel-btn,
  .confirm-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--fb-space-xs);
    min-height: 48px;
    padding: 0 var(--fb-space-md);
    border-radius: var(--fb-radius-md);
    font-size: var(--fb-text-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn {
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    color: var(--fb-text-muted);
  }

  .cancel-btn:hover {
    background: var(--fb-surface-hover);
    color: var(--fb-text);
  }

  .cancel-btn:active {
    transform: scale(0.98);
  }

  .confirm-btn {
    background: var(--fb-error);
    border: none;
    color: white;
  }

  .confirm-btn:hover:not(:disabled) {
    background: #dc2626;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  .confirm-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .confirm-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     RESPONSIVE
     ═══════════════════════════════════════════════════════════════════════════ */

  /* Tablet+ */
  @media (min-width: 768px) {
    .panel-content {
      padding: var(--fb-space-lg);
    }

    .status-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .user-card {
      padding: var(--fb-space-md) var(--fb-space-lg);
    }
  }

  /* Small mobile */
  @media (max-width: 479px) {
    .panel-header {
      padding: var(--fb-space-sm);
    }

    .panel-content {
      padding: var(--fb-space-sm);
      gap: var(--fb-space-md);
    }

    .feedback-title {
      font-size: var(--fb-text-lg);
    }

    .user-card {
      flex-wrap: wrap;
    }

    .user-time {
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
      padding-top: var(--fb-space-xs);
      margin-top: var(--fb-space-xs);
      border-top: 1px solid var(--fb-border);
    }

    .delete-confirm-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .confirm-btn {
      flex: 1;
    }
  }

  /* Scrollbar styling */
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

  .panel-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .status-btn,
    .status-check,
    .delete-confirm,
    .notes-hint i {
      animation: none;
    }

    .status-btn,
    .save-btn,
    .delete-btn,
    .cancel-btn,
    .confirm-btn {
      transition: none;
    }
  }
</style>
