<script lang="ts">
  /**
   * Creation Workspace Area
   *
   * Wrapper for the actual workspace panel when a creation method has been selected.
   * Provides fade transitions and dynamic padding for the button panel at the bottom.
   * The padding is measured from the actual ButtonPanel height to adapt to different
   * screen sizes and responsive layouts.
   *
   * Extracted from CreateModule to reduce component size.
   *
   * Domain: Create module - Workspace presentation
   */

  import { fade } from "svelte/transition";
  import type { IToolPanelMethods } from "../types/create-module-types";
  import WorkspacePanel from "../workspace-panel/core/WorkspacePanel.svelte";
  import { getCreateModuleContext } from "../context/create-module-context";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";

  // Get context
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState, layout } = ctx;

  // Props (only presentation-specific props)
  let {
    animatingBeatNumber = null,
    onPlayAnimation,
    animationStateRef,
    currentDisplayWord,
    buttonPanelHeight = 0,
  }: {
    animatingBeatNumber?: number | null;
    onPlayAnimation: () => void;
    animationStateRef?: ReturnType<IToolPanelMethods["getAnimationStateRef"]>;
    currentDisplayWord: string;
    buttonPanelHeight?: number;
  } = $props();

  // Derive values from context
  const practiceBeatIndex = $derived(panelState.practiceBeatIndex);
  const shouldOrbitAroundCenter = $derived(panelState.shouldOrbitAroundCenter);
  const isSideBySideLayout = $derived(layout.shouldUseSideBySideLayout);
  const isMobilePortrait = $derived(layout.isMobilePortrait());

  // CRITICAL: Derive the active tab's sequence state reactively
  // Track both the active tab AND the sequence within that tab
  // This ensures the workspace updates when:
  // 1. The user switches tabs
  // 2. Sequence actions modify the state (mirror, rotate, etc.)
  const activeSequenceState = $derived.by(() => {
    // Track the active tab so we re-evaluate when it changes
    const activeTab = navigationState.activeTab;

    // Get the sequence state for the active tab
    const state = CreateModuleState.getActiveTabSequenceState();

    // Also track the currentSequence so we re-evaluate when it changes
    // This is the key fix - we need to access the reactive property
    const _sequence = state.currentSequence;

    return state;
  });
</script>

<!-- Layout 2: Actual workspace when method is selected -->
<div
  class="workspace-panel-wrapper"
  style:padding-bottom="{buttonPanelHeight}px"
  in:fade={{ duration: 400, delay: 200 }}
  out:fade={{ duration: 300 }}
>
  <!-- CRITICAL: {#key} block ensures fresh BeatGrid instances per tab
       This prevents animation state pollution (beat-grid-display-state.svelte)
       But we DON'T key the parent layout to avoid workspace visibility timing issues -->
  {#key navigationState.activeTab}
    <WorkspacePanel
      sequenceState={activeSequenceState}
      createModuleState={CreateModuleState}
      {practiceBeatIndex}
      {animatingBeatNumber}
      {isSideBySideLayout}
      {shouldOrbitAroundCenter}
      {animationStateRef}
      {currentDisplayWord}
    />
  {/key}
</div>

<style>
  /* Workspace panel wrapper (Layout 2) */
  .workspace-panel-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* padding-bottom is set dynamically via style attribute based on ButtonPanel height */
  }
</style>
