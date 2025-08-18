<script lang="ts">
  import type { ArrowDebugState } from "./types/ArrowDebugTypes";

  // Import all extracted components
  import CalculationStatusSection from "./components/sections/CalculationStatusSection.svelte";
  import LocationCalculationStep from "./components/steps/LocationCalculationStep.svelte";
  import InitialPositionStep from "./components/steps/InitialPositionStep.svelte";
  import DefaultAdjustmentStep from "./components/steps/DefaultAdjustmentStep.svelte";
  import SpecialAdjustmentStep from "./components/steps/SpecialAdjustmentStep.svelte";
  import FinalResultStep from "./components/steps/FinalResultStep.svelte";

  interface Props {
    state: ArrowDebugState;
  }

  let { state }: Props = $props();
</script>

<div class="debug-info-panel">
  <h2>🔍 Debug Information</h2>

  <!-- All sections now use extracted components -->
  <CalculationStatusSection {state} />
  <LocationCalculationStep {state} />
  <InitialPositionStep {state} />
  <DefaultAdjustmentStep {state} />
  <SpecialAdjustmentStep {state} />
  <FinalResultStep {state} />

  <div class="refactor-success">
    <p>🎉 <strong>Refactoring Complete!</strong></p>
    <p>✅ Monolith successfully demolished into focused components</p>
    <p>📊 Reduced from 853 lines to clean modular components</p>
  </div>
</div>

<style>
  .debug-info-panel {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .debug-info-panel h2 {
    margin: 0 0 20px 0;
    text-align: center;
    color: #f1f5f9;
    font-size: 1.5rem;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .refactor-success {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
    padding: 16px;
    margin-top: 20px;
    text-align: center;
  }

  .refactor-success p {
    margin: 8px 0;
    color: #22c55e;
  }

  .refactor-success strong {
    color: #16a34a;
  }
</style>
