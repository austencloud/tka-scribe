<!--
  Rendered Previews Grid

  Right column showing rendered image previews.
  Uses the existing SequenceCard component with a status overlay.
-->
<script lang="ts">
  import { galleryGeneratorState } from "../state/gallery-generator-state.svelte";
  import SequenceCard from "$lib/features/discover/gallery/display/components/SequenceCard/SequenceCard.svelte";
  import SpotlightViewer from "$lib/features/discover/gallery/spotlight/components/SpotlightViewer.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  const state = galleryGeneratorState;

  // Create mock sequence objects for the cards
  function createMockSequence(name: string): SequenceData {
    return {
      id: name,
      name: name,
      word: name,
      beats: [],
    } as SequenceData;
  }

  // Create a mock sequence object for the spotlight viewer
  let spotlightSequence = $derived.by((): SequenceData | undefined => {
    if (!state.viewingImage) return undefined;
    return {
      id: state.viewingImage.name,
      name: state.viewingImage.name,
      word: state.viewingImage.name,
      thumbnails: [state.viewingImage.url],
      beats: [],
    } as SequenceData;
  });

  function handleCardClick(img: { name: string; imageUrl: string }) {
    if (img.imageUrl) {
      state.setViewingImage({ name: img.name, url: img.imageUrl });
    }
  }

  function handleSpotlightClose() {
    state.setViewingImage(null);
  }
</script>

<div class="column preview-column">
  <h2>Rendered ({state.renderedImages.length})</h2>

  {#if state.renderedImages.length === 0}
    <p class="empty-message">Rendered images will appear here</p>
  {:else}
    <div class="preview-grid">
      {#each state.renderedImages as img (img.name)}
        <div class="card-wrapper" class:written={img.written}>
          <SequenceCard
            sequence={createMockSequence(img.name)}
            coverUrl={img.imageUrl}
            onPrimaryAction={() => handleCardClick(img)}
          />
          <span class="status-badge" class:written={img.written}>
            {img.written ? "✓ Written" : "Preview"}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Spotlight viewer for full-size image viewing -->
<SpotlightViewer
  show={!!state.viewingImage}
  sequence={spotlightSequence}
  displayMode="image"
  onClose={handleSpotlightClose}
/>

<style>
  .column {
    background: var(--theme-panel-bg, #18181b);
    border-radius: 10px;
    padding: 1rem;
  }

  .column h2 {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 600;
    color: var(--theme-text-dim, #a1a1aa);
  }

  .preview-column {
    max-height: 75vh;
    overflow-y: auto;
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.5rem;
  }

  .card-wrapper {
    position: relative;
    border-radius: 8px;
    border: 2px solid var(--semantic-warning, #f59e0b);
  }

  .card-wrapper.written {
    border-color: var(--semantic-success, #22c55e);
  }

  .status-badge {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    font-size: var(--font-size-xs, 0.75rem);
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    font-weight: 500;
    background: rgba(245, 158, 11, 0.9);
    color: #000;
  }

  .status-badge.written {
    background: rgba(34, 197, 94, 0.9);
    color: #000;
  }

  .empty-message {
    color: var(--theme-text-dim, #52525b);
    padding: 3rem 2rem;
    text-align: center;
    font-size: var(--font-size-sm, 0.875rem);
  }
</style>
