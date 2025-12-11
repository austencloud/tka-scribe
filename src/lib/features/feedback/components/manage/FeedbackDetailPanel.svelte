<!-- FeedbackDetailPanel - Refactored with service-based architecture and Svelte 5 runes -->
<script lang="ts">
  import type { FeedbackItem, TesterConfirmationStatus } from "../../domain/models/feedback-models";
  import type { FeedbackManageState } from "../../state/feedback-manage-state.svelte";
  import { createFeedbackDetailState } from "../../state/feedback-detail-state.svelte";
  import { PRIORITY_CONFIG, CONFIRMATION_STATUS_CONFIG } from "../../domain/models/feedback-models";
  import { feedbackService } from "../../services/implementations/FeedbackService";
  import FeedbackHeader from "./detail/FeedbackHeader.svelte";
  import FeedbackMetadataCard from "./detail/FeedbackMetadataCard.svelte";
  import FeedbackSubtaskPanel from "./detail/FeedbackSubtaskPanel.svelte";
  import FeedbackStatusGrid from "./detail/FeedbackStatusGrid.svelte";
  import FeedbackActionBar from "./detail/FeedbackActionBar.svelte";

  interface Props {
    item: FeedbackItem;
    manageState?: FeedbackManageState | null;
    onClose: () => void;
    readOnly?: boolean;
  }

  const {
    item,
    manageState = null,
    onClose,
    readOnly = false,
  }: Props = $props();

  // Create state wrapper - orchestrates services and reactive state
  const detailState = createFeedbackDetailState(item, manageState, readOnly);

  // Update state when item changes (real-time updates from parent)
  $effect(() => {
    detailState.updateItem(item);
  });

  // Auto-resize textarea
  let descriptionTextarea: HTMLTextAreaElement;
  function autoResizeTextarea(textarea: HTMLTextAreaElement) {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  $effect(() => {
    detailState.editDescription;
    if (descriptionTextarea) {
      autoResizeTextarea(descriptionTextarea);
    }
  });

  async function handleGenerateTitle() {
    if (readOnly || !manageState) return;
    try {
      await manageState.generateTitle(item.id, item.description);
    } catch (err) {
      console.error("Failed to generate title:", err);
    }
  }

  async function handleSendResponse() {
    if (readOnly || !manageState || detailState.isSendingResponse || !detailState.adminResponseMessage.trim()) return;
    try {
      await feedbackService.sendAdminResponse(
        item.id,
        detailState.adminResponseMessage.trim(),
        true
      );
      detailState.showResponseForm = false;
      await manageState.refreshItem(item.id);
    } catch (err) {
      console.error("Failed to send response:", err);
    }
  }

  async function handleMarkResolved() {
    if (readOnly || !manageState || detailState.isUpdatingStatus) return;
    await manageState.updateStatus(item.id, "in-review");
    await feedbackService.notifyTesterResolved(
      item.id,
      detailState.adminResponseMessage.trim() || undefined
    );
  }
</script>

<div class="detail-panel">
  <FeedbackHeader {detailState} {readOnly} {onClose} />

  <div class="panel-content">
    <!-- Description Section - Primary content -->
    <section class="section">
      <h3 class="section-title">Description</h3>
      <textarea
        class="inline-edit-textarea auto-resize"
        bind:this={descriptionTextarea}
        bind:value={detailState.editDescription}
        onblur={() => detailState.handleFieldBlur()}
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

    <!-- Title Section - Inline editable -->
    <section class="section title-section">
      <div class="title-row">
        <div class="title-content">
          <h3 class="section-title">Title</h3>
          <input
            type="text"
            class="inline-edit-input"
            bind:value={detailState.editTitle}
            onblur={() => detailState.handleFieldBlur()}
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

    <!-- Priority Section -->
    <section class="section">
      <h3 class="section-title">
        <i class="fas fa-exclamation-circle"></i>
        Priority
      </h3>
      <div class="priority-grid">
        <button
          type="button"
          class="priority-btn"
          class:active={detailState.editPriority === ""}
          onclick={() => {
            detailState.editPriority = "";
            void detailState.saveChanges();
          }}
        >
          <i class="fas fa-minus"></i>
          <span>None</span>
        </button>
        {#each Object.entries(PRIORITY_CONFIG) as [priority, config]}
          <button
            type="button"
            class="priority-btn"
            class:active={detailState.editPriority === priority}
            style="--priority-color: {config.color}"
            onclick={() => {
              detailState.editPriority = priority as any;
              void detailState.saveChanges();
            }}
          >
            <i class="fas {config.icon}"></i>
            <span>{config.label}</span>
          </button>
        {/each}
      </div>
    </section>

    <!-- Metadata Card - User info and timestamps -->
    <FeedbackMetadataCard {detailState} />

    <!-- Status Grid -->
    <FeedbackStatusGrid {detailState} {readOnly} />

    <!-- Subtasks Panel -->
    <FeedbackSubtaskPanel subtasks={item.subtasks || []} />

    <!-- Admin Response Section (complex conditionals - stays inline) -->
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
              Sent {detailState.formatRelativeTime(item.adminResponse.respondedAt)}
            </span>
          </div>
        {/if}

        {#if !readOnly}
          {#if detailState.showResponseForm || !item.adminResponse}
            <div class="response-form">
              <textarea
                class="response-textarea"
                bind:value={detailState.adminResponseMessage}
                placeholder="Write a message to notify the tester about this feedback..."
                rows="3"
              ></textarea>

              <div class="response-actions">
                <button
                  type="button"
                  class="send-response-btn"
                  onclick={handleSendResponse}
                  disabled={detailState.isSendingResponse || !detailState.adminResponseMessage.trim()}
                >
                  {#if detailState.isSendingResponse}
                    <i class="fas fa-spinner fa-spin"></i>
                  {:else}
                    <i class="fas fa-paper-plane"></i>
                  {/if}
                  Send Response
                </button>

                {#if item.status !== "in-review" && item.status !== "completed"}
                  <button
                    type="button"
                    class="resolve-notify-btn"
                    onclick={handleMarkResolved}
                    disabled={detailState.isUpdatingStatus}
                  >
                    {#if detailState.isUpdatingStatus}
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
              onclick={() => (detailState.showResponseForm = true)}
            >
              <i class="fas fa-edit"></i>
              Update Response
            </button>
          {/if}
        {/if}

        <!-- Tester confirmation status -->
        {#if item.testerConfirmation}
          {@const confConfig = CONFIRMATION_STATUS_CONFIG[item.testerConfirmation.status as TesterConfirmationStatus]}
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
                {detailState.formatRelativeTime(item.testerConfirmation.respondedAt)}
              </span>
            {/if}
          </div>
        {/if}
      </section>
    {/if}

    <!-- Action Bar - Delete functionality -->
    <FeedbackActionBar {detailState} {readOnly} />
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
    --fb-warning: #f59e0b;

    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--background, #0f0f14);
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

  /* ═══════════════════════════════════════════════════════════════════════════
     INLINE EDIT STYLES
     ═══════════════════════════════════════════════════════════════════════════ */
  .inline-edit-textarea {
    width: 100%;
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text);
    font-size: var(--fb-text-base);
    font-family: inherit;
    resize: none;
    min-height: 120px;
    transition: all 0.2s ease;
  }

  .inline-edit-textarea:focus {
    outline: none;
    border-color: var(--fb-primary);
    background: var(--fb-surface);
  }

  .inline-edit-textarea:readonly {
    opacity: 0.6;
    cursor: default;
  }

  .inline-edit-input {
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

  .inline-edit-input:focus {
    outline: none;
    border-color: var(--fb-primary);
  }

  .inline-edit-input:readonly {
    opacity: 0.6;
    cursor: default;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     TITLE SECTION
     ═══════════════════════════════════════════════════════════════════════════ */
  .title-section {
    gap: var(--fb-space-sm);
  }

  .title-row {
    display: flex;
    gap: var(--fb-space-md);
    align-items: flex-start;
  }

  .title-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-sm);
  }

  .generate-title-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin-top: 22px;
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .generate-title-btn:hover:not(:disabled) {
    background: var(--fb-surface-hover);
    color: var(--fb-text);
  }

  .generate-title-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     PRIORITY GRID
     ═══════════════════════════════════════════════════════════════════════════ */
  .priority-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: var(--fb-space-sm);
  }

  .priority-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border: 2px solid transparent;
    border-radius: var(--fb-radius-md);
    color: var(--fb-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: var(--fb-text-xs);
    font-weight: 500;
    text-align: center;
  }

  .priority-btn:hover {
    background: var(--fb-surface-hover);
    border-color: var(--priority-color);
    color: var(--priority-color);
  }

  .priority-btn.active {
    background: color-mix(in srgb, var(--priority-color) 15%, transparent);
    border-color: var(--priority-color);
    color: var(--priority-color);
    font-weight: 600;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     SCREENSHOTS
     ═══════════════════════════════════════════════════════════════════════════ */
  .screenshots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--fb-space-sm);
  }

  .screenshot-link {
    position: relative;
    display: block;
    aspect-ratio: 1;
    border-radius: var(--fb-radius-md);
    overflow: hidden;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .screenshot-link:hover {
    transform: scale(1.05);
  }

  .screenshot-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .screenshot-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5em;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .screenshot-link:hover .screenshot-overlay {
    opacity: 1;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     ADMIN RESPONSE SECTION
     ═══════════════════════════════════════════════════════════════════════════ */
  .response-section {
    padding-top: var(--fb-space-md);
    border-top: 1px solid var(--fb-border);
  }

  .existing-response {
    padding: var(--fb-space-md);
    background: color-mix(in srgb, #10b981 5%, transparent);
    border: 1px solid color-mix(in srgb, #10b981 30%, transparent);
    border-radius: var(--fb-radius-md);
  }

  .response-message {
    margin: 0 0 var(--fb-space-xs) 0;
    color: var(--fb-text);
    font-size: var(--fb-text-sm);
    line-height: 1.5;
  }

  .response-meta {
    font-size: var(--fb-text-xs);
    color: var(--fb-text-muted);
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
    resize: none;
    transition: all 0.2s ease;
  }

  .response-textarea:focus {
    outline: none;
    border-color: var(--fb-primary);
  }

  .response-actions {
    display: flex;
    gap: var(--fb-space-sm);
  }

  .send-response-btn,
  .resolve-notify-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: var(--fb-space-sm) var(--fb-space-md);
    background: var(--fb-primary);
    border: 1px solid var(--fb-primary);
    border-radius: var(--fb-radius-md);
    color: white;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .send-response-btn:hover:not(:disabled),
  .resolve-notify-btn:hover:not(:disabled) {
    background: #059669;
    border-color: #059669;
  }

  .send-response-btn:disabled,
  .resolve-notify-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .update-response-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: var(--fb-space-sm) var(--fb-space-md);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text);
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .update-response-btn:hover {
    background: var(--fb-surface-hover);
  }

  .tester-confirmation {
    padding: var(--fb-space-md);
    background: color-mix(in srgb, var(--conf-color) 5%, transparent);
    border: 1px solid color-mix(in srgb, var(--conf-color) 30%, transparent);
    border-radius: var(--fb-radius-md);
  }

  .confirmation-header {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    margin-bottom: var(--fb-space-xs);
    font-weight: 600;
    color: var(--conf-color);
  }

  .confirmation-label {
    font-size: var(--fb-text-sm);
  }

  .confirmation-comment {
    margin: var(--fb-space-xs) 0;
    color: var(--fb-text);
    font-size: var(--fb-text-sm);
    font-style: italic;
  }

  .confirmation-date {
    font-size: var(--fb-text-xs);
    color: var(--fb-text-muted);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     REDUCED MOTION
     ═══════════════════════════════════════════════════════════════════════════ */
  @media (prefers-reduced-motion: reduce) {
    .section-title,
    .inline-edit-textarea,
    .inline-edit-input,
    .priority-btn,
    .status-btn,
    .screenshot-link,
    .send-response-btn,
    .update-response-btn {
      transition: none;
    }
  }
</style>
