<script lang="ts">
  import type { ArrowDebugState } from "../../types/ArrowDebugTypes";
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

  const stepNumber = 2;
  const stepStatus = $derived(getStepStatus(stepNumber, state.currentStep));
  const isVisible = $derived(isStepVisible(stepNumber, state));
</script>

{#if isVisible}
  <DebugSection
    sectionId="initial_position"
    title="🎯 Step 2: Initial Position"
    {state}
    {stepNumber}
    {stepStatus}
  >
    {#snippet children()}
      {#if state.currentDebugData.coordinateSystemDebugInfo}
        <div class="coordinate-system-info">
          <h4>🗺️ Coordinate System Info</h4>
          <div class="debug-grid">
            <div class="debug-item">
              <span class="label">Scene Center:</span>
              <span class="value">
                {formatPoint(
                  state.currentDebugData.coordinateSystemDebugInfo.sceneCenter
                )}
              </span>
            </div>
            <div class="debug-item">
              <span class="label">Scene Size:</span>
              <span class="value">
                {state.currentDebugData.coordinateSystemDebugInfo
                  .sceneDimensions[0]}×{state.currentDebugData
                  .coordinateSystemDebugInfo.sceneDimensions[1]}
              </span>
            </div>
            <div class="debug-item">
              <span class="label">Coordinate System:</span>
              <span class="value">
                {state.currentDebugData.coordinateSystemDebugInfo
                  .coordinateSystemType}
              </span>
            </div>
            <div class="debug-item">
              <span class="label">Used Coordinate Set:</span>
              <span class="value">
                {state.currentDebugData.coordinateSystemDebugInfo
                  .usedCoordinateSet}
              </span>
            </div>
          </div>
        </div>
      {/if}

      <div class="result-box">
        <span class="result-label">Initial Position:</span>
        <span class="result-value">
          {formatPoint(state.currentDebugData.initialPosition) ||
            "Not calculated"}
        </span>
      </div>

      {#if state.currentDebugData.timing?.stepDurations.initialPosition}
        <div class="timing-info">
          Time: {state.currentDebugData.timing.stepDurations.initialPosition.toFixed(
            2
          )}ms
        </div>
      {/if}
    {/snippet}
  </DebugSection>
{/if}

<style>
  .coordinate-system-info h4 {
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
