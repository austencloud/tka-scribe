<script lang="ts">
  import type { ArrowDebugState } from "../../state/arrow-debug-state.svelte";
  import { formatTimestamp } from "../../utils/debug-formatting.js";
  import DebugSection from "../shared/DebugSection.svelte";

  interface Props {
    state: ArrowDebugState;
  }

  let { state }: Props = $props();
</script>

<DebugSection
  sectionId="calculation_status"
  title="⚙️ Calculation Status"
  {state}
>
  {#snippet children()}
    <div class="status-item">
      <span class="label">Status:</span>
      <span class="value {state.isCalculating ? 'calculating' : 'idle'}">
        {state.isCalculating ? "⏳ Calculating..." : "✅ Ready"}
      </span>
    </div>

    {#if state.currentDebugData.timing}
      <div class="status-item">
        <span class="label">Total Time:</span>
        <span class="value">
          {state.currentDebugData.timing.totalDuration.toFixed(2)}ms
        </span>
      </div>
    {/if}

    {#if state.currentDebugData.errors.length > 0}
      <div class="error-list">
        <h4>❌ Errors:</h4>
        {#each state.currentDebugData.errors as error}
          <div class="error-item">
            <span class="error-step">{error.step}:</span>
            <span class="error-message">{error.error}</span>
            <span class="error-time">
              {formatTimestamp(error.timestamp)}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  {/snippet}
</DebugSection>

<style>
  .status-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }

  .label {
    color: #94a3b8;
    font-weight: 500;
  }

  .value {
    color: #e2e8f0;
    font-family: "Courier New", monospace;
  }

  .value.calculating {
    color: #fbbf24;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .value.idle {
    color: #22c55e;
  }

  .error-list {
    margin-top: 12px;
    padding: 12px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
  }

  .error-list h4 {
    margin: 0 0 8px 0;
    color: #ef4444;
    font-size: 0.9rem;
  }

  .error-item {
    margin-bottom: 6px;
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .error-step {
    color: #fbbf24;
    font-weight: 600;
  }

  .error-message {
    color: #fca5a5;
    margin-left: 8px;
  }

  .error-time {
    color: #94a3b8;
    font-size: 0.75rem;
    margin-left: 8px;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
