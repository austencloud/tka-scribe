<script lang="ts">
  import type { SequenceEntry } from "../../domain/models/sequence-models";
  import FontAwesomeIcon from "$lib/shared/foundation/ui/FontAwesomeIcon.svelte";

  type FilterMode = "all" | "unlabeled" | "labeled" | "unknown";
  type SyncStatus = "idle" | "syncing" | "synced" | "error";

  interface Stats {
    total: number;
    labeled: number;
    unlabeled: number;
    unknown: number;
  }

  interface Props {
    stats: Stats;
    filterMode: FilterMode;
    onFilterChange: (mode: FilterMode) => void;
    onExportToggle: () => void;
    onExportLabels: () => void;
    onImportFile: (file: File) => void;
    onSyncLocalStorage: () => void;
    showExport: boolean;
    syncStatus: SyncStatus;
    // New props for navigation
    sequences: SequenceEntry[];
    onJumpToSequence: (sequenceId: string) => void;
    onOpenBrowser: () => void;
  }

  let {
    stats,
    filterMode,
    onFilterChange,
    onExportToggle,
    onExportLabels,
    onImportFile,
    onSyncLocalStorage,
    showExport,
    syncStatus,
    sequences,
    onJumpToSequence,
    onOpenBrowser,
  }: Props = $props();

  // Search state
  let searchQuery = $state("");
  let showSuggestions = $state(false);

  // Filter sequences by search query
  const filteredSuggestions = $derived(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return sequences
      .filter((s) => s.word.toLowerCase().includes(query))
      .slice(0, 8); // Limit to 8 suggestions
  });

  function handleSearchInput(e: Event) {
    searchQuery = (e.target as HTMLInputElement).value;
    showSuggestions = true;
  }

  function handleSelectSuggestion(seq: SequenceEntry) {
    onJumpToSequence(seq.id);
    searchQuery = "";
    showSuggestions = false;
  }

  function handleSearchKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      showSuggestions = false;
      searchQuery = "";
    } else if (e.key === "Enter" && filteredSuggestions().length > 0) {
      handleSelectSuggestion(filteredSuggestions()[0]!);
    }
  }

  function handleImportFile(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      onImportFile(file);
    }
  }

  // Computed remaining count
  const remaining = $derived(stats.total - stats.labeled);
</script>

