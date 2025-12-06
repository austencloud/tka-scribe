<!-- FeedbackViewPanel - Read-only view of archived feedback in a drawer -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { FeedbackItem } from "$lib/features/feedback/domain/models/feedback-models";
  import { TYPE_CONFIG } from "$lib/features/feedback/domain/models/feedback-models";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import { feedbackService } from "$lib/features/feedback/services/implementations/FeedbackService";

  let {
    feedbackId,
    isOpen = $bindable(false),
  }: {
    feedbackId: string | null;
    isOpen?: boolean;
  } = $props();

  // Reactive state
  let feedback = $state<FeedbackItem | null>(null);
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  // Mobile detection for drawer placement
  let isMobile = $state(false);

  onMount(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    isMobile = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  const placement = $derived(isMobile ? "bottom" : "right");

  // Load feedback when feedbackId changes and drawer is open
  $effect(() => {
    if (feedbackId && isOpen) {
      loadFeedback(feedbackId);
    }
  });

  async function loadFeedback(id: string) {
    isLoading = true;
    error = null;

    try {
      feedback = await feedbackService.getFeedback(id);
      if (!feedback) {
        error = "Feedback not found";
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load feedback";
      console.error("Failed to load feedback:", e);
    } finally {
      isLoading = false;
    }
  }

  // Format dates
  function formatDate(date: Date | undefined): string {
    if (!date) return "Unknown";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Get type config
  const typeConfig = $derived(feedback ? TYPE_CONFIG[feedback.type] : null);
</script>

<Drawer
  bind:isOpen
  {placement}
  class="feedback-view-drawer"
  showHandle={isMobile}
  ariaLabel={feedback ? `Feedback: ${feedback.title}` : "Feedback details"}
>
  <div class="panel-content">
    <!-- Header -->
    <header class="panel-header">
      <button
        type="button"
        class="close-button"
        onclick={() => (isOpen = false)}
        aria-label="Close feedback details"
      >
        <i class="fas fa-times"></i>
      </button>

      {#if feedback && typeConfig}
        <div class="type-badge" style:--type-color={typeConfig.color}>
          <i class="fas {typeConfig.icon}"></i>
          <span>{typeConfig.label}</span>
        </div>
      {/if}
    </header>

    {#if isLoading}
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading feedback...</span>
      </div>
    {:else if error}
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <span>{error}</span>
      </div>
    {:else if feedback}
      <!-- Title -->
      <section class="title-section">
        <h2 class="feedback-title">{feedback.title}</h2>
      </section>

      <!-- Description -->
      <section class="description-section">
        <h3>Description</h3>
        <p class="description-text">{feedback.description}</p>
      </section>

      <!-- Context -->
      <section class="context-section">
        <h3>Context</h3>
        <div class="context-grid">
          <div class="context-item">
            <span class="context-label">Module</span>
            <span class="context-value">
              {feedback.reportedModule || feedback.capturedModule}
            </span>
          </div>
          <div class="context-item">
            <span class="context-label">Tab</span>
            <span class="context-value">
              {feedback.reportedTab || feedback.capturedTab}
            </span>
          </div>
        </div>
      </section>

      <!-- Submitter Info -->
      <section class="submitter-section">
        <h3>Submitted By</h3>
        <div class="submitter-info">
          {#if feedback.userPhotoURL}
            <img src={feedback.userPhotoURL} alt="" class="submitter-avatar" />
          {:else}
            <div class="submitter-avatar-placeholder">
              <i class="fas fa-user"></i>
            </div>
          {/if}
          <div class="submitter-details">
            <span class="submitter-name">{feedback.userDisplayName}</span>
            <span class="submitter-date">{formatDate(feedback.createdAt)}</span>
          </div>
        </div>
      </section>

      <!-- Resolution Info -->
      {#if feedback.archivedAt}
        <section class="resolution-section">
          <h3>Resolved</h3>
          <div class="resolution-info">
            <div class="resolution-item">
              <i class="fas fa-check-circle"></i>
              <span>Completed {formatDate(feedback.archivedAt)}</span>
            </div>
            {#if feedback.fixedInVersion && feedback.fixedInVersion !== "0.0.0"}
              <div class="resolution-item">
                <i class="fas fa-tag"></i>
                <span>Released in v{feedback.fixedInVersion}</span>
              </div>
            {/if}
          </div>
        </section>
      {/if}

      <!-- Admin Response (if any) -->
      {#if feedback.adminResponse}
        <section class="response-section">
          <h3>Response</h3>
          <div class="response-card">
            <p class="response-text">{feedback.adminResponse.message}</p>
            <time class="response-date">
              {formatDate(feedback.adminResponse.respondedAt)}
            </time>
          </div>
        </section>
      {/if}
    {/if}
  </div>
</Drawer>

<style>
  .panel-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 24px;
    overflow-y: auto;
  }

  /* Header */
  .panel-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 0;
    right: 0;
    width: 56px;
    height: 56px;
    min-width: 56px;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .type-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: color-mix(in srgb, var(--type-color) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--type-color) 30%, transparent);
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    color: var(--type-color);
  }

  .type-badge i {
    font-size: 12px;
  }

  /* Loading / Error states */
  .loading-state,
  .error-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .loading-state i,
  .error-state i {
    font-size: 32px;
  }

  .error-state {
    color: #ef4444;
  }

  /* Sections */
  section {
    margin-bottom: 24px;
  }

  section h3 {
    margin: 0 0 12px 0;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Title section */
  .title-section {
    margin-bottom: 16px;
  }

  .feedback-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.4;
  }

  /* Description */
  .description-text {
    margin: 0;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.8);
    white-space: pre-wrap;
  }

  /* Context */
  .context-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .context-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }

  .context-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .context-value {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    text-transform: capitalize;
  }

  /* Submitter */
  .submitter-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .submitter-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .submitter-avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.4);
  }

  .submitter-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .submitter-name {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .submitter-date {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Resolution */
  .resolution-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .resolution-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 8px;
    color: #34d399;
    font-size: 14px;
  }

  .resolution-item i {
    font-size: 16px;
  }

  /* Response */
  .response-card {
    padding: 16px;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 12px;
  }

  .response-text {
    margin: 0 0 8px 0;
    font-size: 14px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
    white-space: pre-wrap;
  }

  .response-date {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .panel-content {
      padding: 16px;
      max-height: 85vh;
    }

    .panel-header {
      margin-bottom: 16px;
    }

    .feedback-title {
      font-size: 18px;
    }

    .context-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
