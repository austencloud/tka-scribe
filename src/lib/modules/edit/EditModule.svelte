<!--
  EditModule.svelte - Sequence Editing Module

  A dedicated workspace for refining and transforming sequences.

  Modes:
  - Beat: Edit individual pictographs (turns, rotation, motion type)
  - Sequence: Apply transformations to entire sequences (mirror, rotate, swap, reverse)

  Sequences can arrive here from:
  - Create module (editing a sequence being built)
  - Discover module (editing a sequence from gallery)
  - Deep link (editing a shared sequence)
-->
<script lang="ts">
import { navigationState } from "$shared/navigation/state/navigation-state.svelte";
import { resolve } from "$shared/inversify";
import { TYPES } from "$shared/inversify/types";
import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";
  import { onMount } from "svelte";
  import { createEditModuleState, type EditMode } from "./state/edit-module-state.svelte";
  import type { ISequenceTransformationService } from "$create/shared/services/contracts";
  import type { IDiscoverLoader } from "../discover";
  import BeatEditPanel from "./components/BeatEditPanel.svelte";
  import SequenceEditPanel from "./components/SequenceEditPanel.svelte";
  import EditWorkspace from "./components/EditWorkspace.svelte";
  import EmptyEditState from "./components/EmptyEditState.svelte";
  import SequenceBrowserPanel from "../animate/shared/components/SequenceBrowserPanel.svelte";

  // Create module state
  const editState = createEditModuleState();

  // Services
  let transformService: ISequenceTransformationService | null = null;
  let exploreLoader: IDiscoverLoader | null = null;

  // Sequence browser state
  let isSequenceBrowserOpen = $state(false);
  let isLoadingFullSequence = $state(false);

  function openSequenceBrowser() {
    isSequenceBrowserOpen = true;
  }

  function closeSequenceBrowser() {
    isSequenceBrowserOpen = false;
  }

  async function handleSequenceSelect(sequenceMetadata: SequenceData) {
    // The browser returns lightweight metadata without beats
    // We need to load the full sequence data
    if (!exploreLoader) {
      console.error("EditModule: DiscoverLoader not available");
      return;
    }

    isLoadingFullSequence = true;
    closeSequenceBrowser();

    try {
      const sequenceName = sequenceMetadata.name || sequenceMetadata.id;
      console.log(`EditModule: Loading full sequence data for "${sequenceName}"...`);

      const fullSequence = await exploreLoader.loadFullSequenceData(sequenceName);

      if (fullSequence) {
        console.log(`EditModule: Loaded full sequence with ${fullSequence.beats?.length ?? 0} beats`);
        editState.loadSequence(fullSequence, { module: "browser" });
      } else {
        console.error(`EditModule: Could not load full sequence for "${sequenceName}"`);
      }
    } catch (error) {
      console.error("EditModule: Failed to load full sequence:", error);
    } finally {
      isLoadingFullSequence = false;
    }
  }

  // Initialize on mount
  onMount(() => {
    console.log("EditModule: Mounted");

    try {
      transformService = resolve<ISequenceTransformationService>(TYPES.ISequenceTransformationService);
      console.log("EditModule: Resolved transformation service");
    } catch (error) {
      console.warn("Failed to resolve ISequenceTransformationService:", error);
    }

    try {
      exploreLoader = resolve<IDiscoverLoader>(TYPES.IDiscoverLoader);
      console.log("EditModule: Resolved explore loader");
    } catch (error) {
      console.warn("Failed to resolve IDiscoverLoader:", error);
    }

    // Set the default tab for the edit module
    navigationState.setActiveTab("edit");
  });

  /**
   * Transformation handlers that use the resolved service
   */
  function handleMirror(): SequenceData | null {
    const sequence = editState.editingSequence;
    if (!sequence || !transformService) return null;
    return transformService.mirrorSequence(sequence);
  }

  function handleRotate(direction: "cw" | "ccw"): SequenceData | null {
    const sequence = editState.editingSequence;
    if (!sequence || !transformService) return null;
    // Rotate 45 degrees (one step)
    const amount = direction === "cw" ? 1 : -1;
    return transformService.rotateSequence(sequence, amount);
  }

  function handleSwapColors(): SequenceData | null {
    const sequence = editState.editingSequence;
    if (!sequence || !transformService) return null;
    return transformService.swapColors(sequence);
  }

  async function handleReverse(): Promise<SequenceData | null> {
    const sequence = editState.editingSequence;
    if (!sequence || !transformService) return null;
    return await transformService.reverseSequence(sequence);
  }

  // Derived state
  const hasSequence = $derived(editState.hasSequence);
  const currentMode = $derived(editState.currentMode);
