<!-- FeedbackDetailPanel - Refactored with service-based architecture and Svelte 5 runes -->
<script lang="ts">
  import type { FeedbackItem } from "../../domain/models/feedback-models";
  import type { FeedbackManageState } from "../../state/feedback-manage-state.svelte";
  import { createFeedbackDetailState } from "../../state/feedback-detail-state.svelte";
  import { PRIORITY_CONFIG } from "../../domain/models/feedback-models";
  import FeedbackHeader from "./detail/FeedbackHeader.svelte";
  import FeedbackMetadataCard from "./detail/FeedbackMetadataCard.svelte";
  import FeedbackSubtaskPanel from "./detail/FeedbackSubtaskPanel.svelte";
  import FeedbackStatusSelector from "./detail/FeedbackStatusSelector.svelte";
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
</script>

<div class="detail-panel">
  <FeedbackHeader {detailState} {readOnly} {onClose} />

  <div class="panel-content">
    <!-- Title - Simple inline edit at top, click to edit -->
    <input
      type="text"
      class="title-input"
      bind:value={detailState.editTitle}
      onblur={() => detailState.handleFieldBlur()}
      placeholder="Untitled feedback..."
      readonly={readOnly}
    />

    <!-- Metadata Card - User info -->
    <FeedbackMetadataCard {detailState} />

    <!-- Resolution Summary - Show for completed/archived feedback -->
    {#if (item.status === "completed" || item.status === "archived") && (item.resolutionNotes || item.adminNotes)}
      <section class="section resolution-section">
        <h3 class="section-title">
          <i class="fas fa-check-circle"></i>
          Resolution
        </h3>
        <div class="resolution-card">
          {#if item.resolutionNotes}
            <p class="resolution-text">{item.resolutionNotes}</p>
          {:else if item.adminNotes}
            <p class="resolution-text">{item.adminNotes}</p>
          {/if}
          {#if item.fixedInVersion}
            <span class="version-badge">
              <i class="fas fa-tag"></i>
              v{item.fixedInVersion}
            </span>
          {/if}
        </div>
      </section>
    {/if}

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

    <!-- Status Selector - Click to change -->
    <FeedbackStatusSelector {detailState} {readOnly} />

    <!-- Priority Section - Compact single row -->
    <section class="section">
      <h3 class="section-title">
        <i class="fas fa-exclamation-circle"></i>
        Priority
      </h3>
      <div class="priority-row">
        <button
          type="button"
          class="priority-chip"
          class:active={detailState.editPriority === ""}
          onclick={() => {
            detailState.editPriority = "";
            void detailState.saveChanges();
          }}
        >
          None
        </button>
        {#each Object.entries(PRIORITY_CONFIG) as [priority, config]}
          <button
            type="button"
            class="priority-chip"
            class:active={detailState.editPriority === priority}
            style="--priority-color: {config.color}"
            onclick={() => {
              detailState.editPriority = priority as any;
              void detailState.saveChanges();
            }}
          >
            <i class="fas {config.icon}"></i>
            {config.label}
          </button>
        {/each}
      </div>
    </section>

    <!-- Subtasks Panel -->
    <FeedbackSubtaskPanel subtasks={item.subtasks || []} />

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

    --fb-primary: var(--semantic-success, #10b981);
    --fb-error: var(--semantic-error, #ef4444);
    --fb-purple: var(--theme-accent, #8b5cf6);
    --fb-surface: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    --fb-surface-hover: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    --fb-border: var(--theme-stroke, rgba(255, 255, 255, 0.08));
    --fb-text: var(--theme-text, rgba(255, 255, 255, 0.95));
    --fb-text-muted: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    --fb-text-subtle: color-mix(in srgb, var(--theme-text-dim, rgba(255, 255, 255, 0.6)) 65%, transparent);
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
     TITLE INPUT (Simple inline edit)
     ═══════════════════════════════════════════════════════════════════════════ */
  .title-input {
    width: 100%;
    padding: var(--fb-space-xs) 0;
    background: transparent;
    border: none;
    border-bottom: 1px solid transparent;
    color: var(--fb-text);
    font-size: var(--fb-text-lg);
    font-weight: 700;
    font-family: inherit;
    transition: border-color 0.2s ease;
  }

  .title-input:focus {
    outline: none;
    border-bottom-color: var(--fb-primary);
  }

  .title-input:hover:not(:focus):not(:readonly) {
    border-bottom-color: var(--fb-border);
  }

  .title-input:readonly {
    cursor: default;
  }

  .title-input::placeholder {
    color: var(--fb-text-muted);
    font-weight: 500;
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

  /* ═══════════════════════════════════════════════════════════════════════════
     RESOLUTION SECTION
     ═══════════════════════════════════════════════════════════════════════════ */
  .resolution-section {
    padding: var(--fb-space-md);
    background: color-mix(in srgb, var(--semantic-success, #10b981) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--semantic-success, #10b981) 30%, transparent);
    border-radius: var(--fb-radius-md);
  }

  .resolution-card {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-sm);
  }

  .resolution-text {
    margin: 0;
    color: var(--fb-text);
    font-size: var(--fb-text-sm);
    line-height: 1.5;
  }

  .version-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: color-mix(in srgb, var(--semantic-success, #10b981) 15%, transparent);
    border-radius: 999px;
    color: var(--semantic-success, #10b981);
    font-size: var(--fb-text-xs);
    font-weight: 600;
    width: fit-content;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     PRIORITY ROW (Compact single-line)
     ═══════════════════════════════════════════════════════════════════════════ */
  .priority-row {
    display: flex;
    flex-wrap: nowrap;
    gap: var(--fb-space-xs);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .priority-row::-webkit-scrollbar {
    display: none;
  }

  .priority-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: 999px;
    color: var(--fb-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: var(--fb-text-xs);
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .priority-chip:hover {
    background: var(--fb-surface-hover);
    border-color: var(--priority-color, var(--fb-text-muted));
    color: var(--priority-color, var(--fb-text));
  }

  .priority-chip.active {
    background: color-mix(in srgb, var(--priority-color, #6b7280) 15%, transparent);
    border-color: var(--priority-color, #6b7280);
    color: var(--priority-color, #6b7280);
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
     REDUCED MOTION
     ═══════════════════════════════════════════════════════════════════════════ */
  @media (prefers-reduced-motion: reduce) {
    .section-title,
    .inline-edit-textarea,
    .title-input,
    .priority-chip,
    .screenshot-link {
      transition: none;
    }
  }
</style>
