<!--
GeneratePanel.svelte - Clean, focused generation panel component

Card-based architecture with integrated Generate button:
- Settings: CardBasedSettingsContainer.svelte (card grid with all controls)
- Generate button: GenerateButtonCard.svelte (integrated into card grid)
- Config state: generateConfigState.svelte.ts
- Generation actions: generateActionsState.svelte.ts
- Device state: generateDeviceState.svelte.ts
- Responsive padding: State-driven for sync with workspace animation
-->
<script lang="ts">
  import type { SequenceState } from "$lib/features/create/shared/state/SequenceStateOrchestrator.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IDeviceDetector } from "$lib/shared/device/services/contracts/IDeviceDetector";
  import { onMount } from "svelte";
  import { createDeviceState } from "../state/generate-device.svelte";
  import { createGenerationActionsState } from "../state/generate-actions.svelte";
  import { createGenerationConfigState } from "../state/generate-config.svelte";
  import { createCustomizeOptionsState } from "../state/customize-options-state.svelte";
  import CardBasedSettingsContainer from "./CardBasedSettingsContainer.svelte";

  // Props
  let {
    sequenceState,
    isDesktop = false,
  }: {
    sequenceState: SequenceState;
    isDesktop?: boolean;
  } = $props();

  // Animation is always sequential with gentle bloom
  const isSequentialAnimation = true;

  // ===== State Management =====
  const configState = createGenerationConfigState();
  const actionsState = createGenerationActionsState(
    sequenceState,
    () => isSequentialAnimation
  );
  const deviceState = createDeviceState();
  const customizeState = createCustomizeOptionsState();

  // ===== Workspace Content Detection =====
  // When empty: constrain card grid size so it doesn't fill entire screen
  // When has content: use all available space since workspace is taking room
  const hasWorkspaceContent = $derived.by(() => {
    const sequence = sequenceState.currentSequence;
    if (!sequence) return false;
    const hasBeat = sequence.beats && sequence.beats.length > 0;
    const hasStartPosition = sequence.startingPositionBeat || sequence.startPosition;
    return hasBeat || hasStartPosition;
  });

  // ===== Device Service Integration =====
  onMount(() => {
    try {
      const deviceService = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
      deviceState.initializeDevice(deviceService);
    } catch (error) {
      // Fallback handled in deviceState
    }
  });
</script>

<div
  class="generate-panel"
  data-layout={deviceState.layoutMode}
  data-allow-scroll={deviceState.shouldAllowScrolling}
  data-is-desktop={isDesktop}
  style="--min-touch-target: {deviceState.minTouchTarget}px; --element-spacing: {deviceState.elementSpacing}px;"
>
  <div class="generate-panel-inner">
    <CardBasedSettingsContainer
      config={configState.config}
      isFreeformMode={configState.isFreeformMode}
      updateConfig={configState.updateConfig}
      isGenerating={actionsState.isGenerating}
      onGenerateClicked={actionsState.onGenerateClicked}
      customizeState={customizeState}
      constrainSize={!hasWorkspaceContent}
    />
  </div>
</div>

<style>
  .generate-panel {
    container-type: size;
    container-name: generate-panel;
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: visible;
    gap: 0;
  }


  .generate-panel-inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 0;
  }



  @container generate-panel (min-aspect-ratio: 1.5) and (min-width: 800px) {
    .generate-panel-inner {
      padding: 6px min(5cqi, 48px);
    }
  }

  /* Ensure no scrolling is forced when not appropriate */
  .generate-panel[data-allow-scroll="false"] {
    overflow: hidden;
  }
</style>
