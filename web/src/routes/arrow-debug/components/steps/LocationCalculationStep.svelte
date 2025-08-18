<script lang="ts">
  import type { ArrowDebugState } from "../../types/ArrowDebugTypes";
  import {
    getStepStatus,
    isStepVisible,
  } from "../../utils/debug-step-utils.js";
  import DebugSection from "../shared/DebugSection.svelte";

  interface Props {
    state: ArrowDebugState;
  }

  let { state }: Props = $props();

  const stepNumber = 1;
  const stepStatus = $derived(getStepStatus(stepNumber, state.currentStep));
  const isVisible = $derived(isStepVisible(stepNumber, state));
</script>

{#if isVisible}
  <DebugSection
    sectionId="location_calc"
    title="📍 Step 1: Location Calculation"
    {state}
    {stepNumber}
    {stepStatus}
  >
    {#snippet children()}
      {#if state.currentDebugData.locationDebugInfo}
        <div class="debug-grid">
          <div class="debug-item">
            <span class="label">Motion Type:</span>
            <span class="value">
              {state.currentDebugData.locationDebugInfo.motionType}
            </span>
          </div>
          <div class="debug-item">
            <span class="label">Start Orientation:</span>
            <span class="value">
              {state.currentDebugData.locationDebugInfo.startOri}
            </span>
          </div>
          <div class="debug-item">
            <span class="label">End Orientation:</span>
            <span class="value">
              {state.currentDebugData.locationDebugInfo.endOri}
            </span>
          </div>
          <div class="debug-item">
            <span class="label">Calculation Method:</span>
            <span class="value">
              {state.currentDebugData.locationDebugInfo.calculationMethod}
            </span>
          </div>
        </div>
      {/if}

      <div class="result-box">
        <span class="result-label">Calculated Location:</span>
        <span class="result-value location">
          {state.currentDebugData.calculatedLocation || "Not calculated"}
        </span>
      </div>

      {#if state.currentDebugData.timing?.stepDurations.location}
        <div class="timing-info">
          Time: {state.currentDebugData.timing.stepDurations.location.toFixed(
            2
          )}ms
        </div>
      {/if}
    {/snippet}
  </DebugSection>
{/if}

<style>
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

  .result-box {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 6px;
    padding: 12px;
    margin: 12px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .result-label {
    color: #60a5fa;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .result-value {
    color: #93c5fd;
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
