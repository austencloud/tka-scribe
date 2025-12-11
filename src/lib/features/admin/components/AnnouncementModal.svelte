<!--
  AnnouncementModal - Modal for Forced Announcement Display

  Shows important announcements that require user dismissal.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IAnnouncementService } from "../services/contracts/IAnnouncementService";
  import type { Announcement } from "../domain/models/announcement-models";
  import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import type { ModuleId } from "$lib/shared/navigation/domain/types";

  interface Props {
    announcement: Announcement;
    onDismiss: () => void;
  }

  let { announcement, onDismiss }: Props = $props();

  // Services (resolved lazily to avoid module initialization errors)
  let announcementService: IAnnouncementService | null = null;

  onMount(() => {
    announcementService = resolve<IAnnouncementService>(
      TYPES.IAnnouncementService
    );
  });

  // Check if URL is internal (starts with /)
  function isInternalUrl(url: string): boolean {
    return url.startsWith('/');
  }

  // Handle internal navigation
  async function handleInternalNavigation(url: string) {
    // Parse the URL to extract module and tab
    // Expected format: /settings?tab=whats-new or /module?tab=tabname
    const [path, queryString] = url.split('?');
    const moduleId = path.replace('/', '') as ModuleId;

    // Parse query params
    const params = new URLSearchParams(queryString || '');
    const tab = params.get('tab');

    // Navigate to module
    await handleModuleChange(moduleId);

    // Set tab if specified
    if (tab) {
      // Small delay to ensure module is loaded
      setTimeout(() => {
        navigationState.setActiveTab(tab);
      }, 100);
    }

    // Dismiss the announcement
    await handleDismiss();
  }

  async function handleDismiss() {
    if (!authStore.user || !announcementService) return;

    try {
      await announcementService.dismissAnnouncement(
        authStore.user.uid,
        announcement.id
      );
      onDismiss();
    } catch (error) {
      console.error("Failed to dismiss announcement:", error);
      // Still dismiss locally even if Firebase fails
      onDismiss();
    }
  }

  function getSeverityColor(severity: Announcement["severity"]): string {
    switch (severity) {
      case "critical":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
        return "#6366f1";
    }
  }

  function getSeverityIcon(severity: Announcement["severity"]): string {
    switch (severity) {
      case "critical":
        return "fa-exclamation-triangle";
      case "warning":
        return "fa-exclamation-circle";
      case "info":
        return "fa-info-circle";
    }
  }
</script>

<div
  class="modal-overlay"
  onclick={handleDismiss}
  onkeydown={(e) => e.key === "Escape" && handleDismiss()}
  role="button"
  tabindex="-1"
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="modal-content"
    onclick={(e) => e.stopPropagation()}
    role="presentation"
  >
    <div
      class="modal-header"
      style="--severity-color: {getSeverityColor(announcement.severity)};"
    >
      <div class="header-icon">
        <i class="fas {getSeverityIcon(announcement.severity)}"></i>
      </div>
      <button class="close-button" onclick={handleDismiss} aria-label="Close">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <span
        class="severity-badge"
        style="background: {getSeverityColor(announcement.severity)};"
      >
        {announcement.severity}
      </span>
      <h2 class="announcement-title">{announcement.title}</h2>
      <p class="announcement-message">{announcement.message}</p>
    </div>

    <div class="modal-footer">
      {#if announcement.actionUrl}
        {#if isInternalUrl(announcement.actionUrl)}
          <button
            class="action-button secondary"
            onclick={() => handleInternalNavigation(announcement.actionUrl!)}
          >
            {announcement.actionLabel || "Learn More"}
            <i class="fas fa-arrow-right"></i>
          </button>
        {:else}
          <a
            href={announcement.actionUrl}
            class="action-button secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            {announcement.actionLabel || "Learn More"}
            <i class="fas fa-external-link-alt"></i>
          </a>
        {/if}
      {/if}
      <button class="action-button primary" onclick={handleDismiss}>
        <i class="fas fa-check"></i>
        Got it
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    max-width: 600px;
    width: 100%;
    background: rgba(20, 22, 36, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* ============================================================================
     MODAL HEADER
     ============================================================================ */
  .modal-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
    background: linear-gradient(
      135deg,
      rgba(var(--severity-color, 99 102 241), 0.2) 0%,
      rgba(var(--severity-color, 99 102 241), 0.1) 100%
    );
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.9);
    font-size: 32px;
  }

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
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
     MODAL BODY
     ============================================================================ */
  .modal-body {
    padding: 32px 24px;
  }

  .severity-badge {
    display: inline-block;
    padding: 6px 14px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: white;
    border-radius: 6px;
    letter-spacing: 0.5px;
    margin-bottom: 16px;
  }

  .announcement-title {
    font-size: 24px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 16px 0;
    line-height: 1.3;
  }

  .announcement-message {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.7;
    margin: 0;
    white-space: pre-wrap;
  }

  /* ============================================================================
     MODAL FOOTER
     ============================================================================ */
  .modal-footer {
    display: flex;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .action-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 24px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .action-button.primary {
    background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
    border: none;
    color: white;
  }

  .action-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
  }

  .action-button.secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .action-button.secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .action-button:active {
    transform: translateY(0);
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 640px) {
    .modal-content {
      border-radius: 16px;
    }

    .modal-header {
      padding: 24px 16px;
    }

    .header-icon {
      width: 52px;
      height: 52px;
      font-size: 24px;
    }

    .modal-body {
      padding: 24px 16px;
    }

    .announcement-title {
      font-size: 20px;
    }

    .announcement-message {
      font-size: 14px;
    }

    .modal-footer {
      flex-direction: column;
      padding: 16px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .modal-overlay,
    .modal-content {
      animation: none;
    }

    .action-button:hover {
      transform: none;
    }
  }
</style>
