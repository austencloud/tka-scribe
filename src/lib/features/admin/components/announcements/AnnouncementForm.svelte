<!--
  AnnouncementForm - Create/Edit Announcement

  Form for creating new announcements or editing existing ones.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import type { IAnnouncementService } from "../../services/contracts/IAnnouncementService";
  import type {
    Announcement,
    AnnouncementSeverity,
    AnnouncementAudience,
  } from "../../domain/models/announcement-models";
  import { DEFAULT_ANNOUNCEMENT } from "../../domain/models/announcement-models";

  interface Props {
    announcement?: Announcement | null;
    onSave: () => void;
    onCancel: () => void;
  }

  let { announcement = null, onSave, onCancel }: Props = $props();

  // Services (resolved lazily to avoid module initialization errors)
  let announcementService: IAnnouncementService | null = null;

  onMount(() => {
    announcementService = resolve<IAnnouncementService>(
      TYPES.IAnnouncementService
    );
  });

  // Form state
  let title = $state(announcement?.title ?? "");
  let message = $state(announcement?.message ?? "");
  let severity = $state<AnnouncementSeverity>(
    announcement?.severity ?? "info"
  );
  let targetAudience = $state<AnnouncementAudience>(
    announcement?.targetAudience ?? "all"
  );
  let showAsModal = $state(announcement?.showAsModal ?? true);
  let hasExpiration = $state(!!announcement?.expiresAt);
  let expirationDate = $state(
    announcement?.expiresAt
      ? new Date(announcement.expiresAt).toISOString().split("T")[0]
      : ""
  );
  let actionUrl = $state(announcement?.actionUrl ?? "");
  let actionLabel = $state(announcement?.actionLabel ?? "");

  let isSaving = $state(false);
  let error = $state<string | null>(null);

  async function handleSubmit(e: Event) {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      error = "Title is required";
      return;
    }
    if (!message.trim()) {
      error = "Message is required";
      return;
    }
    if (hasExpiration && !expirationDate) {
      error = "Expiration date is required";
      return;
    }

    const user = authStore.user;
    if (!user) {
      error = "You must be logged in to create announcements";
      return;
    }

    if (!announcementService) {
      error = "Service not available. Please try again.";
      return;
    }

    try {
      isSaving = true;
      error = null;

      const announcementData = {
        title: title.trim(),
        message: message.trim(),
        severity,
        targetAudience,
        showAsModal,
        expiresAt: hasExpiration ? new Date(expirationDate) : undefined,
        actionUrl: actionUrl.trim() || undefined,
        actionLabel: actionLabel.trim() || undefined,
        createdBy: user.uid,
      };

      if (announcement) {
        // Update existing
        await announcementService.updateAnnouncement(
          announcement.id,
          announcementData
        );
      } else {
        // Create new
        await announcementService.createAnnouncement(announcementData);
      }

      onSave();
    } catch (err) {
      console.error("Failed to save announcement:", err);
      error = "Failed to save announcement. Please try again.";
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="announcement-form">
  <div class="form-header">
    <h2>{announcement ? "Edit" : "Create"} Announcement</h2>
    <button class="close-button" onclick={onCancel} aria-label="Close">
      <i class="fas fa-times"></i>
    </button>
  </div>

  <form onsubmit={handleSubmit}>
    {#if error}
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {error}
      </div>
    {/if}

    <!-- Title -->
    <div class="form-group">
      <label for="title">Title</label>
      <input
        type="text"
        id="title"
        bind:value={title}
        placeholder="e.g., New Feature: Dark Mode"
        maxlength="100"
        required
      />
      <span class="char-count">{title.length}/100</span>
    </div>

    <!-- Message -->
    <div class="form-group">
      <label for="message">Message</label>
      <textarea
        id="message"
        bind:value={message}
        placeholder="Announcement message (supports markdown)"
        rows="6"
        required
      ></textarea>
      <span class="help-text">Supports markdown formatting</span>
    </div>

    <!-- Severity -->
    <div class="form-group">
      <label for="severity">Severity</label>
      <select id="severity" bind:value={severity}>
        <option value="info">Info</option>
        <option value="warning">Warning</option>
        <option value="critical">Critical</option>
      </select>
    </div>

    <!-- Target Audience -->
    <div class="form-group">
      <label for="target">Target Audience</label>
      <select id="target" bind:value={targetAudience}>
        <option value="all">All Users</option>
        <option value="beta">Beta Testers</option>
        <option value="new">New Users</option>
        <option value="active">Active Users</option>
        <option value="creators">Creators</option>
      </select>
    </div>

    <!-- Show as Modal -->
    <div class="form-group checkbox-group">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={showAsModal} />
        <span>Show as modal (force users to dismiss)</span>
      </label>
    </div>

    <!-- Expiration -->
    <div class="form-group checkbox-group">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={hasExpiration} />
        <span>Set expiration date</span>
      </label>
    </div>

    {#if hasExpiration}
      <div class="form-group indented">
        <label for="expiration">Expiration Date</label>
        <input type="date" id="expiration" bind:value={expirationDate} />
      </div>
    {/if}

    <!-- Action URL (optional) -->
    <div class="form-group">
      <label for="action-url">Action URL (optional)</label>
      <input
        type="url"
        id="action-url"
        bind:value={actionUrl}
        placeholder="https://example.com/learn-more"
      />
      <span class="help-text">Link for "Learn More" button</span>
    </div>

    {#if actionUrl}
      <div class="form-group">
        <label for="action-label">Action Button Label</label>
        <input
          type="text"
          id="action-label"
          bind:value={actionLabel}
          placeholder="Learn More"
          maxlength="30"
        />
      </div>
    {/if}

    <!-- Form Actions -->
    <div class="form-actions">
      <button type="button" class="cancel-button" onclick={onCancel}>
        Cancel
      </button>
      <button type="submit" class="save-button" disabled={isSaving}>
        {#if isSaving}
          <i class="fas fa-spinner fa-spin"></i>
          Saving...
        {:else}
          <i class="fas fa-check"></i>
          {announcement ? "Update" : "Create"} Announcement
        {/if}
      </button>
    </div>
  </form>
</div>

<style>
  .announcement-form {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  /* ============================================================================
     FORM HEADER
     ============================================================================ */
  .form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .form-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.95);
  }

  /* ============================================================================
     ERROR MESSAGE
     ============================================================================ */
  .error-message {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    color: #f87171;
    font-size: 14px;
    margin-bottom: 20px;
  }

  /* ============================================================================
     FORM GROUPS
     ============================================================================ */
  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 8px;
  }

  .form-group input[type="text"],
  .form-group input[type="url"],
  .form-group input[type="date"],
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s ease;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: rgba(99, 102, 241, 0.5);
    background: rgba(255, 255, 255, 0.08);
  }

  .form-group textarea {
    resize: vertical;
    min-height: 120px;
  }

  .char-count,
  .help-text {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* ============================================================================
     CHECKBOX GROUPS
     ============================================================================ */
  .checkbox-group {
    margin-bottom: 16px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  .checkbox-label span {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
  }

  .indented {
    margin-left: 32px;
  }

  /* ============================================================================
     FORM ACTIONS
     ============================================================================ */
  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 32px;
  }

  .cancel-button,
  .save-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 24px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }

  .cancel-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.95);
  }

  .save-button {
    background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
    border: none;
    color: white;
  }

  .save-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
  }

  .save-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 640px) {
    .form-header h2 {
      font-size: 20px;
    }

    .form-actions {
      flex-direction: column;
    }
  }
</style>
