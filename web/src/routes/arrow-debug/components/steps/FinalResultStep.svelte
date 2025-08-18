<script lang="ts">
  import type { ArrowDebugState } from "../../state/arrow-debug-state.svelte";
  import {
    getStepStatus,
    isStepVisible,
  } from "../../utils/debug-step-utils.js";
  import { formatPoint } from "../../utils/debug-formatting.js";
  import DebugSection from "../shared/DebugSection.svelte";

  interface Props {
    state: ArrowDebugState;
  }

  let { state }: Props = $props();

  const stepNumber = 5;
  const stepStatus = $derived(getStepStatus(stepNumber, state.currentStep));
  const isVisible = $derived(isStepVisible(stepNumber, state));
</script>

{#if isVisible}
  <DebugSection
    sectionId="final_result"
    title="🎯 Step 5: Final Result"
    {state}
    {stepNumber}
    {stepStatus}
  >
    {#snippet children()}
      {#if state.currentDebugData.tupleProcessingDebugInfo}
        <div class="tuple-processing-info">
          <h4>🔄 Directional Tuple Processing</h4>
          <div class="debug-grid">
            <div class="debug-item">
              <span class="label">Base Adjustment:</span>
              <span class="value">
                {formatPoint(
                  state.currentDebugData.tupleProcessingDebugInfo.baseAdjustment
                )}
              </span>
            </div>
            <div class="debug-item">
              <span class="label">Quadrant Index:</span>
              <span class="value">
                {state.currentDebugData.tupleProcessingDebugInfo.quadrantIndex}
              </span>
            </div>
            <div class="debug-item">
              <span class="label">Selected Tuple:</span>
              <span class="value">
                [{state.currentDebugData.tupleProcessingDebugInfo.selectedTuple.join(
                  ", "
                )}]
              </span>
            </div>
            <div class="debug-item">
              <span class="label">Transformation Method:</span>
              <span class="value">
                {state.currentDebugData.tupleProcessingDebugInfo
                  .transformationMethod}
              </span>
            </div>
          </div>
        </div>
      {/if}

      <div class="final-results">
        <div class="result-box final">
          <span class="result-label">🎯 Final Position:</span>
          <span class="result-value">
            {formatPoint(state.currentDebugData.finalPosition) ||
              "Not calculated"}
          </span>
        </div>
      </div>

      {#if state.currentDebugData.timing?.totalDuration}
        <div class="timing-info">
          Total Time: {state.currentDebugData.timing.totalDuration.toFixed(2)}ms
        </div>
      {/if}
    {/snippet}
  </DebugSection>
{/if}

<style>
  .tuple-processing-info h4,
  .calculation-breakdown h4 {
    margin: 0 0 10px 0;
    color: #a78bfa;
    font-size: 0.9rem;
    border-bottom: 1px solid rgba(167, 139, 250, 0.2);
    padding-bottom: 6px;
  }

  .debug-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 12px;
  }

  .debug-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .label {
    color: #94a3b8;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .value {
    color: #e2e8f0;
    font-family: "Courier New", monospace;
    font-size: 0.9rem;
  }

  .final-results {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .result-box {
    border-radius: 6px;
    padding: 12px;
    margin: 12px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .result-box.final {
    background: rgba(34, 197, 94, 0.1);
    border: 2px solid rgba(34, 197, 94, 0.4);
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
  }

  .result-label {
    font-weight: 600;
    font-size: 1rem;
  }

  .result-box.final .result-label {
    color: #22c55e;
  }

  .result-value {
    font-family: "Courier New", monospace;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .result-box.final .result-value {
    color: #4ade80;
  }

  .calculation-breakdown {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 12px;
    margin-top: 12px;
  }

  .breakdown-step {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 0.85rem;
  }

  .breakdown-step.final-calc {
    border-top: 1px solid rgba(251, 191, 36, 0.3);
    padding-top: 6px;
    margin-top: 8px;
    font-weight: 600;
  }

  .breakdown-label {
    color: #c7d2fe;
  }

  .breakdown-value {
    color: #60a5fa;
    font-family: "Courier New", monospace;
  }

  .breakdown-step.final-calc .breakdown-value {
    color: #fbbf24;
  }

  .timing-info {
    color: #94a3b8;
    font-size: 0.8rem;
    text-align: right;
    margin-top: 8px;
    font-style: italic;
    font-weight: 600;
  }

  @media (max-width: 640px) {
    .debug-grid {
      grid-template-columns: 1fr;
    }

    .result-box {
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }
  }
</style>
