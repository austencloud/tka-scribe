<script lang="ts">
  /**
   * Share Coordinator Component
   *
   * Manages share panel state and background preview generation.
   * Extracts share panel logic from BuildTab.svelte for better separation of concerns.
   *
   * Domain: Build Module - Share Panel Coordination
   */

  import { createComponentLogger } from "$shared";
  import SharePanelSheet from "../../../share/components/SharePanelSheet.svelte";
  import type { IShareService } from "../../../share/services/contracts";
  import { createShareState } from "../../../share/state";
  import type { PanelCoordinationState } from "../../state/panel-coordination-state.svelte";
  import type { createBuildTabState as BuildTabStateType } from "../../state/build-tab-state.svelte";

  type BuildTabState = ReturnType<typeof BuildTabStateType>;

  const logger = createComponentLogger('ShareCoordinator');

  // Props
  let {
    buildTabState,
    panelState,
    shareService
  }: {
    buildTabState: BuildTabState;
    panelState: PanelCoordinationState;
    shareService: IShareService;
  } = $props();

  // Share state for background preview pre-rendering
  let backgroundShareState = $state<ReturnType<typeof createShareState> | null>(null);

  // Initialize background share state
  $effect(() => {
    if (shareService && !backgroundShareState) {
      backgroundShareState = createShareState(shareService);
    }
  });

  // Effect: Render share preview when sequence or options change
  // Renders both when panel is closed (pre-render) AND when panel is open (live updates)
  $effect(() => {
    if (!backgroundShareState) return;
    if (!buildTabState.sequenceState.currentSequence) return;

    const sequence = buildTabState.sequenceState.currentSequence;
    // Track options as dependency so effect re-runs when user changes share settings
    const options = backgroundShareState.options;
    // Track panel open state for logging purposes
    const isPanelOpen = panelState.isSharePanelOpen;

    // Render preview whenever sequence has beats (both panel open and closed)
    if (sequence.beats?.length > 0) {
      // Non-blocking generation - don't await
      // renderPictographToSVG now properly waits for async arrow/prop calculations
      backgroundShareState.generatePreview(sequence).catch((error) => {
        // Silent failure - preview will generate when user opens share panel
        logger.log(
          isPanelOpen
            ? "Live preview update failed:"
            : "Background preview pre-rendering skipped:",
          error
        );
      });
    }
  });

  // Event handler
  function handleClose() {
    panelState.closeSharePanel();
  }
</script>

<SharePanelSheet
  show={panelState.isSharePanelOpen}
  sequence={buildTabState.sequenceState.currentSequence}
  shareState={backgroundShareState}
  onClose={handleClose}
/>