<header class="header">
  <h1>CAP Type Labeler</h1>
  <div class="stats">
    <span class="stat">{stats.labeled} labeled</span>
    <span class="stat">{remaining} remaining</span>
    <span class="stat">{stats.total} total circular</span>
    <span
      class="sync-status"
      class:syncing={syncStatus === "syncing"}
      class:error={syncStatus === "error"}
    >
      {#if syncStatus === "syncing"}
        ⟳ Syncing...
      {:else if syncStatus === "error"}
        ⚠ Sync error
      {:else}
        ✓ Firebase
      {/if}
    </span>
  </div>
</header>

<div class="controls-bar">
  <div class="filter-chips">
    <button
      class="filter-chip"
      class:active={filterMode === "unlabeled"}
      onclick={() => onFilterChange("unlabeled")}
    >
      Unlabeled
    </button>
    <button
      class="filter-chip"
      class:active={filterMode === "labeled"}
      onclick={() => onFilterChange("labeled")}
    >
      Labeled
    </button>
    <button
      class="filter-chip"
      class:active={filterMode === "unknown"}
      onclick={() => onFilterChange("unknown")}
    >
      Unknown ({stats.unknown})
    </button>
    <button
      class="filter-chip"
      class:active={filterMode === "all"}
      onclick={() => onFilterChange("all")}
    >
      All
    </button>
  </div>

  <!-- Search and Browse -->
  <div class="nav-controls">
    <div class="search-container">
      <FontAwesomeIcon icon="search" size="0.9em" />
      <input
        type="text"
        class="search-input"
        placeholder="Jump to sequence..."
        value={searchQuery}
        oninput={handleSearchInput}
        onkeydown={handleSearchKeydown}
        onfocus={() => (showSuggestions = true)}
        onblur={() => setTimeout(() => (showSuggestions = false), 150)}
      />
      {#if showSuggestions && filteredSuggestions().length > 0}
        <div class="search-suggestions">
          {#each filteredSuggestions() as seq}
            <button
              class="suggestion-item"
              onmousedown={() => handleSelectSuggestion(seq)}
            >
              <span class="suggestion-word">{seq.word}</span>
              <span class="suggestion-length">{seq.sequenceLength} beats</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <button
      class="browse-btn"
      onclick={onOpenBrowser}
      title="Browse all sequences"
    >
      <FontAwesomeIcon icon="list" size="1em" />
      Browse
    </button>
  </div>

  <div class="io-controls">
    <button class="btn-secondary" onclick={onExportToggle}>
      Import/Export
    </button>
  </div>
</div>

{#if showExport}
  <div class="export-panel">
    <button class="btn-primary" onclick={onExportLabels}>
      Export Labels JSON
    </button>
    <label class="btn-secondary">
      Import Labels
      <input
        type="file"
        accept=".json"
        onchange={handleImportFile}
        style="display: none"
      />
    </label>
    <button class="btn-sync" onclick={onSyncLocalStorage}>
      ↑ Sync localStorage → Firebase
    </button>
  </div>
{/if}

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xl, 20px);
    padding-bottom: var(--space-lg, 16px);
    border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
  }

  .header h1 {
    margin: 0;
    font-size: var(--text-3xl, 24px);
  }

  .stats {
    display: flex;
    gap: var(--space-lg, 16px);
  }

  .stat {
    background: var(--surface-overlay, rgba(255, 255, 255, 0.08));
    padding: var(--space-xs, 4px) var(--space-md, 12px);
    border-radius: var(--radius-sm, 6px);
    font-size: var(--text-md, 13px);
  }

  .sync-status {
    padding: var(--space-xs, 4px) var(--space-md, 12px);
    border-radius: var(--radius-sm, 6px);
    font-size: var(--text-sm, 12px);
    background: var(--accent-success-soft, rgba(34, 197, 94, 0.2));
    color: var(--accent-success, #22c55e);
  }

  .sync-status.syncing {
    background: var(--accent-warning-soft, rgba(234, 179, 8, 0.2));
    color: var(--accent-warning, #eab308);
    animation: pulse 1s infinite;
  }

  .sync-status.error {
    background: var(--accent-danger-soft, rgba(239, 68, 68, 0.2));
    color: var(--accent-danger, #ef4444);
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  .controls-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xl, 20px);
  }

  .filter-chips {
    display: flex;
    gap: var(--space-sm, 8px);
  }

  .filter-chip {
    padding: var(--space-sm, 8px) var(--space-lg, 16px);
    background: var(--surface-overlay, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--border-default, rgba(255, 255, 255, 0.15));
    border-radius: var(--radius-pill, 9999px);
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    font-size: var(--text-md, 13px);
    transition: var(--transition-default, 0.15s ease);
  }

  .filter-chip:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .filter-chip.active {
    background: var(--accent-primary-soft, rgba(99, 102, 241, 0.3));
    border-color: var(--accent-primary, #6366f1);
    color: var(--text-primary, #fff);
  }

  .io-controls {
    display: flex;
    gap: var(--space-sm, 8px);
  }

  .btn-secondary {
    padding: 10px var(--space-lg, 16px);
    background: var(--surface-overlay, rgba(255, 255, 255, 0.08));
    border: none;
    border-radius: var(--radius-sm, 6px);
    color: var(--text-primary, #fff);
    cursor: pointer;
    font-size: var(--text-md, 13px);
    transition: var(--transition-default, 0.15s ease);
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .export-panel {
    display: flex;
    gap: var(--space-md, 12px);
    margin-bottom: var(--space-xl, 20px);
    padding: var(--space-lg, 16px);
    background: var(--surface-raised, rgba(255, 255, 255, 0.05));
    border-radius: var(--radius-md, 8px);
  }

  .btn-primary {
    padding: 10px var(--space-lg, 16px);
    border-radius: var(--radius-sm, 6px);
    cursor: pointer;
    font-size: var(--text-md, 13px);
    border: none;
    transition: var(--transition-default, 0.15s ease);
    background: var(--accent-primary, #6366f1);
    color: var(--text-primary, #fff);
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  .btn-sync {
    padding: 10px var(--space-lg, 16px);
    background: var(--accent-success-soft, rgba(34, 197, 94, 0.2));
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: var(--radius-sm, 6px);
    color: var(--accent-success, #22c55e);
    cursor: pointer;
    font-size: var(--text-md, 13px);
    transition: var(--transition-default, 0.15s ease);
  }

  .btn-sync:hover {
    background: rgba(34, 197, 94, 0.3);
  }

  /* Navigation controls */
  .nav-controls {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
  }

  .search-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: var(--surface-overlay, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--border-default, rgba(255, 255, 255, 0.15));
    border-radius: var(--radius-md, 8px);
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
  }

  .search-container:focus-within {
    border-color: var(--accent-primary, #6366f1);
    background: var(--surface-raised, rgba(255, 255, 255, 0.1));
  }

  .search-input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary, #fff);
    font-size: var(--text-md, 13px);
    width: 160px;
  }

  .search-input::placeholder {
    color: var(--text-muted, rgba(255, 255, 255, 0.4));
  }

  .search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: var(--surface-elevated, #1a1a2e);
    border: 1px solid var(--border-default, rgba(255, 255, 255, 0.15));
    border-radius: var(--radius-md, 8px);
    overflow: hidden;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .suggestion-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: transparent;
    border: none;
    color: var(--text-primary, #fff);
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
  }

  .suggestion-item:hover {
    background: var(--accent-primary-soft, rgba(99, 102, 241, 0.2));
  }

  .suggestion-word {
    font-weight: 500;
  }

  .suggestion-length {
    font-size: var(--text-xs, 11px);
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
  }

  .browse-btn {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: var(--accent-primary-soft, rgba(99, 102, 241, 0.2));
    border: 1px solid rgba(99, 102, 241, 0.4);
    border-radius: var(--radius-md, 8px);
    color: var(--accent-primary-light, #a5b4fc);
    cursor: pointer;
    font-size: var(--text-md, 13px);
    transition: var(--transition-default, 0.15s ease);
  }

  .browse-btn:hover {
    background: rgba(99, 102, 241, 0.3);
    border-color: rgba(99, 102, 241, 0.6);
  }
</style>
