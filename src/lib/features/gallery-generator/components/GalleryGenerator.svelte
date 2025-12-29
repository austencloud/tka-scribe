<!--
  Gallery Generator

  Main orchestrator component that coordinates all gallery generation functionality.
  Composes smaller components and manages the render/write workflow.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { getContainerInstance, loadFeatureModule } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IDiscoverLoader } from "$lib/features/discover/gallery/display/services/contracts/IDiscoverLoader";
  import type { ISequenceRenderer } from "$lib/shared/render/services/contracts/ISequenceRenderer";

  import { galleryGeneratorState } from "../state/gallery-generator-state.svelte";
  import { GalleryRenderer } from "../services/implementations/GalleryRenderer";
  import { GalleryWriter } from "../services/implementations/GalleryWriter";

  import GallerySettings from "./GallerySettings.svelte";
  import GalleryActions from "./GalleryActions.svelte";
  import GalleryStats from "./GalleryStats.svelte";
  import GalleryError from "./GalleryError.svelte";
  import PendingSequencesList from "./PendingSequencesList.svelte";
  import RenderedPreviewsGrid from "./RenderedPreviewsGrid.svelte";
  import FailedSequencesList from "./FailedSequencesList.svelte";

  const state = galleryGeneratorState;
  const BATCH_SIZE = 4;

  // Services (initialized on mount)
  let galleryRenderer: GalleryRenderer | null = null;
  let galleryWriter: GalleryWriter | null = null;

  onMount(async () => {
    try {
      await Promise.all([
        loadFeatureModule("discover"),
        loadFeatureModule("share"),
      ]);

      const container = await getContainerInstance();
      const loaderService = container.get<IDiscoverLoader>(TYPES.IDiscoverLoader);
      const renderService = container.get<ISequenceRenderer>(TYPES.ISequenceRenderer);

      galleryRenderer = new GalleryRenderer(renderService, loaderService);
      galleryWriter = new GalleryWriter();

      const sequences = await loaderService.loadSequenceMetadata();
      state.setSequences(sequences);
    } catch (err) {
      state.setError(err instanceof Error ? err.message : "Failed to load");
      console.error("Gallery Generator init failed:", err);
    } finally {
      state.setLoading(false);
    }
  });

  /**
   * Render a single sequence
   */
  async function handleRenderSingle(sequence: SequenceData) {
    if (!galleryRenderer) return;

    state.setRendering(true);
    state.setError(null);
    const name = sequence.word || sequence.name;

    try {
      const blob = await galleryRenderer.renderSequence(sequence, state.lightMode);
      const imageUrl = URL.createObjectURL(blob);
      state.addRenderedImage({ name, imageUrl, written: false }, blob);
    } catch (err) {
      state.setError(err instanceof Error ? err.message : "Render failed");
      console.error("Render failed:", err);
    } finally {
      state.setRendering(false);
    }
  }

  /**
   * Render all pending sequences in batches
   */
  async function handleRenderAll() {
    if (!galleryRenderer || state.pendingSequences.length === 0) {
      state.setError("All sequences already rendered. Clear to re-run.");
      return;
    }

    state.setRendering(true);
    state.setCancelled(false);
    state.setError(null);

    const toProcess = [...state.pendingSequences];

    try {
      while (toProcess.length > 0 && !state.isCancelled) {
        const batch = toProcess.splice(0, BATCH_SIZE);
        const results = await galleryRenderer.renderBatch(batch, state.lightMode);

        for (const result of results) {
          if (result.success) {
            state.addRenderedImage(
              { name: result.name, imageUrl: result.imageUrl, written: false },
              result.blob
            );
          } else {
            state.addFailedSequence({ name: result.name, error: result.error });
          }
        }

        // Brief yield for UI updates
        await new Promise(r => setTimeout(r, 0));
      }
    } catch (err) {
      state.setError(err instanceof Error ? err.message : "Batch render failed");
    } finally {
      state.setRendering(false);
    }
  }

  /**
   * Write all previewed images to gallery
   */
  async function handleWriteAll() {
    if (!galleryWriter) return;

    const toWrite = state.renderedImages.filter(r => !r.written);
    if (toWrite.length === 0) return;

    state.setRendering(true);
    state.setError(null);

    for (const img of toWrite) {
      const blob = state.getBlob(img.name);
      if (!blob) {
        console.warn(`No blob found for ${img.name}`);
        continue;
      }

      try {
        await galleryWriter.writeToGallery(img.name, blob);
        state.markAsWritten(img.name);
      } catch (err) {
        console.error(`Failed to write ${img.name}:`, err);
        state.addFailedSequence({
          name: img.name,
          error: err instanceof Error ? err.message : "Write failed"
        });
      }
    }

    state.setRendering(false);
  }

  /**
   * Cancel current render operation
   */
  function handleCancel() {
    state.setCancelled(true);
  }

  /**
   * Clear all results
   */
  function handleClear() {
    state.clearResults();
  }
</script>

<div class="generator-page">
  <header class="page-header">
    <h1>Gallery Generator</h1>
    <p class="subtitle">Render gallery images to static/gallery/ (dev mode only)</p>
  </header>

  <GallerySettings />

  <GalleryActions
    onRenderAll={handleRenderAll}
    onWriteAll={handleWriteAll}
    onClear={handleClear}
    onCancel={handleCancel}
  />

  <GalleryStats />
  <GalleryError />

  <div class="two-column-layout">
    <PendingSequencesList onRenderSingle={handleRenderSingle} />
    <RenderedPreviewsGrid />
  </div>

  <FailedSequencesList />
</div>

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

  .two-column-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 1rem;
  }

  @media (max-width: 900px) {
    .two-column-layout {
      grid-template-columns: 1fr;
    }
  }
</style>
