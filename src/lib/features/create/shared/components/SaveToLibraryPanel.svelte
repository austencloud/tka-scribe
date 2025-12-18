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
    word?: string; // The current display word (derived from sequence letters)
    onClose?: () => void;
    onSaveComplete?: (sequenceId: string) => void;
  }

  let { show, word = "", onClose, onSaveComplete }: Props = $props();

  const logger = createComponentLogger("SaveToLibraryPanel");

  // Context
  const ctx = getCreateModuleContext();
  const { CreateModuleState } = ctx;

  // Get current sequence
  const activeSequenceState = $derived(
    CreateModuleState.getActiveTabSequenceState()
  );
  const sequence = $derived(activeSequenceState.currentSequence);

  // Local state
  let isOpen = $state(show);
  let isSaving = $state(false);
  let saveStep = $state(0); // 0 = not started, 1-4 = steps, 5 = complete
  let renderProgress = $state({ current: 0, total: 0 }); // Granular progress for thumbnail creation

  // Save steps definition
  const saveSteps = [
    { icon: "fa-image", label: "Creating thumbnail" },
    { icon: "fa-cloud-upload-alt", label: "Uploading preview" },
    { icon: "fa-save", label: "Saving to library" },
    { icon: "fa-sync", label: "Syncing data" },
  ];

  // Dynamic label for step 1 showing beat progress
  const step1Label = $derived(
    saveStep === 1 && renderProgress.total > 0
      ? `Rendering beat ${renderProgress.current} of ${renderProgress.total}`
      : "Creating thumbnail"
  );

  // Form state
  let customDisplayName = $state(""); // User's optional custom name for the sequence
  let tagInput = $state("");
  let tags = $state<string[]>([]);
  let notes = $state("");
  let isPublic = $state(true); // Default to public - sequences appear in gallery

  // Expandable sections (hidden by default)
  let showDisplayName = $state(false);
  let showNotes = $state(false);
  let showTags = $state(false);

  // TKA name is derived from the word prop (auto-generated, read-only)
  const tkaName = $derived(word || sequence?.word || "");

  // Visibility derived from toggle
  const visibility = $derived<SequenceVisibility>(isPublic ? "public" : "private");

  // Derived state
  const currentUser = $derived(authState.user);
  const creatorName = $derived(
    currentUser?.displayName || currentUser?.email || "Anonymous"
  );

  // Sync isOpen with show prop
  $effect(() => {
    isOpen = show;
  });

  // Reset form when sequence changes or panel opens
  $effect(() => {
    if (sequence && show) {
      // Custom display name starts empty (optional field)
      // Pre-fill with existing displayName if editing a saved sequence
      customDisplayName = sequence.displayName || "";
      tags = [];
      tagInput = "";
      notes = "";
      // Show sections if they have existing data
      showDisplayName = !!sequence.displayName;
      showNotes = false;
      showTags = false;
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
    if (!tkaName || !sequence) return;
    if (!ctx.sequencePersistenceService) {
      logger.error("sequencePersistenceService not available");
      return;
    }

    isSaving = true;
    saveStep = 1; // Start with thumbnail creation
    renderProgress = { current: 0, total: 0 }; // Reset render progress
    let thumbnailUrl: string | undefined;

    try {
      logger.info("Saving sequence to library...", {
        beatCount: sequence.beats.length,
        tkaName,
        customDisplayName: customDisplayName.trim() || "(none)",
      });

      // Step 1: Generate thumbnail image
      try {
        const shareService = tryResolve<IShareService>(TYPES.IShareService);
        const uploadService = tryResolve<IFirebaseVideoUploadService>(
          TYPES.IFirebaseVideoUploadService
        );

        if (shareService && uploadService) {
          // Get image composition settings from visibility settings
          const imageCompositionManager = getImageCompositionManager();
          const compositionSettings = imageCompositionManager.getSettings();

          const thumbnailOptions = {
            ...DEFAULT_SHARE_OPTIONS,
            addWord: compositionSettings.addWord,
            addBeatNumbers: compositionSettings.addBeatNumbers,
            addDifficultyLevel: compositionSettings.addDifficultyLevel,
            addUserInfo: compositionSettings.addUserInfo,
            includeStartPosition: compositionSettings.includeStartPosition,
            format: "PNG" as const,
          };

          // OPTIMIZATION: Try to reuse cached preview if available
          let imageBlob = await shareService.getCachedBlobIfAvailable(
            sequence,
            thumbnailOptions
          );

          if (imageBlob) {
            logger.info("✨ Using cached thumbnail (skipped composition)");
            // Skip directly to upload - no need to regenerate
          } else {
            // Cache miss - generate thumbnail with progress tracking
            imageBlob = await shareService.getImageBlob(
              sequence,
              thumbnailOptions,
              (progress) => {
                // Update render progress for granular UI feedback
                renderProgress = { current: progress.current, total: progress.total };
              }
            );
          }

          // Step 2: Upload thumbnail
          saveStep = 2;
          const uploadResult = await uploadService.uploadSequenceThumbnail(
            sequence.id,
            imageBlob,
            "png"
          );
          thumbnailUrl = uploadResult.url;
        }
      } catch (thumbnailError) {
        // Don't fail the entire save if thumbnail generation fails
        console.error("[SaveToLibraryPanel] ❌ Failed to generate/upload thumbnail:", thumbnailError);
      }

      // Step 3: Save sequence to Firestore
      saveStep = 3;
      const sequenceId = await ctx.sequencePersistenceService.saveSequence(
        sequence,
        {
          name: tkaName,
          displayName: customDisplayName.trim() || undefined,
          visibility,
          tags,
          notes: notes.trim(),
          thumbnailUrl,
        }
      );

      logger.success("Sequence saved to library with ID:", sequenceId);

      // Mark session as saved if session manager is available
      if (ctx.sessionManager) {
        await ctx.sessionManager.markAsSaved(sequenceId);
      }

      // Step 4: Sync/refresh library
      saveStep = 4;
      try {
        const { libraryState } = await import(
          "$lib/features/library/state/library-state.svelte"
        );
        if (libraryState) {
          await libraryState.loadSequences();
        }
      } catch (err) {
        logger.warn("Could not refresh library state:", err);
      }

      // Step 5: Complete!
      saveStep = 5;

      // Brief pause to show success state
      await new Promise(resolve => setTimeout(resolve, 800));

      onSaveComplete?.(sequenceId);
      handleClose();
    } catch (error) {
      logger.error("Failed to save sequence:", error);
      saveStep = 0; // Reset on error
    } finally {
      isSaving = false;
      saveStep = 0;
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
  fullHeightOnMobile={true}
  showHandle={true}
  closeOnBackdrop={true}
  onClose={handleClose}
  ariaLabel="Save to Library"
>
  <div class="panel-inner">
    <SheetDragHandle />

    <!-- Progress Overlay -->
    {#if isSaving}
      <div class="save-progress-overlay">
        <div class="progress-content">
          <!-- Success State -->
          {#if saveStep === 5}
            <div class="success-animation">
              <div class="success-circle">
                <i class="fas fa-check"></i>
              </div>
              <h3>Saved!</h3>
              <p>Your sequence is now in your library</p>
            </div>
          {:else}
            <!-- Progress Steps -->
            <div class="progress-header">
              <div class="progress-icon-wrapper">
                <div class="progress-icon-ring"></div>
                <i class="fas {saveSteps[saveStep - 1]?.icon || 'fa-spinner'} progress-icon"></i>
              </div>
              <h3>{saveStep === 1 ? step1Label : (saveSteps[saveStep - 1]?.label || 'Preparing...')}</h3>
            </div>

            <!-- Granular beat progress during step 1 -->
            {#if saveStep === 1 && renderProgress.total > 0}
              <div class="beat-progress">
                <div class="beat-progress-bar">
                  <div
                    class="beat-progress-fill"
                    style="width: {(renderProgress.current / renderProgress.total) * 100}%"
                  ></div>
                </div>
                <span class="beat-progress-text">
                  {Math.round((renderProgress.current / renderProgress.total) * 100)}%
                </span>
              </div>
            {/if}

            <div class="progress-steps">
              {#each saveSteps as step, i}
                <div
                  class="step"
                  class:completed={saveStep > i + 1}
                  class:active={saveStep === i + 1}
                  class:pending={saveStep < i + 1}
                >
                  <div class="step-indicator">
                    {#if saveStep > i + 1}
                      <i class="fas fa-check"></i>
                    {:else if saveStep === i + 1}
                      <div class="step-pulse"></div>
                    {:else}
                      <span class="step-number">{i + 1}</span>
                    {/if}
                  </div>
                  <span class="step-label">{i === 0 ? step1Label : step.label}</span>
                </div>
              {/each}
            </div>

            <div class="progress-bar-container">
              <div
                class="progress-bar-fill"
                style="width: {(saveStep / saveSteps.length) * 100}%"
              ></div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Close button -->
    <button class="close-button" onclick={handleClose} aria-label="Close panel" disabled={isSaving}>
      <i class="fas fa-times"></i>
    </button>

    <!-- Header -->
    <div class="panel-header">
      <h2>Save to Library</h2>
      <p class="subtitle">
        Add this sequence to your personal library
      </p>
    </div>

    <!-- Form -->
    <div class="panel-body">
      <!-- TKA Name (read-only) -->
      <div class="form-group">
        <label>TKA Name</label>
        <div class="tka-name-display">
          <span class="tka-badge">{tkaName || "..."}</span>
          <span class="tka-hint">Auto-generated from sequence letters</span>
        </div>
      </div>

      <!-- Creator & Visibility -->
      <div class="meta-row">
        <div class="creator-chip">
          <i class="fas fa-user"></i>
          <span>By {creatorName}</span>
        </div>

        <button
          type="button"
          class="visibility-toggle"
          class:public={isPublic}
          onclick={() => isPublic = !isPublic}
          aria-pressed={isPublic}
        >
          {#if isPublic}
            <i class="fas fa-globe"></i>
            <span>Public</span>
          {:else}
            <i class="fas fa-lock"></i>
            <span>Private</span>
          {/if}
        </button>
      </div>

      {#if isPublic}
        <p class="visibility-hint">
          <i class="fas fa-info-circle"></i>
          Will appear in the public gallery for others to discover
        </p>
      {:else}
        <p class="visibility-hint">
          <i class="fas fa-info-circle"></i>
          Only you can see this sequence. You can make it public later from your library.
        </p>
      {/if}

      <!-- Optional Fields - Expandable Chips -->
      <div class="optional-section">
        {#if !showDisplayName}
          <button
            type="button"
            class="expand-chip"
            onclick={() => showDisplayName = true}
          >
            <i class="fas fa-plus"></i>
            Add Display Name
          </button>
        {:else}
          <div class="expandable-field">
            <div class="field-header">
              <label for="display-name">Display Name</label>
              <button
                type="button"
                class="collapse-btn"
                onclick={() => { showDisplayName = false; customDisplayName = ""; }}
                aria-label="Remove display name"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <input
              id="display-name"
              type="text"
              bind:value={customDisplayName}
              placeholder="e.g., Fire Spin Intro"
              class="input-field"
              maxlength="100"
            />
          </div>
        {/if}

        {#if !showTags}
          <button
            type="button"
            class="expand-chip"
            onclick={() => showTags = true}
          >
            <i class="fas fa-plus"></i>
            Add Tags
          </button>
        {:else}
          <div class="expandable-field">
            <div class="field-header">
              <label for="tag-input">Tags</label>
              <button
                type="button"
                class="collapse-btn"
                onclick={() => { showTags = false; tags = []; tagInput = ""; }}
                aria-label="Remove tags"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
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
        {/if}

        {#if !showNotes}
          <button
            type="button"
            class="expand-chip"
            onclick={() => showNotes = true}
          >
            <i class="fas fa-plus"></i>
            Add Notes
          </button>
        {:else}
          <div class="expandable-field">
            <div class="field-header">
              <label for="notes">Notes</label>
              <button
                type="button"
                class="collapse-btn"
                onclick={() => { showNotes = false; notes = ""; }}
                aria-label="Remove notes"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <textarea
              id="notes"
              bind:value={notes}
              placeholder="Add personal notes about this sequence"
              class="textarea-field"
              rows="3"
              maxlength="500"
            ></textarea>
          </div>
        {/if}
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
        disabled={!tkaName || isSaving}
      >
        {#if isSaving}
          <i class="fas fa-spinner fa-spin"></i>
          Saving...
        {:else}
          <i class="fas fa-save"></i>
          Save to Library
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

  .close-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Progress Overlay */
  .save-progress-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .progress-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 32px;
    max-width: 300px;
    text-align: center;
  }

  /* Progress Header with Icon */
  .progress-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .progress-icon-wrapper {
    position: relative;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .progress-icon-ring {
    position: absolute;
    inset: 0;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--theme-accent-strong, #8b5cf6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .progress-icon {
    font-size: 24px;
    color: var(--theme-accent-strong, #8b5cf6);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
  }

  .progress-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  /* Progress Steps */
  .progress-steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .step.completed {
    background: rgba(34, 197, 94, 0.1);
  }

  .step.active {
    background: rgba(139, 92, 246, 0.15);
  }

  .step.pending {
    opacity: 0.4;
  }

  .step-indicator {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .step.completed .step-indicator {
    background: var(--semantic-success, #22c55e);
    color: white;
  }

  .step.active .step-indicator {
    background: var(--theme-accent-strong, #8b5cf6);
    color: white;
  }

  .step.pending .step-indicator {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
  }

  .step-pulse {
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    animation: stepPulse 1s ease-in-out infinite;
  }

  @keyframes stepPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
  }

  .step-number {
    font-size: 11px;
  }

  .step-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    transition: color 0.3s ease;
  }

  .step.completed .step-label {
    color: var(--semantic-success, #22c55e);
  }

  .step.active .step-label {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 500;
  }

  /* Beat Progress (granular progress during thumbnail creation) */
  .beat-progress {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .beat-progress-bar {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .beat-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--theme-accent-strong, #8b5cf6) 0%, #a78bfa 100%);
    border-radius: 4px;
    transition: width 0.15s ease-out;
    box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
  }

  .beat-progress-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-accent-strong, #8b5cf6);
    min-width: 40px;
    text-align: right;
  }

  /* Progress Bar */
  .progress-bar-container {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--theme-accent-strong, #8b5cf6), var(--semantic-success, #22c55e));
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  /* Success Animation */
  .success-animation {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    animation: successBounce 0.5s ease;
  }

  @keyframes successBounce {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }

  .success-circle {
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, var(--semantic-success, #22c55e), #16a34a);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(34, 197, 94, 0.4);
  }

  .success-circle i {
    font-size: 32px;
    color: white;
    animation: checkPop 0.3s ease 0.2s both;
  }

  @keyframes checkPop {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  .success-animation h3 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--semantic-success, #22c55e);
  }

  .success-animation p {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
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

  .optional {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-weight: 400;
  }

  /* TKA Name Display (read-only) */
  .tka-name-display {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .tka-badge {
    font-size: 18px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.3px;
  }

  .tka-hint {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .field-hint {
    margin: 6px 0 0;
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  /* Optional Section - Expandable Chips */
  .optional-section {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .expand-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: transparent;
    border: 1px dashed rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .expand-chip:hover {
    border-color: rgba(255, 255, 255, 0.4);
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.05);
  }

  .expand-chip i {
    font-size: 10px;
  }

  .expandable-field {
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    margin-top: 4px;
  }

  .field-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .field-header label {
    margin-bottom: 0;
  }

  .collapse-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .collapse-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
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

  /* Meta Row - Creator & Visibility */
  .meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .creator-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 13px;
  }

  .creator-chip i {
    opacity: 0.6;
  }

  .visibility-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .visibility-toggle:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .visibility-toggle.public {
    background: color-mix(in srgb, var(--semantic-success, #22c55e) 15%, transparent);
    border-color: color-mix(in srgb, var(--semantic-success, #22c55e) 40%, transparent);
    color: var(--semantic-success, #22c55e);
  }

  .visibility-toggle.public:hover {
    background: color-mix(in srgb, var(--semantic-success, #22c55e) 25%, transparent);
  }

  .visibility-hint {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 0 0 16px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    line-height: 1.4;
  }

  .visibility-hint i {
    flex-shrink: 0;
    margin-top: 1px;
    opacity: 0.6;
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
