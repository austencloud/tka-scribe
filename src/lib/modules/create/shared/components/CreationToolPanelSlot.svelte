<script lang="ts">
  /**
   * Creation Tool Panel Slot
   *
   * Renders the appropriate tool panel based on the active tab.
   * Each creation mode (Constructor, Generator, Assembler) has its own dedicated panel.
   *
   * Domain: Create module - Tool panel presentation
   */

  import {
    navigationState,
    type PictographData,
    createBeatData,
  } from "$shared";
  import type { IToolPanelMethods } from "../types/create-module-types";
  import { getCreateModuleContext } from "../context";
  import { fade } from "svelte/transition";
  import GeneratePanel from "../../generate/components/GeneratePanel.svelte";
  import ConstructTabContent from "./ConstructTabContent.svelte";
  import { AssemblerTab } from "../../assemble";
  import { desktopSidebarState } from "$lib/shared/layout/desktop-sidebar-state.svelte";

  // Get context
  const ctx = getCreateModuleContext();
  const {
    CreateModuleState: createModuleState,
    constructTabState,
    panelState,
    layout,
    assemblyTabKey,
  } = ctx;

  // Derive values from context
  const isSideBySideLayout = () => layout.shouldUseSideBySideLayout;
  const isFilterPanelOpen = $derived(panelState.isFilterPanelOpen);
  const showDesktopSidebar = $derived(desktopSidebarState.isVisible);

  // Derived state for which panel to show
  const activeToolPanel = $derived(navigationState.activeTab);

  // Loading states
  const isPersistenceFullyInitialized = $derived(
    createModuleState.isPersistenceInitialized &&
      constructTabState?.isPersistenceInitialized !== false
  );

  const shouldShowStartPositionPicker = $derived(
    constructTabState?.shouldShowStartPositionPicker() ?? false
  );

  const isPickerStateLoading = $derived(
    !constructTabState?.isPersistenceInitialized
  );

  // Convert SequenceData to PictographData[] for OptionViewer
  // Include startingPositionBeat as the first element if it exists
  // IMPORTANT: Use getActiveTabSequenceState() to get tab-specific data
  const currentSequenceData = $derived.by(() => {
    const activeSequenceState = createModuleState.getActiveTabSequenceState();
    const seq = activeSequenceState.currentSequence;
    if (!seq) return [];

    const startBeat = seq.startingPositionBeat || seq.startPosition;
    if (!startBeat) return [...seq.beats];

    // Include start position beat as first element, followed by regular beats
    return [startBeat, ...seq.beats];
  });

  // Transition state for undo animations
  let isUndoingOption = $state(false);

  // Props (only callbacks and bindable refs)
  let {
    toolPanelRef = $bindable(),
    onOptionSelected,
    onOpenFilters,
    onCloseFilters,
  }: {
    toolPanelRef?: IToolPanelMethods | null;
    onOptionSelected: (value: PictographData) => Promise<void>;
    onOpenFilters: () => void;
    onCloseFilters: () => void;
  } = $props();

  // Transition configuration
  const OUT_DURATION = 200;
  const IN_DURATION = 200;
  const fadeOutParams = { duration: OUT_DURATION };
  const fadeInParams = { duration: IN_DURATION, delay: 0 };
</script>

