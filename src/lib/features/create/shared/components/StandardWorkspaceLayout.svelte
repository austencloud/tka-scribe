<script lang="ts">
  /**
   * StandardWorkspaceLayout - Workspace and Tool Panel Layout Container
   *
   * Uses CSS Grid for smooth, animatable layout transitions.
   * Workspace is always in DOM but collapses when empty.
   *
   * Domain: Create module - Layout
   */

import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import ButtonPanel from "../workspace-panel/shared/components/ButtonPanel.svelte";
  import CreationWorkspaceArea from "./CreationWorkspaceArea.svelte";
  import CreationToolPanelSlot from "./CreationToolPanelSlot.svelte";
  import type { createCreateModuleState as CreateModuleStateType } from "../state/create-module-state.svelte";
  import type { PanelCoordinationState } from "../state/panel-coordination-state.svelte";
  import type { IToolPanelMethods } from "../types/create-module-types";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";

  type CreateModuleState = ReturnType<typeof CreateModuleStateType>;

  // ============================================================================
  // DERIVED STATE - Workspace Color Coding & Visibility
  // ============================================================================

  // Check if workspace has any content to display
  // CRITICAL: Check ALL tab states explicitly, not through a shared method
  // This prevents race conditions during tab switches
  const hasWorkspaceContent = $derived.by(() => {
    const activeTab = navigationState.activeTab;

    // IMPORTANT: Access each tab's sequence state DIRECTLY via the exported tab state objects
    // This avoids going through the shared getActiveTabSequenceState() method which can have timing issues
    let sequence = null;

    if (activeTab === "constructor") {
      // Access constructor's sequence state directly
      sequence = CreateModuleState.constructorTabState?.sequenceState?.currentSequence ?? null;
    } else if (activeTab === "generator") {
      // Access generator's sequence state directly
      sequence = CreateModuleState.generatorTabState?.sequenceState?.currentSequence ?? null;
    } else if (activeTab === "assembler") {
      // Access assembler's sequence state directly
      sequence = CreateModuleState.assemblerTabState?.sequenceState?.currentSequence ?? null;
    } else {
      // Fallback for other tabs
      sequence = CreateModuleState.sequenceState.currentSequence;
    }

    if (!sequence) {
      console.log(`[${activeTab}] hasWorkspaceContent: FALSE (no sequence)`);
      return false;
    }

    const hasBeat = sequence.beats && sequence.beats.length > 0;
    const hasStartPosition = sequence.startingPositionBeat || sequence.startPosition;
    const result = hasBeat || hasStartPosition;

    console.log(`[${activeTab}] hasWorkspaceContent: ${result}`, {
      beats: sequence.beats?.length || 0,
      hasStartPosition,
      sequence
    });

    return result;
  });

  // Color border based on active CREATE tab (for visual workspace distinction)
  const workspaceBorderColor = $derived.by(() => {
    const activeTab = navigationState.activeTab;

    // Map each creation mode to its color (20% opacity for subtle border)
    switch (activeTab) {
      case "assembler":
        return "rgba(139, 92, 246, 0.2)"; // Purple
      case "constructor":
        return "rgba(59, 130, 246, 0.2)"; // Blue
      case "generator":
        return "rgba(245, 158, 11, 0.2)"; // Gold
      default:
        return "rgba(255, 255, 255, 0.1)"; // Default
    }
  });

  // ============================================================================
  // PROPS
  // ============================================================================
  let {
    shouldUseSideBySideLayout,
    CreateModuleState,
    panelState,
    currentDisplayWord,
    // Bindable props
    animatingBeatNumber = $bindable(null),
    toolPanelRef = $bindable(null),
    buttonPanelElement = $bindable(),
    toolPanelElement = $bindable(),
    // Event handlers
    onPlayAnimation,
    onClearSequence,
    onShare,
    onSequenceActionsClick,
    onOptionSelected,
    onOpenFilters,
    onCloseFilters,
  }: {
    shouldUseSideBySideLayout: boolean;
    CreateModuleState: CreateModuleState;
    panelState: PanelCoordinationState;
    currentDisplayWord: string;
    animatingBeatNumber?: number | null;
    toolPanelRef?: IToolPanelMethods | null;
    buttonPanelElement?: HTMLElement | null;
    toolPanelElement?: HTMLElement | null;
    onPlayAnimation: () => void;
    onClearSequence: () => void;
    onShare: () => void;
    onSequenceActionsClick: () => void;
    onOptionSelected: (option: PictographData) => Promise<void>;
    onOpenFilters: () => void;
    onCloseFilters: () => void;
  } = $props();

  // ============================================================================
  // LOCAL STATE
  // ============================================================================
  let workspaceContainerRef: HTMLElement | null = $state(null);
  let buttonPanelHeight = $state(0);

  // Measure button panel height dynamically
  $effect(() => {
    if (!buttonPanelElement) {
      buttonPanelHeight = 0;
      return;
    }

    const updateHeight = () => {
      buttonPanelHeight = buttonPanelElement?.offsetHeight ?? 0;
    };

    // Initial measurement
    updateHeight();

    // Use ResizeObserver to track size changes (responsive layouts, container queries)
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(buttonPanelElement);

    return () => resizeObserver.disconnect();
  });
