<script lang="ts">
  /**
   * NotificationTrigger - Dev tool for creating test notifications
   */

  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import { notificationTriggerService } from "$lib/features/feedback/services/implementations/NotificationTriggerService";
  import { toast } from "$lib/shared/toast/state/toast-state.svelte";
  import type { NotificationType } from "$lib/features/feedback/domain/models/notification-models";

  let isCreating = $state(false);
  let selectedType = $state<NotificationType>("feedback-resolved");

  const notificationPresets: Array<{
    type: NotificationType;
    label: string;
    icon: string;
    color: string;
  }> = [
    {
      type: "feedback-resolved",
      label: "Feedback Resolved",
      icon: "fa-check-circle",
      color: "#22c55e",
    },
    {
      type: "feedback-in-progress",
      label: "Feedback In Progress",
      icon: "fa-clock",
      color: "#f59e0b",
    },
    {
      type: "feedback-needs-info",
      label: "Needs Info",
      icon: "fa-question-circle",
      color: "#3b82f6",
    },
    {
      type: "achievement-unlocked",
      label: "Achievement",
      icon: "fa-trophy",
      color: "#f59e0b",
    },
    {
      type: "message-received",
      label: "Message",
      icon: "fa-envelope",
      color: "#8b5cf6",
    },
    {
      type: "sequence-liked",
      label: "Sequence Liked",
      icon: "fa-heart",
      color: "#ef4444",
    },
    {
      type: "user-followed",
      label: "New Follower",
      icon: "fa-user-plus",
      color: "#3b82f6",
    },
    {
      type: "system-announcement",
      label: "Announcement",
      icon: "fa-bullhorn",
      color: "#8b5cf6",
    },
  ];

  async function createTestNotification() {
    const user = authState.user;
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    isCreating = true;

    try {
      const preset = notificationPresets.find((p) => p.type === selectedType);
      const messages: Record<NotificationType, string> = {
        "feedback-resolved": "Your feedback has been resolved! 🎉",
        "feedback-in-progress": "We're working on your feedback",
        "feedback-needs-info": "We need more information about your feedback",
        "feedback-response": "Admin responded to your feedback",
        "sequence-liked": "Someone liked your sequence!",
        "user-followed": "You have a new follower!",
        "achievement-unlocked": "Achievement Unlocked: Test Master!",
        "message-received": "You have a new message",
        "admin-new-user-signup": "New user signed up",
        "system-announcement": "System maintenance scheduled",
      };

      // Create notification based on type
      if (selectedType.startsWith("feedback-")) {
        await notificationTriggerService.createFeedbackNotification(
          user.uid,
          selectedType as any,
          "test-feedback-id",
          "Test Feedback Title",
          messages[selectedType],
          user.uid,
          user.displayName || "Test Admin"
        );
      } else if (selectedType.startsWith("sequence-")) {
        await notificationTriggerService.createSequenceNotification(
          user.uid,
          selectedType as any,
          "test-sequence-id",
          "Test Sequence",
          messages[selectedType],
          user.uid,
          user.displayName || "Test User"
        );
      } else if (
        selectedType === "user-followed" ||
        selectedType === "achievement-unlocked"
      ) {
        await notificationTriggerService.createSocialNotification(
          user.uid,
          selectedType,
          messages[selectedType],
          user.uid,
          user.displayName || "Test User",
          selectedType === "achievement-unlocked"
            ? "test-achievement"
            : undefined,
          selectedType === "achievement-unlocked" ? "Test Master" : undefined
        );
      } else if (selectedType === "message-received") {
        const messageText = messages[selectedType];
        await notificationTriggerService.createMessageNotification(
          user.uid,
          "test-conversation-id",
          messageText,
          messageText.slice(0, 100), // messagePreview
          user.uid,
          user.displayName || "Test User"
        );
      } else if (selectedType === "system-announcement") {
        await notificationTriggerService.createSystemNotification(
          user.uid,
          "Test Announcement",
          messages[selectedType],
          "/dashboard"
        );
      }

      toast.success(
        `Test notification created: ${preset?.label || selectedType}`
      );
    } catch (error) {
      console.error("Failed to create test notification:", error);
      toast.error("Failed to create notification");
    } finally {
      isCreating = false;
    }
  }
</script>

<div class="notification-trigger">
  <div class="trigger-header">
    <div class="header-title">
      <i class="fas fa-bell"></i>
      <span>Test Notifications</span>
    </div>
  </div>

  <div class="trigger-content">
    <p class="description">Trigger a test notification to test the system</p>

    <!-- Notification type selector -->
    <div class="preset-grid">
      {#each notificationPresets as preset}
        <button
          class="preset-btn"
          class:active={selectedType === preset.type}
          style="--preset-color: {preset.color}"
          onclick={() => (selectedType = preset.type)}
          disabled={isCreating}
        >
          <i class="fas {preset.icon}"></i>
          <span class="preset-label">{preset.label}</span>
        </button>
      {/each}
    </div>

    <!-- Trigger button -->
    <button
      class="trigger-btn"
      onclick={createTestNotification}
      disabled={isCreating}
    >
      {#if isCreating}
        <i class="fas fa-spinner fa-spin"></i>
        <span>Creating...</span>
      {:else}
        <i class="fas fa-paper-plane"></i>
        <span>Send Notification</span>
      {/if}
    </button>
  </div>
</div>

<style>
  .notification-trigger {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.02);
  }

  .trigger-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .header-title i {
    color: #fbbf24;
  }

  .trigger-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .description {
    margin: 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .preset-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: var(--min-touch-target);
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .preset-btn i {
    color: var(--preset-color);
    font-size: 14px;
  }

  .preset-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--preset-color);
  }

  .preset-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .preset-btn.active {
    background: color-mix(in srgb, var(--preset-color) 15%, transparent);
    border-color: var(--preset-color);
    color: white;
  }

  .preset-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .trigger-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: var(--min-touch-target);
    padding: 14px 20px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .trigger-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }

  .trigger-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .trigger-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
</style>
