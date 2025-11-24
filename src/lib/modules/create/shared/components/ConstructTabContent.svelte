<!--
  ConstructTabContent.svelte

  Pure UI component that displays StartPositionPicker or OptionPicker
  based on the current sequence state. Receives all state and handlers as props.

  Uses instant content swap - the workspace expansion is the "hero" animation.
-->
<script lang="ts">
  import { GridMode, type PictographData } from "$shared";
  import { OptionViewer, StartPositionPicker } from "../../construct";
  import type { SimplifiedStartPositionState } from "../../construct/start-position-picker/state/start-position-state.svelte";

  // Props - simplified with unified service
  let {
    shouldShowStartPositionPicker,
    startPositionState,
    onOptionSelected,
    currentSequence = [],
    isUndoingOption = false,
    onStartPositionNavigateToAdvanced,
    onStartPositionNavigateToDefault,
    isSideBySideLayout = () => false,
    onOpenFilters = () => {},
    onCloseFilters = () => {},
    isContinuousOnly = false,
    isFilterPanelOpen = false,
    onToggleContinuous = () => {},
  } = $props<{
    shouldShowStartPositionPicker: boolean;
    startPositionState?: SimplifiedStartPositionState | null;
    onOptionSelected: (option: PictographData) => Promise<void>;
    currentSequence?: PictographData[];
    isUndoingOption?: boolean;
    onStartPositionNavigateToAdvanced?: () => void;
    onStartPositionNavigateToDefault?: () => void;
    isSideBySideLayout?: () => boolean;
    onOpenFilters?: () => void;
    onCloseFilters?: () => void;
    isContinuousOnly?: boolean;
    isFilterPanelOpen?: boolean;
    onToggleContinuous?: (value: boolean) => void;
  }>();
</script>

<div class="construct-tab-content" data-testid="construct-tab-content">
  <!-- Main Content (always visible) -->
  <div class="content-container">
    <div class="panel-content transparent-scroll">
      <!-- Instant swap - workspace expansion is the visual transition -->
      <div class="picker-wrapper">
        {#if shouldShowStartPositionPicker}
          <StartPositionPicker
            {startPositionState}
            onNavigateToAdvanced={onStartPositionNavigateToAdvanced}
            onNavigateToDefault={onStartPositionNavigateToDefault}
            {isSideBySideLayout}
          />
        {:else}
          <OptionViewer
            {onOptionSelected}
            {currentSequence}
            currentGridMode={startPositionState?.currentGridMode ||
              GridMode.DIAMOND}
            {isSideBySideLayout}
            {isUndoingOption}
            {onOpenFilters}
            {onCloseFilters}
            {isContinuousOnly}
            {isFilterPanelOpen}
            {onToggleContinuous}
          />
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .construct-tab-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
    width: 100%;
  }

  .content-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  .panel-content {
    flex: 1;
    overflow: hidden;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .panel-content.transparent-scroll {
    background: transparent;
  }

  .picker-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }
</style>