<div class="tool-panel-wrapper">
  {#if !isPersistenceFullyInitialized}
    <!-- Loading state while persistence is being restored -->
    <div class="persistence-loading">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  {:else if activeToolPanel}
    <!-- Render the appropriate tool panel based on active tab -->
    <div class="tab-content">
      {#key `${activeToolPanel}-${assemblyTabKey}`}
        <div
          class="sub-tab-content"
          in:fade={fadeInParams}
          out:fade={fadeOutParams}
        >
          {#if activeToolPanel === "assembler"}
            <!-- Assembler Mode - Simplified tap-based hand path builder -->
            <AssemblerTab
              initialGridMode={createModuleState.getActiveTabSequenceState()
                .gridMode}
              onStartPositionSet={(startPosition) => {
                console.log(
                  "[CreationToolPanelSlot] onStartPositionSet called with",
                  startPosition
                );

                // Get the assembler tab's sequence state
                const assemblerSequenceState =
                  createModuleState.getActiveTabSequenceState();

                // Ensure a sequence exists
                let currentSeq = assemblerSequenceState.currentSequence;
                if (!currentSeq) {
                  console.log(
                    "[CreationToolPanelSlot] Creating new sequence for assembler mode with start position"
                  );
                  const gridMode = assemblerSequenceState.gridMode;
                  currentSeq = {
                    id: crypto.randomUUID(),
                    name: "Hand Path Sequence",
                    word: "",
                    beats: [],
                    gridMode,
                    thumbnails: [],
                    isFavorite: false,
                    isCircular: false,
                    metadata: {},
                    tags: [],
                    startingPositionBeat: createBeatData({
                      ...startPosition,
                      beatNumber: 0,
                      duration: 0,
                    }),
                  };
                  assemblerSequenceState.setCurrentSequence(currentSeq);
                } else {
                  // Update existing sequence with start position
                  console.log(
                    "[CreationToolPanelSlot] Updating existing sequence with start position"
                  );
                  assemblerSequenceState.updateSequence({
                    ...currentSeq,
                    startingPositionBeat: createBeatData({
                      ...startPosition,
                      beatNumber: 0,
                      duration: 0,
                    }),
                  });
                }
              }}
              onSequenceUpdate={(pictographs) => {
                console.log(
                  "[CreationToolPanelSlot] onSequenceUpdate called with",
                  pictographs.length,
                  "pictographs"
                );

                // Get the assembler tab's sequence state
                const assemblerSequenceState =
                  createModuleState.getActiveTabSequenceState();

                // Ensure a sequence exists
                let currentSeq = assemblerSequenceState.currentSequence;
                if (!currentSeq) {
                  console.log(
                    "[CreationToolPanelSlot] Creating new sequence for assembler mode"
                  );
                  const gridMode = assemblerSequenceState.gridMode;
                  currentSeq = {
                    id: crypto.randomUUID(),
                    name: "Hand Path Sequence",
                    word: "",
                    beats: [],
                    gridMode,
                    thumbnails: [],
                    isFavorite: false,
                    isCircular: false,
                    metadata: {},
                    tags: [],
                  };
                  assemblerSequenceState.setCurrentSequence(currentSeq);
                }

                const beats = pictographs.map((p, i) =>
                  createBeatData({ ...p, beatNumber: i + 1, duration: 1000 })
                );
                console.log(
                  "[CreationToolPanelSlot] Updating sequence with",
                  beats.length,
                  "beats"
                );
                assemblerSequenceState.updateSequence({
                  ...currentSeq,
                  beats,
                });
              }}
              onSequenceComplete={(pictographs) => {
                console.log(
                  "[CreationToolPanelSlot] onSequenceComplete called with",
                  pictographs.length,
                  "pictographs"
                );

                // Get the assembler tab's sequence state
                const assemblerSequenceState =
                  createModuleState.getActiveTabSequenceState();
                const currentSeq = assemblerSequenceState.currentSequence;

                if (!currentSeq) {
                  console.warn(
                    "[CreationToolPanelSlot] No sequence exists - cannot complete"
                  );
                  return;
                }

                const beats = pictographs.map((p, i) =>
                  createBeatData({ ...p, beatNumber: i + 1, duration: 1000 })
                );
                console.log(
                  "[CreationToolPanelSlot] Completing sequence with",
                  beats.length,
                  "beats"
                );
                assemblerSequenceState.updateSequence({
                  ...currentSeq,
                  beats,
                });
              }}
              onHeaderTextChange={(text) => {
                createModuleState.setGuidedModeHeaderText(text);
              }}
            />
          {:else if activeToolPanel === "constructor"}
            <!-- Constructor Mode - Manual builder (step by step) -->
            {#if isPickerStateLoading}
              <div class="picker-loading">
                <div class="loading-spinner"></div>
                <p>Loading...</p>
              </div>
            {:else}
              <ConstructTabContent
                shouldShowStartPositionPicker={shouldShowStartPositionPicker ===
                  true}
                startPositionState={constructTabState.startPositionStateService}
                currentSequence={currentSequenceData}
                {onOptionSelected}
                {isUndoingOption}
                onStartPositionNavigateToAdvanced={() => {}}
                onStartPositionNavigateToDefault={() => {}}
                {isSideBySideLayout}
                {onOpenFilters}
                {onCloseFilters}
                {isFilterPanelOpen}
                isContinuousOnly={constructTabState.isContinuousOnly}
                onToggleContinuous={(value) =>
                  constructTabState.setContinuousOnly(value)}
              />
            {/if}
          {:else if activeToolPanel === "generator"}
            <!-- Generator Mode - Automatic sequence generation -->
            <GeneratePanel
              sequenceState={createModuleState.getActiveTabSequenceState()}
              isDesktop={showDesktopSidebar}
            />
          {:else if activeToolPanel === "gestural"}
            <!-- Hand Path Builder (coming soon) -->
            <div class="coming-soon-panel">
              <p>Hand Path Builder coming soon...</p>
            </div>
          {/if}
        </div>
      {/key}
    </div>
  {:else}
    <!-- Fallback case -->
    <div class="no-tab-selected">
      <p>No tab selected</p>
    </div>
  {/if}
</div>

<style>
  .tool-panel-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
  }

  .tab-content {
    flex: 1;
    min-height: 0;
    position: relative;
    overflow: hidden;
  }

  .sub-tab-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Loading states */
  .persistence-loading,
  .picker-loading,
  .coming-soon-panel,
  .no-tab-selected {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    gap: 16px;
    color: rgba(255, 255, 255, 0.7);
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .coming-soon-panel p,
  .no-tab-selected p {
    font-size: 14px;
    margin: 0;
  }
</style>
