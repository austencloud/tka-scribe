<script lang="ts">
  import OptionViewer from "$lib/features/create/construct/option-picker/option-viewer/components/OptionViewer.svelte";
  import type { IStartPositionService } from "$lib/features/create/construct/start-position-picker/services/contracts/IStartPositionService";
import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import { getContainer } from "$lib/shared/inversify/di";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

  // Use real services to load actual pictograph data
  let currentSequence = $state<PictographData[]>([]);
  let isFilterPanelOpen = $state(false);
  let isContinuousOnly = $state(false);
  let isLoading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      // Wait for the DI container to be ready
      const container = await getContainer();
      if (!container) {
        throw new Error("Failed to initialize DI container");
      }

      // Get the start position service to load a real starting pictograph
      const startPositionService = container.get<IStartPositionService>(
        TYPES.IStartPositionService
      );

      // Load start positions for box mode
      const startPositions =
        await startPositionService.getAllStartPositionVariations(GridMode.BOX);

      if (startPositions && startPositions.length > 0) {
        // Use the first start position (alpha2 in box mode)
        const firstPosition = startPositions[0];
        if (!firstPosition) {
          throw new Error("First start position is undefined");
        }
        currentSequence = [firstPosition];
        isLoading = false;
      } else {
        error = "No start positions available";
        isLoading = false;
      }
    } catch (err) {
      console.error("Failed to load start position:", err);
      error =
        err instanceof Error ? err.message : "Failed to load start position";
      isLoading = false;
    }
  });

  function handleOptionSelected(option: PictographData) {
    console.log("Option selected:", option);
    currentSequence = [...currentSequence, option];
  }

  function handleOpenFilters() {
    isFilterPanelOpen = true;
  }

  function handleCloseFilters() {
    isFilterPanelOpen = false;
  }

  function handleToggleContinuous(value: boolean) {
    isContinuousOnly = value;
  }

  function isSideBySideLayout() {
    return true; // Force side-by-side layout to see grid mode
  }
</script>

<div class="test-page">
  <div class="option-picker-header">
    <h1>🔬 Option Picker Test Page</h1>
    <p class="description">
      Testing section headers for Types 1-6 in grid layout mode
    </p>
    <div class="info-box">
      <h3>What to Check:</h3>
      <ul>
        <li>
          ✅ Type 1 header should show: <strong>"Type 1 - Dual-Shift"</strong>
        </li>
        <li>✅ Type 2 header should show: <strong>"Type 2 - Shift"</strong></li>
        <li>
          ✅ Type 3 header should show: <strong>"Type 3 - Cross-Shift"</strong>
        </li>
        <li>🔍 Type 4 header should show: <strong>"Type 4 - Dash"</strong></li>
        <li>
          🔍 Type 5 header should show: <strong>"Type 5 - Dual-Dash"</strong>
        </li>
        <li>
          🔍 Type 6 header should show: <strong>"Type 6 - Static"</strong>
        </li>
      </ul>
    </div>
  </div>

  <div class="option-picker-wrapper">
    {#if isLoading}
      <div class="loading">
        <h2>Loading start position...</h2>
        <p>Initializing services and loading pictograph data...</p>
      </div>
    {:else if error}
      <div class="error">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
      </div>
    {:else if currentSequence.length > 0}
      <OptionViewer
        onOptionSelected={handleOptionSelected}
        {currentSequence}
        currentGridMode={GridMode.BOX}
        isUndoingOption={false}
        {isSideBySideLayout}
        onOpenFilters={handleOpenFilters}
        onCloseFilters={handleCloseFilters}
        {isContinuousOnly}
        {isFilterPanelOpen}
        onToggleContinuous={handleToggleContinuous}
      />
    {/if}
  </div>

  <div class="debug-info">
    <h3>Debug Info:</h3>
    <p><strong>Loading:</strong> {isLoading}</p>
    <p><strong>Error:</strong> {error || "None"}</p>
    <p><strong>Current Sequence Length:</strong> {currentSequence.length}</p>
    <p>
      <strong>Start Position:</strong>
      {currentSequence[0]?.startPosition || "N/A"}
    </p>
    <p><strong>Filter Panel Open:</strong> {isFilterPanelOpen}</p>
    <p><strong>Continuous Only:</strong> {isContinuousOnly}</p>
    <p><strong>Grid Mode:</strong> box</p>
  </div>
</div>

<style>
  .test-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
    color: white;
  }

  .option-picker-header {
    margin-bottom: 2rem;
    text-align: center;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .description {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 1.5rem;
  }

  .info-box {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 0 auto;
    max-width: 600px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .info-box h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }

  .info-box ul {
    list-style: none;
    padding: 0;
    text-align: left;
  }

  .info-box li {
    padding: 0.5rem 0;
    font-size: 1.1rem;
  }

  .option-picker-wrapper {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    min-height: 800px;
  }

  .debug-info {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 2rem auto 0;
    max-width: 600px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .debug-info h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .debug-info p {
    margin: 0.5rem 0;
    font-family: monospace;
  }

  .loading,
  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: #333;
  }

  .loading h2,
  .error h2 {
    color: #333;
    margin-bottom: 1rem;
  }

  .error {
    color: #dc2626;
  }

  .error h2 {
    color: #dc2626;
  }
</style>
