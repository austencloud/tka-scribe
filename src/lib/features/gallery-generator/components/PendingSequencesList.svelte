<!--
  Pending Sequences List

  Left column showing sequences waiting to be rendered.
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { galleryGeneratorState } from "../state/gallery-generator-state.svelte";

  interface Props {
    onRenderSingle: (sequence: SequenceData) => void;
  }

  let { onRenderSingle }: Props = $props();

  const state = galleryGeneratorState;
</script>

<div class="column pending-column">
  <h2>Pending ({state.pendingSequences.length})</h2>

  {#if state.isLoading}
    <p class="empty-message">Loading sequences...</p>
  {:else if state.pendingSequences.length === 0}
    <p class="empty-message">All sequences rendered!</p>
  {:else}
    <div class="sequence-list">
      {#each state.pendingSequences.slice(0, 100) as sequence (sequence.id)}
        <div class="sequence-item">
          <span class="name">{sequence.word || sequence.name}</span>
          <span class="meta">L{sequence.level || 1} · {sequence.sequenceLength}b</span>
          <button
            class="render-btn"
            onclick={() => onRenderSingle(sequence)}
            disabled={state.isRendering}
            title="Render this sequence"
          >
            ▶
          </button>
        </div>
      {/each}
      {#if state.pendingSequences.length > 100}
        <p class="more-text">...and {state.pendingSequences.length - 100} more</p>
      {/if}
    </div>
  {/if}
</div>

<style>
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
</style>
