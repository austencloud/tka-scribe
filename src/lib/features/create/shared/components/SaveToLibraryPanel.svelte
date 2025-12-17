<!--
  SaveToLibraryPanel.svelte

  Side panel (desktop) / bottom sheet (mobile) for saving sequences to library.
  Uses CreatePanelDrawer for responsive layout matching other Create panels.
-->
<script lang="ts" module>
  export interface SaveMetadata {
    name: string;
    visibility: "public" | "private" | "unlisted";
    tags: string[];
    collectionIds: string[];
    notes: string;
  }
</script>

<script lang="ts">
  import CreatePanelDrawer from "./CreatePanelDrawer.svelte";
  import SheetDragHandle from "$lib/shared/foundation/ui/SheetDragHandle.svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import { getCreateModuleContext } from "../context/create-module-context";
  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import type { SequenceVisibility } from "$lib/features/library/domain/models/LibrarySequence";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IShareService } from "$lib/shared/share/services/contracts/IShareService";
  import type { IFirebaseVideoUploadService } from "$lib/shared/share/services/contracts/IFirebaseVideoUploadService";
  import { DEFAULT_SHARE_OPTIONS } from "$lib/shared/share/domain/models/ShareOptions";
  import { getImageCompositionManager } from "$lib/shared/share/state/image-composition-state.svelte";

  interface Props {
    show: boolean;
    onClose?: () => void;
    onSaveComplete?: (sequenceId: string) => void;
  }

  let { show, onClose, onSaveComplete }: Props = $props();

  const logger = createComponentLogger("SaveToLibraryPanel");

  // Context
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState, layout } = ctx;

  // Get current sequence
  const activeSequenceState = $derived(
    CreateModuleState.getActiveTabSequenceState()
  );
  const sequence = $derived(activeSequenceState.currentSequence);

  // Panel height for drawer
  const panelHeight = $derived(
    panelState.navigationBarHeight + panelState.toolPanelHeight
  );

  // Local state
  let isOpen = $state(show);
  let isSaving = $state(false);

  // Form state
  let name = $state("");
  let tagInput = $state("");
  let tags = $state<string[]>([]);
  let notes = $state("");

  // Always public - no private sequences for sharing
  const visibility: SequenceVisibility = "public";

  // Derived state
  const currentUser = $derived(authState.user);
  const displayName = $derived(
    currentUser?.displayName || currentUser?.email || "Anonymous"
  );

  // Sync isOpen with show prop
  $effect(() => {
    isOpen = show;
  });

  // Reset form when sequence changes or panel opens
  $effect(() => {
    if (sequence && show) {
      name = sequence.name || sequence.word || "";
      tags = [];
      tagInput = "";
      notes = "";
    }
  });

  function handleAddTag() {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      tags = [...tags, trimmedTag];
      tagInput = "";
    }
  }

  function handleRemoveTag(tag: string) {
    tags = tags.filter((t) => t !== tag);
  }

  function handleTagKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }
  }

  async function handleSave() {
    if (!name.trim() || !sequence) return;
    if (!ctx.sequencePersistenceService) {
      logger.error("sequencePersistenceService not available");
      return;
    }

    isSaving = true;
    let thumbnailUrl: string | undefined;

    try {
      logger.info("Saving sequence to library...", {
        beatCount: sequence.beats.length,
        sequenceName: name.trim(),
      });

      // Step 1: Generate thumbnail image
      try {
        const shareService = tryResolve<IShareService>(TYPES.IShareService);
        const uploadService = tryResolve<IFirebaseVideoUploadService>(
          TYPES.IFirebaseVideoUploadService
        );

        console.log("[SaveToLibraryPanel] Services resolved:", {
          shareService: !!shareService,
          uploadService: !!uploadService,
        });

        if (shareService && uploadService) {
          console.log("[SaveToLibraryPanel] Generating thumbnail...");

          // Get image composition settings from visibility settings
          const imageCompositionManager = getImageCompositionManager();
          const compositionSettings = imageCompositionManager.getSettings();

          // Use the user's visibility settings for thumbnail generation
          const thumbnailOptions = {
            ...DEFAULT_SHARE_OPTIONS,
            addWord: compositionSettings.addWord,
            addBeatNumbers: compositionSettings.addBeatNumbers,
            addDifficultyLevel: compositionSettings.addDifficultyLevel,
            addUserInfo: compositionSettings.addUserInfo,
            includeStartPosition: compositionSettings.includeStartPosition,
            format: "PNG" as const,
          };

          console.log("[SaveToLibraryPanel] Thumbnail options (from settings):", thumbnailOptions);
          console.log("[SaveToLibraryPanel] Sequence to render:", {
            id: sequence.id,
            beatCount: sequence.beats.length,
            hasStartPosition: !!sequence.startPosition || !!sequence.startingPositionBeat,
          });

          const imageBlob = await shareService.getImageBlob(
            sequence,
            thumbnailOptions
          );

          console.log("[SaveToLibraryPanel] Image blob generated:", {
            size: imageBlob.size,
            type: imageBlob.type,
          });

          // Upload to Firebase Storage
          console.log("[SaveToLibraryPanel] Uploading thumbnail...");
          const uploadResult = await uploadService.uploadSequenceThumbnail(
            sequence.id,
            imageBlob,
            "png"
          );
          thumbnailUrl = uploadResult.url;
          console.log("[SaveToLibraryPanel] ✅ Thumbnail uploaded:", thumbnailUrl);
        } else {
          console.warn("[SaveToLibraryPanel] ⚠️ Share/upload services not available, saving without thumbnail");
        }
      } catch (thumbnailError) {
        // Don't fail the entire save if thumbnail generation fails
        console.error("[SaveToLibraryPanel] ❌ Failed to generate/upload thumbnail:", thumbnailError);
      }

      // Step 2: Save sequence with thumbnail URL in metadata
      const sequenceId = await ctx.sequencePersistenceService.saveSequence(
        sequence,
        {
          name: name.trim(),
          visibility: "public",
          tags,
          notes: notes.trim(),
          thumbnailUrl,
        }
      );

      logger.success("Sequence saved to library with ID:", sequenceId);

      // Mark session as saved if session manager is available
      if (ctx.sessionManager) {
        await ctx.sessionManager.markAsSaved(sequenceId);
        logger.info("Session marked as saved");
      }

      // Refresh library state if available
      try {
        const { libraryState } = await import(
          "$lib/features/library/state/library-state.svelte"
        );
        if (libraryState) {
          await libraryState.loadSequences();
          logger.success("Library refreshed");
        }
      } catch (err) {
        logger.warn("Could not refresh library state:", err);
      }

      onSaveComplete?.(sequenceId);
      handleClose();
    } catch (error) {
      logger.error("Failed to save sequence:", error);
    } finally {
      isSaving = false;
    }
  }

  function handleClose() {
    isOpen = false;
    onClose?.();
  }
