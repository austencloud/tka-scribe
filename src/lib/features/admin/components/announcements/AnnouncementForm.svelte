<!--
  AnnouncementForm - Create/Edit Announcement (2025 Design)

  Modern chip-based form with solid gradients and vibrant colors.
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
  import UserSearchInput from "./UserSearchInput.svelte";

  interface Props {
    announcement?: Announcement | null;
    onSave: () => void;
    onCancel: () => void;
  }

  let { announcement = null, onSave, onCancel }: Props = $props();

  // Services
  let announcementService: IAnnouncementService | null = null;

  onMount(() => {
    announcementService = resolve<IAnnouncementService>(
      TYPES.IAnnouncementService
    );
  });

  // Form state
  let title = $state(announcement?.title ?? "");
  let message = $state(announcement?.message ?? "");
  let severity = $state<AnnouncementSeverity>(announcement?.severity ?? "info");
  let targetAudience = $state<AnnouncementAudience>(
    announcement?.targetAudience ?? "all"
  );
  let targetUserId = $state(announcement?.targetUserId ?? "");
  let targetUserDisplay = $state(""); // Display name for selected user
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

  // Handler for user selection
  function handleUserSelect(
    userId: string,
    displayName: string,
    email: string
  ) {
    targetUserId = userId;
    targetUserDisplay = displayName || email;
  }

  // Severity options with colors
  const severityOptions: {
    value: AnnouncementSeverity;
    label: string;
    icon: string;
    color: string;
  }[] = [
    { value: "info", label: "Info", icon: "fa-info-circle", color: "#6366f1" },
    {
      value: "warning",
      label: "Warning",
      icon: "fa-exclamation-triangle",
      color: "#f59e0b",
    },
    {
      value: "critical",
      label: "Critical",
      icon: "fa-exclamation-circle",
      color: "#ef4444",
    },
  ];

  // Audience options
  const audienceOptions: {
    value: AnnouncementAudience;
    label: string;
    icon: string;
  }[] = [
    { value: "all", label: "All Users", icon: "fa-users" },
    { value: "admins", label: "Admins Only", icon: "fa-shield-alt" },
    { value: "beta", label: "Beta Testers", icon: "fa-flask" },
    { value: "new", label: "New Users", icon: "fa-user-plus" },
    { value: "active", label: "Active Users", icon: "fa-user-check" },
    { value: "creators", label: "Creators", icon: "fa-magic" },
    { value: "specific-user", label: "Specific User", icon: "fa-user" },
  ];

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
    if (targetAudience === "specific-user" && !targetUserId.trim()) {
      error = "User ID is required for specific user targeting";
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
        targetUserId:
          targetAudience === "specific-user" ? targetUserId.trim() : undefined,
        showAsModal,
        expiresAt:
          hasExpiration && expirationDate
            ? new Date(expirationDate)
            : undefined,
        actionUrl: actionUrl.trim() || undefined,
        actionLabel: actionLabel.trim() || undefined,
        createdBy: user.uid,
      };

      if (announcement) {
        await announcementService.updateAnnouncement(
          announcement.id,
          announcementData
        );
      } else {
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
    <div class="form-section">
      <label class="section-label" for="announcement-title">Title</label>
      <input
        id="announcement-title"
        type="text"
        class="text-input"
        bind:value={title}
        placeholder="e.g., New Feature: Dark Mode"
        maxlength="100"
        required
      />
      <span class="char-count">{title.length}/100</span>
    </div>

    <!-- Message -->
    <div class="form-section">
      <label class="section-label" for="announcement-message">Message</label>
      <textarea
        id="announcement-message"
        class="text-input"
        bind:value={message}
        placeholder="Announcement message (supports markdown)"
        rows="6"
        required
      ></textarea>
      <span class="help-text">Supports markdown formatting</span>
    </div>

    <!-- Severity Selection (Chips) -->
    <div class="form-section">
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <span class="section-label">Severity</span>
      <div class="chip-group" role="group" aria-label="Severity">
        {#each severityOptions as option}
          <button
            type="button"
            class="selection-chip"
            class:active={severity === option.value}
            style="--chip-color: {option.color}"
            onclick={() => (severity = option.value)}
            aria-pressed={severity === option.value}
          >
            <i class="fas {option.icon}"></i>
            <span>{option.label}</span>
            {#if severity === option.value}
              <i class="fas fa-check chip-check"></i>
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <!-- Target Audience Selection (Chips) -->
    <div class="form-section">
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <span class="section-label">Target Audience</span>
      <div class="chip-group" role="group" aria-label="Target Audience">
        {#each audienceOptions as option}
          <button
            type="button"
            class="selection-chip"
            class:active={targetAudience === option.value}
            onclick={() => (targetAudience = option.value)}
            aria-pressed={targetAudience === option.value}
          >
            <i class="fas {option.icon}"></i>
            <span>{option.label}</span>
            {#if targetAudience === option.value}
              <i class="fas fa-check chip-check"></i>
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <!-- Specific User Search (conditional) -->
    {#if targetAudience === "specific-user"}
      <div class="form-section indented">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <span class="section-label">Select User</span>
        <UserSearchInput
          selectedUserId={targetUserId}
          selectedUserDisplay={targetUserDisplay}
          onSelect={handleUserSelect}
        />
        <span class="help-text">Search by name or email</span>
      </div>
    {/if}

    <!-- Display Options (Toggle Chips) -->
    <div class="form-section">
      <span class="section-label">Display Options</span>
      <div class="chip-group" role="group" aria-label="Display Options">
        <button
          type="button"
          class="toggle-chip"
          class:active={showAsModal}
          onclick={() => (showAsModal = !showAsModal)}
          aria-pressed={showAsModal}
        >
          <i class="fas fa-window-maximize"></i>
          <span>Show as Modal</span>
          {#if showAsModal}
            <i class="fas fa-check chip-check"></i>
          {/if}
        </button>

        <button
          type="button"
          class="toggle-chip"
          class:active={hasExpiration}
          onclick={() => (hasExpiration = !hasExpiration)}
          aria-pressed={hasExpiration}
        >
          <i class="fas fa-calendar-times"></i>
          <span>Set Expiration</span>
          {#if hasExpiration}
            <i class="fas fa-check chip-check"></i>
          {/if}
        </button>
      </div>
    </div>

    <!-- Expiration Date (conditional) -->
    {#if hasExpiration}
      <div class="form-section indented">
        <label class="section-label" for="expiration-date"
          >Expiration Date</label
        >
        <input
          id="expiration-date"
          type="date"
          class="text-input"
          bind:value={expirationDate}
          required={hasExpiration}
        />
      </div>
    {/if}

    <!-- Action URL (optional) -->
    <div class="form-section">
      <label class="section-label" for="action-url"
        >Action URL <span class="optional">(optional)</span></label
      >
      <input
        id="action-url"
        type="text"
        class="text-input"
        bind:value={actionUrl}
        placeholder="/settings?tab=whats-new or https://..."
      />
      <span class="help-text">Internal path or external URL for action button</span>
    </div>

    {#if actionUrl}
      <div class="form-section indented">
        <label class="section-label" for="action-label"
          >Action Button Label</label
        >
        <input
          id="action-label"
          type="text"
          class="text-input"
          bind:value={actionLabel}
          placeholder="Learn More"
          maxlength="30"
        />
      </div>
    {/if}

    <!-- Form Actions -->
    <div class="form-actions">
      <button type="button" class="cancel-button" onclick={onCancel}>
        <i class="fas fa-times"></i>
        Cancel
      </button>
      <button type="submit" class="save-button" disabled={isSaving}>
        {#if isSaving}
          <i class="fas fa-spinner fa-spin"></i>
          Saving...
        {:else}
          <i class="fas fa-check"></i>
          {announcement ? "Update" : "Create"}
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
    padding: 0 4px;
  }

  /* ============================================================================
     FORM HEADER
     ============================================================================ */
  .form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 2px solid rgba(99, 102, 241, 0.2);
  }

  .form-header h2 {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 52px;
    min-height: 52px;
    background: linear-gradient(135deg, #2d2d3a 0%, #1f1f28 100%);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: linear-gradient(135deg, #3d3d4a 0%, #2f2f38 100%);
    color: #ffffff;
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.25);
  }

  /* ============================================================================
     ERROR MESSAGE
     ============================================================================ */
  .error-message {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    border: 2px solid #ef4444;
    border-radius: 12px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }

  /* ============================================================================
     FORM SECTIONS
     ============================================================================ */
  .form-section {
    margin-bottom: 28px;
  }

  .section-label {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12px;
    letter-spacing: -0.2px;
  }

  .optional {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
  }

  .text-input {
    width: 100%;
    padding: 16px 20px;
    min-height: 52px;
    background: linear-gradient(135deg, #1a1a24 0%, #16161e 100%);
    border: 2px solid rgba(99, 102, 241, 0.3);
    border-radius: 12px;
    color: #ffffff;
    font-size: 15px;
    font-family: inherit;
    transition: all 0.2s ease;
    resize: vertical;
  }

  .text-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .text-input:focus {
    outline: none;
    border-color: #6366f1;
    background: linear-gradient(135deg, #20202e 0%, #1c1c28 100%);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
  }

  textarea.text-input {
    min-height: 140px;
    line-height: 1.6;
  }

  .char-count,
  .help-text {
    display: block;
    margin-top: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
  }

  .indented {
    margin-left: 20px;
    padding-left: 20px;
    border-left: 3px solid #6366f1;
  }

  /* ============================================================================
     CHIP GROUPS - 2025 SOLID DESIGN
     ============================================================================ */
  .chip-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .selection-chip,
  .toggle-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    min-height: 52px;
    background: linear-gradient(135deg, #2d2d3a 0%, #25252f 100%);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .selection-chip i:not(.chip-check),
  .toggle-chip i:not(.chip-check) {
    font-size: 16px;
    opacity: 0.9;
  }

  .selection-chip:hover,
  .toggle-chip:hover {
    background: linear-gradient(135deg, #3d3d4a 0%, #35353f 100%);
    border-color: rgba(255, 255, 255, 0.25);
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .selection-chip.active {
    background: linear-gradient(
      135deg,
      var(--chip-color, #6366f1) 0%,
      color-mix(in srgb, var(--chip-color, #6366f1) 80%, black) 100%
    );
    border-color: var(--chip-color, #6366f1);
    color: #ffffff;
    box-shadow:
      0 0 24px color-mix(in srgb, var(--chip-color, #6366f1) 40%, transparent),
      0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .toggle-chip.active {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border-color: #818cf8;
    color: #ffffff;
    box-shadow:
      0 0 24px rgba(99, 102, 241, 0.4),
      0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .chip-check {
    margin-left: auto;
    font-size: 14px;
    animation: checkPop 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes checkPop {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* ============================================================================
     FORM ACTIONS
     ============================================================================ */
  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 2px solid rgba(99, 102, 241, 0.2);
  }

  .cancel-button,
  .save-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 16px 28px;
    min-height: 52px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .cancel-button {
    background: linear-gradient(135deg, #2d2d3a 0%, #25252f 100%);
    border: 2px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .cancel-button:hover {
    background: linear-gradient(135deg, #3d3d4a 0%, #35353f 100%);
    border-color: rgba(255, 255, 255, 0.25);
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .save-button {
    background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
    border: 2px solid #a5b4fc;
    color: #ffffff;
    box-shadow:
      0 0 20px rgba(99, 102, 241, 0.3),
      0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .save-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #9ca3f8 0%, #7c7fef 100%);
    transform: translateY(-2px);
    box-shadow:
      0 0 30px rgba(99, 102, 241, 0.5),
      0 6px 20px rgba(0, 0, 0, 0.5);
  }

  .save-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 640px) {
    .form-header h2 {
      font-size: 24px;
    }

    .form-section {
      margin-bottom: 24px;
    }

    .chip-group {
      gap: 8px;
    }

    .selection-chip,
    .toggle-chip {
      padding: 12px 16px;
      font-size: 13px;
      min-height: 52px;
    }

    .form-actions {
      flex-direction: column;
      gap: 10px;
    }

    .indented {
      margin-left: 12px;
      padding-left: 12px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .selection-chip,
    .toggle-chip,
    .cancel-button,
    .save-button,
    .text-input {
      transition: none;
      animation: none;
    }

    .chip-check {
      animation: none;
    }

    .selection-chip:hover,
    .toggle-chip:hover,
    .cancel-button:hover,
    .save-button:hover {
      transform: none;
    }
  }
</style>
