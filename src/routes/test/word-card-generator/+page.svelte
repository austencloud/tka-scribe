<!--
  Gallery Generator Test Page

  Browser-based tool to regenerate gallery images with standardized visibility settings.
  Generates images with:
  - Word header with difficulty badge
  - Beat numbers
  - Start position
  - TKA glyph (always)
  - Turn numbers (always)
  - Reversal indicators
  - Non-radial points (conditional: level 3+ or clock/counter orientations)

  Output: Writes directly to static/gallery/{word}/{word}_ver1.webp (dev mode only)
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { getContainerInstance, loadFeatureModule } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import type { IDiscoverLoader } from "$lib/features/discover/gallery/display/services/contracts/IDiscoverLoader";
  import type { ISequenceRenderer } from "$lib/shared/render/services/contracts/ISequenceRenderer";
  import type { SequenceExportOptions } from "$lib/shared/render/domain/models/SequenceExportOptions";
  import { Orientation } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";

  // State
  let sequences: SequenceData[] = $state([]);
  let isLoading = $state(true);
  let isRendering = $state(false);
  let isCancelled = $state(false);
  let renderedImages: { name: string; imageUrl: string; written: boolean }[] = $state([]);
  let failedSequences: { name: string; error: string }[] = $state([]);
  let viewingImage = $state<{ name: string; url: string } | null>(null);
  let error = $state<string | null>(null);
  let lightMode = $state(false); // Dark mode by default

  // Services
  let loaderService: IDiscoverLoader | null = null;
  let renderService: ISequenceRenderer | null = null;

  // Store blobs for writing to gallery (in-memory only, lost on refresh)
  let pendingBlobs: Map<string, Blob> = new Map();

  // Derived: which sequences haven't been rendered yet
  let renderedNames = $derived(new Set(renderedImages.map(r => r.name)));
  let pendingSequences = $derived(sequences.filter(s => !renderedNames.has(s.word || s.name)));
  let previewCount = $derived(renderedImages.filter(r => !r.written).length);

  onMount(async () => {
    try {
      await Promise.all([
        loadFeatureModule("discover"),
        loadFeatureModule("share"),
      ]);

      const container = await getContainerInstance();
      loaderService = container.get<IDiscoverLoader>(TYPES.IDiscoverLoader);
      renderService = container.get<ISequenceRenderer>(TYPES.ISequenceRenderer);
      sequences = await loaderService.loadSequenceMetadata();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load";
      console.error("Gallery Generator init failed:", err);
    } finally {
      isLoading = false;
    }
  });

  /**
   * Check if a sequence requires non-radial points
   */
  function requiresNonRadialPoints(sequence: SequenceData): boolean {
    if (sequence.level && sequence.level >= 3) return true;

    const checkOrientations = (motions: { blue?: { startOrientation?: string; endOrientation?: string }; red?: { startOrientation?: string; endOrientation?: string } }) => {
      const { blue, red } = motions;
      return (
        blue?.startOrientation === Orientation.CLOCK || blue?.startOrientation === Orientation.COUNTER ||
        blue?.endOrientation === Orientation.CLOCK || blue?.endOrientation === Orientation.COUNTER ||
        red?.startOrientation === Orientation.CLOCK || red?.startOrientation === Orientation.COUNTER ||
        red?.endOrientation === Orientation.CLOCK || red?.endOrientation === Orientation.COUNTER
      );
    };

    if (sequence.startPosition?.motions && checkOrientations(sequence.startPosition.motions)) {
      return true;
    }

    for (const beat of sequence.beats || []) {
      if (checkOrientations(beat.motions)) return true;
    }

    return false;
  }

  /**
   * Render a single sequence with gallery settings
   */
  async function renderSequence(sequence: SequenceData): Promise<Blob> {
    if (!renderService) throw new Error("Render service not initialized");

    // Load full sequence data if not already loaded
    if (!sequence.beats || sequence.beats.length === 0) {
      const fullSequence = await loaderService?.loadFullSequenceData(sequence.word || sequence.name);
      if (fullSequence) {
        Object.assign(sequence, fullSequence);
      }
    }

    const showNonRadial = requiresNonRadialPoints(sequence);

    const options: Partial<SequenceExportOptions> = {
      beatSize: 240,
      format: "WebP",
      quality: 0.95,
      includeStartPosition: true,
      addBeatNumbers: true,
      addWord: true,
      addDifficultyLevel: true,
      addUserInfo: false,
      addReversalSymbols: true,
      combinedGrids: false,
      beatScale: 1.0,
      margin: 0,
      redVisible: true,
      blueVisible: true,
      scale: 1.0,
      backgroundColor: lightMode ? "#ffffff" : "#1a1a2e",
      visibilityOverrides: {
        showTKA: true,
        showVTG: false,
        showElemental: false,
        showPositions: false,
        showReversals: true,
        showNonRadialPoints: showNonRadial,
        showTurnNumbers: true,
      },
    };

    return await renderService.renderSequenceToBlob(sequence, options);
  }

  /**
   * Write a blob to the gallery via the API endpoint
   */
  async function writeToGallery(word: string, blob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append("image", blob, `${word}_ver1.webp`);
    formData.append("word", word);

    const response = await fetch("/api/gallery-write", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to write to gallery");
    }

    const data = await response.json();
    return data.path;
  }

  /**
   * Render a single selected sequence (for individual render button)
   */
  async function renderSingle(sequence: SequenceData) {
    isRendering = true;
    error = null;
    const name = sequence.word || sequence.name;

    try {
      const blob = await renderSequence(sequence);
      const imageUrl = URL.createObjectURL(blob);
      pendingBlobs.set(name, blob);
      renderedImages = [...renderedImages, { name, imageUrl, written: false }];
    } catch (err) {
      error = err instanceof Error ? err.message : "Render failed";
      console.error("Render failed:", err);
    } finally {
      isRendering = false;
    }
  }

  /**
   * Cancel the current render operation
   */
  function cancelRender() {
    isCancelled = true;
  }

  /**
   * Render all pending sequences in batches of 4
   */
  async function renderAll() {
    if (pendingSequences.length === 0) {
      error = "All sequences already rendered. Clear to re-run.";
      return;
    }

    isRendering = true;
    isCancelled = false;
    error = null;

    const toProcess = [...pendingSequences];
    const batchSize = 4;

    try {
      while (toProcess.length > 0 && !isCancelled) {
        const batch = toProcess.splice(0, batchSize);

        const results = await Promise.all(
          batch.map(async (sequence) => {
            const name = sequence.word || sequence.name;
            try {
              const blob = await renderSequence(sequence);
              const imageUrl = URL.createObjectURL(blob);
              return { name, imageUrl, blob, success: true as const };
            } catch (err) {
              return { name, error: err instanceof Error ? err.message : "Unknown error", success: false as const };
            }
          })
        );

        for (const result of results) {
          if (result.success) {
            pendingBlobs.set(result.name, result.blob);
            renderedImages = [...renderedImages, { name: result.name, imageUrl: result.imageUrl, written: false }];
          } else {
            failedSequences = [...failedSequences, { name: result.name, error: result.error }];
          }
        }

        // Brief yield for UI updates
        await new Promise(r => setTimeout(r, 0));
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Batch render failed";
    } finally {
      isRendering = false;
    }
  }

  /**
   * Write all previewed images to gallery
   */
  async function writeAllToGallery() {
    const toWrite = renderedImages.filter(r => !r.written);
    if (toWrite.length === 0) return;

    isRendering = true;
    error = null;

    for (const img of toWrite) {
      const blob = pendingBlobs.get(img.name);
      if (!blob) {
        console.warn(`No blob found for ${img.name}`);
        continue;
      }

      try {
        await writeToGallery(img.name, blob);
        // Mark as written
        const idx = renderedImages.findIndex(r => r.name === img.name);
        if (idx >= 0) {
          renderedImages[idx] = { ...renderedImages[idx], written: true };
          renderedImages = [...renderedImages]; // Trigger reactivity
        }
      } catch (err) {
        console.error(`Failed to write ${img.name}:`, err);
        failedSequences = [...failedSequences, {
          name: img.name,
          error: err instanceof Error ? err.message : "Write failed"
        }];
      }
    }

    isRendering = false;
  }

  /**
   * Clear all results
   */
  function clearResults() {
    // Revoke blob URLs to free memory
    for (const img of renderedImages) {
      if (img.imageUrl) {
        URL.revokeObjectURL(img.imageUrl);
      }
    }
    pendingBlobs.clear();
    renderedImages = [];
    failedSequences = [];
  }
</script>

<div class="generator-page">
  <header class="page-header">
    <h1>Gallery Generator</h1>
    <p class="subtitle">Render gallery images to static/gallery/ (dev mode only)</p>
  </header>

  <!-- Settings -->
  <div class="settings-panel">
    <div class="setting-row">
      <span class="setting-label">Pictograph Style</span>
      <div class="chip-group">
        <button
          class="chip"
          class:active={!lightMode}
          onclick={() => lightMode = false}
          disabled={isRendering}
        >
          Dark
        </button>
        <button
          class="chip"
          class:active={lightMode}
          onclick={() => lightMode = true}
          disabled={isRendering}
        >
          Light
        </button>
      </div>
    </div>

    <div class="output-info">
      <span>240px/beat</span>
      <span>WebP 95%</span>
      <span>Batch: 4</span>
    </div>
  </div>

  <!-- Actions -->
  <div class="actions">
    {#if isRendering}
      <button class="action-btn cancel" onclick={cancelRender}>
        Cancel
      </button>
    {:else}
      <button
        class="action-btn primary"
        onclick={renderAll}
        disabled={isLoading || pendingSequences.length === 0}
      >
        {#if pendingSequences.length === sequences.length}
          Render All ({pendingSequences.length})
        {:else if pendingSequences.length > 0}
          Resume ({pendingSequences.length} pending)
        {:else}
          All Rendered!
        {/if}
      </button>
    {/if}

    {#if (renderedImages.length > 0 || failedSequences.length > 0) && !isRendering}
      <button class="action-btn secondary" onclick={clearResults}>
        Clear
      </button>
    {/if}

    {#if previewCount > 0 && !isRendering}
      <button class="action-btn success" onclick={writeAllToGallery}>
        Write {previewCount} to Gallery
      </button>
    {/if}
  </div>

  <!-- Summary Stats -->
  <div class="summary-stats">
    <span class="stat pending">{pendingSequences.length} pending</span>
    <span class="stat completed">{renderedImages.length} rendered</span>
    {#if previewCount > 0}
      <span class="stat preview">{previewCount} to write</span>
    {/if}
    {#if failedSequences.length > 0}
      <span class="stat failed">{failedSequences.length} failed</span>
    {/if}
  </div>

  <!-- Error -->
  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <!-- Two-column layout -->
  <div class="two-column-layout">
    <!-- Left Column: Pending Sequences -->
    <div class="column pending-column">
      <h2>Pending ({pendingSequences.length})</h2>

      {#if isLoading}
        <p class="empty-message">Loading sequences...</p>
      {:else if pendingSequences.length === 0}
        <p class="empty-message">All sequences rendered!</p>
      {:else}
        <div class="sequence-list">
          {#each pendingSequences.slice(0, 100) as sequence (sequence.id)}
            <div class="sequence-item">
              <span class="name">{sequence.word || sequence.name}</span>
              <span class="meta">L{sequence.level || 1} · {sequence.sequenceLength}b</span>
              <button
                class="render-btn"
                onclick={() => renderSingle(sequence)}
                disabled={isRendering}
                title="Render this sequence"
              >
                ▶
              </button>
            </div>
          {/each}
          {#if pendingSequences.length > 100}
            <p class="more-text">...and {pendingSequences.length - 100} more</p>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Right Column: Rendered Previews -->
    <div class="column preview-column">
      <h2>Rendered ({renderedImages.length})</h2>

      {#if renderedImages.length === 0}
        <p class="empty-message">Rendered images will appear here</p>
      {:else}
        <div class="preview-grid">
          {#each renderedImages as img (img.name)}
            <button
              class="preview-card"
              class:is-written={img.written}
              onclick={() => img.imageUrl && (viewingImage = { name: img.name, url: img.imageUrl })}
              disabled={!img.imageUrl}
            >
              {#if img.imageUrl}
                <img src={img.imageUrl} alt={img.name} class="preview-image" />
              {:else}
                <div class="preview-placeholder">No preview</div>
              {/if}
              <div class="preview-info">
                <span class="preview-name">{img.name}</span>
                {#if img.written}
                  <span class="preview-status written">✓ Written</span>
                {:else}
                  <span class="preview-status pending">Preview</span>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Failed Sequences -->
  {#if failedSequences.length > 0 && !isRendering}
    <details class="failed-section">
      <summary>Failed ({failedSequences.length})</summary>
      <div class="failed-list">
        {#each failedSequences as failed}
          <div class="failed-item">
            <span class="failed-name">{failed.name}</span>
            <span class="failed-error">{failed.error}</span>
          </div>
        {/each}
      </div>
    </details>
  {/if}
</div>

<!-- Image Lightbox -->
{#if viewingImage}
  <div
    class="lightbox"
    onclick={() => viewingImage = null}
    onkeydown={(e) => e.key === 'Escape' && (viewingImage = null)}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="lightbox-content" onclick={(e) => e.stopPropagation()}>
      <img src={viewingImage.url} alt={viewingImage.name} />
      <div class="lightbox-footer">
        <span class="lightbox-name">{viewingImage.name}</span>
        <button class="lightbox-close" onclick={() => viewingImage = null}>Close</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .generator-page {
    max-width: 1600px;
    margin: 0 auto;
    padding: 1.5rem;
    color: #e4e4e7;
    background: #0c0c10;
    min-height: 100vh;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    margin: 0 0 0.25rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #fff;
  }

  .subtitle {
    color: #71717a;
    margin: 0;
    font-size: 0.875rem;
  }

  /* Settings */
  .settings-panel {
    background: #18181b;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .setting-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .setting-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .chip-group {
    display: flex;
    gap: 0.25rem;
  }

  .chip {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 500;
    background: #27272a;
    border: none;
    border-radius: 6px;
    color: #a1a1aa;
    cursor: pointer;
    transition: all 0.1s ease;
  }

  .chip:hover:not(:disabled) {
    background: #3f3f46;
    color: #e4e4e7;
  }

  .chip.active {
    background: #f43f5e;
    color: white;
  }

  .chip:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .output-info {
    margin-left: auto;
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: #52525b;
  }

  /* Actions */
  .actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .action-btn {
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    border: none;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.1s ease;
  }

  .action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .action-btn.primary {
    background: #f43f5e;
    color: white;
  }

  .action-btn.primary:hover:not(:disabled) {
    background: #e11d48;
  }

  .action-btn.cancel {
    background: #dc2626;
    color: white;
  }

  .action-btn.success {
    background: #22c55e;
    color: white;
  }

  .action-btn.success:hover:not(:disabled) {
    background: #16a34a;
  }

  .action-btn.secondary {
    background: #27272a;
    color: #a1a1aa;
  }

  .action-btn.secondary:hover:not(:disabled) {
    background: #3f3f46;
    color: #e4e4e7;
  }

  /* Stats */
  .summary-stats {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .stat {
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .stat.pending {
    background: #422006;
    color: #fbbf24;
  }

  .stat.completed {
    background: #052e16;
    color: #4ade80;
  }

  .stat.preview {
    background: #172554;
    color: #60a5fa;
  }

  .stat.failed {
    background: #450a0a;
    color: #f87171;
  }

  .error-message {
    background: #1c1012;
    border-left: 3px solid #ef4444;
    color: #fca5a5;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  /* Two-column layout */
  .two-column-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 1rem;
  }

  .column {
    background: #18181b;
    border-radius: 10px;
    padding: 1rem;
  }

  .column h2 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #a1a1aa;
  }

  /* Pending column */
  .pending-column {
    max-height: 75vh;
    overflow-y: auto;
  }

  .sequence-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sequence-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.625rem;
    background: #27272a;
    border-radius: 6px;
    font-size: 0.8rem;
    border-left: 2px solid #f59e0b;
  }

  .sequence-item .name {
    flex: 1;
    font-weight: 500;
    color: #e4e4e7;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sequence-item .meta {
    font-size: 0.7rem;
    color: #52525b;
  }

  .render-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    font-size: 0.65rem;
    background: #3f3f46;
    border: none;
    border-radius: 4px;
    color: #a1a1aa;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .render-btn:hover:not(:disabled) {
    background: #f43f5e;
    color: white;
  }

  .render-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Preview column */
  .preview-column {
    max-height: 75vh;
    overflow-y: auto;
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.5rem;
  }

  .preview-card {
    background: #27272a;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid transparent;
    padding: 0;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: transform 0.1s ease, border-color 0.1s ease;
  }

  .preview-card:hover:not(:disabled) {
    transform: scale(1.02);
  }

  .preview-card:disabled {
    cursor: default;
  }

  .preview-card:not(.is-written) {
    border-color: #f59e0b;
  }

  .preview-card.is-written {
    border-color: #22c55e;
  }

  .preview-image {
    width: 100%;
    height: auto;
    display: block;
    background: #1a1a1e;
  }

  .preview-placeholder {
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #52525b;
    font-size: 0.75rem;
  }

  .preview-info {
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    background: #1f1f23;
  }

  .preview-name {
    font-size: 0.75rem;
    font-weight: 500;
    color: #e4e4e7;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-status {
    font-size: 0.65rem;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    flex-shrink: 0;
    font-weight: 500;
  }

  .preview-status.written {
    background: #052e16;
    color: #4ade80;
  }

  .preview-status.pending {
    background: #422006;
    color: #fbbf24;
  }

  .more-text {
    color: #52525b;
    text-align: center;
    padding: 1rem;
    font-size: 0.8rem;
  }

  .empty-message {
    color: #52525b;
    padding: 3rem 2rem;
    text-align: center;
    font-size: 0.875rem;
  }

  /* Failed section */
  .failed-section {
    background: #1c1012;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .failed-section summary {
    cursor: pointer;
    font-weight: 600;
    color: #f87171;
    font-size: 0.875rem;
  }

  .failed-list {
    margin-top: 0.75rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .failed-item {
    display: flex;
    justify-content: space-between;
    padding: 0.35rem 0;
    font-size: 0.8rem;
    border-bottom: 1px solid #27272a;
  }

  .failed-name {
    color: #a1a1aa;
  }

  .failed-error {
    color: #f87171;
    font-size: 0.75rem;
  }

  /* Lightbox */
  .lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
  }

  .lightbox-content {
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    background: #18181b;
    border-radius: 12px;
    overflow: hidden;
  }

  .lightbox-content img {
    max-width: 100%;
    max-height: calc(90vh - 60px);
    object-fit: contain;
  }

  .lightbox-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #0c0c10;
  }

  .lightbox-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #e4e4e7;
  }

  .lightbox-close {
    padding: 0.5rem 1rem;
    background: #27272a;
    border: none;
    border-radius: 6px;
    color: #a1a1aa;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
  }

  .lightbox-close:hover {
    background: #3f3f46;
    color: #e4e4e7;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .two-column-layout {
      grid-template-columns: 1fr;
    }

    .pending-column,
    .preview-column {
      max-height: 50vh;
    }
  }
</style>
