<script lang="ts">
  import DebugSection from "./DebugSection.svelte";
  import DebugDataGrid from "./DebugDataGrid.svelte";
  import LocationDebugSection from "./LocationDebugSection.svelte";
  import type { ArrowDebugState } from "../../../routes/arrow-debug/state/arrow-debug-state.svelte";
  interface Props {
    state: ArrowDebugState;
  }
  let { state }: Props = $props();
</script>

<div class="debug-info-panel">
  <h2>🔍 Debug Information</h2>
  <!-- Status Section -->
  <DebugSection
    title="Calculation Status"
    icon="📊"
    isExpanded={state.expandedSections.has("calculation_status")}
    onToggle={() => state.toggleSection("calculation_status")}
  >
    <DebugDataGrid
      items={[
        { label: "Current Step", value: state.currentStep, type: "number" },
        {
          label: "Mode",
          value: state.stepByStepMode ? "Step-by-step" : "Full",
          type: "text",
        },
      ]}
    />
  </DebugSection>
  <!-- Location Debug Section -->
  <LocationDebugSection {state} />
</div>

<style>
  .debug-info-panel {
    padding: 20px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    color: #e2e8f0;
  }
  h2 {
    margin: 0 0 20px 0;
    color: #e2e8f0;
    font-size: 1.25rem;
    font-weight: 600;
  }
</style>
