<!-- FeedbackDetailPanel - Premium detail view with spring animations -->
<script lang="ts">
  import type {
    FeedbackItem,
    FeedbackStatus,
    FeedbackType,
    FeedbackPriority,
    FeedbackSubtask,
    SubtaskStatus,
    TesterConfirmationStatus,
  } from "../../domain/models/feedback-models";
  import {
    TYPE_CONFIG,
    STATUS_CONFIG,
    PRIORITY_CONFIG,
    CONFIRMATION_STATUS_CONFIG,
  } from "../../domain/models/feedback-models";
  import { feedbackService } from "../../services/implementations/FeedbackService";
  import type { FeedbackManageState } from "../../state/feedback-manage-state.svelte";
  import { MODULE_DEFINITIONS } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { generateAvatarUrl } from "$lib/shared/foundation/utils/avatar-generator";

  // Using 'manageState' to avoid conflict with $state rune
  const {
    item,
    manageState = null,
    onClose,
    readOnly = false,
  } = $props<{
    item: FeedbackItem;
    manageState?: FeedbackManageState | null;
    onClose: () => void;
    readOnly?: boolean;
  }>();

  // Default config for fallback
  const DEFAULT_TYPE_CONFIG = {
    color: "#6b7280",
    icon: "fa-question-circle",
    label: "Unknown",
  };

  // Derive configs from current item state (will update when item changes)
  const typeConfig = $derived(
    item.type && item.type in TYPE_CONFIG
      ? TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG]
      : DEFAULT_TYPE_CONFIG
  );
  const priorityConfig = $derived(
    item.priority && item.priority in PRIORITY_CONFIG
      ? PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]
      : null
  );

  // Store original values for restore functionality
  let originalSnapshot = $state({
    type: item.type,
    priority: item.priority || "",
    title: item.title,
    description: item.description,
    reportedModule: item.reportedModule || "",
    reportedTab: item.reportedTab || "",
  });

  // Inline editable fields (always editable, no edit mode needed)
  let editType = $state<FeedbackType>(item.type);
  let editPriority = $state<FeedbackPriority | "">(item.priority || "");
  let editTitle = $state(item.title);
  let editDescription = $state(item.description);
  let editReportedModule = $state(item.reportedModule || "");
  let editReportedTab = $state(item.reportedTab || "");

  let isSaving = $state(false);

  // Track current item ID to detect when a different item is selected
  let currentItemId = $state(item.id);

  // Update snapshot and edit fields only when item ID changes (different item selected)
  // This prevents resetting fields during typing when real-time updates arrive
  $effect(() => {
    if (item.id !== currentItemId) {
      // Different item selected - sync everything
      currentItemId = item.id;
      originalSnapshot = {
        type: item.type,
        priority: item.priority || "",
        title: item.title,
        description: item.description,
        reportedModule: item.reportedModule || "",
        reportedTab: item.reportedTab || "",
      };
      // Also sync edit fields
      editType = item.type;
      editPriority = item.priority || "";
      editTitle = item.title;
      editDescription = item.description;
      editReportedModule = item.reportedModule || "";
      editReportedTab = item.reportedTab || "";
    }
  });

  // Check if anything has changed from the original
  const hasChanges = $derived(
    editType !== originalSnapshot.type ||
      editPriority !== originalSnapshot.priority ||
      editTitle !== originalSnapshot.title ||
      editDescription !== originalSnapshot.description ||
      editReportedModule !== originalSnapshot.reportedModule ||
      editReportedTab !== originalSnapshot.reportedTab
  );

  // Get tabs for selected module
  const availableTabs = $derived(() => {
    if (!editReportedModule) return [];
    const moduleDef = MODULE_DEFINITIONS.find(
      (m) => m.id === editReportedModule
    );
    return moduleDef?.sections || [];
  });

  // Restore to original values
  function restoreOriginal() {
    editType = originalSnapshot.type as FeedbackType;
    editPriority = originalSnapshot.priority as FeedbackPriority | "";
    editTitle = originalSnapshot.title;
    editDescription = originalSnapshot.description;
    editReportedModule = originalSnapshot.reportedModule;
    editReportedTab = originalSnapshot.reportedTab;
  }

  // Save changes (called on blur or explicitly)
  async function saveChanges() {
    if (readOnly || !manageState || isSaving || !hasChanges) return;
    isSaving = true;

    try {
      await manageState.updateFeedback(item.id, {
        type: editType,
        priority: editPriority || undefined,
        title: editTitle,
        description: editDescription,
        reportedModule: editReportedModule,
        reportedTab: editReportedTab,
      });
      // Update snapshot after successful save
      originalSnapshot = {
        type: editType,
        priority: editPriority,
        title: editTitle,
        description: editDescription,
        reportedModule: editReportedModule,
        reportedTab: editReportedTab,
      };
    } catch (err) {
      console.error("Failed to save changes:", err);
    } finally {
      isSaving = false;
    }
  }

  // Auto-save on field blur
  function handleFieldBlur() {
    if (hasChanges) {
      void saveChanges();
    }
  }

  // Auto-resize textarea to fit content
  let descriptionTextarea: HTMLTextAreaElement;

  function autoResizeTextarea(textarea: HTMLTextAreaElement) {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  $effect(() => {
    // Re-run when description changes
    editDescription;
    if (descriptionTextarea) {
      autoResizeTextarea(descriptionTextarea);
    }
  });

  // Local reactive state
  let adminNotes = $state(item.adminNotes || "");
  let isSavingNotes = $state(false);
  let isUpdatingStatus = $state(false);
  let lastUpdatedStatus = $state<string | null>(null);
  let showDeleteConfirm = $state(false);
  let isDeleting = $state(false);

  // Admin response state
  let adminResponseMessage = $state(item.adminResponse?.message || "");
  let isSendingResponse = $state(false);
  let showResponseForm = $state(false);

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
    if (readOnly || !manageState || isUpdatingStatus || item.status === status)
      return;
    isUpdatingStatus = true;
    lastUpdatedStatus = status;
    try {
      await manageState.updateStatus(item.id, status);
    } finally {
      isUpdatingStatus = false;
      // Clear animation trigger after delay
      setTimeout(() => {
        lastUpdatedStatus = null;
      }, 600);
    }
  }

  async function handleSaveNotes() {
    if (readOnly || !manageState || isSavingNotes || !notesChanged) return;
    isSavingNotes = true;
    try {
      await manageState.updateAdminNotes(item.id, adminNotes);
    } finally {
      isSavingNotes = false;
    }
  }

  async function handleDelete() {
    if (readOnly || !manageState || isDeleting) return;
    isDeleting = true;
    try {
      await manageState.deleteFeedback(item.id);
      onClose();
    } finally {
      isDeleting = false;
      showDeleteConfirm = false;
    }
  }

  // Send admin response to tester
  async function handleSendResponse() {
    if (
      readOnly ||
      !manageState ||
      isSendingResponse ||
      !adminResponseMessage.trim()
    )
      return;
    isSendingResponse = true;
    try {
      await feedbackService.sendAdminResponse(
        item.id,
        adminResponseMessage.trim(),
        true
      );
      showResponseForm = false;
      // Reload to get updated item
      await manageState.refreshItem(item.id);
    } catch (err) {
      console.error("Failed to send response:", err);
    } finally {
      isSendingResponse = false;
    }
  }

  // Mark as resolved and notify tester
  async function handleMarkResolved() {
    if (readOnly || !manageState || isUpdatingStatus) return;
    isUpdatingStatus = true;
    try {
      await manageState.updateStatus(item.id, "resolved");
      // Send notification to tester
      await feedbackService.notifyTesterResolved(
        item.id,
        adminResponseMessage.trim() || undefined
      );
    } finally {
      isUpdatingStatus = false;
    }
  }

  async function handleGenerateTitle() {
    if (readOnly || !manageState) return;
    try {
      await manageState.generateTitle(item.id, item.description);
    } catch (err) {
      console.error("Failed to generate title:", err);
    }
  }
