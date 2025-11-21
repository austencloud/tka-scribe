<script lang="ts">
  /**
   * StandardWorkspaceLayout - Workspace and Tool Panel Layout Container
   *
   * Manages the side-by-side/stacked layout of workspace and tool panels.
   * Handles conditional rendering of welcome screen vs actual workspace.
   *
   * Domain: Create module - Layout
   */

  import { navigationState, type PictographData } from "$shared";
  import { fade } from "svelte/transition";
  import ButtonPanel from "../workspace-panel/shared/components/ButtonPanel.svelte";
  import CreationWorkspaceArea from "./CreationWorkspaceArea.svelte";
  import CreationToolPanelSlot from "./CreationToolPanelSlot.svelte";
  import type { createCreateModuleState as CreateModuleStateType } from "../state/create-module-state.svelte";
  import type { PanelCoordinationState } from "../state/panel-coordination-state.svelte";
  import type { IToolPanelMethods } from "../types/create-module-types";

  type CreateModuleState = ReturnType<typeof CreateModuleStateType>;

  // ============================================================================
  // DERIVED STATE - Workspace Color Coding
  // ============================================================================

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
  // LAYOUT SIZING
  // ============================================================================

  /**
   * Consistent 5:4 layout ratio (workspace:toolPanel)
   */
  const flexRatios = {
    workspace: 5,
    toolPanel: 4,
  };

  // ============================================================================
  // PROPS
  // ============================================================================
  let {
    shouldUseSideBySideLayout,
    CreateModuleState,
    panelState,
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
</script>

<div
  class="layout-wrapper"
  class:side-by-side={shouldUseSideBySideLayout}
  style:--workspace-flex={flexRatios.workspace}
  style:--tool-panel-flex={flexRatios.toolPanel}
>
  <!-- Workspace Panel -->
  <div
    bind:this={workspaceContainerRef}
    class="workspace-container"
    class:hidden-workspace={navigationState.activeTab === "gestural" &&
      !CreateModuleState?.handPathCoordinator?.isStarted}
    style:--workspace-border-color={workspaceBorderColor}
  >
    <!-- Workspace Content Area -->
    <div class="workspace-content">
      <CreationWorkspaceArea
        {animatingBeatNumber}
        {onPlayAnimation}
        {...toolPanelRef?.getAnimationStateRef?.()
          ? { animationStateRef: toolPanelRef.getAnimationStateRef() }
          : {}}
      />
    </div>

    <!-- Button Panel -->
    {#if navigationState.activeTab !== "gestural"}
      <div
        class="button-panel-wrapper"
        bind:this={buttonPanelElement}
        in:fade={{ duration: 400, delay: 200 }}
        out:fade={{ duration: 300 }}
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
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .layout-wrapper.side-by-side {
    flex-direction: row;
  }

  .workspace-container,
  .tool-panel-container {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .workspace-container {
    flex: var(--workspace-flex, 5);
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    /* Prevent creating a new stacking context that traps modals/drawers */
    /* Do NOT set z-index here - that would create a stacking context */
    /* Colored border for visual workspace distinction */
    border: 1px solid var(--workspace-border-color, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    transition:
      border-color 0.3s ease,
      flex 0.3s ease;
  }

  .workspace-container.hidden-workspace {
    opacity: 0;
    pointer-events: none;
    transform: translateY(-20px);
    transition:
      opacity 300ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
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
    z-index: 10;
  }

  .tool-panel-container {
    flex: var(--tool-panel-flex, 4);
    min-width: 0;
    position: relative;
    transition: flex 0.3s ease;
  }
</style>
