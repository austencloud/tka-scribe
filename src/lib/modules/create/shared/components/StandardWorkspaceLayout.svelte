<script lang="ts">
  /**
   * StandardWorkspaceLayout - Workspace and Tool Panel Layout Container
   *
   * Manages the side-by-side/stacked layout of workspace and tool panels.
   * Handles conditional rendering of welcome screen vs actual workspace.
   *
   * Domain: Create module - Layout
   */

  import { navigationState, type BuildModeId, type PictographData } from "$shared";
  import { fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import ButtonPanel from "../../workspace-panel/shared/components/ButtonPanel.svelte";
  import { AnimationSheetCoordinator } from "$shared/coordinators";
  import CreationWelcomeScreen from "./CreationWelcomeScreen.svelte";
  import CreationWorkspaceArea from "./CreationWorkspaceArea.svelte";
  import CreationToolPanelSlot from "./CreationToolPanelSlot.svelte";
  import type { createCreateModuleState as CreateModuleStateType } from "../state/create-module-state.svelte";
  import type { PanelCoordinationState } from "../state/panel-coordination-state.svelte";
  import type { IToolPanelMethods } from "../types/create-module-types";

  type CreateModuleState = ReturnType<typeof CreateModuleStateType>;

  // ============================================================================
  // PROPS
  // ============================================================================
  let {
    shouldUseSideBySideLayout,
    CreateModuleState,
    creationCueOrientation,
    creationCueMood,
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
    onMethodSelected,
    onOptionSelected,
    onOpenFilters,
    onCloseFilters,
  }: {
    shouldUseSideBySideLayout: boolean;
    CreateModuleState: CreateModuleState;
    creationCueOrientation: "horizontal" | "vertical";
    creationCueMood: "default" | "redo" | "returning" | "fresh";
    panelState: PanelCoordinationState;
    animatingBeatNumber?: number | null;
    toolPanelRef?: IToolPanelMethods | null;
    buttonPanelElement?: HTMLElement | null;
    toolPanelElement?: HTMLElement | null;
    onPlayAnimation: () => void;
    onClearSequence: () => void;
    onShare: () => void;
    onSequenceActionsClick: () => void;
    onMethodSelected: (method: BuildModeId) => void;
    onOptionSelected: (option: PictographData) => Promise<void>;
    onOpenFilters: () => void;
    onCloseFilters: () => void;
  } = $props();
</script>

<div
  class="layout-wrapper"
  class:side-by-side={shouldUseSideBySideLayout}
  in:fade={{ duration: 500, delay: 250, easing: cubicOut }}
>
  <!-- Workspace Panel -->
  <div
    class="workspace-container"
    class:hidden-workspace={navigationState.activeTab === "gestural" &&
      !CreateModuleState?.handPathCoordinator?.isStarted}
    class:collapsed={navigationState.isCreationMethodSelectorVisible}
  >
    <!-- Workspace Content Area -->
    <div class="workspace-content">
      {#if navigationState.isCreationMethodSelectorVisible}
        <!-- Layout 1: Welcome screen when selector is visible -->
        <CreationWelcomeScreen
          orientation={creationCueOrientation}
          mood={creationCueMood}
        />
      {:else}
        <!-- Layout 2: Actual workspace when method is selected -->
        {@const animStateRef = toolPanelRef?.getAnimationStateRef?.()}
        <CreationWorkspaceArea
          {animatingBeatNumber}
          {onPlayAnimation}
          {...animStateRef ? { animationStateRef: animStateRef } : {}}
        />
      {/if}
    </div>

    <!-- Button Panel (hidden when creation method selector is visible) -->
    {#if navigationState.activeTab !== "gestural" && !navigationState.isCreationMethodSelectorVisible}
      <div
        class="button-panel-wrapper"
        bind:this={buttonPanelElement}
        in:fade={{ duration: 400, delay: 200 }}
        out:fade={{ duration: 300 }}
      >
        <ButtonPanel
          {onPlayAnimation}
          onClearSequence={onClearSequence}
          onShare={onShare}
          onSequenceActionsClick={onSequenceActionsClick}
        />
      </div>
    {/if}

    <!-- Animation Coordinator -->
    <AnimationSheetCoordinator
      sequence={CreateModuleState.sequenceState.currentSequence}
      bind:isOpen={panelState.isAnimationPanelOpen}
      bind:animatingBeatNumber
      combinedPanelHeight={panelState.combinedPanelHeight}
    />
  </div>

  <!-- Tool Panel or Creation Method Screen -->
  <div class="tool-panel-container" bind:this={toolPanelElement}>
    <CreationToolPanelSlot
      bind:toolPanelRef
      onMethodSelected={onMethodSelected}
      onOptionSelected={onOptionSelected}
      onPracticeBeatIndexChange={(index) => {
        panelState.setPracticeBeatIndex(index);
      }}
      onOpenFilters={onOpenFilters}
      onCloseFilters={onCloseFilters}
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
    flex: 5;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    transition: flex 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .workspace-container.collapsed {
    flex: 2;
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
    flex: 4;
    min-width: 0;
    position: relative;
  }

  .layout-wrapper.side-by-side .workspace-container {
    flex: 5;
  }

  .layout-wrapper.side-by-side .workspace-container.collapsed {
    flex: 2;
  }

  .layout-wrapper.side-by-side .tool-panel-container {
    flex: 4;
  }
</style>
