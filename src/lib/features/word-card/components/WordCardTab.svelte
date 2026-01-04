<!--
  WordCardTab.svelte - Page-based word card viewer

  Main container for browsing and filtering sequence word cards.
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { getContainerInstance } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import type { IDiscoverLoader } from "../../discover/gallery/display/services/contracts/IDiscoverLoader";
  import type { PrintPreviewPage } from "../domain/types/PageLayoutTypes";
  import WordCardNavigation from "./Navigation.svelte";
  import PageDisplay from "./PageDisplay.svelte";

  // Services
  let loaderService = $state<IDiscoverLoader | null>(null);

  // Storage keys
  const STORAGE_KEY_LENGTH = "wordCard.selectedLength";
  const STORAGE_KEY_COLUMNS = "wordCard.columnCount";

  // Load persisted state or use defaults
  function getPersistedNumber(key: string, defaultValue: number): number {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : defaultValue;
  }

  // State
  let sequences: SequenceData[] = $state([]);
  let isLoading = $state(false);
  let selectedLength = $state(getPersistedNumber(STORAGE_KEY_LENGTH, 16));
  let columnCount = $state(getPersistedNumber(STORAGE_KEY_COLUMNS, 3));
  let error = $state<string | null>(null);

  // Persist filter changes
  $effect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_LENGTH, String(selectedLength));
    }
  });

  $effect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_COLUMNS, String(columnCount));
    }
  });

  // Filtered sequences based on selected length
  let filteredSequences = $derived.by(() => {
    if (selectedLength === 0) return sequences;
    return sequences.filter((seq) => seq.sequenceLength === selectedLength);
  });

  // Estimate sequences per page based on beat length
  // Shorter sequences = more rows fit, longer = fewer rows
  function getSequencesPerPage(beatCount: number): number {
    // 2 columns, rows depend on sequence height
    if (beatCount <= 3) return 10; // 5 rows
    if (beatCount <= 4) return 8; // 4 rows
    if (beatCount <= 6) return 6; // 3 rows
    if (beatCount <= 10) return 4; // 2 rows
    return 4; // 2 rows for 12-16 beats
  }

  // Create pages from filtered sequences (dynamic per page based on beat length)
  let pages = $derived.by((): PrintPreviewPage[] => {
    if (filteredSequences.length === 0) {
      return [{ id: "empty", sequences: [], isEmpty: true }];
    }

    // When "All" is selected, use a conservative estimate
    const sequencesPerPage =
      selectedLength === 0 ? 6 : getSequencesPerPage(selectedLength);

    const result: PrintPreviewPage[] = [];

    for (let i = 0; i < filteredSequences.length; i += sequencesPerPage) {
      result.push({
        id: `page-${Math.floor(i / sequencesPerPage) + 1}`,
        sequences: filteredSequences.slice(i, i + sequencesPerPage),
        isEmpty: false,
      });
    }

    return result;
  });

  // Status message
  let statusMessage = $derived.by(() => {
    if (isLoading) {
      return selectedLength === 0
        ? "Loading all sequences..."
        : `Loading ${selectedLength}-beat sequences...`;
    }

    if (pages.length === 1 && pages[0]?.isEmpty) {
      return selectedLength === 0
        ? "No sequences found"
        : `No ${selectedLength}-beat sequences`;
    }

    const pageCount = pages.length;
    const seqCount = filteredSequences.length;
    const lengthLabel =
      selectedLength === 0 ? "all lengths" : `${selectedLength}-beat`;
    return `${seqCount} sequence${seqCount !== 1 ? "s" : ""} (${lengthLabel}) · ${pageCount} page${pageCount !== 1 ? "s" : ""}`;
  });

  onMount(async () => {
    const container = await getContainerInstance();
    loaderService = container.get<IDiscoverLoader>(TYPES.IDiscoverLoader);
    await loadSequences();
  });

  async function loadSequences() {
    if (!loaderService) return;

    try {
      isLoading = true;
      error = null;
      sequences = await loaderService.loadSequenceMetadata();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load sequences";
      console.error("WordCard: Failed to load sequences:", err);
    } finally {
      isLoading = false;
    }
  }

  function handleLengthSelected(length: number) {
    selectedLength = length;
  }

  function handleColumnCountChanged(count: number) {
    columnCount = count;
  }
</script>

<div class="word-card-tab">
  <!-- Header -->
  <header class="tab-header">
    <div class="header-content">
      <div class="title-row">
        <i class="fas fa-id-card" aria-hidden="true"></i>
        <h1 class="title">Word Cards</h1>
      </div>
      <p class="status">{statusMessage}</p>
    </div>
  </header>

  <!-- Main content -->
  <div class="main-content">
    <!-- Navigation Sidebar -->
    <aside class="sidebar">
      <WordCardNavigation
        {selectedLength}
        {columnCount}
        onLengthSelected={handleLengthSelected}
        onColumnCountChanged={handleColumnCountChanged}
      />
    </aside>

    <!-- Page Display -->
    <main class="content-area">
      <PageDisplay
        {pages}
        {isLoading}
        {error}
        {columnCount}
        onRetry={loadSequences}
      />
    </main>
  </div>
</div>

<style>
  .word-card-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: transparent;
  }

  /* Header */
  .tab-header {
    flex-shrink: 0;
    padding: var(--spacing-md);
    padding-bottom: 0;
  }

  .header-content {
    background: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: var(--border-radius-lg, 12px);
    padding: var(--spacing-lg) var(--spacing-xl);
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }

  .title-row i {
    color: var(--theme-accent, #f43f5e);
    font-size: 1.25rem;
  }

  .title {
    margin: 0;
    font-size: var(--font-size-xl, 20px);
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .status {
    margin: 0;
    font-size: var(--font-size-sm, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  /* Main Content */
  .main-content {
    flex: 1;
    display: flex;
    min-height: 0;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }

  .sidebar {
    width: 280px;
    flex-shrink: 0;
    background: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: var(--border-radius-lg, 12px);
    overflow: hidden;
  }

  .content-area {
    flex: 1;
    min-width: 0;
    background: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: var(--border-radius-lg, 12px);
    overflow: hidden;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .tab-header {
      padding: var(--spacing-sm);
      padding-bottom: 0;
    }

    .header-content {
      padding: var(--spacing-md) var(--spacing-lg);
    }

    .title-row i {
      font-size: 1rem;
    }

    .title {
      font-size: var(--font-size-lg, 18px);
    }

    .status {
      font-size: var(--font-size-compact, 12px);
    }

    .main-content {
      flex-direction: column;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
    }

    .sidebar {
      width: 100%;
      max-height: 180px;
    }
  }
</style>
