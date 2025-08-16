<!-- Issues Panel Component -->
<script lang="ts">
  interface IssueStats {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
    // Error fields
    authorMissing: boolean;
    levelMissing: boolean;
    levelZero: boolean;
    startPositionMissing: boolean;
    missingLetters: number[];
    missingMotionData: number[];
    missingRequiredFields: Array<{ beat: number; field: string }>;
    // Warning fields
    authorInconsistent: boolean;
    levelInconsistent: boolean;
    startPositionInconsistent: boolean;
    duplicateBeats: number[];
    invalidMotionTypes: Array<{ beat: number; prop: string; type: string }>;
  }

  interface Props {
    stats: IssueStats;
  }

  let { stats }: Props = $props();
</script>

{#if stats.hasErrors || stats.hasWarnings}
  <div class="issues-section">
    <h3>🚨 Issues Found</h3>

    {#if stats.hasErrors}
      <div class="errors-panel">
        <h4>❌ Critical Errors ({stats.errorCount})</h4>
        <ul class="issue-list">
          {#if stats.authorMissing}
            <li class="error-item">
              Missing author information - required for Browse tab filtering
            </li>
          {/if}
          {#if stats.levelMissing}
            <li class="error-item">
              Missing difficulty level - affects sequence sorting
            </li>
          {/if}
          {#if stats.levelZero}
            <li class="error-item">
              Level is 0 - indicates difficulty calculation needed
            </li>
          {/if}
          {#if stats.startPositionMissing}
            <li class="error-item">
              Missing start position - affects sequence validation
            </li>
          {/if}
          {#if stats.missingLetters.length > 0}
            <li class="error-item">
              Missing beat letters in beats: {stats.missingLetters.join(", ")}
            </li>
          {/if}
          {#if stats.missingMotionData.length > 0}
            <li class="error-item">
              Missing motion data in beats: {stats.missingMotionData.join(", ")}
            </li>
          {/if}
          {#if stats.missingRequiredFields.length > 0}
            <li class="error-item">
              Missing required fields ({stats.missingRequiredFields.length} instances)
            </li>
          {/if}
        </ul>
      </div>
    {/if}

    {#if stats.hasWarnings}
      <div class="warnings-panel">
        <h4>⚠️ Warnings ({stats.warningCount})</h4>
        <ul class="issue-list">
          {#if stats.authorInconsistent}
            <li class="warning-item">
              Author information is inconsistent across beats
            </li>
          {/if}
          {#if stats.levelInconsistent}
            <li class="warning-item">
              Level information is inconsistent across beats
            </li>
          {/if}
          {#if stats.startPositionInconsistent}
            <li class="warning-item">
              Multiple different start positions found
            </li>
          {/if}
          {#if stats.duplicateBeats.length > 0}
            <li class="warning-item">
              Duplicate beat numbers detected: {stats.duplicateBeats.join(", ")}
            </li>
          {/if}
          {#if stats.invalidMotionTypes.length > 0}
            <li class="warning-item">
              {stats.invalidMotionTypes.length} invalid motion types found
            </li>
          {/if}
        </ul>
      </div>
    {/if}
  </div>
{:else}
  <div class="success-panel">
    <h3>✅ All Checks Passed</h3>
    <p>This sequence has excellent metadata quality with no detected issues!</p>
  </div>
{/if}

<style>
  .issues-section {
    margin-bottom: 20px;
  }

  .issues-section h3 {
    margin: 0 0 15px 0;
    color: #f87171;
    font-size: 1.1rem;
  }

  .errors-panel,
  .warnings-panel {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
  }

  .warnings-panel {
    background: rgba(251, 191, 36, 0.1);
    border-color: rgba(251, 191, 36, 0.2);
  }

  .errors-panel h4,
  .warnings-panel h4 {
    margin: 0 0 10px 0;
    font-size: 1rem;
  }

  .errors-panel h4 {
    color: #f87171;
  }

  .warnings-panel h4 {
    color: #fbbf24;
  }

  .issue-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .error-item,
  .warning-item {
    padding: 6px 0;
    font-size: 0.9rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .error-item:last-child,
  .warning-item:last-child {
    border-bottom: none;
  }

  .error-item {
    color: #fca5a5;
  }

  .warning-item {
    color: #fcd34d;
  }

  .success-panel {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    margin-bottom: 20px;
  }

  .success-panel h3 {
    margin: 0 0 10px 0;
    color: #22c55e;
    font-size: 1.1rem;
  }

  .success-panel p {
    margin: 0;
    opacity: 0.9;
  }
</style>
