<script lang="ts">
  import DebugSection from './DebugSection.svelte';
  import DebugDataGrid from './DebugDataGrid.svelte';
  import { getStepStatus, isStepVisible } from './stepManager';
  import type { ArrowDebugState } from '../../../routes/arrow-debug/state/arrow-debug-state.svelte';

  interface Props {
    state: ArrowDebugState;
  }

  let { state }: Props = $props();

  // Computed properties for this specific section
  const stepNumber = 1;
  const sectionKey = "location_calc";
  
  const stepStatus = $derived(getStepStatus(stepNumber, state.currentStep));
  const visible = $derived(isStepVisible(stepNumber, state.currentStep, state.stepByStepMode));
  const expanded = $derived(state.expandedSections.has(sectionKey));
  const debugInfo = $derived(state.currentDebugData.locationDebugInfo);
  const calculatedLocation = $derived(state.currentDebugData.calculatedLocation);

  // Debug data items for the grid
  const debugItems = $derived(() => {
    const info = debugInfo;
    if (!info) return [];
    
    return [
      { label: "Motion Type", value: info.motionType, type: 'text' as const },
      { label: "Start Orientation", value: info.startOri, type: 'text' as const },
      { label: "End Orientation", value: info.endOri, type: 'text' as const },
      { label: "Calculation Method", value: info.calculationMethod, type: 'text' as const },
    ].filter(item => item.value !== undefined && item.value !== null);
  });

  function handleToggle() {
    state.toggleSection(sectionKey);
  }
</script>

<DebugSection
  title="Location Calculation"
  {stepNumber}
  status={stepStatus}
  icon="📍"
  isExpanded={expanded}
  isVisible={visible}
  onToggle={handleToggle}
>
  {#if debugInfo}
    <DebugDataGrid items={debugItems()} />
    
    <!-- Calculated location result -->
    <div class="result-section">
      <div class="result-box">
        <span class="result-label">Calculated Location:</span>
        <span class="result-value location">
          {calculatedLocation || "Not calculated"}
        </span>
      </div>
    </div>

    <!-- Timing information if available -->
    {#if state.currentDebugData.timing?.stepDurations.location}
      <div class="timing-info">
        <span class="timing-label">⏱️ Execution Time:</span>
        <span class="timing-value">
          {state.currentDebugData.timing.stepDurations.location.toFixed(2)}ms
        </span>
      </div>
    {/if}
  {:else}
    <div class="no-data">
      <p>⚠️ No location debug information available</p>
    </div>
  {/if}
</DebugSection>

<style>
  .result-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .result-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .result-label {
    color: #22c55e;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .result-value {
    font-family: "Courier New", monospace;
    font-weight: 700;
    font-size: 1rem;
  }

  .result-value.location {
    color: #fbbf24;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .timing-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    font-size: 0.85rem;
  }

  .timing-label {
    color: #94a3b8;
  }

  .timing-value {
    color: #60a5fa;
    font-family: "Courier New", monospace;
    font-weight: 600;
  }

  .no-data {
    text-align: center;
    padding: 20px;
    color: #94a3b8;
    font-style: italic;
  }
</style>
