<!-- src/lib/components/SequenceWorkbench/RightPanel/RightPanel.svelte -->
<script lang="ts">
  import OptionPickerWithDebug from "$legacyLib/components/ConstructTab/OptionPicker/OptionPickerWithDebug.svelte";
  import StartPosPicker from "$legacyLib/components/ConstructTab/StartPosPicker/StartPosPicker.svelte";
  import { isSequenceEmpty } from "$legacyLib/state/machines/sequenceMachine/persistence";
  import { workbenchStore } from "$legacyLib/state/stores/workbenchStore";
  import { cubicInOut } from "svelte/easing";
  import { fade, fly } from "svelte/transition";
  import ModernGenerationControls from "./ModernGenerationControls.svelte";
  import TransitionWrapper from "./TransitionWrapper.svelte";

  // Transition parameters
  const transitionDuration = 400;
  const fadeParams = { duration: transitionDuration, easing: cubicInOut };
  const flyParams = {
    duration: transitionDuration,
    easing: cubicInOut,
    y: 20,
  };
</script>

<div class="right-panel">
  {#if $workbenchStore.activeTab === "generate"}
    <div in:fly={flyParams} out:fade={fadeParams}>
      <ModernGenerationControls />
    </div>
  {:else}
    <TransitionWrapper
      isSequenceEmpty={$isSequenceEmpty}
      {transitionDuration}
    >
      {#snippet startPosPicker()}
        <div class="full-height-wrapper">
          <StartPosPicker />
        </div>
      {/snippet}

      {#snippet optionPicker()}
        <div class="full-height-wrapper">
          <OptionPickerWithDebug />
        </div>
      {/snippet}
    </TransitionWrapper>
  {/if}
</div> Nice

<style>
  .right-panel {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  /* Button panel container removed - now handled by SharedWorkbench */

  .full-height-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
