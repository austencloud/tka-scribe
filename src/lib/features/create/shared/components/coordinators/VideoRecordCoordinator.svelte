<script lang="ts">
  /**
   * Video Record Coordinator Component
   *
   * Manages video record panel state and camera recording.
   * Extracts video record panel logic from CreateModule.svelte for better separation of concerns.
   *
   * Domain: Create module - Video Record Panel Coordination
   */

  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import VideoRecordDrawer from "$lib/shared/video-record/components/VideoRecordDrawer.svelte";
  import { getCreateModuleContext } from "../../context/create-module-context";
  import type { RecordingResult } from "$lib/shared/video-record";

  const logger = createComponentLogger("VideoRecordCoordinator");

  // Get context
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState } = ctx;

  // Event handlers
  function handleClose() {
    panelState.closeVideoRecordPanel();
  }

  function handleSave(recording: RecordingResult) {
    logger.log("Recording saved:", recording);
    // TODO: Future Phase 4 - Submit to Firebase
    // For now, just log the recording
    panelState.closeVideoRecordPanel();
  }
</script>

<VideoRecordDrawer
  bind:show={panelState.isVideoRecordPanelOpen}
  sequence={CreateModuleState.sequenceState.currentSequence}
  onClose={handleClose}
  onSave={handleSave}
/>