</script>

<CreatePanelDrawer
  bind:isOpen
  panelName="save-library"
  combinedPanelHeight={panelHeight}
  showHandle={true}
  closeOnBackdrop={true}
  onClose={handleClose}
  ariaLabel="Save to Library"
>
  <div class="panel-inner">
    <SheetDragHandle />

    <!-- Close button -->
    <button class="close-button" onclick={handleClose} aria-label="Close panel">
      <i class="fas fa-times"></i>
    </button>

    <!-- Header -->
    <div class="panel-header">
      <h2>Save & Share</h2>
      <p class="subtitle">
        Your sequence will be saved publicly to the gallery
      </p>
    </div>

    <!-- Form -->
    <div class="panel-body">
      <!-- Sequence Name -->
      <div class="form-group">
        <label for="sequence-name">
          Sequence Name <span class="required">*</span>
        </label>
        <input
          id="sequence-name"
          type="text"
          bind:value={name}
          placeholder="Enter sequence name"
          class="input-field"
          maxlength="100"
        />
      </div>

      <!-- Creator Info (compact) -->
      <div class="info-chip">
        <i class="fas fa-user"></i>
        <span>By {displayName}</span>
        <span class="separator">|</span>
        <i class="fas fa-globe"></i>
        <span>Public</span>
      </div>

      <!-- Tags -->
      <div class="form-group">
        <label for="tag-input">Tags</label>
        <div class="tag-input-container">
          <input
            id="tag-input"
            type="text"
            bind:value={tagInput}
            onkeydown={handleTagKeydown}
            placeholder="Add tags (press Enter)"
            class="input-field"
            maxlength="50"
          />
          <button
            type="button"
            class="add-tag-button"
            onclick={handleAddTag}
            disabled={!tagInput.trim()}
            aria-label="Add tag"
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>

        {#if tags.length > 0}
          <div class="tags-list">
            {#each tags as tag}
              <div class="tag-chip">
                <span class="tag-text">{tag}</span>
                <button
                  type="button"
                  class="tag-remove"
                  onclick={() => handleRemoveTag(tag)}
                  aria-label="Remove tag {tag}"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Notes -->
      <div class="form-group">
        <label for="notes">Notes (optional)</label>
        <textarea
          id="notes"
          bind:value={notes}
          placeholder="Add personal notes about this sequence"
          class="textarea-field"
          rows="3"
          maxlength="500"
        ></textarea>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="panel-footer">
      <button
        type="button"
        class="button button-secondary"
        onclick={handleClose}
      >
        Cancel
      </button>
      <button
        type="button"
        class="button button-primary"
        onclick={handleSave}
        disabled={!name.trim() || isSaving}
      >
        {#if isSaving}
          <i class="fas fa-spinner fa-spin"></i>
          Saving...
        {:else}
          <i class="fas fa-save"></i>
          Save & Continue
        {/if}
      </button>
    </div>
  </div>
</CreatePanelDrawer>

<style>
  .panel-inner {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding-bottom: env(safe-area-inset-bottom);
    overflow: hidden;
  }

  /* Close Button */
  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    z-index: 10;
  }

  .close-button:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.15));
    transform: scale(1.05);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  /* Header */
  .panel-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    flex-shrink: 0;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  /* Body */
  .panel-body {
    flex: 1;
    padding: 20px 24px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  /* Form Groups */
  .form-group {
    margin-bottom: 20px;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .required {
    color: var(--semantic-error, #ef4444);
  }

  /* Input Fields */
  .input-field,
  .textarea-field {
    width: 100%;
    padding: 12px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .input-field:focus,
  .textarea-field:focus {
    outline: none;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: color-mix(in srgb, var(--theme-accent) 50%, transparent);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--theme-accent) 10%, transparent);
  }

  .input-field::placeholder,
  .textarea-field::placeholder {
    color: color-mix(in srgb, var(--theme-text-dim, rgba(255, 255, 255, 0.6)) 70%, transparent);
  }

  .textarea-field {
    resize: vertical;
    min-height: 80px;
  }

  /* Info Chip */
  .info-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 13px;
    margin-bottom: 20px;
  }

  .info-chip i {
    opacity: 0.6;
  }

  .separator {
    opacity: 0.3;
  }

  /* Tag Input */
  .tag-input-container {
    display: flex;
    gap: 8px;
  }

  .tag-input-container .input-field {
    flex: 1;
  }

  .add-tag-button {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    flex-shrink: 0;
    background: color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 30%, transparent);
    border-radius: 8px;
    color: var(--theme-accent-strong, #8b5cf6);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .add-tag-button:hover:not(:disabled) {
    background: color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 30%, transparent);
    border-color: color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 50%, transparent);
  }

  .add-tag-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Tags List */
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .tag-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background: color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 30%, transparent);
    border-radius: 16px;
    color: var(--theme-accent-strong, #8b5cf6);
    font-size: 12px;
  }

  .tag-text {
    font-weight: 500;
  }

  .tag-remove {
    width: 14px;
    height: 14px;
    padding: 0;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.2s ease;
    font-size: 10px;
  }

  .tag-remove:hover {
    opacity: 1;
  }

  /* Footer */
  .panel-footer {
    display: flex;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    flex-shrink: 0;
  }

  .button {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .button-secondary {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .button-secondary:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .button-primary {
    background: linear-gradient(135deg, var(--theme-accent-strong, #8b5cf6) 0%, var(--theme-accent-strong, #7c3aed) 100%);
    color: white;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 40%, transparent);
  }

  .button-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--theme-accent-strong, #7c3aed) 0%, var(--theme-accent-strong, #6d28d9) 100%);
    box-shadow: 0 6px 16px color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 60%, transparent);
    transform: translateY(-1px);
  }

  .button-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .button-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  /* Mobile Responsiveness */
  @media (max-width: 640px) {
    .panel-header {
      padding: 20px 20px 12px;
    }

    .panel-header h2 {
      font-size: 18px;
    }

    .panel-body {
      padding: 16px 20px;
    }

    .panel-footer {
      padding: 12px 20px;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .button,
    .add-tag-button,
    .input-field,
    .textarea-field {
      transition: none;
    }
  }
</style>
