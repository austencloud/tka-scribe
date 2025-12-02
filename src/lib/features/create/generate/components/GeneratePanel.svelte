<!--
GeneratePanel.svelte - Clean, focused generation panel component

Card-based architecture with integrated Generate button:
- Settings: CardBasedSettingsContainer.svelte (card grid with all controls)
- Generate button: GenerateButtonCard.svelte (integrated into card grid)
- Config state: generateConfigState.svelte.ts
- Generation actions: generateActionsState.svelte.ts
- Device state: generateDeviceState.svelte.ts
- Responsive padding: Modern CSS container queries with cqi/cqb units (automatic scaling)
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
  import { GeneratorPadder } from "$lib/features/create/generate/shared/services/implementations/GeneratorPadder";
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

  // ===== Padding Service =====
  const paddingService = new GeneratorPadder();

  // Aspect-ratio-aware padding based on panel dimensions
  let panelElement = $state<HTMLElement | null>(null);
  let paddingTop = $state(12);
  let paddingRight = $state(12);
  let paddingBottom = $state(12);
  let paddingLeft = $state(12);

  // ===== Device Service Integration =====
  onMount(() => {
    try {
      const deviceService = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
      deviceState.initializeDevice(deviceService);
    } catch (error) {
      // Fallback handled in deviceState
    }
  });

  // ===== Reactive ResizeObserver Setup =====
  // Use $effect to set up ResizeObserver when panelElement becomes available
  $effect(() => {
    if (!panelElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        // Calculate padding using service
        const padding = paddingService.calculatePadding(width, height);

        paddingTop = padding.top;
        paddingRight = padding.right;
        paddingBottom = padding.bottom;
        paddingLeft = padding.left;
      }
    });

    resizeObserver.observe(panelElement);

    // Cleanup function
    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<div
  class="generate-panel"
  bind:this={panelElement}
  data-layout={deviceState.layoutMode}
  data-allow-scroll={deviceState.shouldAllowScrolling}
  data-is-desktop={isDesktop}
  style="--min-touch-target: {deviceState.minTouchTarget}px; --element-spacing: {deviceState.elementSpacing}px; --padding-top: {paddingTop}; --padding-right: {paddingRight}; --padding-bottom: {paddingBottom}; --padding-left: {paddingLeft};"
>
  <div class="generate-panel-inner">
    <CardBasedSettingsContainer
      config={configState.config}
      isFreeformMode={configState.isFreeformMode}
      updateConfig={configState.updateConfig}
      isGenerating={actionsState.isGenerating}
      onGenerateClicked={actionsState.onGenerateClicked}
    />
  </div>
</div>

<style>
  .generate-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: visible; /* Allow card hover effects to be fully visible */
    gap: 0;
  }

  /* Inner wrapper with aspect-ratio-aware padding */
  .generate-panel-inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    /* Aspect-ratio-aware padding: different values for portrait vs landscape */
    /* Portrait: more top/bottom padding, less left/right */
    /* Landscape: more left/right padding, less top/bottom */
    padding-top: calc(var(--padding-top, 12) * 1px);
    padding-right: calc(var(--padding-right, 12) * 1px);
    padding-bottom: calc(var(--padding-bottom, 12) * 1px);
    padding-left: calc(var(--padding-left, 12) * 1px);
  }

  /* Ensure no scrolling is forced when not appropriate */
  .generate-panel[data-allow-scroll="false"] {
    overflow: hidden;
  }
</style>
