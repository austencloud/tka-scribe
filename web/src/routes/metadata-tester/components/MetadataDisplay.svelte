<!-- Modern Metadata Display Component - Clean Orchestrator -->
<script lang="ts">
  import type { MetadataTesterState } from "../state/metadata-tester-state.svelte";
  import LoadingStates from "./display/shared/LoadingStates.svelte";
  import EmptyState from "./display/shared/EmptyState.svelte";
  import ErrorState from "./display/shared/ErrorState.svelte";
  import BatchSummaryDisplay from "./display/BatchSummaryDisplay.svelte";
  import IndividualSequenceDisplay from "./display/IndividualSequenceDisplay.svelte";

  interface Props {
    state: {
      state: MetadataTesterState;
    };
  }

  let { state }: Props = $props();

  // Copy metadata to clipboard
  async function copyToClipboard() {
    if (!state.state.rawMetadata) return;

    try {
      await navigator.clipboard.writeText(state.state.rawMetadata);
      // Could emit an event here for toast notification
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }
</script>

<div class="metadata-display">
  <div class="display-header">
    <h2>📊 Metadata Analysis</h2>
    {#if state.state.rawMetadata}
      <button
        class="copy-btn"
        onclick={copyToClipboard}
        title="Copy raw metadata to clipboard"
      >
        📋 Copy
      </button>
    {/if}
  </div>

  <div class="display-content">
    {#if state.state.isBatchAnalyzing}
      <LoadingStates type="batch" />
    {:else if state.state.isExtractingMetadata}
      <LoadingStates type="extraction" />
    {:else if state.state.error}
      <ErrorState error={state.state.error} />
    {:else if !state.state.selectedThumbnail && !state.state.metadataStats}
      <EmptyState />
    {:else if state.state.metadataStats}
      {#if state.state.metadataStats.isBatchSummary && state.state.metadataStats.batchSummary}
        <!-- Batch Analysis Results -->
        <BatchSummaryDisplay
          batchSummary={state.state.metadataStats.batchSummary}
        />
      {:else}
        <!-- Individual Sequence Analysis -->
        <IndividualSequenceDisplay
          stats={state.state.metadataStats}
          selectedThumbnail={state.state.selectedThumbnail}
          extractedMetadata={state.state.extractedMetadata}
          rawMetadata={state.state.rawMetadata}
        />
      {/if}
    {/if}
  </div>
</div>

<style>
  .metadata-display {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .display-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .display-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: #22c55e;
  }

  .copy-btn {
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    color: #22c55e;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .copy-btn:hover {
    background: rgba(34, 197, 94, 0.3);
    border-color: rgba(34, 197, 94, 0.6);
  }

  .display-content {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  .display-content::-webkit-scrollbar {
    width: 8px;
  }

  .display-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .display-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .display-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .display-header {
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
    }
  }
</style>
