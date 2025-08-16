<!-- Batch Summary Display Component -->
<script lang="ts">
  import SequenceRankings from "./shared/SequenceRankings.svelte";

  interface BatchSummary {
    sequencesAnalyzed: number;
    healthySequences: number;
    unhealthySequences: number;
    averageHealthScore: number;
    totalErrors: number;
    totalWarnings: number;
    commonErrors: Array<[string, number]>;
    commonWarnings: Array<[string, number]>;
    worstSequences: Array<{ sequence: string; healthScore: number }>;
    bestSequences: Array<{ sequence: string; healthScore: number }>;
  }

  interface Props {
    batchSummary: BatchSummary;
  }

  let { batchSummary }: Props = $props();
</script>

<div class="batch-summary">
  <h3>📊 Batch Analysis Summary</h3>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-title">Sequences Analyzed</div>
      <div class="summary-value">{batchSummary.sequencesAnalyzed}</div>
    </div>

    <div class="summary-card healthy">
      <div class="summary-title">Healthy Sequences</div>
      <div class="summary-value">{batchSummary.healthySequences}</div>
      <div class="summary-subtitle">
        ({Math.round(
          (batchSummary.healthySequences / batchSummary.sequencesAnalyzed) * 100
        )}%)
      </div>
    </div>

    <div class="summary-card unhealthy">
      <div class="summary-title">Unhealthy Sequences</div>
      <div class="summary-value">{batchSummary.unhealthySequences}</div>
      <div class="summary-subtitle">
        ({Math.round(
          (batchSummary.unhealthySequences / batchSummary.sequencesAnalyzed) *
            100
        )}%)
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-title">Average Health Score</div>
      <div class="summary-value">{batchSummary.averageHealthScore}%</div>
    </div>
  </div>

  <div class="summary-sections">
    <!-- Error Summary -->
    {#if batchSummary.totalErrors > 0}
      <div class="error-summary">
        <h4>🚨 Most Common Errors ({batchSummary.totalErrors} total)</h4>
        <ul class="issue-list">
          {#each batchSummary.commonErrors as [error, count]}
            <li class="error-item">
              <span class="error-text">{error}</span>
              <span class="error-count">{count} sequences</span>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Warning Summary -->
    {#if batchSummary.totalWarnings > 0}
      <div class="warning-summary">
        <h4>⚠️ Most Common Warnings ({batchSummary.totalWarnings} total)</h4>
        <ul class="issue-list">
          {#each batchSummary.commonWarnings as [warning, count]}
            <li class="warning-item">
              <span class="warning-text">{warning}</span>
              <span class="warning-count">{count} sequences</span>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Best and Worst Sequences -->
    <SequenceRankings
      bestSequences={batchSummary.bestSequences}
      worstSequences={batchSummary.worstSequences}
    />
  </div>
</div>

<style>
  .batch-summary {
    background: rgba(29, 78, 216, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
  }

  .batch-summary h3 {
    color: #60a5fa;
    margin: 0 0 20px 0;
    font-size: 1.4rem;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .summary-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 16px;
    text-align: center;
  }

  .summary-card.healthy {
    border-color: rgba(34, 197, 94, 0.4);
    background: rgba(34, 197, 94, 0.1);
  }

  .summary-card.unhealthy {
    border-color: rgba(239, 68, 68, 0.4);
    background: rgba(239, 68, 68, 0.1);
  }

  .summary-title {
    font-size: 0.9rem;
    color: #9ca3af;
    margin-bottom: 8px;
  }

  .summary-value {
    font-size: 2rem;
    font-weight: bold;
    color: #f9fafb;
    margin-bottom: 4px;
  }

  .summary-subtitle {
    font-size: 0.8rem;
    color: #9ca3af;
  }

  .summary-sections {
    display: grid;
    gap: 20px;
  }

  .error-summary,
  .warning-summary {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 16px;
  }

  .warning-summary {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.3);
  }

  .error-summary h4,
  .warning-summary h4 {
    margin: 0 0 12px 0;
    color: #f9fafb;
  }

  .issue-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .error-item,
  .warning-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .error-item:last-child,
  .warning-item:last-child {
    border-bottom: none;
  }

  .error-text,
  .warning-text {
    color: #f9fafb;
  }

  .error-count,
  .warning-count {
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #9ca3af;
  }
</style>
