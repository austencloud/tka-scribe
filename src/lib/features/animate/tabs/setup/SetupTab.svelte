<script lang="ts">
  /**
   * SetupTab - Main component for the Animate Setup tab
   *
   * Allows users to select an animation mode and configure sequences before animating.
   * Uses Bento-style design with mode selection cards and sequence configuration panel.
   */

  import { getSetupTabState } from "./state/setup-state.svelte";
  import { getAnimateModuleState } from "$lib/features/animate/shared/state/animate-module-state.svelte";
  import ModeGrid from "./components/ModeGrid.svelte";
  import SequenceSetupPanel from "./components/SequenceSetupPanel.svelte";
  import type { AnimateMode } from "$lib/features/animate/shared/state/animate-module-state.svelte";

  // Get state instances
  const setupState = getSetupTabState();
  const animateModuleState = getAnimateModuleState();

  // Reactive bindings
  const selectedMode = $derived(setupState.selectedMode);
  const sequenceSlots = $derived(setupState.sequenceSlots);
  const requiredSlots = $derived(setupState.requiredSlots);
  const isConfigurationComplete = $derived(setupState.isConfigurationComplete);

  // Handlers
  function handleModeSelect(mode: AnimateMode) {
    setupState.selectMode(mode);
    console.log("🎨 SetupTab: Mode selected:", mode);
  }

  function handleBack() {
    setupState.selectMode(null);
    console.log("🎨 SetupTab: Back to mode selection");
  }

  function handleStartPlayback() {
    if (!isConfigurationComplete || !selectedMode) {
      console.warn("🎨 SetupTab: Cannot start playback - configuration incomplete");
      return;
    }

    // Transition to the selected animation mode
    animateModuleState.setCurrentMode(selectedMode);

    // Transfer sequences to the appropriate tab state
    // This would be handled by the parent AnimateModule component
    // which watches for mode changes and syncs state

    console.log("🎨 SetupTab: Starting playback, switching to mode:", selectedMode);
  }
</script>

<div class="setup-tab">
  {#if !selectedMode}
    <!-- Mode Selection Grid -->
    <ModeGrid onModeSelect={handleModeSelect} />
  {:else}
    <!-- Sequence Configuration Panel -->
    <SequenceSetupPanel
      selectedMode={selectedMode}
      requiredSlots={requiredSlots}
      sequenceSlots={sequenceSlots}
      isConfigurationComplete={isConfigurationComplete}
      onBack={handleBack}
      onSetSequence={setupState.setSequenceForSlot}
      onClearSlot={setupState.clearSlot}
      onStartPlayback={handleStartPlayback}
    />
  {/if}
</div>

<style>
  .setup-tab {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background: transparent;
  }

  /* Smooth scrolling */
  .setup-tab {
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    .setup-tab {
      scroll-behavior: auto;
    }
  }
</style>
