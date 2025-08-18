<!-- Modern Metadata Display Component - Clean Orchestrator -->
<script lang="ts">
  import type { MetadataTestingStateManager } from "$lib/services/metadata-testing";
  import LoadingStates from "./display/shared/LoadingStates.svelte";
  import EmptyState from "./display/shared/EmptyState.svelte";
  import ErrorState from "./display/shared/ErrorState.svelte";
  import BatchSummaryDisplay from "./display/BatchSummaryDisplay.svelte";
  import IndividualSequenceDisplay from "./display/IndividualSequenceDisplay.svelte";

  interface Props {
    state: MetadataTestingStateManager;
  }

  let { state }: Props = $props();

  // Transform BatchAnalysisResult to BatchSummary format
  const transformedBatchSummary = $derived(() => {
    if (!state.state.batchResults) return null;

    const batchResults = state.state.batchResults;
    return {
      sequencesAnalyzed: batchResults.totalSequences,
      healthySequences: batchResults.successfulAnalyses,
      unhealthySequences: batchResults.failedAnalyses,
      averageHealthScore: batchResults.summary.averageHealthScore,
      totalErrors: batchResults.summary.totalErrors,
      totalWarnings: batchResults.summary.totalWarnings,
      commonErrors: batchResults.summary.commonIssues
        .filter((issue) => issue.issue.includes("error"))
        .map((issue) => [issue.issue, issue.count] as [string, number]),
      commonWarnings: batchResults.summary.commonIssues
        .filter((issue) => issue.issue.includes("warning"))
        .map((issue) => [issue.issue, issue.count] as [string, number]),
      worstSequences: batchResults.results
        .sort((a, b) => a.stats.healthScore - b.stats.healthScore)
        .slice(0, 5)
        .map((result) => ({
          sequence: result.sequenceName,
          healthScore: result.stats.healthScore,
        })),
      bestSequences: batchResults.results
        .sort((a, b) => b.stats.healthScore - a.stats.healthScore)
        .slice(0, 5)
        .map((result) => ({
          sequence: result.sequenceName,
          healthScore: result.stats.healthScore,
        })),
    };
  });

  // Copy metadata to clipboard
  async function copyToClipboard() {
    if (!state.state.currentAnalysis?.stats) return;

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(state.state.currentAnalysis.stats, null, 2)
      );
      // Could emit an event here for toast notification
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }
</script>

<div class="metadata-display">
  <div class="display-header">
    <h2>📊 Metadata Analysis</h2>
    {#if state.state.currentAnalysis?.stats}
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
    {#if state.state.isAnalyzing}
      <LoadingStates type="batch" />
    {:else if state.state.isAnalyzing}
      <LoadingStates type="extraction" />
    {:else if state.state.error}
      <ErrorState error={state.state.error} />
    {:else if state.state.selectedThumbnails.length === 0 && !state.state.batchResults}
      <EmptyState />
    {:else if state.state.batchResults && transformedBatchSummary()}
      <!-- Batch Analysis Results -->
      <BatchSummaryDisplay batchSummary={transformedBatchSummary()!} />
    {:else if state.state.currentAnalysis?.stats}
      <!-- Individual Sequence Analysis -->
      <IndividualSequenceDisplay
        stats={state.state.currentAnalysis.stats}
        selectedThumbnail={state.selectedThumbnail}
        extractedMetadata={null}
        rawMetadata={state.state.currentAnalysis
          ? JSON.stringify(state.state.currentAnalysis.stats, null, 2)
          : ""}
      />
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
