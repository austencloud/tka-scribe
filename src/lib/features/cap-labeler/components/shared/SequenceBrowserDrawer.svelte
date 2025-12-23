<!--
  Sequence Browser Drawer

  Uses the existing Drawer infrastructure to browse and jump to any sequence.
  Shows thumbnail previews with label status indicators.
-->
<script lang="ts">
  import type { SequenceEntry } from "../../domain/models/sequence-models";
  import type { LabeledSequence } from "../../domain/models/label-models";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import FontAwesomeIcon from "$lib/shared/foundation/ui/FontAwesomeIcon.svelte";

  type FilterMode = "all" | "unlabeled" | "labeled" | "unknown";

  interface Props {
    isOpen: boolean;
    sequences: SequenceEntry[];
    labels: Map<string, LabeledSequence>;
    currentSequenceId: string | null;
    onClose: () => void;
    onSelectSequence: (sequenceId: string) => void;
  }

  let {
    isOpen = $bindable(),
    sequences,
    labels,
    currentSequenceId,
    onClose,
    onSelectSequence,
  }: Props = $props();

  // Local filter state
  let localFilter = $state<FilterMode>("all");
  let searchQuery = $state("");

  // Filter sequences
  const filteredSequences = $derived(() => {
    let result = sequences;

    // Apply status filter
    if (localFilter === "labeled") {
      result = result.filter((s) => labels.has(s.word));
    } else if (localFilter === "unlabeled") {
      result = result.filter((s) => !labels.has(s.word));
    } else if (localFilter === "unknown") {
      result = result.filter((s) => {
        const label = labels.get(s.word);
        return label?.isUnknown === true;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((s) => s.word.toLowerCase().includes(query));
    }

    return result;
  });

  // Get label status for a sequence
  function getLabelStatus(
    seq: SequenceEntry
  ): "labeled" | "unlabeled" | "unknown" {
    const label = labels.get(seq.word);
    if (!label) return "unlabeled";
    if (label.isUnknown) return "unknown";
    return "labeled";
  }

  // Get thumbnail URL for a sequence
  function getThumbnailUrl(seq: SequenceEntry): string | null {
    if (seq.thumbnails && seq.thumbnails.length > 0) {
      return seq.thumbnails[0] ?? null;
    }
    return null;
  }

  function handleSelect(seq: SequenceEntry) {
    onSelectSequence(seq.id);
    isOpen = false;
  }

  function handleClose() {
    onClose();
  }
</script>

<Drawer
  bind:isOpen
  placement="right"
  showHandle={false}
  closeOnBackdrop={true}
  closeOnEscape={true}
  onclose={handleClose}
  class="sequence-browser-drawer"
>
  <div class="drawer-content">
    <div class="drawer-header">
      <h2>Browse Sequences</h2>
      <button class="close-btn" onclick={() => (isOpen = false)}>
        <FontAwesomeIcon icon="times" size="1.2em" />
      </button>
    </div>

    <!-- Search -->
    <div class="drawer-search">
      <FontAwesomeIcon icon="search" size="0.9em" />
      <input
        type="text"
        placeholder="Search sequences..."
        bind:value={searchQuery}
      />
      {#if searchQuery}
        <button class="clear-search" onclick={() => (searchQuery = "")}>
          <FontAwesomeIcon icon="times" size="0.8em" />
        </button>
      {/if}
    </div>

    <!-- Filter chips -->
    <div class="drawer-filters">
      <button
        class="filter-chip"
        class:active={localFilter === "all"}
        onclick={() => (localFilter = "all")}
      >
        All ({sequences.length})
      </button>
      <button
        class="filter-chip"
        class:active={localFilter === "unlabeled"}
        onclick={() => (localFilter = "unlabeled")}
      >
        Unlabeled
      </button>
      <button
        class="filter-chip"
        class:active={localFilter === "labeled"}
        onclick={() => (localFilter = "labeled")}
      >
        Labeled
      </button>
      <button
        class="filter-chip"
        class:active={localFilter === "unknown"}
        onclick={() => (localFilter = "unknown")}
      >
        Unknown
      </button>
    </div>

    <!-- Sequence count -->
    <div class="sequence-count">
      {filteredSequences().length} sequences
    </div>

    <!-- Sequence grid with thumbnails -->
    <div class="sequence-grid">
      {#each filteredSequences() as seq (seq.id)}
        {@const status = getLabelStatus(seq)}
        {@const thumbnail = getThumbnailUrl(seq)}
        <button
          class="sequence-card"
          class:current={seq.id === currentSequenceId}
          class:labeled={status === "labeled"}
          class:unknown={status === "unknown"}
          onclick={() => handleSelect(seq)}
        >
          <!-- Thumbnail -->
          <div class="card-thumbnail">
            {#if thumbnail}
              <img src={thumbnail} alt={seq.word} loading="lazy" />
            {:else}
              <div class="thumbnail-placeholder">
                <span>{seq.word.slice(0, 2)}</span>
              </div>
            {/if}
            <!-- Status badge overlay -->
            <div
              class="status-badge"
              class:labeled={status === "labeled"}
              class:unknown={status === "unknown"}
            >
              {#if status === "labeled"}
                <FontAwesomeIcon icon="check" size="0.7em" />
              {:else if status === "unknown"}
                ?
              {/if}
            </div>
          </div>
          <!-- Card footer -->
          <div class="card-footer">
            <span class="card-word">{seq.word}</span>
            <span class="card-meta">{seq.sequenceLength}b</span>
          </div>
        </button>
      {/each}
    </div>
  </div>
</Drawer>

<style>
  .drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--surface-base, #0f0f1a);
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-lg, 16px) var(--space-xl, 20px);
    border-bottom: 1px solid var(--border-default, rgba(255, 255, 255, 0.1));
    flex-shrink: 0;
  }

  .drawer-header h2 {
    margin: 0;
    font-size: var(--text-xl, 18px);
    color: var(--text-primary, #fff);
  }

  .close-btn {
    padding: var(--space-sm, 8px);
    background: transparent;
    border: none;
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    border-radius: var(--radius-sm, 6px);
    transition: var(--transition-fast, 0.1s ease);
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary, #fff);
  }

  .drawer-search {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    margin: var(--space-md, 12px) var(--space-xl, 20px);
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: var(--surface-overlay, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--border-default, rgba(255, 255, 255, 0.15));
    border-radius: var(--radius-md, 8px);
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    flex-shrink: 0;
  }

  .drawer-search:focus-within {
    border-color: var(--accent-primary, #6366f1);
  }

  .drawer-search input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary, #fff);
    font-size: var(--text-md, 13px);
  }

  .drawer-search input::placeholder {
    color: var(--text-muted, rgba(255, 255, 255, 0.4));
  }

  .clear-search {
    padding: 4px;
    background: transparent;
    border: none;
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    border-radius: var(--radius-xs, 4px);
  }

  .clear-search:hover {
    color: var(--text-primary, #fff);
  }

  .drawer-filters {
    display: flex;
    gap: var(--space-xs, 4px);
    padding: 0 var(--space-xl, 20px);
    margin-bottom: var(--space-md, 12px);
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .filter-chip {
    padding: var(--space-xs, 4px) var(--space-sm, 8px);
    background: var(--surface-overlay, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--border-default, rgba(255, 255, 255, 0.15));
    border-radius: var(--radius-pill, 9999px);
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    font-size: var(--text-sm, 12px);
    transition: var(--transition-fast, 0.1s ease);
  }

  .filter-chip:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .filter-chip.active {
    background: var(--accent-primary-soft, rgba(99, 102, 241, 0.3));
    border-color: var(--accent-primary, #6366f1);
    color: var(--text-primary, #fff);
  }

  .sequence-count {
    padding: 0 var(--space-xl, 20px);
    margin-bottom: var(--space-sm, 8px);
    font-size: var(--text-sm, 12px);
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    flex-shrink: 0;
  }

  .sequence-grid {
    flex: 1;
    overflow-y: auto;
    padding: 0 var(--space-md, 12px) var(--space-md, 12px);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: min-content;
    gap: var(--space-sm, 8px);
    align-items: start;
  }

  .sequence-grid::-webkit-scrollbar {
    width: 6px;
  }

  .sequence-grid::-webkit-scrollbar-track {
    background: transparent;
  }

  .sequence-grid::-webkit-scrollbar-thumb {
    background: var(--border-default, rgba(255, 255, 255, 0.15));
    border-radius: 3px;
  }

  .sequence-card {
    display: flex;
    flex-direction: column;
    background: var(--surface-overlay, rgba(255, 255, 255, 0.05));
    border: 1px solid transparent;
    border-radius: var(--radius-md, 8px);
    overflow: hidden;
    cursor: pointer;
    transition: var(--transition-fast, 0.1s ease);
    padding: 0;
    min-width: 0;
  }

  .sequence-card:hover {
    background: var(--surface-raised, rgba(255, 255, 255, 0.08));
    border-color: var(--border-default, rgba(255, 255, 255, 0.15));
  }

  .sequence-card.current {
    border-color: var(--accent-primary, #6366f1);
    box-shadow: 0 0 0 1px var(--accent-primary, #6366f1);
  }

  .card-thumbnail {
    position: relative;
    background: var(--surface-inset, rgba(0, 0, 0, 0.3));
  }

  .card-thumbnail img {
    width: 100%;
    height: auto;
    display: block;
  }

  .thumbnail-placeholder {
    width: 100%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.2),
      rgba(139, 92, 246, 0.2)
    );
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    font-size: 1.5rem;
    font-weight: 600;
  }

  .status-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-muted, rgba(255, 255, 255, 0.4));
    backdrop-filter: blur(4px);
  }

  .status-badge.labeled {
    background: rgba(34, 197, 94, 0.3);
    color: #4ade80;
  }

  .status-badge.unknown {
    background: rgba(234, 179, 8, 0.3);
    color: #fbbf24;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-xs, 4px) var(--space-sm, 8px);
    background: var(--surface-overlay, rgba(255, 255, 255, 0.03));
  }

  .card-word {
    font-size: var(--text-sm, 12px);
    font-weight: 500;
    color: var(--text-primary, #fff);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-meta {
    font-size: var(--text-xs, 10px);
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    flex-shrink: 0;
  }
</style>
