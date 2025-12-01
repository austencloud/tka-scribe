<!--
  SequenceViewer.svelte - Standalone Sequence Viewer

  Full-page sequence viewer that can be used as a landing page for deep links.
  Shows sequence details with the ability to edit beats inline.

  Features:
  - Sequence thumbnail with variation navigation
  - Beat grid with tap-to-edit
  - Action buttons (Edit, Share, Favorite, Open in Create)
  - Integrated EditSlidePanel for inline editing
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import { tryResolve } from "$lib/shared/inversify";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { createSequenceViewerState } from "$lib/shared/sequence-viewer/state/sequence-viewer-state.svelte";
  import type { ISequenceViewerService } from "$lib/shared/sequence-viewer/services/contracts/ISequenceViewerService";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { ILibraryService } from "$lib/features/library/services/contracts";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte.ts";
  import EditSlidePanel from "$lib/features/create/edit/components/EditSlidePanel.svelte";
  import BeatGrid from "$lib/features/create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";
  import SequenceViewerActions from "./SequenceViewerActions.svelte";
  import VariationNav from "./VariationNav.svelte";

  // Props
  const {
    sequenceId,
    initialSequence = null,
    onAction = () => {},
    onClose,
    onOpenInCreate,
  } = $props<{
    sequenceId?: string;
    initialSequence?: SequenceData | null;
    onAction?: (action: string, sequence: SequenceData) => void;
    onClose?: () => void;
    onOpenInCreate?: (sequence: SequenceData) => void;
  }>();

  // State
  const viewerState = createSequenceViewerState();

  // Services
  let viewerService: ISequenceViewerService | null = null;
  let hapticService: IHapticFeedbackService | null = null;
  let libraryService: ILibraryService | null = null;

  // Library state
  let isSaving = $state(false);
  let saveError = $state<string | null>(null);
  let isSavedToLibrary = $state(false);
  const isAuthenticated = $derived(!!authStore.effectiveUserId);

  // Derived
  const thumbnailUrl = $derived.by(() => {
    if (!viewerState.sequence) return "";
    return (
      viewerService?.getThumbnailUrl(
        viewerState.sequence,
        viewerState.currentVariationIndex
      ) ?? ""
    );
  });

  const viewerTitle = $derived(
    viewerState.sequence?.word || viewerState.sequence?.name || "Sequence"
  );

  const startPosition = $derived.by(() => {
    if (!viewerState.sequence) return null;
    return (
      viewerState.sequence.startPosition ??
      viewerState.sequence.startingPositionBeat ??
      null
    );
  });

  // Layout detection
  let windowWidth = $state(0);
  const isSideBySide = $derived(windowWidth >= 1024);

  function updateWidth() {
    if (browser) {
      windowWidth = window.innerWidth;
      viewerState.setLayoutMode(windowWidth >= 1024);
    }
  }

  // Load sequence
  async function loadSequence() {
    if (initialSequence) {
      viewerState.setSequence(initialSequence);
      return;
    }

    if (!sequenceId || !viewerService) {
      viewerState.setError("No sequence ID provided");
      return;
    }

    viewerState.setLoading(true);
    try {
      const seq = await viewerService.loadSequence(sequenceId);
      if (seq) {
        viewerState.setSequence(seq);
      } else {
        viewerState.setError("Sequence not found");
      }
    } catch (err) {
      viewerState.setError(
        err instanceof Error ? err.message : "Failed to load sequence"
      );
    }
  }

  // Handlers
  function handleBeatClick(beatNumber: number) {
    if (!viewerState.sequence) return;
    hapticService?.trigger("selection");

    // beatNumber 0 = start position, 1+ = beats array
    let beatData: BeatData | null = null;
    if (beatNumber === 0) {
      const startPos =
        viewerState.sequence.startPosition ??
        viewerState.sequence.startingPositionBeat;
      if (startPos) {
        beatData = {
          ...startPos,
          beatNumber: 0,
          duration: 1000,
          blueReversal: false,
          redReversal: false,
          isBlank: false,
        } as BeatData;
      }
    } else {
      beatData = viewerState.sequence.beats[beatNumber - 1] ?? null;
    }

    if (beatData) {
      viewerState.selectBeat(beatNumber, beatData);
      viewerState.openEditPanel();
    }
  }

  function handleStartClick() {
    handleBeatClick(0);
  }

  function handleEditPanelClose() {
    viewerState.closeEditPanel();
    viewerState.clearSelection();
  }

  function handleOrientationChanged(color: string, orientation: string) {
    if (
      !viewerState.sequence ||
      viewerState.selectedBeatIndex === null ||
      !viewerService
    )
      return;

    const updatedSequence = viewerService.updateBeatOrientation(
      viewerState.sequence,
      viewerState.selectedBeatIndex,
      color,
      orientation
    );
    viewerState.setSequence(updatedSequence);

    // Update selected beat data
    const newBeatData = viewerService.getBeatData(
      updatedSequence,
      viewerState.selectedBeatIndex
    );
    if (newBeatData) {
      viewerState.selectBeat(viewerState.selectedBeatIndex, newBeatData);
    }
  }

  function handleTurnAmountChanged(color: string, turnAmount: number) {
    if (
      !viewerState.sequence ||
      viewerState.selectedBeatIndex === null ||
      !viewerService
    )
      return;

    const updatedSequence = viewerService.updateBeatTurns(
      viewerState.sequence,
      viewerState.selectedBeatIndex,
      color,
      turnAmount
    );
    viewerState.setSequence(updatedSequence);

    // Update selected beat data
    const newBeatData = viewerService.getBeatData(
      updatedSequence,
      viewerState.selectedBeatIndex
    );
    if (newBeatData) {
      viewerState.selectBeat(viewerState.selectedBeatIndex, newBeatData);
    }
  }

  function handleRemoveBeat(beatNumber: number) {
    if (!viewerState.sequence || !viewerService) return;

    const updatedSequence = viewerService.removeBeat(
      viewerState.sequence,
      beatNumber - 1
    );
    viewerState.setSequence(updatedSequence);
    handleEditPanelClose();
  }

  async function handleSaveToLibrary() {
    if (!viewerState.sequence || !libraryService || !isAuthenticated) return;

    hapticService?.trigger("selection");
    isSaving = true;
    saveError = null;

    try {
      await libraryService.saveSequence(viewerState.sequence);
      isSavedToLibrary = true;
      hapticService?.trigger("success");
      onAction("saved", viewerState.sequence);
    } catch (err) {
      saveError = err instanceof Error ? err.message : "Failed to save";
      hapticService?.trigger("error");
    } finally {
      isSaving = false;
    }
  }

  async function handleToggleFavorite() {
    if (!viewerState.sequence || !libraryService || !isAuthenticated) return;

    hapticService?.trigger("selection");
    const sequenceId = viewerState.sequence.id;
    if (!sequenceId) {
      // If sequence has no ID, we need to save it first
      await handleSaveToLibrary();
      return;
    }

    try {
      const isFavorite = await libraryService.toggleFavorite(sequenceId);
      viewerState.setSequence({
        ...viewerState.sequence,
        isFavorite,
      });
      hapticService?.trigger("success");
      onAction("favorite", viewerState.sequence);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      hapticService?.trigger("error");
    }
  }

  function handleAction(action: string) {
    if (!viewerState.sequence) return;
    hapticService?.trigger("selection");

    switch (action) {
      case "open-in-create":
        // Use callback if provided, otherwise navigate directly
        if (onOpenInCreate) {
          onOpenInCreate(viewerState.sequence);
        } else {
          // Navigate to Create module with this sequence
          const encoded = viewerService?.encodeForUrl(viewerState.sequence);
          if (encoded) {
            goto(`/?open=construct:${encoded}`);
          }
        }
        break;
      case "share":
        // Share action
        onAction("share", viewerState.sequence);
        break;
      case "save":
        // Save to library
        handleSaveToLibrary();
        break;
      case "favorite":
        // Toggle favorite via library
        handleToggleFavorite();
        break;
      default:
        onAction(action, viewerState.sequence);
    }
  }

  function handleClose() {
    if (onClose) {
      onClose();
    } else if (browser) {
      // Navigate back or to home
      if (history.length > 1) {
        history.back();
      } else {
        goto("/");
      }
    }
  }

  function handleVariationChange(delta: number) {
    hapticService?.trigger("selection");
    if (delta > 0) {
      viewerState.nextVariation();
    } else {
      viewerState.previousVariation();
    }
  }

  // Lifecycle
  onMount(() => {
    viewerService = tryResolve<ISequenceViewerService>(
      TYPES.ISequenceViewerService
    );
    hapticService = tryResolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
    libraryService = tryResolve<ILibraryService>(TYPES.ILibraryService);

    updateWidth();
    window.addEventListener("resize", updateWidth);

    // Load sequence after services are resolved
    loadSequence();

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  });
</script>

