<script lang="ts">
  import { onMount } from 'svelte';
  import { workbenchService } from '$lib/services/WorkbenchService.svelte';
  import { sequenceStateService } from '$lib/services/SequenceStateService.svelte';
  import { beatFrameService } from '$lib/services/BeatFrameService.svelte';
  import BeatFrame from './BeatFrame.svelte';

  // Reactive state from services
  const isInitialized = $derived(workbenchService.isInitialized);
  const currentSequence = $derived(workbenchService.currentSequence);
  const selectedBeat = $derived(workbenchService.selectedBeat);
  const selectedBeatIndex = $derived(sequenceStateService.selectedBeatIndex);
  const mode = $derived(workbenchService.mode);

  // Initialize on mount
  onMount(() => {
    workbenchService.initialize();
  });

  function handleBeatClick(index: number) {
    workbenchService.handleBeatClick(index);
  }

  function handleBeatDoubleClick(index: number) {
    workbenchService.handleBeatDoubleClick(index);
  }

  function handleNewSequence() {
    workbenchService.createNewSequence('New Sequence', 16);
  }

  function handleClearSelected() {
    if (selectedBeatIndex >= 0) {
      workbenchService.clearBeat(selectedBeatIndex);
    }
  }

  function handleGridModeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    workbenchService.setGridMode(target.value as 'diamond' | 'box');
  }
</script>

<div class="workbench">
  <div class="workbench-header">
    <h2>Sequence Workbench</h2>
    <div class="workbench-controls">
      <button class="btn btn-primary" onclick={handleNewSequence}>
        New Sequence
      </button>
      {#if selectedBeat != null}
        <button class="btn btn-warning" onclick={handleClearSelected}>
          Clear Beat {selectedBeatIndex + 1}
        </button>
      {/if}
    </div>
  </div>

  <div class="workbench-toolbar">
    <div class="toolbar-section">
      <label for="grid-mode">Grid Mode:</label>
      <select id="grid-mode" onchange={handleGridModeChange}>
        <option value="diamond">Diamond</option>
        <option value="box">Box</option>
      </select>
    </div>
    
    <div class="toolbar-section">
      <span class="mode-indicator">Mode: {mode}</span>
    </div>
    
    {#if currentSequence}
      <div class="toolbar-section">
        <span class="sequence-info">
          {currentSequence?.name} ({currentSequence?.beats.length} beats)
        </span>
      </div>
    {/if}
  </div>

  {#if !isInitialized}
    <div class="loading-state">
      <p>Initializing workbench...</p>
    </div>
  {:else if !currentSequence}
    <div class="empty-state">
      <p>No sequence loaded</p>
      <button class="btn btn-primary" onclick={handleNewSequence}>
        Create New Sequence
      </button>
    </div>
  {:else}
    <div class="workbench-content">
      <BeatFrame
        beats={currentSequence?.beats ?? []}
        selectedBeatIndex={selectedBeatIndex}
        onBeatClick={handleBeatClick}
        onBeatDoubleClick={handleBeatDoubleClick}
      />
      
      {#if selectedBeat != null}
        <div class="beat-details">
          <h3>Beat {selectedBeatIndex + 1} Details</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Letter:</span>
              <span class="value">{selectedBeat?.pictograph_data?.letter ?? 'None'}</span>
            </div>
            <div class="detail-item">
              <span class="label">Duration:</span>
              <span class="value">{selectedBeat?.duration}</span>
            </div>
            <div class="detail-item">
              <span class="label">Type:</span>
              <span class="value">{selectedBeat?.is_blank ? 'Blank' : 'Pictograph'}</span>
            </div>
            <div class="detail-item">
              <span class="label">Reversals:</span>
              <span class="value">
                {#if selectedBeat?.blue_reversal || selectedBeat?.red_reversal}
                  {selectedBeat?.blue_reversal ? 'Blue ' : ''}{selectedBeat?.red_reversal ? 'Red' : ''}
                {:else}
                  None
                {/if}
              </span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .workbench {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 1200px;
    margin: 0 auto;
  }

  .workbench-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 2px solid #e9ecef;
  }

  .workbench-header h2 {
    margin: 0;
    color: #495057;
    font-weight: 600;
  }

  .workbench-controls {
    display: flex;
    gap: 8px;
  }

  .workbench-toolbar {
    display: flex;
    gap: 24px;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 8px;
    font-size: 14px;
  }

  .toolbar-section {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toolbar-section label {
    font-weight: 500;
    color: #495057;
  }

  .toolbar-section select {
    padding: 4px 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    background: white;
  }

  .mode-indicator {
    padding: 4px 12px;
    background: #007bff;
    color: white;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
  }

  .sequence-info {
    color: #6c757d;
    font-style: italic;
  }

  .workbench-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .loading-state,
  .empty-state {
    text-align: center;
    padding: 48px 24px;
    color: #6c757d;
  }

  .empty-state p {
    margin-bottom: 16px;
    font-size: 18px;
  }

  .beat-details {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
  }

  .beat-details h3 {
    margin: 0 0 12px 0;
    color: #495057;
    font-size: 16px;
    font-weight: 600;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: white;
    border-radius: 4px;
    border: 1px solid #dee2e6;
  }

  .detail-item .label {
    font-weight: 500;
    color: #495057;
  }

  .detail-item .value {
    color: #007bff;
    font-weight: 600;
  }

  /* Button styles */
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }

  .btn-primary:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .btn-warning {
    background: #ffc107;
    color: #212529;
  }

  .btn-warning:hover {
    background: #e0a800;
    transform: translateY(-1px);
  }
</style>