</script>

<div
  class="layout-wrapper"
  class:side-by-side={shouldUseSideBySideLayout}
  class:workspace-visible={hasWorkspaceContent}
>
  <!-- Workspace Panel - Always in DOM, collapses when empty -->
  <div
    bind:this={workspaceContainerRef}
    class="workspace-container"
    class:workspace-collapsed={!hasWorkspaceContent}
    class:hidden-workspace={navigationState.activeTab === "gestural" &&
      !CreateModuleState?.handPathCoordinator?.isStarted}
    style:--workspace-border-color={workspaceBorderColor}
  >
    <!-- Workspace Content Area -->
    <div class="workspace-content">
      {#if hasWorkspaceContent}
        <CreationWorkspaceArea
          {animatingBeatNumber}
          {onPlayAnimation}
          {currentDisplayWord}
          {buttonPanelHeight}
          {...toolPanelRef?.getAnimationStateRef?.()
            ? { animationStateRef: toolPanelRef.getAnimationStateRef() }
            : {}}
        />
      {/if}
    </div>

    <!-- Button Panel -->
    {#if hasWorkspaceContent && navigationState.activeTab !== "gestural"}
      <div
        class="button-panel-wrapper"
        bind:this={buttonPanelElement}
      >
        <ButtonPanel
          {onPlayAnimation}
          {onClearSequence}
          {onShare}
          {onSequenceActionsClick}
        />
      </div>
    {/if}
  </div>

  <!-- Tool Panel -->
  <div class="tool-panel-container" bind:this={toolPanelElement}>
    <CreationToolPanelSlot
      bind:toolPanelRef
      {onOptionSelected}
      onPracticeBeatIndexChange={(index) => {
        panelState.setPracticeBeatIndex(index);
      }}
      {onOpenFilters}
      {onCloseFilters}
    />
  </div>
</div>

<style>
  .layout-wrapper {
    /* CSS Grid for smooth, animatable layout */
    display: grid;
    grid-template-rows: 0fr 1fr;
    height: 100%;
    width: 100%;
    overflow: hidden;
    gap: 0;

    /* View Transitions API target for tab switching */
    view-transition-name: tab-content;

    /* Single smooth transition for ALL layout changes */
    transition:
      grid-template-rows 450ms cubic-bezier(0.4, 0, 0.2, 1),
      grid-template-columns 450ms cubic-bezier(0.4, 0, 0.2, 1),
      gap 450ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* When workspace has content - expand to 5:4 ratio */
  .layout-wrapper.workspace-visible {
    grid-template-rows: 5fr 4fr;
    gap: 8px;
  }

  /* Side-by-side layout - horizontal instead of vertical */
  .layout-wrapper.side-by-side {
    grid-template-rows: 1fr;
    grid-template-columns: 0fr 1fr;
  }

  .layout-wrapper.side-by-side.workspace-visible {
    grid-template-columns: 5fr 4fr;
  }

  /* Shared container styles */
  .workspace-container,
  .tool-panel-container {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    min-height: 0;
  }

  .workspace-container {
    position: relative;

    /* Colored border for visual workspace distinction */
    border: 1px solid var(--workspace-border-color, rgba(255, 255, 255, 0.1));
    border-radius: 8px;

    /* Smooth opacity and border transitions */
    opacity: 1;
    transition:
      opacity 350ms cubic-bezier(0.4, 0, 0.2, 1),
      border-color 300ms ease;
  }

  /* Collapsed state - invisible but still in layout flow */
  .workspace-container.workspace-collapsed {
    opacity: 0;
    pointer-events: none;
    border-color: transparent;
  }

  /* Gestural mode hidden state */
  .workspace-container.hidden-workspace {
    opacity: 0;
    pointer-events: none;
  }

  .workspace-content {
    flex: 1;
    min-height: 0;
    position: relative;
    overflow: hidden;
  }

  .button-panel-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    /* Must be above drawer content (z-index: 150) so buttons remain clickable
       when slide-in panels are open */
    z-index: 160;
  }

  .tool-panel-container {
    position: relative;
  }
</style>