</script>

<div class="edit-module">
  {#if isLoadingFullSequence}
    <!-- Loading full sequence data -->
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading sequence...</p>
    </div>
  {:else if !hasSequence}
    <!-- No sequence loaded - show empty state -->
    <EmptyEditState
      onLoadSequence={(seq) => editState.loadSequence(seq)}
      onBrowseSequences={openSequenceBrowser}
    />
  {:else}
    <!-- Main editing interface -->
    <div class="edit-layout">
      <!-- Workspace: Shows the sequence being edited -->
      <div class="workspace-area">
        <EditWorkspace
          sequence={editState.editingSequence}
          selectedBeatNumber={editState.selectedBeatNumber}
          selectedBeatNumbers={editState.selectedBeatNumbers}
          onBeatSelect={(beatNumber, beatData) => editState.selectBeat(beatNumber, beatData)}
          onBeatMultiSelect={(beatNumber) => editState.toggleBeatInMultiSelect(beatNumber)}
          onChangeSequence={openSequenceBrowser}
        />
      </div>

      <!-- Tool Panel: Edit controls based on mode -->
      <div class="tool-panel">
        <!-- Mode Toggle -->
        <div class="mode-toggle">
          <button
            class="mode-btn"
            class:active={currentMode === "beat"}
            onclick={() => editState.setCurrentMode("beat")}
            aria-label="Beat editing mode"
          >
            <i class="fas fa-pen"></i>
            <span>Beat</span>
          </button>
          <button
            class="mode-btn"
            class:active={currentMode === "sequence"}
            onclick={() => editState.setCurrentMode("sequence")}
            aria-label="Sequence transformation mode"
          >
            <i class="fas fa-layer-group"></i>
            <span>Sequence</span>
          </button>
        </div>

        <!-- Edit Controls -->
        <div class="edit-controls">
          {#if currentMode === "beat"}
            <BeatEditPanel
              selectedBeatNumber={editState.selectedBeatNumber}
              selectedBeatData={editState.selectedBeatData}
              selectedBeatNumbers={editState.selectedBeatNumbers}
              sequence={editState.editingSequence}
              onBeatUpdate={(index, updates) => editState.updateBeat(index, updates)}
              onStartPositionUpdate={(updates) => editState.updateStartPosition(updates)}
            />
          {:else if currentMode === "sequence"}
            <SequenceEditPanel
              sequence={editState.editingSequence}
              onTransform={(newSequence) => editState.transformSequence(newSequence)}
              {handleMirror}
              {handleRotate}
              {handleSwapColors}
              {handleReverse}
            />
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Sequence Browser Drawer -->
  <SequenceBrowserPanel
    mode="primary"
    show={isSequenceBrowserOpen}
    onSelect={handleSequenceSelect}
    onClose={closeSequenceBrowser}
  />
</div>

<style>
  .edit-module {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: var(--bg-primary, #1a1a2e);
  }

  .edit-layout {
    display: grid;
    grid-template-rows: 5fr 4fr;
    height: 100%;
    width: 100%;
    gap: 8px;
    padding: 8px;
    overflow: hidden;
  }

  /* Side-by-side on wider screens */
  @media (min-width: 900px) and (min-aspect-ratio: 1/1) {
    .edit-layout {
      grid-template-rows: 1fr;
      grid-template-columns: 5fr 4fr;
    }
  }

  .workspace-area {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(6, 182, 212, 0.2);
  }

  .tool-panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(6, 182, 212, 0.2);
  }

  .mode-toggle {
    display: flex;
    gap: 4px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid transparent;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }

  .mode-btn.active {
    background: rgba(6, 182, 212, 0.15);
    border-color: rgba(6, 182, 212, 0.5);
    color: #06b6d4;
  }

  .mode-btn i {
    font-size: 0.85rem;
  }

  .edit-controls {
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 16px;
    color: rgba(255, 255, 255, 0.6);
  }

  .loading-state p {
    margin: 0;
    font-size: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #06b6d4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
