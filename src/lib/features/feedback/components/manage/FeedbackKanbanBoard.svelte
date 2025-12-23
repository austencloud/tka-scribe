<!-- FeedbackKanbanBoard - Kanban board layout for feedback management -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { FeedbackManageState } from "../../state/feedback-manage-state.svelte";
  import type { KanbanBoardState } from "../../state/kanban-board-state.svelte";
  import { createKanbanBoardState } from "../../state/kanban-board-state.svelte";
  import type { IStorageService } from "$lib/shared/foundation/services/contracts/IStorageService";
  import type { IFeedbackSortingService } from "../../services/contracts/IFeedbackSortingService";
  import {
    tryResolve,
    TYPES,
    loadFeatureModule,
    ensureContainerInitialized,
  } from "$lib/shared/inversify/di";
  import KanbanMobileView from "./KanbanMobileView.svelte";
  import KanbanDesktopView from "./KanbanDesktopView.svelte";

  interface Props {
    manageState: FeedbackManageState;
    onOpenArchive?: () => void;
  }

  const { manageState, onOpenArchive }: Props = $props();

  // Resolve services
  let boardState = $state<KanbanBoardState | null>(null);
  let sortingService: IFeedbackSortingService | null = null;
  let storageService: IStorageService | null = null;

  onMount(() => {
    let resizeObserver: ResizeObserver | null = null;

    async function initializeBoard() {
      try {
        // Ensure container is initialized before loading modules
        await ensureContainerInitialized();

        // Ensure feedback module is loaded (waits for Tier 2)
        await loadFeatureModule("feedback");

        // Now resolve services - feedback module is ready
        sortingService = tryResolve<IFeedbackSortingService>(
          TYPES.IFeedbackSortingService
        );
        storageService = tryResolve<IStorageService>(TYPES.IStorageService);

        if (!sortingService) {
          console.error(
            `[FeedbackKanbanBoard] Failed to resolve IFeedbackSortingService after feedback module load`
          );
          return;
        }

        boardState = createKanbanBoardState(
          manageState,
          sortingService,
          storageService
        );

        // Set up ResizeObserver to detect mobile view (< 652px container width)
        const boardElement = document.querySelector(".kanban-board");
        if (!boardElement) return;

        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const width = entry.contentRect.width;
            boardState?.setIsMobileView(width < 652);
          }
        });

        resizeObserver.observe(boardElement);
      } catch (err) {
        console.error(`[FeedbackKanbanBoard] Error initializing board:`, err);
      }
    }

    initializeBoard();

    return () => {
      resizeObserver?.disconnect();
    };
  });

  async function handleDeferSubmit() {
    if (!boardState || !boardState.itemToDefer || !boardState.deferDate) return;

    boardState.setIsSubmittingDefer(true);

    try {
      await manageState.deferFeedback(
        boardState.itemToDefer.id,
        boardState.deferDate,
        boardState.deferNotes
      );
      boardState.resetDeferDialog();
    } catch (err) {
      console.error("Failed to defer feedback:", err);
    } finally {
      boardState.setIsSubmittingDefer(false);
    }
  }

  function handleDeferCancel() {
    boardState?.resetDeferDialog();
  }
</script>

<div
  class="kanban-board"
  style="--active-color: {boardState?.activeStatusColor}"
