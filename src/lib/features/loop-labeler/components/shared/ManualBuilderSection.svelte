<!--
  Manual Builder Section

  Collapsible panel for manual LOOP designation building.
  Contains mode toggle and mode-specific panels.
-->
<script lang="ts">
  import type { LabelingMode } from "../../state/loop-labeler-state.svelte";
  import type { createSectionModeState } from "../../state/section-mode-state.svelte";
  import type { createBeatPairModeState } from "../../state/beatpair-mode-state.svelte";
  import type { createWholeModeState } from "../../state/whole-mode-state.svelte";

  import ComponentSelectionPanel from "../panels/ComponentSelectionPanel.svelte";
  import SectionModePanel from "../panels/SectionModePanel.svelte";
  import BeatPairModePanel from "../panels/BeatPairModePanel.svelte";
  import WholeModePanel from "../panels/WholeModePanel.svelte";

  interface Props {
    showManualBuilder: boolean;
    labelingMode: LabelingMode;
    sectionState: ReturnType<typeof createSectionModeState> | undefined;
    beatPairState: ReturnType<typeof createBeatPairModeState> | undefined;
    wholeState: ReturnType<typeof createWholeModeState> | undefined;
    derivedLoopType: string | null;
    notes: string;
    onToggleBuilder: (show: boolean) => void;
    onLabelingModeChange: (mode: LabelingMode) => void;
    onAddSection: () => void;
    onRemoveSection: (index: number) => void;
    onMarkUnknown: () => void;
    onNext: () => void;
    onAddDesignation: () => void;
  }

  let {
    showManualBuilder,
    labelingMode,
    sectionState,
    beatPairState,
    wholeState,
    derivedLoopType,
    notes,
    onToggleBuilder,
    onLabelingModeChange,
    onAddSection,
    onRemoveSection,
    onMarkUnknown,
    onNext,
    onAddDesignation,
  }: Props = $props();
</script>

{#if showManualBuilder}
  <div class="manual-builder-section">
    <button
      class="collapse-builder-btn"
      onclick={() => onToggleBuilder(false)}
    >
      <span>Hide Manual Builder</span>
      <span class="chevron">▲</span>
    </button>

    <!-- Mode Toggle -->
    <ComponentSelectionPanel
      {labelingMode}
      onLabelingModeChange={onLabelingModeChange}
    />

    <!-- Mode-specific builder panels -->
    {#if labelingMode === "section" && sectionState}
      <SectionModePanel
        selectedBeats={sectionState.selectedBeats}
        selectedComponents={sectionState.selectedComponents}
        savedSections={sectionState.savedSections}
        selectedBaseWord={sectionState.selectedBaseWord}
        onBaseWordChange={(bw) => sectionState!.actions.setBaseWord(bw)}
        onAddSection={onAddSection}
        onRemoveSection={onRemoveSection}
        onMarkUnknown={onMarkUnknown}
        onNext={onNext}
        canProceed={sectionState.selectedBeats.size === 0 &&
          sectionState.selectedComponents.size === 0}
      />
    {:else if labelingMode === "beatpair" && beatPairState}
      <BeatPairModePanel
        firstBeat={beatPairState.firstBeat}
        secondBeat={beatPairState.secondBeat}
        selectedComponents={beatPairState.selectedComponents}
        transformationIntervals={beatPairState.transformationIntervals}
        onClearSelection={() => beatPairState!.actions.clearSelection()}
        onToggleComponent={(c) => beatPairState!.actions.toggleComponent(c)}
        onSetInterval={(key, val) =>
          beatPairState!.actions.setTransformationInterval(key, val)}
        onAddBeatPair={() => beatPairState!.actions.addBeatPair()}
      />
    {:else if labelingMode === "whole" && wholeState}
      <WholeModePanel
        selectedComponents={wholeState.selectedComponents}
        transformationIntervals={wholeState.transformationIntervals}
        onToggleComponent={(c) => wholeState!.actions.toggleComponent(c)}
        onSetInterval={(key, val) =>
          wholeState!.actions.setTransformationInterval(key, val)}
        onAddDesignation={onAddDesignation}
      />
    {/if}
  </div>
{:else}
  <button
    class="show-builder-btn"
    onclick={() => onToggleBuilder(true)}
  >
    <span>+ Add Manual Designation</span>
    <span class="chevron">▼</span>
  </button>
{/if}

<style>
  .show-builder-btn,
  .collapse-builder-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(255, 255, 255, 0.03);
    border: 1px dashed var(--theme-stroke, var(--theme-stroke-strong));
    border-radius: 10px;
    color: var(--muted-foreground);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .show-builder-btn:hover,
  .collapse-builder-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.25);
    color: var(--foreground);
  }

  .collapse-builder-btn {
    background: rgba(99, 102, 241, 0.08);
    border-style: solid;
    border-color: rgba(99, 102, 241, 0.3);
    color: var(--foreground);
  }

  .chevron {
    font-size: 0.75em;
    opacity: 0.6;
  }

  .manual-builder-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--theme-stroke);
    border-radius: 12px;
  }
</style>
