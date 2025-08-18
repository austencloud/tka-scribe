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

  const stepNumber = 4;
  const stepStatus = $derived(getStepStatus(stepNumber, state.currentStep));
  const isVisible = $derived(isStepVisible(stepNumber, state));
</script>

{#if isVisible}
  <DebugSection
    sectionId="special_adjustment"
    title="✨ Step 4: Special Adjustment"
    {state}
    {stepNumber}
    {stepStatus}
  >
    {#snippet children()}
      {#if state.currentDebugData.specialAdjustmentDebugInfo}
        <div class="special-adjustment-info">
          <h4>✨ Special Adjustment Details</h4>
          <div class="debug-grid">
            <div class="debug-item">
              <span class="label">Letter:</span>
              <span class="value">
                {state.currentDebugData.specialAdjustmentDebugInfo.letter}
              </span>
            </div>
            <div class="debug-item">
              <span class="label">Orientation Key:</span>
              <span class="value">
                {state.currentDebugData.specialAdjustmentDebugInfo.oriKey}
              </span>
            </div>
            <div class="debug-item">
              <span class="label">Special Placement Found:</span>
              <span
                class="value {state.currentDebugData.specialAdjustmentDebugInfo
                  .specialPlacementFound
                  ? 'applied'
                  : 'not-applied'}"
              >
                {state.currentDebugData.specialAdjustmentDebugInfo
                  .specialPlacementFound
                  ? "✅ Yes"
                  : "❌ No"}
              </span>
            </div>
            <div class="debug-item">
              <span class="label">Adjustment Source:</span>
              <span class="value">
                {state.currentDebugData.specialAdjustmentDebugInfo
                  .adjustmentSource}
              </span>
            </div>
          </div>
        </div>
      {:else}
        <div class="no-special-adjustment">
          <p>No special adjustment data available</p>
        </div>
      {/if}

      <div class="result-box">
        <span class="result-label">Final Position:</span>
        <span class="result-value">
          {formatPoint(state.currentDebugData.finalPosition) ||
            "Not calculated"}
        </span>
      </div>

      {#if state.currentDebugData.timing?.stepDurations.specialAdjustment}
        <div class="timing-info">
          Time: {state.currentDebugData.timing.stepDurations.specialAdjustment.toFixed(
            2
          )}ms
        </div>
      {/if}
    {/snippet}
  </DebugSection>
{/if}

<style>
  .special-adjustment-info h4 {
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

  .value.applied {
    color: #22c55e;
  }

  .value.not-applied {
    color: #94a3b8;
  }

  .no-special-adjustment {
    background: rgba(71, 85, 105, 0.3);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 6px;
    padding: 12px;
    text-align: center;
    color: #94a3b8;
    font-style: italic;
  }

  .result-box {
    background: rgba(236, 72, 153, 0.1);
    border: 1px solid rgba(236, 72, 153, 0.3);
    border-radius: 6px;
    padding: 12px;
    margin: 12px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .result-label {
    color: #ec4899;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .result-value {
    color: #f9a8d4;
    font-family: "Courier New", monospace;
    font-size: 1rem;
    font-weight: 600;
  }

  .timing-info {
    color: #94a3b8;
    font-size: 0.8rem;
    text-align: right;
    margin-top: 8px;
    font-style: italic;
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