<div class="sequence-viewer" class:side-by-side={isSideBySide}>
  <!-- Header -->
  <header class="viewer-header">
    <button class="back-button" onclick={handleClose} aria-label="Go back">
      <i class="fas fa-arrow-left"></i>
    </button>
    <h1 class="viewer-title">{viewerTitle}</h1>
    <div class="header-spacer"></div>
  </header>

  <!-- Main Content -->
  <main class="viewer-content">
    {#if viewerState.isLoading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading sequence...</p>
      </div>
    {:else if viewerState.error}
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{viewerState.error}</p>
        <button onclick={handleClose}>Go Back</button>
      </div>
    {:else if viewerState.sequence}
      <!-- Thumbnail Section -->
      <section class="thumbnail-section">
        {#if thumbnailUrl}
          <img
            src={thumbnailUrl}
            alt={viewerState.sequence.word || "Sequence"}
            class="thumbnail-image"
          />
        {:else}
          <div class="thumbnail-placeholder">
            <i class="fas fa-image"></i>
          </div>
        {/if}

        {#if viewerState.hasMultipleVariations}
          <VariationNav
            currentIndex={viewerState.currentVariationIndex}
            total={viewerState.totalVariations}
            onPrevious={() => handleVariationChange(-1)}
            onNext={() => handleVariationChange(1)}
          />
        {/if}
      </section>

      <!-- Metadata -->
      <section class="metadata-section">
        {#if viewerState.sequence.author}
          <div class="metadata-item">
            <span class="label">Author</span>
            <span class="value">{viewerState.sequence.author}</span>
          </div>
        {/if}
        {#if viewerState.sequence.beats.length > 0}
          <div class="metadata-item">
            <span class="label">Beats</span>
            <span class="value">{viewerState.sequence.beats.length}</span>
          </div>
        {/if}
        {#if viewerState.sequence.level}
          <div class="metadata-item">
            <span class="label">Level</span>
            <span class="value">{viewerState.sequence.level}</span>
          </div>
        {/if}
      </section>

      <!-- Action Buttons -->
      <SequenceViewerActions
        {isAuthenticated}
        {isSaving}
        {isSavedToLibrary}
        isFavorite={viewerState.sequence.isFavorite}
        {saveError}
        onAction={handleAction}
      />
    {/if}
  </main>
</div>

<!-- Edit Panel -->
{#if viewerState.sequence}
  <EditSlidePanel
    isOpen={viewerState.isEditPanelOpen}
    onClose={handleEditPanelClose}
    selectedBeatNumber={viewerState.selectedBeatIndex}
    selectedBeatData={viewerState.selectedBeatData}
    placement="bottom"
    onOrientationChanged={handleOrientationChanged}
    onTurnAmountChanged={handleTurnAmountChanged}
    onRemoveBeat={handleRemoveBeat}
  />
{/if}

<style>
  .sequence-viewer {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: var(--app-bg, #0a0a0f);
    color: white;
    overflow: hidden;
  }

  /* Header */
  .viewer-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: rgba(15, 20, 30, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .back-button {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    border-radius: 50%;
    transition: background 0.2s;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .viewer-title {
    flex: 1;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .header-spacer {
    width: 48px;
  }

  /* Content */
  .viewer-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Loading & Error States */
  .loading-state,
  .error-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: rgba(255, 255, 255, 0.6);
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-state i {
    font-size: 48px;
    color: #ef4444;
  }

  .error-state button {
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    cursor: pointer;
  }

  /* Thumbnail Section */
  .thumbnail-section {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .thumbnail-image {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
  }

  .thumbnail-placeholder {
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    font-size: 48px;
    color: rgba(255, 255, 255, 0.2);
  }

  /* Metadata */
  .metadata-section {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
  }

  .metadata-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .metadata-item .label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .metadata-item .value {
    font-size: 16px;
    font-weight: 600;
  }

  /* Beats Section */



  /* Side-by-side layout (desktop) */
  .sequence-viewer.side-by-side .viewer-content {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    max-width: 1200px;
    margin: 0 auto;
  }

  .sequence-viewer.side-by-side .thumbnail-section {
    flex: 1;
    min-width: 300px;
  }



  .sequence-viewer.side-by-side .metadata-section {
    width: 100%;
  }
</style>
