<script lang="ts">
  import { onMount } from "svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import SequenceCard from "$lib/features/discover/gallery/display/components/SequenceCard/SequenceCard.svelte";
  import { TYPES } from "$lib/shared/inversify/types";
  import { loadSharedModules, loadFeatureModule, resolveAsync } from "$lib/shared/inversify/container";
  import type { ISequenceRenderService } from "$lib/shared/render/services/contracts/ISequenceRenderService";
  import type { IDiscoverLoader } from "$lib/features/discover/gallery/display/services/contracts/IDiscoverLoader";
  import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";

  let sequences: SequenceData[] = $state([]);
  let selectedSequenceId: string | null = $state(null);
  let selectedPropType = $state("staff");
  let rendering = $state(false);
  let loadError = $state("");
  let renderError = $state("");
  let searchQuery = $state("");
  let loadingSequences = $state(true);
  let renderService: ISequenceRenderService | null = $state(null);
  let discoverLoader: IDiscoverLoader | null = $state(null);

  // Multi-size export presets (like Adobe Illustrator)
  const exportPresets = [
    { name: "1x (Thumbnail)", scale: 1, beatSize: 100, suffix: "@1x" },
    { name: "2x (Standard)", scale: 2, beatSize: 150, suffix: "@2x" },
    { name: "4x (Retina)", scale: 4, beatSize: 200, suffix: "@4x" },
    { name: "8x (4K/Print)", scale: 8, beatSize: 250, suffix: "@8x" },
  ];

  // Rendered images for each size
  interface RenderedImage {
    name: string;
    suffix: string;
    scale: number;
    url: string;
    blob: Blob;
  }
  let renderedImages: RenderedImage[] = $state([]);
  let renderProgress = $state("");

  const selectedSequence = $derived(
    sequences.find((s) => s.id === selectedSequenceId) || null
  );

  const filteredSequences = $derived(
    sequences.filter((s) => {
      const word = s.word || s.name || s.id || "";
      return word.toLowerCase().includes(searchQuery.toLowerCase());
    })
  );

  const propTypesGrouped = {
    "Staff Family": ["staff", "simple_staff", "bigstaff", "staff_v2"],
    "Club Family": ["club", "bigclub"],
    "Fan Family": ["fan", "bigfan"],
    "Triad Family": ["triad", "bigtriad"],
    "Hoop Family": ["minihoop", "bighoop"],
    "Buugeng Family": ["buugeng", "bigbuugeng", "fractalgeng"],
    "Other": ["hand", "triquetra", "triquetra2", "sword", "chicken", "bigchicken", "guitar", "ukulele", "doublestar", "bigdoublestar", "eightrings", "bigeightrings", "quiad"]
  };

  // Load sequences and initialize services
  onMount(async () => {
    // Initialize services for client-side rendering
    try {
      console.log("🔵 Loading shared modules...");
      await loadSharedModules();
      await loadFeatureModule("discover");
      renderService = await resolveAsync<ISequenceRenderService>(TYPES.ISequenceRenderService);
      discoverLoader = await resolveAsync<IDiscoverLoader>(TYPES.IDiscoverLoader);
      console.log("🔵 Services loaded - render:", !!renderService, "discover:", !!discoverLoader);
    } catch (err) {
      console.error("❌ Failed to load services:", err);
    }

    // Load sequences using DiscoverLoader (properly transforms beat data)
    try {
      console.log("🔵 Loading sequences via DiscoverLoader...");
      if (!discoverLoader) {
        throw new Error("DiscoverLoader not initialized");
      }

      // Load sequence metadata (includes properly transformed beats)
      const allSequences = await discoverLoader.loadSequenceMetadata();
      sequences = allSequences.slice(0, 50);

      console.log("🔵 Sequences loaded:", sequences.length);
      console.log("🔵 First sequence:", sequences[0]);

      if (sequences.length > 0 && sequences[0]) {
        selectedSequenceId = sequences[0].id;
      }
    } catch (err) {
      console.error("❌ Sequence load failed:", err);
      loadError = `Failed to load sequences: ${err instanceof Error ? err.message : String(err)}`;
    } finally {
      loadingSequences = false;
    }
  });

  async function renderSequence() {
    if (!selectedSequence) {
      renderError = "Please select a sequence";
      return;
    }

    if (!renderService || !discoverLoader) {
      renderError = "Services not ready. Please wait...";
      return;
    }

    rendering = true;
    renderError = "";
    renderedImages = [];

    try {
      // Load full sequence data with beats (gallery only loads lightweight metadata)
      const fullSequence = await discoverLoader.loadFullSequenceData(selectedSequence.word || selectedSequence.id);
      if (!fullSequence) {
        throw new Error("Failed to load full sequence data");
      }

      console.log("🔵 Full sequence loaded:", fullSequence.word, "beats:", fullSequence.beats?.length);

      // Render all size presets
      for (let i = 0; i < exportPresets.length; i++) {
        const preset = exportPresets[i];
        if (!preset) continue;
        renderProgress = `Rendering ${preset.name} (${i + 1}/${exportPresets.length})...`;

        const blob = await renderService.renderSequenceToBlob(fullSequence, {
          beatSize: preset.beatSize,
          format: "PNG",
          quality: 1.0,
          includeStartPosition: true,
          addBeatNumbers: false,
          addWord: true,
          addDifficultyLevel: true,
          addUserInfo: false,
          addReversalSymbols: false,
          combinedGrids: false,
          beatScale: 1.0,
          margin: 0,
          redVisible: true,
          blueVisible: true,
          userName: "",
          exportDate: "",
          notes: "",
          scale: preset.scale,
          propTypeOverride: selectedPropType as PropType,
        });

        renderedImages = [...renderedImages, {
          name: preset.name,
          suffix: preset.suffix,
          scale: preset.scale,
          url: URL.createObjectURL(blob),
          blob,
        }];
      }

      renderProgress = "";
    } catch (err) {
      renderError = `Rendering failed: ${err instanceof Error ? err.message : String(err)}`;
    } finally {
      rendering = false;
    }
  }

  function downloadImage(image: RenderedImage) {
    if (!selectedSequence) return;

    const a = document.createElement("a");
    a.href = image.url;
    a.download = `${selectedSequence.word || "sequence"}_${selectedPropType}${image.suffix}.png`;
    a.click();
  }

  async function downloadAllSizes() {
    if (!selectedSequence || renderedImages.length === 0) return;

    // Download each size with a small delay to avoid browser blocking
    for (const image of renderedImages) {
      downloadImage(image);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  function getCoverUrl(sequence: SequenceData): string | undefined {
    const firstThumbnail = sequence?.thumbnails?.[0];
    if (!firstThumbnail) return undefined;
    // Thumbnails are stored as "/Explore/A/A_ver1.webp" but actual path is "/gallery/A/A_ver1.webp"
    return firstThumbnail.replace("/Explore/", "/gallery/");
  }

  function handleSelectSequence(sequence: SequenceData) {
    selectedSequenceId = sequence.id;
  }
</script>

<div class="test-page">
  <header>
    <h1>🎨 Batch Render Test</h1>
    <p class="subtitle">Test prop type override rendering • Word + difficulty baked into images</p>
  </header>

  <div class="layout">
    <!-- Left Panel: Sequence Selection -->
    <section class="panel sequences-panel">
      <h2>1. Choose Sequence</h2>

      {#if !loadingSequences}
        <input
          type="text"
          placeholder="Search sequences..."
          class="search-input"
          bind:value={searchQuery}
        />
      {/if}

      {#if loadingSequences}
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading sequences...</p>
        </div>
      {:else if loadError}
        <div class="error-state">
          <p>❌ {loadError}</p>
        </div>
      {:else if filteredSequences.length === 0}
        <div class="empty-state">
          <p>No sequences found</p>
          {#if searchQuery}
            <button onclick={() => searchQuery = ""}>Clear search</button>
          {/if}
        </div>
      {:else}
        <div class="sequence-grid">
          {#each filteredSequences as seq (seq.id)}
            <div class="card-wrapper" class:selected={selectedSequenceId === seq.id}>
              <SequenceCard
                sequence={seq}
                coverUrl={getCoverUrl(seq)}
                selected={selectedSequenceId === seq.id}
                onPrimaryAction={handleSelectSequence}
              />
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Right Panel: Prop Type Selection -->
    <section class="panel props-panel">
      <h2>2. Choose Prop Type</h2>

      {#each Object.entries(propTypesGrouped) as [family, props]}
        <div class="prop-family">
          <h3>{family}</h3>
          <div class="prop-chips">
            {#each props as propType}
              <button
                class="prop-chip"
                class:selected={selectedPropType === propType}
                onclick={() => selectedPropType = propType}
              >
                {propType.replace(/_/g, ' ')}
              </button>
            {/each}
          </div>
        </div>
      {/each}

      <button
        class="render-button"
        onclick={renderSequence}
        disabled={rendering || !selectedSequence || !renderService}
      >
        {#if rendering}
          <span class="spinner-small"></span>
          Rendering...
        {:else if !renderService}
          Loading renderer...
        {:else}
          ✨ Render with {selectedPropType}
        {/if}
      </button>
    </section>
  </div>

  {#if rendering}
    <div class="loading">
      <div class="spinner"></div>
      <p>{renderProgress || `Rendering with prop type: ${selectedPropType}`}</p>
    </div>
  {/if}

  {#if renderError}
    <div class="error-banner">
      ❌ {renderError}
    </div>
  {/if}

  {#if renderedImages.length > 0}
    <div class="result">
      <div class="result-header">
        <h3>Rendered Sizes</h3>
        <button onclick={downloadAllSizes} class="download-all-btn">
          ⬇️ Download All Sizes
        </button>
      </div>
      <p class="result-info">
        ✅ Rendered <strong>{selectedSequence?.word}</strong> with <strong>{selectedPropType}</strong> in {renderedImages.length} sizes
      </p>

      <div class="sizes-grid">
        {#each renderedImages as image}
          <div class="size-card">
            <div class="size-header">
              <span class="size-name">{image.name}</span>
              <span class="size-scale">{image.scale}x</span>
            </div>
            <div class="size-preview">
              <img src={image.url} alt="{image.name} preview" />
            </div>
            <button onclick={() => downloadImage(image)} class="download-btn">
              Download {image.suffix}
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .test-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 20px;
    font-family: system-ui, -apple-system, sans-serif;
  }

  header {
    text-align: center;
    margin-bottom: 40px;
  }

  h1 {
    color: var(--theme-text, #ffffff);
    margin: 0 0 8px;
    font-size: 2.5rem;
    font-weight: 700;
  }

  .subtitle {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 1rem;
  }

  .layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 40px;
  }

  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }

  .panel {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    padding: 24px;
  }

  .panel h2 {
    color: var(--theme-text, #ffffff);
    font-size: 1.25rem;
    margin: 0 0 20px;
    font-weight: 600;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.2));
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.3));
    color: var(--theme-text, #ffffff);
    font-size: 14px;
    margin-bottom: 16px;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--theme-accent, #6366f1);
  }

  .search-input::placeholder {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  .loading-state .spinner {
    margin-bottom: 16px;
  }

  .error-state p {
    color: var(--semantic-error, #dc3545);
  }

  .empty-state button {
    margin-top: 16px;
    padding: 8px 16px;
    font-size: 14px;
  }

  .sequence-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    max-height: 600px;
    overflow-y: auto;
    padding-right: 8px;
  }

  @media (max-width: 1200px) {
    .sequence-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .card-wrapper {
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid transparent;
    transition: all 0.2s;
  }

  .card-wrapper:hover {
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.3));
  }

  .card-wrapper.selected {
    border-color: var(--theme-accent, #6366f1);
    box-shadow: 0 0 0 2px var(--theme-accent, #6366f1);
  }

  .prop-family {
    margin-bottom: 24px;
  }

  .prop-family h3 {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 12px;
  }

  .prop-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .prop-chip {
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.2));
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.2));
    color: var(--theme-text, #ffffff);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: capitalize;
  }

  .prop-chip:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.3));
  }

  .prop-chip.selected {
    background: var(--theme-accent, #6366f1);
    border-color: var(--theme-accent, #6366f1);
    font-weight: 600;
  }

  .render-button {
    width: 100%;
    padding: 16px 24px;
    border-radius: 8px;
    border: none;
    background: var(--theme-accent, #6366f1);
    color: white;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .render-button:hover:not(:disabled) {
    background: var(--theme-accent-strong, #4f46e5);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .render-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .error-banner {
    background: #dc3545;
    color: white;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
  }

  .loading {
    text-align: center;
    padding: 40px;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--theme-stroke, rgba(255, 255, 255, 0.2));
    border-top-color: var(--theme-accent, #6366f1);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .result {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    padding: 24px;
    border-radius: 8px;
  }

  .result h3 {
    margin-top: 0;
    color: var(--theme-text, #ffffff);
  }

  .result-info {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.8));
    margin-bottom: 16px;
  }

  .download-btn {
    background: #28a745;
    margin-bottom: 16px;
  }

  .download-btn:hover {
    background: #218838;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .download-all-btn {
    background: var(--theme-accent, #6366f1);
    padding: 10px 20px;
    font-size: 0.9rem;
  }

  .download-all-btn:hover {
    background: var(--theme-accent-strong, #4f46e5);
  }

  .sizes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .size-card {
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.2));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .size-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .size-name {
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .size-scale {
    background: var(--theme-accent, #6366f1);
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .size-preview {
    background: white;
    padding: 12px;
    border-radius: 6px;
    max-height: 200px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .size-preview img {
    max-width: 100%;
    max-height: 180px;
    height: auto;
    object-fit: contain;
  }

  .size-card .download-btn {
    margin-bottom: 0;
    width: 100%;
  }
</style>