>
  {#if boardState}
    {#if boardState.isMobileView}
      <KanbanMobileView {boardState} {manageState} {onOpenArchive} />
    {:else}
      <KanbanDesktopView {boardState} {manageState} {onOpenArchive} />
    {/if}

    {#if manageState.isLoading && manageState.items.length === 0}
      <div class="loading-overlay">
        <div class="loading-skeletons">
          {#each Array(3) as _}
            <div class="skeleton-card">
              <div class="skeleton-header">
                <div class="skeleton-icon"></div>
                <div class="skeleton-title"></div>
              </div>
              <div class="skeleton-body"></div>
              <div class="skeleton-footer">
                <div class="skeleton-meta"></div>
                <div class="skeleton-badge"></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Defer Dialog -->
    {#if boardState.showDeferDialog && boardState.itemToDefer}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="defer-dialog-overlay"
        onclick={handleDeferCancel}
        onkeydown={(e) => e.key === "Escape" && handleDeferCancel()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="defer-dialog-title"
        tabindex="-1"
      >
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="defer-dialog"
          onclick={(e) => e.stopPropagation()}
          onkeydown={(e) => e.stopPropagation()}
        >
          <div class="dialog-header">
            <div class="dialog-icon">
              <i class="fas fa-clock"></i>
            </div>
            <h3 class="dialog-title" id="defer-dialog-title">Defer Feedback</h3>
            <button
              type="button"
              class="close-button"
              onclick={handleDeferCancel}
              aria-label="Close dialog"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="dialog-body">
            <div class="feedback-preview">
              <span class="preview-label">Item:</span>
              <span class="preview-title"
                >{boardState.itemToDefer.title ||
                  boardState.itemToDefer.description.substring(0, 60)}</span
              >
            </div>

            <div class="form-field">
              <label for="defer-date" class="field-label">
                <i class="fas fa-calendar"></i>
                Reactivate on
              </label>
              <input
                id="defer-date"
                type="date"
                class="date-input"
                value={boardState.deferDate}
                onchange={(e) =>
                  boardState?.setDeferDate(e.currentTarget.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div class="form-field">
              <label for="defer-notes" class="field-label">
                <i class="fas fa-sticky-note"></i>
                Reason (optional)
              </label>
              <textarea
                id="defer-notes"
                class="notes-input"
                value={boardState.deferNotes}
                onchange={(e) =>
                  boardState?.setDeferNotes(e.currentTarget.value)}
                placeholder="Why are you deferring this? (e.g., 'Wait for Svelte 6', 'Revisit after Q1')"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="dialog-footer">
            <button
              type="button"
              class="cancel-button"
              onclick={handleDeferCancel}
              disabled={boardState.isSubmittingDefer}
            >
              Cancel
            </button>
            <button
              type="button"
              class="submit-button"
              onclick={handleDeferSubmit}
              disabled={!boardState.deferDate || boardState.isSubmittingDefer}
            >
              {#if boardState.isSubmittingDefer}
                <i class="fas fa-spinner fa-spin"></i>
                Deferring...
              {:else}
                <i class="fas fa-clock"></i>
                Defer
              {/if}
            </button>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .kanban-board {
    /* ===== FLUID SPACING - All clamp() based ===== */
    --kb-space-2xs: clamp(4px, 1cqi, 8px);
    --kb-space-xs: clamp(6px, 1.5cqi, 12px);
    --kb-space-sm: clamp(10px, 2.5cqi, 16px);
    --kb-space-md: clamp(14px, 3.5cqi, 24px);
    --kb-space-lg: clamp(20px, 5cqi, 32px);
    --kb-space-xl: clamp(28px, 7cqi, 48px);

    /* ===== FLUID TYPOGRAPHY - Accessible minimum sizes ===== */
    --kb-text-xs: clamp(0.8125rem, 2cqi, 0.875rem); /* min 13px */
    --kb-text-sm: clamp(0.875rem, 2.5cqi, 1rem); /* min 14px */
    --kb-text-base: clamp(1rem, 3cqi, 1.125rem); /* min 16px */
    --kb-text-lg: clamp(1.125rem, 3.5cqi, 1.25rem); /* min 18px */

    /* ===== FLUID RADII ===== */
    --kb-radius-sm: clamp(6px, 1.5cqi, 10px);
    --kb-radius-md: clamp(10px, 2.5cqi, 16px);
    --kb-radius-lg: clamp(14px, 3.5cqi, 20px);
    --kb-radius-full: 999px;

    /* ===== COLORS ===== */
    --kb-text: var(--theme-text, rgba(255, 255, 255, 0.95));
    --kb-text-muted: color-mix(
      in srgb,
      var(--theme-text, rgba(255, 255, 255, 0.95)) 75%,
      transparent
    );
    --kb-text-subtle: var(--theme-text-dim, rgba(255, 255, 255, 0.5));

    /* ===== TRANSITIONS ===== */
    --spring-smooth: cubic-bezier(0.4, 0, 0.2, 1);
    --spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    container-type: inline-size;
    container-name: kanban;
    background: transparent;
    backdrop-filter: none;
    box-shadow: none;
    transition: background 0.5s ease;
  }

  /* ===== LOADING SKELETON ===== */
  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--kb-space-xl);
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
  }

  .loading-skeletons {
    display: flex;
    flex-direction: column;
    gap: var(--kb-space-md);
    width: 100%;
    max-width: clamp(280px, 70cqi, 400px);
  }

  .skeleton-card {
    display: flex;
    flex-direction: column;
    gap: var(--kb-space-sm);
    padding: var(--kb-space-md);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: var(--kb-radius-lg);
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  .skeleton-header {
    display: flex;
    align-items: center;
    gap: var(--kb-space-sm);
  }

  .skeleton-icon {
    width: clamp(28px, 7cqi, 36px);
    height: clamp(28px, 7cqi, 36px);
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    border-radius: var(--kb-radius-sm);
  }

  .skeleton-title {
    flex: 1;
    height: clamp(16px, 4cqi, 20px);
    background: var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: var(--kb-radius-sm);
  }

  .skeleton-body {
    height: clamp(36px, 9cqi, 48px);
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-radius: var(--kb-radius-sm);
  }

  .skeleton-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: var(--kb-space-sm);
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
  }

  .skeleton-meta {
    width: clamp(80px, 20cqi, 120px);
    height: clamp(12px, 3cqi, 16px);
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-radius: var(--kb-radius-sm);
  }

  .skeleton-badge {
    width: clamp(24px, 6cqi, 32px);
    height: clamp(24px, 6cqi, 32px);
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    border-radius: var(--kb-radius-sm);
  }

  @keyframes skeleton-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* ===== DEFER DIALOG ===== */
  .defer-dialog-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  .defer-dialog {
    display: flex;
    flex-direction: column;
    width: clamp(320px, 90vw, 500px);
    max-height: 90vh;
    background: linear-gradient(
      180deg,
      var(--theme-panel-elevated-bg, rgba(30, 30, 40, 0.98)) 0%,
      var(--theme-panel-bg, rgba(20, 20, 30, 0.98)) 100%
    );
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: clamp(16px, 4cqi, 24px);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 var(--theme-stroke, rgba(255, 255, 255, 0.1));
    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: clamp(12px, 3cqi, 16px);
    padding: clamp(16px, 4cqi, 24px);
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: linear-gradient(
      90deg,
      color-mix(in srgb, #f59e0b 10%, transparent) 0%,
      transparent 100%
    );
  }

  .dialog-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(36px, 9cqi, 44px);
    height: clamp(36px, 9cqi, 44px);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, #f59e0b 40%, transparent) 0%,
      color-mix(in srgb, #f59e0b 20%, transparent) 100%
    );
    border-radius: clamp(8px, 2cqi, 12px);
    color: #f59e0b;
    font-size: clamp(16px, 4cqi, 20px);
    box-shadow: 0 4px 12px color-mix(in srgb, #f59e0b 30%, transparent);
  }

  .dialog-title {
    flex: 1;
    margin: 0;
    font-size: clamp(1.125rem, 3.5cqi, 1.375rem);
    font-weight: 700;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(32px, 8cqi, 40px);
    height: clamp(32px, 8cqi, 40px);
    background: transparent;
    border: none;
    border-radius: clamp(6px, 1.5cqi, 8px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: clamp(16px, 4cqi, 18px);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .dialog-body {
    display: flex;
    flex-direction: column;
    gap: clamp(16px, 4cqi, 24px);
    padding: clamp(20px, 5cqi, 28px);
    overflow-y: auto;
  }

  .feedback-preview {
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 1.5cqi, 8px);
    padding: clamp(12px, 3cqi, 16px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    border-left: 3px solid #f59e0b;
    border-radius: clamp(8px, 2cqi, 12px);
  }

  .preview-label {
    font-size: clamp(0.75rem, 2cqi, 0.875rem);
    font-weight: 600;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .preview-title {
    font-size: clamp(0.875rem, 2.5cqi, 1rem);
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    line-height: 1.4;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 2cqi, 12px);
  }

  .field-label {
    display: flex;
    align-items: center;
    gap: clamp(8px, 2cqi, 10px);
    font-size: clamp(0.875rem, 2.5cqi, 1rem);
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
  }

  .field-label i {
    font-size: clamp(14px, 3.5cqi, 16px);
    color: #f59e0b;
    opacity: 0.8;
  }

  .date-input,
  .notes-input {
    width: 100%;
    padding: clamp(10px, 2.5cqi, 14px) clamp(12px, 3cqi, 16px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: clamp(8px, 2cqi, 12px);
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    font-size: clamp(0.875rem, 2.5cqi, 1rem);
    font-family: inherit;
    transition: all 0.2s ease;
  }

  .date-input:focus,
  .notes-input:focus {
    outline: none;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px color-mix(in srgb, #f59e0b 15%, transparent);
  }

  .notes-input {
    resize: vertical;
    min-height: 80px;
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: clamp(10px, 2.5cqi, 14px);
    padding: clamp(16px, 4cqi, 20px) clamp(20px, 5cqi, 28px);
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: rgba(0, 0, 0, 0.2);
  }

  .cancel-button,
  .submit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 1.5cqi, 8px);
    padding: clamp(10px, 2.5cqi, 12px) clamp(16px, 4cqi, 24px);
    border: none;
    border-radius: clamp(8px, 2cqi, 12px);
    font-size: clamp(0.875rem, 2.5cqi, 1rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-button {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  .cancel-button:hover:not(:disabled) {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .submit-button {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: rgba(0, 0, 0, 0.9);
    box-shadow: 0 4px 12px color-mix(in srgb, #f59e0b 30%, transparent);
  }

  .submit-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    box-shadow: 0 6px 16px color-mix(in srgb, #f59e0b 40%, transparent);
    transform: translateY(-1px);
  }

  .submit-button:disabled,
  .cancel-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