</script>

<div class="detail-panel">
  <!-- Header with restore/save/close buttons -->
  <header class="panel-header">
    <!-- Clickable type badge - cycles through types -->
    <button
      type="button"
      class="header-badge clickable"
      style="--badge-color: {typeConfig.color}"
      onclick={() => {
        if (readOnly) return;
        const types: FeedbackType[] = ['bug', 'feature', 'enhancement', 'general'];
        const currentIndex = types.indexOf(editType);
        const nextIndex = (currentIndex + 1) % types.length;
        editType = types[nextIndex];
        void saveChanges();
      }}
      disabled={readOnly}
      title={readOnly ? typeConfig.label : "Click to change type"}
    >
      <i class="fas {typeConfig.icon}"></i>
      <span>{typeConfig.label}</span>
      {#if !readOnly}
        <i class="fas fa-exchange-alt type-switcher-icon"></i>
      {/if}
    </button>
    <div class="header-actions">
      {#if hasChanges || isSaving}
        <button
          type="button"
          class="header-btn restore-btn"
          onclick={restoreOriginal}
          disabled={isSaving}
          aria-label="Restore original"
          title="Restore original"
        >
          <i class="fas fa-undo"></i>
        </button>
        <button
          type="button"
          class="header-btn save-btn"
          onclick={saveChanges}
          disabled={isSaving}
          aria-label="Save changes"
          title="Save changes"
        >
          {#if isSaving}
            <i class="fas fa-circle-notch fa-spin"></i>
          {:else}
            <i class="fas fa-check"></i>
          {/if}
        </button>
      {/if}
      <button
        type="button"
        class="close-btn"
        onclick={onClose}
        aria-label="Close panel"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </header>

  <!-- Scrollable content -->
  <div class="panel-content">
    <!-- Description Section - Primary content, shown first (inline editable) -->
    <section class="section">
      <h3 class="section-title">Description</h3>
      <textarea
        class="inline-edit-textarea auto-resize"
        bind:this={descriptionTextarea}
        bind:value={editDescription}
        onblur={handleFieldBlur}
        oninput={(e) => autoResizeTextarea(e.currentTarget)}
        placeholder="Describe the feedback..."
        readonly={readOnly}
      ></textarea>
    </section>

    <!-- Screenshots Section -->
    {#if item.imageUrls && item.imageUrls.length > 0}
      <section class="section">
        <h3 class="section-title">Screenshots ({item.imageUrls.length})</h3>
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
      </section>
    {/if}

    <!-- Title Section (inline editable) -->
    <section class="section title-section">
      <div class="title-row">
        <div class="title-content">
          <h3 class="section-title">Title</h3>
          <input
            type="text"
            class="inline-edit-input"
            bind:value={editTitle}
            onblur={handleFieldBlur}
            placeholder="Add a title..."
            readonly={readOnly}
          />
        </div>
        {#if !readOnly && manageState}
          <button
            type="button"
            class="generate-title-btn"
            onclick={handleGenerateTitle}
            disabled={manageState.isGeneratingTitle}
            title="Generate title with AI"
          >
            {#if manageState.isGeneratingTitle}
              <i class="fas fa-spinner fa-spin"></i>
            {:else}
              <i class="fas fa-magic"></i>
            {/if}
          </button>
        {/if}
      </div>
    </section>

    <!-- Priority Section (always visible for quick changes) -->
    <section class="section">
      <h3 class="section-title">
        <i class="fas fa-exclamation-circle"></i>
        Priority
      </h3>
      <div class="priority-grid">
        <button
          type="button"
          class="priority-btn"
          class:active={editPriority === ""}
          onclick={() => {
            editPriority = "";
            void saveChanges();
          }}
        >
          <i class="fas fa-minus"></i>
          <span>None</span>
        </button>
        {#each Object.entries(PRIORITY_CONFIG) as [priority, config]}
          <button
            type="button"
            class="priority-btn"
            class:active={editPriority === priority}
            style="--priority-color: {config.color}"
            onclick={() => {
              editPriority = priority as FeedbackPriority;
              void saveChanges();
            }}
          >
            <i class="fas {config.icon}"></i>
            <span>{config.label}</span>
          </button>
        {/each}
      </div>
    </section>

    <!-- User & Time Section -->
    <section class="section">
      <h3 class="section-title">Submitted By</h3>
      <div class="user-card">
        <img
          src={item.userPhotoURL ||
            generateAvatarUrl(item.userDisplayName, 64)}
          alt="{item.userDisplayName}'s avatar"
          class="user-avatar-img"
          referrerpolicy="no-referrer"
          crossorigin="anonymous"
        />
        <div class="user-info">
          <span class="user-name">{item.userDisplayName}</span>
          <span class="user-email">{item.userEmail}</span>
        </div>
        <div class="user-time">
          <span class="time-relative">{formatRelativeTime(item.createdAt)}</span
          >
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
      {#if readOnly}
        <!-- Read-only status display -->
        {@const statusConfig =
          STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]}
        <div
          class="status-display"
          style="--status-color: {statusConfig.color}"
        >
          <i class="fas {statusConfig.icon}"></i>
          <span>{statusConfig.label}</span>
        </div>
      {:else}
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
      {/if}
    </section>

    <!-- Subtasks Section (for complex feedback with prerequisites) -->
    {#if item.subtasks && item.subtasks.length > 0}
      <section class="section subtasks-section">
        <h3 class="section-title">
          <i class="fas fa-tasks"></i>
          Subtasks
          <span class="subtask-count">
            {item.subtasks.filter(
              (s: FeedbackSubtask) => s.status === "completed"
            ).length}/{item.subtasks.length}
          </span>
        </h3>
        <div class="subtasks-list">
          {#each item.subtasks as subtask (subtask.id)}
            {@const isBlocked =
              subtask.dependsOn &&
              subtask.dependsOn.length > 0 &&
              !subtask.dependsOn.every(
                (depId: string) =>
                  item.subtasks?.find((s: FeedbackSubtask) => s.id === depId)
                    ?.status === "completed"
              )}
            <div
              class="subtask-item"
              class:completed={subtask.status === "completed"}
              class:in-progress={subtask.status === "in-progress"}
              class:blocked={isBlocked && subtask.status === "pending"}
            >
              <div class="subtask-status-icon">
                {#if subtask.status === "completed"}
                  <i class="fas fa-check-circle"></i>
                {:else if subtask.status === "in-progress"}
                  <i class="fas fa-spinner fa-pulse"></i>
                {:else if isBlocked}
                  <i class="fas fa-lock"></i>
                {:else}
                  <i class="far fa-circle"></i>
                {/if}
              </div>
              <div class="subtask-content">
                <span class="subtask-id">#{subtask.id}</span>
                <span class="subtask-title">{subtask.title}</span>
                {#if subtask.description}
                  <p class="subtask-description">{subtask.description}</p>
                {/if}
                {#if subtask.dependsOn && subtask.dependsOn.length > 0}
                  <span class="subtask-deps">
                    <i class="fas fa-link"></i>
                    Depends on: {subtask.dependsOn
                      .map((id: string) => `#${id}`)
                      .join(", ")}
                  </span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Admin Response to Tester Section -->
    {#if !readOnly || item.adminResponse}
      <section class="section response-section">
        <h3 class="section-title">
          <i class="fas fa-reply"></i>
          Response to Tester
        </h3>

        {#if item.adminResponse}
          <!-- Existing response display -->
          <div class="existing-response">
            <p class="response-message">{item.adminResponse.message}</p>
            <span class="response-meta">
              Sent {formatRelativeTime(item.adminResponse.respondedAt)}
            </span>
          </div>
        {/if}

        {#if !readOnly}
          {#if showResponseForm || !item.adminResponse}
            <div class="response-form">
              <textarea
                class="response-textarea"
                bind:value={adminResponseMessage}
                placeholder="Write a message to notify the tester about this feedback..."
                rows="3"
              ></textarea>

              <div class="response-actions">
                <button
                  type="button"
                  class="send-response-btn"
                  onclick={handleSendResponse}
                  disabled={isSendingResponse || !adminResponseMessage.trim()}
                >
                  {#if isSendingResponse}
                    <i class="fas fa-spinner fa-spin"></i>
                  {:else}
                    <i class="fas fa-paper-plane"></i>
                  {/if}
                  Send Response
                </button>

                {#if item.status !== "resolved"}
                  <button
                    type="button"
                    class="resolve-notify-btn"
                    onclick={handleMarkResolved}
                    disabled={isUpdatingStatus}
                  >
                    {#if isUpdatingStatus}
                      <i class="fas fa-spinner fa-spin"></i>
                    {:else}
                      <i class="fas fa-check-circle"></i>
                    {/if}
                    Mark Resolved & Notify
                  </button>
                {/if}
              </div>
            </div>
          {:else}
            <button
              type="button"
              class="update-response-btn"
              onclick={() => (showResponseForm = true)}
            >
              <i class="fas fa-edit"></i>
              Update Response
            </button>
          {/if}
        {/if}

        <!-- Tester confirmation status -->
        {#if item.testerConfirmation}
          {@const confConfig =
            CONFIRMATION_STATUS_CONFIG[
              item.testerConfirmation.status as TesterConfirmationStatus
            ]}
          <div
            class="tester-confirmation"
            style="--conf-color: {confConfig.color}"
          >
            <div class="confirmation-header">
              <i class="fas {confConfig.icon}"></i>
              <span class="confirmation-label">{confConfig.label}</span>
            </div>
            {#if item.testerConfirmation.comment}
              <p class="confirmation-comment">
                "{item.testerConfirmation.comment}"
              </p>
            {/if}
            {#if item.testerConfirmation.respondedAt}
              <span class="confirmation-date">
                {formatRelativeTime(item.testerConfirmation.respondedAt)}
              </span>
            {/if}
          </div>
        {/if}
      </section>
    {/if}

    <!-- Delete Section (simplified) -->
    {#if !readOnly}
      <section class="section delete-section">
        {#if showDeleteConfirm}
          <div class="delete-confirm-simple">
            <span class="delete-confirm-text"
              >Are you sure you want to delete this feedback?</span
            >
            <div class="delete-confirm-actions">
              <button
                type="button"
                class="cancel-btn-simple"
                onclick={() => (showDeleteConfirm = false)}
              >
                Cancel
              </button>
              <button
                type="button"
                class="confirm-btn-simple"
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
            class="delete-btn-simple"
            onclick={() => (showDeleteConfirm = true)}
          >
            <i class="fas fa-trash-alt"></i>
            Delete Feedback
          </button>
        {/if}
      </section>
    {/if}
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
    border: 1px solid transparent;
    border-radius: var(--fb-radius-sm);
    font-size: var(--fb-text-sm);
    font-weight: 600;
    color: var(--badge-color);
    transition: all 0.2s ease;
  }

  .header-badge.clickable {
    cursor: pointer;
  }

  .header-badge.clickable:hover:not(:disabled) {
    background: color-mix(in srgb, var(--badge-color) 25%, transparent);
    border-color: var(--badge-color);
    transform: scale(1.02);
  }

  .header-badge.clickable:active:not(:disabled) {
    transform: scale(0.98);
  }

  .header-badge:disabled {
    cursor: default;
  }

  .type-switcher-icon {
    font-size: 0.75em;
    opacity: 0.6;
    margin-left: var(--fb-space-2xs);
  }

  .header-badge.clickable:hover .type-switcher-icon {
    opacity: 1;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
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

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
  }

  .header-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .header-btn:hover:not(:disabled) {
    background: var(--fb-surface-hover);
    color: var(--fb-text);
  }

  .header-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .header-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .restore-btn:hover {
    border-color: var(--fb-warning);
    color: var(--fb-warning);
  }

  .save-btn {
    background: var(--fb-primary);
    border-color: var(--fb-primary);
    color: white;
  }

  .save-btn:hover:not(:disabled) {
    background: #059669;
    border-color: #059669;
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

  .edit-title-input {
    width: 100%;
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text);
    font-size: var(--fb-text-lg);
    font-weight: 700;
    font-family: inherit;
    transition: all 0.2s ease;
  }

  .edit-title-input:focus {
    outline: none;
    border-color: var(--fb-purple);
    background: var(--fb-surface-hover);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .edit-title-input::placeholder {
    color: var(--fb-text-subtle);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     TYPE & PRIORITY GRIDS (Edit Mode)
     ═══════════════════════════════════════════════════════════════════════════ */
  .type-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--fb-space-xs);
  }

  .type-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--fb-space-2xs);
    min-height: 52px;
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text-muted);
    font-size: var(--fb-text-xs);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .type-btn i {
    font-size: 1.25rem;
  }

  .type-btn:hover:not(.active) {
    background: var(--fb-surface-hover);
    color: var(--fb-text);
  }

  .type-btn.active {
    background: color-mix(in srgb, var(--type-color) 15%, transparent);
    border-color: var(--type-color);
    color: var(--type-color);
  }

  .priority-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--fb-space-xs);
  }

  .priority-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--fb-space-2xs);
    min-height: 52px;
    padding: var(--fb-space-xs);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text-muted);
    font-size: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .priority-btn i {
    font-size: 0.875rem;
  }

  .priority-btn:hover:not(.active) {
    background: var(--fb-surface-hover);
    color: var(--fb-text);
  }

  .priority-btn.active {
    background: color-mix(
      in srgb,
      var(--priority-color, #6b7280) 15%,
      transparent
    );
    border-color: var(--priority-color, #6b7280);
    color: var(--priority-color, var(--fb-text));
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     INLINE EDIT FIELDS
     ═══════════════════════════════════════════════════════════════════════════ */
  .inline-edit-textarea,
  .inline-edit-input {
    width: 100%;
    padding: var(--fb-space-sm);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--fb-radius-md);
    color: var(--fb-text);
    font-size: var(--fb-text-sm);
    font-family: inherit;
    line-height: 1.6;
    transition: all 0.2s ease;
  }

  .inline-edit-textarea {
    resize: vertical;
    min-height: 60px;
  }

  .inline-edit-textarea.auto-resize {
    resize: none;
    overflow: hidden;
  }

  .inline-edit-textarea:hover,
  .inline-edit-input:hover {
    background: var(--fb-surface);
    border-color: var(--fb-border);
  }

  .inline-edit-textarea:focus,
  .inline-edit-input:focus {
    outline: none;
    background: var(--fb-surface);
    border-color: var(--fb-purple);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .inline-edit-textarea::placeholder,
  .inline-edit-input::placeholder {
    color: var(--fb-text-subtle);
    font-style: italic;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     CONTEXT EDIT
     ═══════════════════════════════════════════════════════════════════════════ */
  .context-edit-card {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-sm);
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
  }

  .context-edit-row {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-2xs);
  }

  .context-edit-row + .context-edit-row {
    padding-top: var(--fb-space-sm);
    border-top: 1px solid var(--fb-border);
  }

  .context-edit-label {
    display: flex;
    align-items: center;
    gap: var(--fb-space-2xs);
    font-size: var(--fb-text-xs);
    color: var(--fb-text-subtle);
  }

  .context-edit-label i {
    width: 14px;
    text-align: center;
  }

  .context-edit-value {
    font-size: var(--fb-text-sm);
    color: var(--fb-text-muted);
    font-family: "SF Mono", ui-monospace, monospace;
    padding-left: calc(14px + var(--fb-space-2xs));
  }

  .context-selects {
    display: flex;
    gap: var(--fb-space-xs);
    padding-left: calc(14px + var(--fb-space-2xs));
  }

  .context-select {
    flex: 1;
    min-height: 44px;
    padding: var(--fb-space-xs) var(--fb-space-sm);
    background: var(--fb-surface-hover);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-sm);
    color: var(--fb-text);
    font-size: var(--fb-text-sm);
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .context-select:focus {
    outline: none;
    border-color: var(--fb-purple);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .context-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .context-select option {
    background: #1a1a24;
    color: var(--fb-text);
  }

  .feedback-title {
    margin: 0;
    font-size: var(--fb-text-xl);
    font-weight: 700;
    color: var(--fb-text);
    line-height: 1.3;
    letter-spacing: -0.02em;
  }

  .feedback-title-text {
    margin: 0;
    font-size: var(--fb-text-sm);
    color: var(--fb-text-muted);
    line-height: 1.5;
  }

  .feedback-title-text.muted {
    color: var(--fb-text-subtle);
    font-style: italic;
  }

  .title-row {
    display: flex;
    align-items: flex-start;
    gap: var(--fb-space-sm);
  }

  .title-content {
    flex: 1;
    min-width: 0;
  }

  .generate-title-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: var(--fb-radius-sm);
    color: #a78bfa;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .generate-title-btn:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.5);
    color: #c4b5fd;
  }

  .generate-title-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  .context-item {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-3xs);
  }

  .context-value {
    font-size: var(--fb-text-sm);
    color: var(--fb-text);
    font-family: "SF Mono", ui-monospace, monospace;
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

  .user-avatar-img {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 2px solid rgba(16, 185, 129, 0.3);
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
     STATUS SECTION - 52px touch targets with spring animations
     ═══════════════════════════════════════════════════════════════════════════ */
  .status-display {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    padding: var(--fb-space-sm) var(--fb-space-md);
    background: color-mix(in srgb, var(--status-color) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--status-color) 30%, transparent);
    border-radius: var(--fb-radius-md);
    color: var(--status-color);
    font-size: var(--fb-text-sm);
    font-weight: 500;
  }

  .status-display i {
    font-size: 0.9em;
  }

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
    min-height: 52px;
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
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
    100% {
      transform: scale(1);
    }
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
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
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

  .save-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--fb-space-xs);
    min-height: 52px;
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
     DELETE SECTION (Simplified)
     ═══════════════════════════════════════════════════════════════════════════ */
  .delete-section {
    margin-top: var(--fb-space-md);
    padding-top: var(--fb-space-md);
    border-top: 1px solid var(--fb-border);
  }

  .delete-btn-simple {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    padding: var(--fb-space-xs) var(--fb-space-sm);
    background: transparent;
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-sm);
    color: var(--fb-text-muted);
    font-size: var(--fb-text-xs);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .delete-btn-simple:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: var(--fb-error);
  }

  .delete-confirm-simple {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--fb-space-sm);
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
  }

  .delete-confirm-simple .delete-confirm-text {
    font-size: var(--fb-text-sm);
    color: var(--fb-text-muted);
  }

  .delete-confirm-simple .delete-confirm-actions {
    display: flex;
    gap: var(--fb-space-xs);
  }

  .cancel-btn-simple {
    padding: var(--fb-space-xs) var(--fb-space-sm);
    background: transparent;
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-sm);
    color: var(--fb-text-muted);
    font-size: var(--fb-text-xs);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn-simple:hover {
    background: var(--fb-surface-hover);
    color: var(--fb-text);
  }

  .confirm-btn-simple {
    display: flex;
    align-items: center;
    gap: var(--fb-space-2xs);
    padding: var(--fb-space-xs) var(--fb-space-sm);
    background: var(--fb-error);
    border: none;
    border-radius: var(--fb-radius-sm);
    color: white;
    font-size: var(--fb-text-xs);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .confirm-btn-simple:hover:not(:disabled) {
    background: #dc2626;
  }

  .confirm-btn-simple:disabled {
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

    .delete-confirm-simple .delete-confirm-actions {
      flex-direction: column;
    }

    .cancel-btn-simple,
    .confirm-btn-simple {
      flex: 1;
    }

    /* Edit mode responsive */
    .priority-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .context-selects {
      flex-direction: column;
      padding-left: 0;
    }

    .context-select {
      width: 100%;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     ADMIN RESPONSE SECTION
     ═══════════════════════════════════════════════════════════════════════════ */
  .response-section {
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.15);
    border-radius: var(--fb-radius-md);
    padding: var(--fb-space-md);
    margin: 0 calc(var(--fb-space-md) * -1);
  }

  .response-section .section-title {
    color: #3b82f6;
  }

  .existing-response {
    padding: var(--fb-space-sm);
    background: rgba(59, 130, 246, 0.1);
    border-radius: var(--fb-radius-sm);
    margin-bottom: var(--fb-space-sm);
  }

  .existing-response .response-message {
    margin: 0 0 var(--fb-space-xs) 0;
    font-size: var(--fb-text-sm);
    color: var(--fb-text);
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .existing-response .response-meta {
    font-size: var(--fb-text-xs);
    color: var(--fb-text-subtle);
  }

  .response-form {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-sm);
  }

  .response-textarea {
    width: 100%;
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text);
    font-size: var(--fb-text-sm);
    font-family: inherit;
    line-height: 1.5;
    resize: vertical;
    min-height: 80px;
    transition: all 0.2s ease;
  }

  .response-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }

  .response-textarea::placeholder {
    color: var(--fb-text-subtle);
  }

  .response-actions {
    display: flex;
    gap: var(--fb-space-xs);
    flex-wrap: wrap;
  }

  .send-response-btn,
  .resolve-notify-btn,
  .update-response-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--fb-space-xs);
    padding: var(--fb-space-sm) var(--fb-space-md);
    border-radius: var(--fb-radius-md);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .send-response-btn {
    background: #3b82f6;
    border: none;
    color: white;
  }

  .send-response-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  .send-response-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .resolve-notify-btn {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #10b981;
  }

  .resolve-notify-btn:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.25);
  }

  .resolve-notify-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .update-response-btn {
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    color: var(--fb-text-muted);
  }

  .update-response-btn:hover {
    background: var(--fb-surface-hover);
    color: var(--fb-text);
  }

  /* Tester confirmation display */
  .tester-confirmation {
    margin-top: var(--fb-space-md);
    padding: var(--fb-space-sm);
    background: color-mix(in srgb, var(--conf-color) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--conf-color) 30%, transparent);
    border-radius: var(--fb-radius-sm);
  }

  .tester-confirmation .confirmation-header {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    color: var(--conf-color);
    font-weight: 600;
    font-size: var(--fb-text-sm);
  }

  .tester-confirmation .confirmation-comment {
    margin: var(--fb-space-xs) 0;
    font-size: var(--fb-text-sm);
    color: var(--fb-text-muted);
    font-style: italic;
  }

  .tester-confirmation .confirmation-date {
    font-size: var(--fb-text-xs);
    color: var(--fb-text-subtle);
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

  /* ═══════════════════════════════════════════════════════════════════════════
     SUBTASKS SECTION
     ═══════════════════════════════════════════════════════════════════════════ */
  .subtasks-section {
    background: rgba(139, 92, 246, 0.05);
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: var(--fb-radius-md);
    padding: var(--fb-space-md);
    margin: 0 calc(var(--fb-space-md) * -1);
  }

  .subtasks-section .section-title {
    color: #a78bfa;
  }

  .subtask-count {
    margin-left: auto;
    padding: 2px 8px;
    background: rgba(139, 92, 246, 0.2);
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    color: #c4b5fd;
  }

  .subtasks-list {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-xs);
  }

  .subtask-item {
    display: flex;
    align-items: flex-start;
    gap: var(--fb-space-sm);
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-sm);
    transition: all 0.2s ease;
  }

  .subtask-item.completed {
    background: rgba(16, 185, 129, 0.08);
    border-color: rgba(16, 185, 129, 0.2);
  }

  .subtask-item.in-progress {
    background: rgba(245, 158, 11, 0.08);
    border-color: rgba(245, 158, 11, 0.3);
  }

  .subtask-item.blocked {
    opacity: 0.6;
  }

  .subtask-status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    font-size: 1rem;
    color: var(--fb-text-subtle);
  }

  .subtask-item.completed .subtask-status-icon {
    color: #10b981;
  }

  .subtask-item.in-progress .subtask-status-icon {
    color: #f59e0b;
  }

  .subtask-item.blocked .subtask-status-icon {
    color: var(--fb-text-subtle);
  }

  .subtask-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .subtask-id {
    font-size: 10px;
    font-weight: 600;
    color: var(--fb-text-subtle);
    font-family: "SF Mono", ui-monospace, monospace;
  }

  .subtask-title {
    font-size: var(--fb-text-sm);
    font-weight: 500;
    color: var(--fb-text);
  }

  .subtask-item.completed .subtask-title {
    text-decoration: line-through;
    color: var(--fb-text-muted);
  }

  .subtask-description {
    margin: var(--fb-space-2xs) 0 0 0;
    font-size: var(--fb-text-xs);
    color: var(--fb-text-muted);
    line-height: 1.4;
  }

  .subtask-deps {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: var(--fb-space-2xs);
    font-size: 10px;
    color: var(--fb-text-subtle);
  }

  .subtask-deps i {
    font-size: 9px;
  }

  /* Screenshots Grid */
  .screenshots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(152px, 1fr));
    gap: 12px;
    margin-top: var(--fb-space-xs);
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
    transform: scale(1.03);
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

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .status-btn,
    .status-check {
      animation: none;
    }

    .status-btn,
    .save-btn,
    .delete-btn-simple,
    .cancel-btn-simple,
    .confirm-btn-simple {
      transition: none;
    }
  }
</style>
